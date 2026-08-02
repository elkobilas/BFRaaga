import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import {
  Search,
  ShoppingCart,
  User,
  Menu,
  X,
  Store,
  Heart,
  LogOut,
  ChevronDown,
  Shield,
} from 'lucide-react';

export function Navbar() {
  const { user, profile, isAuthenticated, isAdmin, isSeller, signOut } = useAuth();
  const { itemCount } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      <div className="page-container">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center">
              <Store className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-teal-700 hidden sm:block">BF RAAGA</span>
          </Link>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 max-w-xl hidden md:block">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher des produits et services..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            </div>
          </form>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Mobile search toggle */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-slate-100"
              onClick={() => navigate('/search')}
            >
              <Search className="w-5 h-5 text-slate-600" />
            </button>

            {/* Cart */}
            <Link to="/cart" className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors">
              <ShoppingCart className="w-5 h-5 text-slate-600" />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 flex items-center justify-center bg-orange-500 text-white text-xs font-bold rounded-full">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* User menu */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center">
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <User className="w-4 h-4 text-teal-600" />
                    )}
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
                </button>

                {isUserMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsUserMenuOpen(false)} />
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-20">
                      <div className="px-4 py-3 border-b border-slate-100">
                        <p className="text-sm font-medium text-slate-900 truncate">
                          {profile?.full_name || user?.email}
                        </p>
                        <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                      </div>

                      <Link
                        to="/account"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <User className="w-4 h-4" />
                        Mon compte
                      </Link>
                      <Link
                        to="/account?tab=favorites"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Heart className="w-4 h-4" />
                        Favoris
                      </Link>

                      {isSeller && (
                        <Link
                          to="/seller"
                          className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <Store className="w-4 h-4" />
                          Espace vendeur
                        </Link>
                      )}

                      {isAdmin && (
                        <Link
                          to="/admin"
                          className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <Shield className="w-4 h-4" />
                          Administration
                        </Link>
                      )}

                      <div className="border-t border-slate-100 mt-1 pt-1">
                        <button
                          onClick={() => {
                            signOut();
                            setIsUserMenuOpen(false);
                          }}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full"
                        >
                          <LogOut className="w-4 h-4" />
                          Déconnexion
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="hidden sm:inline-flex items-center px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900"
                >
                  Connexion
                </Link>
                <Link
                  to="/register"
                  className="btn-primary text-sm px-3 py-2"
                >
                  Inscription
                </Link>
              </div>
            )}

            {/* Mobile menu */}
            <button
              className="lg:hidden p-2 rounded-lg hover:bg-slate-100"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 border-t border-slate-100">
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              </div>
            </form>
            <nav className="space-y-1">
              <Link to="/" className="block px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50" onClick={() => setIsMenuOpen(false)}>
                Accueil
              </Link>
              <Link to="/search" className="block px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50" onClick={() => setIsMenuOpen(false)}>
                Tous les produits
              </Link>
              <Link to="/cart" className="block px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50" onClick={() => setIsMenuOpen(false)}>
                Panier ({itemCount})
              </Link>
              {isAuthenticated && (
                <>
                  <Link to="/account" className="block px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50" onClick={() => setIsMenuOpen(false)}>
                    Mon compte
                  </Link>
                  {isSeller && (
                    <Link to="/seller" className="block px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50" onClick={() => setIsMenuOpen(false)}>
                      Espace vendeur
                    </Link>
                  )}
                  {isAdmin && (
                    <Link to="/admin" className="block px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50" onClick={() => setIsMenuOpen(false)}>
                      Administration
                    </Link>
                  )}
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
