import { Controller, Get, Query, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { LeaderboardService } from './leaderboard.service';
import { LeaderboardQueryDto, RatingType } from './dto/leaderboard-query.dto';
import LeaderboardItemEntity from './entities/leaderboard-item.entity';
import Serialize from '@decorators/serialize.decorator';
import ApiBaseResponses from '@decorators/api-base-response.decorator';
import ApiOkBaseResponse from '@decorators/api-ok-base-response.decorator';

@ApiTags('Leaderboard')
@ApiBaseResponses()
@Controller('leaderboard')
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  @Get()
  @ApiOperation({ 
    summary: 'Get leaderboard',
    description: 'Get paginated leaderboard with filtering and sorting options'
  })
  @ApiResponse({
    status: 200,
    description: 'Leaderboard retrieved successfully',
    type: [LeaderboardItemEntity],
  })
  @Serialize(LeaderboardItemEntity)
  async getLeaderboard(@Query() query: LeaderboardQueryDto) {
    return this.leaderboardService.getLeaderboard(query);
  }

  @Get('top/:ratingType')
  @ApiOperation({ 
    summary: 'Get top players',
    description: 'Get top players for a specific rating type'
  })
  @ApiParam({
    name: 'ratingType',
    enum: RatingType,
    description: 'Rating type to get top players for',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of top players to return (default: 10, max: 50)',
  })
  @ApiResponse({
    status: 200,
    description: 'Top players retrieved successfully',
    type: [LeaderboardItemEntity],
  })
  @Serialize(LeaderboardItemEntity)
  async getTopPlayers(
    @Param('ratingType') ratingType: RatingType,
    @Query('limit') limit?: number,
  ) {
    const limitValue = limit && limit <= 50 ? limit : 10;
    return this.leaderboardService.getTopPlayers(ratingType, limitValue);
  }

  @Get('user/:userId/ranking/:ratingType')
  @ApiOperation({ 
    summary: 'Get user ranking',
    description: 'Get specific user ranking for a rating type'
  })
  @ApiParam({
    name: 'userId',
    type: String,
    description: 'User ID',
  })
  @ApiParam({
    name: 'ratingType',
    enum: RatingType,
    description: 'Rating type to get ranking for',
  })
  @ApiResponse({
    status: 200,
    description: 'User ranking retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        position: { type: 'number' },
        total: { type: 'number' },
        rating: { type: 'number' },
        ratingType: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'User not found in leaderboard',
  })
  async getUserRanking(
    @Param('userId') userId: string,
    @Param('ratingType') ratingType: RatingType,
  ) {
    return this.leaderboardService.getUserRanking(userId, ratingType);
  }
}
