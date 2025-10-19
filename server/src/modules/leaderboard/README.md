# Leaderboard Module

## Overview
The Leaderboard module provides APIs for managing and retrieving chess player rankings and statistics.

## Endpoints

### GET /leaderboard
Get paginated leaderboard with filtering and sorting options.

**Query Parameters:**
- `ratingType` (optional): Rating type filter (CLASSIC, RAPID, BLITZ, BULLET)
- `sortBy` (optional): Sort field (rating, gamesPlayed, winRate, peakRating)
- `sortOrder` (optional): Sort order (asc, desc)
- `page` (optional): Page number (default: 1)
- `perPage` (optional): Items per page (default: 20, max: 100)
- `search` (optional): Search by username

**Example:**
```
GET /leaderboard?ratingType=CLASSIC&sortBy=rating&sortOrder=desc&page=1&perPage=20
```

### GET /leaderboard/top/:ratingType
Get top players for a specific rating type.

**Path Parameters:**
- `ratingType`: Rating type (CLASSIC, RAPID, BLITZ, BULLET)

**Query Parameters:**
- `limit` (optional): Number of top players (default: 10, max: 50)

**Example:**
```
GET /leaderboard/top/CLASSIC?limit=10
```

### GET /leaderboard/user/:userId/ranking/:ratingType
Get specific user ranking for a rating type.

**Path Parameters:**
- `userId`: User ID
- `ratingType`: Rating type (CLASSIC, RAPID, BLITZ, BULLET)

**Example:**
```
GET /leaderboard/user/uuid-string/ranking/CLASSIC
```

## Response Format

### LeaderboardItem
```json
{
  "userId": "uuid-string",
  "username": "chessmaster123",
  "name": "Chess Master",
  "avatar": "https://example.com/avatar.jpg",
  "rating": 1850,
  "peakRating": 1920,
  "peakDate": "2024-01-15T10:30:00Z",
  "gamesPlayed": 150,
  "wins": 95,
  "losses": 40,
  "draws": 15,
  "winRate": 63.33,
  "position": 1,
  "ratingType": "CLASSIC",
  "updatedAt": "2024-01-20T15:45:00Z"
}
```

### Paginated Response
```json
{
  "data": [LeaderboardItem],
  "total": 1000,
  "page": 1,
  "perPage": 20,
  "totalPages": 50
}
```
