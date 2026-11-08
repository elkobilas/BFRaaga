
-- ===== 20260622165514_001_create_marketplace_schema.sql =====

/*
# Marketplace Database Schema - Initial Setup

1. New Tables
- `profiles` â€” extends auth.users with marketplace-specific data (role, phone, avatar, location)
- `sellers` â€” vendor business profiles with KYC info, logo, description, address, contact
- `categories` â€” product categories with hierarchy support
- `products` â€” product catalog with title, description, price, stock, condition, location
- `product_images` â€” product photos and videos
- `cart_items` â€” persistent shopping cart
- `orders` â€” customer orders with status, total, delivery info
- `order_items` â€” order line items
- `reviews` â€” product ratings and reviews
- `favorites` â€” user's favorite products

2. Security
- Enable RLS on ALL tables.
- Profiles: users can manage their own; public can view basic seller info.
- Sellers: owner can manage their own; public can view.
- Products: seller can CRUD own; public can read.
- Cart: owner-only CRUD.
- Orders: owner can read own; admin can read all; seller can read orders containing their products.
- Reviews: owner can manage own; public can read.
- Favorites: owner-only CRUD.
- Categories: public read only; admin can manage.

3. Notes
- Currency: XOF (CFA franc) for Burkina Faso.
- Product condition: new, used, refurbished.
- Order status: pending, confirmed, paid, shipped, delivered, cancelled, refunded.
- Payment status: pending, paid, failed, refunded.
- Delivery mode: pickup, home_delivery.
*/

-- ============================================
-- PROFILES (extends auth.users)
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  phone text,
  avatar_url text,
  role text NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'seller', 'admin', 'moderator')),
  location text,
  city text DEFAULT 'Ouagadougou',
  country text DEFAULT 'Burkina Faso',
  is_verified boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_city ON profiles(city);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
CREATE POLICY "profiles_select_own"
  ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_select_public" ON profiles;
CREATE POLICY "profiles_select_public"
  ON profiles FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own"
  ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- ============================================
-- SELLERS
-- ============================================
CREATE TABLE IF NOT EXISTS sellers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  logo_url text,
  cover_image_url text,
  address text,
  city text DEFAULT 'Ouagadougou',
  country text DEFAULT 'Burkina Faso',
  phone text,
  email text,
  whatsapp text,
  business_hours text,
  is_verified boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  commission_rate decimal(5,2) NOT NULL DEFAULT 5.00,
  total_sales integer NOT NULL DEFAULT 0,
  rating decimal(2,1) DEFAULT 0.0,
  review_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sellers_user_id ON sellers(user_id);
CREATE INDEX IF NOT EXISTS idx_sellers_slug ON sellers(slug);
CREATE INDEX IF NOT EXISTS idx_sellers_city ON sellers(city);
CREATE INDEX IF NOT EXISTS idx_sellers_active ON sellers(is_active);

ALTER TABLE sellers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "sellers_select_public" ON sellers;
CREATE POLICY "sellers_select_public"
  ON sellers FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "sellers_insert_own" ON sellers;
CREATE POLICY "sellers_insert_own"
  ON sellers FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "sellers_update_own" ON sellers;
CREATE POLICY "sellers_update_own"
  ON sellers FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "sellers_delete_own" ON sellers;
CREATE POLICY "sellers_delete_own"
  ON sellers FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ============================================
-- CATEGORIES
-- ============================================
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  icon text,
  image_url text,
  parent_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(is_active);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "categories_select_public" ON categories;
CREATE POLICY "categories_select_public"
  ON categories FOR SELECT
  TO anon, authenticated USING (true);

-- ============================================
-- PRODUCTS
-- ============================================
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text NOT NULL,
  price decimal(12,2) NOT NULL CHECK (price >= 0),
  compare_price decimal(12,2) CHECK (compare_price >= 0),
  currency text NOT NULL DEFAULT 'XOF',
  stock integer NOT NULL DEFAULT 0 CHECK (stock >= 0),
  condition text NOT NULL DEFAULT 'new' CHECK (condition IN ('new', 'used', 'refurbished')),
  sku text,
  weight_kg decimal(8,2),
  tags text[],
  location text,
  city text DEFAULT 'Ouagadougou',
  is_active boolean NOT NULL DEFAULT true,
  is_featured boolean NOT NULL DEFAULT false,
  total_sales integer NOT NULL DEFAULT 0,
  rating decimal(2,1) DEFAULT 0.0,
  review_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_products_seller ON products(seller_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_city ON products(city);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_products_created ON products(created_at);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "products_select_public" ON products;
CREATE POLICY "products_select_public"
  ON products FOR SELECT
  TO anon, authenticated USING (is_active = true);

DROP POLICY IF EXISTS "products_insert_seller" ON products;
CREATE POLICY "products_insert_seller"
  ON products FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM sellers WHERE sellers.id = products.seller_id AND sellers.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "products_update_seller" ON products;
CREATE POLICY "products_update_seller"
  ON products FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM sellers WHERE sellers.id = products.seller_id AND sellers.user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM sellers WHERE sellers.id = products.seller_id AND sellers.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "products_delete_seller" ON products;
CREATE POLICY "products_delete_seller"
  ON products FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM sellers WHERE sellers.id = products.seller_id AND sellers.user_id = auth.uid())
  );

