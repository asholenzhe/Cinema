export type Genre = { name: string };

export type Movie = {
  id: number;
  name: string | null;
  alternativeName: string | null;
  year: number | number[];
  description: string | null;
  rating: { kp?: number | null; imdb?: number | null } | null;
  movieLength: number | null;
  genres: Genre[];
  poster: { url: string | null; previewUrl: string | null } | null;
  premiere?: { world?: string | null } | null;
};

export type CursorMoviesResponse = {
  docs: Movie[];
  next?: string;
  hasNext: boolean;
};
