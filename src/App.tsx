import { Link, Navigate, Route, Routes } from "react-router-dom";
import { FavoritesPage } from "./pages/FavoritesPage";
import { HomePage } from "./pages/HomePage";
import { MoviePage } from "./pages/MoviePage";

export function App() {
  return (
    <div className="app">
      <header className="header">
        <Link to="/">Фильмы</Link>
        <Link to="/favorites">Избранное</Link>
      </header>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/movie/:id" element={<MoviePage />} />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