-- ============================================
-- PRODUCT IMAGES
-- ============================================
CREATE TABLE IF NOT EXISTS product_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url text NOT NULL,
  alt_text text,
  sort_order integer NOT NULL DEFAULT 0,
  is_primary boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_product_images_product ON product_images(product_id);

ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "product_images_select_public" ON product_images;
CREATE POLICY "product_images_select_public"
  ON product_images FOR SELECT
  TO anon, authenticated USING (
    EXISTS (SELECT 1 FROM products WHERE products.id = product_images.product_id AND products.is_active = true)
  );

DROP POLICY IF EXISTS "product_images_insert_seller" ON product_images;
CREATE POLICY "product_images_insert_seller"
  ON product_images FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM products JOIN sellers ON products.seller_id = sellers.id WHERE products.id = product_images.product_id AND sellers.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "product_images_delete_seller" ON product_images;
CREATE POLICY "product_images_delete_seller"
  ON product_images FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM products JOIN sellers ON products.seller_id = sellers.id WHERE products.id = product_images.product_id AND sellers.user_id = auth.uid())
  );

-- ============================================
-- CART ITEMS
-- ============================================
CREATE TABLE IF NOT EXISTS cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_cart_items_user ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product ON cart_items(product_id);

ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "cart_items_select_own" ON cart_items;
CREATE POLICY "cart_items_select_own"
  ON cart_items FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "cart_items_insert_own" ON cart_items;
CREATE POLICY "cart_items_insert_own"
  ON cart_items FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "cart_items_update_own" ON cart_items;
CREATE POLICY "cart_items_update_own"
  ON cart_items FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "cart_items_delete_own" ON cart_items;
CREATE POLICY "cart_items_delete_own"
  ON cart_items FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ============================================
-- ORDERS
-- ============================================
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  order_number text UNIQUE NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'paid', 'shipped', 'delivered', 'cancelled', 'refunded')),
  payment_status text NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  payment_method text,
  subtotal decimal(12,2) NOT NULL DEFAULT 0,
  shipping_cost decimal(12,2) NOT NULL DEFAULT 0,
  platform_fee decimal(12,2) NOT NULL DEFAULT 0,
  total decimal(12,2) NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'XOF',
  delivery_mode text NOT NULL DEFAULT 'home_delivery' CHECK (delivery_mode IN ('pickup', 'home_delivery')),
  delivery_address text,
  delivery_city text,
  delivery_phone text,
  delivery_notes text,
  tracking_number text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "orders_select_own" ON orders;
CREATE POLICY "orders_select_own"
  ON orders FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "orders_insert_own" ON orders;
CREATE POLICY "orders_insert_own"
  ON orders FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "orders_update_own" ON orders;
CREATE POLICY "orders_update_own"
  ON orders FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================
-- ORDER ITEMS
-- ============================================
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE SET NULL,
  seller_id uuid NOT NULL REFERENCES sellers(id) ON DELETE SET NULL,
  title text NOT NULL,
  price decimal(12,2) NOT NULL,
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  subtotal decimal(12,2) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_order_items_seller ON order_items(seller_id);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "order_items_select_own" ON order_items;
CREATE POLICY "order_items_select_own"
  ON order_items FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
  );

-- ============================================
-- REVIEWS
-- ============================================
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  order_id uuid REFERENCES orders(id) ON DELETE SET NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title text,
  comment text,
  is_approved boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_approved ON reviews(is_approved);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "reviews_select_public" ON reviews;
CREATE POLICY "reviews_select_public"
  ON reviews FOR SELECT
  TO anon, authenticated USING (is_approved = true);

DROP POLICY IF EXISTS "reviews_insert_own" ON reviews;
CREATE POLICY "reviews_insert_own"
  ON reviews FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "reviews_update_own" ON reviews;
