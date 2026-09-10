import { useState } from 'react';
import { useStore } from '../store';
import { Plus } from 'lucide-react';
import type { Project, ProjectStatus, ProjectPriority } from '../types';

const statusLabels: Record<ProjectStatus, string> = { a_planifier: 'À planifier', planifie: 'Planifié', en_cours: 'En cours', attente_client: 'Attente client', en_revision: 'En révision', termine: 'Terminé', annule: 'Annulé' };
const statusColors: Record<ProjectStatus, string> = { a_planifier: 'bg-gray-100 text-gray-700', planifie: 'bg-blue-100 text-blue-700', en_cours: 'bg-green-100 text-green-700', attente_client: 'bg-amber-100 text-amber-700', en_revision: 'bg-purple-100 text-purple-700', termine: 'bg-emerald-100 text-emerald-700', annule: 'bg-red-100 text-red-700' };
const priorityColors: Record<ProjectPriority, string> = { basse: 'text-gray-500', normale: 'text-blue-500', haute: 'text-orange-500', urgente: 'text-red-500' };

export default function Projects() {
  const { projects, clients, services, addProject, updateProject, deleteProject } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const empty = { clientId: '', name: '', description: '', serviceId: '', status: 'a_planifier' as ProjectStatus, priority: 'normale' as ProjectPriority, startDate: '', expectedEndDate: '', actualEndDate: '', budget: 0, invoicedAmount: 0, paidAmount: 0, assignedTo: '', notes: '' };
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState<Project | null>(null);

  const filtered = projects.filter(p => !statusFilter || p.status === statusFilter);
  const formatEur = (n: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.clientId) return;
    if (editing) { updateProject(editing.id, form); } else { addProject(form); }
    setShowForm(false); setEditing(null); setForm(empty);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projets</h1>
          <p className="text-gray-500 text-sm">{projects.length} projet{projects.length > 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => { setForm(empty); setEditing(null); setShowForm(true); }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-blue-700 text-sm">
          <Plus size={16} /> Nouveau projet
        </button>
      </div>

      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setStatusFilter('')} className={`px-3 py-1.5 text-xs rounded-lg font-medium ${!statusFilter ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Tous</button>
        {Object.entries(statusLabels).map(([k, v]) => (
          <button key={k} onClick={() => setStatusFilter(k)} className={`px-3 py-1.5 text-xs rounded-lg font-medium ${statusFilter === k ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{v}</button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(project => {
          const client = clients.find(c => c.id === project.clientId);
          return (
            <div key={project.id} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-800">{project.name}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{client ? `${client.firstName} ${client.lastName}` : '—'}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[project.status]}`}>{statusLabels[project.status]}</span>
              </div>
              {project.description && <p className="text-sm text-gray-600 mt-2 line-clamp-2">{project.description}</p>}
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50">
                <div>
                  <p className="text-sm font-semibold text-gray-800">{formatEur(project.budget)}</p>
                  <p className="text-xs text-gray-400">Budget</p>
                </div>
                <div className="text-right">
                  <p className={`text-xs font-medium ${priorityColors[project.priority]}`}>● {project.priority}</p>
                  {project.startDate && <p className="text-xs text-gray-400 mt-1">{project.startDate}</p>}
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <select value={project.status} onChange={e => updateProject(project.id, { status: e.target.value as ProjectStatus })}
                  className="flex-1 text-xs border border-gray-200 rounded px-2 py-1">
                  {Object.entries(statusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
                <button onClick={() => { if (confirm('Supprimer ?')) deleteProject(project.id); }}
                  className="text-xs text-red-500 hover:text-red-700 px-2">✕</button>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && <div className="col-span-full text-center py-12 text-gray-400">Aucun projet</div>}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b"><h2 className="text-lg font-semibold">{editing ? 'Modifier' : 'Nouveau'} projet</h2></div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom du projet *</label>
                  <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Client *</label>
                  <select value={form.clientId} onChange={e => setForm({...form, clientId: e.target.value})} required
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
                    <option value="">Sélectionner...</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.firstName} {c.lastName} {c.company && `— ${c.company}`}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" rows={2} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Service</label>
                  <select value={form.serviceId} onChange={e => setForm({...form, serviceId: e.target.value})}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
                    <option value="">—</option>
                    {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priorité</label>
                  <select value={form.priority} onChange={e => setForm({...form, priority: e.target.value as ProjectPriority})}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
                    <option value="basse">Basse</option><option value="normale">Normale</option><option value="haute">Haute</option><option value="urgente">Urgente</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date début</label>
                  <input type="date" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date fin prévue</label>
                  <input type="date" value={form.expectedEndDate} onChange={e => setForm({...form, expectedEndDate: e.target.value})}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Budget (€)</label>
                  <input type="number" value={form.budget} onChange={e => setForm({...form, budget: Number(e.target.value)})}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                  <select value={form.status} onChange={e => setForm({...form, status: e.target.value as ProjectStatus})}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
                    {Object.entries(statusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
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
