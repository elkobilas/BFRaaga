import { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { ImageUpload } from '../components/ImageUpload';
import { SellerImageUpload } from '../components/SellerImageUpload';
import {
  Store, Package, ShoppingBag, Settings, Plus, Trash2, Edit3, Star, ArrowLeft,
  Check, AlertTriangle, X, ChevronRight, DollarSign, BarChart3, Save, ImageIcon,
  MapPin, Phone, Truck
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
  is_active: boolean;
  rating: number;
  review_count: number;
  total_sales: number;
  commission_rate: number;
}

interface Product {
  id: string;
  title: string;
  slug: string;
  price: number;
  stock: number;
  condition: string;
  is_active: boolean;
  total_sales: number;
  rating: number;
  images: { url: string }[];
}

interface Order {
  id: string;
  order_number: string;
  status: string;
  total: number;
  currency: string;
  created_at: string;
  delivery_city: string | null;
  order_items: { title: string; quantity: number; price: number }[];
}

function formatPrice(price: number, currency: string) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency }).format(price);
}

function statusBadge(status: string) {
  const map: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700',
    confirmed: 'bg-blue-100 text-blue-700',
    paid: 'bg-green-100 text-green-700',
    shipped: 'bg-purple-100 text-purple-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
  };
  const labels: Record<string, string> = {
    pending: 'En attente', confirmed: 'Confirmée', paid: 'Payée', shipped: 'Expédiée', delivered: 'Livrée', cancelled: 'Annulée',
  };
  return <span className={`text-xs font-medium px-2 py-1 rounded ${map[status] || 'bg-slate-100 text-slate-700'}`}>{labels[status] || status}</span>;
}

