import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import {
  ShoppingCart, Star, Heart, Share2, Shield, Check, ChevronLeft, ChevronRight,
  MapPin, Phone, Clock, MessageCircle, User, AlertTriangle
} from 'lucide-react';

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  compare_price: number | null;
  currency: string;
  stock: number;
  condition: string;
  sku: string | null;
  weight_kg: number | null;
  tags: string[] | null;
  city: string | null;
  rating: number;
  review_count: number;
  seller_id: string;
  seller: {
    id: string;
    business_name: string;
    slug: string;
    logo_url: string | null;
    address: string | null;
    city: string | null;
    phone: string | null;
    whatsapp: string | null;
    business_hours: string | null;
    is_verified: boolean;
    rating: number;
    review_count: number;
  } | null;
  images: { url: string; alt_text: string | null; is_primary: boolean }[];
  category: { name: string; slug: string } | null;
}

interface Review {
  id: string;
  rating: number;
  title: string | null;
  comment: string | null;
  created_at: string;
  user: { full_name: string | null; avatar_url: string | null } | null;
}

function formatPrice(price: number, currency: string) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency }).format(price);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
}

export function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const { user, isAuthenticated } = useAuth();
  const { addToCart, addToGuestCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', comment: '' });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);

  useEffect(() => {
    async function loadProduct() {
      if (!slug) return;
      setIsLoading(true);
      const { data: productData } = await supabase
        .from('products')
        .select(`
          *,
          seller:sellers(id, business_name, slug, logo_url, address, city, phone, whatsapp, business_hours, is_verified, rating, review_count),
          images:product_images(url, alt_text, is_primary),
          category:categories(name, slug)
        `)
        .eq('slug', slug)
        .eq('is_active', true)
        .maybeSingle();

      if (productData) {
        setProduct(productData as unknown as Product);
        const { data: reviewData } = await supabase
          .from('reviews')
          .select('*, user:profiles(full_name, avatar_url)')
          .eq('product_id', productData.id)
          .eq('is_approved', true)
          .order('created_at', { ascending: false });
        setReviews(reviewData as unknown as Review[] || []);

        if (isAuthenticated && user) {
          const { data: favData } = await supabase
            .from('favorites')
            .select('id')
            .eq('product_id', productData.id)
            .eq('user_id', user.id)
            .maybeSingle();
          setIsFavorited(!!favData);
        }

        // Load related products from same category
        if (productData.category_id) {
          const { data: relatedData } = await supabase
            .from('products')
            .select('id, title, slug, price, currency, images:product_images(url)')
            .eq('category_id', productData.category_id)
            .eq('is_active', true)
            .neq('id', productData.id)
            .limit(4);
          setRelatedProducts(relatedData || []);
        }
      }
      setIsLoading(false);
    }

    loadProduct();
  }, [slug, isAuthenticated, user]);

  const handleAddToCart = async () => {
    if (!product) return;
    setIsAdding(true);
    setError('');
    const { error } = await addToCart(product.id, quantity);
    if (error) {
      if (error.message === 'guest') {
        addToGuestCart(product.id, quantity);
        setSuccess('Produit ajouté au panier');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(error.message);
      }
    } else {
      setSuccess('Produit ajouté au panier');
      setTimeout(() => setSuccess(''), 3000);
    }
    setIsAdding(false);
  };

  const handleBuyNow = async () => {
    if (!product) return;
    setIsAdding(true);
    setError('');
    const { error } = await addToCart(product.id, quantity);
    if (error) {
      if (error.message === 'guest') {
        addToGuestCart(product.id, quantity);
      } else {
        setError(error.message);
        setIsAdding(false);
        return;
      }
    }
    window.location.href = '/cart';
  };

  const toggleFavorite = async () => {
    if (!product || !isAuthenticated || !user) {
      setError('Veuillez vous connecter pour ajouter aux favoris');
      return;
    }
    if (isFavorited) {
      await supabase.from('favorites').delete().eq('product_id', product.id).eq('user_id', user.id);
      setIsFavorited(false);
    } else {
      await supabase.from('favorites').insert({ product_id: product.id, user_id: user.id });
      setIsFavorited(true);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !isAuthenticated || !user) return;
    setIsSubmittingReview(true);
    setError('');
    const { error } = await supabase.from('reviews').insert({
      user_id: user.id,
      product_id: product.id,
      rating: reviewForm.rating,
      title: reviewForm.title || null,
      comment: reviewForm.comment || null,
    });
    if (error) {
      setError(error.message);
    } else {
      setSuccess('Avis publié avec succès');
      setReviewForm({ rating: 5, title: '', comment: '' });
      setShowReviewForm(false);
      const { data: reviewData } = await supabase
        .from('reviews')
        .select('*, user:profiles(full_name, avatar_url)')
        .eq('product_id', product.id)
        .eq('is_approved', true)
        .order('created_at', { ascending: false });
      setReviews(reviewData as unknown as Review[] || []);
      setTimeout(() => setSuccess(''), 3000);
    }
    setIsSubmittingReview(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="page-container py-20 text-center">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Produit introuvable</h1>
        <p className="text-slate-500 mb-6">Le produit que vous recherchez n'existe pas ou a été retiré.</p>
        <Link to="/" className="btn-primary">Retour à l'accueil</Link>
      </div>
    );
  }

  const sortedImages = product.images?.sort((a, b) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0)) || [];

  return (
    <div className="page-container py-6">
      {/* Breadcrumb */}
      <nav className="text-sm text-slate-500 mb-4">
        <Link to="/" className="hover:text-teal-600">Accueil</Link>
        <span className="mx-2">/</span>
        {product.category && (
          <>
            <Link to={`/category/${product.category.slug}`} className="hover:text-teal-600">{product.category.name}</Link>
            <span className="mx-2">/</span>
          </>
        )}
        <span className="text-slate-900">{product.title}</span>
      </nav>

      {/* Messages */}
      {error && (
        <div className="mb-4 p-4 rounded-lg bg-red-50 text-red-700 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" /> {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-4 rounded-lg bg-green-50 text-green-700 flex items-center gap-2">
          <Check className="w-4 h-4" /> {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Images */}
        <div>
          <div className="aspect-square bg-slate-100 rounded-xl overflow-hidden mb-4 relative">
            {sortedImages[selectedImage] ? (
              <img src={sortedImages[selectedImage].url} alt={product.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-300">
                <ShoppingCart className="w-20 h-20" />
              </div>
            )}
            {sortedImages.length > 1 && (
              <>
                <button onClick={() => setSelectedImage(prev => prev > 0 ? prev - 1 : sortedImages.length - 1)} className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow flex items-center justify-center hover:bg-white">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button onClick={() => setSelectedImage(prev => (prev + 1) % sortedImages.length)} className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow flex items-center justify-center hover:bg-white">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
          {sortedImages.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {sortedImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`w-20 h-20 rounded-lg overflow-hidden border-2 flex-shrink-0 ${selectedImage === idx ? 'border-teal-600' : 'border-transparent'}`}
                >
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <div className="flex items-start justify-between gap-4 mb-2">
            <div>
              {product.category && (
                <Link to={`/category/${product.category.slug}`} className="text-sm text-teal-600 font-medium hover:underline">
                  {product.category.name}
                </Link>
              )}
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mt-1">{product.title}</h1>
            </div>
            <div className="flex gap-2">
              <button onClick={toggleFavorite} className={`p-2 rounded-lg border transition-colors ${isFavorited ? 'bg-red-50 border-red-200 text-red-500' : 'border-slate-200 text-slate-400 hover:text-red-500'}`}>
                <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
              </button>
              <button className="p-2 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-600">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-1 text-amber-500">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className={`w-5 h-5 ${star <= Math.round(product.rating) ? 'fill-current' : ''}`} />
              ))}
            </div>
            <span className="text-sm text-slate-500">{product.rating.toFixed(1)} ({product.review_count} avis)</span>
            {product.condition === 'used' && (
              <span className="bg-amber-100 text-amber-700 text-xs font-medium px-2 py-0.5 rounded">Occasion</span>
            )}
            {product.condition === 'new' && (
              <span className="bg-green-100 text-green-700 text-xs font-medium px-2 py-0.5 rounded">Neuf</span>
            )}
          </div>

          <div className="mb-6">
            <span className="text-3xl font-bold text-slate-900">{formatPrice(product.price, product.currency)}</span>
            {product.compare_price && product.compare_price > product.price && (
              <span className="text-lg text-slate-400 line-through ml-3">{formatPrice(product.compare_price, product.currency)}</span>
            )}
          </div>

          <div className="prose prose-sm text-slate-600 mb-6 max-w-none">
            <p>{product.description}</p>
          </div>

          {product.tags && product.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {product.tags.map((tag) => (
                <span key={tag} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">{tag}</span>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
            <MapPin className="w-4 h-4" />
            <span>{product.city || 'Ouagadougou'}</span>
            {product.stock > 0 ? (
              <span className="ml-4 text-green-600 flex items-center gap-1"><Check className="w-4 h-4" /> En stock ({product.stock} disponible)</span>
            ) : (
              <span className="ml-4 text-red-500 flex items-center gap-1"><AlertTriangle className="w-4 h-4" /> Rupture de stock</span>
            )}
          </div>

          {/* Actions */}
          {product.stock > 0 && (
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center border border-slate-300 rounded-lg">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 py-2 hover:bg-slate-50 text-slate-600">-</button>
                <span className="px-3 py-2 text-sm font-medium w-12 text-center">{quantity}</span>
                <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} className="px-3 py-2 hover:bg-slate-50 text-slate-600">+</button>
              </div>
              <button onClick={handleAddToCart} disabled={isAdding} className="btn-primary flex-1 py-3">
                <ShoppingCart className="w-5 h-5 mr-2" />
                {isAdding ? 'Ajout...' : 'Ajouter au panier'}
              </button>
              <button onClick={handleBuyNow} disabled={isAdding} className="btn-outline py-3 px-6 font-medium">
                Acheter maintenant
              </button>
            </div>
          )}

          {/* Seller Info */}
          {product.seller && (
            <div className="border border-slate-200 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden">
                  {product.seller.logo_url ? (
                    <img src={product.seller.logo_url} alt="" className="w-12 h-12 object-cover" />
                  ) : (
                    <User className="w-6 h-6 text-slate-400" />
                  )}
                </div>
                <div>
                  <Link to={`/seller/${product.seller.slug}`} className="font-medium text-slate-900 hover:text-teal-600">
                    {product.seller.business_name}
                  </Link>
                  <div className="flex items-center gap-2 text-sm">
                    {product.seller.is_verified && (
                      <span className="text-teal-600 flex items-center gap-1"><Shield className="w-3 h-3" /> Vérifié</span>
                    )}
                    <div className="flex items-center gap-1 text-amber-500">
                      <Star className="w-3 h-3 fill-current" /> {product.seller.rating.toFixed(1)}
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-1 text-sm text-slate-500">
                {product.seller.address && <p className="flex items-center gap-2"><MapPin className="w-3 h-3" /> {product.seller.address}</p>}
                {product.seller.phone && <p className="flex items-center gap-2"><Phone className="w-3 h-3" /> {product.seller.phone}</p>}
                {product.seller.business_hours && <p className="flex items-center gap-2"><Clock className="w-3 h-3" /> {product.seller.business_hours}</p>}
              </div>
              <div className="flex gap-2 mt-3">
                <Link to={`/seller/${product.seller.slug}`} className="btn-outline text-sm py-2 flex-1">
                  Voir la boutique
                </Link>
                {product.seller.whatsapp && (
                  <a href={`https://wa.me/${product.seller.whatsapp}`} target="_blank" rel="noopener noreferrer" className="btn-primary text-sm py-2 flex-1">
                    <MessageCircle className="w-4 h-4 mr-1" /> WhatsApp
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="border-t border-slate-200 pt-8 mb-12">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Produits similaires</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {relatedProducts.map((rp) => (
              <Link key={rp.id} to={`/product/${rp.slug}`} className="card overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-square bg-slate-100 overflow-hidden">
                  {rp.images?.[0] ? (
                    <img src={rp.images[0].url} alt={rp.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <ShoppingCart className="w-10 h-10" />
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-sm font-medium text-slate-900 line-clamp-2">{rp.title}</p>
                  <p className="text-sm font-bold text-slate-900 mt-1">{formatPrice(rp.price, rp.currency)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Reviews */}
      <div className="border-t border-slate-200 pt-8 mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900">Avis clients ({reviews.length})</h2>
          {isAuthenticated && (
            <button onClick={() => setShowReviewForm(!showReviewForm)} className="btn-outline text-sm py-2">
              {showReviewForm ? 'Annuler' : 'Écrire un avis'}
            </button>
          )}
        </div>

        {showReviewForm && (
          <form onSubmit={handleSubmitReview} className="bg-slate-50 rounded-xl p-6 mb-6">
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">Note</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} type="button" onClick={() => setReviewForm(f => ({ ...f, rating: star }))} className="text-amber-500">
                    <Star className={`w-6 h-6 ${star <= reviewForm.rating ? 'fill-current' : ''}`} />
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-1">Titre (optionnel)</label>
              <input type="text" value={reviewForm.title} onChange={(e) => setReviewForm(f => ({ ...f, title: e.target.value }))} className="input-field" placeholder="Résumé de votre avis" />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-1">Commentaire</label>
              <textarea value={reviewForm.comment} onChange={(e) => setReviewForm(f => ({ ...f, comment: e.target.value }))} className="input-field" rows={4} placeholder="Partagez votre expérience..." />
            </div>
            <button type="submit" disabled={isSubmittingReview} className="btn-primary">
              {isSubmittingReview ? 'Publication...' : 'Publier mon avis'}
            </button>
          </form>
        )}

        {reviews.length === 0 ? (
          <div className="text-center py-10 text-slate-500">
            <p>Aucun avis pour ce produit. Soyez le premier à donner votre avis !</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="bg-white rounded-xl border border-slate-200 p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 font-bold text-sm">
                    {review.user?.full_name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{review.user?.full_name || 'Utilisateur'}</p>
                    <p className="text-xs text-slate-500">{formatDate(review.created_at)}</p>
                  </div>
                  <div className="ml-auto flex items-center gap-1 text-amber-500">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className={`w-4 h-4 ${star <= review.rating ? 'fill-current' : ''}`} />
                    ))}
                  </div>
                </div>
                {review.title && <p className="font-medium text-slate-800 mb-1">{review.title}</p>}
                {review.comment && <p className="text-sm text-slate-600">{review.comment}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
