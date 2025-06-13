'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Layout, PageHeader } from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { AnimeCard } from '@/components/game/AnimeCard';
import { RatingStars } from '@/components/game/RatingStars';
import { RATING_QUESTIONS } from '@/constants/gameConfig';
import { mockAnimes } from '@/data/mockData';

// Simular animes del compañero (selecciones aleatorias)
const partnerAnimes = mockAnimes.slice(3, 6); // Demon Slayer, My Hero Academia, Fullmetal Alchemist

export default function RatingPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;
  
  const [ratings, setRatings] = useState<Record<string, any>>({});
  const [currentAnimeIndex, setCurrentAnimeIndex] = useState(0);

  const handleRatingChange = (animeId: string, questionKey: string, value: number) => {
    setRatings(prev => ({
      ...prev,
      [animeId]: {
        ...prev[animeId],
        [questionKey]: value,
      }
    }));
  };

  const canSubmitRatings = partnerAnimes.every(anime => 
    ratings[anime.id] && 
    ratings[anime.id].question1 &&
    ratings[anime.id].question2 &&
    ratings[anime.id].question3
  );

  const handleSubmitRatings = () => {
    // Simular envío y redirigir a resultados
    setTimeout(() => {
      router.push(`/session/${sessionId}/results`);
    }, 1000);
  };

  const currentAnime = partnerAnimes[currentAnimeIndex];
  const progress = Object.keys(ratings).length;

  return (
    <Layout maxWidth="xl">
      <PageHeader
        title="Califica los Animes de tu Compañero"
        subtitle={`Evalúa cada anime seleccionado por OtakuMaster. Progreso: ${progress}/${partnerAnimes.length}`}
      />

      {/* Barra de progreso */}
      <div className="mb-8">
        <div className="bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(progress / partnerAnimes.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Navegación entre animes */}
      <div className="mb-6">
        <div className="flex space-x-2 justify-center">
          {partnerAnimes.map((anime, index) => (
            <button
              key={anime.id}
              onClick={() => setCurrentAnimeIndex(index)}
              className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                index === currentAnimeIndex
                  ? 'bg-blue-500 text-white'
                  : ratings[anime.id]
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {index + 1}
              {ratings[anime.id] && <span className="ml-1">✓</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Anime actual para calificar */}
      <Card className="mb-8">
        <CardContent className="p-8">
          <div className="flex items-start space-x-8">
            <div className="flex-shrink-0">
              {currentAnime.imageUrl && (
                <img
                  src={currentAnime.imageUrl}
                  alt={currentAnime.title}
                  className="w-32 h-40 object-cover rounded-lg"
                />
              )}
            </div>
            
            <div className="flex-1">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {currentAnime.title}
                </h2>
                <p className="text-gray-600 mb-4">
                  {currentAnime.synopsis}
                </p>
                <div className="flex flex-wrap gap-2">
                  {currentAnime.genre.split(',').map((genre) => (
                    <span
                      key={genre}
                      className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                    >
                      {genre.trim()}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                {RATING_QUESTIONS.map((question, qIndex) => {
                  const questionKey = `question${qIndex + 1}`;
                  return (
                    <div key={question.id} className="space-y-3">
                      <h3 className="font-semibold text-gray-900">
                        {question.shortText}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {question.text}
                      </p>
                      <div className="flex items-center space-x-4">
                        <RatingStars
                          value={ratings[currentAnime.id]?.[questionKey] || 0}
                          onChange={(value) => handleRatingChange(currentAnime.id, questionKey, value)}
                          size="lg"
                        />
                        <span className="text-sm text-gray-500">
                          {ratings[currentAnime.id]?.[questionKey] || 0}/4
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navegación */}
      <div className="flex justify-between items-center">
        <Button
          variant="secondary"
          onClick={() => setCurrentAnimeIndex(Math.max(0, currentAnimeIndex - 1))}
          disabled={currentAnimeIndex === 0}
        >
          ← Anterior
        </Button>

        <div className="text-sm text-gray-600">
          Anime {currentAnimeIndex + 1} de {partnerAnimes.length}
        </div>

        {currentAnimeIndex < partnerAnimes.length - 1 ? (
          <Button
            onClick={() => setCurrentAnimeIndex(currentAnimeIndex + 1)}
          >
            Siguiente →
          </Button>
        ) : (
          <Button
            onClick={handleSubmitRatings}
            disabled={!canSubmitRatings}
            variant="success"
          >
            Finalizar Calificaciones
          </Button>
        )}
      </div>

      {/* Lista de todos los animes */}
      <div className="mt-12 pt-8 border-t">
        <h3 className="text-lg font-semibold mb-4">Todos los Animes a Calificar</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {partnerAnimes.map((anime, index) => (
            <div key={anime.id} className="relative">
              <AnimeCard
                anime={anime}
                onClick={() => setCurrentAnimeIndex(index)}
                className={`cursor-pointer ${
                  index === currentAnimeIndex ? 'ring-2 ring-blue-500' : ''
                } ${ratings[anime.id] ? 'bg-green-50' : ''}`}
              />
              {ratings[anime.id] && (
                <div className="absolute top-2 right-2 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center">
                  ✓
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}