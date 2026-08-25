/*
# Fix search_path on trigger function

Sets a fixed search_path on the update_updated_at() trigger function to resolve
the security advisor warning about mutable search_path.
*/

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = pg_catalog, public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
