import { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import {
  Shield, Users, Package, ShoppingBag, ArrowLeft, BarChart3,
  DollarSign, Search
} from 'lucide-react';

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  is_verified: boolean;
  created_at: string;
}

interface Seller {
  id: string;
  business_name: string;
  slug: string;
  is_active: boolean;
  is_verified: boolean;
  rating: number;
  total_sales: number;
  created_at: string;
  user: { email: string } | null;
}

interface Product {
  id: string;
  title: string;
  slug: string;
  price: number;
  stock: number;
  is_active: boolean;
  seller: { business_name: string } | null;
  created_at: string;
}

interface Order {
  id: string;
  order_number: string;
  status: string;
  total: number;
  currency: string;
  created_at: string;
  user: { email: string; full_name: string | null } | null;
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

export function AdminDashboard() {
  return (
    <div className="page-container py-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Sidebar />
        <div className="lg:col-span-3">
          <Routes>
            <Route path="" element={<AdminOverview />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="sellers" element={<AdminSellers />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="orders" element={<AdminOrders />} />
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
    { id: '/admin', label: 'Vue d\'ensemble', icon: BarChart3 },
    { id: '/admin/users', label: 'Utilisateurs', icon: Users },
    { id: '/admin/sellers', label: 'Vendeurs', icon: Shield },
    { id: '/admin/products', label: 'Produits', icon: Package },
    { id: '/admin/orders', label: 'Commandes', icon: ShoppingBag },
  ];
  return (
    <div className="lg:col-span-1">
      <div className="card p-5 sticky top-24">
        <Link to="/" className="inline-flex items-center text-sm text-slate-500 hover:text-slate-900 mb-4">
          <ArrowLeft className="w-4 h-4 mr-1" /> Retour
        </Link>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-slate-900">Admin</span>
        </div>
        <nav className="space-y-1">
          {items.map(item => {
            const Icon = item.icon;
            return (
              <Link
                key={item.id}
                to={item.id}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${isActive(item.id) ? 'bg-slate-900 text-white font-medium' : 'text-slate-600 hover:bg-slate-50'}`}
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

function AdminOverview() {
  const [stats, setStats] = useState({ users: 0, sellers: 0, products: 0, orders: 0, revenue: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [uRes, sRes, pRes, oRes] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('sellers').select('id', { count: 'exact', head: true }),
        supabase.from('products').select('id', { count: 'exact', head: true }),
        supabase.from('orders').select('total'),
      ]);
      const revenue = (oRes.data || []).reduce((sum, o) => sum + (o.total || 0), 0);
      setStats({
        users: uRes.count || 0,
        sellers: sRes.count || 0,
        products: pRes.count || 0,
        orders: oRes.data?.length || 0,
        revenue,
      });
      setIsLoading(false);
    }
    load();
  }, []);

  if (isLoading) return <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900" /></div>;

  const cards = [
    { label: 'Utilisateurs', value: stats.users, icon: Users, color: 'bg-blue-100 text-blue-600' },
    { label: 'Vendeurs', value: stats.sellers, icon: Shield, color: 'bg-teal-100 text-teal-600' },
    { label: 'Produits', value: stats.products, icon: Package, color: 'bg-orange-100 text-orange-600' },
    { label: 'Commandes', value: stats.orders, icon: ShoppingBag, color: 'bg-purple-100 text-purple-600' },
    { label: 'Chiffre d\'affaires', value: formatPrice(stats.revenue, 'XOF'), icon: DollarSign, color: 'bg-green-100 text-green-600', isText: true },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map(card => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="card p-5">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${card.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">{card.label}</p>
                  <p className="text-xl font-bold text-slate-900">{card.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AdminUsers() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(100);
    setUsers((data as Profile[]) || []);
    setIsLoading(false);
  }

  const filtered = users.filter(u =>
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    (u.full_name?.toLowerCase() || '').includes(search.toLowerCase())
  );

  const toggleRole = async (id: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'customer' : currentRole === 'seller' ? 'admin' : 'seller';
    await supabase.from('profiles').update({ role: newRole }).eq('id', id);
    setUsers(prev => prev.map(u => u.id === id ? { ...u, role: newRole } : u));
  };

  if (isLoading) return <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900" /></div>;

  return (
    <div>
      <h2 className="text-xl font-bold text-slate-900 mb-4">Utilisateurs</h2>
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..." className="input-field pl-10" />
      </div>
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-slate-700">Utilisateur</th>
                <th className="text-left px-4 py-3 font-medium text-slate-700">Rôle</th>
                <th className="text-left px-4 py-3 font-medium text-slate-700">Inscrit</th>
                <th className="text-left px-4 py-3 font-medium text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id} className="border-t border-slate-100">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-slate-900">{u.full_name || 'Non renseigné'}</p>
                      <p className="text-xs text-slate-500">{u.email}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-1 rounded ${u.role === 'admin' ? 'bg-slate-900 text-white' : u.role === 'seller' ? 'bg-teal-100 text-teal-700' : 'bg-slate-100 text-slate-700'}`}>{u.role}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{new Date(u.created_at).toLocaleDateString('fr-FR')}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleRole(u.id, u.role)} className="text-xs text-teal-600 hover:text-teal-700 font-medium">Changer rôle</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function AdminSellers() {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('sellers').select('*, user:profiles(email)').order('created_at', { ascending: false }).limit(100);
      setSellers((data as unknown as Seller[]) || []);
      setIsLoading(false);
    }
    load();
  }, []);

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from('sellers').update({ is_active: !current }).eq('id', id);
    setSellers(prev => prev.map(s => s.id === id ? { ...s, is_active: !current } : s));
  };

  const toggleVerified = async (id: string, current: boolean) => {
    await supabase.from('sellers').update({ is_verified: !current }).eq('id', id);
    setSellers(prev => prev.map(s => s.id === id ? { ...s, is_verified: !current } : s));
  };

  if (isLoading) return <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900" /></div>;

  return (
    <div>
      <h2 className="text-xl font-bold text-slate-900 mb-4">Vendeurs</h2>
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-slate-700">Boutique</th>
                <th className="text-left px-4 py-3 font-medium text-slate-700">Email</th>
                <th className="text-left px-4 py-3 font-medium text-slate-700">Note</th>
                <th className="text-left px-4 py-3 font-medium text-slate-700">Ventes</th>
                <th className="text-left px-4 py-3 font-medium text-slate-700">Statut</th>
                <th className="text-left px-4 py-3 font-medium text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sellers.map(s => (
                <tr key={s.id} className="border-t border-slate-100">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center font-bold text-xs">
                        {s.business_name[0]}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{s.business_name}</p>
                        <Link to={`/seller/${s.slug}`} className="text-xs text-teal-600 hover:underline">Voir la boutique</Link>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{s.user?.email}</td>
                  <td className="px-4 py-3 text-slate-500">{s.rating.toFixed(1)}</td>
                  <td className="px-4 py-3 text-slate-500">{s.total_sales}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-1 rounded ${s.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{s.is_active ? 'Actif' : 'Inactif'}</span>
                    {s.is_verified && <span className="text-xs font-medium px-2 py-1 rounded bg-teal-100 text-teal-700 ml-1">Vérifié</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => toggleActive(s.id, s.is_active)} className="text-xs text-teal-600 hover:text-teal-700 font-medium">{s.is_active ? 'Désactiver' : 'Activer'}</button>
                      <span className="text-slate-300">|</span>
                      <button onClick={() => toggleVerified(s.id, s.is_verified)} className="text-xs text-teal-600 hover:text-teal-700 font-medium">{s.is_verified ? 'Unverify' : 'Vérifier'}</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('products').select('id, title, slug, price, stock, is_active, seller:sellers(business_name), created_at').order('created_at', { ascending: false }).limit(100);
      setProducts((data as unknown as Product[]) || []);
      setIsLoading(false);
    }
    load();
  }, []);

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from('products').update({ is_active: !current }).eq('id', id);
    setProducts(prev => prev.map(p => p.id === id ? { ...p, is_active: !current } : p));
  };

  const filtered = products.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    (p.seller?.business_name?.toLowerCase() || '').includes(search.toLowerCase())
  );

