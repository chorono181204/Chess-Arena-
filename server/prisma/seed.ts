import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create test users
  const hashedPassword = await bcrypt.hash('password123', 10);

  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'alice@chessarena.com' },
      update: {},
      create: {
        email: 'alice@chessarena.com',
        name: 'Alice Johnson',
        password: hashedPassword,
        isVerified: true,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice',
      },
    }),
    prisma.user.upsert({
      where: { email: 'bob@chessarena.com' },
      update: {},
      create: {
        email: 'bob@chessarena.com',
        name: 'Bob Smith',
        password: hashedPassword,
        isVerified: true,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bob',
      },
    }),
    prisma.user.upsert({
      where: { email: 'charlie@chessarena.com' },
      update: {},
      create: {
        email: 'charlie@chessarena.com',
        name: 'Charlie Brown',
        password: hashedPassword,
        isVerified: true,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=charlie',
      },
    }),
    prisma.user.upsert({
      where: { email: 'diana@chessarena.com' },
      update: {},
      create: {
        email: 'diana@chessarena.com',
        name: 'Diana Wilson',
        password: hashedPassword,
        isVerified: true,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=diana',
      },
    }),
  ]);

  console.log('✅ Created users:', users.length);

  // Create ratings for users
  const ratings = await Promise.all([
    // Alice - Classic rating
    prisma.rating.upsert({
      where: { userId_ratingType: { userId: users[0].id, ratingType: 'CLASSIC' } },
      update: {},
      create: {
        userId: users[0].id,
        rating: 1450,
        ratingType: 'CLASSIC',
        gamesPlayed: 25,
        wins: 15,
        losses: 8,
        draws: 2,
        peakRating: 1520,
        peakDate: new Date('2024-01-15'),
      },
    }),
    // Bob - Multiple rating types
    prisma.rating.upsert({
      where: { userId_ratingType: { userId: users[1].id, ratingType: 'CLASSIC' } },
      update: {},
      create: {
        userId: users[1].id,
        rating: 1800,
        ratingType: 'CLASSIC',
        gamesPlayed: 50,
        wins: 35,
        losses: 12,
        draws: 3,
        peakRating: 1850,
        peakDate: new Date('2024-02-01'),
      },
    }),
    prisma.rating.upsert({
      where: { userId_ratingType: { userId: users[1].id, ratingType: 'BLITZ' } },
      update: {},
      create: {
        userId: users[1].id,
        rating: 1650,
        ratingType: 'BLITZ',
        gamesPlayed: 30,
        wins: 20,
        losses: 8,
        draws: 2,
        peakRating: 1700,
      },
    }),
    // Charlie - High rated player
    prisma.rating.upsert({
      where: { userId_ratingType: { userId: users[2].id, ratingType: 'CLASSIC' } },
      update: {},
      create: {
        userId: users[2].id,
        rating: 2200,
        ratingType: 'CLASSIC',
        gamesPlayed: 100,
        wins: 75,
        losses: 20,
        draws: 5,
        peakRating: 2250,
        peakDate: new Date('2024-01-20'),
      },
    }),
    // Diana - New player
    prisma.rating.upsert({
      where: { userId_ratingType: { userId: users[3].id, ratingType: 'CLASSIC' } },
      update: {},
      create: {
        userId: users[3].id,
        rating: 1200,
        ratingType: 'CLASSIC',
        gamesPlayed: 5,
        wins: 2,
        losses: 3,
        draws: 0,
      },
    }),
  ]);

  console.log('✅ Created ratings:', ratings.length);

  // Create sample games
  const games = await Promise.all([
    // Completed game between Alice and Bob
    prisma.game.create({
      data: {
        status: 'FINISHED',
        gameType: 'RATED',
        timeControl: '10+5',
        isRated: true,
        isPublic: true,
        currentFen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        lastMove: 'f8c5',
        turn: 'WHITE',
        winner: 'WHITE',
        result: 'WHITE_WINS',
        reason: 'checkmate',
        whiteTimeLeft: 450000, // 7.5 minutes
        blackTimeLeft: 0,
        timeIncrement: 5000,
        startedAt: new Date('2024-01-10T10:00:00Z'),
        endedAt: new Date('2024-01-10T10:25:00Z'),
        whitePlayerId: users[0].id,
        blackPlayerId: users[1].id,
      },
    }),
    // Active game between Charlie and Diana
    prisma.game.create({
      data: {
        status: 'ACTIVE',
        gameType: 'CASUAL',
        timeControl: '5+0',
        isRated: false,
        isPublic: true,
        currentFen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1',
        lastMove: 'e7e5',
        turn: 'WHITE',
        whiteTimeLeft: 280000, // 4.67 minutes
        blackTimeLeft: 290000, // 4.83 minutes
        timeIncrement: 0,
        startedAt: new Date(),
        whitePlayerId: users[2].id,
        blackPlayerId: users[3].id,
      },
    }),
    // Waiting game (Alice waiting for opponent)
    prisma.game.create({
      data: {
        status: 'WAITING',
        gameType: 'RATED',
        timeControl: '15+10',
        isRated: true,
        isPublic: true,
        currentFen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        whiteTimeLeft: 900000, // 15 minutes
        blackTimeLeft: 900000, // 15 minutes
        timeIncrement: 10000, // 10 seconds
        whitePlayerId: users[0].id,
      },
    }),
  ]);

  console.log('✅ Created games:', games.length);

  // Create sample moves for the completed game
  const moves = await Promise.all([
    prisma.move.create({
      data: {
        gameId: games[0].id,
        moveNumber: 1,
        move: 'e2e4',
        fen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e3 0 1',
        notation: '1. e4',
        timeLeft: 580000,
        moveTime: 2000,
      },
    }),
    prisma.move.create({
      data: {
        gameId: games[0].id,
        moveNumber: 2,
        move: 'e7e5',
        fen: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e6 0 2',
        notation: '1. e4 e5',
        timeLeft: 570000,
        moveTime: 1500,
      },
    }),
    prisma.move.create({
      data: {
        gameId: games[0].id,
        moveNumber: 3,
        move: 'g1f3',
        fen: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2',
        notation: '1. e4 e5 2. Nf3',
        timeLeft: 560000,
        moveTime: 3000,
      },
    }),
  ]);

  console.log('✅ Created moves:', moves.length);

  // Create game history
  const gameHistory = await Promise.all([
    prisma.gameHistory.create({
      data: {
        userId: users[0].id,
        gameId: games[0].id,
        result: 'WHITE_WINS',
        ratingChange: 15,
      },
    }),
    prisma.gameHistory.create({
      data: {
        userId: users[1].id,
        gameId: games[0].id,
        result: 'BLACK_WINS',
        ratingChange: -15,
      },
    }),
  ]);

  console.log('✅ Created game history:', gameHistory.length);

  // Create sample messages
  const messages = await Promise.all([
    prisma.message.create({
      data: {
        gameId: games[1].id,
        userId: users[2].id,
        content: 'Good luck!',
        type: 'CHAT',
      },
    }),
    prisma.message.create({
      data: {
        gameId: games[1].id,
        userId: users[3].id,
        content: 'Thanks, you too!',
        type: 'CHAT',
      },
    }),
  ]);

  console.log('✅ Created messages:', messages.length);

  // Create sample notifications
  const notifications = await Promise.all([
    prisma.notification.create({
      data: {
        userId: users[0].id,
        title: 'Game Invitation',
        content: 'Bob wants to play a rated game with you',
        type: 'GAME_INVITE',
        gameId: games[2].id,
      },
    }),
    prisma.notification.create({
      data: {
        userId: users[1].id,
        title: 'Friend Request',
        content: 'Alice sent you a friend request',
        type: 'FRIEND_REQUEST',
      },
    }),
  ]);

  console.log('✅ Created notifications:', notifications.length);

  // Create sample friendships
  const friendships = await Promise.all([
    prisma.friendship.create({
      data: {
        userId: users[0].id,
        friendId: users[1].id,
      },
    }),
    prisma.friendship.create({
      data: {
        userId: users[1].id,
        friendId: users[0].id,
      },
    }),
  ]);

  console.log('✅ Created friendships:', friendships.length);

  console.log('🎉 Database seeding completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`- Users: ${users.length}`);
  console.log(`- Ratings: ${ratings.length}`);
  console.log(`- Games: ${games.length}`);
  console.log(`- Moves: ${moves.length}`);
  console.log(`- Game History: ${gameHistory.length}`);
  console.log(`- Messages: ${messages.length}`);
  console.log(`- Notifications: ${notifications.length}`);
  console.log(`- Friendships: ${friendships.length}`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });