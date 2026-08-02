import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronUp, HelpCircle, MessageCircle } from 'lucide-react';

const faqs = [
  {
    q: 'Comment commander sur BF RAAGA ?',
    a: 'Parcourez notre catalogue, ajoutez les produits qui vous intéressent au panier, puis finalisez votre commande. Vous pouvez payer par Mobile Money (MTN, Orange, Airtel) ou à la livraison.',
  },
  {
    q: 'Dois-je créer un compte pour acheter ?',
    a: 'Non ! Vous pouvez commander en tant qu\'invité avec juste votre nom, email et téléphone. Créer un compte vous permet de suivre vos commandes et de sauvegarder vos favoris.',
  },
  {
    q: 'Comment contacter un vendeur ?',
    a: 'Chaque fiche produit affiche les coordonnées du vendeur (WhatsApp, téléphone). Vous pouvez aussi lui envoyer un message direct depuis la page produit.',
  },
  {
    q: 'Quels sont les délais de livraison ?',
    a: 'À Ouagadougou : 24h. Autres villes : 2-5 jours selon le vendeur. Vous pouvez aussi choisir le retrait direct chez le vendeur.',
  },
  {
    q: 'Comment devenir vendeur sur BF RAAGA ?',
    a: 'Créez un compte, puis accédez à l\'espace vendeur pour créer votre boutique. C\'est gratuit et vous pouvez ajouter des photos, des prix et gérer vos stocks.',
  },
  {
    q: 'Quels sont les frais pour les vendeurs ?',
    a: 'L\'ouverture d\'une boutique est gratuite. Une commission de 3% est prélevée sur chaque vente pour couvrir les frais de service et la maintenance de la plateforme.',
  },
  {
    q: 'Que faire si je ne suis pas satisfait ?',
    a: 'Contactez d\'abord le vendeur directement. Si le problème persiste, vous pouvez nous contacter via le formulaire de contact ou WhatsApp au +226 71 64 48 00.',
  },
  {
    q: 'Comment prendre des photos de mes produits ?',
    a: 'Depuis l\'espace vendeur, vous avez deux options : choisir des photos depuis votre galerie, ou utiliser la caméra de votre téléphone pour prendre des photos directement.',
  },
  {
    q: 'Puis-je vendre des services et non des produits physiques ?',
    a: 'Oui ! BF RAAGA accueille aussi les prestataires de services (couture, plomberie, réparation, design, etc.). Indiquez simplement que vous ne proposez pas de livraison.',
  },
  {
    q: 'La plateforme est-elle sécurisée ?',
    a: 'Oui. Toutes les transactions sont chiffrées. Les données personnelles sont protégées conformément au RGPD. Nous vérifions les vendeurs pour garantir la sécurité des acheteurs.',
  },
];

export function FAQPage() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <div className="page-container py-12">
      <div className="text-center mb-12">
        <div className="w-16 h-16 rounded-2xl bg-teal-600 flex items-center justify-center mx-auto mb-6">
          <HelpCircle className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">Questions fréquentes</h1>
        <p className="text-slate-600 max-w-2xl mx-auto">
          Tout ce que vous devez savoir pour utiliser BF RAAGA en tant qu'acheteur ou vendeur.
        </p>
      </div>

      <div className="max-w-3xl mx-auto space-y-3">
        {faqs.map((faq, idx) => (
          <div key={idx} className="card overflow-hidden">
            <button
              onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 transition-colors"
            >
              <span className="font-medium text-slate-900 pr-4">{faq.q}</span>
              {openIdx === idx ? (
                <ChevronUp className="w-5 h-5 text-teal-600 shrink-0" />
              ) : (
                <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
              )}
            </button>
            {openIdx === idx && (
              <div className="px-4 pb-4 text-slate-600 leading-relaxed">
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-12 text-center max-w-lg mx-auto">
        <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-600 flex items-center justify-center mx-auto mb-4">
          <MessageCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Vous avez d'autres questions ?</h2>
        <p className="text-slate-600 mb-4">Contactez-nous directement et nous vous répondrons dans les plus brefs délais.</p>
        <Link to="/contact" className="btn-primary">Nous contacter</Link>
      </div>
    </div>
  );
}
