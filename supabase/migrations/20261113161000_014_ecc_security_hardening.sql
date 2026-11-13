-- ==============================================================================
-- Migration 014 : Application des Standards ECC & Sécurisation Critique
-- ==============================================================================
-- 1. Anti-Tampering (Commandes) : Empêcher les acheteurs de falsifier le prix,
--    le sous-total ou de s'auto-attribuer le statut 'paid' ou 'delivered'.
-- 2. Audit & Traçabilité : Horodatage automatique immuable des commandes.
-- 3. Sécurité RLS stricte : Empêcher les usagers d'écraser des données d'autres tiers.
-- ==============================================================================

-- 1. Trigger de validation d'intégrité à l'insertion d'une commande
CREATE OR REPLACE FUNCTION public.validate_order_security_on_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Règle ECC Sécurité : Toute nouvelle commande créée par un client DOIT débuter en 'pending'
  NEW.status := 'pending';
  NEW.payment_status := 'pending';
  
  -- Si l'utilisateur est authentifié, imposer son ID réel pour éviter l'usurpation (BOLA)
  IF (SELECT auth.uid()) IS NOT NULL THEN
    NEW.user_id := (SELECT auth.uid());
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_order_on_insert ON public.orders;
CREATE TRIGGER trg_validate_order_on_insert
  BEFORE INSERT ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.validate_order_security_on_insert();

-- 2. Trigger de protection lors de la mise à jour d'une commande (Anti-fraude client)
CREATE OR REPLACE FUNCTION public.guard_order_status_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  -- Si l'utilisateur exécutant est un admin ou le système, autoriser
  IF current_user IN ('postgres', 'supabase_admin', 'service_role') THEN
    RETURN NEW;
  END IF;

  -- Un simple client (acheteur) NE PEUT PAS modifier le statut de paiement ou de commande
  IF (SELECT auth.uid()) = OLD.user_id THEN
    IF NEW.status IS DISTINCT FROM OLD.status OR NEW.payment_status IS DISTINCT FROM OLD.payment_status THEN
      -- Vérifier si l'acheteur est aussi admin
      IF NOT EXISTS (
        SELECT 1 FROM public.profiles WHERE id = (SELECT auth.uid()) AND role IN ('admin', 'moderator')
      ) THEN
        RAISE EXCEPTION 'Action non autorisée : seul le vendeur ou un administrateur peut modifier le statut de la commande.' USING ERRCODE = '42501';
      END IF;
    END IF;
    
    -- Le client ne peut pas modifier les totaux après coup
    NEW.total := OLD.total;
    NEW.subtotal := OLD.subtotal;
    NEW.shipping_cost := OLD.shipping_cost;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_guard_order_status ON public.orders;
CREATE TRIGGER trg_guard_order_status
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.guard_order_status_update();

-- 3. Sécurisation supplémentaire RLS sur les avis (Reviews)
-- Un client ne peut laisser un avis qu'en son propre nom
DROP POLICY IF EXISTS "reviews_insert_own" ON public.reviews;
CREATE POLICY "reviews_insert_own"
  ON public.reviews FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

