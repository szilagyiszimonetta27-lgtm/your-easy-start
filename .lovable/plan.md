## Mit kapunk a feltöltött projektből

A zip egy Replit-alapú **Express + Vite + Drizzle (Postgres)** full-stack alkalmazás. Tartalmazza:

- **Frontend (client/src):** 13 oldal — Home, Browse, AnimeDetails, WatchPage, Auth, Profile, MangaList/Reader, NewsPage, RequestsPage, ShopPage/Product, VerifyEmail, ResetPassword + admin felület.
- **Backend (server/):** ~1220 sor Express route, saját session-auth, Drizzle ORM, Supabase sync.
- **Schema (shared/schema.ts):** users, animes, episodes, ratings, favorites, watchlist, comments, requests, shop/orders, notifications, news, manga — kb. 15+ tábla, több enum.

Ezt **nem lehet egyetlen lépésben** futtatni Lovable-ben, mert a Lovable nem fogad saját Express szervert. Át kell ültetni a Lovable stackre (TanStack Start frontend + Lovable Cloud Postgres/Auth/Storage + Edge Functions).

## Cél-stack

- **Frontend:** Lovable web_app (Vite + React + Tailwind + shadcn) — a meglévő client/src kódot 1:1 portoljuk, mert az is React + Tailwind + shadcn.
- **Backend:** Lovable Cloud
  - DB: a Drizzle schema → SQL migrációkká alakítva, RLS-sel.
  - Auth: Lovable Cloud auth (email+jelszó, Google) a saját session-auth helyett.
  - Storage: anime borítók, avatarok, manga oldalak Cloud Storage bucketben.
  - Edge functions: csak ott, ahol szerveroldali logika kell (pl. Discord webhook értesítés új epizódra, shop rendelés).
- **Roles:** külön `user_roles` tábla + `has_role()` SECURITY DEFINER függvény (a sémában lévő `role` mező helyett — különben jogosultság-eszkaláció).

## Fázisok

A teljes app egyetlen üzenetben nem fér bele. Javaslat: fázisonként haladunk, te jóváhagyod, és lépünk tovább.

**1. fázis — Alap + DB séma (ez a kérés)**
- `add_artifact web_app:anime-streamer` — TanStack Start scaffold létrehozása.
- Lovable Cloud engedélyezése.
- `client/src` átemelése (App, pages, components, ui, hooks, lib, index.css) a scaffoldba, útvonalak átkötése a TanStack Start router-re vagy react-router-ra (amit a scaffold ad).
- DB migráció a `shared/schema.ts` alapján: minden tábla + enum + indexek létrehozása. RLS minden táblára. `user_roles` tábla + `app_role` enum + `has_role()` függvény.
- Tailwind config + design tokenek átemelése.
- Build zöldre, üres állapotban fut a frontend, DB él.

**2. fázis — Auth + alap olvasás**
- Email+jelszó + Google bejelentkezés Lovable Cloud auth-fal.
- `profiles` tábla a Cloud `auth.users`-re kötve (a régi `users` tábla helyett), trigger új user-re.
- Browse / AnimeDetails / Home oldalak: anime + episode olvasás közvetlen a Cloud DB-ből (RLS: anonim olvashat).
- Favoritok, watchlist, rating — bejelentkezett user írhat.

**3. fázis — Watch + media**
- WatchPage + CustomVideoPlayer bekötése. Videó URL-ek a DB-ből; subtitle URL-ek Cloud Storage-ból.
- Borítóképek és avatarok Cloud Storage-ba kerülnek.

**4. fázis — Közösség (comments, requests, news)**
- Komment és válasz, kérés-rendszer, hírek lista — DB + RLS.

**5. fázis — Admin felület**
- Admin oldalak portolása (`role = 'admin'` RLS-sel, `has_role()` ellenőrzéssel). Anime/epizód feltöltés, user-kezelés.

**6. fázis — Shop + manga + notifications (opcionális / utolsó)**
- Shop tábla, rendelések. Manga olvasó. Push/email értesítés új epizódra (edge function + Lovable Email vagy Discord webhook secret-ből).

## Mire van szükségem most tőled

1. **OK az 1. fázisra?** (scaffold + Cloud + DB séma + frontend csontváz — futtatható, de adat még nincs benne)
2. Van-e meglévő **Discord webhook URL / SMTP / Supabase project**, amit használnál? Ha igen, secret-ként hozzáadjuk; ha nem, kihagyom és később pótoljuk.
3. A `client/src` jelenlegi kinézetét tartsuk (sötét, lila #8b5cf6 akcent — a sémából látszik), vagy redesign?

Ha az 1. fázist jóváhagyod, indítom: scaffold + Cloud bekapcsolás + séma + frontend átemelés.