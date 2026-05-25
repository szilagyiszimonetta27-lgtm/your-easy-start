import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/anime/$id")({
  component: AnimeDetails,
});

function AnimeDetails() {
  const { id } = Route.useParams();

  const { data: anime, isLoading } = useQuery({
    queryKey: ["anime", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("animes")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: episodes } = useQuery({
    queryKey: ["episodes", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("episodes")
        .select("id, evad, resz, cim")
        .eq("anime_id", id)
        .order("evad", { ascending: true })
        .order("resz", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-10">
        {isLoading ? (
          <p className="text-muted-foreground">Betöltés...</p>
        ) : !anime ? (
          <div className="py-20 text-center">
            <p className="text-muted-foreground">Az anime nem található.</p>
            <Link to="/browse" className="mt-4 inline-block">
              <Button variant="outline">Vissza a böngészéshez</Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-[280px_1fr]">
            <div className="overflow-hidden rounded-xl border border-border bg-card">
              {anime.boritokep ? (
                <img src={anime.boritokep} alt={anime.anime_nev} className="aspect-[2/3] w-full object-cover" />
              ) : (
                <div className="flex aspect-[2/3] items-center justify-center text-muted-foreground">Nincs borító</div>
              )}
            </div>
            <div>
              <h1 className="text-glow text-3xl font-bold md:text-4xl">{anime.anime_nev}</h1>
              <div className="mt-2 flex flex-wrap gap-3 text-sm text-muted-foreground">
                {anime.ev && <span>{anime.ev}</span>}
                {anime.mufajok && <span>{anime.mufajok}</span>}
                {anime.average_rating != null && (
                  <span className="text-primary">★ {Number(anime.average_rating).toFixed(1)}</span>
                )}
              </div>
              {anime.leiras && <p className="mt-4 whitespace-pre-line text-foreground/90">{anime.leiras}</p>}

              <section className="mt-8">
                <h2 className="mb-3 text-xl font-bold">Epizódok</h2>
                {!episodes || episodes.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Még nincsenek feltöltött epizódok.</p>
                ) : (
                  <ul className="divide-y divide-border rounded-lg border border-border">
                    {episodes.map((ep) => (
                      <li key={ep.id} className="flex items-center justify-between px-4 py-3">
                        <span className="text-sm">
                          S{ep.evad}E{ep.resz} {ep.cim ? `– ${ep.cim}` : ""}
                        </span>
                        <span className="text-xs text-muted-foreground">hamarosan</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}