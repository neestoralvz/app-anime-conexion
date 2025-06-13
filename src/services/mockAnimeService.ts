import { searchMockAnimes, mockAnimes } from '@/data/mockData';

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

// Simulación de delay de red
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

class MockAnimeService {
  async searchAnimes(query: string = '', limit: number = 10): Promise<SearchResponse> {
    await delay(300); // Simular delay de búsqueda

    const results = searchMockAnimes(query, limit);
    
    return {
      animes: results,
      total: results.length,
      query,
    };
  }

  async getPopularAnimes(limit: number = 10): Promise<AnimeSearchResult[]> {
    await delay(200);
    return mockAnimes.slice(0, limit);
  }

  async getAnimeById(id: string): Promise<AnimeSearchResult | null> {
    await delay(150);
    return mockAnimes.find(anime => anime.id === id) || null;
  }
}

export const mockAnimeService = new MockAnimeService();