export interface Session {
  id: string;
  code: string;
  status: 'WAITING' | 'ACTIVE' | 'COMPLETED' | 'EXPIRED';
  phase: 'SELECTION' | 'MATCHING' | 'RATING' | 'RESULTS';
  createdAt: Date;
  updatedAt: Date;
}

export interface SessionUser {
  id: string;
  sessionId: string;
  name: string;
  isCreator: boolean;
  joinedAt: Date;
}