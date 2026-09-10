import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { Plus, Search, Filter, MoreVertical, Phone, Mail, Building2 } from 'lucide-react';
import type { Client, ClientStatus, ClientType } from '../types';

const statusLabels: Record<ClientStatus, string> = { prospect: 'Prospect', lead: 'Lead', actif: 'Client actif', inactif: 'Inactif', ancien: 'Ancien client' };
const statusColors: Record<ClientStatus, string> = { prospect: 'bg-gray-100 text-gray-700', lead: 'bg-blue-100 text-blue-700', actif: 'bg-green-100 text-green-700', inactif: 'bg-orange-100 text-orange-700', ancien: 'bg-slate-100 text-slate-600' };

export default function Clients() {
  const { clients, addClient, deleteClient } = useStore();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ClientStatus | ''>('');
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const filtered = clients.filter(c => {
    const matchSearch = `${c.firstName} ${c.lastName} ${c.company} ${c.email}`.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const emptyClient: Omit<Client, 'id' | 'createdAt'> = { type: 'particulier', firstName: '', lastName: '', company: '', commercialName: '', siren: '', siret: '', tvaIntra: '', legalForm: '', sector: '', email: '', phone: '', phone2: '', whatsapp: '', website: '', address: '', addressComplement: '', postalCode: '', city: '', country: 'France', leadSource: '', status: 'prospect', lastContact: '', assignedTo: '', notes: '', tags: [] };

  const [form, setForm] = useState<Omit<Client, 'id' | 'createdAt'>>(emptyClient);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName && !form.company) return;
    if (editingClient) {
      useStore.getState().updateClient(editingClient.id, form);
    } else {
      addClient(form);
    }
    setShowForm(false);
    setEditingClient(null);
    setForm(emptyClient);
  };

  const handleEdit = (client: Client) => {
    setForm({ ...emptyClient, ...client });
    setEditingClient(client);
    setShowForm(true);
  };

  const formatEur = (n: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
          <p className="text-gray-500 text-sm">{clients.length} client{clients.length > 1 ? 's' : ''} enregistré{clients.length > 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => { setForm(emptyClient); setEditingClient(null); setShowForm(true); }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-blue-700 shadow-sm">
          <Plus size={18} /> Nouveau client
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Rechercher un client..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as ClientStatus | '')}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">Tous les statuts</option>
          {Object.entries(statusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Client</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Contact</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">Ville</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Statut</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">Facturé</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(client => {
                const fin = useStore.getState().getClientFinancials(client.id);
                return (
                  <tr key={client.id} className="hover:bg-gray-50/50 cursor-pointer" onClick={() => navigate(`/clients/${client.id}`)}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                          {(client.firstName || client.company || '?').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{client.firstName} {client.lastName}</p>
                          {client.company && <p className="text-xs text-gray-500 flex items-center gap-1"><Building2 size={10} />{client.company}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="text-sm text-gray-600 space-y-0.5">
                        {client.email && <p className="flex items-center gap-1"><Mail size={11} />{client.email}</p>}
                        {client.phone && <p className="flex items-center gap-1"><Phone size={11} />{client.phone}</p>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 hidden lg:table-cell">{client.city}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[client.status]}`}>
                        {statusLabels[client.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-medium text-gray-800 hidden lg:table-cell">{formatEur(fin.totalInvoiced)}</td>
                    <td className="px-4 py-3">
                      <button onClick={(e) => { e.stopPropagation(); handleEdit(client); }} className="text-gray-400 hover:text-gray-600">
                        <MoreVertical size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-400 text-sm">Aucun client trouvé</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold">{editingClient ? 'Modifier le client' : 'Nouveau client'}</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select value={form.type} onChange={e => setForm({...form, type: e.target.value as ClientType})}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
                    <option value="particulier">Particulier</option>
                    <option value="entreprise">Entreprise</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                  <select value={form.status} onChange={e => setForm({...form, status: e.target.value as ClientStatus})}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
                    {Object.entries(statusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                  <input type="text" value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                  <input type="text" value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div className="sm:col-span-2">
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">SIREN</label>
                  <input type="text" value={form.siren} onChange={e => setForm({...form, siren: e.target.value})}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">TVA Intracommunautaire</label>
                  <input type="text" value={form.tvaIntra} onChange={e => setForm({...form, tvaIntra: e.target.value})}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                  <input type="text" value={form.address} onChange={e => setForm({...form, address: e.target.value})}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="Rue..." />
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Site web</label>
                  <input type="text" value={form.website} onChange={e => setForm({...form, website: e.target.value})}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Source du lead</label>
                  <input type="text" value={form.leadSource} onChange={e => setForm({...form, leadSource: e.target.value})}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="Google, Réseaux sociaux..." />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" rows={2} />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Annuler</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 font-medium">
                  {editingClient ? 'Enregistrer' : 'Créer le client'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
