import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { ArrowLeft, FileDown, Send, Plus, CreditCard, Edit2 } from 'lucide-react';
import { generateInvoicePDF } from '../utils/pdf';
import { format, parseISO } from 'date-fns';
import type { InvoiceLanguage, PaymentMethod } from '../types';
import { languageNames } from '../i18n';

export default function InvoiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { invoices, clients, payments, settings, addPayment, invoiceLanguage, setLanguage } = useStore();
  const invoice = invoices.find(i => i.id === id);
  const [showPayment, setShowPayment] = useState(false);
  const [payForm, setPayForm] = useState({ amount: 0, paymentDate: new Date().toISOString().split('T')[0], method: 'virement' as PaymentMethod, reference: '', notes: '' });

  if (!invoice) return <div className="text-center py-12 text-gray-500">Facture introuvable</div>;
  const client = clients.find(c => c.id === invoice.clientId);
  const clientPayments = payments.filter(p => p.invoiceId === invoice.id);
  const formatEur = (n: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n);

  const handleDownloadPDF = () => {
    if (!client) return;
    const doc = generateInvoicePDF(invoice, client, settings, invoiceLanguage);
    doc.save(`${invoice.number}.pdf`);
  };

  const handleAddPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (payForm.amount <= 0) return;
    addPayment({ invoiceId: invoice.id, clientId: invoice.clientId, ...payForm });
    setShowPayment(false);
    setPayForm({ amount: invoice.amountDue, paymentDate: new Date().toISOString().split('T')[0], method: 'virement', reference: '', notes: '' });
  };

  const statusLabels: Record<string, string> = { brouillon: 'Brouillon', envoyee: 'Envoyée', partiellement_payee: 'Partiellement payée', payee: 'Payée', en_retard: 'En retard', annulee: 'Annulée', avoir: 'Avoir' };
  const statusColors: Record<string, string> = { brouillon: 'bg-gray-100 text-gray-700', envoyee: 'bg-blue-100 text-blue-700', partiellement_payee: 'bg-amber-100 text-amber-700', payee: 'bg-green-100 text-green-700', en_retard: 'bg-red-100 text-red-700', annulee: 'bg-slate-100 text-slate-600' };

  return (
    <div className="space-y-6">
      <button onClick={() => navigate('/invoices')} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft size={16} /> Retour aux factures
      </button>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{invoice.number}</h1>
            <span className={`px-3 py-1 text-xs font-medium rounded-full ${statusColors[invoice.status]}`}>{statusLabels[invoice.status]}</span>
          </div>
          <p className="text-gray-500 text-sm mt-1">{client ? `${client.firstName} ${client.lastName}${client.company ? ` — ${client.company}` : ''}` : ''}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <select value={invoiceLanguage} onChange={e => setLanguage(e.target.value as InvoiceLanguage)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2">
            {Object.entries(languageNames).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <button onClick={handleDownloadPDF}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 shadow-sm">
            <FileDown size={16} /> Télécharger PDF
          </button>
          <button onClick={() => navigate(`/invoices?edit=${invoice.id}`)}
            className="flex items-center gap-2 bg-amber-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-amber-600 shadow-sm">
            <Edit2 size={16} /> Modifier
          </button>
          {invoice.amountDue > 0 && (
            <button onClick={() => { setPayForm({...payForm, amount: invoice.amountDue}); setShowPayment(true); }}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700">
              <CreditCard size={16} /> Enregistrer paiement
            </button>
          )}
        </div>
      </div>

      {/* Invoice preview card */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 md:p-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:justify-between gap-6 mb-8">
            <div>
              <h2 className="text-xl font-bold text-blue-900">{settings.name}</h2>
              <div className="text-sm text-gray-500 mt-1 space-y-0.5">
                {settings.address && <p>{settings.address}, {settings.postalCode} {settings.city}</p>}
                {settings.phone && <p>{settings.phone}</p>}
                {settings.email && <p>{settings.email}</p>}
                {settings.siren && <p>SIREN: {settings.siren}</p>}
              </div>
            </div>
            <div className="text-right">
              <h3 className="text-2xl font-bold text-blue-900">FACTURE</h3>
              <p className="text-sm text-gray-600 font-medium">{invoice.number}</p>
              <div className="text-sm text-gray-500 mt-2">
                <p>Date: {invoice.issueDate ? format(parseISO(invoice.issueDate), 'dd/MM/yyyy') : '—'}</p>
                <p>Échéance: {invoice.dueDate ? format(parseISO(invoice.dueDate), 'dd/MM/yyyy') : '—'}</p>
              </div>
            </div>
          </div>

          {/* Client */}
          {client && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-xs font-semibold text-blue-600 mb-1">FACTURER À</p>
              <p className="font-medium text-gray-800">{client.firstName} {client.lastName}</p>
              {client.company && <p className="text-sm text-gray-600">{client.company}</p>}
              {client.address && <p className="text-sm text-gray-500">{client.address}, {client.postalCode} {client.city}</p>}
              {client.email && <p className="text-sm text-gray-500">{client.email}</p>}
            </div>
          )}

          {/* Items table */}
          <div className="overflow-x-auto mb-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-blue-100">
                  <th className="text-left py-2 text-xs font-semibold text-gray-500">Description</th>
                  <th className="text-center py-2 text-xs font-semibold text-gray-500">Qté</th>
                  <th className="text-right py-2 text-xs font-semibold text-gray-500">Prix unit.</th>
                  <th className="text-center py-2 text-xs font-semibold text-gray-500">TVA</th>
                  <th className="text-right py-2 text-xs font-semibold text-gray-500">Total</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, idx) => (
                  <tr key={idx} className="border-b border-gray-50">
                    <td className="py-3 text-gray-800">{item.description}</td>
                    <td className="py-3 text-center text-gray-600">{item.quantity}</td>
                    <td className="py-3 text-right text-gray-600">{formatEur(item.unitPrice)}</td>
                    <td className="py-3 text-center text-gray-600">{item.taxRate}%</td>
                    <td className="py-3 text-right font-medium">{formatEur(item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-full max-w-xs space-y-1 text-sm">
              <div className="flex justify-between py-1"><span className="text-gray-500">Sous-total HT:</span><span>{formatEur(invoice.subtotal - invoice.discount)}</span></div>
              {invoice.discount > 0 && <div className="flex justify-between py-1"><span className="text-gray-500">Remise:</span><span className="text-red-500">-{formatEur(invoice.discount)}</span></div>}
              <div className="flex justify-between py-1"><span className="text-gray-500">TVA:</span><span>{formatEur(invoice.taxAmount)}</span></div>
              <div className="flex justify-between py-2 border-t-2 border-blue-200 font-bold text-lg">
                <span>Total TTC:</span><span className="text-blue-600">{formatEur(invoice.total)}</span>
              </div>
              {invoice.amountPaid > 0 && <div className="flex justify-between py-1"><span className="text-gray-500">Déjà payé:</span><span className="text-green-600">{formatEur(invoice.amountPaid)}</span></div>}
              {invoice.amountDue > 0 && <div className="flex justify-between py-1"><span className="text-gray-500 font-semibold">Reste à payer:</span><span className="text-red-600 font-bold">{formatEur(invoice.amountDue)}</span></div>}
            </div>
          </div>

          {/* Payment terms */}
          <div className="mt-6 pt-4 border-t border-gray-100 text-xs text-gray-500">
            <p><strong>Conditions:</strong> {invoice.paymentTerms || settings.paymentTerms}</p>
            {settings.legalMentions && <p className="mt-2">{settings.legalMentions}</p>}
          </div>
        </div>
      </div>

      {/* Payments history */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
        <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2"><CreditCard size={16} className="text-green-500" /> Historique des paiements</h3>
        <div className="space-y-2">
          {clientPayments.map(p => (
            <div key={p.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
              <div>
                <p className="text-sm font-medium">{formatEur(p.amount)}</p>
                <p className="text-xs text-gray-500">{p.method} {p.reference && `— ${p.reference}`}</p>
              </div>
              <span className="text-xs text-gray-400">{p.paymentDate ? format(parseISO(p.paymentDate), 'dd/MM/yyyy') : ''}</span>
            </div>
          ))}
          {clientPayments.length === 0 && <p className="text-sm text-gray-400 py-2">Aucun paiement enregistré</p>}
        </div>
      </div>

      {/* Payment modal */}
      {showPayment && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowPayment(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b"><h2 className="text-lg font-semibold">Enregistrer un paiement</h2></div>
            <form onSubmit={handleAddPayment} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Montant (€) *</label>
                <input type="number" step="0.01" value={payForm.amount} onChange={e => setPayForm({...payForm, amount: Number(e.target.value)})} required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" max={invoice.amountDue} />
                <p className="text-xs text-gray-400 mt-1">Reste à payer: {formatEur(invoice.amountDue)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date de paiement</label>
                <input type="date" value={payForm.paymentDate} onChange={e => setPayForm({...payForm, paymentDate: e.target.value})}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Méthode</label>
                <select value={payForm.method} onChange={e => setPayForm({...payForm, method: e.target.value as PaymentMethod})}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
                  <option value="virement">Virement</option>
                  <option value="carte">Carte bancaire</option>
                  <option value="especes">Espèces</option>
                  <option value="cheque">Chèque</option>
                  <option value="paypal">PayPal</option>
                  <option value="stripe">Stripe</option>
                  <option value="autre">Autre</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Référence</label>
                <input type="text" value={payForm.reference} onChange={e => setPayForm({...payForm, reference: e.target.value})}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="N° de virement, chèque..." />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button type="button" onClick={() => setShowPayment(false)} className="px-4 py-2 text-sm text-gray-600">Annuler</button>
                <button type="submit" className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 font-medium">Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
