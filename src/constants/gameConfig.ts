export const GAME_CONFIG = {
  SELECTION_COUNT: 3,
  RATING_SCALE: {
    MIN: 1,
    MAX: 4,
  },
  SESSION_TIMEOUT_HOURS: 24,
  QUESTIONS: {
    STORY_INTRIGUE: 'Story potential and intrigue',
    MOOD_ALIGNMENT: 'Personal mood alignment',
    IMMEDIATE_DESIRE: 'Immediate viewing impulse',
  },
} as const;

export const SESSION_PHASES = {
  SELECTION: 'SELECTION',
  MATCHING: 'MATCHING',
  RATING: 'RATING',
  RESULTS: 'RESULTS',
} as const;

export const SESSION_STATUS = {
  WAITING: 'WAITING',
  ACTIVE: 'ACTIVE',
  COMPLETED: 'COMPLETED',
  EXPIRED: 'EXPIRED',
} as const;