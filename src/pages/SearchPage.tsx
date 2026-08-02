import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useCart } from '../contexts/CartContext';
import { ShoppingCart, Star, SlidersHorizontal, Grid3X3, List } from 'lucide-react';

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

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const categorySlug = searchParams.get('category') || '';
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [conditionFilter, setConditionFilter] = useState('');
  const [categories, setCategories] = useState<{ id: string; name: string; slug: string }[]>([]);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    let supabaseQuery = supabase
      .from('products')
      .select('*, seller:sellers(business_name, slug), images:product_images(url, is_primary), category:categories(name, slug)')
      .eq('is_active', true);

    if (query) {
      supabaseQuery = supabaseQuery.ilike('title', `%${query}%`);
    }
    if (categorySlug) {
      const { data: catData } = await supabase.from('categories').select('id').eq('slug', categorySlug).maybeSingle();
      if (catData) {
        supabaseQuery = supabaseQuery.eq('category_id', catData.id);
      }
    }
    if (conditionFilter) {
      supabaseQuery = supabaseQuery.eq('condition', conditionFilter);
    }
    if (priceRange.min) {
      supabaseQuery = supabaseQuery.gte('price', parseFloat(priceRange.min));
    }
    if (priceRange.max) {
      supabaseQuery = supabaseQuery.lte('price', parseFloat(priceRange.max));
    }

    if (sortBy === 'newest') supabaseQuery = supabaseQuery.order('created_at', { ascending: false });
    else if (sortBy === 'price_asc') supabaseQuery = supabaseQuery.order('price', { ascending: true });
    else if (sortBy === 'price_desc') supabaseQuery = supabaseQuery.order('price', { ascending: false });
    else if (sortBy === 'rating') supabaseQuery = supabaseQuery.order('rating', { ascending: false });

    const { data } = await supabaseQuery.limit(50);
    setProducts((data as unknown as Product[]) || []);
    setIsLoading(false);
  }, [query, categorySlug, sortBy, conditionFilter, priceRange]);

  useEffect(() => {
    fetchProducts();
    supabase.from('categories').select('id, name, slug').eq('is_active', true).order('sort_order').then(({ data }) => {
      if (data) setCategories(data);
    });
  }, [fetchProducts]);

  return (
    <div className="page-container py-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {query ? `Résultats pour "${query}"` : 'Tous les produits'}
          </h1>
          <p className="text-sm text-slate-500">{products.length} produit{products.length !== 1 ? 's' : ''} trouvé</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowFilters(!showFilters)} className="btn-outline text-sm py-2">
            <SlidersHorizontal className="w-4 h-4 mr-1" /> Filtres
          </button>
          <div className="flex items-center border border-slate-300 rounded-lg">
            <button onClick={() => setViewMode('grid')} className={`p-2 ${viewMode === 'grid' ? 'bg-teal-50 text-teal-600' : 'text-slate-400'}`}>
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button onClick={() => setViewMode('list')} className={`p-2 ${viewMode === 'list' ? 'bg-teal-50 text-teal-600' : 'text-slate-400'}`}>
              <List className="w-4 h-4" />
            </button>
          </div>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="input-field py-2 text-sm w-40">
            <option value="newest">Plus récent</option>
            <option value="price_asc">Prix croissant</option>
            <option value="price_desc">Prix décroissant</option>
            <option value="rating">Meilleures notes</option>
          </select>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-slate-50 rounded-xl p-5 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Catégorie</label>
              <select
                value={categorySlug}
                onChange={(e) => setSearchParams(prev => { e.target.value ? prev.set('category', e.target.value) : prev.delete('category'); return prev; })}
                className="input-field text-sm"
              >
                <option value="">Toutes les catégories</option>
                {categories.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">État</label>
              <select value={conditionFilter} onChange={(e) => setConditionFilter(e.target.value)} className="input-field text-sm">
                <option value="">Tous</option>
                <option value="new">Neuf</option>
                <option value="used">Occasion</option>
                <option value="refurbished">Reconditionné</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Prix min</label>
              <input type="number" value={priceRange.min} onChange={(e) => setPriceRange(p => ({ ...p, min: e.target.value }))} className="input-field text-sm" placeholder="0" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Prix max</label>
              <input type="number" value={priceRange.max} onChange={(e) => setPriceRange(p => ({ ...p, max: e.target.value }))} className="input-field text-sm" placeholder="" />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={() => { setConditionFilter(''); setPriceRange({ min: '', max: '' }); setSearchParams(prev => { prev.delete('category'); return prev; }); }} className="text-sm text-red-600 hover:text-red-700">
              Réinitialiser les filtres
            </button>
          </div>
        </div>
      )}

      {/* Results */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600" />
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <ShoppingCart className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h2 className="text-lg font-medium text-slate-900 mb-2">Aucun produit trouvé</h2>
          <p className="text-slate-500 mb-4">Essayez de modifier vos filtres ou votre recherche.</p>
          <button onClick={() => { setConditionFilter(''); setPriceRange({ min: '', max: '' }); setSearchParams(new URLSearchParams()); }} className="btn-primary">
            Voir tous les produits
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {products.map(p => (
            <ProductCard key={p.id} product={p} viewMode="grid" addToCart={addToCart} />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {products.map(p => (
            <ProductCard key={p.id} product={p} viewMode="list" addToCart={addToCart} />
          ))}
        </div>
      )}
    </div>
  );
}

