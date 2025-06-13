'use client';

import { createContext, useContext, useReducer, ReactNode } from 'react';
import { Session, SessionUser, Anime, RatingFormData, GamePhase } from '@/types';

interface SessionState {
  // Estado de sesión
  session: Session | null;
  currentUser: SessionUser | null;
  isConnected: boolean;
  
  // Estado del juego
  selectedAnimes: Anime[];
  selfRatings: RatingFormData[];
  crossRatings: RatingFormData[];
  
  // Estado de UI
  isLoading: boolean;
  error: string | null;
  currentPhase: GamePhase;
}

interface SessionContextType {
  state: SessionState;
  dispatch: React.Dispatch<SessionAction>;
}

type SessionAction =
  | { type: 'SET_SESSION'; payload: Session }
  | { type: 'SET_CURRENT_USER'; payload: SessionUser }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_SELECTED_ANIMES'; payload: Anime[] }
  | { type: 'SET_PHASE'; payload: GamePhase }
  | { type: 'SET_SELF_RATINGS'; payload: RatingFormData[] }
  | { type: 'SET_CROSS_RATINGS'; payload: RatingFormData[] }
  | { type: 'SET_CONNECTED'; payload: boolean }
  | { type: 'RESET_SESSION' };

const initialState: SessionState = {
  session: null,
  currentUser: null,
  isConnected: false,
  selectedAnimes: [],
  selfRatings: [],
  crossRatings: [],
  isLoading: false,
  error: null,
  currentPhase: GamePhase.SELECTION,
};

function sessionReducer(state: SessionState, action: SessionAction): SessionState {
  switch (action.type) {
    case 'SET_SESSION':
      return { ...state, session: action.payload, currentPhase: action.payload.phase };
    case 'SET_CURRENT_USER':
      return { ...state, currentUser: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_SELECTED_ANIMES':
      return { ...state, selectedAnimes: action.payload };
    case 'SET_PHASE':
      return { ...state, currentPhase: action.payload };
    case 'SET_SELF_RATINGS':
      return { ...state, selfRatings: action.payload };
    case 'SET_CROSS_RATINGS':
      return { ...state, crossRatings: action.payload };
    case 'SET_CONNECTED':
      return { ...state, isConnected: action.payload };
    case 'RESET_SESSION':
      return initialState;
    default:
      return state;
  }
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(sessionReducer, initialState);

  return (
    <SessionContext.Provider value={{ state, dispatch }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}