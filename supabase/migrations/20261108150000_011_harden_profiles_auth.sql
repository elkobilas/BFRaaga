/*
  # Harden profiles / auth

  1. Profiles are created server-side by a trigger on auth.users (works even when
     email confirmation is enabled and the client has no session after signUp).
  2. Clients can no longer INSERT profiles directly (previously a user could insert
     their own row with role = 'admin').
  3. Role changes are guarded: only admins may change roles, except a customer may
     upgrade themself to 'seller' (existing seller onboarding flow).
*/

-- 1. Profile creation trigger -------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    NEW.raw_user_meta_data ->> 'full_name',
    'customer'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Trigger-only function: must not be callable through the Data API.
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Backfill users that have no profile yet
INSERT INTO public.profiles (id, email, full_name, role)
SELECT u.id, COALESCE(u.email, ''), u.raw_user_meta_data ->> 'full_name', 'customer'
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL;

-- 2. No client-side inserts ---------------------------------------------------
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;

-- 3. Update policies + role guard --------------------------------------------
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = id)
  WITH CHECK ((SELECT auth.uid()) = id);

DROP POLICY IF EXISTS "profiles_update_admin" ON public.profiles;
CREATE POLICY "profiles_update_admin"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles a WHERE a.id = (SELECT auth.uid()) AND a.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles a WHERE a.id = (SELECT auth.uid()) AND a.role = 'admin'));

CREATE OR REPLACE FUNCTION public.guard_profile_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  IF NEW.role IS NOT DISTINCT FROM OLD.role THEN
    RETURN NEW;
  END IF;

  -- Trusted server-side roles (dashboard, migrations, service key)
  IF current_user IN ('postgres', 'supabase_admin', 'service_role') THEN
    RETURN NEW;
  END IF;

  -- Admins can change any role
  IF EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = (SELECT auth.uid()) AND role = 'admin'
  ) THEN
    RETURN NEW;
  END IF;

  -- Seller onboarding: a customer may upgrade themself to seller
  IF (SELECT auth.uid()) = OLD.id AND OLD.role = 'customer' AND NEW.role = 'seller' THEN
    RETURN NEW;
  END IF;

  RAISE EXCEPTION 'Not allowed to change role' USING ERRCODE = '42501';
END;
$$;

DROP TRIGGER IF EXISTS profiles_guard_role ON public.profiles;
CREATE TRIGGER profiles_guard_role
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.guard_profile_role();

