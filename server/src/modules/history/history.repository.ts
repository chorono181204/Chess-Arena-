import { PrismaService } from '@providers/prisma';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { HistoryQueryDto, HistorySortBy } from './dto/history-query.dto';

@Injectable()
export class HistoryRepository {
  constructor(private prisma: PrismaService) {}

  async getGameHistory(query: HistoryQueryDto): Promise<{
    data: any[];
    total: number;
    page: number;
    perPage: number;
    totalPages: number;
  }> {
    const { 
      userId, 
      result, 
      status, 
      ratingType, 
      sortBy, 
      sortOrder, 
      page, 
      perPage, 
      startDate, 
      endDate, 
      search 
    } = query;
    
    const skip = (page - 1) * perPage;

    // Build where clause
    const where: Prisma.GameHistoryWhereInput = {};

    if (userId) {
      where.userId = userId;
    }

    if (result) {
      where.result = result as any;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    // Add game filters
    if (status || ratingType || search) {
      where.game = {};
      
      if (status) {
        where.game.status = status as any;
      }

      if (search) {
        where.game.OR = [
          {
            whitePlayer: {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
              ],
            },
          },
          {
            blackPlayer: {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
              ],
            },
          },
        ];
      }
    }

    // Build order by clause
    let orderBy: Prisma.GameHistoryOrderByWithRelationInput = {};
    switch (sortBy) {
      case HistorySortBy.CREATED_AT:
        orderBy = { createdAt: sortOrder };
        break;
      case HistorySortBy.ENDED_AT:
        orderBy = { game: { endedAt: sortOrder } };
        break;
      case HistorySortBy.RATING_CHANGE:
        orderBy = { ratingChange: sortOrder };
        break;
      case HistorySortBy.GAME_DURATION:
        orderBy = { game: { endedAt: sortOrder } };
        break;
    }

    // Get total count
    const total = await this.prisma.gameHistory.count({ where });