function ProductCard({ product, viewMode, addToCart }: { product: Product; viewMode: 'grid' | 'list'; addToCart: (id: string, qty: number) => Promise<{ error: Error | null }> }) {
  const [isAdding, setIsAdding] = useState(false);
  const primaryImage = product.images?.find((i) => i.is_primary) || product.images?.[0];

  const handleAdd = async () => {
    setIsAdding(true);
    await addToCart(product.id, 1);
    setIsAdding(false);
  };

  if (viewMode === 'list') {
    return (
      <div className="card flex flex-col sm:flex-row gap-4 p-4">
        <Link to={`/product/${product.slug}`} className="shrink-0">
          <div className="w-full sm:w-40 h-40 bg-slate-100 rounded-lg overflow-hidden">
            {primaryImage ? (
              <img src={primaryImage.url} alt={product.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-300"><ShoppingCart className="w-8 h-8" /></div>
            )}
          </div>
        </Link>
        <div className="flex-1">
          <Link to={`/product/${product.slug}`}>
            <h3 className="font-medium text-slate-900 hover:text-teal-600">{product.title}</h3>
          </Link>
          <p className="text-sm text-teal-600 mb-1">{product.category?.name}</p>
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center gap-1 text-amber-500">
              <Star className="w-3 h-3 fill-current" />
              <span className="text-xs">{product.rating.toFixed(1)}</span>
            </div>
            <span className="text-xs text-slate-500">Par {product.seller?.business_name}</span>
          </div>
          <div className="flex items-center justify-between mt-2">
            <div>
              <span className="text-lg font-bold text-slate-900">{formatPrice(product.price, product.currency)}</span>
              {product.compare_price && product.compare_price > product.price && (
                <span className="text-sm text-slate-400 line-through ml-2">{formatPrice(product.compare_price, product.currency)}</span>
              )}
            </div>
            <button onClick={handleAdd} disabled={isAdding} className="btn-primary text-sm py-2 px-4">
              <ShoppingCart className="w-4 h-4 mr-1" /> {isAdding ? '...' : 'Ajouter'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card group">
      <Link to={`/product/${product.slug}`} className="block relative">
        <div className="aspect-square bg-slate-100 overflow-hidden relative">
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
        <Link to={`/product/${product.slug}`} className="block">
          <h3 className="text-sm font-medium text-slate-900 line-clamp-2 mb-1 hover:text-teal-600 transition-colors">{product.title}</h3>
        </Link>
        <p className="text-xs text-slate-500 mb-2">Par <span className="text-teal-600">{product.seller?.business_name}</span></p>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-lg font-bold text-slate-900">{formatPrice(product.price, product.currency)}</span>
            {product.compare_price && product.compare_price > product.price && (
              <span className="text-sm text-slate-400 line-through ml-2">{formatPrice(product.compare_price, product.currency)}</span>
            )}
          </div>
          <button onClick={handleAdd} disabled={isAdding} className="p-2 rounded-lg bg-teal-50 text-teal-600 hover:bg-teal-600 hover:text-white transition-colors disabled:opacity-50">
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
