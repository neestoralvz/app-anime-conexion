# S1-006: Setup Animes y Búsqueda

**Sprint**: 1 | **Día**: 6-7 | **Duración**: 2 días  
**Prioridad**: Alta | **Dependencias**: S1-002, S1-005

## Objetivo
Expandir la base de datos de animes y crear el sistema de búsqueda con autocompletado para que los usuarios puedan explorar y seleccionar animes fácilmente.

## Criterios de Aceptación
- [ ] Seed script con ~50 animes populares funcionando
- [ ] API GET /api/animes/search?q=query implementada
- [ ] Componente AnimeSearch con autocompletado
- [ ] Componente AnimeCard mejorado para selección
- [ ] Performance optimizada para búsquedas rápidas
- [ ] Manejo de casos edge (búsquedas vacías, no resultados)

## Pasos de Implementación

### 1. Expandir Seed Script con Más Animes
```typescript
// prisma/seed.ts (expandir datos existentes)
const extendedAnimeData = [
  // Animes existentes + nuevos
  {
    title: 'Naruto',
    synopsis: 'Un ninja joven busca reconocimiento y sueña con convertirse en Hokage.',
    genre: 'Action,Adventure,Martial Arts',
    year: 2002,
    imageUrl: 'https://cdn.myanimelist.net/images/anime/13/17405.jpg',
  },
  {
    title: 'Dragon Ball Z',
    synopsis: 'Goku y sus amigos defienden la Tierra contra poderosos enemigos.',
    genre: 'Action,Adventure,Martial Arts',
    year: 1989,
    imageUrl: 'https://cdn.myanimelist.net/images/anime/1935/95961.jpg',
  },
  {
    title: 'Fullmetal Alchemist: Brotherhood',
    synopsis: 'Dos hermanos alquimistas buscan la Piedra Filosofal para recuperar sus cuerpos.',
    genre: 'Action,Adventure,Drama,Fantasy',
    year: 2009,
    imageUrl: 'https://cdn.myanimelist.net/images/anime/1223/96541.jpg',
  },
  {
    title: 'One Piece',
    synopsis: 'Un joven pirata busca el tesoro más grande del mundo.',
    genre: 'Adventure,Comedy,Drama,Shounen',
    year: 1999,
    imageUrl: 'https://cdn.myanimelist.net/images/anime/6/73245.jpg',
  },
  {
    title: 'Attack on Titan',
    synopsis: 'La humanidad lucha por sobrevivir contra gigantes devoradores de humanos.',
    genre: 'Action,Drama,Fantasy,Military',
    year: 2013,
    imageUrl: 'https://cdn.myanimelist.net/images/anime/10/47347.jpg',
  },
  // Agregar 45 animes más siguiendo este patrón...
  {
    title: 'Studio Ghibli Collection',
    synopsis: 'Películas mágicas de Studio Ghibli como Spirited Away, My Neighbor Totoro.',
    genre: 'Adventure,Drama,Family,Supernatural',
    year: 2001,
  },
  {
    title: 'Cowboy Bebop',
    synopsis: 'Cazarrecompensas del espacio en aventuras llenas de jazz y acción.',
    genre: 'Action,Drama,Sci-Fi,Space',
    year: 1998,
  },
  {
    title: 'Hunter x Hunter',
    synopsis: 'Un joven busca a su padre convirtiéndose en Hunter profesional.',
    genre: 'Action,Adventure,Fantasy',
    year: 2011,
  },
  // ... continuar hasta 50 animes
];

async function main() {
  console.log('🌱 Seeding database with extended anime data...');
  
  // Limpiar datos existentes
  await prisma.rating.deleteMany();
  await prisma.selection.deleteMany();
  await prisma.sessionUser.deleteMany();
  await prisma.session.deleteMany();
  await prisma.anime.deleteMany();
  
  // Crear animes
  for (const anime of extendedAnimeData) {
    await prisma.anime.create({
      data: anime,
    });
  }
  
  console.log(`✅ Seeded ${extendedAnimeData.length} animes`);
}
```

