import { useState } from 'react';
import { Mail, Phone, MapPin, MessageCircle, Send, Check } from 'lucide-react';

export function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="page-container py-12">
      <div className="text-center mb-12">
        <div className="w-16 h-16 rounded-2xl bg-teal-600 flex items-center justify-center mx-auto mb-6">
          <MessageCircle className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">Contactez-nous</h1>
        <p className="text-slate-600 max-w-2xl mx-auto">
          Une question, un problème, une suggestion ? Nous sommes là pour vous aider.
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
        <div className="lg:col-span-1 space-y-4">
          <div className="card p-5">
            <div className="w-10 h-10 rounded-lg bg-teal-100 text-teal-600 flex items-center justify-center mb-3">
              <Phone className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 mb-1">Téléphone</h3>
            <p className="text-sm text-slate-600 mb-2">+226 71 64 48 00</p>
            <p className="text-xs text-slate-500">Lun-Ven, 8h-18h</p>
          </div>
          <div className="card p-5">
            <div className="w-10 h-10 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center mb-3">
              <Mail className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 mb-1">Email</h3>
            <p className="text-sm text-slate-600 mb-2">contact@bfraaga.com</p>
            <p className="text-xs text-slate-500">Réponse sous 24h</p>
          </div>
          <div className="card p-5">
            <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mb-3">
              <MapPin className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 mb-1">Adresse</h3>
            <p className="text-sm text-slate-600">Secteur 15, Avenue de l'Indépendance</p>
            <p className="text-sm text-slate-600">Ouagadougou, Burkina Faso</p>
          </div>
          <div className="card p-5 bg-teal-50 border-teal-200">
            <h3 className="font-bold text-teal-700 mb-2">WhatsApp Direct</h3>
            <p className="text-sm text-teal-600 mb-3">Contactez-nous rapidement via WhatsApp</p>
            <a href="https://wa.me/22671644800" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors">
              <MessageCircle className="w-4 h-4" /> Ouvrir WhatsApp
            </a>
          </div>
        </div>
        <div className="lg:col-span-2">
          <div className="card p-6">
            {submitted ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">Message envoyé !</h2>
                <p className="text-slate-600">Nous vous répondrons dans les plus brefs délais.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Envoyez-nous un message</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-1 block">Nom *</label>
                    <input type="text" value={formData.name} onChange={e => setFormData(f => ({ ...f, name: e.target.value }))} className="input-field" placeholder="Votre nom" required />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-1 block">Email *</label>
                    <input type="email" value={formData.email} onChange={e => setFormData(f => ({ ...f, email: e.target.value }))} className="input-field" placeholder="votre@email.com" required />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">Sujet</label>
                  <select value={formData.subject} onChange={e => setFormData(f => ({ ...f, subject: e.target.value }))} className="input-field">
                    <option value="">Choisir un sujet...</option>
                    <option value="order">Problème de commande</option>
                    <option value="seller">Devenir vendeur</option>
                    <option value="account">Problème de compte</option>
                    <option value="technical">Problème technique</option>
                    <option value="other">Autre</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">Message *</label>
                  <textarea value={formData.message} onChange={e => setFormData(f => ({ ...f, message: e.target.value }))} className="input-field" rows={5} placeholder="Décrivez votre demande..." required />
                </div>
                <button type="submit" className="btn-primary w-full py-3">
                  <Send className="w-4 h-4 mr-2" /> Envoyer le message
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