CREATE POLICY "reviews_update_own"
  ON reviews FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "reviews_delete_own" ON reviews;
CREATE POLICY "reviews_delete_own"
  ON reviews FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ============================================
-- FAVORITES
-- ============================================
CREATE TABLE IF NOT EXISTS favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_product ON favorites(product_id);

ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "favorites_select_own" ON favorites;
CREATE POLICY "favorites_select_own"
  ON favorites FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "favorites_insert_own" ON favorites;
CREATE POLICY "favorites_insert_own"
  ON favorites FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "favorites_delete_own" ON favorites;
CREATE POLICY "favorites_delete_own"
  ON favorites FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS text AS $$
DECLARE
  prefix text := 'BF-';
  timestamp_part text;
  random_part text;
BEGIN
  timestamp_part := to_char(now(), 'YYYYMMDD');
  random_part := substr(md5(random()::text), 1, 6);
  RETURN prefix || timestamp_part || '-' || upper(random_part);
END;
$$ LANGUAGE plpgsql;

-- Trigger function to auto-generate order number
CREATE OR REPLACE FUNCTION set_order_number()
RETURNS trigger AS $$
BEGIN
  IF NEW.order_number IS NULL THEN
    NEW.order_number := generate_order_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_order_number ON orders;
CREATE TRIGGER trigger_set_order_number
  BEFORE INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION set_order_number();

-- Function to update product rating on review insert/update/delete
CREATE OR REPLACE FUNCTION update_product_rating()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE products
    SET rating = (
      SELECT COALESCE(AVG(rating), 0)
      FROM reviews
      WHERE product_id = NEW.product_id AND is_approved = true
    ),
    review_count = (
      SELECT COUNT(*)
      FROM reviews
      WHERE product_id = NEW.product_id AND is_approved = true
    )
    WHERE id = NEW.product_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE products
    SET rating = (
      SELECT COALESCE(AVG(rating), 0)
      FROM reviews
      WHERE product_id = OLD.product_id AND is_approved = true
    ),
    review_count = (
      SELECT COUNT(*)
      FROM reviews
      WHERE product_id = OLD.product_id AND is_approved = true
    )
    WHERE id = OLD.product_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_product_rating ON reviews;
CREATE TRIGGER trigger_update_product_rating
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_product_rating();

-- Function to update seller rating on review changes
CREATE OR REPLACE FUNCTION update_seller_rating()
RETURNS trigger AS $$
BEGIN
  UPDATE sellers
  SET rating = (
    SELECT COALESCE(AVG(r.rating), 0)
    FROM reviews r
    JOIN products p ON r.product_id = p.id
    WHERE p.seller_id = sellers.id AND r.is_approved = true
  ),
  review_count = (
    SELECT COUNT(*)
    FROM reviews r
    JOIN products p ON r.product_id = p.id
    WHERE p.seller_id = sellers.id AND r.is_approved = true
  )
  WHERE id = (
    SELECT seller_id FROM products WHERE id = COALESCE(NEW.product_id, OLD.product_id)
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_seller_rating ON reviews;
CREATE TRIGGER trigger_update_seller_rating
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_seller_rating();


-- ===== 20260622165524_002_seed_categories.sql =====

/*
# Seed Initial Categories

1. Description
Inserts default product categories for the Burkina Faso marketplace.
Categories are organized by common local commerce sectors.

2. Categories
- Ã‰lectronique & Informatique
- Mode & VÃªtements
- Maison & DÃ©coration
- Alimentation & Boissons
- BeautÃ© & SantÃ©
- Sports & Loisirs
- Auto & Moto
- Agriculture & Ã‰levage
- Services & BTP
- Enfants & BÃ©bÃ©s
*/

INSERT INTO categories (name, slug, description, icon, sort_order) VALUES
  ('Ã‰lectronique & Informatique', 'electronique-informatique', 'Smartphones, ordinateurs, accessoires tech', 'smartphone', 1),
  ('Mode & VÃªtements', 'mode-vetements', 'VÃªtements, chaussures, accessoires de mode', 'shirt', 2),
  ('Maison & DÃ©coration', 'maison-decoration', 'Meubles, dÃ©coration, ustensiles de cuisine', 'home', 3),
  ('Alimentation & Boissons', 'alimentation-boissons', 'Produits alimentaires, boissons, Ã©pices', 'utensils', 4),
  ('BeautÃ© & SantÃ©', 'beaute-sante', 'CosmÃ©tiques, soins, produits de santÃ©', 'heart', 5),
  ('Sports & Loisirs', 'sports-loisirs', 'Ã‰quipement sportif, jeux, activitÃ©s', 'dumbbell', 6),
  ('Auto & Moto', 'auto-moto', 'VÃ©hicules, piÃ¨ces dÃ©tachÃ©es, accessoires', 'car', 7),
  ('Agriculture & Ã‰levage', 'agriculture-elevage', 'MatÃ©riel agricole, semences, produits fermiers', 'leaf', 8),
  ('Services & BTP', 'services-btp', 'Services professionnels, matÃ©riaux de construction', 'briefcase', 9),
  ('Enfants & BÃ©bÃ©s', 'enfants-bebes', 'Jouets, vÃªtements enfants, articles bÃ©bÃ©', 'baby', 10)
ON CONFLICT (slug) DO NOTHING;


-- ===== 20260622213301_004_create_storage_bucket.sql =====

/*
# Create Product Images Storage Bucket

1. New Storage
- `product-images` bucket â€” public, for product and seller photos
- `avatars` bucket â€” public, for user and seller avatars

2. Security
- RLS policies allowing authenticated users to upload images
- Public read access for product images
- Sellers can upload to their own product folder
*/

-- Create storage bucket for product images
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-images', 'product-images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/jpg'])
on conflict (id) do nothing;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 2097152, array['image/jpeg', 'image/png', 'image/webp', 'image/jpg'])
on conflict (id) do nothing;

