import { useState } from 'react';
import { useStore } from '../store';
import { Plus, RefreshCw } from 'lucide-react';
import type { RecurringContract, RecurringFrequency } from '../types';

const freqLabels: Record<RecurringFrequency, string> = { mensuelle: 'Mensuelle', trimestrielle: 'Trimestrielle', semestrielle: 'Semestrielle', annuelle: 'Annuelle' };

export default function Contracts() {
  const { contracts, clients, services, addContract, updateContract, deleteContract } = useStore();
  const [showForm, setShowForm] = useState(false);
  const empty = { clientId: '', serviceId: '', name: '', amount: 0, frequency: 'mensuelle' as RecurringFrequency, startDate: new Date().toISOString().split('T')[0], nextDueDate: '', status: 'actif' as const, notes: '' };
  const [form, setForm] = useState(empty);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.clientId || !form.name) return;
    addContract(form);
    setShowForm(false); setForm(empty);
  };

  const formatEur = (n: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n);
  const monthlyRevenue = contracts.filter(c => c.status === 'actif').reduce((s, c) => {
    const mult = c.frequency === 'mensuelle' ? 1 : c.frequency === 'trimestrielle' ? 1/3 : c.frequency === 'semestrielle' ? 1/6 : 1/12;
    return s + c.amount * mult;
  }, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Maintenance & Contrats récurrents</h1>
          <p className="text-gray-500 text-sm">{contracts.length} contrat{contracts.length > 1 ? 's' : ''} actif{contracts.length > 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-blue-700 text-sm">
          <Plus size={16} /> Nouveau contrat
        </button>
      </div>

      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white">
        <p className="text-sm opacity-80">Revenus récurrents mensuels estimés</p>
        <p className="text-3xl font-bold mt-1">{formatEur(monthlyRevenue)}</p>
        <p className="text-sm opacity-80 mt-1">/ mois</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {contracts.map(contract => {
          const client = clients.find(c => c.id === contract.clientId);
          return (
            <div key={contract.id} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-800">{contract.name}</h3>
                  <p className="text-xs text-gray-500">{client ? `${client.firstName} ${client.lastName}` : '—'}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${contract.status === 'actif' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{contract.status}</span>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div>
                  <p className="text-xl font-bold text-blue-600">{formatEur(contract.amount)}</p>
                  <p className="text-xs text-gray-400">{freqLabels[contract.frequency]}</p>
                </div>
                <div className="flex gap-1">
                  <select value={contract.status} onChange={e => updateContract(contract.id, { status: e.target.value as any })}
                    className="text-xs border border-gray-200 rounded px-2 py-1">
                    <option value="actif">Actif</option><option value="suspendu">Suspendu</option><option value="annule">Annulé</option>
                  </select>
                  <button onClick={() => { if (confirm('Supprimer ?')) deleteContract(contract.id); }}
                    className="text-xs text-red-500 px-2">✕</button>
                </div>
              </div>
            </div>
          );
        })}
        {contracts.length === 0 && <div className="col-span-full text-center py-12 text-gray-400">Aucun contrat récurrent</div>}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b"><h2 className="text-lg font-semibold">Nouveau contrat</h2></div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom du contrat *</label>
                <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="Ex: Maintenance site web" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client *</label>
                <select value={form.clientId} onChange={e => setForm({...form, clientId: e.target.value})} required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
                  <option value="">Sélectionner...</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.firstName} {c.lastName} {c.company && `— ${c.company}`}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Montant (€)</label>
                  <input type="number" value={form.amount} onChange={e => setForm({...form, amount: Number(e.target.value)})}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fréquence</label>
                  <select value={form.frequency} onChange={e => setForm({...form, frequency: e.target.value as RecurringFrequency})}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
                    {Object.entries(freqLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date de début</label>
                <input type="date" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-600">Annuler</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 font-medium">Créer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
