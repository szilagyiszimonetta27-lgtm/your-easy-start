import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import type { Database } from "@/integrations/supabase/types";

type WatchStatus = Database["public"]["Enums"]["watchlist_status"];

const STATUS_LABELS: Record<WatchStatus, string> = {
  watching: "Nézem",
  planned: "Tervben",
  completed: "Befejezve",
  dropped: "Félbehagyva",
};

export function AnimeActions({ animeId }: { animeId: string }) {
  const [user, setUser] = useState<User | null>(null);
  const [fav, setFav] = useState(false);
  const [status, setStatus] = useState<WatchStatus | null>(null);
  const [myScore, setMyScore] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setUser(s?.user ?? null));
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      setFav(false);
      setStatus(null);
      setMyScore(null);
      return;
    }
    (async () => {
      const [{ data: f }, { data: w }, { data: r }] = await Promise.all([
        supabase.from("favorites").select("id").eq("user_id", user.id).eq("anime_id", animeId).maybeSingle(),
        supabase.from("watchlist").select("status").eq("user_id", user.id).eq("anime_id", animeId).maybeSingle(),
        supabase.from("ratings").select("score").eq("user_id", user.id).eq("anime_id", animeId).maybeSingle(),
      ]);
      setFav(!!f);
      setStatus(w?.status ?? null);
      setMyScore(r?.score ?? null);
    })();
  }, [user, animeId]);

  if (!user) {
    return (
      <div className="rounded-lg border border-border bg-card p-4 text-sm">
        <p className="text-muted-foreground">Jelentkezz be a kedvenc / watchlist / értékelés funkciókhoz.</p>
        <Link to="/auth" className="mt-2 inline-block"><Button size="sm">Bejelentkezés</Button></Link>
      </div>
    );
  }

  async function toggleFav() {
    if (!user) return;
    setBusy(true);
    if (fav) {
      await supabase.from("favorites").delete().eq("user_id", user.id).eq("anime_id", animeId);
      setFav(false);
    } else {
      await supabase.from("favorites").insert({ user_id: user.id, anime_id: animeId });
      setFav(true);
    }
    setBusy(false);
  }

  async function setWatch(newStatus: WatchStatus) {
    if (!user) return;
    setBusy(true);
    await supabase.from("watchlist").upsert(
      { user_id: user.id, anime_id: animeId, status: newStatus },
      { onConflict: "user_id,anime_id" }
    );
    setStatus(newStatus);
    setBusy(false);
  }

  async function rate(score: number) {
    if (!user) return;
    setBusy(true);
    await supabase.from("ratings").upsert(
      { user_id: user.id, anime_id: animeId, score },
      { onConflict: "user_id,anime_id" }
    );
    setMyScore(score);
    setBusy(false);
  }

  return (
    <div className="space-y-4 rounded-lg border border-border bg-card p-4">
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant={fav ? "default" : "outline"} onClick={toggleFav} disabled={busy}>
          {fav ? "★ Kedvenc" : "☆ Kedvencekhez"}
        </Button>
      </div>
      <div>
        <p className="mb-2 text-xs font-medium text-muted-foreground">Watchlist</p>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(STATUS_LABELS) as WatchStatus[]).map((s) => (
            <Button
              key={s}
              size="sm"
              variant={status === s ? "default" : "outline"}
              onClick={() => setWatch(s)}
              disabled={busy}
            >
              {STATUS_LABELS[s]}
            </Button>
          ))}
        </div>
      </div>
      <div>
        <p className="mb-2 text-xs font-medium text-muted-foreground">
          Értékelésed {myScore != null && `– ${myScore}/10`}
        </p>
        <div className="flex flex-wrap gap-1">
          {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              onClick={() => rate(n)}
              disabled={busy}
              className={`h-8 w-8 rounded-md border text-sm transition-colors ${
                myScore != null && n <= myScore
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background hover:border-primary"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}