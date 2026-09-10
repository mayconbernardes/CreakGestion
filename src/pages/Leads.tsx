import { useState } from 'react';
import { useStore } from '../store';
import { Plus, GripVertical } from 'lucide-react';
import type { Lead, LeadStage } from '../types';

const stages: { key: LeadStage; label: string; color: string }[] = [
  { key: 'nouveau', label: 'Nouveau lead', color: 'bg-gray-100 border-gray-300' },
  { key: 'contacte', label: 'Contacté', color: 'bg-blue-50 border-blue-300' },
  { key: 'qualification', label: 'Qualification', color: 'bg-indigo-50 border-indigo-300' },
  { key: 'proposition', label: 'Proposition envoyée', color: 'bg-purple-50 border-purple-300' },
  { key: 'negociation', label: 'Négociation', color: 'bg-amber-50 border-amber-300' },
  { key: 'gagne', label: 'Gagné ✓', color: 'bg-green-50 border-green-300' },
  { key: 'perdu', label: 'Perdu ✗', color: 'bg-red-50 border-red-300' },
];

export default function Leads() {
  const { leads, addLead, updateLeadStage, deleteLead, services } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [view, setView] = useState<'kanban' | 'list'>('kanban');
  const emptyLead = { name: '', company: '', email: '', phone: '', source: '', serviceInterest: '', estimatedBudget: 0, probability: 50, nextAction: '', nextActionDate: '', notes: '', stage: 'nouveau' as LeadStage };
  const [form, setForm] = useState(emptyLead);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) return;
    addLead(form);
    setShowForm(false);
    setForm(emptyLead);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Prospects / CRM</h1>
          <p className="text-gray-500 text-sm">{leads.length} prospect{leads.length > 1 ? 's' : ''}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setView(view === 'kanban' ? 'list' : 'kanban')}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">
            {view === 'kanban' ? 'Vue liste' : 'Vue Kanban'}
          </button>
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 text-sm">
            <Plus size={16} /> Nouveau prospect
          </button>
        </div>
      </div>

      {view === 'kanban' ? (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {stages.map(stage => {
            const stageLeads = leads.filter(l => l.stage === stage.key);
            return (
              <div key={stage.key} className={`min-w-[250px] flex-1 rounded-xl border ${stage.color} p-3`}>
                <h3 className="font-semibold text-sm text-gray-700 mb-3 px-1">{stage.label} ({stageLeads.length})</h3>
                <div className="space-y-2">
                  {stageLeads.map(lead => (
                    <div key={lead.id} className="bg-white rounded-lg p-3 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow">
                      <p className="font-medium text-sm text-gray-800">{lead.name}</p>
                      {lead.company && <p className="text-xs text-gray-500">{lead.company}</p>}
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-400">{lead.estimatedBudget > 0 ? `${lead.estimatedBudget} €` : ''}</span>
                        <select value={lead.stage} onChange={e => updateLeadStage(lead.id, e.target.value as LeadStage)}
                          className="text-xs border border-gray-200 rounded px-1 py-0.5">
                          {stages.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                        </select>
                      </div>
                    </div>
                  ))}
                  {stageLeads.length === 0 && <p className="text-xs text-gray-400 text-center py-4">—</p>}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Nom</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 hidden md:table-cell">Entreprise</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Étape</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 hidden md:table-cell">Budget</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {leads.map(lead => (
                <tr key={lead.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium">{lead.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 hidden md:table-cell">{lead.company}</td>
                  <td className="px-4 py-3">
                    <select value={lead.stage} onChange={e => updateLeadStage(lead.id, e.target.value as LeadStage)}
                      className="text-xs border border-gray-200 rounded px-2 py-1">
                      {stages.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-sm text-right hidden md:table-cell">{lead.estimatedBudget > 0 ? `${lead.estimatedBudget} €` : '—'}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => { if (confirm('Supprimer ce prospect ?')) deleteLead(lead.id); }}
                      className="text-xs text-red-500 hover:text-red-700">Supprimer</button>
                  </td>
                </tr>
              ))}
              {leads.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400 text-sm">Aucun prospect</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b"><h2 className="text-lg font-semibold">Nouveau prospect</h2></div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                  <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Entreprise</label>
                  <input type="text" value={form.company} onChange={e => setForm({...form, company: e.target.value})}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                  <input type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
                  <input type="text" value={form.source} onChange={e => setForm({...form, source: e.target.value})}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="Google, Réseaux..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Service intéressé</label>
                  <select value={form.serviceInterest} onChange={e => setForm({...form, serviceInterest: e.target.value})}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
                    <option value="">—</option>
                    {services.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Budget estimé (€)</label>
                  <input type="number" value={form.estimatedBudget} onChange={e => setForm({...form, estimatedBudget: Number(e.target.value)})}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prochaine action</label>
                  <input type="text" value={form.nextAction} onChange={e => setForm({...form, nextAction: e.target.value})}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                </div>
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
