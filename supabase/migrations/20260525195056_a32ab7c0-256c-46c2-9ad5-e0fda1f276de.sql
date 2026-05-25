-- ===== ENUMS =====
CREATE TYPE public.app_role AS ENUM ('user', 'moderator', 'admin', 'shop_manager');
CREATE TYPE public.watchlist_status AS ENUM ('watching', 'planned', 'completed', 'dropped');
CREATE TYPE public.anime_status AS ENUM ('ongoing', 'completed', 'upcoming');
CREATE TYPE public.request_status AS ENUM ('pending', 'accepted', 'rejected');
CREATE TYPE public.order_status AS ENUM ('pending', 'confirmed', 'shipped', 'completed', 'cancelled');
CREATE TYPE public.notification_type AS ENUM ('new_episode', 'comment_reply', 'system', 'request_update');
CREATE TYPE public.news_category AS ENUM ('announcement', 'update', 'event');
CREATE TYPE public.subtitle_type AS ENUM ('embedded', 'external', 'none');

-- ===== PROFILES =====
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  accent_color TEXT DEFAULT '#8b5cf6',
  wallpaper_url TEXT,
  notify_new_episodes BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ===== USER ROLES =====
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- new-user trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user')
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ===== ANIMES =====
CREATE TABLE public.animes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  anime_nev TEXT NOT NULL,
  myanimelist_id INTEGER,
  mufajok TEXT,
  boritokep TEXT,
  video_link TEXT DEFAULT '',
  epizod_szam INTEGER DEFAULT 1,
  leiras TEXT DEFAULT '',
  status public.anime_status DEFAULT 'ongoing',
  ev INTEGER,
  is_featured BOOLEAN DEFAULT FALSE,
  average_rating REAL,
  rating_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.animes ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_animes_featured ON public.animes(is_featured) WHERE is_featured = TRUE;
CREATE INDEX idx_animes_status ON public.animes(status);

-- ===== EPISODES =====
CREATE TABLE public.episodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  anime_id UUID NOT NULL REFERENCES public.animes(id) ON DELETE CASCADE,
  episode_number INTEGER NOT NULL,
  title TEXT,
  video_url TEXT,
  backup_url TEXT,
  url_360p TEXT,
  url_480p TEXT,
  url_720p TEXT,
  url_1080p TEXT,
  subtitle_url TEXT,
  subtitle_type public.subtitle_type DEFAULT 'none',
  opening_start INTEGER,
  opening_end INTEGER,
  ending_start INTEGER,
  ending_end INTEGER,
  thumbnail_url TEXT,
  duration INTEGER,
  discord_notified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.episodes ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_episodes_anime ON public.episodes(anime_id, episode_number);

-- ===== RATINGS / FAVORITES / WATCHLIST / WATCH PROGRESS / SUBS =====
CREATE TABLE public.ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  anime_id UUID NOT NULL REFERENCES public.animes(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score BETWEEN 1 AND 10),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, anime_id)
);
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  anime_id UUID NOT NULL REFERENCES public.animes(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, anime_id)
);
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.watchlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  anime_id UUID NOT NULL REFERENCES public.animes(id) ON DELETE CASCADE,
  status public.watchlist_status NOT NULL DEFAULT 'planned',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, anime_id)
);
ALTER TABLE public.watchlist ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.watch_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  episode_id UUID NOT NULL REFERENCES public.episodes(id) ON DELETE CASCADE,
  anime_id UUID NOT NULL REFERENCES public.animes(id) ON DELETE CASCADE,
  progress_seconds INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, episode_id)
);
ALTER TABLE public.watch_progress ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.episode_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  anime_id UUID NOT NULL REFERENCES public.animes(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, anime_id)
);
ALTER TABLE public.episode_subscriptions ENABLE ROW LEVEL SECURITY;

