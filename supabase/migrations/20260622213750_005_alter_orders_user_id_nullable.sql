/*
# Allow guest orders by making user_id nullable

1. Changes
- Make orders.user_id nullable to support guest checkout
- Make orders.delivery_address nullable for pickup orders
*/

ALTER TABLE orders ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE orders ALTER COLUMN delivery_address DROP NOT NULL;
