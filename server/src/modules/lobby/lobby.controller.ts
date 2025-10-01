import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  HttpException,
  HttpStatus,
} from '@nestjs/common'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { LobbyService, CreateLobbyData, JoinLobbyData } from './lobby.service'

@Controller('lobby')
@UseGuards(JwtAuthGuard)
export class LobbyController {
  constructor(private readonly lobbyService: LobbyService) {}

  @Post('create')
  async createLobby(
    @Body() data: CreateLobbyData,
    @Request() req,
  ) {
    try {
      const result = await this.lobbyService.createLobby(req.user.id, data)
      if (!result.success) {
        throw new HttpException(result.message, HttpStatus.BAD_REQUEST)
      }
      return result
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  @Post('join')
  async joinLobby(
    @Body() data: { lobbyId: string },
    @Request() req,
  ) {
    try {
      const result = await this.lobbyService.joinLobby(data.lobbyId, req.user.id)
      if (!result.success) {
        throw new HttpException(result.message, HttpStatus.BAD_REQUEST)
      }
      return result
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  @Post('leave')
  async leaveLobby(
    @Body() data: { lobbyId: string },
    @Request() req,
  ) {
    try {
      const result = await this.lobbyService.leaveLobby(data.lobbyId, req.user.id)
      if (!result.success) {
        throw new HttpException(result.message, HttpStatus.BAD_REQUEST)
      }
      return result
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  @Get()
  async getLobbies() {
    try {
      return await this.lobbyService.getLobbies()
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  @Get(':id')
  async getLobby(@Param('id') lobbyId: string) {
    try {
      const lobby = await this.lobbyService.getLobby(lobbyId)
      if (!lobby) {
        throw new HttpException('Lobby not found', HttpStatus.NOT_FOUND)
      }
      return lobby
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  @Get('active/list')
  async getActiveLobbies() {
    try {
      return this.lobbyService.getActiveLobbies()
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }
}







