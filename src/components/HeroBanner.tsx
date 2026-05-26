import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Play, ChevronLeft, ChevronRight } from "lucide-react";

export type HeroItem = {
  id: string;
  anime_nev: string;
  boritokep: string | null;
  leiras?: string | null;
  mufajok?: string | null;
  ev?: number | null;
  clip_url?: string | null;
  clip_start?: number | null;
  clip_end?: number | null;
};

export function HeroBanner({ items, intervalMs = 10000 }: { items: HeroItem[]; intervalMs?: number }) {
  const [idx, setIdx] = useState(0);
  const count = items.length;
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (count <= 1) return;
    const t = window.setInterval(() => {
      setIdx((i) => (i + 1) % count);
    }, intervalMs);
    return () => window.clearInterval(t);
  }, [count, intervalMs]);

  if (count === 0) return null;
  const a = items[idx];
  const hasClip = !!a.clip_url;

  useEffect(() => {
    const v = videoRef.current;
    if (!v || !hasClip) return;
    const start = a.clip_start ?? 0;
    const end = a.clip_end ?? null;
    const onLoaded = () => {
      try { v.currentTime = start; v.play().catch(() => {}); } catch {}
    };
    const onTime = () => {
      if (end != null && v.currentTime >= end) v.currentTime = start;
    };
    v.addEventListener("loadedmetadata", onLoaded);
    v.addEventListener("timeupdate", onTime);
    if (v.readyState >= 1) onLoaded();
    return () => {
      v.removeEventListener("loadedmetadata", onLoaded);
      v.removeEventListener("timeupdate", onTime);
    };
  }, [idx, hasClip, a.clip_url, a.clip_start, a.clip_end]);

  return (
    <section className="relative overflow-hidden rounded-2xl border border-border bg-card">
      <div className="relative aspect-[16/9] w-full md:aspect-[21/9]">
        {hasClip && (
          <video
            ref={videoRef}
            key={`v-${a.id}`}
            src={a.clip_url!}
            muted
            playsInline
            autoPlay
            loop
            className="absolute inset-0 h-full w-full object-cover"
            poster={a.boritokep ?? undefined}
          />
        )}
        {!hasClip && items.map((it, i) => (
          <img
            key={it.id}
            src={it.boritokep ?? ""}
            alt={it.anime_nev}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${i === idx ? "opacity-100" : "opacity-0"}`}
            loading={i === 0 ? "eager" : "lazy"}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-background/30 to-transparent" />

        <div className="absolute inset-x-0 bottom-0 p-5 md:p-10">
          <div className="max-w-2xl">
            <h1 className="text-glow text-3xl font-bold md:text-5xl">{a.anime_nev}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground md:text-sm">
              {a.ev && <span>{a.ev}</span>}
              {a.mufajok && <span className="line-clamp-1">• {a.mufajok}</span>}
            </div>
            {a.leiras && (
              <p className="mt-3 line-clamp-2 max-w-xl text-sm text-muted-foreground md:line-clamp-3 md:text-base">
                {a.leiras}
              </p>
            )}
            <div className="mt-4 flex gap-2">
              <Link to="/anime/$id" params={{ id: a.id }}>
                <Button size="sm" className="gap-1.5">
                  <Play className="h-4 w-4" /> Megnézem
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {count > 1 && (
          <>
            <button
              onClick={() => setIdx((i) => (i - 1 + count) % count)}
              className="absolute left-2 top-1/2 hidden -translate-y-1/2 rounded-full bg-background/60 p-2 text-foreground backdrop-blur transition-colors hover:bg-background/80 md:block"
              aria-label="Előző"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => setIdx((i) => (i + 1) % count)}
              className="absolute right-2 top-1/2 hidden -translate-y-1/2 rounded-full bg-background/60 p-2 text-foreground backdrop-blur transition-colors hover:bg-background/80 md:block"
              aria-label="Következő"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            <div className="absolute bottom-2 right-3 flex gap-1.5">
              {items.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIdx(i)}
                  aria-label={`Slide ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all ${i === idx ? "w-6 bg-primary" : "w-1.5 bg-foreground/40 hover:bg-foreground/70"}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}