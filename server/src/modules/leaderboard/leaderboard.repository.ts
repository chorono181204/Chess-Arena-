import { PrismaService } from '@providers/prisma';
import { Injectable } from '@nestjs/common';
import { Prisma, Rating } from '@prisma/client';
import { LeaderboardQueryDto, RatingType, LeaderboardSortBy } from './dto/leaderboard-query.dto';

@Injectable()
export class LeaderboardRepository {
  constructor(private prisma: PrismaService) {}

  async getLeaderboard(query: LeaderboardQueryDto): Promise<{
    data: any[];
    total: number;
    page: number;
    perPage: number;
    totalPages: number;
  }> {
    const { ratingType, sortBy, sortOrder, page, perPage, search } = query;
    const skip = (page - 1) * perPage;

    // Build where clause
    const where: Prisma.RatingWhereInput = {
      ratingType: ratingType as any,
    };

    // Add search filter if provided
    if (search) {
      where.user = {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      };
    }

    // Build order by clause
    let orderBy: Prisma.RatingOrderByWithRelationInput = {};
    switch (sortBy) {
      case LeaderboardSortBy.RATING:
        orderBy = { rating: sortOrder };
        break;
      case LeaderboardSortBy.GAMES_PLAYED:
        orderBy = { gamesPlayed: sortOrder };
        break;
      case LeaderboardSortBy.PEAK_RATING:
        orderBy = { peakRating: sortOrder };
        break;
      case LeaderboardSortBy.WIN_RATE:
        orderBy = { rating: 'desc' }; // Fallback to rating
        break;
    }

    // Get total count
    const total = await this.prisma.rating.count({ where });

    // Get ratings with user data
    const ratings = await this.prisma.rating.findMany({
      where,
      orderBy,
      skip,
      take: perPage,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    // Transform data and calculate win rate
    const data = ratings.map((rating, index) => {
      const winRate = rating.gamesPlayed > 0 
        ? ((rating.wins / rating.gamesPlayed) * 100) 
        : 0;

      return {
        userId: rating.user.id,
        username: rating.user.email,
        name: rating.user.name,
        avatar: rating.user.avatar,
        rating: rating.rating,
        peakRating: rating.peakRating,
        peakDate: rating.peakDate,
        gamesPlayed: rating.gamesPlayed,
        wins: rating.wins,
        losses: rating.losses,
        draws: rating.draws,
        winRate: Math.round(winRate * 100) / 100,
        position: skip + index + 1,
        ratingType: rating.ratingType,
        updatedAt: rating.updatedAt,
      };
    });

    // Sort by win rate if requested
    if (sortBy === LeaderboardSortBy.WIN_RATE) {
      data.sort((a, b) => {
        return sortOrder === 'desc' 
          ? b.winRate - a.winRate 
          : a.winRate - b.winRate;
      });
    }

    const totalPages = Math.ceil(total / perPage);

    return {
      data,
      total,
      page,
      perPage,
      totalPages,
    };
  }

  async getUserRanking(userId: string, ratingType: RatingType): Promise<{
    position: number;
    total: number;
    rating: number;
    ratingType: string;
  } | null> {
    // Get user's rating
    const userRating = await this.prisma.rating.findUnique({
      where: {
        userId_ratingType: {
          userId,
          ratingType: ratingType as any,
        },
      },
    });

    if (!userRating) {
      return null;
    }

    // Count users with higher rating
    const higherRatedCount = await this.prisma.rating.count({
      where: {
        ratingType: ratingType as any,
        rating: {
          gt: userRating.rating,
        },
      },
    });

    // Get total count
    const total = await this.prisma.rating.count({
      where: {
        ratingType: ratingType as any,
      },
    });

    return {
      position: higherRatedCount + 1,
      total,
      rating: userRating.rating,
      ratingType: userRating.ratingType,
    };
  }

  async getTopPlayers(ratingType: RatingType, limit: number = 10): Promise<any[]> {
    const ratings = await this.prisma.rating.findMany({
      where: {
        ratingType: ratingType as any,
      },
      orderBy: {
        rating: 'desc',
      },
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    return ratings.map((rating, index) => {
      const winRate = rating.gamesPlayed > 0 
        ? ((rating.wins / rating.gamesPlayed) * 100) 
        : 0;

      return {
        userId: rating.user.id,
        username: rating.user.email,
        name: rating.user.name,
        avatar: rating.user.avatar,
        rating: rating.rating,
        peakRating: rating.peakRating,
        peakDate: rating.peakDate,
        gamesPlayed: rating.gamesPlayed,
        wins: rating.wins,
        losses: rating.losses,
        draws: rating.draws,
        winRate: Math.round(winRate * 100) / 100,
        position: index + 1,
        ratingType: rating.ratingType,
        updatedAt: rating.updatedAt,
      };
    });
  }
}