    // Get game history with related data
    const gameHistory = await this.prisma.gameHistory.findMany({
      where,
      orderBy,
      skip,
      take: perPage,
      include: {
        game: {
          include: {
            whitePlayer: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
            blackPlayer: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    // Transform data
    const data = gameHistory.map((history) => {
      const game = history.game;
      const gameDuration = game.startedAt && game.endedAt 
        ? game.endedAt.getTime() - game.startedAt.getTime()
        : null;

      return {
        id: history.id,
        gameId: history.gameId,
        userId: history.userId,
        result: history.result,
        ratingChange: history.ratingChange,
        createdAt: history.createdAt,
        game: {
          id: game.id,
          status: game.status,
          gameType: game.gameType,
          timeControl: game.timeControl,
          isRated: game.isRated,
          currentFen: game.currentFen,
          lastMove: game.lastMove,
          turn: game.turn,
          winner: game.winner,
          result: game.result,
          reason: game.reason,
          whiteTimeLeft: game.whiteTimeLeft,
          blackTimeLeft: game.blackTimeLeft,
          timeIncrement: game.timeIncrement,
          startedAt: game.startedAt,
          endedAt: game.endedAt,
          createdAt: game.createdAt,
          updatedAt: game.updatedAt,
          whitePlayer: {
            id: game.whitePlayer.id,
            name: game.whitePlayer.name,
            email: game.whitePlayer.email,
            avatar: game.whitePlayer.avatar,
          },
          blackPlayer: game.blackPlayer ? {
            id: game.blackPlayer.id,
            name: game.blackPlayer.name,
            email: game.blackPlayer.email,
            avatar: game.blackPlayer.avatar,
          } : null,
        },
        gameDuration,
        moveCount: null, // TODO: Calculate from moves table
      };
    });

    // Sort by game duration if requested
    if (sortBy === HistorySortBy.GAME_DURATION) {
      data.sort((a, b) => {
        const durationA = a.gameDuration || 0;
        const durationB = b.gameDuration || 0;
        return sortOrder === 'desc' 
          ? durationB - durationA 
          : durationA - durationB;
      });
    }

    const totalPages = Math.ceil(total / perPage);

    return {
      data,
      total,
      page,
      perPage,
      totalPages,
    };
  }

  async getUserStats(userId: string, ratingType?: string): Promise<{
    totalGames: number;
    wins: number;
    losses: number;
    draws: number;
    winRate: number;
    currentRating: number;
    peakRating: number;
    averageGameDuration: number;
    longestWinStreak: number;
    longestLossStreak: number;
  }> {
    // Get user's rating
    const rating = await this.prisma.rating.findUnique({
      where: {
        userId_ratingType: {
          userId,
          ratingType: (ratingType || 'CLASSIC') as any,
        },
      },
    });

    // Get game history
    const where: Prisma.GameHistoryWhereInput = { userId };
    if (ratingType) {
      where.game = {
        // Add rating type filter if needed
      };
    }

    const gameHistory = await this.prisma.gameHistory.findMany({
      where,
      include: {
        game: {
          select: {
            startedAt: true,
            endedAt: true,
            result: true,
          },
        },
      },
    });

    const totalGames = gameHistory.length;
    const wins = gameHistory.filter(h => h.result === 'WHITE_WINS' || h.result === 'BLACK_WINS').length;
    const losses = gameHistory.filter(h => h.result === 'WHITE_WINS' || h.result === 'BLACK_WINS').length;
    const draws = gameHistory.filter(h => h.result === 'DRAW').length;
    const winRate = totalGames > 0 ? (wins / totalGames) * 100 : 0;

    // Calculate average game duration
    const gamesWithDuration = gameHistory.filter(h => 
      h.game.startedAt && h.game.endedAt
    );
    const totalDuration = gamesWithDuration.reduce((sum, h) => {
      return sum + (h.game.endedAt!.getTime() - h.game.startedAt!.getTime());
    }, 0);
    const averageGameDuration = gamesWithDuration.length > 0 
      ? totalDuration / gamesWithDuration.length 
      : 0;

    // TODO: Calculate win/loss streaks
    const longestWinStreak = 0;
    const longestLossStreak = 0;

    return {
      totalGames,
      wins,
      losses,
      draws,
      winRate: Math.round(winRate * 100) / 100,
      currentRating: rating?.rating || 1200,
      peakRating: rating?.peakRating || 1200,
      averageGameDuration: Math.round(averageGameDuration),
      longestWinStreak,
      longestLossStreak,
    };
  }

  async getRecentGames(userId: string, limit: number = 10): Promise<any[]> {
    const gameHistory = await this.prisma.gameHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        game: {
          include: {
            whitePlayer: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
            blackPlayer: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    return gameHistory.map((history) => {
      const game = history.game;
      const gameDuration = game.startedAt && game.endedAt 
        ? game.endedAt.getTime() - game.startedAt.getTime()
        : null;

      return {
        id: history.id,
        gameId: history.gameId,
        userId: history.userId,
        result: history.result,
        ratingChange: history.ratingChange,
        createdAt: history.createdAt,
        game: {
          id: game.id,
          status: game.status,
          gameType: game.gameType,
          timeControl: game.timeControl,
          isRated: game.isRated,
          currentFen: game.currentFen,
          lastMove: game.lastMove,
          turn: game.turn,
          winner: game.winner,
          result: game.result,
          reason: game.reason,
          whiteTimeLeft: game.whiteTimeLeft,
          blackTimeLeft: game.blackTimeLeft,
          timeIncrement: game.timeIncrement,
          startedAt: game.startedAt,
          endedAt: game.endedAt,
          createdAt: game.createdAt,
          updatedAt: game.updatedAt,
          whitePlayer: {
            id: game.whitePlayer.id,
            name: game.whitePlayer.name,
            email: game.whitePlayer.email,
            avatar: game.whitePlayer.avatar,
          },
          blackPlayer: game.blackPlayer ? {
            id: game.blackPlayer.id,
            name: game.blackPlayer.name,
            email: game.blackPlayer.email,
            avatar: game.blackPlayer.avatar,
          } : null,
        },
        gameDuration,
        moveCount: null,
      };
    });
  }
}
