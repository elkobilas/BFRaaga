import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useCart } from '../contexts/CartContext';
import { ShoppingCart, Star, ArrowLeft } from 'lucide-react';

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
  seller: { business_name: string; slug: string } | null;
  images: { url: string; is_primary: boolean }[];
  category: { name: string; slug: string } | null;
}

function formatPrice(price: number, currency: string) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency }).format(price);
}

export function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const { addToCart } = useCart();
  const [category, setCategory] = useState<{ id: string; name: string; description: string | null } | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadCategory() {
      if (!slug) return;
      setIsLoading(true);
      const { data: catData } = await supabase
        .from('categories')
        .select('id, name, description')
        .eq('slug', slug)
        .eq('is_active', true)
        .maybeSingle();

      if (catData) {
        setCategory(catData);
        const { data: prodData } = await supabase
          .from('products')
          .select('*, seller:sellers(business_name, slug), images:product_images(url, is_primary), category:categories(name, slug)')
          .eq('category_id', catData.id)
          .eq('is_active', true)
          .order('created_at', { ascending: false });
        setProducts((prodData as unknown as Product[]) || []);
      }
      setIsLoading(false);
    }
    loadCategory();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600" />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="page-container py-20 text-center">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Catégorie introuvable</h1>
        <p className="text-slate-500 mb-6">Cette catégorie n'existe pas.</p>
        <Link to="/" className="btn-primary">Retour à l'accueil</Link>
      </div>
    );
  }

  return (
    <div className="page-container py-6">
      <Link to="/" className="inline-flex items-center text-sm text-slate-500 hover:text-slate-900 mb-4">
        <ArrowLeft className="w-4 h-4 mr-1" /> Accueil
      </Link>
      <h1 className="text-2xl font-bold text-slate-900 mb-1">{category.name}</h1>
      <p className="text-slate-500 mb-6">{category.description || `${products.length} produit${products.length !== 1 ? 's' : ''} disponible`}</p>

      {products.length === 0 ? (
        <div className="card p-10 text-center">
          <ShoppingCart className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">Aucun produit dans cette catégorie pour le moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {products.map(product => {
            const primaryImage = product.images?.find(i => i.is_primary) || product.images?.[0];
            return (
              <div key={product.id} className="card group">
                <Link to={`/product/${product.slug}`} className="block relative">
                  <div className="aspect-square bg-slate-100 overflow-hidden">
                    {primaryImage ? (
                      <img src={primaryImage.url} alt={product.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300"><ShoppingCart className="w-12 h-12" /></div>
                    )}
                    {product.condition === 'used' && <span className="absolute top-2 left-2 bg-amber-500 text-white text-xs font-medium px-2 py-1 rounded">Occasion</span>}
                    {product.compare_price && product.compare_price > product.price && <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-medium px-2 py-1 rounded">Promo</span>}
                  </div>
                </Link>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="text-xs text-teal-600 font-medium">{product.category?.name}</p>
                    <div className="flex items-center gap-1 text-amber-500">
                      <Star className="w-3 h-3 fill-current" />
                      <span className="text-xs font-medium">{product.rating.toFixed(1)}</span>
                    </div>
                  </div>
                  <Link to={`/product/${product.slug}`} className="block text-sm font-medium text-slate-900 hover:text-teal-600 line-clamp-2 mb-1">{product.title}</Link>
                  <p className="text-xs text-slate-500 mb-2">Par <span className="text-teal-600">{product.seller?.business_name}</span></p>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-lg font-bold text-slate-900">{formatPrice(product.price, product.currency)}</span>
                      {product.compare_price && product.compare_price > product.price && (
                        <span className="text-sm text-slate-400 line-through ml-2">{formatPrice(product.compare_price, product.currency)}</span>
                      )}
                    </div>
                    <button onClick={() => addToCart(product.id, 1)} className="p-2 rounded-lg bg-teal-50 text-teal-600 hover:bg-teal-600 hover:text-white transition-colors">
                      <ShoppingCart className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
