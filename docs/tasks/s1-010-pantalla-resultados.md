# S1-010: Pantalla de Resultados

**Sprint**: 1 | **Día**: 10 | **Duración**: 1 día  
**Prioridad**: Crítica | **Dependencias**: S1-008, S1-009

## Objetivo
Crear la pantalla final que muestra el anime ganador, el desglose de puntuaciones, análisis de resultados y opciones para iniciar una nueva sesión, completando así el flujo del juego.

## Criterios de Aceptación
- [ ] Componente ResultsDisplay mostrando anime ganador
- [ ] Desglose detallado de todas las puntuaciones
- [ ] Análisis de por qué ganó ese anime
- [ ] Manejo del caso sin ganador (filtro de oro)
- [ ] Opción para crear nueva sesión
- [ ] Compartir resultados (opcional)

## Pasos de Implementación

### 1. Crear Tipos para Resultados UI
```typescript
// src/types/results-ui.ts
import { GameResults, AnimeScore } from './results';

export interface ResultsDisplayData extends GameResults {
  sessionCode: string;
  users: Array<{
    nickname: string;
    userId: string;
  }>;
  winnerAnalysis?: {
    winningReason: string;
    strongestCategory: string;
    totalVotes: number;
    averageScore: number;
  };
}

export interface ScoreCardData {
  anime: AnimeScore['anime'];
  userRatings: Array<{
    nickname: string;
    isSelf: boolean;
    question1: number;
    question2: number;
    question3: number;
    total: number;
  }>;
  finalScore: number;
  passedGoldFilter: boolean;
  position: number;
}
```

### 2. Crear Service de Resultados
```typescript
// src/services/resultsService.ts
import { ApiResponse } from '@/types';
import { GameResults } from '@/types/results';

class ResultsService {
  private baseUrl = '/api/sessions';

  async getResults(sessionId: string): Promise<GameResults> {
    const response = await fetch(`${this.baseUrl}/${sessionId}/results`);
    
    const result: ApiResponse<GameResults> = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Error al obtener resultados');
    }

    return result.data!;
  }

  async createNewSession(userNickname: string) {
    const response = await fetch(`${this.baseUrl}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ nickname: userNickname }),
    });

    const result: ApiResponse = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Error al crear nueva sesión');
    }

    return result.data;
  }
}

export const resultsService = new ResultsService();
```

### 3. Crear Hook de Resultados
```typescript
// src/hooks/useGameResults.ts
import { useState, useEffect, useCallback } from 'react';
import { resultsService } from '@/services/resultsService';
import { GameResults } from '@/types/results';
import { ResultsDisplayData } from '@/types/results-ui';

export function useGameResults(sessionId: string) {
  const [results, setResults] = useState<ResultsDisplayData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadResults = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const gameResults = await resultsService.getResults(sessionId);
      
      // Enriquecer datos para UI
      const enrichedResults: ResultsDisplayData = {
        ...gameResults,
        sessionCode: 'ABC123', // Esto vendría de la sesión
        users: [], // Esto vendría de la sesión
        winnerAnalysis: gameResults.winner ? {
          winningReason: determineWinningReason(gameResults),
          strongestCategory: findStrongestCategory(gameResults.winner),
          totalVotes: gameResults.allScores.length,
          averageScore: Math.round(
            gameResults.allScores.reduce((sum, score) => sum + score.totalScore, 0) / 
            gameResults.allScores.length
          ),
        } : undefined,
      };
      
      setResults(enrichedResults);
      
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar resultados';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    loadResults();
  }, [loadResults]);

  return {
    results,
    isLoading,
    error,
    loadResults,
  };
}

function determineWinningReason(results: GameResults): string {
  if (results.hasDirectMatch) {
    return results.directMatches.length === 1 
      ? 'Coincidencia directa - ambos seleccionaron este anime'
      : 'Mayor puntuación entre las coincidencias directas';
  }
  return 'Mayor puntuación combinada en evaluación cruzada';
}

