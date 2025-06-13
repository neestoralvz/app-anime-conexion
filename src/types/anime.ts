export interface Anime {
  id: string;
  title: string;
  description: string;
  genre: string[];
  year: number;
  episodes: number;
  imageUrl?: string;
  source: string;
}

export interface Selection {
  id: string;
  sessionId: string;
  userId: string;
  animeId: string;
  selfRating: Rating;
  createdAt: Date;
}

export interface Rating {
  storyIntrigue: number;
  moodAlignment: number;
  immediateDesire: number;
}