export function SellerDashboard() {
  return (
    <div className="page-container py-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Sidebar />
        <div className="lg:col-span-3">
          <Routes>
            <Route path="" element={<SellerOverview />} />
            <Route path="products" element={<SellerProducts />} />
            <Route path="products/new" element={<SellerProductForm />} />
            <Route path="products/edit/:id" element={<SellerProductForm />} />
            <Route path="orders" element={<SellerOrders />} />
            <Route path="settings" element={<SellerSettings />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

function Sidebar() {
  const location = useLocation();
  const path = location.pathname;
  const isActive = (p: string) => path === p || path.startsWith(p + '/');

  const items = [
    { id: '/seller', label: 'Tableau de bord', icon: BarChart3 },
    { id: '/seller/products', label: 'Mes produits', icon: Package },
    { id: '/seller/orders', label: 'Commandes', icon: ShoppingBag },
    { id: '/seller/settings', label: 'Paramètres', icon: Settings },
  ];

  return (
    <div className="lg:col-span-1">
      <div className="card p-5 sticky top-24">
        <Link to="/" className="inline-flex items-center text-sm text-slate-500 hover:text-slate-900 mb-4">
          <ArrowLeft className="w-4 h-4 mr-1" /> Retour
        </Link>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center">
            <Store className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-slate-900">Espace Vendeur</span>
        </div>
        <nav className="space-y-1">
          {items.map(item => {
            const Icon = item.icon;
            return (
              <Link
                key={item.id}
                to={item.id}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${isActive(item.id) ? 'bg-teal-50 text-teal-700 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <Icon className="w-4 h-4" /> {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

function SellerOverview() {
  const { profile } = useAuth();
  const [seller, setSeller] = useState<Seller | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!profile) return;
      const { data: sData } = await supabase.from('sellers').select('*').eq('user_id', profile.id).maybeSingle();
      if (!sData) { setIsLoading(false); return; }
      setSeller(sData);
      const [pData, oData] = await Promise.all([
        supabase.from('products').select('id, title, slug, price, stock, condition, is_active, total_sales, rating, images:product_images(url)').eq('seller_id', sData.id).order('created_at', { ascending: false }).limit(5),
        supabase.from('orders').select('*, order_items(title, quantity, price)').eq('user_id', profile.id).order('created_at', { ascending: false }).limit(5),
      ]);
      setProducts((pData.data as unknown as Product[]) || []);
      setOrders((oData.data as unknown as Order[]) || []);
      setIsLoading(false);
    }
    load();
  }, [profile]);

  if (isLoading) return <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600" /></div>;

  if (!seller) {
    return (
      <div className="card p-8 text-center">
        <Store className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-900 mb-2">Vous n'avez pas encore de boutique</h2>
        <p className="text-slate-500 mb-4">Créez votre boutique pour commencer à vendre.</p>
        <Link to="/seller/settings" className="btn-primary">Créer ma boutique</Link>
      </div>
    );
  }

  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-teal-100 text-teal-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Chiffre d'affaires</p>
              <p className="text-xl font-bold text-slate-900">{formatPrice(totalRevenue, 'XOF')}</p>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Commandes</p>
              <p className="text-xl font-bold text-slate-900">{orders.length}</p>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Produits</p>
              <p className="text-xl font-bold text-slate-900">{products.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-900">Produits récents</h3>
          <Link to="/seller/products" className="text-sm text-teal-600 hover:text-teal-700 flex items-center gap-1"><ChevronRight className="w-4 h-4" /> Voir tout</Link>
        </div>
        <div className="space-y-3">
          {products.map(p => (
            <div key={p.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              <div className="w-12 h-12 bg-slate-200 rounded-lg overflow-hidden shrink-0">
                {p.images?.[0] ? <img src={p.images[0].url} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-400"><Package className="w-5 h-5" /></div>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">{p.title}</p>
                <p className="text-xs text-slate-500">{formatPrice(p.price, 'XOF')} · Stock: {p.stock}</p>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded ${p.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>{p.is_active ? 'Actif' : 'Inactif'}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SellerProducts() {
  const { profile } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!profile) return;
      const { data: sData } = await supabase.from('sellers').select('id').eq('user_id', profile.id).maybeSingle();
      if (!sData) { setIsLoading(false); return; }
      const { data } = await supabase.from('products').select('id, title, slug, price, stock, condition, is_active, total_sales, rating, images:product_images(url)').eq('seller_id', sData.id).order('created_at', { ascending: false });
      setProducts((data as unknown as Product[]) || []);
      setIsLoading(false);
    }
    load();
  }, [profile]);

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from('products').update({ is_active: !current }).eq('id', id);
    setProducts(prev => prev.map(p => p.id === id ? { ...p, is_active: !current } : p));
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('Supprimer ce produit ?')) return;
    await supabase.from('products').delete().eq('id', id);
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  if (isLoading) return <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-slate-900">Mes produits</h2>
        <Link to="/seller/products/new" className="btn-primary text-sm py-2 px-4"><Plus className="w-4 h-4 mr-1" /> Ajouter un produit</Link>
      </div>
      {products.length === 0 ? (
        <div className="card p-10 text-center">
          <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 mb-4">Vous n'avez pas encore de produits.</p>
          <Link to="/seller/products/new" className="btn-primary text-sm py-2 px-4">Ajouter mon premier produit</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {products.map(p => (
            <div key={p.id} className="card p-4 flex items-center gap-4">
              <div className="w-16 h-16 bg-slate-100 rounded-lg overflow-hidden shrink-0">
                {p.images?.[0] ? <img src={p.images[0].url} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-300"><ImageIcon className="w-6 h-6" /></div>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-900 truncate">{p.title}</p>
                <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                  <span>{formatPrice(p.price, 'XOF')}</span>
                  <span>Stock: {p.stock}</span>
                  <span className="capitalize">{p.condition}</span>
                  <span className="flex items-center gap-1 text-amber-500"><Star className="w-3 h-3 fill-current" /> {p.rating.toFixed(1)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => toggleActive(p.id, p.is_active)} className={`p-2 rounded-lg text-sm ${p.is_active ? 'bg-green-50 text-green-600' : 'bg-slate-50 text-slate-400'}`} title={p.is_active ? 'Désactiver' : 'Activer'}>
                  <Check className="w-4 h-4" />
                </button>
                <Link to={`/seller/products/edit/${p.id}`} className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100"><Edit3 className="w-4 h-4" /></Link>
                <button onClick={() => deleteProduct(p.id)} className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SellerProductForm() {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [seller, setSeller] = useState<any>(null);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    title: '', slug: '', description: '', price: '', compare_price: '', stock: '1', category_id: '',
    condition: 'new', sku: '', weight_kg: '', tags: '', city: 'Ouagadougou', is_active: true,
  });
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  useEffect(() => {
    async function load() {
      if (!profile) return;
      const { data: sData } = await supabase.from('sellers').select('id').eq('user_id', profile.id).maybeSingle();
      if (!sData) { setError('Vous devez créer une boutique d\'abord'); return; }
      setSeller(sData);
      const { data: cData } = await supabase.from('categories').select('id, name').eq('is_active', true).order('name');
      setCategories(cData || []);
      if (isEdit) {
        const { data: pData } = await supabase.from('products').select('*').eq('id', id).maybeSingle();
        if (pData) {
          setForm({
            title: pData.title,
            slug: pData.slug,
            description: pData.description,
            price: String(pData.price),
            compare_price: pData.compare_price ? String(pData.compare_price) : '',
            stock: String(pData.stock),
            category_id: pData.category_id || '',
            condition: pData.condition,
            sku: pData.sku || '',
            weight_kg: pData.weight_kg ? String(pData.weight_kg) : '',
            tags: pData.tags?.join(', ') || '',
            city: pData.city || 'Ouagadougou',
            is_active: pData.is_active,
          });
          const { data: imgData } = await supabase.from('product_images').select('url').eq('product_id', id).order('sort_order', { ascending: true });
          if (imgData) setImageUrls(imgData.map((i: any) => i.url));
        }
      }
    }
    load();
  }, [profile, id, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!seller) return;
    setError('');
    setIsLoading(true);

    const productData = {
      seller_id: seller.id,
      title: form.title,
      slug: form.slug || form.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      description: form.description,
      price: parseFloat(form.price),
      compare_price: form.compare_price ? parseFloat(form.compare_price) : null,
      stock: parseInt(form.stock),
      category_id: form.category_id || null,
      condition: form.condition,
      sku: form.sku || null,
      weight_kg: form.weight_kg ? parseFloat(form.weight_kg) : null,
      tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : null,
      city: form.city,
      is_active: form.is_active,
    };

    try {
      let productId = id;
      if (isEdit) {
        const { error } = await supabase.from('products').update(productData).eq('id', id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from('products').insert(productData).select('id').single();
        if (error) throw error;
        productId = data.id;
      }

      // Sync images
      if (imageUrls.length > 0) {
        // Delete existing images
        await supabase.from('product_images').delete().eq('product_id', productId);
        // Insert new images
        const imageInserts = imageUrls.map((url, idx) => ({
          product_id: productId,
          url,
          alt_text: form.title,
          is_primary: idx === 0,
          sort_order: idx,
        }));
        await supabase.from('product_images').insert(imageInserts);
      }

      navigate('/seller/products');
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'enregistrement');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Link to="/seller/products" className="p-2 rounded-lg hover:bg-slate-100"><ArrowLeft className="w-5 h-5 text-slate-500" /></Link>
        <h2 className="text-xl font-bold text-slate-900">{isEdit ? 'Modifier le produit' : 'Nouveau produit'}</h2>
      </div>
      {error && <div className="mb-4 p-4 rounded-lg bg-red-50 text-red-700 flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> {error}</div>}
      <form onSubmit={handleSubmit} className="card p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="text-sm font-medium text-slate-700 mb-1 block">Nom du produit *</label>
            <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="input-field" required />
          </div>
          <div className="sm:col-span-2">
            <label className="text-sm font-medium text-slate-700 mb-1 block">Description *</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="input-field" rows={4} required />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">Prix (XOF) *</label>
            <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} className="input-field" required min="0" />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">Prix barré (optionnel)</label>
            <input type="number" value={form.compare_price} onChange={e => setForm(f => ({ ...f, compare_price: e.target.value }))} className="input-field" min="0" />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">Stock *</label>
            <input type="number" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} className="input-field" required min="0" />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">Catégorie</label>
            <select value={form.category_id} onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))} className="input-field">
              <option value="">Choisir...</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">État</label>
            <select value={form.condition} onChange={e => setForm(f => ({ ...f, condition: e.target.value }))} className="input-field">
              <option value="new">Neuf</option>
              <option value="used">Occasion</option>
              <option value="refurbished">Reconditionné</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">Slug (URL)</label>
            <input type="text" value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} className="input-field" placeholder="mon-produit" />
          </div>
          <div className="sm:col-span-2">
            <label className="text-sm font-medium text-slate-700 mb-2 block">Photos du produit</label>
            <ImageUpload onUpload={setImageUrls} maxFiles={5} existingImages={imageUrls} />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">Tags (séparés par virgule)</label>
            <input type="text" value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} className="input-field" placeholder="tag1, tag2..." />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">Ville</label>
            <input type="text" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} className="input-field" />
          </div>
          <div className="sm:col-span-2 flex items-center gap-2">
            <input type="checkbox" id="is_active" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} className="rounded border-slate-300" />
            <label htmlFor="is_active" className="text-sm text-slate-700">Produit actif et visible</label>
          </div>
        </div>
        <div className="flex gap-2 pt-2">
          <button type="submit" disabled={isLoading} className="btn-primary py-2 px-6"><Save className="w-4 h-4 mr-1" /> {isLoading ? 'Enregistrement...' : 'Enregistrer'}</button>
          <Link to="/seller/products" className="btn-outline py-2 px-6"><X className="w-4 h-4 mr-1" /> Annuler</Link>
        </div>
      </form>
    </div>
  );
}

function SellerOrders() {
  const { profile } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    async function load() {
      if (!profile) return;
      const { data: sellerData } = await supabase.from('sellers').select('id').eq('user_id', profile.id).maybeSingle();
      if (!sellerData) { setIsLoading(false); return; }
      // Get orders that contain products from this seller
      const { data } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(*, product:products(id, title, slug, price, images:product_images(url)))
        `)
        .order('created_at', { ascending: false });
      // Filter orders that have items from this seller
      const sellerOrders = (data || []).filter((o: any) =>
        o.order_items?.some((item: any) => item.seller_id === sellerData.id)
      );
      setOrders(sellerOrders);
      setIsLoading(false);
    }
    load();
  }, [profile]);

  const updateOrderStatus = async (orderId: string, status: string, tracking?: string) => {
    setActionLoading(true);
    const update: any = { status };
    if (tracking) update.tracking_number = tracking;
    const { error } = await supabase.from('orders').update(update).eq('id', orderId);
    if (!error) {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...update } : o));
      setSelectedOrder(null);
      setTrackingNumber('');
    }
    setActionLoading(false);
  };

  const getStatusActions = (status: string) => {
    const actions: Record<string, { label: string; status: string; color: string; icon: any }[]> = {
      pending: [
        { label: 'Confirmer', status: 'confirmed', color: 'bg-blue-50 text-blue-600 hover:bg-blue-100', icon: Check },
        { label: 'Refuser', status: 'cancelled', color: 'bg-red-50 text-red-600 hover:bg-red-100', icon: X },
      ],
      confirmed: [
        { label: 'Marquer payée', status: 'paid', color: 'bg-green-50 text-green-600 hover:bg-green-100', icon: DollarSign },
        { label: 'Annuler', status: 'cancelled', color: 'bg-red-50 text-red-600 hover:bg-red-100', icon: X },
      ],
      paid: [
        { label: 'Expédier', status: 'shipped', color: 'bg-purple-50 text-purple-600 hover:bg-purple-100', icon: Truck },
      ],
      shipped: [
        { label: 'Marquer livrée', status: 'delivered', color: 'bg-green-50 text-green-600 hover:bg-green-100', icon: Check },
      ],
    };
    return actions[status] || [];
  };

  if (isLoading) return <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600" /></div>;

  return (
    <div>
      <h2 className="text-xl font-bold text-slate-900 mb-6">Commandes reçues</h2>
      {orders.length === 0 ? (
        <div className="card p-10 text-center">
          <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">Aucune commande pour le moment.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(o => (
            <div key={o.id} className="card p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-slate-900">{o.order_number}</p>
                    {statusBadge(o.status)}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{new Date(o.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {o.delivery_city || 'Ouagadougou'}</span>
                    {o.delivery_phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {o.delivery_phone}</span>}
                    {o.delivery_mode === 'pickup' && <span className="bg-teal-50 text-teal-600 px-1.5 py-0.5 rounded text-[10px] font-medium">Retrait</span>}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900">{formatPrice(o.total, o.currency)}</p>
                  <p className="text-xs text-slate-500">{o.order_items?.length} article{o.order_items?.length > 1 ? 's' : ''}</p>
                </div>
              </div>

              {/* Order Items */}
              <div className="border-t border-slate-100 pt-3 mb-3 space-y-2">
                {o.order_items?.map((item: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-lg overflow-hidden shrink-0">
                      {item.product?.images?.[0] ? <img src={item.product.images[0].url} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-300"><Package className="w-4 h-4" /></div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-700 truncate">{item.title}</p>
                      <p className="text-xs text-slate-500">{item.quantity} x {formatPrice(item.price, o.currency)}</p>
                    </div>
                    <span className="text-sm font-medium text-slate-900">{formatPrice(item.price * item.quantity, o.currency)}</span>
                  </div>
                ))}
              </div>

              {/* Delivery Address */}
              {o.delivery_address && (
                <div className="bg-slate-50 rounded-lg p-3 mb-3 text-sm text-slate-700">
                  <p className="font-medium text-xs text-slate-500 mb-1">Adresse de livraison</p>
                  <p>{o.delivery_address}</p>
                </div>
              )}
              {o.delivery_notes && (
                <div className="bg-amber-50 rounded-lg p-3 mb-3 text-sm text-amber-800">
                  <p className="font-medium text-xs text-amber-600 mb-1">Note du client</p>
                  <p>{o.delivery_notes}</p>
                </div>
              )}

              {/* Tracking Number */}
              {o.tracking_number && (
                <div className="bg-blue-50 rounded-lg p-3 mb-3 text-sm text-blue-700">
                  <p className="font-medium text-xs text-blue-600 mb-1">Numéro de suivi</p>
                  <p>{o.tracking_number}</p>
                </div>
              )}

              {/* Actions */}
              {o.status !== 'delivered' && o.status !== 'cancelled' && (
                <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
                  {getStatusActions(o.status).map((action, idx) => {
                    const Icon = action.icon;
                    return (
                      <button
                        key={idx}
                        disabled={actionLoading}
                        onClick={() => {
                          if (action.status === 'shipped') {
                            setSelectedOrder(o.id);
                          } else {
                            updateOrderStatus(o.id, action.status);
                          }
                        }}
                        className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${action.color}`}
                      >
                        <Icon className="w-3.5 h-3.5" /> {action.label}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Shipping form */}
              {selectedOrder === o.id && (
                <div className="mt-3 p-4 bg-purple-50 rounded-lg space-y-2">
                  <p className="text-sm font-medium text-purple-700">Numéro de suivi (optionnel)</p>
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={e => setTrackingNumber(e.target.value)}
                    className="input-field text-sm"
                    placeholder="Ex: TRK-123456"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateOrderStatus(o.id, 'shipped', trackingNumber)}
                      disabled={actionLoading}
                      className="btn-primary text-sm py-2 px-4"
                    >
                      Confirmer l'expédition
                    </button>
                    <button
                      onClick={() => { setSelectedOrder(null); setTrackingNumber(''); }}
                      className="btn-outline text-sm py-2 px-4"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SellerSettings() {
  const { profile, refreshProfile } = useAuth();
  const [seller, setSeller] = useState<Seller | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({
    business_name: '', slug: '', description: '', logo_url: '', cover_image: '', address: '', city: 'Ouagadougou',
    phone: '', whatsapp: '', business_hours: '',
  });

  useEffect(() => {
    async function load() {
      if (!profile) return;
      const { data } = await supabase.from('sellers').select('*').eq('user_id', profile.id).maybeSingle();
      if (data) {
        setSeller(data);
        setForm({
          business_name: data.business_name,
          slug: data.slug,
          description: data.description || '',
          logo_url: data.logo_url || '',
          cover_image: data.cover_image || '',
          address: data.address || '',
          city: data.city || 'Ouagadougou',
          phone: data.phone || '',
          whatsapp: data.whatsapp || '',
          business_hours: data.business_hours || '',
        });
      }
      setIsLoading(false);
    }
    load();
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const sellerData = {
        user_id: profile!.id,
        business_name: form.business_name,
        slug: form.slug || form.business_name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        description: form.description || null,
        logo_url: form.logo_url || null,
        cover_image: form.cover_image || null,
        address: form.address || null,
        city: form.city,
        phone: form.phone || null,
        whatsapp: form.whatsapp || null,
        business_hours: form.business_hours || null,
      };
      if (seller) {
        const { error } = await supabase.from('sellers').update(sellerData).eq('id', seller.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('sellers').insert(sellerData);
        if (error) throw error;
        await supabase.from('profiles').update({ role: 'seller' }).eq('id', profile!.id);
        refreshProfile();
      }
      setSuccess('Boutique enregistrée avec succès');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Erreur');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600" /></div>;

  return (
    <div>
      <h2 className="text-xl font-bold text-slate-900 mb-6">Paramètres de la boutique</h2>
      {error && <div className="mb-4 p-4 rounded-lg bg-red-50 text-red-700 flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> {error}</div>}
      {success && <div className="mb-4 p-4 rounded-lg bg-green-50 text-green-700 flex items-center gap-2"><Check className="w-4 h-4" /> {success}</div>}
      <form onSubmit={handleSubmit} className="card p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="text-sm font-medium text-slate-700 mb-1 block">Nom de la boutique *</label>
            <input type="text" value={form.business_name} onChange={e => setForm(f => ({ ...f, business_name: e.target.value }))} className="input-field" required />
          </div>
          <div className="sm:col-span-2">
            <label className="text-sm font-medium text-slate-700 mb-1 block">Description</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="input-field" rows={3} />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">Slug (URL)</label>
            <input type="text" value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} className="input-field" placeholder="ma-boutique" />
          </div>
          <div className="sm:col-span-2">
            <label className="text-sm font-medium text-slate-700 mb-2 block">Logo de la boutique</label>
            <SellerImageUpload onUpload={(url) => setForm(f => ({ ...f, logo_url: url }))} existingImage={form.logo_url} label="Logo de la boutique" folder="sellers" />
          </div>
          <div className="sm:col-span-2">
            <label className="text-sm font-medium text-slate-700 mb-2 block">Image de couverture</label>
            <SellerImageUpload onUpload={(url) => setForm(f => ({ ...f, cover_image: url }))} existingImage={form.cover_image} label="Image de couverture" folder="sellers" />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">Adresse</label>
            <input type="text" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} className="input-field" />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">Ville</label>
            <input type="text" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} className="input-field" />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">Téléphone</label>
            <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="input-field" />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">WhatsApp</label>
            <input type="tel" value={form.whatsapp} onChange={e => setForm(f => ({ ...f, whatsapp: e.target.value }))} className="input-field" placeholder="+226..." />
          </div>
          <div className="sm:col-span-2">
            <label className="text-sm font-medium text-slate-700 mb-1 block">Horaires</label>
            <input type="text" value={form.business_hours} onChange={e => setForm(f => ({ ...f, business_hours: e.target.value }))} className="input-field" placeholder="Lun-Ven: 8h-18h" />
          </div>
        </div>
        <div className="flex gap-2 pt-2">
          <button type="submit" disabled={isLoading} className="btn-primary py-2 px-6"><Save className="w-4 h-4 mr-1" /> {isLoading ? 'Enregistrement...' : 'Enregistrer'}</button>
        </div>
      </form>
    </div>
  );
}
