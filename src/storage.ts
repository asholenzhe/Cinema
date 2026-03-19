import type { Movie } from "./types";

const FAV_KEY = "cinema:favorites";
const CMP_KEY = "cinema:compare";

export function getFavorites(): Movie[] {
  return read(FAV_KEY);
}
export function setFavorites(items: Movie[]) {
  localStorage.setItem(FAV_KEY, JSON.stringify(items));
}

export function getCompare(): Movie[] {
  return read(CMP_KEY);
}
export function setCompare(items: Movie[]) {
  localStorage.setItem(CMP_KEY, JSON.stringify(items));
}

function read(key: string): Movie[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as Movie[]) : [];
  } catch {
    return [];
  }
}
