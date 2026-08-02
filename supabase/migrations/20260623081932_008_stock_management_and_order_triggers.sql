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
