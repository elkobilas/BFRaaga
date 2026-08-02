import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import {
  User, Package, Heart, MapPin, Phone, Mail, Check, AlertTriangle,
  Store, LogOut, Edit3, Save, X, Truck
} from 'lucide-react';

interface Order {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  total: number;
  currency: string;
  delivery_mode: string;
  delivery_address: string | null;
  delivery_city: string | null;
  delivery_phone: string | null;
  delivery_notes: string | null;
  tracking_number: string | null;
  created_at: string;
  order_items: {
    title: string;
    price: number;
    quantity: number;
    subtotal: number;
    product: {
      id: string;
      slug: string;
      title: string;
      images: { url: string }[];
    };
  }[];
}

interface Favorite {
  id: string;
  product_id: string;
  product: {
    id: string;
    title: string;
    slug: string;
    price: number;
    currency: string;
    condition: string;
    images: { url: string }[];
  };
}

function statusBadge(status: string) {
  const map: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700',
    confirmed: 'bg-blue-100 text-blue-700',
    paid: 'bg-green-100 text-green-700',
    shipped: 'bg-purple-100 text-purple-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
    refunded: 'bg-gray-100 text-gray-700',
  };
  const labels: Record<string, string> = {
    pending: 'En attente', confirmed: 'Confirmée', paid: 'Payée', shipped: 'Expédiée', delivered: 'Livrée', cancelled: 'Annulée', refunded: 'Remboursée',
  };
  return <span className={`text-xs font-medium px-2 py-1 rounded ${map[status] || 'bg-slate-100 text-slate-700'}`}>{labels[status] || status}</span>;
}

function getStepIndex(status: string) {
  const steps = ['pending', 'confirmed', 'paid', 'shipped', 'delivered'];
  return steps.indexOf(status);
}

function formatPrice(price: number, currency: string) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency }).format(price);
}

