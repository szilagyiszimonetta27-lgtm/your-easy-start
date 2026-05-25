import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/watch/$episodeId")({
  component: WatchPage,
});

type Quality = "1080p" | "720p" | "480p" | "360p";

function WatchPage() {
  const { episodeId } = Route.useParams();
  const [quality, setQuality] = useState<Quality>("720p");

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

  const sources = useMemo(() => {
    if (!episode) return {} as Record<Quality, string | null>;
    return {
      "1080p": episode.url_1080p,
      "720p": episode.url_720p,
      "480p": episode.url_480p,
      "360p": episode.url_360p,
    } as Record<Quality, string | null>;
  }, [episode]);

  const activeSrc =
    sources[quality] ??
    sources["720p"] ??
    sources["480p"] ??
    sources["1080p"] ??
    sources["360p"] ??
    episode?.video_url ??
    episode?.backup_url ??
    null;

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
              <div className="flex gap-1">
                {(["1080p", "720p", "480p", "360p"] as Quality[]).map((q) => (
                  <Button
                    key={q}
                    size="sm"
                    variant={quality === q ? "default" : "outline"}
                    disabled={!sources[q]}
                    onClick={() => setQuality(q)}
                  >
                    {q}
                  </Button>
                ))}
              </div>
            </div>
            <div className="overflow-hidden rounded-xl border border-border bg-black">
              {activeSrc ? (
                <video
                  key={activeSrc}
                  src={activeSrc}
                  controls
                  poster={episode.thumbnail_url ?? episode.animes?.boritokep ?? undefined}
                  className="aspect-video w-full"
                >
                  {episode.subtitle_url && episode.subtitle_type !== "embedded" && (
                    <track kind="subtitles" srcLang="hu" label="Magyar" src={episode.subtitle_url} default />
                  )}
                </video>
              ) : (
                <div className="flex aspect-video items-center justify-center text-muted-foreground">
                  Nincs videó link feltöltve ehhez az epizódhoz.
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}