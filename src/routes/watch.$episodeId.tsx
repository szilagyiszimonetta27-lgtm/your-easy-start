import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { CustomVideoPlayer, type VideoSource } from "@/components/CustomVideoPlayer";
import { useEffect, useMemo, useState } from "react";
import { extractThumbnail } from "@/lib/extractThumbnail";

export const Route = createFileRoute("/watch/$episodeId")({
  component: WatchPage,
});

function WatchPage() {
  const { episodeId } = Route.useParams();

  const { data: episode, isLoading } = useQuery({
    queryKey: ["episode", episodeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("episodes")
        .select("*, animes(id, anime_nev, boritokep)")
        .eq("id", episodeId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const sources: VideoSource[] = useMemo(() => {
    if (!episode) return [];
    const arr: VideoSource[] = [];
    if (episode.url_1080p) arr.push({ label: "1080p", src: episode.url_1080p });
    if (episode.url_720p) arr.push({ label: "720p", src: episode.url_720p });
    if (episode.url_480p) arr.push({ label: "480p", src: episode.url_480p });
    if (episode.url_360p) arr.push({ label: "360p", src: episode.url_360p });
    if (arr.length === 0 && episode.video_url) arr.push({ label: "Auto", src: episode.video_url });
    if (arr.length === 0 && episode.backup_url) arr.push({ label: "Backup", src: episode.backup_url });
    return arr;
  }, [episode]);

  const [autoPoster, setAutoPoster] = useState<string | null>(null);
  useEffect(() => {
    if (!episode || episode.thumbnail_url || episode.animes?.boritokep) return;
    const first = sources[0]?.src;
    if (!first) return;
    let cancelled = false;
    extractThumbnail(first, 10).then((url) => {
      if (!cancelled) setAutoPoster(url);
    });
    return () => {
      cancelled = true;
    };
  }, [episode, sources]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-6">
        {isLoading ? (
          <p className="text-muted-foreground">Betöltés...</p>
        ) : !episode ? (
          <p className="text-muted-foreground">Az epizód nem található.</p>
        ) : (
          <>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                {episode.animes && (
                  <Link to="/anime/$id" params={{ id: episode.animes.id }} className="text-sm text-primary hover:underline">
                    ← {episode.animes.anime_nev}
                  </Link>
                )}
                <h1 className="text-2xl font-bold">
                  {episode.episode_number}. rész {episode.title ? `– ${episode.title}` : ""}
                </h1>
              </div>
            </div>
            {sources.length === 0 ? (
              <div className="flex aspect-video items-center justify-center rounded-xl border border-border bg-black text-muted-foreground">
                Nincs videó link feltöltve ehhez az epizódhoz.
              </div>
            ) : (
              <CustomVideoPlayer
                sources={sources}
                poster={episode.thumbnail_url ?? episode.animes?.boritokep ?? autoPoster}
                subtitleUrl={
                  episode.subtitle_url && episode.subtitle_type !== "embedded"
                    ? episode.subtitle_url
                    : null
                }
                storageKey={episode.id}
                openingSkipSeconds={85}
                endingSkipSeconds={85}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}