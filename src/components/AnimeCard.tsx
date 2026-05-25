import { Link } from "@tanstack/react-router";

export type AnimeCardData = {
  id: string;
  anime_nev: string;
  boritokep: string | null;
  mufajok: string | null;
  ev: number | null;
  average_rating: number | null;
};

export function AnimeCard({ anime }: { anime: AnimeCardData }) {
  return (
    <Link
      to="/anime/$id"
      params={{ id: anime.id }}
      className="group block overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-primary/60 hover:shadow-lg hover:shadow-primary/20"
    >
      <div className="aspect-[2/3] overflow-hidden bg-muted">
        {anime.boritokep ? (
          <img
            src={anime.boritokep}
            alt={anime.anime_nev}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-muted-foreground">Nincs borító</div>
        )}
      </div>
      <div className="p-3">
        <h3 className="line-clamp-1 text-sm font-semibold">{anime.anime_nev}</h3>
        <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
          <span className="line-clamp-1">{anime.mufajok ?? "—"}</span>
          {anime.average_rating != null && (
            <span className="ml-2 shrink-0 text-primary">★ {anime.average_rating.toFixed(1)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}