import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsNumber, Min, Max, IsDateString } from 'class-validator';
import { Transform } from 'class-transformer';

export enum GameResult {
  WHITE_WINS = 'WHITE_WINS',
  BLACK_WINS = 'BLACK_WINS',
  DRAW = 'DRAW',
  ABANDONED = 'ABANDONED',
}

export enum GameStatus {
  WAITING = 'WAITING',
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  FINISHED = 'FINISHED',
  ABANDONED = 'ABANDONED',
}

export enum HistorySortBy {
  CREATED_AT = 'createdAt',
  ENDED_AT = 'endedAt',
  RATING_CHANGE = 'ratingChange',
  GAME_DURATION = 'gameDuration',
}

export class HistoryQueryDto {
  @ApiPropertyOptional({
    description: 'User ID to get history for',
  })
  @IsOptional()
  userId?: string;

  @ApiPropertyOptional({
    description: 'Game result filter',
    enum: GameResult,
  })
  @IsOptional()
  @IsEnum(GameResult)
  result?: GameResult;

  @ApiPropertyOptional({
    description: 'Game status filter',
    enum: GameStatus,
  })
  @IsOptional()
  @IsEnum(GameStatus)
  status?: GameStatus;

  @ApiPropertyOptional({
    description: 'Rating type filter',
    enum: ['CLASSIC', 'RAPID', 'BLITZ', 'BULLET'],
  })
  @IsOptional()
  ratingType?: string;

  @ApiPropertyOptional({
    description: 'Sort by field',
    enum: HistorySortBy,
    default: HistorySortBy.ENDED_AT,
  })
  @IsOptional()
  @IsEnum(HistorySortBy)
  sortBy?: HistorySortBy = HistorySortBy.ENDED_AT;

  @ApiPropertyOptional({
    description: 'Sort order (asc or desc)',
    enum: ['asc', 'desc'],
    default: 'desc',
  })
  @IsOptional()
  sortOrder?: 'asc' | 'desc' = 'desc';

  @ApiPropertyOptional({
    description: 'Page number',
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Items per page',
    minimum: 1,
    maximum: 100,
    default: 20,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  @Max(100)
  perPage?: number = 20;

  @ApiPropertyOptional({
    description: 'Start date filter (ISO string)',
    example: '2024-01-01T00:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'End date filter (ISO string)',
    example: '2024-12-31T23:59:59Z',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Search by opponent name',
  })
  @IsOptional()
  search?: string;
}
