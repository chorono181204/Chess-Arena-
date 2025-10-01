import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class MakeMoveDto {
  @ApiProperty({ example: 'e2e4' })
  @IsString()
  move: string;

  @ApiProperty({ example: 'user123' })
  @IsString()
  playerId: string;
}





