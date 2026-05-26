import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { AnimeCard, type AnimeCardData } from "@/components/AnimeCard";

export const Route = createFileRoute("/animek")({
  head: () => ({ meta: [{ title: "Animék – AxelSub" }] }),
  component: AnimekPage,
});

type Tab = "all" | "ongoing" | "completed" | "upcoming";

const TABS: { id: Tab; label: string }[] = [
  { id: "all", label: "Összes" },
  { id: "ongoing", label: "Aktív" },
  { id: "completed", label: "Befejezett" },
  { id: "upcoming", label: "Tervezett" },
];

function AnimekPage() {
  const [tab, setTab] = useState<Tab>("all");

  const { data, isLoading } = useQuery({
    queryKey: ["animek-tab", tab],
    queryFn: async () => {
      let q = supabase
        .from("animes")
        .select("id, anime_nev, boritokep, mufajok, ev, average_rating, status")
        .order("anime_nev");
      if (tab !== "all") q = q.eq("status", tab);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as (AnimeCardData & { status: string | null })[];
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-10">
        <h1 className="mb-6 text-3xl font-bold">Animék</h1>

        <div className="mb-6 flex flex-wrap gap-2">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                tab === t.id
                  ? "bg-primary text-primary-foreground"
                  : "border border-border bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Betöltés...</p>
        ) : !data || data.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nincs anime ebben a kategóriában.</p>
        ) : (
          <>
            <p className="mb-4 text-xs text-muted-foreground">{data.length} találat</p>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {data.map((a) => <AnimeCard key={a.id} anime={a} />)}
            </div>
          </>
        )}
      </main>
    </div>
  );
}