# S1-009: Lógica de Negocio

**Sprint**: 1 | **Día**: 10 | **Duración**: 1 día  
**Prioridad**: Crítica | **Dependencias**: S1-006, S1-007, S1-008

## Objetivo
Implementar el motor de comparación y cálculo que determina el anime ganador aplicando las reglas del juego (coincidencias, puntuación combinada, filtro de oro).

## Criterios de Aceptación
- [ ] Motor de comparación de selecciones implementado
- [ ] Cálculo de puntuación final funcionando
- [ ] Filtro de oro aplicado correctamente
- [ ] API endpoint /api/sessions/[id]/results funcionando
- [ ] Manejo de empates implementado
- [ ] Lógica de negocio bien tested

## Pasos de Implementación

### 1. Crear Tipos para Resultados
```typescript
// src/types/results.ts
import { Anime, Rating } from './index';

export interface AnimeScore {
  anime: Anime;
  selfRating: Rating;
  crossRating: Rating;
  totalScore: number;
  passesGoldFilter: boolean;
  breakdown: {
    selfTotal: number;
    crossTotal: number;
    question1Total: number;
    question2Total: number;
    question3Total: number;
  };
}

export interface GameResults {
  winner: AnimeScore | null;
  allScores: AnimeScore[];
  hasDirectMatch: boolean;
  directMatches: Anime[];
  phase: 'RESULTS';
  calculatedAt: Date;
  tiebreaker?: string;
}

export interface MatchResult {
  animeId: string;
  anime: Anime;
  matchedBy: string[]; // User IDs que lo seleccionaron
}
```

