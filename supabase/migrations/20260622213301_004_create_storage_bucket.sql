/*
# Create Product Images Storage Bucket

1. New Storage
- `product-images` bucket — public, for product and seller photos
- `avatars` bucket — public, for user and seller avatars

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
