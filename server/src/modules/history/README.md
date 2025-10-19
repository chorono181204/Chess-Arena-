# History Module

## Overview
The History module provides APIs for managing and retrieving chess game history and player statistics.

## Endpoints

### GET /history
Get paginated game history with filtering and sorting options.

**Query Parameters:**
- `userId` (optional): User ID to filter by
- `result` (optional): Game result filter (WHITE_WINS, BLACK_WINS, DRAW, ABANDONED)
- `status` (optional): Game status filter (WAITING, ACTIVE, PAUSED, FINISHED, ABANDONED)
- `ratingType` (optional): Rating type filter (CLASSIC, RAPID, BLITZ, BULLET)
- `sortBy` (optional): Sort field (createdAt, endedAt, ratingChange, gameDuration)
- `sortOrder` (optional): Sort order (asc, desc)
- `page` (optional): Page number (default: 1)
- `perPage` (optional): Items per page (default: 20, max: 100)
- `startDate` (optional): Start date filter (ISO string)
- `endDate` (optional): End date filter (ISO string)
- `search` (optional): Search by opponent name

**Example:**
```
GET /history?userId=uuid-string&result=WHITE_WINS&sortBy=endedAt&sortOrder=desc
```

### GET /history/user/:userId
Get game history for a specific user.

**Path Parameters:**
- `userId`: User ID

**Query Parameters:** Same as GET /history (except userId)

**Example:**
```
GET /history/user/uuid-string?result=WHITE_WINS&page=1&perPage=20
```

### GET /history/user/:userId/stats
Get comprehensive statistics for a user.

**Path Parameters:**
- `userId`: User ID

**Query Parameters:**
- `ratingType` (optional): Rating type to get stats for

**Example:**
```
GET /history/user/uuid-string/stats?ratingType=CLASSIC
```

### GET /history/user/:userId/recent
Get recent games for a user.

**Path Parameters:**
- `userId`: User ID

**Query Parameters:**
- `limit` (optional): Number of recent games (default: 10, max: 50)

**Example:**
```
GET /history/user/uuid-string/recent?limit=10
```

### GET /history/game/:gameId
Get game history for a specific game.

**Path Parameters:**
- `gameId`: Game ID

**Example:**
```
GET /history/game/uuid-string
```

## Response Format

### GameHistory
```json
{
  "id": "uuid-string",
  "gameId": "uuid-string",
  "userId": "uuid-string",
  "result": "WHITE_WINS",
  "ratingChange": 15,
  "createdAt": "2024-01-15T10:30:00Z",
  "game": {
    "id": "uuid-string",
    "status": "FINISHED",
    "gameType": "RATED",
    "timeControl": "5+0",
    "isRated": true,
    "currentFen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    "lastMove": "e2e4",
    "turn": "WHITE",
    "winner": "WHITE",
    "result": "WHITE_WINS",
    "reason": "checkmate",
    "whiteTimeLeft": 300000,
    "blackTimeLeft": 250000,
    "timeIncrement": 0,
    "startedAt": "2024-01-15T10:30:00Z",
    "endedAt": "2024-01-15T11:00:00Z",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T11:00:00Z",
    "whitePlayer": {
      "id": "uuid-string",
      "name": "Player 1",
      "email": "player1@example.com",
      "avatar": "https://example.com/avatar1.jpg"
    },
    "blackPlayer": {
      "id": "uuid-string",
      "name": "Player 2",
      "email": "player2@example.com",
      "avatar": "https://example.com/avatar2.jpg"
    }
  },
  "gameDuration": 1800000,
  "moveCount": 45
}
```

### User Statistics
```json
{
  "totalGames": 150,
  "wins": 95,
  "losses": 40,
  "draws": 15,
  "winRate": 63.33,
  "currentRating": 1850,
  "peakRating": 1920,
  "averageGameDuration": 1800000,
  "longestWinStreak": 8,
  "longestLossStreak": 3
}
```