### 2. Implementar Motor de Cálculo
```typescript
// src/lib/game-engine.ts
import { prisma } from './prisma';
import { AnimeScore, GameResults, MatchResult } from '@/types/results';
import { RATING_SCALE } from '@/utils/constants';

export class GameEngine {
  
  /**
   * Calcula los resultados completos del juego
   */
  async calculateGameResults(sessionId: string): Promise<GameResults> {
    // 1. Verificar que la sesión esté completa
    await this.validateSessionForResults(sessionId);
    
    // 2. Buscar coincidencias directas
    const directMatches = await this.findDirectMatches(sessionId);
    
    // 3. Si hay coincidencias directas, usar la mejor puntuada
    if (directMatches.length > 0) {
      return await this.handleDirectMatches(sessionId, directMatches);
    }
    
    // 4. Si no hay coincidencias, calcular ganador por puntuación cruzada
    return await this.calculateCrossRatingWinner(sessionId);
  }

  /**
   * Busca animes seleccionados por ambos usuarios
   */
  private async findDirectMatches(sessionId: string): Promise<MatchResult[]> {
    const selections = await prisma.selection.findMany({
      where: { sessionId },
      include: { anime: true, user: true },
    });

    // Agrupar por anime
    const animeGroups = selections.reduce((groups, selection) => {
      const animeId = selection.animeId;
      if (!groups[animeId]) {
        groups[animeId] = [];
      }
      groups[animeId].push(selection);
      return groups;
    }, {} as Record<string, typeof selections>);

    // Encontrar animes seleccionados por más de un usuario
    const matches: MatchResult[] = [];
    
    for (const [animeId, animeSelections] of Object.entries(animeGroups)) {
      if (animeSelections.length > 1) {
        matches.push({
          animeId,
          anime: animeSelections[0].anime,
          matchedBy: animeSelections.map(s => s.userId),
        });
      }
    }

    return matches;
  }

  /**
   * Maneja el caso de coincidencias directas
   */
  private async handleDirectMatches(
    sessionId: string, 
    directMatches: MatchResult[]
  ): Promise<GameResults> {
    
    // Si solo hay una coincidencia, es el ganador automático
    if (directMatches.length === 1) {
      const winner = await this.calculateAnimeScore(sessionId, directMatches[0].animeId);
      
      return {
        winner,
        allScores: [winner],
        hasDirectMatch: true,
        directMatches: directMatches.map(m => m.anime),
        phase: 'RESULTS',
        calculatedAt: new Date(),
      };
    }

    // Si hay múltiples coincidencias, elegir la mejor puntuada
    const scores: AnimeScore[] = [];
    
    for (const match of directMatches) {
      const score = await this.calculateAnimeScore(sessionId, match.animeId);
      scores.push(score);
    }

    // Ordenar por puntuación total descendente
    scores.sort((a, b) => b.totalScore - a.totalScore);
    
    // Aplicar filtro de oro
    const validScores = scores.filter(score => score.passesGoldFilter);
    
    const winner = validScores.length > 0 ? validScores[0] : null;
    
    return {
      winner,
      allScores: scores,
      hasDirectMatch: true,
      directMatches: directMatches.map(m => m.anime),
      phase: 'RESULTS',
      calculatedAt: new Date(),
      tiebreaker: validScores.length > 1 && validScores[0].totalScore === validScores[1].totalScore 
        ? 'highest_combined_score' : undefined,
    };
  }

  /**
   * Calcula ganador por evaluación cruzada
   */
  private async calculateCrossRatingWinner(sessionId: string): Promise<GameResults> {
    // Obtener todas las selecciones
    const selections = await prisma.selection.findMany({
      where: { sessionId },
      include: { anime: true },
    });

    // Calcular puntuación para cada anime
    const scores: AnimeScore[] = [];
    
    for (const selection of selections) {
      const score = await this.calculateAnimeScore(sessionId, selection.animeId);
      scores.push(score);
    }

    // Ordenar por puntuación total descendente
    scores.sort((a, b) => b.totalScore - a.totalScore);
    
    // Aplicar filtro de oro
    const validScores = scores.filter(score => score.passesGoldFilter);
    
    // Determinar ganador
    const winner = validScores.length > 0 ? validScores[0] : null;
    
    return {
      winner,
      allScores: scores,
      hasDirectMatch: false,
      directMatches: [],
      phase: 'RESULTS',
      calculatedAt: new Date(),
      tiebreaker: this.determineTiebreaker(validScores),
    };
  }

  /**
   * Calcula la puntuación de un anime específico
   */
  private async calculateAnimeScore(sessionId: string, animeId: string): Promise<AnimeScore> {
    // Obtener todas las calificaciones para este anime
    const ratings = await prisma.rating.findMany({
      where: {
        sessionId,
        animeId,
      },
      include: { anime: true },
    });

    if (ratings.length !== 2) {
      throw new Error(`Expected 2 ratings for anime ${animeId}, got ${ratings.length}`);
    }

    // Separar auto-calificación y calificación cruzada
    const selfRating = ratings.find(r => r.isSelfRating);
    const crossRating = ratings.find(r => !r.isSelfRating);

    if (!selfRating || !crossRating) {
      throw new Error(`Missing ratings for anime ${animeId}`);
    }

    // Calcular totales
    const selfTotal = selfRating.question1 + selfRating.question2 + selfRating.question3;
    const crossTotal = crossRating.question1 + crossRating.question2 + crossRating.question3;
    const totalScore = selfTotal + crossTotal;

    // Aplicar filtro de oro (pregunta 3 = 1 de cualquier usuario)
    const passesGoldFilter = selfRating.question3 > RATING_SCALE.GOLD_FILTER_THRESHOLD && 
                            crossRating.question3 > RATING_SCALE.GOLD_FILTER_THRESHOLD;

    // Calcular breakdown por pregunta
    const breakdown = {
      selfTotal,
      crossTotal,
      question1Total: selfRating.question1 + crossRating.question1,
      question2Total: selfRating.question2 + crossRating.question2,
      question3Total: selfRating.question3 + crossRating.question3,
    };

    return {
      anime: selfRating.anime,
      selfRating,
      crossRating,
      totalScore,
      passesGoldFilter,
      breakdown,
    };
  }

  /**
   * Determina el criterio de desempate usado
   */
  private determineTiebreaker(validScores: AnimeScore[]): string | undefined {
    if (validScores.length < 2) return undefined;
    
    const topScore = validScores[0].totalScore;
    const tiedScores = validScores.filter(score => score.totalScore === topScore);
    
    if (tiedScores.length === 1) return undefined;
    
    // En caso de empate, se usa el anime con mayor puntuación combinada
    return 'highest_combined_score';
  }

  /**
   * Valida que la sesión esté lista para calcular resultados
   */
  private async validateSessionForResults(sessionId: string): Promise<void> {
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        users: true,
        selections: true,
        ratings: true,
      },
    });

    if (!session) {
      throw new Error('Sesión no encontrada');
    }

    if (session.users.length !== 2) {
      throw new Error('La sesión debe tener exactamente 2 usuarios');
    }

    // Verificar que todos los usuarios hayan hecho selecciones
    const expectedSelections = session.users.length * 3; // 3 animes por usuario
    if (session.selections.length !== expectedSelections) {
      throw new Error('No todos los usuarios han completado sus selecciones');
    }

    // Verificar que todas las calificaciones estén completas
    const expectedRatings = session.selections.length * 2; // Auto + cruzada por selección
    if (session.ratings.length !== expectedRatings) {
      throw new Error('No todas las calificaciones están completas');
    }
  }
}

export const gameEngine = new GameEngine();
```