function findStrongestCategory(winner: GameResults['winner']): string {
  if (!winner) return '';
  
  const { breakdown } = winner;
  const categories = [
    { name: 'Potencial de Historia', score: breakdown.question1Total },
    { name: 'Mood Personal', score: breakdown.question2Total },
    { name: 'Impulso de Decisión', score: breakdown.question3Total },
  ];
  
  const strongest = categories.reduce((max, cat) => 
    cat.score > max.score ? cat : max
  );
  
  return strongest.name;
}
```

### 4. Crear Componente de Tarjeta de Puntuación
```typescript
// src/components/results/ScoreCard.tsx
'use client';

import { ScoreCardData } from '@/types/results-ui';
import { getScoreColor, getScoreGrade, formatScore } from '@/utils/game-helpers';
import { RATING_QUESTIONS } from '@/constants/gameConfig';

interface ScoreCardProps {
  scoreData: ScoreCardData;
  isWinner?: boolean;
  showDetailed?: boolean;
}

export function ScoreCard({ scoreData, isWinner = false, showDetailed = false }: ScoreCardProps) {
  const { anime, userRatings, finalScore, passedGoldFilter, position } = scoreData;

  return (
    <div className={`bg-white rounded-lg shadow-md border-2 p-6 ${
      isWinner ? 'border-yellow-400 bg-gradient-to-br from-yellow-50 to-white' : 'border-gray-200'
    }`}>
      {/* Header con posición */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <span className={`text-2xl font-bold ${
              position === 1 ? 'text-yellow-600' :
              position === 2 ? 'text-gray-500' :
              position === 3 ? 'text-amber-600' : 'text-gray-400'
            }`}>
              #{position}
            </span>
            {isWinner && (
              <span className="bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold">
                🏆 GANADOR
              </span>
            )}
          </div>
          
          <h3 className="text-xl font-bold text-gray-900 mb-1">{anime.title}</h3>
          <p className="text-sm text-gray-600 line-clamp-2">{anime.synopsis}</p>
        </div>

        {anime.imageUrl && (
          <img
            src={anime.imageUrl}
            alt={anime.title}
            className="w-20 h-24 object-cover rounded ml-4"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        )}
      </div>

      {/* Puntuación Final */}
      <div className="text-center mb-4">
        <div className={`text-4xl font-bold ${getScoreColor(finalScore)}`}>
          {formatScore(finalScore)}
        </div>
        <div className="text-sm text-gray-600">
          {getScoreGrade(finalScore)}
        </div>
        
        {!passedGoldFilter && (
          <div className="mt-2 text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
            ❌ Eliminado por Filtro de Oro
          </div>
        )}
      </div>

      {/* Desglose de Calificaciones */}
      {showDetailed && (
        <div className="border-t pt-4">
          <h4 className="font-semibold text-gray-900 mb-3">Desglose de Calificaciones</h4>
          
          {RATING_QUESTIONS.map((question, index) => {
            const questionKey = `question${index + 1}` as const;
            const totalForQuestion = userRatings.reduce(
              (sum, rating) => sum + rating[questionKey], 0
            );
            
            return (
              <div key={question.id} className="mb-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">{question.shortText}</span>
                  <span className="text-sm font-bold">{totalForQuestion}/8</span>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {userRatings.map((rating, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span className="text-gray-600">
                        {rating.nickname} {rating.isSelf ? '(auto)' : '(cruz)'}:
                      </span>
                      <span className="font-medium">
                        {rating[questionKey]}/4
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          
          <div className="border-t pt-2 mt-3">
            <div className="grid grid-cols-2 gap-2 text-sm">
              {userRatings.map((rating, idx) => (
                <div key={idx} className="flex justify-between">
                  <span className="text-gray-600">
                    Total {rating.nickname}:
                  </span>
                  <span className="font-bold">{rating.total}/12</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Géneros */}
      <div className="mt-4 pt-4 border-t">
        <div className="flex flex-wrap gap-1">
          {anime.genre.split(',').slice(0, 3).map((genre) => (
            <span
              key={genre}
              className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full"
            >
              {genre.trim()}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
```

### 5. Crear Componente Principal de Resultados
```typescript
// src/components/results/ResultsDisplay.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { ScoreCard } from './ScoreCard';
import { useGameResults } from '@/hooks/useGameResults';
import { useSession } from '@/contexts/SessionContext';
import { ScoreCardData } from '@/types/results-ui';
import { resultsService } from '@/services/resultsService';

interface ResultsDisplayProps {
  sessionId: string;
}

export function ResultsDisplay({ sessionId }: ResultsDisplayProps) {
  const router = useRouter();
  const { state, dispatch } = useSession();
  const { results, isLoading, error } = useGameResults(sessionId);
  const [showAllScores, setShowAllScores] = useState(false);
  const [isCreatingSession, setIsCreatingSession] = useState(false);

  const handleNewSession = async () => {
    if (!state.currentUser) return;
    
    try {
      setIsCreatingSession(true);
      const newSession = await resultsService.createNewSession(state.currentUser.nickname);
      
      dispatch({ type: 'RESET_SESSION' });
      router.push('/');
    } catch (err) {
      console.error('Error creating new session:', err);
    } finally {
      setIsCreatingSession(false);
    }
  };

  const handleShareResults = () => {
    if (!results) return;
    
    const shareText = results.winner 
      ? `🎉 ¡Encontramos nuestro anime! ${results.winner.anime.title} ganó con ${results.winner.totalScore}/24 puntos en App Anime Conexión`
      : '😅 No pudimos decidir un anime esta vez en App Anime Conexión';
    
    if (navigator.share) {
      navigator.share({
        title: 'Resultados de App Anime Conexión',
        text: shareText,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(shareText);
      alert('Resultados copiados al portapapeles');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Calculando resultados...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => router.push('/')} variant="secondary">
            Volver al Inicio
          </Button>
        </div>
      </div>
    );
  }

  if (!results) {
    return <div>No hay resultados disponibles</div>;
  }

  // Preparar datos para ScoreCards
  const scoreCardsData: ScoreCardData[] = results.allScores
    .sort((a, b) => b.totalScore - a.totalScore)
    .map((score, index) => ({
      anime: score.anime,
      userRatings: [
        {
          nickname: 'Usuario 1', // Esto vendría de la sesión
          isSelf: score.selfRating.userId === 'user1',
          question1: score.selfRating.question1,
          question2: score.selfRating.question2,
          question3: score.selfRating.question3,
          total: score.breakdown.selfTotal,
        },
        {
          nickname: 'Usuario 2', // Esto vendría de la sesión
          isSelf: score.crossRating.userId === 'user2',
          question1: score.crossRating.question1,
          question2: score.crossRating.question2,
          question3: score.crossRating.question3,
          total: score.breakdown.crossTotal,
        },
      ],
      finalScore: score.totalScore,
      passedGoldFilter: score.passesGoldFilter,
      position: index + 1,
    }));

  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* Header de Resultados */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">
          {results.winner ? '🎉 ¡Tenemos un Ganador!' : '😅 Sin Ganador'}
        </h1>
        
        {results.winner ? (
          <div className="mb-6">
            <p className="text-xl text-gray-600 mb-2">
              Su anime para esta noche es:
            </p>
            <h2 className="text-3xl font-bold text-primary mb-4">
              {results.winner.anime.title}
            </h2>
            
            {results.winnerAnalysis && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-w-2xl mx-auto">
                <p className="text-green-800 font-semibold mb-2">
                  ¿Por qué ganó?
                </p>
                <p className="text-green-700 text-sm">
                  {results.winnerAnalysis.winningReason}
                </p>
                <div className="grid grid-cols-2 gap-4 mt-3 text-xs">
                  <div>
                    <span className="text-green-600">Categoría más fuerte:</span>
                    <div className="font-semibold">{results.winnerAnalysis.strongestCategory}</div>
                  </div>
                  <div>
                    <span className="text-green-600">Puntuación promedio:</span>
                    <div className="font-semibold">{results.winnerAnalysis.averageScore}/24</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-2xl mx-auto mb-6">
            <p className="text-yellow-800 font-semibold mb-2">
              Ningún anime pasó el Filtro de Oro
            </p>
            <p className="text-yellow-700 text-sm">
              Todos los animes recibieron una puntuación de 1 en "Impulso de Decisión" 
              de al menos uno de ustedes. ¡Tal vez necesiten explorar más opciones!
            </p>
          </div>
        )}
      </div>

      {/* Ganador Destacado */}
      {results.winner && (
        <div className="mb-8">
          <ScoreCard
            scoreData={scoreCardsData[0]}
            isWinner={true}
            showDetailed={true}
          />
        </div>
      )}

      {/* Todas las Puntuaciones */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-bold">Todas las Puntuaciones</h3>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowAllScores(!showAllScores)}
          >
            {showAllScores ? 'Ocultar Detalles' : 'Ver Detalles'}
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {scoreCardsData.map((scoreData, index) => (
            <ScoreCard
              key={scoreData.anime.id}
              scoreData={scoreData}
              isWinner={index === 0 && results.winner !== null}
              showDetailed={showAllScores}
            />
          ))}
        </div>
      </div>

      {/* Estadísticas del Juego */}
      <div className="bg-gray-50 rounded-lg p-6 mb-8">
        <h3 className="text-xl font-bold mb-4">Estadísticas del Juego</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-primary">{results.allScores.length}</div>
            <div className="text-sm text-gray-600">Animes Evaluados</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-primary">
              {results.hasDirectMatch ? results.directMatches.length : 0}
            </div>
            <div className="text-sm text-gray-600">Coincidencias</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-primary">
              {results.allScores.filter(s => s.passesGoldFilter).length}
            </div>
            <div className="text-sm text-gray-600">Pasaron Filtro</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-primary">
              {Math.round(results.allScores.reduce((sum, s) => sum + s.totalScore, 0) / results.allScores.length)}
            </div>
            <div className="text-sm text-gray-600">Puntuación Media</div>
          </div>
        </div>
      </div>

      {/* Acciones */}
      <div className="text-center space-y-4 md:space-y-0 md:space-x-4 md:flex md:justify-center">
        <Button
          onClick={handleNewSession}
          disabled={isCreatingSession}
          size="lg"
          className="w-full md:w-auto"
        >
          {isCreatingSession ? 'Creando...' : '🔄 Nueva Sesión'}
        </Button>
        
        <Button
          onClick={handleShareResults}
          variant="secondary"
          size="lg"
          className="w-full md:w-auto"
        >
          📤 Compartir Resultados
        </Button>
        
        <Button
          onClick={() => router.push('/')}
          variant="secondary"
          size="lg"
          className="w-full md:w-auto"
        >
          🏠 Volver al Inicio
        </Button>
      </div>
    </div>
  );
}
```

### 6. Crear Página de Resultados
```typescript
// src/app/session/[id]/results/page.tsx
'use client';

import { useParams } from 'next/navigation';
import { Layout } from '@/components/layout/Layout';
import { ResultsDisplay } from '@/components/results/ResultsDisplay';

export default function ResultsPage() {
  const params = useParams();
  const sessionId = params.id as string;

  return (
    <Layout>
      <ResultsDisplay sessionId={sessionId} />
    </Layout>
  );
}
```

## Validación
- [ ] ResultsDisplay muestra anime ganador correctamente
- [ ] Desglose de puntuaciones es preciso y detallado
- [ ] Manejo del caso sin ganador funciona
- [ ] Opción de nueva sesión crea sesión correctamente
- [ ] Compartir resultados funciona en navegadores compatibles
- [ ] Navegación de regreso al inicio funciona

## Archivos a Crear
- `src/types/results-ui.ts` (tipos para UI de resultados)
- `src/services/resultsService.ts` (cliente API de resultados)
- `src/hooks/useGameResults.ts` (estado de resultados)
- `src/components/results/ScoreCard.tsx` (tarjeta de puntuación)
- `src/components/results/ResultsDisplay.tsx` (pantalla principal)
- `src/app/session/[id]/results/page.tsx` (página de resultados)

## Commit Final
```bash
git add .
git commit -m "feat: results display and game completion

- Create comprehensive ResultsDisplay component
- Implement detailed ScoreCard with breakdown analysis
- Add results service for API communication
- Create useGameResults hook for state management
- Handle winner announcement and no-winner scenarios
- Add game statistics and sharing functionality
- Include options for new session and navigation"
```

## Notas Técnicas
- **Rich UI**: Tarjetas detalladas con análisis completo de puntuaciones
- **Gold Filter Handling**: Manejo visual claro del filtro de oro
- **Progressive Disclosure**: Mostrar/ocultar detalles según necesidad
- **Social Sharing**: Integración con Web Share API y fallback
- **Analytics Ready**: Estructura preparada para métricas de juego