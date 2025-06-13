export interface Anime {
  id: string;
  title: string;
  synopsis: string;
  genre: string;
  year: number | null;
  imageUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Selection {
  id: string;
  sessionId: string;
  userId: string;
  animeId: string;
  orderNum: number;
  createdAt: Date;
}

export interface Rating {
  id: string;
  sessionId: string;
  userId: string;
  animeId: string;
  question1: number; // 1-4: Potencial de historia
  question2: number; // 1-4: Mood personal
  question3: number; // 1-4: Impulso de decisión
  isSelfRating: boolean;
  createdAt: Date;
}