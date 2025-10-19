import { Controller, Get, Query, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { HistoryService } from './history.service';
import { HistoryQueryDto } from './dto/history-query.dto';
import GameHistoryEntity from './entities/game-history.entity';
import Serialize from '@decorators/serialize.decorator';
import ApiBaseResponses from '@decorators/api-base-response.decorator';
import ApiOkBaseResponse from '@decorators/api-ok-base-response.decorator';

@ApiTags('History')
@ApiBaseResponses()
@Controller('history')
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  @Get()
  @ApiOperation({ 
    summary: 'Get game history',
    description: 'Get paginated game history with filtering and sorting options'
  })
  @ApiResponse({
    status: 200,
    description: 'Game history retrieved successfully',
    type: [GameHistoryEntity],
  })
  @Serialize(GameHistoryEntity)
  async getGameHistory(@Query() query: HistoryQueryDto) {
    return this.historyService.getGameHistory(query);
  }

  @Get('user/:userId')
  @ApiOperation({ 
    summary: 'Get user game history',
    description: 'Get game history for a specific user'
  })
  @ApiParam({
    name: 'userId',
    type: String,
    description: 'User ID',
  })
  @ApiResponse({
    status: 200,
    description: 'User game history retrieved successfully',
    type: [GameHistoryEntity],
  })
  @Serialize(GameHistoryEntity)
  async getUserHistory(
    @Param('userId') userId: string,
    @Query() query: Omit<HistoryQueryDto, 'userId'>,
  ) {
    return this.historyService.getGameHistory({ ...query, userId });
  }

  @Get('user/:userId/stats')
  @ApiOperation({ 
    summary: 'Get user statistics',
    description: 'Get comprehensive statistics for a user'
  })
  @ApiParam({
    name: 'userId',
    type: String,
    description: 'User ID',
  })
  @ApiQuery({
    name: 'ratingType',
    required: false,
    enum: ['CLASSIC', 'RAPID', 'BLITZ', 'BULLET'],
    description: 'Rating type to get stats for',
  })
  @ApiResponse({
    status: 200,
    description: 'User statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        totalGames: { type: 'number' },
        wins: { type: 'number' },
        losses: { type: 'number' },
        draws: { type: 'number' },
        winRate: { type: 'number' },
        currentRating: { type: 'number' },
        peakRating: { type: 'number' },
        averageGameDuration: { type: 'number' },
        longestWinStreak: { type: 'number' },
        longestLossStreak: { type: 'number' },
      },
    },
  })
  async getUserStats(
    @Param('userId') userId: string,
    @Query('ratingType') ratingType?: string,
  ) {
    return this.historyService.getUserStats(userId, ratingType);
  }

  @Get('user/:userId/recent')
  @ApiOperation({ 
    summary: 'Get recent games',
    description: 'Get recent games for a user'
  })
  @ApiParam({
    name: 'userId',
    type: String,
    description: 'User ID',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of recent games to return (default: 10, max: 50)',
  })
  @ApiResponse({
    status: 200,
    description: 'Recent games retrieved successfully',
    type: [GameHistoryEntity],
  })
  @Serialize(GameHistoryEntity)
  async getRecentGames(
    @Param('userId') userId: string,
    @Query('limit') limit?: number,
  ) {
    const limitValue = limit && limit <= 50 ? limit : 10;
    return this.historyService.getRecentGames(userId, limitValue);
  }

  @Get('game/:gameId')
  @ApiOperation({ 
    summary: 'Get game history by game ID',
    description: 'Get game history for a specific game'
  })
  @ApiParam({
    name: 'gameId',
    type: String,
    description: 'Game ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Game history retrieved successfully',
    type: [GameHistoryEntity],
  })
  @Serialize(GameHistoryEntity)
  async getGameHistoryById(@Param('gameId') gameId: string) {
    return this.historyService.getGameHistory({ gameId: gameId } as any);
  }
}
