import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsNumber, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';

export enum RatingType {
  CLASSIC = 'CLASSIC',
  RAPID = 'RAPID',
  BLITZ = 'BLITZ',
  BULLET = 'BULLET',
}

export enum LeaderboardSortBy {
  RATING = 'rating',
  GAMES_PLAYED = 'gamesPlayed',
  WIN_RATE = 'winRate',
  PEAK_RATING = 'peakRating',
}

export class LeaderboardQueryDto {
  @ApiPropertyOptional({
    description: 'Rating type to filter by',
    enum: RatingType,
    default: RatingType.CLASSIC,
  })
  @IsOptional()
  @IsEnum(RatingType)
  ratingType?: RatingType = RatingType.CLASSIC;

  @ApiPropertyOptional({
    description: 'Sort by field',
    enum: LeaderboardSortBy,
    default: LeaderboardSortBy.RATING,
  })
  @IsOptional()
  @IsEnum(LeaderboardSortBy)
  sortBy?: LeaderboardSortBy = LeaderboardSortBy.RATING;

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
    description: 'Search by username',
  })
  @IsOptional()
  search?: string;
}
