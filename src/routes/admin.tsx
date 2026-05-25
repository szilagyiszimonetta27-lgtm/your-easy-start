import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin – AxelSub" }] }),
  component: AdminPage,
});

function AdminPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      const u = data.session?.user ?? null;
      setUser(u);
      if (!u) {
        setIsAdmin(false);
        return;
      }
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", u.id);
      setIsAdmin((roles ?? []).some((r) => r.role === "admin"));
    })();
  }, []);

  if (isAdmin === null) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <p className="container mx-auto px-4 py-10 text-muted-foreground">Ellenőrzés...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-10">
          <p className="text-muted-foreground">Bejelentkezés szükséges.</p>
          <Button className="mt-3" onClick={() => navigate({ to: "/auth" })}>Bejelentkezés</Button>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-10">
          <h1 className="text-2xl font-bold">Nincs admin jogod</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            A user ID-d: <code className="rounded bg-muted px-2 py-1">{user.id}</code>
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Lovable Cloud → Database → user_roles táblába szúrj be egy sort: user_id = a fentit, role = admin.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto grid gap-8 px-4 py-10 md:grid-cols-2">
        <NewAnimeForm />
        <NewEpisodeForm />
      </main>
    </div>
  );
}

function NewAnimeForm() {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    anime_nev: "",
    leiras: "",
    boritokep: "",
    mufajok: "",
    ev: "",
    epizod_szam: "",
    is_featured: false,
  });
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    const { error } = await supabase.from("animes").insert({
      anime_nev: form.anime_nev,
      leiras: form.leiras || null,
      boritokep: form.boritokep || null,
      mufajok: form.mufajok || null,
      ev: form.ev ? Number(form.ev) : null,
      epizod_szam: form.epizod_szam ? Number(form.epizod_szam) : null,
      is_featured: form.is_featured,
    });
    setBusy(false);
    if (error) {
      setMsg("Hiba: " + error.message);
    } else {
      setMsg("Anime hozzáadva!");
      setForm({ anime_nev: "", leiras: "", boritokep: "", mufajok: "", ev: "", epizod_szam: "", is_featured: false });
      qc.invalidateQueries({ queryKey: ["latest-animes"] });
      qc.invalidateQueries({ queryKey: ["featured-animes"] });
      qc.invalidateQueries({ queryKey: ["browse-animes"] });
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3 rounded-xl border border-border bg-card p-6">
      <h2 className="text-xl font-bold">Új anime</h2>
      <div>
        <Label>Cím *</Label>
        <Input required value={form.anime_nev} onChange={(e) => setForm({ ...form, anime_nev: e.target.value })} />
      </div>
      <div>
        <Label>Borító URL</Label>
        <Input value={form.boritokep} onChange={(e) => setForm({ ...form, boritokep: e.target.value })} placeholder="https://..." />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div>
          <Label>Év</Label>
          <Input type="number" value={form.ev} onChange={(e) => setForm({ ...form, ev: e.target.value })} />
        </div>
        <div>
          <Label>Epizódok</Label>
          <Input type="number" value={form.epizod_szam} onChange={(e) => setForm({ ...form, epizod_szam: e.target.value })} />
        </div>
        <div className="flex flex-col">
          <Label>Kiemelt</Label>
          <label className="mt-2 flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} />
            Igen
          </label>
        </div>
      </div>
      <div>
        <Label>Műfajok</Label>
        <Input value={form.mufajok} onChange={(e) => setForm({ ...form, mufajok: e.target.value })} placeholder="akció, kaland" />
      </div>
      <div>
        <Label>Leírás</Label>
        <Textarea rows={4} value={form.leiras} onChange={(e) => setForm({ ...form, leiras: e.target.value })} />
      </div>
      <Button type="submit" disabled={busy}>{busy ? "Mentés..." : "Mentés"}</Button>
      {msg && <p className="text-sm">{msg}</p>}
    </form>
  );
}

function NewEpisodeForm() {
  const { data: animes } = useQuery({
    queryKey: ["admin-animes-select"],
    queryFn: async () => {
      const { data, error } = await supabase.from("animes").select("id, anime_nev").order("anime_nev");
      if (error) throw error;
      return data ?? [];
    },
  });

  const [form, setForm] = useState({
    anime_id: "",
    episode_number: "",
    title: "",
    video_url: "",
    url_720p: "",
    url_1080p: "",
    subtitle_url: "",
    thumbnail_url: "",
  });
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.anime_id || !form.episode_number) return;
    setBusy(true);
    setMsg(null);
    const { error } = await supabase.from("episodes").insert({
      anime_id: form.anime_id,
      episode_number: Number(form.episode_number),
      title: form.title || null,
      video_url: form.video_url || null,
      url_720p: form.url_720p || null,
      url_1080p: form.url_1080p || null,
      subtitle_url: form.subtitle_url || null,
      thumbnail_url: form.thumbnail_url || null,
    });
    setBusy(false);
    if (error) {
      setMsg("Hiba: " + error.message);
    } else {
      setMsg("Epizód hozzáadva!");
      setForm({ ...form, episode_number: "", title: "", video_url: "", url_720p: "", url_1080p: "", subtitle_url: "", thumbnail_url: "" });
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3 rounded-xl border border-border bg-card p-6">
      <h2 className="text-xl font-bold">Új epizód</h2>
      <div>
        <Label>Anime *</Label>
        <select
          required
          value={form.anime_id}
          onChange={(e) => setForm({ ...form, anime_id: e.target.value })}
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">Válassz...</option>
          {animes?.map((a) => <option key={a.id} value={a.id}>{a.anime_nev}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label>Rész szám *</Label>
          <Input type="number" required value={form.episode_number} onChange={(e) => setForm({ ...form, episode_number: e.target.value })} />
        </div>
        <div>
          <Label>Cím</Label>
          <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </div>
      </div>
      <div>
        <Label>Videó URL (általános)</Label>
        <Input value={form.video_url} onChange={(e) => setForm({ ...form, video_url: e.target.value })} placeholder="https://..." />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label>720p URL</Label>
          <Input value={form.url_720p} onChange={(e) => setForm({ ...form, url_720p: e.target.value })} />
        </div>
        <div>
          <Label>1080p URL</Label>
          <Input value={form.url_1080p} onChange={(e) => setForm({ ...form, url_1080p: e.target.value })} />
        </div>
      </div>
      <div>
        <Label>Felirat URL (.vtt)</Label>
        <Input value={form.subtitle_url} onChange={(e) => setForm({ ...form, subtitle_url: e.target.value })} />
      </div>
      <div>
        <Label>Thumbnail URL</Label>
        <Input value={form.thumbnail_url} onChange={(e) => setForm({ ...form, thumbnail_url: e.target.value })} />
      </div>
      <Button type="submit" disabled={busy}>{busy ? "Mentés..." : "Mentés"}</Button>
      {msg && <p className="text-sm">{msg}</p>}
    </form>
  );
}