### 2. Crear API de Búsqueda de Animes
```typescript
// src/app/api/animes/search/route.ts
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createErrorResponse, createSuccessResponse, AppError } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.trim() || '';
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 20);

    // Si no hay query, retornar animes populares
    if (!query) {
      const popularAnimes = await prisma.anime.findMany({
        take: limit,
        orderBy: { year: 'desc' },
        select: {
          id: true,
          title: true,
          synopsis: true,
          genre: true,
          year: true,
          imageUrl: true,
        },
      });

      return createSuccessResponse({
        animes: popularAnimes,
        total: popularAnimes.length,
        query: '',
      });
    }

    // Búsqueda por título y género
    const animes = await prisma.anime.findMany({
      where: {
        OR: [
          {
            title: {
              contains: query,
              mode: 'insensitive',
            },
          },
          {
            genre: {
              contains: query,
              mode: 'insensitive',
            },
          },
          {
            synopsis: {
              contains: query,
              mode: 'insensitive',
            },
          },
        ],
      },
      take: limit,
      orderBy: [
        {
          // Priorizar coincidencias exactas en título
          title: query.toLowerCase() === query ? 'asc' : 'desc',
        },
        { year: 'desc' },
      ],
      select: {
        id: true,
        title: true,
        synopsis: true,
        genre: true,
        year: true,
        imageUrl: true,
      },
    });

    return createSuccessResponse({
      animes,
      total: animes.length,
      query,
    });

  } catch (error) {
    return createErrorResponse(error);
  }
}
```

### 3. Crear Service de Animes
```typescript
// src/services/animeService.ts
import { ApiResponse } from '@/types';

export interface AnimeSearchResult {
  id: string;
  title: string;
  synopsis: string;
  genre: string;
  year?: number;
  imageUrl?: string;
}

export interface SearchResponse {
  animes: AnimeSearchResult[];
  total: number;
  query: string;
}

class AnimeService {
  private baseUrl = '/api/animes';

  async searchAnimes(query: string = '', limit: number = 10): Promise<SearchResponse> {
    const params = new URLSearchParams();
    if (query) params.append('q', query);
    params.append('limit', limit.toString());

    const response = await fetch(`${this.baseUrl}/search?${params}`);
    const result: ApiResponse<SearchResponse> = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Error al buscar animes');
    }

    return result.data!;
  }

  async getPopularAnimes(limit: number = 10): Promise<AnimeSearchResult[]> {
    const response = await this.searchAnimes('', limit);
    return response.animes;
  }
}

export const animeService = new AnimeService();
```

### 4. Crear Componente AnimeSearch con Autocompletado
```typescript
// src/components/anime/AnimeSearch.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/Input';
import { AnimeCard } from '@/components/game/AnimeCard';
import { animeService, AnimeSearchResult } from '@/services/animeService';

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
      const popularAnimes = await animeService.getPopularAnimes(15);
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
      const response = await animeService.searchAnimes(query, 15);
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
              No se encontraron animes para "{query}"
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
```

