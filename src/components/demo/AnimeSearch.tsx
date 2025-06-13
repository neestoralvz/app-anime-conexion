'use client';

import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/Input';
import { AnimeCard } from '@/components/game/AnimeCard';
import { mockAnimeService, AnimeSearchResult } from '@/services/mockAnimeService';

interface AnimeSearchProps {
  onAnimeSelect: (anime: AnimeSearchResult) => void;
  selectedAnimes?: string[];
  placeholder?: string;
}

export function AnimeSearch({ 
  onAnimeSelect, 
  selectedAnimes = [], 
  placeholder = "Buscar animes..." 
}: AnimeSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<AnimeSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Cargar animes populares al inicio
    loadPopularAnimes();
  }, []);

  useEffect(() => {
    // Debounced search
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      if (query.trim()) {
        searchAnimes();
      } else {
        loadPopularAnimes();
      }
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query]);

  const loadPopularAnimes = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const popularAnimes = await mockAnimeService.getPopularAnimes(15);
      setResults(popularAnimes);
    } catch (err) {
      setError('Error al cargar animes populares');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const searchAnimes = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await mockAnimeService.searchAnimes(query, 15);
      setResults(response.animes);
    } catch (err) {
      setError('Error en la búsqueda');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnimeSelect = (anime: AnimeSearchResult) => {
    onAnimeSelect(anime);
    setQuery('');
    setShowResults(false);
  };

  return (
    <div className="relative" ref={searchRef}>
      <Input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setShowResults(true);
        }}
        onFocus={() => setShowResults(true)}
        placeholder={placeholder}
        className="w-full"
      />

      {showResults && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto">
          {isLoading && (
            <div className="p-4 text-center text-gray-500">
              Buscando animes...
            </div>
          )}

          {error && (
            <div className="p-4 text-center text-red-500">
              {error}
            </div>
          )}

          {!isLoading && !error && results.length === 0 && query && (
            <div className="p-4 text-center text-gray-500">
              No se encontraron animes para &quot;{query}&quot;
            </div>
          )}

          {!isLoading && !error && results.length > 0 && (
            <div className="max-h-80 overflow-y-auto">
              {results.map((anime) => (
                <div
                  key={anime.id}
                  onClick={() => handleAnimeSelect(anime)}
                  className={`p-2 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                    selectedAnimes.includes(anime.id) ? 'bg-blue-50 opacity-50' : ''
                  }`}
                >
                  <AnimeCard
                    anime={anime}
                    isSelected={selectedAnimes.includes(anime.id)}
                    isDisabled={selectedAnimes.includes(anime.id)}
                    compact
                  />
                </div>
              ))}
            </div>
          )}

          {!query && !isLoading && (
            <div className="p-2 text-xs text-gray-400 text-center border-t">
              Animes populares - Escribe para buscar
            </div>
          )}
        </div>
      )}
    </div>
  );
}