-- Allow public read of product images
CREATE POLICY "product_images_public_read" ON storage.objects
FOR SELECT TO anon, authenticated
USING (bucket_id = 'product-images');

-- Allow authenticated users to upload product images
CREATE POLICY "product_images_upload" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'product-images');

-- Allow authenticated users to update their own images
CREATE POLICY "product_images_update" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'product-images' AND owner = auth.uid());

-- Allow authenticated users to delete their own images
CREATE POLICY "product_images_delete" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'product-images' AND owner = auth.uid());

-- Allow public read of avatars
CREATE POLICY "avatars_public_read" ON storage.objects
FOR SELECT TO anon, authenticated
USING (bucket_id = 'avatars');

-- Allow authenticated users to upload avatars
CREATE POLICY "avatars_upload" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'avatars');


-- ===== 20260622213750_005_alter_orders_user_id_nullable.sql =====

/*
# Allow guest orders by making user_id nullable

1. Changes
- Make orders.user_id nullable to support guest checkout
- Make orders.delivery_address nullable for pickup orders
*/

ALTER TABLE orders ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE orders ALTER COLUMN delivery_address DROP NOT NULL;


-- ===== 20260622213808_005_alter_orders_user_id_nullable.sql =====

/*
# Allow guest orders by making user_id nullable

1. Changes
- Make orders.user_id nullable to support guest checkout
- Make orders.delivery_address nullable for pickup orders
*/

ALTER TABLE orders ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE orders ALTER COLUMN delivery_address DROP NOT NULL;


-- ===== 20260622213823_006_make_order_user_id_nullable.sql =====

/*
# Make user_id nullable for guest orders

1. Changes
- orders.user_id is now nullable
- orders.delivery_address is now nullable
*/

ALTER TABLE orders ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE orders ALTER COLUMN delivery_address DROP NOT NULL;


-- ===== 20260622215715_007_fix_order_items_rls.sql =====

/*
# Fix RLS policy for order_items to allow guest checkout

1. Changes
- Allow anonymous/anon to insert order_items (for guest checkout)
- Allow anonymous/anon to insert orders (for guest checkout)
- Update existing order_items policies to be more permissive
*/

-- Drop existing order_items policies that may block guest insert
DROP POLICY IF EXISTS "order_items_insert_own" ON order_items;

-- Allow authenticated users to insert order_items for their own orders
CREATE POLICY "order_items_insert_auth" ON order_items
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
  )
);

-- Allow anonymous/guest users to insert order_items (for guest checkout)
CREATE POLICY "order_items_insert_anon" ON order_items
FOR INSERT TO anon
WITH CHECK (true);

-- Also allow anon to insert orders
DROP POLICY IF EXISTS "orders_insert_own" ON orders;

CREATE POLICY "orders_insert_auth" ON orders
FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "orders_insert_anon" ON orders
FOR INSERT TO anon
WITH CHECK (true);


-- ===== 20260623081932_008_stock_management_and_order_triggers.sql =====

/*
# Stock Management and Order Triggers

1. New Functions
- Function to decrement stock on order confirmation
- Function to increment total_sales on order completion
- Function to prevent overselling (check stock before insert)

2. Triggers
- Trigger on order_items insert to check stock availability
- Trigger on order status change to adjust stock
*/

