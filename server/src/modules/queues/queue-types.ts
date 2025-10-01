export interface GameTimeoutJobData {
  gameId: string;
  playerId: string;
  timeoutDuration: number;
}

export interface GameCleanupJobData {
  gameId: string;
  reason: 'abandoned' | 'timeout' | 'completed';
}

export interface LeaderboardUpdateJobData {
  gameId: string;
  winnerId?: string;
  loserId?: string;
  isDraw: boolean;
}

export interface NotificationJobData {
  userId: string;
  type: 'game_invite' | 'move_played' | 'game_ended' | 'game_timeout';
  data: any;
}



