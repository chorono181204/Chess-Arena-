import type { GameHistory, Game, User } from '@prisma/client';

export default class GameHistoryEntity {
  id: string;
  gameId: string;
  userId: string;
  result: string;
  ratingChange: number | null;
  createdAt: Date;
  game: {
    id: string;
    status: string;
    gameType: string;
    timeControl: string;
    isRated: boolean;
    currentFen: string;
    lastMove: string | null;
    turn: string;
    winner: string | null;
    result: string | null;
    reason: string | null;
    whiteTimeLeft: number;
    blackTimeLeft: number;
    timeIncrement: number;
    startedAt: Date | null;
    endedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    whitePlayer: {
      id: string;
      name: string;
      email: string;
      avatar: string | null;
    };
    blackPlayer: {
      id: string;
      name: string;
      email: string;
      avatar: string | null;
    } | null;
  };
  ratingBefore?: number;
  ratingAfter?: number;
  gameDuration?: number;
  moveCount?: number;
}
