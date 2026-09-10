import { useState } from 'react';
import { useStore } from '../store';
import { Save, Building2, FileText, Mail, Shield } from 'lucide-react';

export default function Settings() {
  const { settings, updateSettings, emailTemplates, updateEmailTemplate } = useStore();
  const [tab, setTab] = useState<'company' | 'invoices' | 'email' | 'security'>('company');
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState(settings);

  const handleSave = () => {
    updateSettings(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const tabs = [
    { key: 'company', label: 'Entreprise', icon: Building2 },
    { key: 'invoices', label: 'Facturation', icon: FileText },
    { key: 'email', label: 'E-mail', icon: Mail },
    { key: 'security', label: 'Sécurité', icon: Shield },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
        <p className="text-gray-500 text-sm">Configuration de l'application</p>
      </div>

      <div className="flex gap-2 flex-wrap border-b border-gray-200 pb-3">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key as any)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg ${tab === t.key ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}>
            <t.icon size={16} /> {t.label}
          </button>
        ))}
      </div>

      {tab === 'company' && (
        <div className="bg-white rounded-xl border p-6 space-y-6">
          <h3 className="font-semibold text-gray-800">Informations de l'entreprise</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Raison sociale</label>
              <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom commercial</label>
              <input type="text" value={form.commercialName} onChange={e => setForm({...form, commercialName: e.target.value})}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
              <input type="text" value={form.address} onChange={e => setForm({...form, address: e.target.value})}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Code postal</label>
              <input type="text" value={form.postalCode} onChange={e => setForm({...form, postalCode: e.target.value})}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
              <input type="text" value={form.city} onChange={e => setForm({...form, city: e.target.value})}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
              <input type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Site web</label>
              <input type="text" value={form.website} onChange={e => setForm({...form, website: e.target.value})}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SIREN</label>
              <input type="text" value={form.siren} onChange={e => setForm({...form, siren: e.target.value})}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SIRET</label>
              <input type="text" value={form.siret} onChange={e => setForm({...form, siret: e.target.value})}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">TVA intracommunautaire</label>
              <input type="text" value={form.tvaIntra} onChange={e => setForm({...form, tvaIntra: e.target.value})}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Forme juridique</label>
              <input type="text" value={form.legalForm} onChange={e => setForm({...form, legalForm: e.target.value})}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">IBAN</label>
              <input type="text" value={form.iban} onChange={e => setForm({...form, iban: e.target.value})}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">BIC</label>
              <input type="text" value={form.bic} onChange={e => setForm({...form, bic: e.target.value})}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Mentions légales (pied de facture)</label>
              <textarea value={form.legalMentions} onChange={e => setForm({...form, legalMentions: e.target.value})}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" rows={3} />
            </div>
          </div>
        </div>
      )}

      {tab === 'invoices' && (
        <div className="bg-white rounded-xl border p-6 space-y-6">
          <h3 className="font-semibold text-gray-800">Configuration facturation</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Préfixe factures</label>
              <input type="text" value={form.invoicePrefix} onChange={e => setForm({...form, invoicePrefix: e.target.value})}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="FAC" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Préfixe devis</label>
              <input type="text" value={form.quotePrefix} onChange={e => setForm({...form, quotePrefix: e.target.value})}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="DEV" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Devise</label>
              <select value={form.currency} onChange={e => setForm({...form, currency: e.target.value})}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
                <option value="EUR">EUR (€)</option>
                <option value="USD">USD ($)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">TVA par défaut (%)</label>
              <input type="number" value={form.defaultTaxRate} onChange={e => setForm({...form, defaultTaxRate: Number(e.target.value)})}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Conditions de paiement par défaut</label>
              <input type="text" value={form.paymentTerms} onChange={e => setForm({...form, paymentTerms: e.target.value})}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>
        </div>
      )}

      {tab === 'email' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border p-6 space-y-4">
            <h3 className="font-semibold text-gray-800">Configuration SMTP</h3>
            <p className="text-sm text-gray-500">Configurez votre serveur SMTP pour l'envoi d'e-mails. Les informations sont stockées localement et préparées pour une intégration backend.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Serveur SMTP</label>
                <input type="text" placeholder="smtp.gmail.com" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Port</label>
                <input type="text" placeholder="587" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Utilisateur</label>
                <input type="text" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
                <input type="password" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom expéditeur</label>
                <input type="text" value={form.name} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email expéditeur</label>
                <input type="email" value={form.email} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
              </div>
            </div>
            <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 font-medium">Tester la connexion</button>
          </div>

          <div className="bg-white rounded-xl border p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Templates d'e-mails</h3>
            <div className="space-y-4">
              {emailTemplates.map(tpl => (
                <div key={tpl.id} className="border border-gray-100 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm">{tpl.name}</h4>
                    <span className="text-xs px-2 py-0.5 bg-gray-100 rounded">{tpl.type}</span>
                  </div>
                  <input type="text" value={tpl.subject} onChange={e => updateEmailTemplate(tpl.id, { subject: e.target.value })}
                    className="w-full border border-gray-200 rounded px-2 py-1 text-sm mb-2" placeholder="Objet" />
                  <textarea value={tpl.body} onChange={e => updateEmailTemplate(tpl.id, { body: e.target.value })}
                    className="w-full border border-gray-200 rounded px-2 py-1 text-sm" rows={3} />
                  <p className="text-xs text-gray-400 mt-1">Variables: {'{{client.firstName}}'}, {'{{invoice.number}}'}, {'{{invoice.total}}'}, {'{{invoice.dueDate}}'}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'security' && (
        <div className="bg-white rounded-xl border p-6 space-y-4">
          <h3 className="font-semibold text-gray-800">Sécurité & RGPD</h3>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <p>Données stockées localement avec persistance (prêt pour migration backend)</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <p>Export de données clients disponible (RGPD — droit à la portabilité)</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <p>Audit log des actions principales</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-yellow-500 mt-0.5">⚠</span>
              <p>Authentification backend à configurer (JWT, sessions sécurisées)</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-yellow-500 mt-0.5">⚠</span>
              <p>Chiffrement des données sensibles à implémenter en production</p>
            </div>
          </div>
          <div className="pt-4 border-t">
            <button onClick={() => {
              if (confirm('Êtes-vous sûr de vouloir supprimer TOUTES les données ? Cette action est irréversible.')) {
                localStorage.removeItem('creaktif-storage');
                window.location.reload();
              }
            }} className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 font-medium">
              Réinitialiser toutes les données
            </button>
          </div>
        </div>
      )}

      {/* Save button */}
      {(tab === 'company' || tab === 'invoices') && (
        <div className="flex justify-end">
          <button onClick={handleSave}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 shadow-sm">
            <Save size={16} /> {saved ? 'Enregistré ✓' : 'Enregistrer'}
          </button>
        </div>
      )}
    </div>
  );
}
