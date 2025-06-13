import { SessionStatus, GamePhase } from '@prisma/client';

export const GAME_CONFIG = {
  SELECTION_COUNT: 3,
  RATING_SCALE: {
    MIN: 1,
    MAX: 4,
  },
  SESSION_TIMEOUT_HOURS: 24,
  SESSION: {
    MAX_USERS: 2,
    CODE_LENGTH: 6,
  },
  QUESTIONS: {
    STORY_INTRIGUE: 'Story potential and intrigue',
    MOOD_ALIGNMENT: 'Personal mood alignment',
    IMMEDIATE_DESIRE: 'Immediate viewing impulse',
  },
} as const;

export const RATING_QUESTIONS = [
  {
    id: 'question1',
    text: '¿La sinopsis hace que la historia te parezca con verdadero potencial y te deje con intriga genuina?',
    shortText: 'Potencial de Historia'
  },
  {
    id: 'question2', 
    text: '¿Qué tanto se te antoja este tipo de anime para tu mood específico de este momento?',
    shortText: 'Mood Personal'
  },
  {
    id: 'question3',
    text: '¿Qué tan fuerte es tu impulso de querer ver ESTE anime en particular, por encima de otras opciones?',
    shortText: 'Impulso de Decisión'
  }
] as const;

// Re-export Prisma enums for consistency
export { SessionStatus, GamePhase };

// Helper functions for enum values
export const getSessionStatusLabel = (status: SessionStatus): string => {
  const labels: Record<SessionStatus, string> = {
    [SessionStatus.WAITING]: 'Esperando usuarios',
    [SessionStatus.ACTIVE]: 'Juego en progreso',
    [SessionStatus.COMPLETED]: 'Terminado',
    [SessionStatus.EXPIRED]: 'Expirado',
  };
  return labels[status];
};

export const getGamePhaseLabel = (phase: GamePhase): string => {
  const labels: Record<GamePhase, string> = {
    [GamePhase.SELECTION]: 'Selección secreta',
    [GamePhase.MATCHING]: 'Detección de coincidencias',
    [GamePhase.RATING]: 'Evaluación cruzada',
    [GamePhase.RESULTS]: 'Resultados',
  };
  return labels[phase];
};