import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useCart } from '../contexts/CartContext';
import {
  ShoppingCart, Star, ArrowRight, TrendingUp, Shield, Truck, Headphones,
  Smartphone, Shirt, Home, Utensils, Heart, Car, Leaf, Briefcase, Baby, Dumbbell
} from 'lucide-react';

const categoryIcons: Record<string, React.ReactNode> = {
  'smartphone': <Smartphone className="w-6 h-6" />,
  'shirt': <Shirt className="w-6 h-6" />,
  'home': <Home className="w-6 h-6" />,
  'utensils': <Utensils className="w-6 h-6" />,
  'heart': <Heart className="w-6 h-6" />,
  'dumbbell': <Dumbbell className="w-6 h-6" />,
  'car': <Car className="w-6 h-6" />,
  'leaf': <Leaf className="w-6 h-6" />,
  'briefcase': <Briefcase className="w-6 h-6" />,
  'baby': <Baby className="w-6 h-6" />,
};

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  image_url: string | null;
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
  seller_id: string;
  seller: { business_name: string; slug: string } | null;
  images: { url: string; is_primary: boolean }[];
  category: { name: string; slug: string } | null;
}

function formatPrice(price: number, currency: string) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency }).format(price);
}

function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const primaryImage = product.images?.find((i) => i.is_primary) || product.images?.[0];

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAdding(true);
    await addToCart(product.id, 1);
    setIsAdding(false);
  };

  return (
    <div className="card group hover:shadow-xl transition-all duration-300 border-slate-100 flex flex-col justify-between">
      <Link to={`/product/${product.slug}`} className="block relative">
        <div className="aspect-square bg-slate-50 overflow-hidden relative rounded-t-2xl">
          {primaryImage ? (
            <img
              src={primaryImage.url}
              alt={product.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-300">
              <ShoppingCart className="w-12 h-12" />
            </div>
          )}
          {product.condition === 'used' && (
            <span className="absolute top-2.5 left-2.5 bg-amber-500/95 backdrop-blur text-white text-[11px] font-bold px-2 py-0.5 rounded-md shadow-sm">
              Occasion
            </span>
          )}
          {product.compare_price && product.compare_price > product.price && (
            <span className="absolute top-2.5 right-2.5 bg-red-600/95 backdrop-blur text-white text-[11px] font-bold px-2 py-0.5 rounded-md shadow-sm">
              -{Math.round(((product.compare_price - product.price) / product.compare_price) * 100)}%
            </span>
          )}
        </div>
      </Link>
      <div className="p-4 flex flex-col flex-1 justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
              {product.category?.name || 'Général'}
            </span>
            <div className="flex items-center gap-1 text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded text-xs font-semibold">
              <Star className="w-3 h-3 fill-current" />
              <span>{product.rating.toFixed(1)}</span>
            </div>
          </div>
          <Link to={`/product/${product.slug}`} className="block">
            <h3 className="text-sm font-semibold text-slate-900 line-clamp-2 mb-1 group-hover:text-emerald-700 transition-colors">
              {product.title}
            </h3>
          </Link>
          <p className="text-xs text-slate-500 mb-3">
            Boutique : <Link to={`/seller/${product.seller?.slug}`} className="text-slate-700 font-medium hover:text-emerald-700 hover:underline">{product.seller?.business_name}</Link>
          </p>
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <div>
            <span className="text-lg font-black text-slate-900 tracking-tight">{formatPrice(product.price, product.currency)}</span>
            {product.compare_price && product.compare_price > product.price && (
              <span className="text-xs text-slate-400 line-through block font-medium">
                {formatPrice(product.compare_price, product.currency)}
              </span>
            )}
          </div>
          <button
            onClick={handleAddToCart}
            disabled={isAdding}
            className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white transition-all shadow-sm active:scale-95 disabled:opacity-50"
            title="Ajouter au panier"
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [newProducts, setNewProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentHero, setCurrentHero] = useState(0);

  const heroSlides = [
    {
      title: 'La marketplace locale du Burkina Faso',
      subtitle: 'Achetez et vendez en toute confiance. Des milliers de produits disponibles près de chez vous.',
      cta: 'Explorer les produits',
      bg: 'bg-gradient-to-r from-teal-700 to-teal-500',
    },
    {
      title: 'Devenez vendeur sur BF RAAGA',
      subtitle: 'Ouvrez votre boutique en ligne et touchez des milliers de clients à Ouagadougou et partout au Burkina.',
      cta: 'Commencer à vendre',
      bg: 'bg-gradient-to-r from-orange-600 to-amber-500',
    },
  ];

  useEffect(() => {
    async function loadData() {
      const [catRes, featRes, newRes] = await Promise.all([
        supabase.from('categories').select('*').eq('is_active', true).order('sort_order', { ascending: true }).limit(10),
        supabase
          .from('products')
          .select('*, seller:sellers(business_name, slug), images:product_images(url, is_primary), category:categories(name, slug)')
          .eq('is_active', true)
          .eq('is_featured', true)
          .order('created_at', { ascending: false })
          .limit(8),
        supabase
          .from('products')
          .select('*, seller:sellers(business_name, slug), images:product_images(url, is_primary), category:categories(name, slug)')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(8),
      ]);

      if (catRes.data) setCategories(catRes.data);
      if (featRes.data) setFeaturedProducts(featRes.data as unknown as Product[]);
      if (newRes.data) setNewProducts(newRes.data as unknown as Product[]);
      setIsLoading(false);
    }

    loadData();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentHero((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  const heroTiles = [...featuredProducts, ...newProducts].filter((p) => p.images?.length).slice(0, 4);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600" />
      </div>
    );
  }

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-emerald-900 via-emerald-800 to-slate-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,rgba(245,158,11,0.2),transparent_60%)]" aria-hidden="true" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="page-container relative grid md:grid-cols-2 gap-12 items-center py-16 md:py-24">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 text-xs font-semibold mb-6">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              Place de marché 100% burkinabè
            </div>
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.08] mb-6 text-balance">
              {heroSlides[currentHero].title}
            </h1>
            <p className="text-lg text-emerald-100/80 mb-8 max-w-lg leading-relaxed">
              {heroSlides[currentHero].subtitle}
            </p>
            <div className="flex flex-wrap gap-4 items-center">
              <Link to="/search" className="btn-secondary text-base px-7 py-3.5 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30">
                {heroSlides[currentHero].cta}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <Link to="/seller/settings" className="inline-flex items-center px-6 py-3.5 rounded-xl font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/20 transition-all backdrop-blur">
                Ouvrir ma boutique
              </Link>
            </div>
            <div className="flex gap-2.5 mt-10">
              {heroSlides.map((_, idx) => (
                <button
                  key={idx}
                  aria-label={`Diapositive ${idx + 1}`}
                  onClick={() => setCurrentHero(idx)}
                  className={`h-2 rounded-full transition-all duration-300 ${currentHero === idx ? 'w-8 bg-amber-400' : 'w-2 bg-white/30'}`}
                />
              ))}
            </div>
          </div>
          {heroTiles.length > 0 && (
            <div className="hidden md:grid grid-cols-2 gap-4">
              {heroTiles.map((p, i) => {
                const img = p.images.find((x) => x.is_primary) || p.images[0];
                return (
                  <Link
                    key={p.id}
                    to={`/product/${p.slug}`}
                    className={`relative block aspect-[4/5] overflow-hidden rounded-2xl bg-teal-900 ${i % 2 === 1 ? 'translate-y-8' : ''}`}
                  >
                    <img src={img.url} alt={p.title} className="h-full w-full object-cover" />
                    <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 text-sm font-semibold">
                      {formatPrice(p.price, p.currency)}
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
        <div className="faso-band" aria-hidden="true" />
      </section>

      {/* Categories */}
      <section className="py-14 bg-white border-b border-slate-100">
        <div className="page-container">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Catégories populaires</h2>
              <p className="text-sm text-slate-500 mt-1">Découvrez tous les rayons disponibles près de chez vous</p>
            </div>
            <Link to="/search" className="text-sm font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 group">
              Toutes les catégories <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-10 gap-3">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/category/${cat.slug}`}
                className="flex flex-col items-center gap-2.5 p-4 rounded-2xl bg-slate-50/70 hover:bg-emerald-50/70 border border-slate-100 hover:border-emerald-200 transition-all group hover:-translate-y-1 hover:shadow-sm"
              >
                <div className="w-13 h-13 rounded-2xl bg-white shadow-sm border border-slate-100 text-emerald-700 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                  {cat.image_url ? (
                    <img src={cat.image_url} alt="" className="w-full h-full object-cover rounded-2xl" />
                  ) : cat.icon && categoryIcons[cat.icon] ? (
                    categoryIcons[cat.icon]
                  ) : (
                    <ShoppingCart className="w-5 h-5" />
                  )}
                </div>
                <span className="text-xs font-semibold text-slate-700 group-hover:text-emerald-900 text-center line-clamp-2">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 bg-slate-50/60">
        <div className="page-container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start gap-4 p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Paiement 100% sécurisé</h3>
                <p className="text-sm text-slate-500 mt-1 leading-relaxed">Transactions protégées par Mobile Money (Orange Money, Moov) et vendeurs vérifiés.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Livraison locale rapide</h3>
                <p className="text-sm text-slate-500 mt-1 leading-relaxed">Livraison directe à domicile ou retrait immédiat en boutique à Ouagadougou et Bobo.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                <Headphones className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Service client réactif</h3>
                <p className="text-sm text-slate-500 mt-1 leading-relaxed">Une assistance burkinabè joignable directement par téléphone et WhatsApp.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="py-14 bg-slate-50/40">
          <div className="page-container">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Produits en vedette</h2>
                <p className="text-sm text-slate-500 mt-1">Sélection des meilleures offres du moment</p>
              </div>
              <Link to="/search?featured=true" className="text-sm font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 group">
                Voir tout le catalogue <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* New Products */}
      {newProducts.length > 0 && (
        <section className="py-14 bg-white border-t border-slate-100">
          <div className="page-container">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Derniers arrivages</h2>
                <p className="text-sm text-slate-500 mt-1">Articles ajoutés récemment par nos vendeurs</p>
              </div>
              <Link to="/search" className="text-sm font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 group">
                Explorer les nouveautés <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {newProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden bg-gradient-to-r from-emerald-950 via-emerald-900 to-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(245,158,11,0.15),transparent_70%)]" aria-hidden="true" />
        <div className="page-container relative text-center">
          <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-4 border border-emerald-500/30">
            Rejoignez l'aventure BF RAAGA
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-5 tracking-tight">
            Vous avez des produits ou services à vendre ?
          </h2>
          <p className="text-base sm:text-lg text-emerald-100/75 max-w-2xl mx-auto mb-10 leading-relaxed">
            Créez votre vitrine en moins de 3 minutes. Encaissez vos ventes directement par Mobile Money et développez votre clientèle au Burkina Faso.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/seller/settings" className="btn-secondary text-base px-8 py-4 shadow-xl shadow-amber-500/20">
              Ouvrir ma boutique gratuitement
              <TrendingUp className="w-5 h-5 ml-2" />
            </Link>
            <Link to="/how-to-sell" className="inline-flex items-center px-6 py-4 rounded-xl font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur transition-all">
              Comment ça marche ?
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
