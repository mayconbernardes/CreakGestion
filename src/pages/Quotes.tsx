import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { Plus, Trash2, FileText, ArrowRight } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import type { Quote, QuoteStatus, QuoteItem } from '../types';

const statusLabels: Record<QuoteStatus, string> = { brouillon: 'Brouillon', envoye: 'Envoyé', vu: 'Vu', accepte: 'Accepté', refuse: 'Refusé', expire: 'Expiré', annule: 'Annulé' };
const statusColors: Record<QuoteStatus, string> = { brouillon: 'bg-gray-100 text-gray-700', envoye: 'bg-blue-100 text-blue-700', vu: 'bg-indigo-100 text-indigo-700', accepte: 'bg-green-100 text-green-700', refuse: 'bg-red-100 text-red-700', expire: 'bg-orange-100 text-orange-700', annule: 'bg-slate-100 text-slate-600' };

export default function Quotes() {
  const { quotes, clients, services, addQuote, updateQuote, deleteQuote, addInvoice, settings } = useStore();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Quote | null>(null);
  const [statusFilter, setStatusFilter] = useState('');

  const emptyItem: QuoteItem = { id: uuidv4(), description: '', quantity: 1, unitPrice: 0, discount: 0, taxRate: settings.defaultTaxRate, subtotal: 0, taxAmount: 0, total: 0 };
  const empty = { clientId: '', projectId: '', date: new Date().toISOString().split('T')[0], validUntil: '', title: '', description: '', items: [{ ...emptyItem }], subtotal: 0, discount: 0, taxAmount: 0, total: 0, paymentTerms: settings.paymentTerms, notes: '', status: 'brouillon' as QuoteStatus };
  const [form, setForm] = useState(empty);

  const calcItem = (item: QuoteItem): QuoteItem => {
    const subtotal = item.quantity * item.unitPrice;
    const afterDiscount = subtotal * (1 - item.discount / 100);
    const taxAmount = afterDiscount * item.taxRate / 100;
    return { ...item, subtotal, taxAmount, total: afterDiscount + taxAmount };
  };

  const updateItem = (idx: number, data: Partial<QuoteItem>) => {
    const items = [...form.items];
    items[idx] = calcItem({ ...items[idx], ...data });
    const subtotal = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
    const discount = items.reduce((s, i) => s + (i.quantity * i.unitPrice * i.discount / 100), 0);
    const taxAmount = items.reduce((s, i) => s + i.taxAmount, 0);
    const total = items.reduce((s, i) => s + i.total, 0);
    setForm({ ...form, items, subtotal, discount, taxAmount, total });
  };

  const addItem = () => { setForm({ ...form, items: [...form.items, calcItem({ ...emptyItem, id: uuidv4() })] }); };
  const removeItem = (idx: number) => {
    const items = form.items.filter((_, i) => i !== idx);
    const subtotal = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
    const discount = items.reduce((s, i) => s + (i.quantity * i.unitPrice * i.discount / 100), 0);
    const taxAmount = items.reduce((s, i) => s + i.taxAmount, 0);
    const total = items.reduce((s, i) => s + i.total, 0);
    setForm({ ...form, items, subtotal, discount, taxAmount, total });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.clientId || form.items.length === 0) return;
    if (editing) { updateQuote(editing.id, form); } else { addQuote(form); }
    setShowForm(false); setEditing(null); setForm(empty);
  };

  const handleAccept = (quote: Quote) => {
    updateQuote(quote.id, { status: 'accepte' });
  };

  const handleCreateInvoice = (quote: Quote) => {
    addInvoice({
      clientId: quote.clientId,
      projectId: quote.projectId,
      quoteId: quote.id,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: '',
      paymentDate: '',
      currency: 'EUR',
      status: 'brouillon',
      notes: quote.notes,
      paymentTerms: quote.paymentTerms,
      items: quote.items.map(i => ({ ...i, id: uuidv4() })),
      subtotal: quote.subtotal,
      discount: quote.discount,
      taxAmount: quote.taxAmount,
      total: quote.total,
      amountPaid: 0,
      amountDue: quote.total,
      language: 'fr',
    });
    navigate('/invoices');
  };

  const filtered = quotes.filter(q => !statusFilter || q.status === statusFilter);
  const formatEur = (n: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Devis</h1>
          <p className="text-gray-500 text-sm">{quotes.length} devis</p>
        </div>
        <button onClick={() => { setForm({...empty, validUntil: new Date(Date.now() + 30*86400000).toISOString().split('T')[0]}); setEditing(null); setShowForm(true); }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-blue-700 text-sm">
          <Plus size={16} /> Nouveau devis
        </button>
      </div>

      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setStatusFilter('')} className={`px-3 py-1.5 text-xs rounded-lg font-medium ${!statusFilter ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}>Tous</button>
        {Object.entries(statusLabels).map(([k, v]) => (
          <button key={k} onClick={() => setStatusFilter(k)} className={`px-3 py-1.5 text-xs rounded-lg font-medium ${statusFilter === k ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}>{v}</button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Numéro</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Client</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 hidden md:table-cell">Date</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500">Montant</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500">Statut</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(quote => {
                const client = clients.find(c => c.id === quote.clientId);
                return (
                  <tr key={quote.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-blue-600">{quote.number}</td>
                    <td className="px-4 py-3 text-sm">{client ? `${client.firstName} ${client.lastName}` : '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-500 hidden md:table-cell">{quote.date}</td>
                    <td className="px-4 py-3 text-sm text-right font-semibold">{formatEur(quote.total)}</td>
                    <td className="px-4 py-3 text-center">
                      <select value={quote.status} onChange={e => updateQuote(quote.id, { status: e.target.value as QuoteStatus })}
                        className={`text-xs px-2 py-1 rounded-full font-medium border-0 ${statusColors[quote.status]}`}>
                        {Object.entries(statusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {quote.status === 'accepte' && (
                          <button onClick={() => handleCreateInvoice(quote)} title="Créer facture"
                            className="p-1.5 text-green-600 hover:bg-green-50 rounded"><ArrowRight size={14} /></button>
                        )}
                        <button onClick={() => { if (confirm('Supprimer ?')) deleteQuote(quote.id); }}
                          className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-400 text-sm">Aucun devis</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold">{editing ? 'Modifier' : 'Nouveau'} devis</h2>
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-600">{formatEur(form.total)}</p>
                <p className="text-xs text-gray-500">Total TTC</p>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Client *</label>
                  <select value={form.clientId} onChange={e => setForm({...form, clientId: e.target.value})} required
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
                    <option value="">Sélectionner...</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.firstName} {c.lastName} {c.company && `— ${c.company}`}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Valide jusqu'au</label>
                  <input type="date" value={form.validUntil} onChange={e => setForm({...form, validUntil: e.target.value})}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div className="sm:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
                  <input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="Ex: Création site web restaurant" />
                </div>
              </div>

              {/* Items */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Prestations</label>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="grid grid-cols-12 gap-1 px-3 py-2 bg-gray-50 text-xs font-semibold text-gray-500">
                    <span className="col-span-5">Description</span>
                    <span className="col-span-1 text-center">Qté</span>
                    <span className="col-span-2 text-right">Prix unit.</span>
                    <span className="col-span-1 text-center">Remise%</span>
                    <span className="col-span-1 text-center">TVA%</span>
                    <span className="col-span-1 text-right">Total</span>
                    <span className="col-span-1"></span>
                  </div>
                  {form.items.map((item, idx) => (
                    <div key={item.id} className="grid grid-cols-12 gap-1 px-3 py-2 border-t border-gray-50 items-center">
                      <input type="text" value={item.description} onChange={e => updateItem(idx, { description: e.target.value })}
                        className="col-span-5 text-sm border-0 p-0 focus:ring-0 bg-transparent" placeholder="Description..." />
                      <input type="number" value={item.quantity} onChange={e => updateItem(idx, { quantity: Number(e.target.value) })}
                        className="col-span-1 text-sm text-center border-0 p-0 focus:ring-0 bg-transparent" min="0" step="0.5" />
                      <input type="number" value={item.unitPrice} onChange={e => updateItem(idx, { unitPrice: Number(e.target.value) })}
                        className="col-span-2 text-sm text-right border-0 p-0 focus:ring-0 bg-transparent" min="0" step="0.01" />
                      <input type="number" value={item.discount} onChange={e => updateItem(idx, { discount: Number(e.target.value) })}
                        className="col-span-1 text-sm text-center border-0 p-0 focus:ring-0 bg-transparent" min="0" max="100" />
                      <input type="number" value={item.taxRate} onChange={e => updateItem(idx, { taxRate: Number(e.target.value) })}
                        className="col-span-1 text-sm text-center border-0 p-0 focus:ring-0 bg-transparent" min="0" />
                      <span className="col-span-1 text-sm text-right font-medium">{formatEur(item.total)}</span>
                      <button type="button" onClick={() => removeItem(idx)} className="col-span-1 text-red-400 hover:text-red-600 flex justify-center">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
                <button type="button" onClick={addItem} className="mt-2 text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
                  <Plus size={14} /> Ajouter une ligne
                </button>
              </div>

              {/* Summary */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-1 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Sous-total HT:</span><span>{formatEur(form.subtotal)}</span></div>
                {form.discount > 0 && <div className="flex justify-between"><span className="text-gray-500">Remise:</span><span className="text-red-500">-{formatEur(form.discount)}</span></div>}
                <div className="flex justify-between"><span className="text-gray-500">TVA:</span><span>{formatEur(form.taxAmount)}</span></div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t"><span>Total TTC:</span><span className="text-blue-600">{formatEur(form.total)}</span></div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Conditions de paiement</label>
                  <input type="text" value={form.paymentTerms} onChange={e => setForm({...form, paymentTerms: e.target.value})}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <input type="text" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-600">Annuler</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 font-medium">
                  {editing ? 'Enregistrer' : 'Créer le devis'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
