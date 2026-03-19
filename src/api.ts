import type { CursorMoviesResponse, Movie } from "./types";

const API_BASE = "https://api.poiskkino.dev";
const API_KEY = import.meta.env.VITE_POISKKINO_API_KEY as string;
const headers: HeadersInit = API_KEY ? { "X-API-KEY": API_KEY } : {};

const fields = [
  "id",
  "name",
  "alternativeName",
  "year",
  "rating",
  "genres",
  "poster",
  "movieLength",
  "description",
  "premiere",
];

export async function fetchGenres(): Promise<string[]> {
  const url = new URL(`${API_BASE}/v1/movie/possible-values-by-field`);
  url.searchParams.append("field", "genres.name");
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error("Не удалось загрузить жанры");
  const data: Array<{ name: string | null }> = await res.json();
  return data.map((x) => x.name).filter(Boolean) as string[];
}

type MoviesParams = {
  next?: string;
  genres: string[];
  ratingFrom?: string;
  ratingTo?: string;
  yearFrom?: string;
  yearTo?: string;
};

export async function fetchMovies(params: MoviesParams): Promise<CursorMoviesResponse> {
  const url = new URL(`${API_BASE}/v1.5/movie`);
  fields.forEach((f) => url.searchParams.append("selectFields", f));
  url.searchParams.append("limit", "50");
  params.genres.forEach((g) => url.searchParams.append("genres.name", g));

  const ratingRange = toRange(params.ratingFrom, params.ratingTo);
  if (ratingRange) url.searchParams.append("rating.kp", ratingRange);
  const yearRange = toRange(params.yearFrom, params.yearTo);
  if (yearRange) url.searchParams.append("year", yearRange);
  if (params.next) url.searchParams.append("next", params.next);

  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error("Не удалось загрузить фильмы");
  return res.json();
}

export async function searchMovies(query: string): Promise<Movie[]> {
  const url = new URL(`${API_BASE}/v1.4/movie/search`);
  url.searchParams.append("query", query);
  url.searchParams.append("limit", "50");
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error("Ошибка поиска");
  const data = await res.json();
  return data.docs ?? [];
}

export async function fetchMovieById(id: string): Promise<Movie> {
  const res = await fetch(`${API_BASE}/v1.4/movie/${id}`, { headers });
  if (!res.ok) throw new Error("Фильм не найден");
  return res.json();
}

function toRange(from?: string, to?: string, type: 'year' | 'rating' = 'year') {
  if (!from && !to) return "";

  const min = from || (type === 'year' ? "1874" : "0");
  const max = to || (type === 'year' ? "2050" : "10");

  return `${min}-${max}`;
}
