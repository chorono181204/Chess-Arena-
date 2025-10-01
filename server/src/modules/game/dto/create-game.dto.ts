import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateGameDto {
  @ApiProperty({ example: 'user123' })
  @IsString()
  whitePlayerId: string;

  @ApiProperty({ example: '5+0', required: false })
  @IsOptional()
  @IsString()
  timeControl?: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}



