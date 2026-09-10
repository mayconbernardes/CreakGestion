import { useState } from 'react';
import { useStore } from '../store';
import { Plus, Check } from 'lucide-react';
import type { Task, TaskStatus, TaskPriority } from '../types';

const statusLabels: Record<TaskStatus, string> = { a_faire: 'À faire', en_cours: 'En cours', termine: 'Terminé' };
const priorityLabels: Record<TaskPriority, string> = { basse: 'Basse', normale: 'Normale', haute: 'Haute', urgente: 'Urgente' };
const priorityColors: Record<TaskPriority, string> = { basse: 'bg-gray-100 text-gray-600', normale: 'bg-blue-100 text-blue-600', haute: 'bg-orange-100 text-orange-600', urgente: 'bg-red-100 text-red-600' };

export default function Tasks() {
  const { tasks, clients, projects, addTask, updateTask, deleteTask } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('');
  const empty = { title: '', description: '', priority: 'normale' as TaskPriority, status: 'a_faire' as TaskStatus, dueDate: '', clientId: '', projectId: '', assignedTo: '' };
  const [form, setForm] = useState(empty);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title) return;
    addTask(form);
    setShowForm(false); setForm(empty);
  };

  const filtered = tasks.filter(t => !filter || t.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tâches</h1>
          <p className="text-gray-500 text-sm">{tasks.length} tâche{tasks.length > 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-blue-700 text-sm">
          <Plus size={16} /> Nouvelle tâche
        </button>
      </div>

      <div className="flex gap-2">
        <button onClick={() => setFilter('')} className={`px-3 py-1.5 text-xs rounded-lg font-medium ${!filter ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}>Toutes</button>
        {Object.entries(statusLabels).map(([k, v]) => (
          <button key={k} onClick={() => setFilter(k)} className={`px-3 py-1.5 text-xs rounded-lg font-medium ${filter === k ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}>{v}</button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.map(task => {
          const client = clients.find(c => c.id === task.clientId);
          return (
            <div key={task.id} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm flex items-center gap-4">
              <button onClick={() => updateTask(task.id, { status: task.status === 'termine' ? 'a_faire' : 'termine' })}
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${task.status === 'termine' ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 hover:border-blue-500'}`}>
                {task.status === 'termine' && <Check size={14} />}
              </button>
              <div className="flex-1 min-w-0">
                <p className={`font-medium text-sm ${task.status === 'termine' ? 'line-through text-gray-400' : 'text-gray-800'}`}>{task.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs px-1.5 py-0.5 rounded ${priorityColors[task.priority]}`}>{priorityLabels[task.priority]}</span>
                  {client && <span className="text-xs text-gray-400">{client.firstName} {client.lastName}</span>}
                  {task.dueDate && <span className="text-xs text-gray-400">Échéance: {task.dueDate}</span>}
                </div>
              </div>
              <select value={task.status} onChange={e => updateTask(task.id, { status: e.target.value as TaskStatus })}
                className="text-xs border border-gray-200 rounded px-2 py-1">
                {Object.entries(statusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
              <button onClick={() => { if (confirm('Supprimer ?')) deleteTask(task.id); }} className="text-xs text-red-400 hover:text-red-600">✕</button>
            </div>
          );
        })}
        {filtered.length === 0 && <div className="text-center py-12 text-gray-400">Aucune tâche</div>}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b"><h2 className="text-lg font-semibold">Nouvelle tâche</h2></div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Titre *</label>
                <input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" rows={2} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priorité</label>
                  <select value={form.priority} onChange={e => setForm({...form, priority: e.target.value as TaskPriority})}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
                    {Object.entries(priorityLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Échéance</label>
                  <input type="date" value={form.dueDate} onChange={e => setForm({...form, dueDate: e.target.value})}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
                <select value={form.clientId} onChange={e => setForm({...form, clientId: e.target.value})}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
                  <option value="">—</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>)}
                </select>
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
