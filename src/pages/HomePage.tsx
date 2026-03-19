import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { fetchGenres, fetchMovies, searchMovies } from "../api";
import { getCompare, getFavorites, setCompare as saveCompare, setFavorites } from "../storage";
import type { Movie } from "../types";

export function HomePage() {
  const [params, setParams] = useSearchParams();
  const [genres, setGenres] = useState<string[]>([]);
  const [items, setItems] = useState<Movie[]>([]);
  const [next, setNext] = useState<string | undefined>();
  const [hasNext, setHasNext] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [modalMovie, setModalMovie] = useState<Movie | null>(null);
  const [compare, setCompareState] = useState<Movie[]>(() => getCompare());
  const anchor = useRef<HTMLDivElement>(null);

  const query = params.get("query") || "";
  const selectedGenres = params.getAll("genre");
  const ratingFrom = params.get("ratingFrom") || "";
  const ratingTo = params.get("ratingTo") || "";
  const yearFrom = params.get("yearFrom") || "1990";
  const yearTo = params.get("yearTo") || "";

  useEffect(() => {
    fetchGenres().then(setGenres).catch(() => setGenres([]));
  }, []);

  useEffect(() => {
    setItems([]);
    setNext(undefined);
    setHasNext(true);
    void loadFirst();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, selectedGenres.join(","), ratingFrom, ratingTo, yearFrom, yearTo]);

  useEffect(() => {
    if (query || !hasNext || loading || !anchor.current) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) void loadMore();
    });
    observer.observe(anchor.current);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, hasNext, loading, next]);

  async function loadFirst() {
    setLoading(true);
    setError("");
    try {
      if (query) {
        const docs = await searchMovies(query);
        setItems(docs);
        setHasNext(false);
      } else {
        const data = await fetchMovies({ genres: selectedGenres, ratingFrom, ratingTo, yearFrom, yearTo });
        setItems(data.docs);
        setNext(data.next);
        setHasNext(data.hasNext);
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function loadMore() {
    if (!next || loading) return;
    setLoading(true);
    try {
      const data = await fetchMovies({ next, genres: selectedGenres, ratingFrom, ratingTo, yearFrom, yearTo });
      setItems((prev) => [...prev, ...data.docs]);
      setNext(data.next);
      setHasNext(data.hasNext);
    } finally {
      setLoading(false);
    }
  }

  function toggleGenre(name: string) {
    const newParams = new URLSearchParams(params);
    const current = new Set(newParams.getAll("genre"));
    current.has(name) ? current.delete(name) : current.add(name);
    newParams.delete("genre");
    [...current].forEach((g) => newParams.append("genre", g));
    setParams(newParams);
  }

  function updateParam(key: string, value: string) {
    const p = new URLSearchParams(params);
    value ? p.set(key, value) : p.delete(key);
    setParams(p);
  }

  function askAddFavorite(movie: Movie) {
    setModalMovie(movie);
  }

  function confirmAddFavorite() {
    if (!modalMovie) return;
    const all = getFavorites();
    if (!all.some((m) => m.id === modalMovie.id)) {
      setFavorites([modalMovie, ...all]);
    }
    setModalMovie(null);
  }

  function toggleCompare(movie: Movie) {
    const exists = compare.some((m) => m.id === movie.id);
    const nextItems = exists
      ? compare.filter((m) => m.id !== movie.id)
      : compare.length < 2
        ? [...compare, movie]
        : [compare[1], movie];
    persistCompare(nextItems);
  }

  function persistCompare(nextItems: Movie[]) {
    setCompareState(nextItems);
    saveCompare(nextItems);
  }

  const compareInfo = useMemo(
    () =>
      compare.map((m) => ({
        id: m.id,
        name: m.name || m.alternativeName || "Без названия",
        year: m.year ?? "-",
        rating: m.rating?.kp ?? "-",
        genres: m.genres?.map((g) => g.name).join(", ") || "-",
        length: m.movieLength ?? "-",
      })),
    [compare],
  );

  return (
    <main>
      <div className="filters">
        <input placeholder="Поиск по названию" value={query} onChange={(e) => updateParam("query", e.target.value)} />
        <input placeholder="Рейтинг от" value={ratingFrom} onChange={(e) => updateParam("ratingFrom", e.target.value)} />
        <input placeholder="Рейтинг до" value={ratingTo} onChange={(e) => updateParam("ratingTo", e.target.value)} />
        <input placeholder="Год от" value={yearFrom} onChange={(e) => updateParam("yearFrom", e.target.value)} />
        <input placeholder="Год до" value={yearTo} onChange={(e) => updateParam("yearTo", e.target.value)} />
      </div>

      <div className="genres">
        {genres.slice(0, 24).map((g) => (
          <button key={g} className={selectedGenres.includes(g) ? "active" : ""} onClick={() => toggleGenre(g)}>
            {g}
          </button>
        ))}
      </div>

      {!!compareInfo.length && (
        <table className="compare">
          <tbody>
            <tr>{compareInfo.map((m) => <th key={m.id}>{m.name}</th>)}</tr>
            <tr>{compareInfo.map((m) => <td key={m.id}>{m.year}</td>)}</tr>
            <tr>{compareInfo.map((m) => <td key={m.id}>{m.rating}</td>)}</tr>
            <tr>{compareInfo.map((m) => <td key={m.id}>{m.genres}</td>)}</tr>
            <tr>{compareInfo.map((m) => <td key={m.id}>{m.length}</td>)}</tr>
          </tbody>
        </table>
      )}

      {error && <p>{error}</p>}
      <section className="grid">
        {items.map((m) => (
          <article className="card" key={m.id}>
            <Link to={`/movie/${m.id}`}>
              <img src={m.poster?.previewUrl || m.poster?.url || ""} alt={m.name || "poster"} />
            </Link>
            <h3>{m.name || m.alternativeName || "Без названия"}</h3>
            <p>{m.year || "-"}</p>
            <p>KP: {m.rating?.kp ?? "-"}</p>
            <div className="row">
              <button onClick={() => askAddFavorite(m)}>В избранное</button>
              <button onClick={() => toggleCompare(m)}>{compare.some((x) => x.id === m.id) ? "Убрать" : "Сравнить"}</button>
            </div>
          </article>
        ))}
      </section>
      {loading && <p>Загрузка...</p>}
      <div ref={anchor} />

      {modalMovie && (
        <div className="modal">
          <div className="modalBody">
            <p>Добавить "{modalMovie.name || modalMovie.alternativeName}" в избранное?</p>
            <div className="row">
              <button onClick={confirmAddFavorite}>Ок</button>
              <button onClick={() => setModalMovie(null)}>Отмена</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
