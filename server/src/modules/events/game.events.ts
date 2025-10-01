export class GameCreatedEvent {
  constructor(
    public readonly gameId: string,
    public readonly whitePlayerId: string,
    public readonly timestamp: Date
  ) {}
}

export class GameStartedEvent {
  constructor(
    public readonly gameId: string,
    public readonly blackPlayerId: string,
    public readonly timestamp: Date
  ) {}
}

export class MovePlayedEvent {
  constructor(
    public readonly gameId: string,
    public readonly move: string,
    public readonly playerId: string,
    public readonly fen: string,
    public readonly timestamp: Date
  ) {}
}

export class GameEndedEvent {
  constructor(
    public readonly gameId: string,
    public readonly status: 'completed' | 'draw' | 'timeout',
    public readonly winnerId?: string,
    public readonly timestamp?: Date
  ) {}
}

export class GameTimeoutEvent {
  constructor(
    public readonly gameId: string,
    public readonly playerId: string,
    public readonly timestamp: Date
  ) {}
}

export class MessageSentEvent {
  constructor(
    public readonly gameId: string,
    public readonly message: any,
    public readonly timestamp: Date
  ) {}
}









