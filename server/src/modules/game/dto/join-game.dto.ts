import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class JoinGameDto {
  @ApiProperty({ example: 'user456' })
  @IsString()
  blackPlayerId: string;
}
