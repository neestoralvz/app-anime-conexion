import { GAME_CONFIG } from '@/constants';

export function isValidRating(rating: number): boolean {
  return rating >= GAME_CONFIG.RATING_SCALE.MIN && 
         rating <= GAME_CONFIG.RATING_SCALE.MAX && 
         Number.isInteger(rating);
}

export function isValidSessionCode(code: string): boolean {
  return /^[A-Z0-9]{6}$/.test(code);
}

export function isValidNickname(nickname: string): boolean {
  return nickname.trim().length >= 2 && nickname.trim().length <= 20;
}

export function validateAnimeSelection(selections: string[]): boolean {
  return selections.length === GAME_CONFIG.SELECTION_COUNT && 
         new Set(selections).size === selections.length;
}