### 5. Mejorar AnimeCard para Búsqueda
```typescript
// src/components/game/AnimeCard.tsx (mejorar componente existente)
'use client';

import { AnimeSearchResult } from '@/services/animeService';

interface AnimeCardProps {
  anime: AnimeSearchResult;
  isSelected?: boolean;
  isDisabled?: boolean;
  compact?: boolean;
  onClick?: () => void;
}

export function AnimeCard({ 
  anime, 
  isSelected = false, 
  isDisabled = false,
  compact = false,
  onClick 
}: AnimeCardProps) {
  const genres = anime.genre.split(',').slice(0, 3);

  if (compact) {
    return (
      <div 
        className={`flex items-center space-x-3 p-2 rounded ${
          isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-50'
        } ${isSelected ? 'bg-blue-50 border border-blue-200' : ''}`}
        onClick={!isDisabled ? onClick : undefined}
      >
        {anime.imageUrl && (
          <img
            src={anime.imageUrl}
            alt={anime.title}
            className="w-12 h-16 object-cover rounded"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        )}
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm truncate">{anime.title}</h4>
          <p className="text-xs text-gray-500 truncate">{anime.synopsis}</p>
          <div className="flex flex-wrap gap-1 mt-1">
            {genres.map((genre) => (
              <span
                key={genre}
                className="px-1.5 py-0.5 text-xs bg-gray-100 text-gray-600 rounded"
              >
                {genre.trim()}
              </span>
            ))}
          </div>
          {anime.year && (
            <span className="text-xs text-gray-400">{anime.year}</span>
          )}
        </div>
        {isSelected && (
          <div className="text-blue-500">
            ✓
          </div>
        )}
      </div>
    );
  }

  // Versión completa para selección
  return (
    <div 
      className={`bg-white border rounded-lg p-4 cursor-pointer transition-all ${
        isSelected 
          ? 'border-blue-500 bg-blue-50 shadow-md' 
          : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
      } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={!isDisabled ? onClick : undefined}
    >
      {anime.imageUrl && (
        <img
          src={anime.imageUrl}
          alt={anime.title}
          className="w-full h-48 object-cover rounded mb-3"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      )}
      
      <h3 className="font-bold text-lg mb-2">{anime.title}</h3>
      <p className="text-gray-600 text-sm mb-3 line-clamp-3">{anime.synopsis}</p>
      
      <div className="flex flex-wrap gap-1 mb-2">
        {genres.map((genre) => (
          <span
            key={genre}
            className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full"
          >
            {genre.trim()}
          </span>
        ))}
      </div>
      
      {anime.year && (
        <div className="text-sm text-gray-500">
          Año: {anime.year}
        </div>
      )}
    </div>
  );
}
```

### 6. Crear Hook para Búsqueda
```typescript
// src/hooks/useAnimeSearch.ts
import { useState, useCallback } from 'react';
import { animeService, AnimeSearchResult } from '@/services/animeService';

export function useAnimeSearch() {
  const [results, setResults] = useState<AnimeSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchAnimes = useCallback(async (query: string, limit?: number) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await animeService.searchAnimes(query, limit);
      setResults(response.animes);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error en la búsqueda';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearResults = useCallback(() => {
    setResults([]);
    setError(null);
  }, []);

  return {
    results,
    isLoading,
    error,
    searchAnimes,
    clearResults,
  };
}
```

## Validación
- [ ] Seed script agrega 50+ animes sin errores
- [ ] API /api/animes/search responde correctamente
- [ ] Búsqueda por título, género y sinopsis funciona
- [ ] Autocompletado muestra resultados en tiempo real
- [ ] AnimeCard muestra información completa
- [ ] Performance de búsqueda es fluida (< 300ms)

## Archivos a Crear/Modificar
- `prisma/seed.ts` (expandir con más animes)
- `src/app/api/animes/search/route.ts` (API de búsqueda)
- `src/services/animeService.ts` (cliente API)
- `src/components/anime/AnimeSearch.tsx` (búsqueda con autocomplete)
- `src/components/game/AnimeCard.tsx` (mejorar componente existente)
- `src/hooks/useAnimeSearch.ts` (hook de búsqueda)

## Commit Final
```bash
git add .
git commit -m "feat: anime database and search functionality

- Expand seed script with 50+ popular animes
- Implement anime search API with title/genre/synopsis matching
- Create AnimeSearch component with real-time autocomplete
- Enhance AnimeCard component with compact and full modes
- Add animeService for API communication
- Create useAnimeSearch hook for search state management
- Optimize search performance with debouncing"
```

## Notas Técnicas
- **Debounced Search**: Búsqueda optimizada con 300ms de delay
- **Fallback Images**: Manejo de errores de imágenes
- **Case Insensitive**: Búsqueda sin distinción de mayúsculas
- **Multiple Fields**: Búsqueda en título, género y sinopsis
- **Responsive Design**: Cards adaptables para mobile y desktop