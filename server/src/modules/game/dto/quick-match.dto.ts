import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsDefined, IsInt, IsNotEmpty, IsOptional, IsString, Matches, Max, Min, ValidateNested } from 'class-validator';

export class QuickMatchPreferencesDto {
  @ApiProperty({ example: '5+3', description: 'M+I (phút + giây/nước)' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d+\+\d+$/)
  timeControl!: string;

  @ApiProperty({ enum: ['CLASSIC', 'RAPID', 'BLITZ', 'BULLET'], example: 'BLITZ' })
  @IsString()
  @IsNotEmpty()
  ratingType!: 'CLASSIC' | 'RAPID' | 'BLITZ' | 'BULLET';

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isRated?: boolean;

  @ApiProperty({ example: 1100, required: false, minimum: 100, maximum: 3500 })
  @IsOptional()
  @IsInt()
  @Min(100)
  @Max(3500)
  minRating?: number;

  @ApiProperty({ example: 1400, required: false, minimum: 100, maximum: 3500 })
  @IsOptional()
  @IsInt()
  @Min(100)
  @Max(3500)
  maxRating?: number;
}

export class QuickMatchRequestDto {
  @ApiProperty({ type: QuickMatchPreferencesDto })
  @IsDefined()
  @ValidateNested()
  @Type(() => QuickMatchPreferencesDto)
  preferences!: QuickMatchPreferencesDto;
}