-- Function to check stock before inserting order_items
CREATE OR REPLACE FUNCTION check_stock_availability()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if product exists and has enough stock
  IF NOT EXISTS (
    SELECT 1 FROM products
    WHERE id = NEW.product_id AND stock >= NEW.quantity
  ) THEN
    RAISE EXCEPTION 'Stock insuffisant pour le produit %', NEW.product_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to check stock before inserting order_items
DROP TRIGGER IF EXISTS trigger_check_stock ON order_items;
CREATE TRIGGER trigger_check_stock
  BEFORE INSERT ON order_items
  FOR EACH ROW
  EXECUTE FUNCTION check_stock_availability();

-- Function to decrement stock when order is confirmed/paid
CREATE OR REPLACE FUNCTION decrement_stock_on_order()
RETURNS TRIGGER AS $$
BEGIN
  -- Only decrement when status changes to confirmed/paid
  IF (OLD.status IS DISTINCT FROM NEW.status) AND (NEW.status IN ('confirmed', 'paid', 'shipped', 'delivered')) THEN
    -- Update stock for each product in the order
    UPDATE products
    SET stock = stock - oi.quantity,
        total_sales = total_sales + oi.quantity
    FROM order_items oi
    WHERE oi.order_id = NEW.id
      AND products.id = oi.product_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger on orders status change
DROP TRIGGER IF EXISTS trigger_decrement_stock ON orders;
CREATE TRIGGER trigger_decrement_stock
  AFTER UPDATE OF status ON orders
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION decrement_stock_on_order();

-- Function to increment stock when order is cancelled
CREATE OR REPLACE FUNCTION restore_stock_on_cancel()
RETURNS TRIGGER AS $$
BEGIN
  -- Only restore when status changes to cancelled
  IF (OLD.status IS DISTINCT FROM NEW.status) AND (NEW.status = 'cancelled') THEN
    -- Restore stock for each product in the order
    UPDATE products
    SET stock = stock + oi.quantity,
        total_sales = total_sales - oi.quantity
    FROM order_items oi
    WHERE oi.order_id = NEW.id
      AND products.id = oi.product_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger on orders cancellation
DROP TRIGGER IF EXISTS trigger_restore_stock ON orders;
CREATE TRIGGER trigger_restore_stock
  AFTER UPDATE OF status ON orders
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION restore_stock_on_cancel();

-- Add a constraint to prevent negative stock
ALTER TABLE products
  ADD CONSTRAINT check_stock_non_negative
  CHECK (stock >= 0);


-- ===== 20260623082022_009_seller_order_rls.sql =====

/*
# Seller Order RLS Policies

1. Allow sellers to view orders that contain their products
2. Allow sellers to update order status (confirm, ship, mark delivered)
3. Allow sellers to update tracking number
*/

-- Allow sellers to update orders (status only)
CREATE POLICY "seller_update_orders" ON orders
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM order_items
    JOIN products ON products.id = order_items.product_id
    JOIN sellers ON sellers.id = products.seller_id
    WHERE order_items.order_id = orders.id
    AND sellers.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM order_items
    JOIN products ON products.id = order_items.product_id
    JOIN sellers ON sellers.id = products.seller_id
    WHERE order_items.order_id = orders.id
    AND sellers.user_id = auth.uid()
  )
);

-- Allow sellers to view orders that contain their products
CREATE POLICY "seller_select_orders" ON orders
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM order_items
    JOIN products ON products.id = order_items.product_id
    JOIN sellers ON sellers.id = products.seller_id
    WHERE order_items.order_id = orders.id
    AND sellers.user_id = auth.uid()
  )
);

-- Allow sellers to view order_items for their products
CREATE POLICY "seller_select_order_items" ON order_items
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM products
    JOIN sellers ON sellers.id = products.seller_id
    WHERE products.id = order_items.product_id
    AND sellers.user_id = auth.uid()
  )
);


-- ===== 20260623083446_010_add_seller_cover_image.sql =====

/*
# Add cover_image column to sellers and create seller-images bucket

1. Add cover_image to sellers table
2. Create storage bucket for seller images if not exists
*/

ALTER TABLE sellers
ADD COLUMN IF NOT EXISTS cover_image text;

-- Insert storage bucket for seller images (if storage schema is accessible)
-- Note: bucket creation might need to be done via Supabase dashboard or
-- we'll handle it via the existing product-images bucket


-- ===== 20261108150000_011_harden_profiles_auth.sql =====

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


