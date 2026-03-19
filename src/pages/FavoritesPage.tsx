import { Link } from "react-router-dom";
import { useMemo, useState } from "react";
import { getFavorites, setFavorites } from "../storage";

export function FavoritesPage() {
  const [items, setItems] = useState(getFavorites);
  const empty = useMemo(() => !items.length, [items.length]);

  function remove(id: number) {
    const next = items.filter((m) => m.id !== id);
    setItems(next);
    setFavorites(next);
  }

  return (
    <main>
      <h1>Избранное</h1>
      {empty && <p>Список пуст</p>}
      <section className="grid">
        {items.map((m) => (
          <article className="card" key={m.id}>
            <Link to={`/movie/${m.id}`}>
              <img src={m.poster?.previewUrl || m.poster?.url || ""} alt={m.name || "poster"} />
            </Link>
            <h3>{m.name || m.alternativeName || "Без названия"}</h3>
            <button onClick={() => remove(m.id)}>Удалить</button>
          </article>
        ))}
      </section>
    </main>
  );
}
