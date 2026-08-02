/*
# Make user_id nullable for guest orders

1. Changes
- orders.user_id is now nullable
- orders.delivery_address is now nullable
*/

ALTER TABLE orders ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE orders ALTER COLUMN delivery_address DROP NOT NULL;
