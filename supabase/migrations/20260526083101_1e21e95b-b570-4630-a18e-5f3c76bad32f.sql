
-- 1) anime_requests: prevent users from self-approving / editing admin fields
DROP POLICY IF EXISTS anime_requests_update_own_or_admin ON public.anime_requests;

CREATE POLICY anime_requests_update_own
  ON public.anime_requests
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND status = 'pending'::request_status
    AND admin_note IS NOT DISTINCT FROM (SELECT admin_note FROM public.anime_requests WHERE id = anime_requests.id)
    AND vote_count IS NOT DISTINCT FROM (SELECT vote_count FROM public.anime_requests WHERE id = anime_requests.id)
  );

CREATE POLICY anime_requests_update_admin
  ON public.anime_requests
  FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- 2) anime_requests: hide admin_note from non-admins via column-level privileges.
--    Admins should read admin_note via a server function using the service role
--    or via Supabase admin tooling.
REVOKE SELECT ON public.anime_requests FROM anon, authenticated;
GRANT SELECT (id, user_id, anime_title, description, myanimelist_url, status, vote_count, created_at)
  ON public.anime_requests TO anon, authenticated;

-- 3) shop_orders: require authentication for placing orders (no guest checkout)
DROP POLICY IF EXISTS shop_orders_insert_self_or_guest ON public.shop_orders;

CREATE POLICY shop_orders_insert_authenticated
  ON public.shop_orders
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND user_id = auth.uid()
  );

CREATE POLICY shop_orders_insert_manager
  ON public.shop_orders
  FOR INSERT
  WITH CHECK (
    public.has_role(auth.uid(), 'shop_manager'::app_role)
    OR public.has_role(auth.uid(), 'admin'::app_role)
  );

-- 4) Storage buckets: add UPDATE/DELETE policies for admin-managed buckets
CREATE POLICY "anime-covers admin update"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'anime-covers' AND public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "anime-covers admin delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'anime-covers' AND public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "manga-pages admin update"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'manga-pages' AND public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "manga-pages admin delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'manga-pages' AND public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "shop-images manager update"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'shop-images'
    AND (public.has_role(auth.uid(), 'shop_manager'::app_role) OR public.has_role(auth.uid(), 'admin'::app_role))
  );

CREATE POLICY "shop-images manager delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'shop-images'
    AND (public.has_role(auth.uid(), 'shop_manager'::app_role) OR public.has_role(auth.uid(), 'admin'::app_role))
  );

-- 5) avatars: owner-scoped DELETE policy (folder = user_id)
CREATE POLICY "avatars owner delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "avatars admin delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'avatars' AND public.has_role(auth.uid(), 'admin'::app_role));
