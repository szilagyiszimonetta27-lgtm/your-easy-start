-- Drop broad public-listing storage SELECT policies (public URLs still work via the CDN)
DROP POLICY IF EXISTS "anime_covers_public_read" ON storage.objects;
DROP POLICY IF EXISTS "avatars_public_read" ON storage.objects;
DROP POLICY IF EXISTS "manga_pages_public_read" ON storage.objects;
DROP POLICY IF EXISTS "shop_images_public_read" ON storage.objects;

-- Tighten permissive INSERT on shop_orders: must be either auth.uid matches user_id, or anonymous order with user_id NULL
DROP POLICY IF EXISTS "shop_orders_insert_any" ON public.shop_orders;
CREATE POLICY "shop_orders_insert_self_or_guest" ON public.shop_orders FOR INSERT
  WITH CHECK (
    (user_id IS NULL AND auth.uid() IS NULL)
    OR (auth.uid() = user_id)
    OR public.has_role(auth.uid(), 'shop_manager')
    OR public.has_role(auth.uid(), 'admin')
  );

-- Lock down SECURITY DEFINER function execution
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;