  if (isLoading) return <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900" /></div>;

  return (
    <div>
      <h2 className="text-xl font-bold text-slate-900 mb-4">Produits</h2>
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..." className="input-field pl-10" />
      </div>
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-slate-700">Produit</th>
                <th className="text-left px-4 py-3 font-medium text-slate-700">Vendeur</th>
                <th className="text-left px-4 py-3 font-medium text-slate-700">Prix</th>
                <th className="text-left px-4 py-3 font-medium text-slate-700">Stock</th>
                <th className="text-left px-4 py-3 font-medium text-slate-700">Statut</th>
                <th className="text-left px-4 py-3 font-medium text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} className="border-t border-slate-100">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-slate-900">{p.title}</p>
                      <Link to={`/product/${p.slug}`} className="text-xs text-teal-600 hover:underline">Voir</Link>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{p.seller?.business_name}</td>
                  <td className="px-4 py-3 text-slate-500">{formatPrice(p.price, 'XOF')}</td>
                  <td className="px-4 py-3 text-slate-500">{p.stock}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-1 rounded ${p.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{p.is_active ? 'Actif' : 'Inactif'}</span>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleActive(p.id, p.is_active)} className="text-xs text-teal-600 hover:text-teal-700 font-medium">{p.is_active ? 'Désactiver' : 'Activer'}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('orders').select('*, user:profiles(email, full_name)').order('created_at', { ascending: false }).limit(100);
      setOrders((data as unknown as Order[]) || []);
      setIsLoading(false);
    }
    load();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('orders').update({ status }).eq('id', id);
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
  };

  const filtered = orders.filter(o =>
    o.order_number.toLowerCase().includes(search.toLowerCase()) ||
    (o.user?.email?.toLowerCase() || '').includes(search.toLowerCase()) ||
    (o.user?.full_name?.toLowerCase() || '').includes(search.toLowerCase())
  );

  if (isLoading) return <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900" /></div>;

  return (
    <div>
      <h2 className="text-xl font-bold text-slate-900 mb-4">Commandes</h2>
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..." className="input-field pl-10" />
      </div>
      <div className="space-y-4">
        {filtered.map(o => (
          <div key={o.id} className="card p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-sm font-medium text-slate-900">{o.order_number}</p>
                <p className="text-xs text-slate-500">{o.user?.full_name || o.user?.email} · {new Date(o.created_at).toLocaleDateString('fr-FR')}</p>
              </div>
              <div className="text-right">
                {statusBadge(o.status)}
                <p className="text-sm font-bold text-slate-900 mt-1">{formatPrice(o.total, o.currency)}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {['pending', 'confirmed', 'paid', 'shipped', 'delivered', 'cancelled'].map(s => (
                <button
                  key={s}
                  onClick={() => updateStatus(o.id, s)}
                  className={`text-xs px-2 py-1 rounded border ${o.status === s ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                >
                  {s === 'pending' ? 'En attente' : s === 'confirmed' ? 'Confirmée' : s === 'paid' ? 'Payée' : s === 'shipped' ? 'Expédiée' : s === 'delivered' ? 'Livrée' : 'Annulée'}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
