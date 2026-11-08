-- ==============================================================================
-- Migration 012 : Correction des caractères d'encodage des catégories
-- ==============================================================================

UPDATE public.categories SET 
  name = CASE slug
    WHEN 'electronique-informatique' THEN 'Électronique & Informatique'
    WHEN 'mode-vetements' THEN 'Mode & Vêtements'
    WHEN 'maison-decoration' THEN 'Maison & Décoration'
    WHEN 'alimentation-boissons' THEN 'Alimentation & Boissons'
    WHEN 'beaute-sante' THEN 'Beauté & Santé'
    WHEN 'sports-loisirs' THEN 'Sports & Loisirs'
    WHEN 'auto-moto' THEN 'Auto & Moto'
    WHEN 'agriculture-elevage' THEN 'Agriculture & Élevage'
    WHEN 'services-btp' THEN 'Services & BTP'
    WHEN 'enfants-bebes' THEN 'Enfants & Bébés'
    ELSE name
  END,
  description = CASE slug
    WHEN 'electronique-informatique' THEN 'Smartphones, ordinateurs, accessoires tech'
    WHEN 'mode-vetements' THEN 'Vêtements, chaussures, accessoires de mode'
    WHEN 'maison-decoration' THEN 'Meubles, décoration, ustensiles de cuisine'
    WHEN 'alimentation-boissons' THEN 'Produits alimentaires, boissons, épices'
    WHEN 'beaute-sante' THEN 'Cosmétiques, soins, produits de santé'
    WHEN 'sports-loisirs' THEN 'Équipement sportif, jeux, activités'
    WHEN 'auto-moto' THEN 'Véhicules, pièces détachées, accessoires'
    WHEN 'agriculture-elevage' THEN 'Matériel agricole, semences, produits fermiers'
    WHEN 'services-btp' THEN 'Services professionnels, matériaux de construction'
    WHEN 'enfants-bebes' THEN 'Jouets, vêtements enfants, articles bébé'
    ELSE description
  END;

