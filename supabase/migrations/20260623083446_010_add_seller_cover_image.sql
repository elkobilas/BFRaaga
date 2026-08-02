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
