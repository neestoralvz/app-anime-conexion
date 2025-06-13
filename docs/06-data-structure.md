# Estructura de Datos - App Anime Conexión

## Schema de Base de Datos

### Prisma Schema Completo

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"     // Desarrollo
  // provider = "postgresql" // Producción
  url      = env("DATABASE_URL")
}

model Anime {
  id          String   @id @default(cuid())
  title       String
  synopsis    String
  genre       String[]
  year        Int?
  imageUrl    String?  @map("image_url")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")
  
  // Relaciones
  selections  Selection[]
  ratings     Rating[]
  
  @@map("animes")
}

model Session {
  id          String      @id @default(cuid())
  code        String      @unique
  status      SessionStatus @default(WAITING)
  phase       GamePhase   @default(SELECTION)
  maxUsers    Int         @default(2)
  expiresAt   DateTime    @map("expires_at")
  createdAt   DateTime    @default(now()) @map("created_at")
  updatedAt   DateTime    @updatedAt @map("updated_at")
  
  // Relaciones
  users       SessionUser[]
  selections  Selection[]
  ratings     Rating[]
  
  @@map("sessions")
}

model SessionUser {
  id          String   @id @default(cuid())
  sessionId   String   @map("session_id")
  userId      String   @map("user_id")
  nickname    String
  isReady     Boolean  @default(false) @map("is_ready")
  joinedAt    DateTime @default(now()) @map("joined_at")
  
  // Relaciones
  session     Session    @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  selections  Selection[]
  ratings     Rating[]
  
  @@unique([sessionId, userId])
  @@map("session_users")
}

model Selection {
  id          String   @id @default(cuid())
  sessionId   String   @map("session_id")
  userId      String   @map("user_id")
  animeId     String   @map("anime_id")
  orderNum    Int      @map("order_num") // 1, 2, 3
  createdAt   DateTime @default(now()) @map("created_at")
  
  // Relaciones
  session     Session     @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  user        SessionUser @relation(fields: [sessionId, userId], references: [sessionId, userId], onDelete: Cascade)
  anime       Anime       @relation(fields: [animeId], references: [id])
  
  @@unique([sessionId, userId, orderNum])
  @@unique([sessionId, userId, animeId])
  @@map("selections")
}

model Rating {
  id          String   @id @default(cuid())
  sessionId   String   @map("session_id")
  userId      String   @map("user_id")
  animeId     String   @map("anime_id")
  question1   Int      @map("question_1") // 1-4: Potencial de historia
  question2   Int      @map("question_2") // 1-4: Mood personal
  question3   Int      @map("question_3") // 1-4: Impulso de decisión
  isSelfRating Boolean @map("is_self")    // true: auto-calificación, false: calificación cruzada
  createdAt   DateTime @default(now()) @map("created_at")
  
  // Relaciones
  session     Session     @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  user        SessionUser @relation(fields: [sessionId, userId], references: [sessionId, userId], onDelete: Cascade)
  anime       Anime       @relation(fields: [animeId], references: [id])
  
  @@unique([sessionId, userId, animeId, isSelfRating])
  @@map("ratings")
}

enum SessionStatus {
  WAITING     // Esperando usuarios
  ACTIVE      // Juego en progreso
  COMPLETED   // Terminado
  EXPIRED     // Expirado
}