-- ===== COMMENTS =====
CREATE TABLE public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  anime_id UUID REFERENCES public.animes(id) ON DELETE CASCADE,
  episode_id UUID REFERENCES public.episodes(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  is_spoiler BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_comments_anime ON public.comments(anime_id);
CREATE INDEX idx_comments_episode ON public.comments(episode_id);

-- ===== MANGAS =====
CREATE TABLE public.mangas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  author TEXT,
  cover_image TEXT,
  genres TEXT,
  status TEXT DEFAULT 'ongoing',
  chapter_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.mangas ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.manga_chapters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  manga_id UUID NOT NULL REFERENCES public.mangas(id) ON DELETE CASCADE,
  chapter_number REAL NOT NULL,
  title TEXT,
  pages JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.manga_chapters ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_manga_chapters_manga ON public.manga_chapters(manga_id, chapter_number);

-- ===== NEWS =====
CREATE TABLE public.news (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category public.news_category DEFAULT 'announcement',
  is_pinned BOOLEAN DEFAULT FALSE,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;

-- ===== NOTIFICATIONS =====
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type public.notification_type NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  related_id TEXT,
  related_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_notifications_user ON public.notifications(user_id, is_read);

-- ===== ANIME REQUESTS =====
CREATE TABLE public.anime_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  anime_title TEXT NOT NULL,
  description TEXT,
  myanimelist_url TEXT,
  vote_count INTEGER DEFAULT 0,
  status public.request_status DEFAULT 'pending',
  admin_note TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.anime_requests ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.request_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  request_id UUID NOT NULL REFERENCES public.anime_requests(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, request_id)
);
ALTER TABLE public.request_votes ENABLE ROW LEVEL SECURITY;

-- ===== SHOP =====
CREATE TABLE public.shop_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price REAL NOT NULL,
  images JSONB DEFAULT '[]'::jsonb,
  category TEXT DEFAULT 'other',
  variants JSONB DEFAULT '[]'::jsonb,
  stock INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.shop_products ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.shop_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_email TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  items JSONB NOT NULL,
  total_price REAL NOT NULL,
  status public.order_status DEFAULT 'pending',
  shipping_type TEXT DEFAULT 'delivery',
  shipping_address TEXT,
  payment_method TEXT DEFAULT 'transfer',
  tracking_number TEXT,
  admin_note TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.shop_orders ENABLE ROW LEVEL SECURITY;

-- ===== SITE SETTINGS =====
CREATE TABLE public.site_settings (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- ===== RLS POLICIES =====

-- profiles
CREATE POLICY "profiles_select_all" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- user_roles
CREATE POLICY "user_roles_select_self_or_admin" ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "user_roles_admin_all" ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- animes (public read, admin write)
CREATE POLICY "animes_select_all" ON public.animes FOR SELECT USING (true);
CREATE POLICY "animes_admin_write" ON public.animes FOR ALL
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- episodes
CREATE POLICY "episodes_select_all" ON public.episodes FOR SELECT USING (true);
CREATE POLICY "episodes_admin_write" ON public.episodes FOR ALL
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ratings
CREATE POLICY "ratings_select_all" ON public.ratings FOR SELECT USING (true);
CREATE POLICY "ratings_user_write" ON public.ratings FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- favorites
CREATE POLICY "favorites_select_own" ON public.favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "favorites_user_write" ON public.favorites FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- watchlist
CREATE POLICY "watchlist_select_own" ON public.watchlist FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "watchlist_user_write" ON public.watchlist FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- watch_progress
CREATE POLICY "watch_progress_select_own" ON public.watch_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "watch_progress_user_write" ON public.watch_progress FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- episode_subscriptions
CREATE POLICY "epsubs_select_own" ON public.episode_subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "epsubs_user_write" ON public.episode_subscriptions FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- comments
CREATE POLICY "comments_select_all" ON public.comments FOR SELECT USING (true);
CREATE POLICY "comments_insert_auth" ON public.comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "comments_update_own" ON public.comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "comments_delete_own_or_mod" ON public.comments FOR DELETE
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'moderator') OR public.has_role(auth.uid(), 'admin'));

-- mangas
CREATE POLICY "mangas_select_all" ON public.mangas FOR SELECT USING (true);
CREATE POLICY "mangas_admin_write" ON public.mangas FOR ALL
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- manga_chapters
CREATE POLICY "manga_chapters_select_all" ON public.manga_chapters FOR SELECT USING (true);
CREATE POLICY "manga_chapters_admin_write" ON public.manga_chapters FOR ALL
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- news
CREATE POLICY "news_select_all" ON public.news FOR SELECT USING (true);
CREATE POLICY "news_admin_write" ON public.news FOR ALL
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- notifications
CREATE POLICY "notifications_select_own" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "notifications_update_own" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "notifications_delete_own" ON public.notifications FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "notifications_admin_insert" ON public.notifications FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- anime_requests
CREATE POLICY "anime_requests_select_all" ON public.anime_requests FOR SELECT USING (true);
CREATE POLICY "anime_requests_insert_auth" ON public.anime_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "anime_requests_update_own_or_admin" ON public.anime_requests FOR UPDATE
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "anime_requests_delete_own_or_admin" ON public.anime_requests FOR DELETE
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- request_votes
CREATE POLICY "request_votes_select_all" ON public.request_votes FOR SELECT USING (true);
CREATE POLICY "request_votes_user_write" ON public.request_votes FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- shop_products
CREATE POLICY "shop_products_select_visible" ON public.shop_products FOR SELECT
  USING (is_visible OR public.has_role(auth.uid(), 'shop_manager') OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "shop_products_manager_write" ON public.shop_products FOR ALL
  USING (public.has_role(auth.uid(), 'shop_manager') OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'shop_manager') OR public.has_role(auth.uid(), 'admin'));

-- shop_orders
CREATE POLICY "shop_orders_select_own_or_mgr" ON public.shop_orders FOR SELECT
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'shop_manager') OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "shop_orders_insert_any" ON public.shop_orders FOR INSERT WITH CHECK (true);
CREATE POLICY "shop_orders_mgr_update" ON public.shop_orders FOR UPDATE
  USING (public.has_role(auth.uid(), 'shop_manager') OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "shop_orders_admin_delete" ON public.shop_orders FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- site_settings
CREATE POLICY "site_settings_select_all" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "site_settings_admin_write" ON public.site_settings FOR ALL
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ===== STORAGE BUCKETS =====
INSERT INTO storage.buckets (id, name, public) VALUES
  ('anime-covers', 'anime-covers', true),
  ('avatars', 'avatars', true),
  ('manga-pages', 'manga-pages', true),
  ('shop-images', 'shop-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "anime_covers_public_read" ON storage.objects FOR SELECT
  USING (bucket_id = 'anime-covers');
CREATE POLICY "anime_covers_admin_write" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'anime-covers' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "avatars_public_read" ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');
CREATE POLICY "avatars_user_write" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "avatars_user_update" ON storage.objects FOR UPDATE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "manga_pages_public_read" ON storage.objects FOR SELECT
  USING (bucket_id = 'manga-pages');
CREATE POLICY "manga_pages_admin_write" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'manga-pages' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "shop_images_public_read" ON storage.objects FOR SELECT
  USING (bucket_id = 'shop-images');
CREATE POLICY "shop_images_mgr_write" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'shop-images' AND (public.has_role(auth.uid(), 'shop_manager') OR public.has_role(auth.uid(), 'admin')));