import { useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Camera, X, Loader2, ImagePlus } from 'lucide-react';

interface SellerImageUploadProps {
  onUpload: (url: string) => void;
  existingImage?: string;
  label: string;
  bucket?: string;
  folder?: string;
}

export function SellerImageUpload({ onUpload, existingImage = '', label, bucket = 'product-images', folder = 'sellers' }: SellerImageUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string>(existingImage);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File | null) => {
    if (!file || !file.type.startsWith('image/')) {
      alert('Veuillez sélectionner une image (JPEG, PNG, WebP)');
      return;
    }

    setUploading(true);

    const fileExt = file.name.split('.').pop() || 'jpg';
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, { cacheControl: '3600', upsert: false });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      alert('Erreur lors de l\'upload: ' + uploadError.message);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
    if (data?.publicUrl) {
      setPreviewUrl(data.publicUrl);
      onUpload(data.publicUrl);
    }

    setUploading(false);
  };

  const removeImage = () => {
    setPreviewUrl('');
    onUpload('');
  };

  return (
    <div className="space-y-3">
      {previewUrl ? (
        <div className="relative aspect-video rounded-lg overflow-hidden border border-slate-200 bg-slate-50 max-w-sm">
          <img src={previewUrl} alt={label} className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={removeImage}
            className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ImagePlus className="w-4 h-4" />
              {uploading ? 'Upload...' : 'Choisir un fichier'}
              {uploading && <Loader2 className="w-3 h-3 animate-spin" />}
            </button>

            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-teal-300 bg-teal-50 text-teal-700 text-sm font-medium hover:bg-teal-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Camera className="w-4 h-4" />
              Prendre une photo
            </button>
          </div>
          <p className="text-xs text-slate-500">{label} · JPEG, PNG, WebP · Max 5 Mo</p>
        </div>
      )}

      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files?.[0] || null)} />
      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => handleFile(e.target.files?.[0] || null)} />
    </div>
  );
}
