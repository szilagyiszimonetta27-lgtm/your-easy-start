import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { HorizontalAnimeRow, type HorizontalAnimeItem } from "@/components/HorizontalAnimeRow";
import { HeroBanner, type HeroItem } from "@/components/HeroBanner";
import { ContinueWatchingRow } from "@/components/ContinueWatchingRow";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { data: featured } = useQuery({
    queryKey: ["featured-animes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("animes")
        .select("id, anime_nev, boritokep, mufajok, ev, average_rating, epizod_szam, is_featured, leiras, created_at")
        .eq("is_featured", true)
        .order("created_at", { ascending: false })
        .limit(18);
      if (error) throw error;
      return (data ?? []) as HorizontalAnimeItem[];
    },
  });

  const { data: latest } = useQuery({
    queryKey: ["latest-animes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("animes")
        .select("id, anime_nev, boritokep, mufajok, ev, average_rating, epizod_szam, created_at")
        .order("created_at", { ascending: false })
        .limit(24);
      if (error) throw error;
      return (data ?? []) as HorizontalAnimeItem[];
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-10">
        <HeroBanner
          items={((featured ?? []).filter((a) => a.boritokep) as unknown as HeroItem[]).slice(0, 8)}
          intervalMs={10000}
        />

        <ContinueWatchingRow />

        {featured && featured.length > 0 && (
          <HorizontalAnimeRow title="Kiemelt animék" items={featured} />
        )}
        <HorizontalAnimeRow
          title="Legújabbak"
          items={latest ?? []}
          empty="Még nincs anime az adatbázisban. Adminként vegyél fel egyet a Cloud felületen."
        />
      </main>
    </div>
  );
}
