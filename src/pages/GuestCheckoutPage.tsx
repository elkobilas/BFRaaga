import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useCart } from '../contexts/CartContext';
import {
  CreditCard, Truck, MapPin, Phone, Check, AlertTriangle, ChevronLeft, Package
} from 'lucide-react';

function formatPrice(price: number, currency: string) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency }).format(price);
}

interface GuestCartItem {
  product: {
    id: string;
    title: string;
    slug: string;
    price: number;
    currency: string;
    images: { url: string }[];
    seller_id: string;
    seller: { business_name: string } | null;
  };
  quantity: number;
}

export function GuestCheckoutPage() {
  const { guestCart, clearGuestCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [deliveryMode, setDeliveryMode] = useState<'home_delivery' | 'pickup'>('home_delivery');
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    delivery_address: '',
    delivery_city: 'Ouagadougou',
    delivery_phone: '',
    delivery_notes: '',
    payment_method: 'mobile_money',
  });
  const [cartItems, setCartItems] = useState<GuestCartItem[]>([]);
  const [isLoadingCart, setIsLoadingCart] = useState(true);

  useEffect(() => {
    async function load() {
      if (guestCart.length === 0) { setIsLoadingCart(false); return; }
      const productIds = guestCart.map(c => c.productId);
      const { data } = await supabase
        .from('products')
        .select('id, title, slug, price, currency, stock, seller_id, seller:sellers(business_name), images:product_images(url)')
        .in('id', productIds)
        .eq('is_active', true);
      if (data) {
        const productMap = new Map((data as any[]).map(p => [p.id, p]));
        const items = guestCart.map(c => {
          const p = productMap.get(c.productId);
          return p ? { product: p, quantity: c.quantity } : null;
        }).filter(Boolean) as GuestCartItem[];
        setCartItems(items);
      }
      setIsLoadingCart(false);
    }
    load();
  }, [guestCart]);

  const totalPrice = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const shippingCost = totalPrice > 50000 ? 0 : 2500;
  const platformFee = Math.round(totalPrice * 0.03);
  const total = totalPrice + shippingCost + platformFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!formData.full_name || !formData.email || !formData.delivery_phone) {
      setError('Veuillez remplir votre nom, email et téléphone');
      return;
    }
    setIsSubmitting(true);

    try {
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: null,
          status: 'pending',
          payment_status: 'pending',
          payment_method: formData.payment_method,
          subtotal: totalPrice,
          shipping_cost: shippingCost,
          platform_fee: platformFee,
          total: total,
          delivery_mode: deliveryMode,
          delivery_address: formData.delivery_address,
          delivery_city: formData.delivery_city,
          delivery_phone: formData.delivery_phone,
          delivery_notes: formData.delivery_notes || null,
          notes: `Commande invitée - ${formData.full_name} - ${formData.email}`,
        })
        .select('id, order_number')
        .single();

      if (orderError) throw orderError;

      const orderItems = cartItems.map((item) => ({
        order_id: orderData.id,
        product_id: item.product.id,
        seller_id: item.product.seller_id,
        title: item.product.title,
        price: item.product.price,
        quantity: item.quantity,
        subtotal: item.product.price * item.quantity,
      }));

      const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
      if (itemsError) throw itemsError;

      setOrderNumber(orderData.order_number);
      setSuccess(true);
      clearGuestCart();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la commande');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingCart) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="page-container py-20 text-center">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
          <Check className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Commande confirmée !</h1>
        <p className="text-slate-500 mb-2">Votre commande a été enregistrée avec succès.</p>
        <p className="text-lg font-medium text-teal-600 mb-6">N° {orderNumber}</p>
        <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">
          Un vendeur vous contactera pour confirmer votre commande et organiser la livraison.
        </p>
        <div className="flex gap-3 justify-center">
          <Link to="/" className="btn-primary">Continuer les achats</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container py-6">
      <Link to="/cart" className="inline-flex items-center text-sm text-slate-500 hover:text-slate-900 mb-4">
        <ChevronLeft className="w-4 h-4 mr-1" /> Retour au panier
      </Link>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Commande express (sans compte)</h1>
      {error && (
        <div className="mb-4 p-4 rounded-lg bg-red-50 text-red-700 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" /> {error}
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="card p-5">
              <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Truck className="w-5 h-5 text-teal-600" /> Mode de livraison
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button type="button" onClick={() => setDeliveryMode('home_delivery')} className={`p-4 rounded-xl border-2 text-left transition-all ${deliveryMode === 'home_delivery' ? 'border-teal-600 bg-teal-50' : 'border-slate-200 hover:border-slate-300'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <Truck className={`w-5 h-5 ${deliveryMode === 'home_delivery' ? 'text-teal-600' : 'text-slate-400'}`} />
                    <span className={`font-medium ${deliveryMode === 'home_delivery' ? 'text-teal-700' : 'text-slate-700'}`}>Livraison à domicile</span>
                  </div>
                  <p className="text-sm text-slate-500">Livraison à votre adresse à Ouagadougou</p>
                </button>
                <button type="button" onClick={() => setDeliveryMode('pickup')} className={`p-4 rounded-xl border-2 text-left transition-all ${deliveryMode === 'pickup' ? 'border-teal-600 bg-teal-50' : 'border-slate-200 hover:border-slate-300'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <Package className={`w-5 h-5 ${deliveryMode === 'pickup' ? 'text-teal-600' : 'text-slate-400'}`} />
                    <span className={`font-medium ${deliveryMode === 'pickup' ? 'text-teal-700' : 'text-slate-700'}`}>Retrait chez le vendeur</span>
                  </div>
                  <p className="text-sm text-slate-500">Récupérez votre commande directement</p>
                </button>
              </div>
            </div>
            <div className="card p-5">
              <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-teal-600" /> Vos informations
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nom complet *</label>
                  <input type="text" value={formData.full_name} onChange={e => setFormData(f => ({ ...f, full_name: e.target.value }))} className="input-field" placeholder="Prénom et nom" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
                  <input type="email" value={formData.email} onChange={e => setFormData(f => ({ ...f, email: e.target.value }))} className="input-field" placeholder="votre@email.com" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Téléphone *</label>
                  <input type="tel" value={formData.delivery_phone} onChange={e => setFormData(f => ({ ...f, delivery_phone: e.target.value }))} className="input-field" placeholder="+226 71 64 48 00" required />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Adresse de livraison</label>
                  <input type="text" value={formData.delivery_address} onChange={e => setFormData(f => ({ ...f, delivery_address: e.target.value }))} className="input-field" placeholder="Secteur, rue, quartier..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Ville</label>
                  <input type="text" value={formData.delivery_city} onChange={e => setFormData(f => ({ ...f, delivery_city: e.target.value }))} className="input-field" placeholder="Ouagadougou" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Notes (optionnel)</label>
                  <textarea value={formData.delivery_notes} onChange={e => setFormData(f => ({ ...f, delivery_notes: e.target.value }))} className="input-field" rows={2} placeholder="Instructions spéciales..." />
                </div>
              </div>
            </div>
            <div className="card p-5">
              <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-teal-600" /> Paiement
              </h2>
              <div className="space-y-3">
                <button type="button" onClick={() => setFormData(f => ({ ...f, payment_method: 'mobile_money' }))} className={`w-full p-4 rounded-xl border-2 text-left flex items-center gap-3 transition-all ${formData.payment_method === 'mobile_money' ? 'border-teal-600 bg-teal-50' : 'border-slate-200 hover:border-slate-300'}`}>
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${formData.payment_method === 'mobile_money' ? 'bg-teal-100 text-teal-600' : 'bg-slate-100 text-slate-400'}`}>
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <span className={`font-medium ${formData.payment_method === 'mobile_money' ? 'text-teal-700' : 'text-slate-700'}`}>Mobile Money</span>
                    <p className="text-sm text-slate-500">MTN, Orange, Airtel</p>
                  </div>
                  {formData.payment_method === 'mobile_money' && <Check className="w-5 h-5 text-teal-600 ml-auto" />}
                </button>
                <button type="button" onClick={() => setFormData(f => ({ ...f, payment_method: 'cash_on_delivery' }))} className={`w-full p-4 rounded-xl border-2 text-left flex items-center gap-3 transition-all ${formData.payment_method === 'cash_on_delivery' ? 'border-teal-600 bg-teal-50' : 'border-slate-200 hover:border-slate-300'}`}>
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${formData.payment_method === 'cash_on_delivery' ? 'bg-teal-100 text-teal-600' : 'bg-slate-100 text-slate-400'}`}>
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <span className={`font-medium ${formData.payment_method === 'cash_on_delivery' ? 'text-teal-700' : 'text-slate-700'}`}>Paiement à la livraison</span>
                    <p className="text-sm text-slate-500">Payez en espèces lors de la réception</p>
                  </div>
                  {formData.payment_method === 'cash_on_delivery' && <Check className="w-5 h-5 text-teal-600 ml-auto" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-3 text-base">
              {isSubmitting ? 'Traitement en cours...' : `Confirmer la commande - ${formatPrice(total, 'XOF')}`}
            </button>
          </form>
        </div>
        <div className="lg:col-span-1">
          <div className="card p-5 sticky top-24">
            <h2 className="font-bold text-slate-900 mb-4">Récapitulatif</h2>
            <div className="space-y-3 mb-4">
              {cartItems.map((item, idx) => (
                <div key={idx} className="flex gap-3">
                  <div className="w-14 h-14 bg-slate-100 rounded-lg overflow-hidden shrink-0">
                    {item.product.images?.[0] ? <img src={item.product.images[0].url} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-300"><Package className="w-5 h-5" /></div>}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{item.product.title}</p>
                    <p className="text-xs text-slate-500">{item.quantity} x {formatPrice(item.product.price, item.product.currency)}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-slate-200 pt-3 space-y-2 text-sm">
              <div className="flex justify-between text-slate-600"><span>Sous-total</span><span>{formatPrice(totalPrice, 'XOF')}</span></div>
              <div className="flex justify-between text-slate-600"><span>Livraison</span><span>{shippingCost === 0 ? 'Gratuite' : formatPrice(shippingCost, 'XOF')}</span></div>
              <div className="flex justify-between text-slate-600"><span>Frais de service</span><span>{formatPrice(platformFee, 'XOF')}</span></div>
              <div className="border-t border-slate-200 pt-2 flex justify-between font-bold text-slate-900 text-base"><span>Total</span><span>{formatPrice(total, 'XOF')}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
