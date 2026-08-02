import { useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Camera, X, Loader2, ImagePlus } from 'lucide-react';

interface ImageUploadProps {
  onUpload: (urls: string[]) => void;
  maxFiles?: number;
  existingImages?: string[];
}

export function ImageUpload({ onUpload, maxFiles = 5, existingImages = [] }: ImageUploadProps) {
  const [previewUrls, setPreviewUrls] = useState<string[]>(existingImages);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const imageFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (imageFiles.length === 0) {
      alert('Veuillez sélectionner des images (JPEG, PNG, WebP)');
      return;
    }

    const remainingSlots = maxFiles - previewUrls.length;
    const toUpload = imageFiles.slice(0, remainingSlots);

    if (toUpload.length === 0) {
      alert(`Maximum ${maxFiles} images`);
      return;
    }

    setUploading(true);
    setProgress(0);

    const uploadedUrls: string[] = [];
    const total = toUpload.length;

    for (let i = 0; i < toUpload.length; i++) {
      const file = toUpload[i];
      const fileExt = file.name.split('.').pop() || 'jpg';
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        continue;
      }

      const { data } = supabase.storage.from('product-images').getPublicUrl(filePath);
      if (data?.publicUrl) {
        uploadedUrls.push(data.publicUrl);
      }

      setProgress(Math.round(((i + 1) / total) * 100));
    }

    const newUrls = [...previewUrls, ...uploadedUrls];
    setPreviewUrls(newUrls);
    onUpload(newUrls);
    setUploading(false);
    setProgress(0);
  };

  const removeImage = (index: number) => {
    const next = previewUrls.filter((_, i) => i !== index);
    setPreviewUrls(next);
    onUpload(next);
  };

  return (
    <div className="space-y-3">
      {/* Preview grid */}
      {previewUrls.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {previewUrls.map((url, idx) => (
            <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
              <img src={url} alt={`Image ${idx + 1}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(idx)}
                className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
              {idx === 0 && (
                <span className="absolute bottom-1 left-1 bg-teal-600 text-white text-[10px] px-1.5 py-0.5 rounded font-medium">
                  Principale
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload buttons */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || previewUrls.length >= maxFiles}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ImagePlus className="w-4 h-4" />
          {uploading ? `Upload... ${progress}%` : 'Choisir des fichiers'}
          {uploading && <Loader2 className="w-3 h-3 animate-spin" />}
        </button>

        <button
          type="button"
          onClick={() => cameraInputRef.current?.click()}
          disabled={uploading || previewUrls.length >= maxFiles}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-teal-300 bg-teal-50 text-teal-700 text-sm font-medium hover:bg-teal-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Camera className="w-4 h-4" />
          Prendre une photo
        </button>
      </div>

      {/* Hidden inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      <p className="text-xs text-slate-500">
        {previewUrls.length} / {maxFiles} images · JPEG, PNG, WebP · Max 5 Mo par image
      </p>
    </div>
  );
}
