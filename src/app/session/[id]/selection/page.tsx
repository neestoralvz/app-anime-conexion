'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Layout, PageHeader } from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { AnimeSearch } from '@/components/demo/AnimeSearch';
import { AnimeCard } from '@/components/game/AnimeCard';
import { RatingStars } from '@/components/game/RatingStars';
// import { useSession } from '@/contexts/SessionContext';
import { AnimeSearchResult } from '@/services/mockAnimeService';
import { RATING_QUESTIONS } from '@/constants/gameConfig';

interface SelectedAnime extends AnimeSearchResult {
  rating?: {
    question1: number;
    question2: number;
    question3: number;
  };
}

export default function SelectionPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;
  // const { state } = useSession();
  
  const [selectedAnimes, setSelectedAnimes] = useState<SelectedAnime[]>([]);
  const [currentStep, setCurrentStep] = useState<'select' | 'rate'>('select');
  const [ratings, setRatings] = useState<Record<string, any>>({});

  const handleAnimeSelect = (anime: AnimeSearchResult) => {
    if (selectedAnimes.length >= 3) return;
    
    if (!selectedAnimes.some(selected => selected.id === anime.id)) {
      setSelectedAnimes([...selectedAnimes, anime]);
    }
  };

  const handleAnimeRemove = (animeId: string) => {
    setSelectedAnimes(selectedAnimes.filter(anime => anime.id !== animeId));
    const newRatings = { ...ratings };
    delete newRatings[animeId];
    setRatings(newRatings);
  };

  const handleRatingChange = (animeId: string, questionKey: string, value: number) => {
    setRatings(prev => ({
      ...prev,
      [animeId]: {
        ...prev[animeId],
        [questionKey]: value,
      }
    }));
  };

  const canProceedToRating = selectedAnimes.length === 3;
  const canSubmitRatings = selectedAnimes.every(anime => 
    ratings[anime.id] && 
    ratings[anime.id].question1 &&
    ratings[anime.id].question2 &&
    ratings[anime.id].question3
  );

  const handleProceedToRating = () => {
    setCurrentStep('rate');
  };

  const handleSubmitSelections = () => {
    // Simular envío y redirigir a la siguiente fase
    setTimeout(() => {
      router.push(`/session/${sessionId}/rating`);
    }, 1000);
  };

  if (currentStep === 'rate') {
    return (
      <Layout maxWidth="xl">
        <PageHeader
          title="Califica tus Animes"
          subtitle="Evalúa cada anime que seleccionaste en una escala del 1 al 4"
        />

        <div className="space-y-6">
          {selectedAnimes.map((anime, index) => (
            <Card key={anime.id}>
              <CardContent className="p-6">
                <div className="flex items-start space-x-6">
                  <div className="flex-shrink-0">
                    {anime.imageUrl && (
                      <img
                        src={anime.imageUrl}
                        alt={anime.title}
                        className="w-24 h-32 object-cover rounded"
                      />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="mb-4">
                      <h3 className="text-xl font-bold">
                        #{index + 1} - {anime.title}
                      </h3>
                      <p className="text-gray-600 text-sm mt-1">
                        {anime.synopsis}
                      </p>
                    </div>

                    <div className="space-y-4">
                      {RATING_QUESTIONS.map((question, qIndex) => {
                        const questionKey = `question${qIndex + 1}`;
                        return (
                          <div key={question.id}>
                            <h4 className="font-medium text-gray-900 mb-2">
                              {question.shortText}
                            </h4>
                            <p className="text-sm text-gray-600 mb-3">
                              {question.text}
                            </p>
                            <RatingStars
                              value={ratings[anime.id]?.[questionKey] || 0}
                              onChange={(value) => handleRatingChange(anime.id, questionKey, value)}
                              size="md"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          <div className="flex space-x-4">
            <Button
              variant="secondary"
              onClick={() => setCurrentStep('select')}
              className="flex-1"
            >
              ← Volver a Selección
            </Button>
            <Button
              onClick={handleSubmitSelections}
              disabled={!canSubmitRatings}
              className="flex-1"
            >
              Confirmar Selecciones
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout maxWidth="full">
      <PageHeader
        title="Selecciona tus Animes"
        subtitle={`Elige exactamente 3 animes que te gustaría ver. Progreso: ${selectedAnimes.length}/3`}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Panel de selecciones */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Tus Selecciones</h3>
              
              {selectedAnimes.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    📺
                  </div>
                  <p>No has seleccionado ningún anime aún</p>
                  <p className="text-sm mt-1">Busca animes en el panel derecho</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedAnimes.map((anime, index) => (
                    <div key={anime.id} className="relative">
                      <AnimeCard
                        anime={anime}
                        compact
                        isSelected
                      />
                      <button
                        onClick={() => handleAnimeRemove(anime.id)}
                        className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                      >
                        ✕
                      </button>
                      <div className="absolute top-2 left-2 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {canProceedToRating && (
                <div className="mt-6 pt-4 border-t">
                  <Button
                    onClick={handleProceedToRating}
                    className="w-full"
                  >
                    Continuar a Calificación →
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Panel de búsqueda */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Buscar Animes</h3>
              <AnimeSearch
                onAnimeSelect={handleAnimeSelect}
                selectedAnimes={selectedAnimes.map(a => a.id)}
                placeholder="Busca animes para agregar a tu selección..."
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}