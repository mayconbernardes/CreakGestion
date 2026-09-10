import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { ArrowLeft, Phone, Mail, Globe, MapPin, Building2, Receipt, FolderKanban, FileText, CreditCard, StickyNote, Clock } from 'lucide-react';
import { format, parseISO } from 'date-fns';

export default function ClientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { clients, invoices, quotes, projects, payments, notes, timeline, settings } = useStore();
  const client = clients.find(c => c.id === id);

  if (!client) return <div className="text-center py-12 text-gray-500">Client introuvable</div>;

  const clientInvoices = invoices.filter(i => i.clientId === id);
  const clientQuotes = quotes.filter(q => q.clientId === id);
  const clientProjects = projects.filter(p => p.clientId === id);
  const clientNotes = notes.filter(n => n.clientId === id);
  const clientTimeline = timeline.filter(t => t.clientId === id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const fin = useStore.getState().getClientFinancials(client.id);
  const formatEur = (n: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n);

  const statusLabels: Record<string, string> = { prospect: 'Prospect', lead: 'Lead', actif: 'Actif', inactif: 'Inactif', ancien: 'Ancien' };
  const invStatusColors: Record<string, string> = { payee: 'bg-green-100 text-green-700', envoyee: 'bg-blue-100 text-blue-700', en_retard: 'bg-red-100 text-red-700', partiellement_payee: 'bg-amber-100 text-amber-700', brouillon: 'bg-gray-100 text-gray-600' };

  return (
    <div className="space-y-6">
      <button onClick={() => navigate('/clients')} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft size={16} /> Retour aux clients
      </button>

      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl font-bold">
              {(client.firstName || client.company || '?').charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{client.firstName} {client.lastName}</h1>
              {client.company && <p className="text-gray-500 flex items-center gap-1"><Building2 size={14} />{client.company}</p>}
              <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-500">
                {client.email && <span className="flex items-center gap-1"><Mail size={13} />{client.email}</span>}
                {client.phone && <span className="flex items-center gap-1"><Phone size={13} />{client.phone}</span>}
                {client.website && <span className="flex items-center gap-1"><Globe size={13} />{client.website}</span>}
                {client.city && <span className="flex items-center gap-1"><MapPin size={13} />{client.city}</span>}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">{statusLabels[client.status]}</span>
          </div>
        </div>

        {/* Financial summary */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{formatEur(fin.totalInvoiced)}</p>
            <p className="text-xs text-gray-500 mt-1">Total facturé</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{formatEur(fin.totalPaid)}</p>
            <p className="text-xs text-gray-500 mt-1">Total payé</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">{formatEur(fin.totalDue)}</p>
            <p className="text-xs text-gray-500 mt-1">Reste à payer</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Invoices */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2"><Receipt size={16} className="text-blue-500" /> Factures ({clientInvoices.length})</h3>
          <div className="space-y-2">
            {clientInvoices.slice(0, 8).map(inv => (
              <div key={inv.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0 cursor-pointer hover:bg-gray-50 -mx-2 px-2 rounded"
                onClick={() => navigate(`/invoices/${inv.id}`)}>
                <div>
                  <p className="text-sm font-medium">{inv.number}</p>
                  <p className="text-xs text-gray-400">{inv.issueDate ? format(parseISO(inv.issueDate), 'dd/MM/yyyy') : ''}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">{formatEur(inv.total)}</p>
                  <span className={`text-xs px-1.5 py-0.5 rounded ${invStatusColors[inv.status] || 'bg-gray-100'}`}>{inv.status}</span>
                </div>
              </div>
            ))}
            {clientInvoices.length === 0 && <p className="text-sm text-gray-400 py-2">Aucune facture</p>}
          </div>
        </div>

        {/* Projects */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2"><FolderKanban size={16} className="text-purple-500" /> Projets ({clientProjects.length})</h3>
          <div className="space-y-2">
            {clientProjects.map(p => (
              <div key={p.id} className="py-2 border-b border-gray-50 last:border-0">
                <p className="text-sm font-medium">{p.name}</p>
                <p className="text-xs text-gray-400">{p.status.replace(/_/g, ' ')}</p>
              </div>
            ))}
            {clientProjects.length === 0 && <p className="text-sm text-gray-400 py-2">Aucun projet</p>}
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2"><Clock size={16} className="text-amber-500" /> Historique</h3>
          <div className="space-y-3">
            {clientTimeline.slice(0, 10).map(event => (
              <div key={event.id} className="flex gap-3">
                <div className="w-2 h-2 bg-blue-400 rounded-full mt-1.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-800">{event.title}</p>
                  <p className="text-xs text-gray-500">{event.description}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{format(parseISO(event.date), 'dd/MM/yyyy')}</p>
                </div>
              </div>
            ))}
            {clientTimeline.length === 0 && <p className="text-sm text-gray-400 py-2">Aucun événement</p>}
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
        <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2"><StickyNote size={16} className="text-yellow-500" /> Notes internes</h3>
        <div className="space-y-2">
          {clientNotes.map(n => (
            <div key={n.id} className="bg-yellow-50 border border-yellow-100 rounded-lg p-3">
              <p className="text-sm text-gray-700">{n.content}</p>
              <p className="text-xs text-gray-400 mt-1">{format(parseISO(n.createdAt), 'dd/MM/yyyy HH:mm')}</p>
            </div>
          ))}
          {clientNotes.length === 0 && <p className="text-sm text-gray-400">Aucune note</p>}
        </div>
      </div>

      {/* Info */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
        <h3 className="font-semibold text-gray-800 mb-3">Informations</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          {client.siren && <div><span className="text-gray-500">SIREN:</span> <span className="font-medium">{client.siren}</span></div>}
          {client.siret && <div><span className="text-gray-500">SIRET:</span> <span className="font-medium">{client.siret}</span></div>}
          {client.tvaIntra && <div><span className="text-gray-500">TVA:</span> <span className="font-medium">{client.tvaIntra}</span></div>}
          {client.sector && <div><span className="text-gray-500">Secteur:</span> <span className="font-medium">{client.sector}</span></div>}
          {client.leadSource && <div><span className="text-gray-500">Source:</span> <span className="font-medium">{client.leadSource}</span></div>}
          <div><span className="text-gray-500">Créé le:</span> <span className="font-medium">{client.createdAt ? format(parseISO(client.createdAt), 'dd/MM/yyyy') : '—'}</span></div>
        </div>
      </div>
    </div>
  );
}
