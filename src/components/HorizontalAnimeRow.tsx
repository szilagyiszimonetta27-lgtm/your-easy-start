import { useRef, useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export type HorizontalAnimeItem = {
  id: string;
  anime_nev: string;
  boritokep: string | null;
  mufajok: string | null;
  ev: number | null;
  average_rating: number | null;
  epizod_szam?: number | null;
};

export function HorizontalAnimeRow({
  title,
  items,
  empty,
}: {
  title: string;
  items: HorizontalAnimeItem[];
  empty?: string;
}) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const updateButtons = () => {
    const el = scrollerRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => {
    updateButtons();
    const el = scrollerRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateButtons, { passive: true });
    window.addEventListener("resize", updateButtons);
    return () => {
      el.removeEventListener("scroll", updateButtons);
      window.removeEventListener("resize", updateButtons);
    };
  }, [items.length]);

  const scrollBy = (dir: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.max(280, el.clientWidth * 0.8), behavior: "smooth" });
  };

  return (
    <section className="mt-10">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-xl font-bold md:text-2xl">{title}</h2>
        <div className="hidden gap-1 sm:flex">
          <Button
            size="icon"
            variant="outline"
            className="h-8 w-8 rounded-full"
            onClick={() => scrollBy(-1)}
            disabled={!canPrev}
            aria-label="Vissza"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="outline"
            className="h-8 w-8 rounded-full"
            onClick={() => scrollBy(1)}
            disabled={!canNext}
            aria-label="Tovább"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">{empty ?? "Nincs találat."}</p>
      ) : (
        <div className="relative">
          <div
            ref={scrollerRef}
            className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-3 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            style={{ WebkitOverflowScrolling: "touch", overscrollBehaviorX: "contain" }}
          >
            {items.map((a) => (
              <Link
                key={a.id}
                to="/anime/$id"
                params={{ id: a.id }}
                className="group relative w-[44vw] max-w-[180px] shrink-0 snap-start overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-primary/60 hover:shadow-lg hover:shadow-primary/20 sm:w-[180px]"
              >
                {a.epizod_szam != null && a.epizod_szam > 0 && (
                  <span className="absolute left-2 top-2 z-10 rounded-md bg-primary/90 px-2 py-0.5 text-[11px] font-bold text-primary-foreground shadow">
                    {a.epizod_szam}. ep
                  </span>
                )}
                <div className="aspect-[2/3] overflow-hidden bg-muted">
                  {a.boritokep ? (
                    <img
                      src={a.boritokep}
                      alt={a.anime_nev}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                      Nincs borító
                    </div>
                  )}
                </div>
                <div className="p-2">
                  <h3 className="line-clamp-1 text-sm font-semibold">{a.anime_nev}</h3>
                  <div className="mt-0.5 flex items-center justify-between text-[11px] text-muted-foreground">
                    <span className="line-clamp-1">{a.mufajok ?? "—"}</span>
                    {a.average_rating != null && (
                      <span className="ml-2 shrink-0 text-primary">★ {a.average_rating.toFixed(1)}</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}