export function AccountPage() {
  const { profile, refreshProfile, signOut } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'profile');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ full_name: '', email: '', phone: '', location: '', city: '' });
  const [orders, setOrders] = useState<Order[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSeller, setIsSeller] = useState(false);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) setActiveTab(tab);
  }, [searchParams]);

  useEffect(() => {
    async function loadData() {
      if (!profile) return;
      setIsLoading(true);
      setEditForm({
        full_name: profile.full_name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        location: profile.location || '',
        city: profile.city || '',
      });
      const [ordersRes, favRes, sellerRes] = await Promise.all([
        supabase
          .from('orders')
          .select('*, order_items(*, product:products(id, slug, title, images:product_images(url)))')
          .eq('user_id', profile.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('favorites')
          .select('id, product_id, product:products(id, title, slug, price, currency, condition, images:product_images(url))')
          .eq('user_id', profile.id)
          .order('created_at', { ascending: false }),
        supabase.from('sellers').select('id').eq('user_id', profile.id).maybeSingle(),
      ]);
      if (ordersRes.data) setOrders(ordersRes.data as unknown as Order[]);
      if (favRes.data) setFavorites(favRes.data as unknown as Favorite[]);
      setIsSeller(!!sellerRes.data);
      setIsLoading(false);
    }
    loadData();
  }, [profile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        full_name: editForm.full_name || null,
        phone: editForm.phone || null,
        location: editForm.location || null,
        city: editForm.city || null,
      })
      .eq('id', profile!.id);
    if (updateError) {
      setError(updateError.message);
    } else {
      setSuccess('Profil mis à jour');
      refreshProfile();
      setIsEditing(false);
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const removeFavorite = async (id: string) => {
    await supabase.from('favorites').delete().eq('id', id);
    setFavorites(prev => prev.filter(f => f.id !== id));
  };

  const tabs = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'orders', label: 'Commandes', icon: Package },
    { id: 'favorites', label: 'Favoris', icon: Heart },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600" />
      </div>
    );
  }

  return (
    <div className="page-container py-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <div className="card p-5 sticky top-24">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 font-bold text-lg">
                {profile?.full_name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div>
                <p className="font-medium text-slate-900">{profile?.full_name || 'Mon compte'}</p>
                <p className="text-xs text-slate-500">{profile?.email || ''}</p>
              </div>
            </div>
            <nav className="space-y-1">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setSearchParams({ tab: tab.id });
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${activeTab === tab.id ? 'bg-teal-50 text-teal-700 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}
                  >
                    <Icon className="w-4 h-4" /> {tab.label}
                  </button>
                );
              })}
              <div className="border-t border-slate-200 my-2" />
              {isSeller && (
                <Link to="/seller" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                  <Store className="w-4 h-4" /> Espace vendeur
                </Link>
              )}
              <button onClick={() => { signOut(); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors">
                <LogOut className="w-4 h-4" /> Déconnexion
              </button>
            </nav>
          </div>
        </div>

        <div className="lg:col-span-3">
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

          {activeTab === 'profile' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900">Mon profil</h2>
                {!isEditing && (
                  <button onClick={() => setIsEditing(true)} className="btn-outline text-sm py-2 px-4">
                    <Edit3 className="w-4 h-4 mr-1" /> Modifier
                  </button>
                )}
              </div>
              {isEditing ? (
                <form onSubmit={handleSave} className="card p-6 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-slate-700 mb-1 block">Nom complet</label>
                      <input type="text" value={editForm.full_name} onChange={e => setEditForm(f => ({ ...f, full_name: e.target.value }))} className="input-field" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700 mb-1 block">Téléphone</label>
                      <input type="tel" value={editForm.phone} onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))} className="input-field" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700 mb-1 block">Adresse</label>
                      <input type="text" value={editForm.location} onChange={e => setEditForm(f => ({ ...f, location: e.target.value }))} className="input-field" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700 mb-1 block">Ville</label>
                      <input type="text" value={editForm.city} onChange={e => setEditForm(f => ({ ...f, city: e.target.value }))} className="input-field" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" className="btn-primary py-2 px-4"><Save className="w-4 h-4 mr-1" /> Enregistrer</button>
                    <button type="button" onClick={() => setIsEditing(false)} className="btn-outline py-2 px-4"><X className="w-4 h-4 mr-1" /> Annuler</button>
                  </div>
                </form>
              ) : (
                <div className="card p-6 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5 text-slate-400" />
                      <div>
                        <p className="text-xs text-slate-500">Nom complet</p>
                        <p className="text-sm font-medium text-slate-900">{profile?.full_name || 'Non renseigné'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-slate-400" />
                      <div>
                        <p className="text-xs text-slate-500">Email</p>
                        <p className="text-sm font-medium text-slate-900">{profile?.email || 'Non renseigné'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-slate-400" />
                      <div>
                        <p className="text-xs text-slate-500">Téléphone</p>
                        <p className="text-sm font-medium text-slate-900">{profile?.phone || 'Non renseigné'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-slate-400" />
                      <div>
                        <p className="text-xs text-slate-500">Adresse</p>
                        <p className="text-sm font-medium text-slate-900">{profile?.location || 'Non renseigné'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'orders' && (
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-4">Mes commandes</h2>
              {orders.length === 0 ? (
                <div className="card p-10 text-center">
                  <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">Aucune commande pour le moment.</p>
                  <Link to="/search" className="btn-primary mt-4 text-sm py-2 px-4 inline-block">Découvrir des produits</Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map(order => (
                    <div key={order.id} className="card overflow-hidden">
                      <div className="p-4 bg-slate-50 border-b border-slate-100">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center">
                              <Package className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-900">{order.order_number}</p>
                              <p className="text-xs text-slate-500">{new Date(order.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            {statusBadge(order.status)}
                            <p className="text-sm font-bold text-slate-900 mt-1">{formatPrice(order.total, order.currency)}</p>
                          </div>
                        </div>
                      </div>
                      <div className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {['pending', 'confirmed', 'paid', 'shipped', 'delivered'].map((step, idx) => {
                            const stepLabels: Record<string, string> = {
                              pending: 'En attente', confirmed: 'Confirmée', paid: 'Payée', shipped: 'Expédiée', delivered: 'Livrée'
                            };
                            const isActive = getStepIndex(order.status) >= idx;
                            return (
                              <div key={step} className="flex items-center flex-1">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors ${isActive ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-400'}`}>
                                  {isActive ? <Check className="w-3 h-3" /> : idx + 1}
                                </div>
                                <div className="hidden sm:block ml-1.5">
                                  <p className={`text-[10px] font-medium ${isActive ? 'text-teal-600' : 'text-slate-400'}`}>{stepLabels[step]}</p>
                                </div>
                                {idx < 4 && <div className={`flex-1 h-0.5 mx-2 ${isActive ? 'bg-teal-600' : 'bg-slate-200'}`} />}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      {order.tracking_number && (
                        <div className="px-4 py-2 bg-blue-50 border-y border-blue-100">
                          <div className="flex items-center gap-2 text-sm text-blue-700">
                            <Truck className="w-4 h-4" />
                            <span className="font-medium">Numéro de suivi :</span>
                            <span>{order.tracking_number}</span>
                          </div>
                        </div>
                      )}
                      <div className="px-4 py-3 border-t border-slate-100 space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-slate-600">
                          <MapPin className="w-4 h-4 text-slate-400" />
                          <span>{order.delivery_mode === 'pickup' ? 'Retrait chez le vendeur' : `${order.delivery_address || 'Adresse non spécifiée'}, ${order.delivery_city || 'Ouagadougou'}`}</span>
                        </div>
                        {order.delivery_phone && (
                          <div className="flex items-center gap-2 text-slate-600">
                            <Phone className="w-4 h-4 text-slate-400" />
                            <span>{order.delivery_phone}</span>
                          </div>
                        )}
                        {order.delivery_notes && (
                          <div className="flex items-start gap-2 text-amber-700">
                            <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5" />
                            <span>{order.delivery_notes}</span>
                          </div>
                        )}
                      </div>
                      <div className="px-4 py-3 border-t border-slate-100 space-y-2">
                        {order.order_items?.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-slate-100 rounded-lg overflow-hidden shrink-0">
                              {item.product?.images?.[0] ? (
                                <Link to={`/product/${item.product.slug}`}>
                                  <img src={item.product.images[0].url} alt="" className="w-full h-full object-cover" />
                                </Link>
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-300"><Package className="w-5 h-5" /></div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <Link to={`/product/${item.product?.slug || '#'}`} className="text-sm text-slate-700 hover:text-teal-600 truncate block">
                                {item.title}
                              </Link>
                              <p className="text-xs text-slate-500">{item.quantity} x {formatPrice(item.price, order.currency)}</p>
                            </div>
                            <span className="text-sm font-medium text-slate-900">{formatPrice(item.subtotal, order.currency)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'favorites' && (
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-4">Mes favoris</h2>
              {favorites.length === 0 ? (
                <div className="card p-10 text-center">
                  <Heart className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 mb-4">Vous n'avez pas encore de favoris.</p>
                  <Link to="/search" className="btn-primary text-sm py-2 px-4">Découvrir des produits</Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {favorites.map(fav => (
                    <div key={fav.id} className="card overflow-hidden">
                      <Link to={`/product/${fav.product.slug}`}>
                        <div className="aspect-square bg-slate-100 overflow-hidden">
                          {fav.product.images?.[0] ? (
                            <img src={fav.product.images[0].url} alt={fav.product.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                              <Package className="w-10 h-10" />
                            </div>
                          )}
                        </div>
                      </Link>
                      <div className="p-4">
                        <Link to={`/product/${fav.product.slug}`} className="block">
                          <h3 className="font-medium text-slate-900 hover:text-teal-600 transition-colors line-clamp-2">{fav.product.title}</h3>
                        </Link>
                        <p className="text-sm font-bold text-slate-900 mt-2">{formatPrice(fav.product.price, fav.product.currency)}</p>
                        <div className="flex items-center gap-2 mt-3">
                          <Link to={`/product/${fav.product.slug}`} className="btn-primary text-sm py-1.5 px-3 flex-1 text-center">
                            Voir le produit
                          </Link>
                          <button onClick={() => removeFavorite(fav.id)} className="p-2 rounded-lg text-red-500 hover:bg-red-50">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
