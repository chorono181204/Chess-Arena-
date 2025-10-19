import type { Rating, User } from '@prisma/client';

export default class LeaderboardItemEntity {
  userId: string;
  username: string;
  name: string;
  avatar: string | null;
  rating: number;
  peakRating: number | null;
  peakDate: Date | null;
  gamesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
  position: number;
  ratingType: string;
  updatedAt: Date;
}
