import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { AnimeCard, type AnimeCardData } from "@/components/AnimeCard";

export const Route = createFileRoute("/browse")({ component: Browse });

function Browse() {
  const { data } = useQuery({
    queryKey: ["all-animes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("animes")
        .select("id, anime_nev, boritokep, mufajok, ev, average_rating")
        .order("anime_nev");
      if (error) throw error;
      return (data ?? []) as AnimeCardData[];
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-10">
        <h1 className="mb-6 text-3xl font-bold">Böngészés</h1>
        {!data || data.length === 0 ? (
          <p className="text-sm text-muted-foreground">Még nincs anime. Adminként vegyél fel a Lovable Cloud felületen.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {data.map((a) => <AnimeCard key={a.id} anime={a} />)}
          </div>
        )}
      </main>
    </div>
  );
}