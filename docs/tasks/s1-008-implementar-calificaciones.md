# S1-008: Implementar Calificaciones

**Sprint**: 1 | **Día**: 9 | **Duración**: 1 día  
**Prioridad**: Crítica | **Dependencias**: S1-007

## Objetivo
Implementar el sistema de calificaciones cruzadas donde cada usuario califica los animes seleccionados por su compañero, completando así todos los datos necesarios para el cálculo final.

## Criterios de Aceptación
- [ ] API endpoints para calificaciones cruzadas funcionando
- [ ] Página de calificación con animes del compañero
- [ ] Validación de escala 1-4 en las 3 preguntas
- [ ] Prevención de calificar animes propios
- [ ] Transición automática a fase RESULTS al completar
- [ ] Estado de progreso visible para ambos usuarios

## Pasos de Implementación

### 1. Crear API de Calificaciones Cruzadas
```typescript
// src/app/api/sessions/[id]/ratings/route.ts
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { createErrorResponse, createSuccessResponse, AppError } from '@/lib/api-response';

const crossRatingSchema = z.object({
  userId: z.string(),
  ratings: z.array(z.object({
    animeId: z.string(),
    question1: z.number().min(1).max(4),
    question2: z.number().min(1).max(4),
    question3: z.number().min(1).max(4),
  })).min(1, 'Debes calificar al menos un anime'),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sessionId = params.id;
    const body = await request.json();
    
    // Validar datos de entrada
    const validatedData = crossRatingSchema.parse(body);
    
    // Verificar que la sesión existe y está en fase RATING
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: { 
        users: true,
        selections: {
          include: { anime: true }
        }
      },
    });

    if (!session) {
      throw new AppError('SESSION_NOT_FOUND', 'Sesión no encontrada', 404);
    }

    if (session.status !== 'ACTIVE') {
      throw new AppError('SESSION_NOT_ACTIVE', 'La sesión no está activa', 400);
    }

    if (session.phase !== 'RATING') {
      throw new AppError('WRONG_PHASE', 'No es la fase de calificación', 400);
    }

    // Verificar que el usuario pertenece a la sesión
    const userInSession = session.users.find(u => u.userId === validatedData.userId);
    if (!userInSession) {
      throw new AppError('USER_NOT_IN_SESSION', 'Usuario no pertenece a esta sesión', 403);
    }

    // Obtener animes que NO son del usuario (para calificación cruzada)
    const otherUserSelections = session.selections.filter(
      selection => selection.userId !== validatedData.userId
    );

    const otherUserAnimeIds = otherUserSelections.map(s => s.animeId);

    // Verificar que solo está calificando animes del otro usuario
    for (const rating of validatedData.ratings) {
      if (!otherUserAnimeIds.includes(rating.animeId)) {
        throw new AppError(
          'INVALID_ANIME_RATING', 
          'Solo puedes calificar animes seleccionados por tu compañero', 
          400
        );
      }
    }

    // Crear calificaciones cruzadas en transacción
    const result = await prisma.$transaction(async (tx) => {
      // Eliminar calificaciones cruzadas previas del usuario
      await tx.rating.deleteMany({
        where: {
          sessionId,
          userId: validatedData.userId,
          isSelfRating: false,
        },
      });

      // Crear nuevas calificaciones cruzadas
      const ratings = await Promise.all(
        validatedData.ratings.map(rating =>
          tx.rating.create({
            data: {
              sessionId,
              userId: validatedData.userId,
              animeId: rating.animeId,
              question1: rating.question1,
              question2: rating.question2,
              question3: rating.question3,
              isSelfRating: false,
            },
            include: { anime: true },
          })
        )
      );

      return ratings;
    });

    // Verificar si todos los usuarios han completado las calificaciones cruzadas
    const allCrossRatings = await prisma.rating.findMany({
      where: { 
        sessionId,
        isSelfRating: false,
      },
    });

    // Cada usuario debe calificar los animes del otro (3 animes por usuario contrario)
    const expectedCrossRatings = session.users.length * (session.selections.length / session.users.length);
    const allRatingsCompleted = allCrossRatings.length >= expectedCrossRatings;

    // Si todos completaron, cambiar a fase RESULTS
    if (allRatingsCompleted) {
      await prisma.session.update({
        where: { id: sessionId },
        data: { phase: 'RESULTS' },
      });
    }

    return createSuccessResponse({
      ratings: result,
      allRatingsCompleted,
      nextPhase: allRatingsCompleted ? 'RESULTS' : 'RATING',
      progress: {
        completed: allCrossRatings.length + validatedData.ratings.length,
        total: expectedCrossRatings,
      },
    });

  } catch (error) {
    return createErrorResponse(error);
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sessionId = params.id;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      throw new AppError('MISSING_USER_ID', 'User ID requerido', 400);
    }

    // Obtener animes para calificar (seleccionados por otros usuarios)
    const otherUserSelections = await prisma.selection.findMany({
      where: {
        sessionId,
        NOT: { userId },
      },
      include: { 
        anime: true,
        user: true,
      },
      orderBy: { orderNum: 'asc' },
    });

    // Obtener calificaciones cruzadas existentes del usuario
    const existingRatings = await prisma.rating.findMany({
      where: {
        sessionId,
        userId,
        isSelfRating: false,
      },
    });

    // Mapear calificaciones existentes por animeId
    const ratingsMap = existingRatings.reduce((map, rating) => {
      map[rating.animeId] = rating;
      return map;
    }, {} as Record<string, typeof existingRatings[0]>);

    return createSuccessResponse({
      animesToRate: otherUserSelections.map(selection => ({
        ...selection,
        existingRating: ratingsMap[selection.animeId] || null,
      })),
      completedRatings: existingRatings.length,
      totalRequired: otherUserSelections.length,
      isCompleted: existingRatings.length === otherUserSelections.length,
    });

  } catch (error) {
    return createErrorResponse(error);
  }
}
```

