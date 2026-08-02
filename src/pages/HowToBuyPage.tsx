import { Link } from 'react-router-dom';
import { Search, ShoppingCart, CreditCard, Truck, Package, ArrowRight, Check } from 'lucide-react';

const steps = [
  {
    icon: Search,
    title: 'Trouvez un produit',
    desc: 'Parcourez les catégories ou utilisez la barre de recherche pour trouver ce que vous cherchez. Filtrez par prix, ville, état ou catégorie.',
  },
  {
    icon: ShoppingCart,
    title: 'Ajoutez au panier',
    desc: 'Cliquez sur "Ajouter au panier" pour sélectionner vos produits. Vous pouvez continuer vos achats ou passer directement à la commande.',
  },
  {
    icon: CreditCard,
    title: 'Choisissez le paiement',
    desc: 'Payez par Mobile Money (MTN, Orange, Airtel) ou optez pour le paiement à la livraison. Pas besoin de compte bancaire.',
  },
  {
    icon: Truck,
    title: 'Recevez votre commande',
    desc: 'Choisissez la livraison à domicile ou le retrait chez le vendeur. Suivez l\'état de votre commande en temps réel.',
  },
];

export function HowToBuyPage() {
  return (
    <div className="page-container py-12">
      <div className="text-center mb-12">
        <div className="w-16 h-16 rounded-2xl bg-teal-600 flex items-center justify-center mx-auto mb-6">
          <Package className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">Comment acheter ?</h1>
        <p className="text-slate-600 max-w-2xl mx-auto">
          Acheter sur BF RAAGA est simple et rapide. Voici les 4 étapes pour recevoir vos produits en toute sécurité.
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
      <div className="card p-8 mb-16">
        <h2 className="text-xl font-bold text-slate-900 mb-6">Conseils pour un achat réussi</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0 mt-0.5">
              <Check className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="font-medium text-slate-900 text-sm">Vérifiez les avis du vendeur</p>
              <p className="text-sm text-slate-600">Consultez les notes et commentaires avant d'acheter.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0 mt-0.5">
              <Check className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="font-medium text-slate-900 text-sm">Contactez le vendeur</p>
              <p className="text-sm text-slate-600">Utilisez WhatsApp pour poser vos questions avant d'acheter.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0 mt-0.5">
              <Check className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="font-medium text-slate-900 text-sm">Comparez les prix</p>
              <p className="text-sm text-slate-600">Le même produit peut être proposé par plusieurs vendeurs.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0 mt-0.5">
              <Check className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="font-medium text-slate-900 text-sm">Vérifiez à la livraison</p>
              <p className="text-sm text-slate-600">Inspectez le produit avant de payer si vous choisissez le paiement à la livraison.</p>
            </div>
          </div>
        </div>
      </div>
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Prêt à faire vos achats ?</h2>
        <p className="text-slate-600 mb-6">Parcourez notre catalogue et découvrez des produits uniques.</p>
        <Link to="/search" className="btn-primary">
          Voir les produits <ArrowRight className="w-4 h-4 ml-2" />
        </Link>
      </div>
    </div>
  );
}
