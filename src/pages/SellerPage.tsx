import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import {
  Store, MapPin, Phone, Clock, Star, Shield, MessageCircle, ShoppingCart
} from 'lucide-react';

interface Seller {
  id: string;
  business_name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  cover_image: string | null;
  address: string | null;
  city: string | null;
  phone: string | null;
  whatsapp: string | null;
  business_hours: string | null;
  is_verified: boolean;
  rating: number;
  review_count: number;
  total_sales: number;
}

interface Product {
  id: string;
  title: string;
  slug: string;
  price: number;
  compare_price: number | null;
  currency: string;
  condition: string;
  rating: number;
  review_count: number;
  images: { url: string; is_primary: boolean }[];
  category: { name: string } | null;
}

function formatPrice(price: number, currency: string) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency }).format(price);
}

export function SellerPage() {
  const { slug } = useParams<{ slug: string }>();
  const [seller, setSeller] = useState<Seller | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadSeller() {
      if (!slug) return;
      setIsLoading(true);
      const { data: sellerData } = await supabase
        .from('sellers')
        .select('id, business_name, slug, description, logo_url, cover_image, address, city, phone, whatsapp, business_hours, is_verified, rating, review_count, total_sales')
        .eq('slug', slug)
        .eq('is_active', true)
        .maybeSingle();

      if (sellerData) {
        setSeller(sellerData as unknown as Seller);
        const { data: productsData } = await supabase
          .from('products')
          .select('*, images:product_images(url, is_primary), category:categories(name)')
          .eq('seller_id', sellerData.id)
          .eq('is_active', true)
          .order('created_at', { ascending: false });
        setProducts((productsData as unknown as Product[]) || []);
      }
      setIsLoading(false);
    }
    loadSeller();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600" />
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="page-container py-20 text-center">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Boutique introuvable</h1>
        <p className="text-slate-500 mb-6">Cette boutique n'existe pas ou a été désactivée.</p>
        <Link to="/" className="btn-primary">Retour à l'accueil</Link>
      </div>
    );
  }

  return (
    <div>
      {/* Cover */}
      <div className="h-48 md:h-64 bg-slate-200 overflow-hidden relative">
        {seller.cover_image ? (
          <img src={seller.cover_image} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-teal-600 to-teal-500" />
        )}
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Info */}
      <div className="page-container -mt-16 relative z-10 mb-12">
        <div className="card p-6">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="w-20 h-20 rounded-xl bg-slate-100 overflow-hidden border-4 border-white shadow-lg shrink-0">
              {seller.logo_url ? (
                <img src={seller.logo_url} alt={seller.business_name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">
                  <Store className="w-10 h-10" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold text-slate-900">{seller.business_name}</h1>
                {seller.is_verified && <span className="text-teal-600 flex items-center gap-1 text-sm"><Shield className="w-4 h-4" /> Vérifié</span>}
              </div>
              <div className="flex items-center gap-1 text-amber-500 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className={`w-4 h-4 ${star <= Math.round(seller.rating) ? 'fill-current' : ''}`} />
                ))}
                <span className="text-sm text-slate-500 ml-1">{seller.rating.toFixed(1)} ({seller.review_count} avis)</span>
              </div>
              <p className="text-slate-600 mb-4">{seller.description || 'Aucune description'}</p>
              <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                {seller.address && <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {seller.address}, {seller.city}</span>}
                {seller.phone && <span className="flex items-center gap-1"><Phone className="w-4 h-4" /> {seller.phone}</span>}
                {seller.business_hours && <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {seller.business_hours}</span>}
                {seller.whatsapp && (
                  <a href={`https://wa.me/${seller.whatsapp}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-teal-600 hover:text-teal-700">
                    <MessageCircle className="w-4 h-4" /> WhatsApp
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="page-container mb-12">
        <h2 className="text-xl font-bold text-slate-900 mb-6">Produits ({products.length})</h2>
        {products.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <ShoppingCart className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p>Aucun produit disponible pour le moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <div key={product.id} className="card overflow-hidden hover:shadow-lg transition-shadow">
                <Link to={`/product/${product.slug}`}>
                  <div className="aspect-square bg-slate-100 overflow-hidden">
                    {product.images?.[0] ? (
                      <img src={product.images[0].url} alt={product.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <ShoppingCart className="w-10 h-10" />
                      </div>
                    )}
                  </div>
                </Link>
                <div className="p-3">
                  <Link to={`/product/${product.slug}`} className="block">
                    <h3 className="text-sm font-medium text-slate-900 hover:text-teal-600 transition-colors line-clamp-2">{product.title}</h3>
                  </Link>
                  <p className="text-sm font-bold text-slate-900 mt-1">{formatPrice(product.price, product.currency)}</p>
                  <div className="flex items-center gap-2 mt-2 text-xs">
                    <div className="flex items-center gap-1 text-amber-500">
                      <Star className="w-3 h-3 fill-current" />
                      <span>{product.rating.toFixed(1)}</span>
                    </div>
                    <span className="text-slate-400">{product.review_count} avis</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
