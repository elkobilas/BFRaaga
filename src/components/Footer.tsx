import { Link } from 'react-router-dom';
import { Store, Mail, Phone, MapPin, Facebook, Instagram, Twitter } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="page-container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center">
                <Store className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">BF RAAGA</span>
            </Link>
            <p className="text-sm text-slate-400 mb-4">
              La marketplace locale du Burkina Faso. Achetez et vendez des produits et services en toute confiance.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center hover:bg-teal-600 transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center hover:bg-teal-600 transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center hover:bg-teal-600 transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Liens rapides</h3>
            <ul className="space-y-2">
              <li><Link to="/search" className="text-sm hover:text-teal-400 transition-colors">Tous les produits</Link></li>
              <li><Link to="/" className="text-sm hover:text-teal-400 transition-colors">Nouveautés</Link></li>
              <li><Link to="/" className="text-sm hover:text-teal-400 transition-colors">Promotions</Link></li>
              <li><Link to="/how-to-sell" className="text-sm hover:text-teal-400 transition-colors">Vendre sur BF RAAGA</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Support</h3>
            <ul className="space-y-2">
              <li><Link to="/how-to-buy" className="text-sm hover:text-teal-400 transition-colors">Comment acheter</Link></li>
              <li><Link to="/how-to-sell" className="text-sm hover:text-teal-400 transition-colors">Comment vendre</Link></li>
              <li><Link to="/faq" className="text-sm hover:text-teal-400 transition-colors">FAQ</Link></li>
              <li><Link to="/contact" className="text-sm hover:text-teal-400 transition-colors">Contact</Link></li>
              <li><Link to="/about" className="text-sm hover:text-teal-400 transition-colors">À propos</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm">
                <MapPin className="w-4 h-4 text-teal-500 mt-0.5 shrink-0" />
                <span>Ouagadougou, Burkina Faso</span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-teal-500 shrink-0" />
                <span>+226 71 64 48 00</span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-teal-500 shrink-0" />
                <span>contact@bfraaga.bf</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-10 pt-6 text-center text-sm text-slate-500">
          <p> BF RAAGA. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}
