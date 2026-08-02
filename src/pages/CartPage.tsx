import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useCart } from '../contexts/CartContext';
import {
  ShoppingCart, Trash2, Minus, Plus, ArrowRight, AlertTriangle,
  Package, Truck
} from 'lucide-react';

interface GuestCartItem {
  product: {
    id: string;
    title: string;
    slug: string;
    price: number;
    currency: string;
    stock: number;
    condition: string;
    seller_id: string;
    seller: { business_name: string; slug: string } | null;
    images: { url: string; is_primary: boolean }[];
  };
  quantity: number;
}

function formatPrice(price: number, currency: string) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency }).format(price);
}

export function CartPage() {
  const { items, isLoading, totalPrice, updateQuantity, removeFromCart, isGuest, guestCart, removeFromGuestCart, updateGuestQuantity } = useCart();
  const navigate = useNavigate();
  const [error] = useState('');
  const [guestItems, setGuestItems] = useState<GuestCartItem[]>([]);
  const [guestLoading, setGuestLoading] = useState(true);

  // Load guest cart products
  useEffect(() => {
    async function loadGuestCart() {
      if (!isGuest || guestCart.length === 0) {
        setGuestLoading(false);
        return;
      }
      const productIds = guestCart.map(c => c.productId);
      const { data } = await supabase
        .from('products')
        .select('id, title, slug, price, currency, stock, condition, seller_id, seller:sellers(business_name, slug), images:product_images(url, is_primary)')
        .in('id', productIds)
        .eq('is_active', true);
      if (data) {
        const productMap = new Map((data as any[]).map(p => [p.id, p]));
        const loaded = guestCart.map(c => {
          const p = productMap.get(c.productId);
          return p ? { product: p, quantity: c.quantity } : null;
        }).filter(Boolean) as GuestCartItem[];
        setGuestItems(loaded);
      }
      setGuestLoading(false);
    }
    loadGuestCart();
  }, [isGuest, guestCart]);

  const displayItems = isGuest ? guestItems : items;
  const displayTotal = isGuest
    ? guestItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
    : totalPrice;
  const shippingEstimate = displayTotal > 50000 ? 0 : 2500;
  const total = displayTotal + shippingEstimate;

  if (isLoading || guestLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600" />
      </div>
    );
  }

  if (displayItems.length === 0) {
    return (
      <div className="page-container py-20 text-center">
        <ShoppingCart className="w-20 h-20 text-slate-300 mx-auto mb-6" />
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Votre panier est vide</h1>
        <p className="text-slate-500 mb-6">Parcourez notre catalogue et ajoutez des produits à votre panier.</p>
        <Link to="/search" className="btn-primary">Explorer les produits</Link>
      </div>
    );
  }

  return (
    <div className="page-container py-6">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Mon panier ({displayItems.length} article{displayItems.length > 1 ? 's' : ''})</h1>

      {error && (
        <div className="mb-4 p-4 rounded-lg bg-red-50 text-red-700 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" /> {error}
        </div>
      )}

      {isGuest && (
        <div className="mb-4 p-4 rounded-lg bg-teal-50 border border-teal-200 text-teal-700">
          <p className="text-sm font-medium mb-1">Vous n'êtes pas connecté</p>
          <p className="text-sm">Vous pouvez continuer sans compte ou vous connecter pour sauvegarder votre panier.</p>
          <div className="flex gap-2 mt-2">
            <Link to="/login" className="text-sm text-teal-600 font-medium hover:underline">Se connecter</Link>
            <span className="text-slate-400">|</span>
            <Link to="/register" className="text-sm text-teal-600 font-medium hover:underline">Créer un compte</Link>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {displayItems.map((item, idx) => {
            const product = isGuest ? (item as GuestCartItem).product : (item as any).product;
            const quantity = isGuest ? (item as GuestCartItem).quantity : (item as any).quantity;
            const itemId = isGuest ? product.id : (item as any).id;

            return (
              <div key={itemId + idx} className="card flex gap-4 p-4">
                <Link to={`/product/${product.slug}`} className="shrink-0">
                  <div className="w-24 h-24 bg-slate-100 rounded-lg overflow-hidden">
                    {product.images?.[0] ? (
                      <img src={product.images[0].url} alt={product.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <ShoppingCart className="w-8 h-8" />
                      </div>
                    )}
                  </div>
                </Link>
                <div className="flex-1 min-w-0">
                  <Link to={`/product/${product.slug}`} className="block">
                    <h3 className="font-medium text-slate-900 hover:text-teal-600 truncate">{product.title}</h3>
                  </Link>
                  <p className="text-sm text-slate-500 mb-1">Par {product.seller?.business_name}</p>
                  <p className="text-sm font-medium text-slate-900 mb-3">
                    {formatPrice(product.price, product.currency)}
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center border border-slate-300 rounded-lg">
                      <button
                        onClick={() => {
                          if (isGuest) updateGuestQuantity(product.id, quantity - 1);
                          else updateQuantity(itemId, quantity - 1);
                        }}
                        className="px-3 py-1.5 hover:bg-slate-50 text-slate-600"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-3 py-1.5 text-sm font-medium w-12 text-center">{quantity}</span>
                      <button
                        onClick={() => {
                          if (isGuest) updateGuestQuantity(product.id, quantity + 1);
                          else updateQuantity(itemId, quantity + 1);
                        }}
                        className="px-3 py-1.5 hover:bg-slate-50 text-slate-600"
                        disabled={quantity >= product.stock}
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <button
                      onClick={() => {
                        if (isGuest) removeFromGuestCart(product.id);
                        else removeFromCart(itemId);
                      }}
                      className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <span className="ml-auto text-sm font-bold text-slate-900">
                      {formatPrice(product.price * quantity, product.currency)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="card p-5 sticky top-24">
            <h2 className="font-bold text-slate-900 mb-4">Récapitulatif</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Sous-total</span>
                <span>{formatPrice(displayTotal, 'XOF')}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Livraison</span>
                <span>{shippingEstimate === 0 ? 'Gratuite' : formatPrice(shippingEstimate, 'XOF')}</span>
              </div>
              <div className="border-t border-slate-200 pt-3 flex justify-between font-bold text-slate-900 text-base">
                <span>Total</span>
                <span>{formatPrice(total, 'XOF')}</span>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Truck className="w-4 h-4" />
                <span>Livraison gratuite dès 50 000 FCFA</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Package className="w-4 h-4" />
                <span>Retrait possible chez le vendeur</span>
              </div>
            </div>

            <button
              onClick={() => {
                if (isGuest) {
                  navigate('/guest-checkout');
                } else {
                  navigate('/checkout');
                }
              }}
              className="btn-primary w-full mt-5 py-3"
            >
              Passer la commande
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
            <Link to="/search" className="block text-center text-sm text-teal-600 mt-3 hover:text-teal-700">
              Continuer les achats
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
