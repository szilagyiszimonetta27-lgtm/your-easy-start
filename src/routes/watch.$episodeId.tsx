import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { CustomVideoPlayer, type VideoSource } from "@/components/CustomVideoPlayer";
import { useEffect, useMemo, useState } from "react";
import { extractThumbnail } from "@/lib/extractThumbnail";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/watch/$episodeId")({
  component: WatchPage,
});

function WatchPage() {
  const { episodeId } = Route.useParams();
  const navigate = useNavigate();

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

  const animeId = episode?.anime_id;
  const { data: siblings } = useQuery({
    queryKey: ["episodes-of", animeId],
    enabled: !!animeId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("episodes")
        .select("id, episode_number, title, thumbnail_url")
        .eq("anime_id", animeId!)
        .order("episode_number", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  const currentIdx = useMemo(() => {
    if (!siblings) return -1;
    return siblings.findIndex((e) => e.id === episodeId);
  }, [siblings, episodeId]);
  const prevEp = currentIdx > 0 ? siblings![currentIdx - 1] : null;
  const nextEp = siblings && currentIdx >= 0 && currentIdx < siblings.length - 1 ? siblings[currentIdx + 1] : null;

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

            <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
              <Button
                variant="outline"
                disabled={!prevEp}
                onClick={() => prevEp && navigate({ to: "/watch/$episodeId", params: { episodeId: prevEp.id } })}
                className="gap-1.5"
              >
                <ChevronLeft className="h-4 w-4" />
                {prevEp ? `${prevEp.episode_number}. rész` : "Nincs előző"}
              </Button>
              <Button
                disabled={!nextEp}
                onClick={() => nextEp && navigate({ to: "/watch/$episodeId", params: { episodeId: nextEp.id } })}
                className="gap-1.5"
              >
                {nextEp ? `${nextEp.episode_number}. rész` : "Nincs következő"}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {siblings && siblings.length > 0 && (
              <section className="mt-8">
                <h2 className="mb-3 text-lg font-bold md:text-xl">Epizódok</h2>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {siblings.map((ep) => {
                    const active = ep.id === episodeId;
                    return (
                      <Link
                        key={ep.id}
                        to="/watch/$episodeId"
                        params={{ episodeId: ep.id }}
                        className={`group overflow-hidden rounded-lg border transition-all ${
                          active
                            ? "border-primary bg-primary/10 shadow-lg shadow-primary/20"
                            : "border-border bg-card hover:border-primary/60"
                        }`}
                      >
                        <div className="aspect-video overflow-hidden bg-muted">
                          {ep.thumbnail_url || episode.animes?.boritokep ? (
                            <img
                              src={ep.thumbnail_url ?? episode.animes?.boritokep ?? ""}
                              alt={`${ep.episode_number}. rész`}
                              loading="lazy"
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          ) : null}
                        </div>
                        <div className="p-2">
                          <p className={`text-xs font-semibold ${active ? "text-primary" : ""}`}>
                            {ep.episode_number}. rész
                          </p>
                          {ep.title && (
                            <p className="line-clamp-1 text-[11px] text-muted-foreground">{ep.title}</p>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}