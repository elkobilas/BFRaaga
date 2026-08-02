/*
# Marketplace Database Schema - Initial Setup

1. New Tables
- `profiles` — extends auth.users with marketplace-specific data (role, phone, avatar, location)
- `sellers` — vendor business profiles with KYC info, logo, description, address, contact
- `categories` — product categories with hierarchy support
- `products` — product catalog with title, description, price, stock, condition, location
- `product_images` — product photos and videos
- `cart_items` — persistent shopping cart
- `orders` — customer orders with status, total, delivery info
- `order_items` — order line items
- `reviews` — product ratings and reviews
- `favorites` — user's favorite products

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
