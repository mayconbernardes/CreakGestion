import { useStore } from '../store';
import { format, parseISO } from 'date-fns';

export default function Payments() {
  const { payments, invoices, clients } = useStore();
  const formatEur = (n: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n);
  const methodLabels: Record<string, string> = { virement: 'Virement', carte: 'Carte', especes: 'Espèces', cheque: 'Chèque', paypal: 'PayPal', stripe: 'Stripe', autre: 'Autre' };

  const totalReceived = payments.reduce((s, p) => s + p.amount, 0);
  const monthPayments = payments.filter(p => { const d = parseISO(p.paymentDate); const now = new Date(); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); });
  const monthTotal = monthPayments.reduce((s, p) => s + p.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Paiements</h1>
        <p className="text-gray-500 text-sm">{payments.length} paiement{payments.length > 1 ? 's' : ''} enregistré{payments.length > 1 ? 's' : ''}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border p-4">
          <p className="text-xs text-gray-500">Total encaissé</p>
          <p className="text-xl font-bold text-green-600">{formatEur(totalReceived)}</p>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <p className="text-xs text-gray-500">Ce mois</p>
          <p className="text-xl font-bold text-blue-600">{formatEur(monthTotal)}</p>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <p className="text-xs text-gray-500">Nombre de transactions</p>
          <p className="text-xl font-bold text-gray-900">{payments.length}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Date</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Client</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 hidden md:table-cell">Facture</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 hidden md:table-cell">Méthode</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 hidden lg:table-cell">Référence</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500">Montant</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {[...payments].reverse().map(p => {
                const client = clients.find(c => c.id === p.clientId);
                const invoice = invoices.find(i => i.id === p.invoiceId);
                return (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-600">{p.paymentDate ? format(parseISO(p.paymentDate), 'dd/MM/yyyy') : '—'}</td>
                    <td className="px-4 py-3 text-sm font-medium">{client ? `${client.firstName} ${client.lastName}` : '—'}</td>
                    <td className="px-4 py-3 text-sm text-blue-600 hidden md:table-cell">{invoice?.number || '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 hidden md:table-cell">{methodLabels[p.method] || p.method}</td>
                    <td className="px-4 py-3 text-sm text-gray-500 hidden lg:table-cell">{p.reference || '—'}</td>
                    <td className="px-4 py-3 text-sm text-right font-semibold text-green-600">{formatEur(p.amount)}</td>
                  </tr>
                );
              })}
              {payments.length === 0 && <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-400 text-sm">Aucun paiement enregistré</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
