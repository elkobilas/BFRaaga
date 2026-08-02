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
