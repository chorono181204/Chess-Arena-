import { Injectable, Logger } from '@nestjs/common'
import { PrismaService } from '../database/prisma.service'
import { EventBusService } from '../events/event-bus.service'
import { WebSocketGateway } from '../websocket/game.gateway'

export interface CreateLobbyData {
  name: string
  description?: string
  timeControl: string
  isRated: boolean
  isPublic: boolean
  maxPlayers?: number
}

export interface JoinLobbyData {
  lobbyId: string
  userId: string
}

export interface LobbyState {
  id: string
  name: string
  description?: string
  timeControl: string
  isRated: boolean
  isPublic: boolean
  maxPlayers: number
  currentPlayers: number
  players: any[]
  createdBy: string
  createdAt: Date
  status: 'WAITING' | 'FULL' | 'STARTING' | 'ACTIVE'
}

@Injectable()
export class LobbyService {
  private readonly logger = new Logger(LobbyService.name)
  private readonly activeLobbies = new Map<string, LobbyState>()

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventBus: EventBusService,
    private readonly gateway: WebSocketGateway,
  ) {}

  async createLobby(creatorId: string, data: CreateLobbyData): Promise<{ success: boolean; message: string; lobbyId?: string }> {
    try {
      // Check if user is already in a lobby
      const existingLobby = await this.prisma.lobby.findFirst({
        where: {
          createdBy: creatorId,
          currentPlayers: { lt: 2 }
        }
      })

      if (existingLobby) {
        return { success: false, message: 'You already have an active lobby' }
      }

      // Create lobby in database
      const lobby = await this.prisma.lobby.create({
        data: {
          name: data.name,
          description: data.description,
          timeControl: data.timeControl,
          isRated: data.isRated,
          isPublic: data.isPublic,
          maxPlayers: data.maxPlayers || 2,
          currentPlayers: 1,
          createdBy: creatorId
        }
      })

      // Get creator info
      const creator = await this.prisma.user.findUnique({
        where: { id: creatorId }
      })

      // Create lobby state
      const lobbyState: LobbyState = {
        id: lobby.id,
        name: lobby.name,
        description: lobby.description,
        timeControl: lobby.timeControl,
        isRated: lobby.isRated,
        isPublic: lobby.isPublic,
        maxPlayers: lobby.maxPlayers,
        currentPlayers: 1,
        players: [creator],
        createdBy: creatorId,
        createdAt: lobby.createdAt,
        status: 'WAITING'
      }

      this.activeLobbies.set(lobby.id, lobbyState)

      // Emit lobby created event
      this.gateway.server.emit('lobbyCreated', lobbyState)

      this.logger.log(`Lobby ${lobby.id} created by ${creatorId}`)

      return { success: true, message: 'Lobby created successfully', lobbyId: lobby.id }
    } catch (error) {
      this.logger.error('Error creating lobby:', error)
      return { success: false, message: 'Failed to create lobby' }
    }
  }

  async joinLobby(lobbyId: string, userId: string): Promise<{ success: boolean; message: string; gameId?: string }> {
    try {
      const lobby = this.activeLobbies.get(lobbyId)
      if (!lobby) {
        return { success: false, message: 'Lobby not found' }
      }

      // Check if lobby is full
      if (lobby.currentPlayers >= lobby.maxPlayers) {
        return { success: false, message: 'Lobby is full' }
      }

      // Check if user is already in the lobby
      if (lobby.players.some(p => p.id === userId)) {
        return { success: false, message: 'You are already in this lobby' }
      }

      // Get user info
      const user = await this.prisma.user.findUnique({
        where: { id: userId }
      })

      if (!user) {
        return { success: false, message: 'User not found' }
      }

      // Add user to lobby
      lobby.players.push(user)
      lobby.currentPlayers++

      // Update database
      await this.prisma.lobby.update({
        where: { id: lobbyId },
        data: { currentPlayers: lobby.currentPlayers }
      })

      // Emit user joined event
      this.gateway.server.to(lobbyId).emit('userJoined', {
        lobbyId,
        user,
        currentPlayers: lobby.currentPlayers
      })

      // Check if lobby is now full
      if (lobby.currentPlayers >= lobby.maxPlayers) {
        lobby.status = 'FULL'
        
        // Start game after a short delay
        setTimeout(async () => {
          const gameId = await this.startGameFromLobby(lobbyId)
          if (gameId) {
            lobby.status = 'ACTIVE'
            this.gateway.server.to(lobbyId).emit('gameStarted', { lobbyId, gameId })
          }
        }, 2000)
      }

      this.logger.log(`User ${userId} joined lobby ${lobbyId}`)

      return { success: true, message: 'Joined lobby successfully' }
    } catch (error) {
      this.logger.error('Error joining lobby:', error)
      return { success: false, message: 'Failed to join lobby' }
    }
  }

  async leaveLobby(lobbyId: string, userId: string): Promise<{ success: boolean; message: string }> {
    try {
      const lobby = this.activeLobbies.get(lobbyId)
      if (!lobby) {
        return { success: false, message: 'Lobby not found' }
      }

      // Remove user from lobby
      lobby.players = lobby.players.filter(p => p.id !== userId)
      lobby.currentPlayers--

      // Update database
      await this.prisma.lobby.update({
        where: { id: lobbyId },
        data: { currentPlayers: lobby.currentPlayers }
      })

      // If lobby is empty, delete it
      if (lobby.currentPlayers === 0) {
        await this.prisma.lobby.delete({
          where: { id: lobbyId }
        })
        this.activeLobbies.delete(lobbyId)
        this.gateway.server.emit('lobbyDeleted', { lobbyId })
      } else {
        // Emit user left event
        this.gateway.server.to(lobbyId).emit('userLeft', {
          lobbyId,
          userId,
          currentPlayers: lobby.currentPlayers
        })
      }

      this.logger.log(`User ${userId} left lobby ${lobbyId}`)

      return { success: true, message: 'Left lobby successfully' }
    } catch (error) {
      this.logger.error('Error leaving lobby:', error)
      return { success: false, message: 'Failed to leave lobby' }
    }
  }

  async getLobbies(): Promise<LobbyState[]> {
    try {
      // Get lobbies from database
      const dbLobbies = await this.prisma.lobby.findMany({
        where: {
          isPublic: true,
          currentPlayers: { lt: 2 }
        },
        include: {
          creator: true
        },
        orderBy: { createdAt: 'desc' }
      })

      // Convert to lobby states
      const lobbies: LobbyState[] = dbLobbies.map(lobby => ({
        id: lobby.id,
        name: lobby.name,
        description: lobby.description,
        timeControl: lobby.timeControl,
        isRated: lobby.isRated,
        isPublic: lobby.isPublic,
        maxPlayers: lobby.maxPlayers,
        currentPlayers: lobby.currentPlayers,
        players: [], // Will be populated from active lobbies
        createdBy: lobby.creator.id,
        createdAt: lobby.createdAt,
        status: 'WAITING'
      }))

      return lobbies
    } catch (error) {
      this.logger.error('Error getting lobbies:', error)
      return []
    }
  }

  async getLobby(lobbyId: string): Promise<LobbyState | null> {
    try {
      const lobby = this.activeLobbies.get(lobbyId)
      if (lobby) {
        return lobby
      }

      // Try to get from database
      const dbLobby = await this.prisma.lobby.findUnique({
        where: { id: lobbyId },
        include: {
          creator: true
        }
      })

      if (!dbLobby) {
        return null
      }

      return {
        id: dbLobby.id,
        name: dbLobby.name,
        description: dbLobby.description,
        timeControl: dbLobby.timeControl,
        isRated: dbLobby.isRated,
        isPublic: dbLobby.isPublic,
        maxPlayers: dbLobby.maxPlayers,
        currentPlayers: dbLobby.currentPlayers,
        players: [],
        createdBy: dbLobby.creator.id,
        createdAt: dbLobby.createdAt,
        status: 'WAITING'
      }
    } catch (error) {
      this.logger.error('Error getting lobby:', error)
      return null
    }
  }

  private async startGameFromLobby(lobbyId: string): Promise<string | null> {
    try {
      const lobby = this.activeLobbies.get(lobbyId)
      if (!lobby || lobby.players.length < 2) {
        return null
      }

      // Parse time control
      const [base, increment] = lobby.timeControl.split('+').map(Number)
      const totalTime = base * 60 // Convert to seconds

      // Create game
      const game = await this.prisma.game.create({
        data: {
          status: 'PENDING',
          timeControl: lobby.timeControl,
          whiteTimeLeft: totalTime,
          blackTimeLeft: totalTime,
          isRated: lobby.isRated,
          whitePlayerId: lobby.players[0].id,
          blackPlayerId: lobby.players[1].id,
          isPublic: lobby.isPublic,
          allowSpectators: true
        }
      })

      // Delete lobby
      await this.prisma.lobby.delete({
        where: { id: lobbyId }
      })
      this.activeLobbies.delete(lobbyId)

      // Emit game created event
      this.gateway.server.emit('gameCreated', {
        gameId: game.id,
        whitePlayer: lobby.players[0],
        blackPlayer: lobby.players[1],
        timeControl: lobby.timeControl,
        isRated: lobby.isRated
      })

      this.logger.log(`Game ${game.id} created from lobby ${lobbyId}`)

      return game.id
    } catch (error) {
      this.logger.error('Error starting game from lobby:', error)
      return null
    }
  }

  getActiveLobbies(): LobbyState[] {
    return Array.from(this.activeLobbies.values())
  }
}


