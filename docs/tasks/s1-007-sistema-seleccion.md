# S1-007: Sistema de Selección

**Sprint**: 1 | **Día**: 8 | **Duración**: 1 día  
**Prioridad**: Crítica | **Dependencias**: S1-005, S1-006

## Objetivo
Implementar el sistema que permite a los usuarios seleccionar exactamente 3 animes y realizar auto-calificaciones, manejando el estado de selección y la navegación entre fases.

## Criterios de Aceptación
- [ ] API endpoint POST /api/sessions/[id]/selections funcionando
- [ ] Página de selección con búsqueda integrada
- [ ] Validación de exactamente 3 animes seleccionados
- [ ] Auto-calificación con 3 preguntas (escala 1-4)
- [ ] Estado local de selecciones sincronizado
- [ ] Transición automática cuando ambos usuarios completan

## Pasos de Implementación

### 1. Crear API de Selecciones
```typescript
// src/app/api/sessions/[id]/selections/route.ts
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { createErrorResponse, createSuccessResponse, AppError } from '@/lib/api-response';

const selectionSchema = z.object({
  userId: z.string(),
  animeSelections: z.array(z.object({
    animeId: z.string(),
    orderNum: z.number().min(1).max(3),
  })).length(3, 'Debes seleccionar exactamente 3 animes'),
  ratings: z.array(z.object({
    animeId: z.string(),
    question1: z.number().min(1).max(4),
    question2: z.number().min(1).max(4),
    question3: z.number().min(1).max(4),
  })).length(3, 'Debes calificar los 3 animes'),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sessionId = params.id;
    const body = await request.json();
    
    // Validar datos de entrada
    const validatedData = selectionSchema.parse(body);
    
    // Verificar que la sesión existe y está activa
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: { users: true },
    });

    if (!session) {
      throw new AppError('SESSION_NOT_FOUND', 'Sesión no encontrada', 404);
    }

    if (session.status !== 'ACTIVE') {
      throw new AppError('SESSION_NOT_ACTIVE', 'La sesión no está activa', 400);
    }

    if (session.phase !== 'SELECTION') {
      throw new AppError('WRONG_PHASE', 'No es la fase de selección', 400);
    }

    // Verificar que el usuario pertenece a la sesión
    const userInSession = session.users.find(u => u.userId === validatedData.userId);
    if (!userInSession) {
      throw new AppError('USER_NOT_IN_SESSION', 'Usuario no pertenece a esta sesión', 403);
    }

    // Verificar que los animes existen
    const animeIds = validatedData.animeSelections.map(s => s.animeId);
    const animes = await prisma.anime.findMany({
      where: { id: { in: animeIds } },
    });

    if (animes.length !== 3) {
      throw new AppError('INVALID_ANIMES', 'Algunos animes no existen', 400);
    }

    // Verificar que no hay duplicados
    const uniqueAnimeIds = new Set(animeIds);
    if (uniqueAnimeIds.size !== 3) {
      throw new AppError('DUPLICATE_ANIMES', 'No puedes seleccionar el mismo anime varias veces', 400);
    }

    // Crear selecciones y calificaciones en transacción
    const result = await prisma.$transaction(async (tx) => {
      // Eliminar selecciones y calificaciones previas del usuario
      await tx.rating.deleteMany({
        where: {
          sessionId,
          userId: validatedData.userId,
          isSelfRating: true,
        },
      });

      await tx.selection.deleteMany({
        where: {
          sessionId,
          userId: validatedData.userId,
        },
      });

      // Crear nuevas selecciones
      const selections = await Promise.all(
        validatedData.animeSelections.map(selection =>
          tx.selection.create({
            data: {
              sessionId,
              userId: validatedData.userId,
              animeId: selection.animeId,
              orderNum: selection.orderNum,
            },
            include: { anime: true },
          })
        )
      );

      // Crear auto-calificaciones
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
              isSelfRating: true,
            },
          })
        )
      );

      return { selections, ratings };
    });

    // Verificar si todos los usuarios han completado sus selecciones
    const allSelections = await prisma.selection.findMany({
      where: { sessionId },
      include: { user: true },
    });

    const userSelectionCounts = allSelections.reduce((counts, selection) => {
      counts[selection.userId] = (counts[selection.userId] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);

    const allUsersCompleted = session.users.every(user => 
      userSelectionCounts[user.userId] === 3
    );

    // Si todos completaron, cambiar a fase MATCHING
    if (allUsersCompleted) {
      await prisma.session.update({
        where: { id: sessionId },
        data: { phase: 'MATCHING' },
      });
    }

    return createSuccessResponse({
      selections: result.selections,
      ratings: result.ratings,
      allUsersCompleted,
      nextPhase: allUsersCompleted ? 'MATCHING' : 'SELECTION',
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

    // Obtener selecciones del usuario
    const selections = await prisma.selection.findMany({
      where: {
        sessionId,
        userId,
      },
      include: { anime: true },
      orderBy: { orderNum: 'asc' },
    });

    // Obtener auto-calificaciones
    const ratings = await prisma.rating.findMany({
      where: {
        sessionId,
        userId,
        isSelfRating: true,
      },
    });

    return createSuccessResponse({
      selections,
      ratings,
      isCompleted: selections.length === 3 && ratings.length === 3,
    });

  } catch (error) {
    return createErrorResponse(error);
  }
}
```