### 2. Crear Service de Calificaciones
```typescript
// src/services/ratingService.ts
import { ApiResponse } from '@/types';
import { AnimeRating } from './selectionService';

export interface CrossRatingRequest {
  userId: string;
  ratings: AnimeRating[];
}

export interface AnimeToRate {
  id: string;
  animeId: string;
  orderNum: number;
  userId: string;
  anime: {
    id: string;
    title: string;
    synopsis: string;
    genre: string;
    year?: number;
    imageUrl?: string;
  };
  user: {
    nickname: string;
  };
  existingRating?: {
    question1: number;
    question2: number;
    question3: number;
  } | null;
}

export interface RatingResponse {
  ratings: Array<{
    id: string;
    animeId: string;
    question1: number;
    question2: number;
    question3: number;
    anime: any;
  }>;
  allRatingsCompleted: boolean;
  nextPhase: string;
  progress: {
    completed: number;
    total: number;
  };
}

class RatingService {
  private baseUrl = '/api/sessions';

  async submitCrossRatings(
    sessionId: string, 
    data: CrossRatingRequest
  ): Promise<RatingResponse> {
    const response = await fetch(`${this.baseUrl}/${sessionId}/ratings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result: ApiResponse<RatingResponse> = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Error al enviar calificaciones');
    }

    return result.data!;
  }

  async getAnimesToRate(sessionId: string, userId: string) {
    const response = await fetch(
      `${this.baseUrl}/${sessionId}/ratings?userId=${userId}`
    );
    
    const result: ApiResponse = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Error al obtener animes para calificar');
    }

    return result.data;
  }
}

export const ratingService = new RatingService();
```

### 3. Crear Hook de Calificaciones Cruzadas
```typescript
// src/hooks/useCrossRating.ts
import { useState, useCallback, useEffect } from 'react';
import { AnimeRating } from '@/services/selectionService';
import { ratingService, AnimeToRate } from '@/services/ratingService';

