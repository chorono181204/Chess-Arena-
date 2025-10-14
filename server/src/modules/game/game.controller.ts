import { Controller, Get, Post, Body, Param, BadRequestException, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { GameService } from './game.service';
import { MatchmakingService } from './matchmaking.service';
import { Request } from 'express';
import { QuickMatchRequestDto } from './dto/quick-match.dto';

@ApiTags('games')
@Controller('games')
@ApiBearerAuth()
export class GameController {
  constructor(
    private readonly gameService: GameService,
    private readonly matchmakingService: MatchmakingService,
  ) {}

  @Post('quick-match')
  @ApiOperation({ summary: 'Find quick match' })
  @ApiBody({ type: QuickMatchRequestDto })
  async findQuickMatch(@Body() body: QuickMatchRequestDto, @Req() req: Request) {
    const userId = (req as any)?.user?.id;
    const preferences = body?.preferences ?? {} as any;

    if (!userId) {
      throw new BadRequestException('userId là bắt buộc');
    }
    if (!preferences?.timeControl) {
      throw new BadRequestException('preferences.timeControl là bắt buộc');
    }
    if (!preferences?.ratingType) {
      throw new BadRequestException('preferences.ratingType là bắt buộc');
    }

    const result = await this.matchmakingService.findQuickMatch(userId, preferences);
    return result;
  }

  @Post('cancel-match')
  @ApiOperation({ summary: 'Cancel matchmaking' })
  async cancelMatch(@Body() body: any) {
    const userId = body.userId;
    return this.matchmakingService.cancelMatchmaking(userId);
  }

  @Post('create')
  @ApiOperation({ summary: 'Create custom game' })
  async createGame(@Body() body: any) {
    const userId = body.userId;
    return this.matchmakingService.createCustomGame(userId, body);
  }

  @Get('waiting')
  @ApiOperation({ summary: 'Get waiting games' })
  async getWaitingGames() {
    return this.matchmakingService.getWaitingGames({});
  }

  @Get('active')
  @ApiOperation({ summary: 'Get active games' })
  async getActiveGames() {
    return this.gameService.getActiveGames();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get game by ID' })
  async getGame(@Param('id') id: string) {
    return this.gameService.findGameById(id);
  }

  @Post(':id/join')
  @ApiOperation({ summary: 'Join game' })
  async joinGame(@Param('id') id: string, @Body() body: any) {
    const userId = body.userId;
    return this.gameService.joinGame(id, userId);
  }

  @Post(':id/move')
  @ApiOperation({ summary: 'Make move' })
  async makeMove(@Param('id') id: string, @Body() body: any) {
    const userId = body.userId;
    return this.gameService.makeMove(id, userId, body.move);
  }

  @Post(':id/resign')
  @ApiOperation({ summary: 'Resign game' })
  async resignGame(@Param('id') id: string, @Body() body: any) {
    const userId = body.userId;
    return this.gameService.resignGame(id, userId);
  }

  @Post(':id/offer-draw')
  @ApiOperation({ summary: 'Offer draw' })
  async offerDraw(@Param('id') id: string, @Body() body: any) {
    const userId = body.userId;
    return this.gameService.offerDraw(id, userId);
  }

  @Post(':id/accept-draw')
  @ApiOperation({ summary: 'Accept draw' })
  async acceptDraw(@Param('id') id: string, @Body() body: any) {
    const userId = body.userId;
    return this.gameService.acceptDraw(id, userId);
  }
}