### 2. Crear Service de Selecciones
```typescript
// src/services/selectionService.ts
import { ApiResponse } from '@/types';
import { AnimeSearchResult } from './animeService';

export interface AnimeSelection {
  animeId: string;
  orderNum: number;
}

export interface AnimeRating {
  animeId: string;
  question1: number;
  question2: number;
  question3: number;
}

export interface SubmitSelectionsRequest {
  userId: string;
  animeSelections: AnimeSelection[];
  ratings: AnimeRating[];
}

export interface SelectionResponse {
  selections: Array<{
    id: string;
    animeId: string;
    orderNum: number;
    anime: AnimeSearchResult;
  }>;
  ratings: Array<{
    id: string;
    animeId: string;
    question1: number;
    question2: number;
    question3: number;
    isSelfRating: boolean;
  }>;
  allUsersCompleted: boolean;
  nextPhase: string;
}

class SelectionService {
  private baseUrl = '/api/sessions';

  async submitSelections(
    sessionId: string, 
    data: SubmitSelectionsRequest
  ): Promise<SelectionResponse> {
    const response = await fetch(`${this.baseUrl}/${sessionId}/selections`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result: ApiResponse<SelectionResponse> = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Error al enviar selecciones');
    }

    return result.data!;
  }

  async getUserSelections(sessionId: string, userId: string) {
    const response = await fetch(
      `${this.baseUrl}/${sessionId}/selections?userId=${userId}`
    );
    
    const result: ApiResponse = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Error al obtener selecciones');
    }

    return result.data;
  }
}

export const selectionService = new SelectionService();
```

### 3. Crear Hook de Selección
```typescript
// src/hooks/useAnimeSelection.ts
import { useState, useCallback } from 'react';
import { AnimeSearchResult } from '@/services/animeService';
import { AnimeRating, selectionService } from '@/services/selectionService';

export interface SelectedAnime extends AnimeSearchResult {
  orderNum: number;
  rating?: AnimeRating;
}

export function useAnimeSelection() {
  const [selectedAnimes, setSelectedAnimes] = useState<SelectedAnime[]>([]);
  const [ratings, setRatings] = useState<Record<string, AnimeRating>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addAnime = useCallback((anime: AnimeSearchResult) => {
    setSelectedAnimes(current => {
      if (current.length >= 3) {
        return current;
      }
      
      if (current.some(selected => selected.id === anime.id)) {
        return current;
      }

      const newAnime: SelectedAnime = {
        ...anime,
        orderNum: current.length + 1,
      };

      return [...current, newAnime];
    });
  }, []);

  const removeAnime = useCallback((animeId: string) => {
    setSelectedAnimes(current => {
      const filtered = current.filter(anime => anime.id !== animeId);
      // Reordenar números
      return filtered.map((anime, index) => ({
        ...anime,
        orderNum: index + 1,
      }));
    });

    setRatings(current => {
      const updated = { ...current };
      delete updated[animeId];
      return updated;
    });
  }, []);

  const updateRating = useCallback((animeId: string, rating: AnimeRating) => {
    setRatings(current => ({
      ...current,
      [animeId]: rating,
    }));
  }, []);

  const submitSelections = useCallback(async (sessionId: string, userId: string) => {
    try {
      setIsSubmitting(true);
      setError(null);

      if (selectedAnimes.length !== 3) {
        throw new Error('Debes seleccionar exactamente 3 animes');
      }

      const missingRatings = selectedAnimes.filter(anime => !ratings[anime.id]);
      if (missingRatings.length > 0) {
        throw new Error('Debes calificar todos los animes seleccionados');
      }

      const animeSelections = selectedAnimes.map(anime => ({
        animeId: anime.id,
        orderNum: anime.orderNum,
      }));

      const animeRatings = selectedAnimes.map(anime => ({
        animeId: anime.id,
        ...ratings[anime.id],
      }));

      const result = await selectionService.submitSelections(sessionId, {
        userId,
        animeSelections,
        ratings: animeRatings,
      });

      return result;

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al enviar selecciones';
      setError(message);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedAnimes, ratings]);

  const canSubmit = selectedAnimes.length === 3 && 
    selectedAnimes.every(anime => ratings[anime.id]);

  return {
    selectedAnimes,
    ratings,
    isSubmitting,
    error,
    canSubmit,
    addAnime,
    removeAnime,
    updateRating,
    submitSelections,
  };
}
```

