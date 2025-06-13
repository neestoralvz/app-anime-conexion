import { SessionStatus, GamePhase } from '@prisma/client';

export interface Session {
  id: string;
  code: string;
  status: SessionStatus;
  phase: GamePhase;
  maxUsers: number;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface SessionUser {
  id: string;
  sessionId: string;
  userId: string;
  nickname: string;
  isReady: boolean;
  joinedAt: Date;
}