import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useStore } from '../store';
import { Plus, Trash2, Eye, FileDown, Edit2, X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { generateInvoicePDF } from '../utils/pdf';
import type { Invoice, InvoiceStatus, InvoiceItem, InvoiceLanguage } from '../types';

const statusLabels: Record<InvoiceStatus, string> = { brouillon: 'Brouillon', envoyee: 'Envoyée', partiellement_payee: 'Partiellement payée', payee: 'Payée', en_retard: 'En retard', annulee: 'Annulée', avoir: 'Avoir' };
const statusColors: Record<InvoiceStatus, string> = { brouillon: 'bg-gray-100 text-gray-700', envoyee: 'bg-blue-100 text-blue-700', partiellement_payee: 'bg-amber-100 text-amber-700', payee: 'bg-green-100 text-green-700', en_retard: 'bg-red-100 text-red-700', annulee: 'bg-slate-100 text-slate-600', avoir: 'bg-purple-100 text-purple-700' };

type InvoiceForm = {
  clientId: string;
  projectId: string;
  quoteId: string;
  issueDate: string;
  dueDate: string;
  paymentDate: string;
  currency: string;
  status: InvoiceStatus;
  notes: string;
  paymentTerms: string;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  taxAmount: number;
  total: number;
  amountPaid: number;
  amountDue: number;
  language: InvoiceLanguage;
};

export default function Invoices() {
  const { invoices, clients, settings, addInvoice, updateInvoice, deleteInvoice, invoiceLanguage } = useStore();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const emptyItem: InvoiceItem = { id: uuidv4(), description: '', quantity: 1, unitPrice: 0, discount: 0, taxRate: settings.defaultTaxRate || 20, subtotal: 0, taxAmount: 0, total: 0 };

  const getEmptyForm = (): InvoiceForm => ({
    clientId: '', projectId: '', quoteId: '',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    paymentDate: '', currency: settings.currency || 'EUR',
    status: 'brouillon', notes: '',
    paymentTerms: settings.paymentTerms || 'Paiement à 30 jours',
    items: [{ ...emptyItem, id: uuidv4(), taxRate: settings.defaultTaxRate || 20 }],
    subtotal: 0, discount: 0, taxAmount: 0, total: 0,
    amountPaid: 0, amountDue: 0, language: (invoiceLanguage || 'fr') as InvoiceLanguage,
  });

  const [form, setForm] = useState<InvoiceForm>(getEmptyForm());
  const [searchParams, setSearchParams] = useSearchParams();

  const calcItem = (item: InvoiceItem): InvoiceItem => {
    const subtotal = item.quantity * item.unitPrice;
    const afterDiscount = subtotal * (1 - (item.discount || 0) / 100);
    const taxAmount = afterDiscount * (item.taxRate || 0) / 100;
    return { ...item, subtotal, taxAmount, total: afterDiscount + taxAmount };
  };

  const recalcTotals = (items: InvoiceItem[], amountPaid: number) => {
    const subtotal = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
    const discount = items.reduce((s, i) => s + (i.quantity * i.unitPrice * (i.discount || 0) / 100), 0);
    const taxAmount = items.reduce((s, i) => s + i.taxAmount, 0);
    const total = items.reduce((s, i) => s + i.total, 0);
    return { subtotal, discount, taxAmount, total, amountDue: total - amountPaid };
  };

  const updateItem = (idx: number, data: Partial<InvoiceItem>) => {
    const items = [...form.items];
    items[idx] = calcItem({ ...items[idx], ...data });
    const totals = recalcTotals(items, form.amountPaid);
    setForm({ ...form, items, ...totals });
  };

  const addItem = () => {
    const newItem = calcItem({ ...emptyItem, id: uuidv4(), taxRate: settings.defaultTaxRate || 20 });
    const items = [...form.items, newItem];
    const totals = recalcTotals(items, form.amountPaid);
    setForm({ ...form, items, ...totals });
  };

  const removeItem = (idx: number) => {
    const items = form.items.filter((_, i) => i !== idx);
    if (items.length === 0) items.push(calcItem({ ...emptyItem, id: uuidv4(), taxRate: settings.defaultTaxRate || 20 }));
    const totals = recalcTotals(items, form.amountPaid);
    setForm({ ...form, items, ...totals });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.clientId) { alert('Veuillez sélectionner un client'); return; }
    if (form.items.every(i => !i.description)) { alert('Veuillez ajouter au moins une prestation'); return; }

    // Recalculate all items and totals before saving
    const calculatedItems = form.items.map(item => calcItem(item));
    const totals = recalcTotals(calculatedItems, form.amountPaid);
    const invoiceData = { ...form, items: calculatedItems, ...totals };

    if (editingId) {
      updateInvoice(editingId, invoiceData);
    } else {
      addInvoice(invoiceData);
    }
    setShowForm(false);
    setEditingId(null);
    setForm(getEmptyForm());
  };

  const handleEdit = (inv: Invoice) => {
    setEditingId(inv.id);
    setForm({
      clientId: inv.clientId,
      projectId: inv.projectId || '',
      quoteId: inv.quoteId || '',
      issueDate: inv.issueDate || '',
      dueDate: inv.dueDate || '',
      paymentDate: inv.paymentDate || '',
      currency: inv.currency || 'EUR',
      status: inv.status,
      notes: inv.notes || '',
      paymentTerms: inv.paymentTerms || settings.paymentTerms,
      items: inv.items.length > 0 ? [...inv.items] : [{ ...emptyItem, id: uuidv4() }],
      subtotal: inv.subtotal,
      discount: inv.discount,
      taxAmount: inv.taxAmount,
      total: inv.total,
      amountPaid: inv.amountPaid,
      amountDue: inv.amountDue,
      language: inv.language || 'fr',
    });
    setShowForm(true);
  };

  // Detect edit parameter from URL (from InvoiceDetail)
  useEffect(() => {
    const editId = searchParams.get('edit');
    if (editId) {
      const inv = invoices.find(i => i.id === editId);
      if (inv) {
        handleEdit(inv);
        setSearchParams({});
      }
    }
  }, [searchParams, invoices]);

  const handleDelete = (id: string, number: string) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer la facture ${number} ?\nCette action est irréversible.`)) {
      deleteInvoice(id);
    }
  };

  const handleDownloadPDF = (inv: Invoice) => {
    const client = clients.find(c => c.id === inv.clientId);
    if (!client) { alert('Client introuvable'); return; }
    try {
      const doc = generateInvoicePDF(inv, client, settings, inv.language || invoiceLanguage || 'fr');
      doc.save(`${inv.number}.pdf`);
    } catch (err) {
      console.error('Erreur génération PDF:', err);
      alert('Erreur lors de la génération du PDF. Vérifiez les données.');
    }
  };

  const filtered = invoices.filter(i => !statusFilter || i.status === statusFilter);
  const formatEur = (n: number) => {
    try {
      return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: settings.currency || 'EUR' }).format(n);
    } catch {
      return `${n.toFixed(2)} €`;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Factures</h1>
          <p className="text-gray-500 text-sm">{invoices.length} facture{invoices.length > 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => { setForm(getEmptyForm()); setEditingId(null); setShowForm(true); }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-blue-700 text-sm shadow-sm">
          <Plus size={16} /> Nouvelle facture
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border p-4">
          <p className="text-xs text-gray-500">Total facturé</p>
          <p className="text-xl font-bold text-gray-900">{formatEur(invoices.reduce((s, i) => s + i.total, 0))}</p>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <p className="text-xs text-gray-500">Encaissé</p>
          <p className="text-xl font-bold text-green-600">{formatEur(invoices.reduce((s, i) => s + i.amountPaid, 0))}</p>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <p className="text-xs text-gray-500">En attente</p>
          <p className="text-xl font-bold text-amber-600">{formatEur(invoices.filter(i => ['envoyee', 'partiellement_payee'].includes(i.status)).reduce((s, i) => s + i.amountDue, 0))}</p>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <p className="text-xs text-gray-500">En retard</p>
          <p className="text-xl font-bold text-red-600">{formatEur(invoices.filter(i => i.status === 'en_retard').reduce((s, i) => s + i.amountDue, 0))}</p>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setStatusFilter('')} className={`px-3 py-1.5 text-xs rounded-lg font-medium ${!statusFilter ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Toutes</button>
        {Object.entries(statusLabels).map(([k, v]) => (
          <button key={k} onClick={() => setStatusFilter(k)} className={`px-3 py-1.5 text-xs rounded-lg font-medium ${statusFilter === k ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{v}</button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Numéro</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Client</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 hidden md:table-cell">Émission</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 hidden md:table-cell">Échéance</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500">Montant</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 hidden lg:table-cell">Payé</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500">Statut</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(inv => {
                const client = clients.find(c => c.id === inv.clientId);
                return (
                  <tr key={inv.id} className="hover:bg-gray-50/50 group">
                    <td className="px-4 py-3">
                      <button onClick={() => navigate(`/invoices/${inv.id}`)} className="text-sm font-medium text-blue-600 hover:underline">
                        {inv.number}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-sm">{client ? `${client.firstName} ${client.lastName}` : '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-500 hidden md:table-cell">{inv.issueDate || '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-500 hidden md:table-cell">{inv.dueDate || '—'}</td>
                    <td className="px-4 py-3 text-sm text-right font-semibold">{formatEur(inv.total)}</td>
                    <td className="px-4 py-3 text-sm text-right text-green-600 hidden lg:table-cell">{formatEur(inv.amountPaid)}</td>
                    <td className="px-4 py-3 text-center">
                      <select value={inv.status} onChange={e => updateInvoice(inv.id, { status: e.target.value as InvoiceStatus })}
                        className={`text-xs px-2 py-1 rounded-full font-medium border-0 cursor-pointer ${statusColors[inv.status]}`}>
                        {Object.entries(statusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={(e) => { e.stopPropagation(); handleDownloadPDF(inv); }}
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Télécharger PDF">
                          <FileDown size={16} />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); navigate(`/invoices/${inv.id}`); }}
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Voir détails">
                          <Eye size={16} />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleEdit(inv); }}
                          className="p-2 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all" title="Modifier">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleDelete(inv.id, inv.number); }}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Supprimer">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-gray-400 text-sm">
                  {invoices.length === 0 ? 'Aucune facture. Cliquez sur "Nouvelle facture" pour commencer.' : 'Aucune facture pour ce filtre.'}
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => { setShowForm(false); setEditingId(null); }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <h2 className="text-lg font-semibold">{editingId ? `Modifier la facture` : 'Nouvelle facture'}</h2>
                {editingId && <p className="text-xs text-gray-500">Modification en cours — les changements seront enregistrés</p>}
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-600">{formatEur(form.total)}</p>
                  <p className="text-xs text-gray-500">Total TTC</p>
                </div>
                <button onClick={() => { setShowForm(false); setEditingId(null); }} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X size={20} className="text-gray-400" />
                </button>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Client *</label>
                  <select value={form.clientId} onChange={e => setForm({...form, clientId: e.target.value})} required
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="">Sélectionner un client...</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.firstName} {c.lastName}{c.company ? ` — ${c.company}` : ''}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date d'émission</label>
                  <input type="date" value={form.issueDate} onChange={e => setForm({...form, issueDate: e.target.value})}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date d'échéance</label>
                  <input type="date" value={form.dueDate} onChange={e => setForm({...form, dueDate: e.target.value})}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
              </div>

              {/* Items */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Prestations</label>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="grid grid-cols-12 gap-1 px-3 py-2 bg-gray-50 text-xs font-semibold text-gray-500 border-b">
                    <span className="col-span-5">Description</span>
                    <span className="col-span-1 text-center">Qté</span>
                    <span className="col-span-2 text-right">Prix unit.</span>
                    <span className="col-span-1 text-center">Rem.%</span>
                    <span className="col-span-1 text-center">TVA%</span>
                    <span className="col-span-1 text-right">Total</span>
                    <span className="col-span-1"></span>
                  </div>
                  {form.items.map((item, idx) => (
                    <div key={item.id} className="grid grid-cols-12 gap-1 px-3 py-2.5 border-t border-gray-50 items-center hover:bg-gray-50/50">
                      <input type="text" value={item.description} onChange={e => updateItem(idx, { description: e.target.value })}
                        className="col-span-5 text-sm border border-gray-200 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="Description de la prestation..." />
                      <input type="number" value={item.quantity} onChange={e => updateItem(idx, { quantity: Number(e.target.value) || 0 })}
                        className="col-span-1 text-sm text-center border border-gray-200 rounded px-1 py-1 focus:ring-1 focus:ring-blue-500 outline-none" min="0" step="0.5" />
                      <input type="number" value={item.unitPrice} onChange={e => updateItem(idx, { unitPrice: Number(e.target.value) || 0 })}
                        className="col-span-2 text-sm text-right border border-gray-200 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500 outline-none" min="0" step="0.01" />
                      <input type="number" value={item.discount} onChange={e => updateItem(idx, { discount: Number(e.target.value) || 0 })}
                        className="col-span-1 text-sm text-center border border-gray-200 rounded px-1 py-1 focus:ring-1 focus:ring-blue-500 outline-none" min="0" max="100" />
                      <input type="number" value={item.taxRate} onChange={e => updateItem(idx, { taxRate: Number(e.target.value) || 0 })}
                        className="col-span-1 text-sm text-center border border-gray-200 rounded px-1 py-1 focus:ring-1 focus:ring-blue-500 outline-none" min="0" />
                      <span className="col-span-1 text-sm text-right font-medium text-gray-800">{formatEur(item.total)}</span>
                      <button type="button" onClick={() => removeItem(idx)} className="col-span-1 text-red-400 hover:text-red-600 flex justify-center p-1">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
                <button type="button" onClick={addItem} className="mt-2 text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium">
                  <Plus size={14} /> Ajouter une ligne
                </button>
              </div>

              {/* Summary */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-1.5 text-sm border">
                <div className="flex justify-between"><span className="text-gray-500">Sous-total HT:</span><span className="font-medium">{formatEur(form.subtotal - form.discount)}</span></div>
                {form.discount > 0 && <div className="flex justify-between"><span className="text-gray-500">Remise:</span><span className="text-red-500 font-medium">-{formatEur(form.discount)}</span></div>}
                <div className="flex justify-between"><span className="text-gray-500">TVA:</span><span className="font-medium">{formatEur(form.taxAmount)}</span></div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-200">
                  <span>Total TTC:</span><span className="text-blue-600">{formatEur(form.total)}</span>
                </div>
                {form.amountPaid > 0 && (
                  <div className="flex justify-between text-green-600 pt-1">
                    <span>Déjà payé:</span><span>{formatEur(form.amountPaid)}</span>
                  </div>
                )}
                {form.amountDue > 0 && (
                  <div className="flex justify-between text-red-600 font-semibold pt-1">
                    <span>Reste à payer:</span><span>{formatEur(form.amountDue)}</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Conditions de paiement</label>
                  <input type="text" value={form.paymentTerms} onChange={e => setForm({...form, paymentTerms: e.target.value})}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <input type="text" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }}
                  className="px-4 py-2.5 text-sm text-gray-600 hover:text-gray-800 font-medium">Annuler</button>
                <button type="submit"
                  className="px-6 py-2.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 font-medium shadow-sm">
                  {editingId ? '✓ Enregistrer les modifications' : 'Créer la facture'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
