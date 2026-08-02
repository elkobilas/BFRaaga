import { Link } from 'react-router-dom';
import { Store, Shield, Truck, Heart, Globe, ArrowRight } from 'lucide-react';

export function AboutPage() {
  return (
    <div className="page-container py-12">
      <div className="text-center mb-16">
        <div className="w-16 h-16 rounded-2xl bg-teal-600 flex items-center justify-center mx-auto mb-6">
          <Store className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">À propos de BF RAAGA</h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          La marketplace de confiance du Burkina Faso. Nous connectons vendeurs et acheteurs pour un commerce simple, sécurisé et accessible à tous.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        <div className="card p-8">
          <h2 className="text-xl font-bold text-slate-900 mb-3">Notre mission</h2>
          <p className="text-slate-600 leading-relaxed">
            BF RAAGA est née de la volonté de créer une plateforme digitale adaptée aux réalités du Burkina Faso.
            Nous croyons que chaque entrepreneur, artisan ou commerçant mérite un espace en ligne pour présenter
            ses produits et services à une clientèle nationale et internationale.
          </p>
        </div>
        <div className="card p-8">
          <h2 className="text-xl font-bold text-slate-900 mb-3">Notre vision</h2>
          <p className="text-slate-600 leading-relaxed">
            Devenir la référence du commerce en ligne au Burkina Faso et en Afrique de l'Ouest, en facilitant
            l'accès aux produits locaux et en soutenant l'économie locale.
          </p>
        </div>
      </div>
      <h2 className="text-2xl font-bold text-slate-900 text-center mb-8">Nos valeurs</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        <div className="card p-6 text-center hover:shadow-lg transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-600 flex items-center justify-center mx-auto mb-4">
            <Shield className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 mb-2">Confiance</h3>
          <p className="text-sm text-slate-600">Vérification des vendeurs et protection des acheteurs pour des transactions en toute sécurité.</p>
        </div>
        <div className="card p-6 text-center hover:shadow-lg transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center mx-auto mb-4">
            <Truck className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 mb-2">Accessibilité</h3>
          <p className="text-sm text-slate-600">Livraison à domicile ou retrait chez le vendeur, choisissez ce qui vous convient le mieux.</p>
        </div>
        <div className="card p-6 text-center hover:shadow-lg transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-4">
            <Heart className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 mb-2">Proximité</h3>
          <p className="text-sm text-slate-600">Soutenez les artisans et entrepreneurs locaux en achetant des produits Made in Burkina.</p>
        </div>
        <div className="card p-6 text-center hover:shadow-lg transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mx-auto mb-4">
            <Globe className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 mb-2">Ouverture</h3>
          <p className="text-sm text-slate-600">Achetez et vendez sans frontières. Notre plateforme est ouverte à tous.</p>
        </div>
      </div>
      <div className="bg-teal-600 rounded-2xl p-8 text-center mb-16">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div>
            <p className="text-3xl sm:text-4xl font-bold text-white">500+</p>
            <p className="text-teal-100 mt-1">Produits disponibles</p>
          </div>
          <div>
            <p className="text-3xl sm:text-4xl font-bold text-white">100+</p>
            <p className="text-teal-100 mt-1">Vendeurs actifs</p>
          </div>
          <div>
            <p className="text-3xl sm:text-4xl font-bold text-white">24h</p>
            <p className="text-teal-100 mt-1">Livraison à Ouagadougou</p>
          </div>
        </div>
      </div>
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Rejoignez-nous !</h2>
        <p className="text-slate-600 mb-6 max-w-lg mx-auto">
          Que vous soyez acheteur ou vendeur, BF RAAGA est là pour vous accompagner dans votre parcours digital.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link to="/search" className="btn-primary">Explorer les produits <ArrowRight className="w-4 h-4 ml-2" /></Link>
          <Link to="/seller/settings" className="btn-outline">Devenir vendeur <Store className="w-4 h-4 ml-2" /></Link>
        </div>
      </div>
    </div>
  );
}