### 4. Crear Componente de Calificación
```typescript
// src/components/selection/RatingForm.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { RatingStars } from '@/components/game/RatingStars';
import { RATING_QUESTIONS } from '@/constants/gameConfig';
import { AnimeRating } from '@/services/selectionService';
import { AnimeSearchResult } from '@/services/animeService';

interface RatingFormProps {
  anime: AnimeSearchResult;
  initialRating?: AnimeRating;
  onSubmit: (rating: AnimeRating) => void;
  onCancel: () => void;
}

export function RatingForm({ anime, initialRating, onSubmit, onCancel }: RatingFormProps) {
  const [rating, setRating] = useState<AnimeRating>(
    initialRating || {
      animeId: anime.id,
      question1: 1,
      question2: 1,
      question3: 1,
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(rating);
  };

  const updateQuestion = (questionKey: keyof Omit<AnimeRating, 'animeId'>, value: number) => {
    setRating(prev => ({
      ...prev,
      [questionKey]: value,
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">Califica: {anime.title}</h2>
          <p className="text-gray-600 text-sm">{anime.synopsis}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {RATING_QUESTIONS.map((question, index) => {
            const questionKey = `question${index + 1}` as keyof Omit<AnimeRating, 'animeId'>;
            
            return (
              <div key={question.id} className="space-y-3">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {question.shortText}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    {question.text}
                  </p>
                </div>
                
                <RatingStars
                  value={rating[questionKey]}
                  onChange={(value) => updateQuestion(questionKey, value)}
                  size="lg"
                />
                
                <div className="text-xs text-gray-500">
                  {rating[questionKey]}/4 - {
                    rating[questionKey] === 1 ? 'Muy bajo' :
                    rating[questionKey] === 2 ? 'Bajo' :
                    rating[questionKey] === 3 ? 'Alto' : 'Muy alto'
                  }
                </div>
              </div>
            );
          })}

          <div className="flex space-x-3 pt-4 border-t">
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1"
            >
              Guardar Calificación
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
```

