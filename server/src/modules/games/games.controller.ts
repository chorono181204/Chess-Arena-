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
import { GamesService } from './games.service'
import { GameMatchingService } from './game-matching.service'

@Controller('games')
@UseGuards(JwtAuthGuard)
export class GamesController {
  constructor(
    private readonly gamesService: GamesService,
    private readonly gameMatchingService: GameMatchingService,
  ) {}

  @Get(':id')
  async getGame(@Param('id') gameId: string, @Request() req) {
    try {
      const game = await this.gamesService.getGame(gameId, req.user.id)
      if (!game) {
        throw new HttpException('Game not found', HttpStatus.NOT_FOUND)
      }
      return game
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  @Post(':id/move')
  async makeMove(
    @Param('id') gameId: string,
    @Body() moveData: { from: string; to: string; promotion?: string },
    @Request() req,
  ) {
    try {
      const result = await this.gamesService.makeMove(gameId, req.user.id, moveData)
      if (!result.success) {
        throw new HttpException(result.message, HttpStatus.BAD_REQUEST)
      }
      return result
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  @Post(':id/join')
  async joinGame(
    @Param('id') gameId: string,
    @Body() data: { asSpectator?: boolean },
    @Request() req,
  ) {
    try {
      const result = await this.gamesService.joinGame(gameId, req.user.id, data.asSpectator)
      if (!result.success) {
        throw new HttpException(result.message, HttpStatus.BAD_REQUEST)
      }
      return result
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  @Post(':id/leave')
  async leaveGame(@Param('id') gameId: string, @Request() req) {
    try {
      const result = await this.gamesService.leaveGame(gameId, req.user.id)
      if (!result.success) {
        throw new HttpException(result.message, HttpStatus.BAD_REQUEST)
      }
      return result
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  @Post(':id/message')
  async sendMessage(
    @Param('id') gameId: string,
    @Body() data: { content: string },
    @Request() req,
  ) {
    try {
      const result = await this.gamesService.sendMessage(gameId, req.user.id, data.content)
      if (!result.success) {
        throw new HttpException(result.message, HttpStatus.BAD_REQUEST)
      }
      return result
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  @Post('matchmaking/request')
  async requestMatch(
    @Body() data: { timeControl: string; isRated: boolean; minRating?: number; maxRating?: number },
    @Request() req,
  ) {
    try {
      const result = await this.gameMatchingService.requestMatch({
        userId: req.user.id,
        timeControl: data.timeControl,
        isRated: data.isRated,
        minRating: data.minRating,
        maxRating: data.maxRating,
      })
      return result
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  @Post('matchmaking/cancel')
  async cancelMatch(@Request() req) {
    try {
      const result = await this.gameMatchingService.cancelMatch(req.user.id)
      return result
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  @Get('matchmaking/status')
  async getQueueStatus() {
    try {
      return this.gameMatchingService.getQueueStatus()
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }
}







