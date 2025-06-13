# S1-003: Organizar Estructura y Componentes Base

**Sprint**: 1 | **Día**: 3 | **Duración**: 1 día  
**Prioridad**: Alta | **Dependencias**: S1-001, S1-002

## Objetivo
Crear la estructura completa del proyecto y implementar componentes base reutilizables siguiendo las convenciones establecidas.

## Criterios de Aceptación
- [ ] Estructura de carpetas completa creada
- [ ] Componentes base implementados (Layout, Button, Input)
- [ ] Context para estado global configurado
- [ ] Rutas principales configuradas
- [ ] Sistema de tipos TypeScript establecido
- [ ] Archivos default de Next.js removidos

## Pasos de Implementación

### 1. Crear Tipos Base
```typescript
// src/types/index.ts
export * from './anime';
export * from './session';
export * from './rating';
export * from './api';

// src/types/anime.ts
export interface Anime {
  id: string;
  title: string;
  synopsis: string;
  genre: string;
  year?: number;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AnimeSearchResult {
  id: string;
  title: string;
  synopsis: string;
  genre: string;
  year?: number;
  imageUrl?: string;
}

// src/types/session.ts
export interface Session {
  id: string;
  code: string;
  status: SessionStatus;
  phase: GamePhase;
  maxUsers: number;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
  users: SessionUser[];
}

export interface SessionUser {
  id: string;
  sessionId: string;
  userId: string;
  nickname: string;
  isReady: boolean;
  joinedAt: Date;
}

export enum SessionStatus {
  WAITING = 'WAITING',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  EXPIRED = 'EXPIRED'
}

export enum GamePhase {
  SELECTION = 'SELECTION',
  MATCHING = 'MATCHING',
  RATING = 'RATING',
  RESULTS = 'RESULTS'
}

// src/types/rating.ts
export interface Rating {
  id: string;
  sessionId: string;
  userId: string;
  animeId: string;
  question1: number;
  question2: number;
  question3: number;
  isSelfRating: boolean;
  createdAt: Date;
}

export interface RatingForm {
  animeId: string;
  question1: number;
  question2: number;
  question3: number;
}

// src/types/api.ts
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
```

### 2. Crear Context Global
```typescript
// src/contexts/SessionContext.tsx
'use client';

import { createContext, useContext, useReducer, ReactNode } from 'react';
import { Session, SessionUser, Anime, RatingForm, GamePhase } from '@/types';

interface SessionState {
  // Estado de sesión
  session: Session | null;
  currentUser: SessionUser | null;
  isConnected: boolean;
  
  // Estado del juego
  selectedAnimes: Anime[];
  selfRatings: RatingForm[];
  crossRatings: RatingForm[];
  
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
      return { ...state, session: action.payload };
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
```

### 3. Crear Componentes Base
```typescript
// src/components/ui/Button.tsx
import { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
}

export function Button({ 
  variant = 'primary', 
  size = 'md', 
  className, 
  children, 
  ...props 
}: ButtonProps) {
  const baseClasses = 'font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variants = {
    primary: 'bg-primary hover:bg-primary-dark text-white focus:ring-primary',
    secondary: 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 focus:ring-gray-500',
    success: 'bg-secondary hover:bg-secondary-dark text-white focus:ring-secondary',
    danger: 'bg-red-500 hover:bg-red-600 text-white focus:ring-red-500',
  };
  
  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-6 py-4 text-lg',
  };

  return (
    <button
      className={cn(baseClasses, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
}

// src/components/ui/Input.tsx
import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all',
            error && 'border-red-500 focus:ring-red-500',
            className
          )}
          {...props}
        />
        {error && (
          <p className="text-red-500 text-sm mt-1">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

// src/components/layout/Layout.tsx
import { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
```

### 4. Crear Utilidades
```typescript
// src/utils/index.ts
export * from './cn';
export * from './validation';
export * from './constants';

// src/utils/cn.ts
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// src/utils/constants.ts
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

export const RATING_SCALE = {
  MIN: 1,
  MAX: 4,
  GOLD_FILTER_THRESHOLD: 1
} as const;

export const SESSION_CONFIG = {
  MAX_USERS: 2,
  MAX_ANIME_SELECTIONS: 3,
  CODE_LENGTH: 6
} as const;

// src/utils/validation.ts
export function isValidRating(rating: number): boolean {
  return rating >= 1 && rating <= 4 && Number.isInteger(rating);
}

export function isValidSessionCode(code: string): boolean {
  return /^[A-Z0-9]{6}$/.test(code);
}

export function generateSessionCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
```

### 5. Instalar Dependencias Adicionales
```bash
npm install clsx tailwind-merge
npm install -D @types/react @types/react-dom
```

### 6. Configurar Rutas Principales
```typescript
// src/app/layout.tsx
import { Inter } from 'next/font/google';
import { SessionProvider } from '@/contexts/SessionContext';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'App Anime Conexión',
  description: 'Selección colaborativa de animes para ver en pareja',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}

// src/app/page.tsx
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';

export default function HomePage() {
  return (
    <Layout>
      <div className="text-center max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          App Anime Conexión
        </h1>
        <p className="text-gray-600 mb-8">
          Encuentra el anime perfecto para ver juntos
        </p>
        <div className="space-y-4">
          <Button className="w-full">
            Crear Nueva Sesión
          </Button>
          <Button variant="secondary" className="w-full">
            Unirse a Sesión
          </Button>
        </div>
      </div>
    </Layout>
  );
}
```

### 7. Crear Archivos Índice
```typescript
// src/components/index.ts
export * from './ui/Button';
export * from './ui/Input';
export * from './layout/Layout';

// src/hooks/index.ts
// Export placeholder for future hooks

// src/services/index.ts
// Export placeholder for future services
```

## Validación
- [ ] Página principal se renderiza correctamente
- [ ] Componentes Button e Input funcionan
- [ ] Context Provider no genera errores
- [ ] TypeScript compila sin errores
- [ ] Estilos de Tailwind se aplican correctamente

## Archivos a Crear/Modificar
- `src/types/*` (interfaces TypeScript)
- `src/contexts/SessionContext.tsx` (estado global)
- `src/components/ui/*` (componentes base)
- `src/components/layout/Layout.tsx` (layout principal)
- `src/utils/*` (utilidades y constantes)
- `src/app/layout.tsx` (layout raíz)
- `src/app/page.tsx` (página principal)

## Commit Final
```bash
git add .
git commit -m "feat: project structure and base components

- Create complete TypeScript interfaces and types
- Setup global SessionContext with reducer pattern
- Implement base UI components (Button, Input, Layout)
- Configure utility functions and constants
- Setup main page with basic navigation
- Create organized folder structure with index files"
```

## Notas Técnicas
- **Context + Reducer**: Patrón escalable para estado global
- **Compound Components**: Button e Input con variantes configurables
- **TypeScript Strict**: Interfaces bien definidas para type safety
- **Tailwind Utilities**: Función `cn` para merge de clases
- **Constants Centralizados**: Configuración del juego en un lugar