'use client';

import { useRouter } from 'next/navigation';
import { Layout, PageHeader } from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
// import { AnimeCard } from '@/components/game/AnimeCard';
import { mockAnimes } from '@/data/mockData';

// Simular resultados calculados
const winnerAnime = mockAnimes[1]; // Death Note
const allResults = [
  {
    anime: mockAnimes[1], // Death Note
    selfRating: { question1: 4, question2: 4, question3: 3, total: 11 },
    crossRating: { question1: 4, question2: 3, question3: 4, total: 11 },
    totalScore: 22,
    passedGoldFilter: true,
    position: 1,
  },
  {
    anime: mockAnimes[0], // Attack on Titan
    selfRating: { question1: 3, question2: 4, question3: 3, total: 10 },
    crossRating: { question1: 4, question2: 3, question3: 3, total: 10 },
    totalScore: 20,
    passedGoldFilter: true,
    position: 2,
  },
  {
    anime: mockAnimes[4], // My Hero Academia
    selfRating: { question1: 3, question2: 3, question3: 2, total: 8 },
    crossRating: { question1: 3, question2: 4, question3: 3, total: 10 },
    totalScore: 18,
    passedGoldFilter: true,
    position: 3,
  },
  {
    anime: mockAnimes[2], // One Piece
    selfRating: { question1: 4, question2: 2, question3: 1, total: 7 },
    crossRating: { question1: 3, question2: 3, question3: 2, total: 8 },
    totalScore: 15,
    passedGoldFilter: false, // Filtro de oro: question3 = 1
    position: 4,
  },
];

export default function ResultsPage() {
  // const params = useParams();
  const router = useRouter();
  // const sessionId = params.id as string;

  const handleNewSession = () => {
    router.push('/');
  };

  const handleShareResults = () => {
    const shareText = `🎉 ¡Encontramos nuestro anime! ${winnerAnime.title} ganó con 22/24 puntos en App Anime Conexión`;
    
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

  return (
    <Layout maxWidth="full">
      <div className="text-center mb-8">
        <div className="mb-6">
          <div className="text-6xl mb-4">🏆</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            ¡Tenemos un Ganador!
          </h1>
          <p className="text-xl text-gray-600">
            Su anime para esta noche es:
          </p>
        </div>

        <div className="max-w-2xl mx-auto mb-8">
          <h2 className="text-3xl font-bold text-blue-600 mb-4">
            {winnerAnime.title}
          </h2>
          
          <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-center space-x-6">
                {winnerAnime.imageUrl && (
                  <img
                    src={winnerAnime.imageUrl}
                    alt={winnerAnime.title}
                    className="w-24 h-32 object-cover rounded-lg"
                  />
                )}
                <div className="text-left">
                  <p className="text-gray-700 mb-4">{winnerAnime.synopsis}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {winnerAnime.genre.split(',').slice(0, 3).map((genre) => (
                      <span
                        key={genre}
                        className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full"
                      >
                        {genre.trim()}
                      </span>
                    ))}
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-yellow-600">22/24</div>
                    <div className="text-sm text-gray-600">Puntuación Final</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-w-2xl mx-auto mb-8">
          <h3 className="font-semibold text-green-900 mb-2">¿Por qué ganó?</h3>
          <p className="text-green-800 text-sm">
            Death Note obtuvo la puntuación más alta con excelentes calificaciones en todas las categorías.
            Ambos usuarios le dieron altas puntuaciones en potencial de historia e impulso de decisión.
          </p>
        </div>
      </div>

      {/* Todas las puntuaciones */}
      <div className="mb-8">
        <PageHeader
          title="Todas las Puntuaciones"
          subtitle="Desglose completo de cómo quedaron todos los animes"
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {allResults.map((result) => (
            <Card 
              key={result.anime.id}
              className={`${result.position === 1 ? 'border-yellow-300 bg-yellow-50' : ''} ${
                !result.passedGoldFilter ? 'opacity-60' : ''
              }`}
            >
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center space-x-2">
                    <span className={`text-2xl font-bold ${
                      result.position === 1 ? 'text-yellow-600' :
                      result.position === 2 ? 'text-gray-500' :
                      result.position === 3 ? 'text-amber-600' : 'text-gray-400'
                    }`}>
                      #{result.position}
                    </span>
                    <span>{result.anime.title}</span>
                  </span>
                  {result.position === 1 && (
                    <span className="bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold">
                      🏆 GANADOR
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              
              <CardContent>
                <div className="mb-4">
                  <div className="text-center mb-3">
                    <div className={`text-3xl font-bold ${
                      result.totalScore >= 20 ? 'text-green-600' :
                      result.totalScore >= 15 ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {result.totalScore}/24
                    </div>
                    <div className="text-sm text-gray-600">
                      {result.totalScore >= 20 ? 'Excelente' :
                       result.totalScore >= 15 ? 'Bueno' : 'Regular'}
                    </div>
                  </div>

                  {!result.passedGoldFilter && (
                    <div className="text-center mb-3">
                      <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
                        ❌ Eliminado por Filtro de Oro
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Auto-calificación:</span>
                    <span className="font-bold">{result.selfRating.total}/12</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Calificación cruzada:</span>
                    <span className="font-bold">{result.crossRating.total}/12</span>
                  </div>
                  
                  <div className="pt-2 border-t text-xs text-gray-500">
                    <div className="grid grid-cols-3 gap-2">
                      <div>Historia: {result.selfRating.question1 + result.crossRating.question1}/8</div>
                      <div>Mood: {result.selfRating.question2 + result.crossRating.question2}/8</div>
                      <div>Impulso: {result.selfRating.question3 + result.crossRating.question3}/8</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Estadísticas del juego */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Estadísticas del Juego</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">6</div>
              <div className="text-sm text-gray-600">Animes Evaluados</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">0</div>
              <div className="text-sm text-gray-600">Coincidencias Directas</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">3</div>
              <div className="text-sm text-gray-600">Pasaron Filtro</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">19</div>
              <div className="text-sm text-gray-600">Puntuación Media</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Acciones */}
      <div className="text-center space-y-4 md:space-y-0 md:space-x-4 md:flex md:justify-center">
        <Button
          onClick={handleNewSession}
          size="lg"
          className="w-full md:w-auto"
        >
          🔄 Nueva Sesión
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
    </Layout>
  );
}