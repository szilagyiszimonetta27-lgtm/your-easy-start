import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { HorizontalAnimeRow, type HorizontalAnimeItem } from "@/components/HorizontalAnimeRow";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { data: featured } = useQuery({
    queryKey: ["featured-animes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("animes")
        .select("id, anime_nev, boritokep, mufajok, ev, average_rating, epizod_szam, is_featured, created_at")
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
        <section className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/20 via-card to-background p-10 md:p-16">
          <h1 className="text-glow text-4xl font-bold md:text-6xl">AxelSub</h1>
          <p className="mt-3 max-w-xl text-muted-foreground">
            Magyar feliratos anime közösség. Nézd, kövesd, értékeld és kérd a kedvenceidet.
          </p>
          <div className="mt-6 flex gap-3">
            <Link to="/browse"><Button>Böngészés</Button></Link>
            <Link to="/auth"><Button variant="outline">Csatlakozás</Button></Link>
          </div>
        </section>

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