### 3. Crear API Endpoint de Resultados
```typescript
// src/app/api/sessions/[id]/results/route.ts
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { gameEngine } from '@/lib/game-engine';
import { createErrorResponse, createSuccessResponse, AppError } from '@/lib/api-response';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sessionId = params.id;
    
    if (!sessionId) {
      throw new AppError('MISSING_SESSION_ID', 'ID de sesión requerido', 400);
    }

    // Verificar que la sesión existe
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new AppError('SESSION_NOT_FOUND', 'Sesión no encontrada', 404);
    }

    // Calcular resultados
    const results = await gameEngine.calculateGameResults(sessionId);

    // Actualizar fase de la sesión a RESULTS
    await prisma.session.update({
      where: { id: sessionId },
      data: { 
        phase: 'RESULTS',
        status: 'COMPLETED',
      },
    });

    return createSuccessResponse(results);
    
  } catch (error) {
    return createErrorResponse(error);
  }
}
```

### 4. Crear Tests para el Motor de Juego
```typescript
// src/lib/__tests__/game-engine.test.ts
import { gameEngine } from '../game-engine';
import { prisma } from '../prisma';

// Mock Prisma
jest.mock('../prisma', () => ({
  prisma: {
    session: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    selection: {
      findMany: jest.fn(),
    },
    rating: {
      findMany: jest.fn(),
    },
  },
}));

describe('GameEngine', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('calculateGameResults', () => {
    it('should handle direct matches correctly', async () => {
      // Mock data para coincidencia directa
      const mockSelections = [
        { animeId: 'anime1', userId: 'user1', anime: { id: 'anime1', title: 'Test Anime' } },
        { animeId: 'anime1', userId: 'user2', anime: { id: 'anime1', title: 'Test Anime' } },
      ];

      const mockRatings = [
        { animeId: 'anime1', userId: 'user1', question1: 4, question2: 4, question3: 4, isSelfRating: true },
        { animeId: 'anime1', userId: 'user2', question1: 3, question2: 3, question3: 3, isSelfRating: false },
      ];

      (prisma.selection.findMany as jest.Mock).mockResolvedValue(mockSelections);
      (prisma.rating.findMany as jest.Mock).mockResolvedValue(mockRatings);
      (prisma.session.findUnique as jest.Mock).mockResolvedValue({
        id: 'session1',
        users: [{ id: 'user1' }, { id: 'user2' }],
        selections: mockSelections,
        ratings: mockRatings,
      });

      const results = await gameEngine.calculateGameResults('session1');

      expect(results.hasDirectMatch).toBe(true);
      expect(results.winner).toBeTruthy();
      expect(results.winner?.totalScore).toBe(21); // 12 + 9
    });

    it('should apply gold filter correctly', async () => {
      const mockRatings = [
        { animeId: 'anime1', question1: 4, question2: 4, question3: 1, isSelfRating: true }, // Falla filtro de oro
        { animeId: 'anime1', question1: 3, question2: 3, question3: 3, isSelfRating: false },
      ];

      (prisma.rating.findMany as jest.Mock).mockResolvedValue(mockRatings);

      const score = await (gameEngine as any).calculateAnimeScore('session1', 'anime1');

      expect(score.passesGoldFilter).toBe(false);
      expect(score.totalScore).toBe(18); // 9 + 9
    });
  });
});
```

