import { useState } from 'react';
import { useStore } from '../store';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import type { Service } from '../types';

export default function Services() {
  const { services, addService, updateService, deleteService } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const empty = { name: '', description: '', category: '', defaultPrice: 0, unit: 'projet', taxRate: 20, estimatedDuration: '', active: true };
  const [form, setForm] = useState(empty);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) return;
    if (editing) { updateService(editing.id, form); } else { addService(form); }
    setShowForm(false); setEditing(null); setForm(empty);
  };

  const categories = [...new Set(services.map(s => s.category))];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Services</h1>
          <p className="text-gray-500 text-sm">{services.length} service{services.length > 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => { setForm(empty); setEditing(null); setShowForm(true); }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-blue-700 text-sm">
          <Plus size={16} /> Nouveau service
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map(cat => (
          <div key={cat} className="space-y-3">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{cat}</h3>
            {services.filter(s => s.category === cat).map(service => (
              <div key={service.id} className={`bg-white rounded-xl border p-4 shadow-sm ${service.active ? 'border-gray-100' : 'border-gray-200 opacity-60'}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium text-gray-800">{service.name}</h4>
                    <p className="text-xs text-gray-500 mt-0.5">{service.description}</p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => { setForm(service); setEditing(service); setShowForm(true); }} className="p-1 text-gray-400 hover:text-blue-600"><Edit2 size={14} /></button>
                    <button onClick={() => { if (confirm('Supprimer ?')) deleteService(service.id); }} className="p-1 text-gray-400 hover:text-red-600"><Trash2 size={14} /></button>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                  <span className="text-lg font-bold text-blue-600">{service.defaultPrice} €</span>
                  <span className="text-xs text-gray-400">/ {service.unit} · TVA {service.taxRate}%</span>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b"><h2 className="text-lg font-semibold">{editing ? 'Modifier' : 'Nouveau'} service</h2></div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input type="text" value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                  <input type="text" value={form.category} onChange={e => setForm({...form, category: e.target.value})}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prix (€)</label>
                  <input type="number" value={form.defaultPrice} onChange={e => setForm({...form, defaultPrice: Number(e.target.value)})}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unité</label>
                  <select value={form.unit} onChange={e => setForm({...form, unit: e.target.value})}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
                    <option value="projet">Projet</option><option value="heure">Heure</option><option value="mois">Mois</option><option value="page">Page</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">TVA (%)</label>
                  <input type="number" value={form.taxRate} onChange={e => setForm({...form, taxRate: Number(e.target.value)})}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="active" checked={form.active} onChange={e => setForm({...form, active: e.target.checked})} className="rounded" />
                <label htmlFor="active" className="text-sm text-gray-700">Service actif</label>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-600">Annuler</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 font-medium">Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