### 5. Crear Página de Selección
```typescript
// src/components/selection/AnimeSelectionPage.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { AnimeSearch } from '@/components/anime/AnimeSearch';
import { AnimeCard } from '@/components/game/AnimeCard';
import { RatingForm } from './RatingForm';
import { useAnimeSelection } from '@/hooks/useAnimeSelection';
import { useSession } from '@/contexts/SessionContext';
import { AnimeSearchResult } from '@/services/animeService';

export function AnimeSelectionPage() {
  const router = useRouter();
  const { state, dispatch } = useSession();
  const {
    selectedAnimes,
    ratings,
    isSubmitting,
    error,
    canSubmit,
    addAnime,
    removeAnime,
    updateRating,
    submitSelections,
  } = useAnimeSelection();

  const [ratingAnime, setRatingAnime] = useState<AnimeSearchResult | null>(null);

  const handleAnimeSelect = (anime: AnimeSearchResult) => {
    if (selectedAnimes.length < 3) {
      addAnime(anime);
    }
  };

  const handleRateAnime = (anime: AnimeSearchResult) => {
    setRatingAnime(anime);
  };

  const handleRatingSubmit = (rating: any) => {
    updateRating(rating.animeId, rating);
    setRatingAnime(null);
  };

  const handleSubmitSelections = async () => {
    if (!state.session || !state.currentUser) return;

    try {
      const result = await submitSelections(state.session.id, state.currentUser.userId);
      
      if (result.allUsersCompleted) {
        dispatch({ type: 'SET_PHASE', payload: 'MATCHING' });
        router.push(`/session/${state.session.id}/matching`);
      } else {
        // Mostrar mensaje de espera
        dispatch({ type: 'SET_PHASE', payload: 'SELECTION' });
      }
    } catch (err) {
      console.error('Error submitting selections:', err);
    }
  };

  if (!state.session || !state.currentUser) {
    return <div>Error: No hay sesión activa</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Selecciona tus Animes</h1>
        <p className="text-gray-600">
          Elige exactamente 3 animes y califícalos. Selección {selectedAnimes.length}/3
        </p>
      </div>

      {/* Animes Seleccionados */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Tus Selecciones</h2>
        {selectedAnimes.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No has seleccionado ningún anime aún</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {selectedAnimes.map((anime, index) => (
              <div key={anime.id} className="relative">
                <AnimeCard
                  anime={anime}
                  isSelected={true}
                />
                
                <div className="mt-2 flex space-x-2">
                  <Button
                    size="sm"
                    variant={ratings[anime.id] ? 'success' : 'secondary'}
                    onClick={() => handleRateAnime(anime)}
                    className="flex-1"
                  >
                    {ratings[anime.id] ? '✓ Calificado' : 'Calificar'}
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => removeAnime(anime.id)}
                  >
                    ✕
                  </Button>
                </div>
                
                <div className="absolute top-2 left-2 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Búsqueda */}
      {selectedAnimes.length < 3 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Buscar Animes</h2>
          <AnimeSearch
            onAnimeSelect={handleAnimeSelect}
            selectedAnimes={selectedAnimes.map(a => a.id)}
            placeholder="Busca animes para agregar a tu selección..."
          />
        </div>
      )}

      {/* Botón de envío */}
      {selectedAnimes.length === 3 && (
        <div className="text-center">
          {!canSubmit && (
            <p className="text-amber-600 mb-4">
              Debes calificar todos los animes antes de continuar
            </p>
          )}
          
          {error && (
            <p className="text-red-600 mb-4">{error}</p>
          )}
          
          <Button
            onClick={handleSubmitSelections}
            disabled={!canSubmit || isSubmitting}
            size="lg"
            className="px-8"
          >
            {isSubmitting ? 'Enviando...' : 'Confirmar Selecciones'}
          </Button>
        </div>
      )}

      {/* Modal de Calificación */}
      {ratingAnime && (
        <RatingForm
          anime={ratingAnime}
          initialRating={ratings[ratingAnime.id]}
          onSubmit={handleRatingSubmit}
          onCancel={() => setRatingAnime(null)}
        />
      )}
    </div>
  );
}
```

## Validación
- [ ] API acepta exactamente 3 selecciones y 3 calificaciones
- [ ] Validación de usuarios pertenecientes a la sesión
- [ ] Auto-calificaciones se guardan correctamente
- [ ] Transición automática cuando ambos usuarios completan
- [ ] Estado de selección se mantiene en la UI
- [ ] Manejo de errores muestra mensajes apropiados

## Archivos a Crear
- `src/app/api/sessions/[id]/selections/route.ts` (API de selecciones)
- `src/services/selectionService.ts` (cliente API)
- `src/hooks/useAnimeSelection.ts` (estado de selección)
- `src/components/selection/RatingForm.tsx` (formulario de calificación)
- `src/components/selection/AnimeSelectionPage.tsx` (página principal)

## Commit Final
```bash
git add .
git commit -m "feat: anime selection system

- Implement selection API with validation for exactly 3 animes
- Create selection service with rating submission
- Add useAnimeSelection hook for state management
- Create RatingForm component with 1-4 scale questions
- Build AnimeSelectionPage with search integration
- Handle automatic phase transition when both users complete
- Add comprehensive validation and error handling"
```

## Notas Técnicas
- **Atomic Operations**: Transacciones para consistencia de datos
- **Order Management**: Sistema de numeración automática
- **Phase Transitions**: Cambio automático de fase al completar
- **Rating Validation**: Validación estricta de escala 1-4
- **State Synchronization**: Estado local sincronizado con servidor