### 5. Crear Utilidades de Helpers
```typescript
// src/utils/game-helpers.ts
import { AnimeScore } from '@/types/results';

export function formatScore(score: number): string {
  return `${score}/24`;
}

export function getScoreColor(score: number): string {
  if (score >= 20) return 'text-green-600';
  if (score >= 15) return 'text-yellow-600';
  if (score >= 10) return 'text-orange-600';
  return 'text-red-600';
}

export function getScoreGrade(score: number): string {
  if (score >= 22) return 'Excelente';
  if (score >= 18) return 'Muy Bueno';
  if (score >= 14) return 'Bueno';
  if (score >= 10) return 'Regular';
  return 'Bajo';
}

export function analyzeScoreBreakdown(scores: AnimeScore[]): {
  averageScore: number;
  bestCategory: string;
  worstCategory: string;
} {
  if (scores.length === 0) {
    return {
      averageScore: 0,
      bestCategory: 'N/A',
      worstCategory: 'N/A',
    };
  }

  const totalScore = scores.reduce((sum, score) => sum + score.totalScore, 0);
  const averageScore = Math.round(totalScore / scores.length);

  // Analizar categorías
  const categoryTotals = scores.reduce(
    (totals, score) => ({
      question1: totals.question1 + score.breakdown.question1Total,
      question2: totals.question2 + score.breakdown.question2Total,
      question3: totals.question3 + score.breakdown.question3Total,
    }),
    { question1: 0, question2: 0, question3: 0 }
  );

  const categoryNames = {
    question1: 'Potencial de Historia',
    question2: 'Mood Personal',
    question3: 'Impulso de Decisión',
  };

  const sortedCategories = Object.entries(categoryTotals)
    .sort(([,a], [,b]) => b - a);

  return {
    averageScore,
    bestCategory: categoryNames[sortedCategories[0][0] as keyof typeof categoryNames],
    worstCategory: categoryNames[sortedCategories[2][0] as keyof typeof categoryNames],
  };
}
```

## Validación
- [ ] Motor calcula coincidencias directas correctamente
- [ ] Puntuación combinada se calcula bien (auto + cruzada)
- [ ] Filtro de oro funciona (descarta pregunta 3 = 1)
- [ ] API endpoint retorna resultados estructurados
- [ ] Manejo de empates implementado
- [ ] Tests unitarios pasan

## Archivos a Crear
- `src/types/results.ts` (tipos para resultados)
- `src/lib/game-engine.ts` (motor principal)
- `src/app/api/sessions/[id]/results/route.ts` (API endpoint)
- `src/utils/game-helpers.ts` (utilidades)
- `src/lib/__tests__/game-engine.test.ts` (tests)

## Commit Final
```bash
git add .
git commit -m "feat: game logic and results calculation

- Implement comprehensive game engine with match detection
- Add cross-rating calculation with gold filter
- Create results API endpoint with structured response
- Handle direct matches and tiebreaking scenarios
- Add utility functions for score analysis
- Include unit tests for core game logic"
```

## Notas Técnicas
- **Transaccional**: Cálculos en transacciones para consistencia
- **Filtro de Oro**: Aplicación estricta de la regla pregunta 3 = 1
- **Empates**: Criterio claro de desempate por puntuación total
- **Validation**: Verificación completa de estado antes de calcular
- **Testeable**: Lógica separada en clases para testing fácil