import { 
  Session as PrismaSession, 
  SessionUser as PrismaSessionUser,
  SessionStatus,
  GamePhase 
} from '@prisma/client';

// Re-export Prisma types as our base types
export type Session = PrismaSession;
export type SessionUser = PrismaSessionUser;

// Re-export enums for convenience
export { SessionStatus, GamePhase };

// Derived types for specific use cases
export type SessionWithUsers = Session & {
  users: SessionUser[];
};

export type SessionSummary = Pick<Session, 'id' | 'code' | 'status' | 'phase' | 'createdAt'>;

// Form data types
export type CreateSessionData = Pick<Session, 'code' | 'expiresAt'>;
export type JoinSessionData = Pick<SessionUser, 'nickname' | 'userId'> & {
  sessionCode: string;
};