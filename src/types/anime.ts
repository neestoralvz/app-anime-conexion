import { Anime as PrismaAnime, Selection as PrismaSelection, Rating as PrismaRating } from '@prisma/client';

// Re-export Prisma types as our base types
export type Anime = PrismaAnime;
export type Selection = PrismaSelection;
export type Rating = PrismaRating;

// Derived types for specific use cases
export type AnimeWithSelections = Anime & {
  selections: Selection[];
};

export type AnimeWithRatings = Anime & {
  ratings: Rating[];
};

export type AnimeListItem = Pick<Anime, 'id' | 'title' | 'synopsis' | 'genre' | 'year' | 'imageUrl'>;

// Rating form data type
export type RatingFormData = Pick<Rating, 'question1' | 'question2' | 'question3'>;