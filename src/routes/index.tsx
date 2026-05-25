import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { AnimeCard, type AnimeCardData } from "@/components/AnimeCard";
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
        .select("id, anime_nev, boritokep, mufajok, ev, average_rating, is_featured")
        .eq("is_featured", true)
        .limit(12);
      if (error) throw error;
      return (data ?? []) as AnimeCardData[];
    },
  });

  const { data: latest } = useQuery({
    queryKey: ["latest-animes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("animes")
        .select("id, anime_nev, boritokep, mufajok, ev, average_rating")
        .order("created_at", { ascending: false })
        .limit(18);
      if (error) throw error;
      return (data ?? []) as AnimeCardData[];
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-10">
        <section className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/20 via-card to-background p-10 md:p-16">
          <h1 className="text-glow text-4xl font-bold md:text-6xl">Anime Streamer</h1>
          <p className="mt-3 max-w-xl text-muted-foreground">
            Magyar feliratos anime közösség. Nézd, kövesd, értékeld és kérd a kedvenceidet.
          </p>
          <div className="mt-6 flex gap-3">
            <Link to="/browse"><Button>Böngészés</Button></Link>
            <Link to="/auth"><Button variant="outline">Csatlakozás</Button></Link>
          </div>
        </section>

        {featured && featured.length > 0 && (
          <Section title="Kiemelt animék" items={featured} />
        )}
        <Section title="Legújabbak" items={latest ?? []} empty="Még nincs anime az adatbázisban. Adminként vegyél fel egyet a Cloud felületen." />
      </main>
    </div>
  );
}

function Section({ title, items, empty }: { title: string; items: AnimeCardData[]; empty?: string }) {
  return (
    <section className="mt-12">
      <h2 className="mb-4 text-2xl font-bold">{title}</h2>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">{empty ?? "Nincs találat."}</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {items.map((a) => <AnimeCard key={a.id} anime={a} />)}
        </div>
      )}
    </section>
  );
}
