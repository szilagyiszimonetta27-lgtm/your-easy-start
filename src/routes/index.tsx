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
        .select("id, anime_nev, boritokep, mufajok, ev, average_rating, epizod_szam, is_featured, leiras, created_at, hero_clip_episode_id, hero_clip_start, hero_clip_end")
        .eq("is_featured", true)
        .order("created_at", { ascending: false })
        .limit(18);
      if (error) throw error;
      return (data ?? []) as (HorizontalAnimeItem & { hero_clip_episode_id: string | null; hero_clip_start: number | null; hero_clip_end: number | null })[];
    },
  });

  const clipEpisodeIds = (featured ?? []).map((a) => a.hero_clip_episode_id).filter(Boolean) as string[];
  const { data: clipEpisodes } = useQuery({
    queryKey: ["hero-clip-episodes", clipEpisodeIds.join(",")],
    enabled: clipEpisodeIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("episodes")
        .select("id, video_url, url_720p, url_480p, url_360p")
        .in("id", clipEpisodeIds);
      if (error) throw error;
      return data ?? [];
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
          items={(featured ?? [])
            .filter((a) => a.boritokep)
            .slice(0, 8)
            .map((a): HeroItem => {
              const ep = clipEpisodes?.find((e) => e.id === a.hero_clip_episode_id);
              const clip_url = ep?.url_720p || ep?.video_url || ep?.url_480p || ep?.url_360p || null;
              return {
                id: a.id,
                anime_nev: a.anime_nev,
                boritokep: a.boritokep,
                leiras: a.leiras ?? null,
                mufajok: a.mufajok ?? null,
                ev: a.ev ?? null,
                clip_url: a.hero_clip_episode_id ? clip_url : null,
                clip_start: a.hero_clip_start,
                clip_end: a.hero_clip_end,
              };
            })}
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
