# Chess Arena Backend Architecture

## 🏗️ Architecture Overview

This backend uses **Event-Driven Architecture** with **WebSocket** for real-time communication and **BullMQ** for background job processing.

## 📦 Main Components

### 1. WebSocket Gateway (`src/modules/websocket/`)
Handles real-time bidirectional communication between server and clients.

**Events (Client → Server):**
- `find-match` - User looking for opponent
- `cancel-match` - Cancel matchmaking
- `join-game` - Join game room
- `leave-game` - Leave game room
- `make-move` - Make chess move
- `send-message` - Send chat message
- `resign` - Resign game
- `offer-draw` / `accept-draw` - Draw offers

**Events (Server → Client):**
- `match-found` - Matchmaking successful
- `game-update` - Game state changed
- `move-made` - Opponent made move
- `game-over` - Game ended
- `chat-message` - New chat message

### 2. Event System (`src/modules/events/`)
Central event bus using `@nestjs/event-emitter`.

**Event Flow:**
```
Client → WebSocket → Event Emitter → Event Listeners → Services/Queues → Event Emitter → WebSocket → Client
```

**Event Patterns:**
- `matchmaking.*` - Matchmaking events
- `game.*` - Game events
- `user.*` - User events
- `notification.*` - Notification events

### 3. Queue System (`src/modules/queues/`)
Background job processing with BullMQ.

**Queues:**
- **matchmaking** - Find matches, cancel searches
- **game** - Process moves, update ratings, check timeouts
- **notification** - Send notifications to users

**Job Types:**
- `find-match` - Search for opponent
- `process-move` - Validate and process chess move
- `update-rating` - Calculate ELO changes
- `check-timeout` - Monitor game timers
- `send-notification` - Send user notifications

### 4. Game Module (`src/modules/game/`)
Core game business logic (YOU IMPLEMENT THIS).

**Services:**
- `GameService` - Game CRUD and state management
- `MatchmakingService` - Matchmaking logic

**TODO - Implement:**
- Move validation
- Chess engine integration
- Win condition checks
- Rating calculations
- Game state management

## 🔄 Data Flow Examples

### Matchmaking Flow
```
1. Client emits 'find-match' via WebSocket
2. Gateway receives and emits 'matchmaking.find' event
3. MatchmakingEventListener adds job to matchmaking queue
4. MatchmakingProcessor processes job:
   - Searches for opponent in pool
   - If found: emits 'matchmaking.matched' event
   - If not: adds user to waiting pool
5. MatchmakingEventListener creates game
6. Gateway emits 'match-found' to both clients
```

### Game Move Flow
```
1. Client emits 'make-move' with move data
2. Gateway emits 'game.move' event
3. GameEventListener adds job to game queue
4. GameProcessor validates and processes move
5. Processor emits 'game.move-processed' event
6. Gateway broadcasts 'move-made' to all players in game
```

## 🎯 Implementation Guide

### Where to Add Your Code

#### 1. Game Logic (`src/modules/game/game.service.ts`)
Implement these methods:
- `createGame()` - Create new game
- `makeMove()` - Validate and process moves
- `endGame()` - Handle game completion
- `resignGame()` - Handle resignation
- `offerDraw()` / `acceptDraw()` - Draw handling

#### 2. Matchmaking Logic (`src/modules/game/matchmaking.service.ts`)
Implement these methods:
- `findQuickMatch()` - Find opponent with similar rating
- `createCustomGame()` - Create custom game
- `calculateRatingChange()` - ELO calculation

#### 3. Event Listeners (`src/modules/events/listeners/`)
Connect events to your services:
- Inject your services
- Call service methods in event handlers
- Emit new events when needed

#### 4. Queue Processors (`src/modules/queues/processors/`)
Implement async job processing:
- Move validation and processing
- Rating calculations
- Timeout checks
- Notifications

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Database
```bash
npm run db:migrate
npm run db:seed
```

### 3. Start Services
```bash
# Development with Docker
make dev

# Or without Docker
npm run start:dev
```

### 4. Access Services
- **API**: http://localhost:3000
- **WebSocket**: ws://localhost:3000/chess
- **Bull Board**: http://localhost:8080
- **pgAdmin**: http://localhost:8082

## 📝 Environment Variables

Required variables in `.env`:
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/chess_arena
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=your-secret-key
CORS_ORIGIN=http://localhost:3000
```

## 🧪 Testing WebSocket

Use Socket.io client:
```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:3000/chess', {
  query: { userId: 'user-123' },
  auth: { token: 'jwt-token' }
});

// Find match
socket.emit('find-match', {
  timeControl: '5+0',
  ratingType: 'BLITZ',
  isRated: true
});

// Listen for match
socket.on('match-found', (data) => {
  console.log('Match found!', data);
});
```

## 📚 Key Technologies

- **NestJS** - Framework
- **Prisma** - ORM
- **Socket.io** - WebSocket
- **BullMQ** - Job queue
- **Redis** - Cache & Queue backend
- **PostgreSQL** - Database
- **EventEmitter2** - Event system

## 🎮 Next Steps

1. Implement core game logic in `GameService`
2. Add chess move validation
3. Implement ELO rating calculation
4. Add timeout handling
5. Implement chat system
6. Add tests

Good luck with your Chess Arena implementation! 🎯