enum GamePhase {
  SELECTION   // Fase 1: Selección secreta
  MATCHING    // Fase 2: Detección de coincidencias
  RATING      // Fase 3: Evaluación cruzada
  RESULTS     // Mostrar resultados
}
```

## Tipos TypeScript

### Frontend Types

```typescript
// src/types/anime.ts
export interface Anime {
  id: string;
  title: string;
  synopsis: string;
  genre: string[];
  year?: number;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AnimeSearchResult {
  id: string;
  title: string;
  synopsis: string;
  genre: string[];
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

export interface CreateSessionRequest {
  nickname: string;
}

export interface JoinSessionRequest {
  code: string;
  nickname: string;
}

export interface SessionResponse {
  session: Session;
  currentUser: SessionUser;
}

// src/types/selection.ts
export interface Selection {
  id: string;
  sessionId: string;
  userId: string;
  animeId: string;
  orderNum: number;
  createdAt: Date;
  anime: Anime;
}

export interface SelectionRequest {
  animeIds: string[]; // Array de 3 IDs
}

// src/types/rating.ts
export interface Rating {
  id: string;
  sessionId: string;
  userId: string;
  animeId: string;
  question1: number; // 1-4
  question2: number; // 1-4
  question3: number; // 1-4
  isSelfRating: boolean;
  createdAt: Date;
}

export interface RatingForm {
  animeId: string;
  question1: number;
  question2: number;
  question3: number;
}

export interface RatingRequest {
  ratings: RatingForm[];
}

// src/types/results.ts
export interface AnimeScore {
  anime: Anime;
  selfRating: Rating;
  crossRating: Rating;
  totalScore: number;
  passesGoldFilter: boolean;
}

export interface GameResults {
  winner: AnimeScore;
  allScores: AnimeScore[];
  hasDirectMatch: boolean;
  directMatches: Anime[];
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
```

### API Response Types

```typescript
// src/types/api.ts
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Respuestas específicas
export interface AnimeSearchResponse extends ApiResponse<AnimeSearchResult[]> {}
export interface SessionCreateResponse extends ApiResponse<SessionResponse> {}
export interface SessionJoinResponse extends ApiResponse<SessionResponse> {}
export interface SelectionResponse extends ApiResponse<Selection[]> {}
export interface RatingResponse extends ApiResponse<Rating[]> {}
export interface ResultsResponse extends ApiResponse<GameResults> {}
```

## Estructura de Estado (Frontend)

### Context State

```typescript
// src/contexts/SessionContext.tsx
export interface SessionState {
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

export interface SessionActions {
  // Acciones de sesión
  createSession: (nickname: string) => Promise<void>;
  joinSession: (code: string, nickname: string) => Promise<void>;
  leaveSession: () => void;
  
  // Acciones de selección
  selectAnime: (anime: Anime) => void;
  removeAnime: (animeId: string) => void;
  submitSelections: () => Promise<void>;
  
  // Acciones de calificación
  updateSelfRating: (animeId: string, ratings: Partial<RatingForm>) => void;
  updateCrossRating: (animeId: string, ratings: Partial<RatingForm>) => void;
  submitRatings: (isSelf: boolean) => Promise<void>;
  
  // Acciones de UI
  setError: (error: string | null) => void;
  clearError: () => void;
}
```

### Local Storage Structure

```typescript
// src/types/storage.ts
export interface StoredSession {
  sessionId: string;
  sessionCode: string;
  userId: string;
  nickname: string;
  timestamp: number;
}

export interface StoredAnimeCache {
  query: string;
  results: AnimeSearchResult[];
  timestamp: number;
  ttl: number; // Time to live in ms
}

// Keys para localStorage
export const STORAGE_KEYS = {
  CURRENT_SESSION: 'anime-connection-session',
  ANIME_CACHE: 'anime-connection-cache',
  USER_PREFERENCES: 'anime-connection-preferences'
} as const;
```

## Validaciones

### Zod Schemas

```typescript
// src/validations/schemas.ts
import { z } from 'zod';

export const CreateSessionSchema = z.object({
  nickname: z.string()
    .min(2, 'Nickname debe tener al menos 2 caracteres')
    .max(20, 'Nickname no puede exceder 20 caracteres')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Solo letras, números, guiones y guiones bajos')
});

export const JoinSessionSchema = z.object({
  code: z.string()
    .length(6, 'El código debe tener 6 caracteres')
    .regex(/^[A-Z0-9]+$/, 'Código inválido'),
  nickname: z.string()
    .min(2, 'Nickname debe tener al menos 2 caracteres')
    .max(20, 'Nickname no puede exceder 20 caracteres')
});

export const SelectionSchema = z.object({
  animeIds: z.array(z.string().cuid())
    .length(3, 'Debes seleccionar exactamente 3 animes')
});

export const RatingSchema = z.object({
  animeId: z.string().cuid(),
  question1: z.number().int().min(1).max(4),
  question2: z.number().int().min(1).max(4),
  question3: z.number().int().min(1).max(4)
});

export const RatingRequestSchema = z.object({
  ratings: z.array(RatingSchema)
    .min(1, 'Debes calificar al menos un anime')
    .max(3, 'No puedes calificar más de 3 animes')
});

export const AnimeSearchSchema = z.object({
  query: z.string().min(1, 'La búsqueda no puede estar vacía').max(100),
  limit: z.number().int().min(1).max(50).optional().default(10),
  offset: z.number().int().min(0).optional().default(0)
});
```

## Índices de Base de Datos

### Índices Recomendados

```sql
-- Índices para performance
CREATE INDEX idx_sessions_code ON sessions(code);
CREATE INDEX idx_sessions_status ON sessions(status);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);

CREATE INDEX idx_session_users_session_id ON session_users(session_id);
CREATE INDEX idx_session_users_user_id ON session_users(user_id);

CREATE INDEX idx_selections_session_user ON selections(session_id, user_id);
CREATE INDEX idx_selections_anime_id ON selections(anime_id);

CREATE INDEX idx_ratings_session_user ON ratings(session_id, user_id);
CREATE INDEX idx_ratings_anime_id ON ratings(anime_id);
CREATE INDEX idx_ratings_is_self ON ratings(is_self);

CREATE INDEX idx_animes_title ON animes(title);
-- Para búsqueda full-text (PostgreSQL)
CREATE INDEX idx_animes_title_fts ON animes USING gin(to_tsvector('english', title));
CREATE INDEX idx_animes_synopsis_fts ON animes USING gin(to_tsvector('english', synopsis));
```

## Consideraciones de Performance

### Cache Strategy
```typescript
// Cache en memoria para sesiones activas
interface SessionCache {
  [sessionId: string]: {
    session: Session;
    users: SessionUser[];
    lastActivity: number;
    ttl: number;
  };
}

// Cache de consultas de anime
interface AnimeQueryCache {
  [queryHash: string]: {
    results: AnimeSearchResult[];
    timestamp: number;
    ttl: number;
  };
}
```

### Optimizaciones de Query
- **Eager Loading**: Cargar relaciones necesarias en una consulta
- **Pagination**: Limitar resultados de búsqueda de animes
- **Connection Pooling**: Para PostgreSQL en producción
- **Query Batching**: Agrupar consultas relacionadas

### Limpieza de Datos
```typescript
// Cron jobs para limpieza
interface DataCleanupTasks {
  expiredSessions: () => Promise<void>; // Cada hora
  oldRatings: () => Promise<void>;      // Cada día
  animeCache: () => Promise<void>;      // Cada semana
}
```

Esta estructura de datos está diseñada para ser:
- **Simple**: Relaciones claras y directas
- **Escalable**: Índices apropiados y estructura normalizada
- **Type-Safe**: TypeScript en todo el stack
- **Performante**: Cache strategy y optimizaciones incluidas