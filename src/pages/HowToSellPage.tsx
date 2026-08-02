import { Link } from 'react-router-dom';
import { Camera, Store, ShoppingBag, DollarSign, TrendingUp, ArrowRight, Check, ImagePlus } from 'lucide-react';

const steps = [
  {
    icon: Store,
    title: 'Créez votre boutique',
    desc: 'Créez un compte et renseignez les informations de votre boutique : nom, description, adresse, horaires et contact.',
  },
  {
    icon: ImagePlus,
    title: 'Ajoutez vos produits',
    desc: 'Prenez des photos avec votre téléphone ou téléchargez depuis votre galerie. Ajoutez le prix, la description et le stock.',
  },
  {
    icon: ShoppingBag,
    title: 'Recevez des commandes',
    desc: 'Les clients découvrent vos produits et passent des commandes. Vous recevez une notification pour chaque commande.',
  },
  {
    icon: DollarSign,
    title: 'Livrez et encaissez',
    desc: 'Confirmez la commande, préparez la livraison ou le retrait, et recevez votre paiement. Simple et rapide.',
  },
];

export function HowToSellPage() {
  return (
    <div className="page-container py-12">
      <div className="text-center mb-12">
        <div className="w-16 h-16 rounded-2xl bg-teal-600 flex items-center justify-center mx-auto mb-6">
          <TrendingUp className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">Comment vendre ?</h1>
        <p className="text-slate-600 max-w-2xl mx-auto">
          Devenez vendeur sur BF RAAGA en quelques minutes. C'est gratuit, simple et vous donne accès à des centaines de clients potentiels.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <div key={idx} className="card p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-600 flex items-center justify-center mx-auto mb-4">
                <Icon className="w-6 h-6" />
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center mx-auto -mt-10 mb-3 text-sm font-bold border-4 border-white">
                {idx + 1}
              </div>
              <h3 className="font-bold text-slate-900 mb-2">{step.title}</h3>
              <p className="text-sm text-slate-600">{step.desc}</p>
            </div>
          );
        })}
      </div>
      <div className="bg-teal-600 rounded-2xl p-8 text-white mb-16">
        <h2 className="text-2xl font-bold text-center mb-8">Pourquoi vendre sur BF RAAGA ?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 rounded-xl bg-teal-500 text-white flex items-center justify-center mx-auto mb-3">
              <Store className="w-6 h-6" />
            </div>
            <p className="font-bold mb-1">Boutique gratuite</p>
            <p className="text-sm text-teal-100">Ouverture 100% gratuite, sans abonnement.</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 rounded-xl bg-teal-500 text-white flex items-center justify-center mx-auto mb-3">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <p className="font-bold mb-1">Large clientèle</p>
            <p className="text-sm text-teal-100">Accès à des centaines d'acheteurs actifs.</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 rounded-xl bg-teal-500 text-white flex items-center justify-center mx-auto mb-3">
              <Camera className="w-6 h-6" />
            </div>
            <p className="font-bold mb-1">Photos simples</p>
            <p className="text-sm text-teal-100">Prenez des photos avec votre téléphone directement.</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 rounded-xl bg-teal-500 text-white flex items-center justify-center mx-auto mb-3">
              <DollarSign className="w-6 h-6" />
            </div>
            <p className="font-bold mb-1">Paiement sécurisé</p>
            <p className="text-sm text-teal-100">Mobile Money ou paiement à la livraison.</p>
          </div>
        </div>
      </div>
      <div className="card p-8 mb-16">
        <h2 className="text-xl font-bold text-slate-900 mb-6">Ce dont vous avez besoin</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0 mt-0.5">
              <Check className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="font-medium text-slate-900 text-sm">Un compte BF RAAGA</p>
              <p className="text-sm text-slate-600">Créez un compte en 30 secondes avec votre email et téléphone.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0 mt-0.5">
              <Check className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="font-medium text-slate-900 text-sm">Des photos de vos produits</p>
              <p className="text-sm text-slate-600">Utilisez la caméra de votre téléphone ou choisissez depuis la galerie.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0 mt-0.5">
              <Check className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="font-medium text-slate-900 text-sm">Un numéro de téléphone</p>
              <p className="text-sm text-slate-600">Pour que les clients puissent vous contacter et pour recevoir les paiements.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0 mt-0.5">
              <Check className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="font-medium text-slate-900 text-sm">WhatsApp (optionnel)</p>
              <p className="text-sm text-slate-600">Facilite la communication avec vos clients et accélère les ventes.</p>
            </div>
          </div>
        </div>
      </div>
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Prêt à commencer ?</h2>
        <p className="text-slate-600 mb-6">Créez votre boutique en quelques minutes et commencez à vendre.</p>
        <Link to="/seller/settings" className="btn-primary">
          Créer ma boutique <ArrowRight className="w-4 h-4 ml-2" />
        </Link>
      </div>
    </div>
  );
}
