ALTER TABLE public.animes
  ADD COLUMN IF NOT EXISTS hero_clip_episode_id uuid,
  ADD COLUMN IF NOT EXISTS hero_clip_start integer,
  ADD COLUMN IF NOT EXISTS hero_clip_end integer;