-- ==============================================================================
-- Migration 013 : Sécurisation de la confidentialité des profils (BOLA / Data Leak)
-- ==============================================================================

-- 1. Supprimer l'ancienne politique trop permissive qui exposait les emails et téléphones de tous les utilisateurs
DROP POLICY IF EXISTS "profiles_select_public" ON public.profiles;

-- 2. Les utilisateurs connectés peuvent voir leur propre profil complet
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = id);

-- 3. Les administrateurs peuvent voir tous les profils pour la modération
DROP POLICY IF EXISTS "profiles_select_admin" ON public.profiles;
CREATE POLICY "profiles_select_admin"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles a
      WHERE a.id = (SELECT auth.uid()) AND a.role IN ('admin', 'moderator')
    )
  );

-- 4. Pour le public (anonyme ou connecté), seuls les profils ayant le rôle 'seller' sont visibles publiquement
-- (pour afficher le nom de la boutique ou les avis)
DROP POLICY IF EXISTS "profiles_select_sellers" ON public.profiles;
CREATE POLICY "profiles_select_sellers"
  ON public.profiles FOR SELECT
  TO anon, authenticated
  USING (role = 'seller');

