import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";
import { Play } from "lucide-react";

type Item = {
  episode_id: string;
  anime_id: string;
  progress_seconds: number;
  episode_number: number | null;
  episode_title: string | null;
  anime_nev: string;
  boritokep: string | null;
  thumbnail_url: string | null;
  duration: number | null;
};

function fmtTime(s: number) {
  const m = Math.floor(s / 60);
  const ss = Math.floor(s % 60).toString().padStart(2, "0");
  return `${m}:${ss}`;
}

export function ContinueWatchingRow() {
  const [user, setUser] = useState<User | null>(null);
  const [items, setItems] = useState<Item[] | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setUser(s?.user ?? null));
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      setItems([]);
      return;
    }
    (async () => {
      const { data, error } = await supabase
        .from("watch_progress")
        .select("episode_id, anime_id, progress_seconds, completed, updated_at, episodes(id, episode_number, title, thumbnail_url, duration), animes(id, anime_nev, boritokep)")
        .eq("user_id", user.id)
        .eq("completed", false)
        .gt("progress_seconds", 5)
        .order("updated_at", { ascending: false })
        .limit(12);
      if (error) {
        setItems([]);
        return;
      }
      const mapped: Item[] = (data ?? [])
        .filter((r: any) => r.episodes && r.animes)
        .map((r: any) => ({
          episode_id: r.episode_id,
          anime_id: r.anime_id,
          progress_seconds: r.progress_seconds ?? 0,
          episode_number: r.episodes?.episode_number ?? null,
          episode_title: r.episodes?.title ?? null,
          anime_nev: r.animes?.anime_nev ?? "",
          boritokep: r.animes?.boritokep ?? null,
          thumbnail_url: r.episodes?.thumbnail_url ?? null,
          duration: r.episodes?.duration ?? null,
        }));
      setItems(mapped);
    })();
  }, [user]);

  if (!user || !items || items.length === 0) return null;

  return (
    <section className="mt-10">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-xl font-bold md:text-2xl">Folytasd, ahol abbahagytad</h2>
      </div>
      <div
        className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-3 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        style={{ WebkitOverflowScrolling: "touch", overscrollBehaviorX: "contain" }}
      >
        {items.map((it) => {
          const cover = it.thumbnail_url ?? it.boritokep;
          const pct = it.duration && it.duration > 0 ? Math.min(100, (it.progress_seconds / it.duration) * 100) : 0;
          return (
            <Link
              key={it.episode_id}
              to="/watch/$episodeId"
              params={{ episodeId: it.episode_id }}
              className="group relative w-[70vw] max-w-[280px] shrink-0 snap-start overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-primary/60 hover:shadow-lg hover:shadow-primary/20 sm:w-[260px]"
            >
              <div className="relative aspect-video overflow-hidden bg-muted">
                {cover ? (
                  <img src={cover} alt={it.anime_nev} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-muted-foreground">Nincs borító</div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                  <div className="rounded-full bg-primary/90 p-3 text-primary-foreground shadow-lg">
                    <Play className="h-5 w-5" />
                  </div>
                </div>
                {pct > 0 && (
                  <div className="absolute inset-x-0 bottom-0 h-1 bg-foreground/20">
                    <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
                  </div>
                )}
              </div>
              <div className="p-2">
                <h3 className="line-clamp-1 text-sm font-semibold">{it.anime_nev}</h3>
                <p className="line-clamp-1 text-[11px] text-muted-foreground">
                  {it.episode_number != null ? `${it.episode_number}. rész` : ""}
                  {it.episode_title ? ` – ${it.episode_title}` : ""}
                </p>
                <p className="mt-0.5 text-[11px] text-primary">▶ {fmtTime(it.progress_seconds)}{it.duration ? ` / ${fmtTime(it.duration)}` : ""}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}