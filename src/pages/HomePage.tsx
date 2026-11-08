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
    <div className="card group">
      <Link to={`/product/${product.slug}`} className="block relative">
        <div className="aspect-square bg-slate-100 overflow-hidden relative">
          {primaryImage ? (
            <img
              src={primaryImage.url}
              alt={product.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-300">
              <ShoppingCart className="w-12 h-12" />
            </div>
          )}
          {product.condition === 'used' && (
            <span className="absolute top-2 left-2 bg-amber-500 text-white text-xs font-medium px-2 py-1 rounded">
              Occasion
            </span>
          )}
          {product.compare_price && product.compare_price > product.price && (
            <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-medium px-2 py-1 rounded">
              Promo
            </span>
          )}
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
          <h3 className="text-sm font-medium text-slate-900 line-clamp-2 mb-1 hover:text-teal-600 transition-colors">
            {product.title}
          </h3>
        </Link>
        <p className="text-xs text-slate-500 mb-2">
          Par <Link to={`/seller/${product.seller?.slug}`} className="text-teal-600 hover:underline">{product.seller?.business_name}</Link>
        </p>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-lg font-bold text-slate-900">{formatPrice(product.price, product.currency)}</span>
            {product.compare_price && product.compare_price > product.price && (
              <span className="text-sm text-slate-400 line-through ml-2">
                {formatPrice(product.compare_price, product.currency)}
              </span>
            )}
          </div>
          <button
            onClick={handleAddToCart}
            disabled={isAdding}
            className="p-2 rounded-lg bg-teal-50 text-teal-600 hover:bg-teal-600 hover:text-white transition-colors disabled:opacity-50"
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
      <section className="relative bg-teal-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_85%_0%,rgba(242,176,30,0.22),transparent_55%)]" aria-hidden="true" />
        <div className="page-container relative grid md:grid-cols-2 gap-12 items-center py-14 md:py-24">
          <div>
            <h1 className="font-display text-4xl md:text-6xl font-extrabold leading-[1.02] mb-5 text-balance">{heroSlides[currentHero].title}</h1>
            <p className="text-lg text-white/80 mb-8 max-w-md">{heroSlides[currentHero].subtitle}</p>
            <div className="flex flex-wrap gap-3">
              <Link to="/search" className="btn-secondary text-base px-6 py-3">
                {heroSlides[currentHero].cta}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <Link to="/register" className="inline-flex items-center px-6 py-3 rounded-lg font-medium text-white border-2 border-white/30 hover:bg-white/10 transition-all">
                S'inscrire
              </Link>
            </div>
            <div className="flex gap-2 mt-8">
              {heroSlides.map((_, idx) => (
                <button
                  key={idx}
                  aria-label={`Diapositive ${idx + 1}`}
                  onClick={() => setCurrentHero(idx)}
                  className={`w-3 h-3 rounded-full transition-all ${currentHero === idx ? 'bg-orange-400 scale-110' : 'bg-white/40'}`}
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
      <section className="py-12 bg-white">
        <div className="page-container">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Parcourir par catégorie</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-10 gap-3">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/category/${cat.slug}`}
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-slate-50 hover:bg-teal-50 border border-slate-100 hover:border-teal-200 transition-all group"
              >
                <div className="w-12 h-12 rounded-full overflow-hidden bg-teal-100 text-teal-600 flex items-center justify-center group-hover:bg-teal-600 group-hover:text-white transition-colors">
                  {cat.image_url ? <img src={cat.image_url} alt="" className="w-full h-full object-cover" /> : cat.icon && categoryIcons[cat.icon] ? categoryIcons[cat.icon] : <ShoppingCart className="w-6 h-6" />}
                </div>
                <span className="text-xs font-medium text-slate-700 text-center line-clamp-2">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-10 bg-slate-50">
        <div className="page-container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start gap-4 p-5 bg-white rounded-xl border border-slate-100">
              <div className="w-12 h-12 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center shrink-0">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Paiement sécurisé</h3>
                <p className="text-sm text-slate-500 mt-1">Paiements via Mobile Money et vérification des vendeurs.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-5 bg-white rounded-xl border border-slate-100">
              <div className="w-12 h-12 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center shrink-0">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Livraison locale</h3>
                <p className="text-sm text-slate-500 mt-1">Livraison à domicile ou retrait en point relais à Ouagadougou.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-5 bg-white rounded-xl border border-slate-100">
              <div className="w-12 h-12 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center shrink-0">
                <Headphones className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Support client</h3>
                <p className="text-sm text-slate-500 mt-1">Notre équipe locale vous accompagne à chaque étape.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="py-12">
          <div className="page-container">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Produits en vedette</h2>
              <Link to="/search" className="text-sm text-teal-600 font-medium hover:text-teal-700 flex items-center gap-1">
                Voir tout <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* New Products */}
      {newProducts.length > 0 && (
        <section className="py-12 bg-white">
          <div className="page-container">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Nouveautés</h2>
              <Link to="/search" className="text-sm text-teal-600 font-medium hover:text-teal-700 flex items-center gap-1">
                Voir tout <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {newProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 bg-teal-900">
        <div className="page-container text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Vendez vos produits sur BF RAAGA</h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-8">
            Rejoignez des centaines de vendeurs au Burkina Faso. Créez votre boutique en quelques minutes et commencez à vendre.
          </p>
          <Link to="/register" className="btn-secondary text-base px-8 py-3">
            Devenir vendeur
            <TrendingUp className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </section>
    </div>
  );
}
