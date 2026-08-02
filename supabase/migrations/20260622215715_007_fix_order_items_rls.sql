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
