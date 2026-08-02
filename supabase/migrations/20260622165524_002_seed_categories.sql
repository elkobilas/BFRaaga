/*
# Seed Initial Categories

1. Description
Inserts default product categories for the Burkina Faso marketplace.
Categories are organized by common local commerce sectors.

2. Categories
- Électronique & Informatique
- Mode & Vêtements
- Maison & Décoration
- Alimentation & Boissons
- Beauté & Santé
- Sports & Loisirs
- Auto & Moto
- Agriculture & Élevage
- Services & BTP
- Enfants & Bébés
*/

INSERT INTO categories (name, slug, description, icon, sort_order) VALUES
  ('Électronique & Informatique', 'electronique-informatique', 'Smartphones, ordinateurs, accessoires tech', 'smartphone', 1),
  ('Mode & Vêtements', 'mode-vetements', 'Vêtements, chaussures, accessoires de mode', 'shirt', 2),
  ('Maison & Décoration', 'maison-decoration', 'Meubles, décoration, ustensiles de cuisine', 'home', 3),
  ('Alimentation & Boissons', 'alimentation-boissons', 'Produits alimentaires, boissons, épices', 'utensils', 4),
  ('Beauté & Santé', 'beaute-sante', 'Cosmétiques, soins, produits de santé', 'heart', 5),
  ('Sports & Loisirs', 'sports-loisirs', 'Équipement sportif, jeux, activités', 'dumbbell', 6),
  ('Auto & Moto', 'auto-moto', 'Véhicules, pièces détachées, accessoires', 'car', 7),
  ('Agriculture & Élevage', 'agriculture-elevage', 'Matériel agricole, semences, produits fermiers', 'leaf', 8),
  ('Services & BTP', 'services-btp', 'Services professionnels, matériaux de construction', 'briefcase', 9),
  ('Enfants & Bébés', 'enfants-bebes', 'Jouets, vêtements enfants, articles bébé', 'baby', 10)
ON CONFLICT (slug) DO NOTHING;