export function useCrossRating(sessionId: string, userId: string) {
  const [animesToRate, setAnimesToRate] = useState<AnimeToRate[]>([]);
  const [ratings, setRatings] = useState<Record<string, AnimeRating>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState({ completed: 0, total: 0 });

  // Cargar animes a calificar
  const loadAnimesToRate = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await ratingService.getAnimesToRate(sessionId, userId);
      setAnimesToRate(data.animesToRate);
      setProgress({ completed: data.completedRatings, total: data.totalRequired });
      
      // Cargar calificaciones existentes
      const existingRatings: Record<string, AnimeRating> = {};
      data.animesToRate.forEach((anime: AnimeToRate) => {
        if (anime.existingRating) {
          existingRatings[anime.animeId] = {
            animeId: anime.animeId,
            ...anime.existingRating,
          };
        }
      });
      setRatings(existingRatings);
      
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar animes';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, userId]);

  useEffect(() => {
    loadAnimesToRate();
  }, [loadAnimesToRate]);

  const updateRating = useCallback((animeId: string, rating: AnimeRating) => {
    setRatings(current => ({
      ...current,
      [animeId]: rating,
    }));
  }, []);

  const submitRatings = useCallback(async () => {
    try {
      setIsSubmitting(true);
      setError(null);

      const ratingsArray = Object.values(ratings);
      
      if (ratingsArray.length === 0) {
        throw new Error('Debes calificar al menos un anime');
      }

      const result = await ratingService.submitCrossRatings(sessionId, {
        userId,
        ratings: ratingsArray,
      });

      setProgress(result.progress);
      
      return result;

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al enviar calificaciones';
      setError(message);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, [sessionId, userId, ratings]);

  const getRatedCount = useCallback(() => {
    return Object.keys(ratings).length;
  }, [ratings]);

  const isCompleted = getRatedCount() === animesToRate.length && animesToRate.length > 0;

  return {
    animesToRate,
    ratings,
    isLoading,
    isSubmitting,
    error,
    progress,
    isCompleted,
    updateRating,
    submitRatings,
    getRatedCount,
    loadAnimesToRate,
  };
}
```

### 4. Crear Página de Calificaciones Cruzadas
```typescript
// src/components/rating/CrossRatingPage.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { AnimeCard } from '@/components/game/AnimeCard';
import { RatingForm } from '@/components/selection/RatingForm';
import { useCrossRating } from '@/hooks/useCrossRating';
import { useSession } from '@/contexts/SessionContext';
import { AnimeToRate } from '@/services/ratingService';

export function CrossRatingPage() {
  const router = useRouter();
  const { state, dispatch } = useSession();
  const [ratingAnime, setRatingAnime] = useState<AnimeToRate | null>(null);

  const {
    animesToRate,
    ratings,
    isLoading,
    isSubmitting,
    error,
    progress,
    isCompleted,
    updateRating,
    submitRatings,
    getRatedCount,
  } = useCrossRating(
    state.session?.id || '',
    state.currentUser?.userId || ''
  );

  const handleRateAnime = (anime: AnimeToRate) => {
    setRatingAnime(anime);
  };

  const handleRatingSubmit = (rating: any) => {
    updateRating(rating.animeId, rating);
    setRatingAnime(null);
  };

  const handleSubmitAllRatings = async () => {
    if (!state.session) return;

    try {
      const result = await submitRatings();
      
      if (result.allRatingsCompleted) {
        dispatch({ type: 'SET_PHASE', payload: 'RESULTS' });
        router.push(`/session/${state.session.id}/results`);
      }
    } catch (err) {
      console.error('Error submitting ratings:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="text-center">
          <p>Cargando animes para calificar...</p>
        </div>
      </div>
    );
  }

  if (!state.session || !state.currentUser) {
    return <div>Error: No hay sesión activa</div>;
  }

  const otherUser = state.session.users?.find(
    user => user.userId !== state.currentUser?.userId
  );

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Califica los Animes</h1>
        <p className="text-gray-600 mb-4">
          Califica los animes seleccionados por {otherUser?.nickname || 'tu compañero'}
        </p>
        
        {/* Progreso */}
        <div className="bg-gray-200 rounded-full h-2 mb-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(getRatedCount() / animesToRate.length) * 100}%` }}
          />
        </div>
        <p className="text-sm text-gray-600">
          Progreso: {getRatedCount()}/{animesToRate.length} animes calificados
        </p>
      </div>

      {animesToRate.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No hay animes para calificar</p>
        </div>
      ) : (
        <>
          {/* Lista de Animes para Calificar */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {animesToRate.map((animeSelection) => (
              <div key={animeSelection.id} className="relative">
                <AnimeCard
                  anime={animeSelection.anime}
                  isSelected={!!ratings[animeSelection.animeId]}
                />
                
                <div className="mt-3">
                  <div className="text-xs text-gray-500 mb-2">
                    Seleccionado por {animeSelection.user.nickname} (#{animeSelection.orderNum})
                  </div>
                  
                  <Button
                    variant={ratings[animeSelection.animeId] ? 'success' : 'primary'}
                    onClick={() => handleRateAnime(animeSelection)}
                    className="w-full"
                    size="sm"
                  >
                    {ratings[animeSelection.animeId] ? '✓ Calificado' : 'Calificar'}
                  </Button>
                </div>

                {/* Indicador de calificación */}
                {ratings[animeSelection.animeId] && (
                  <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
                    ✓
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Información adicional */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">
              Instrucciones de Calificación
            </h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Califica cada anime en una escala del 1 al 4</li>
              <li>• Considera el potencial de la historia, tu mood actual y tu impulso de verlo</li>
              <li>• Puedes modificar tus calificaciones antes de enviar</li>
              <li>• Una vez enviadas, se calcularán los resultados finales</li>
            </ul>
          </div>

          {/* Errores */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Botones de acción */}
          <div className="text-center space-y-4">
            {getRatedCount() > 0 && (
              <Button
                onClick={handleSubmitAllRatings}
                disabled={isSubmitting}
                size="lg"
                className="px-8"
              >
                {isSubmitting ? 'Enviando...' : 
                 isCompleted ? 'Finalizar Calificaciones' : `Enviar Calificaciones (${getRatedCount()}/${animesToRate.length})`}
              </Button>
            )}

            {!isCompleted && getRatedCount() > 0 && (
              <p className="text-sm text-gray-600">
                Puedes enviar las calificaciones parcialmente y continuar después
              </p>
            )}
          </div>
        </>
      )}

      {/* Modal de Calificación */}
      {ratingAnime && (
        <RatingForm
          anime={ratingAnime.anime}
          initialRating={ratings[ratingAnime.animeId]}
          onSubmit={handleRatingSubmit}
          onCancel={() => setRatingAnime(null)}
        />
      )}
    </div>
  );
}
```

### 5. Crear Componente de Estado de Espera
```typescript
// src/components/rating/RatingWaitingRoom.tsx
'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useSession } from '@/contexts/SessionContext';

export function RatingWaitingRoom() {
  const { state } = useSession();
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    if (!state.session?.expiresAt) return;

    const interval = setInterval(() => {
      const now = new Date();
      const expires = new Date(state.session!.expiresAt);
      const diff = expires.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft('Expirada');
        clearInterval(interval);
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setTimeLeft(`${hours}h ${minutes}m`);
    }, 1000);

    return () => clearInterval(interval);
  }, [state.session?.expiresAt]);

  const otherUser = state.session?.users?.find(
    user => user.userId !== state.currentUser?.userId
  );

  return (
    <div className="max-w-md mx-auto text-center">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="mb-6">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            ⏳
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Esperando Calificaciones
          </h2>
          <p className="text-gray-600">
            {otherUser?.nickname || 'Tu compañero'} aún está calificando los animes
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Estado del Juego</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Tus selecciones:</span>
                <span className="text-green-600">✓ Completadas</span>
              </div>
              <div className="flex justify-between">
                <span>Tus calificaciones:</span>
                <span className="text-green-600">✓ Completadas</span>
              </div>
              <div className="flex justify-between">
                <span>Calificaciones de {otherUser?.nickname}:</span>
                <span className="text-yellow-600">⏳ En progreso</span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-1">¿Qué sigue?</h3>
            <p className="text-sm text-blue-800">
              Una vez que {otherUser?.nickname || 'tu compañero'} termine de calificar, 
              se calcularán automáticamente los resultados y podrán ver el anime ganador.
            </p>
          </div>

          {timeLeft && (
            <div className="text-xs text-gray-500">
              Sesión expira en: {timeLeft}
            </div>
          )}
        </div>

        <Button
          variant="secondary"
          onClick={() => window.location.reload()}
          className="w-full"
        >
          Actualizar Estado
        </Button>
      </div>
    </div>
  );
}
```

## Validación
- [ ] API acepta solo calificaciones de animes del otro usuario
- [ ] Validación de escala 1-4 en todas las preguntas
- [ ] Prevención de auto-calificación funciona
- [ ] Transición a RESULTS cuando ambos completan
- [ ] Estado de progreso se actualiza correctamente
- [ ] Manejo de calificaciones parciales funciona

## Archivos a Crear
- `src/app/api/sessions/[id]/ratings/route.ts` (API de calificaciones cruzadas)
- `src/services/ratingService.ts` (cliente API)
- `src/hooks/useCrossRating.ts` (estado de calificaciones)
- `src/components/rating/CrossRatingPage.tsx` (página de calificación)
- `src/components/rating/RatingWaitingRoom.tsx` (sala de espera)

## Commit Final
```bash
git add .
git commit -m "feat: anime rating system

- Implement cross-rating API with validation
- Create rating service for API communication
- Add useCrossRating hook for state management
- Build CrossRatingPage with progress tracking
- Create RatingWaitingRoom for pending state
- Handle automatic phase transition to RESULTS
- Add comprehensive validation for cross-ratings only"
```

## Notas Técnicas
- **Cross-Rating Only**: Validación estricta para calificar solo animes ajenos
- **Progress Tracking**: Seguimiento visual del progreso de calificación
- **Partial Submissions**: Permite envíos parciales de calificaciones
- **Auto Transition**: Cambio automático de fase al completar todos
- **Waiting States**: Manejo de estados de espera entre usuarios