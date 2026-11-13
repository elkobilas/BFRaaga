# Règles d'Ingénierie & Standards de Sécurité ECC (BFRaaga)

Ce document formalise l'application des méthodologies et standards du framework **ECC (Everything Claude Code / Enterprise Clean Code)** adaptés à la marketplace **BF RAAGA**.

---

## 1. Sécurité & Contrôle d'Accès (Security by Design)

- **Principe du Moindre Privilège (PoLP) :**
  - Aucune clé de service (`service_role`) ne doit être injectée ou exposée dans le code frontend / React.
  - Seule la clé publique (`VITE_SUPABASE_ANON_KEY`) est autorisée côté navigateur.
- **Défense en profondeur (Row-Level Security - RLS) :**
  - Toute table Supabase publique **DOIT** avoir `ENABLE ROW LEVEL SECURITY`.
  - Pas d'utilisation de `auth.role() = 'authenticated'` seul (risque BOLA / usurpation). Toujours lier la politique à la possession réelle du compte : `(SELECT auth.uid()) = user_id`.
  - Protection contre la falsification des commandes (Migration `014`) : un client ne peut pas changer l'état d'un paiement ou d'une commande à son avantage (`paid`, `delivered`).
- **Protection des Données Personnelles :**
  - Restreindre la lecture des profils clients aux seuls propriétaires et administrateurs.
  - Seuls les profils déclarés comme vendeurs (`role = 'seller'`) sont exposés publiquement pour les fiches produits et avis.

---

## 2. Qualité de Code & TypeScript Strict

- **Zéro `any` explicite :** Typer rigoureusement les états, réponses d'API et modèles Supabase (`src/types/database.ts`).
- **Assainissement des Entrées (Input Sanitization) :**
  - Valider systématiquement les formulaires de création de produits, avis, inscriptions.
  - Empêcher l'injection de scripts ou de balises non échappées (`dangerouslySetInnerHTML` proscrit sans sanitization préalable).
- **Gestion Déterministe des Erreurs :**
  - Ne jamais masquer une erreur sous un message générique trompeur (ex: séparer "Email non confirmé", "Mot de passe erroné", "Compte inexistant").

---

## 3. Performance & Résilience

- **Optimisation des Requêtes :**
  - Utilisation systématique de clauses `.select()` explicites avec index Postgres adaptés (`idx_products_seller_id`, `idx_orders_user_id`).
  - Pagination systématique (`.limit()`, `.range()`) sur les flux de produits et catalogues.
- **Cache & Rechargement :**
  - Ne pas re-télécharger inutilement les profils ou paniers à chaque rendu de composant.

---

## 4. Intégrité des Migrations Base de Données

- Toute modification de schéma doit être idempotente (`IF EXISTS`, `ON CONFLICT DO NOTHING`).
- L'historique des migrations SQL est numéroté séquentiellement dans `supabase/migrations/` et synchronisé via `supabase db push` ou le SQL Editor Supabase.

