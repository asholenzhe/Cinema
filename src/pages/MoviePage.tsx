import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchMovieById } from "../api";
import type { Movie } from "../types";

export function MoviePage() {
  const { id = "" } = useParams();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchMovieById(id).then(setMovie).catch((e) => setError((e as Error).message));
  }, [id]);

  if (error) return <main>{error}</main>;
  if (!movie) return <main>Загрузка...</main>;

  return (
    <main className="detail">
      <Link to="/">← Назад</Link>
      <img src={movie.poster?.url || movie.poster?.previewUrl || ""} alt={movie.name || "poster"} />
      <h1>{movie.name || movie.alternativeName || "Без названия"}</h1>
      <p>{movie.description || "Описание отсутствует"}</p>
      <p>Рейтинг KP: {movie.rating?.kp ?? "-"}</p>
      <p>Дата выхода: {movie.premiere?.world ? new Date(movie.premiere.world).toLocaleDateString("ru-RU") : "-"}</p>
      <p>Жанры: {movie.genres?.map((g) => g.name).join(", ") || "-"}</p>
    </main>
  );
}
