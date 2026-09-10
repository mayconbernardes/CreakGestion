import { useStore } from '../store';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { format, parseISO, subMonths, startOfMonth } from 'date-fns';

export default function Reports() {
  const { invoices, payments, clients, projects, services, contracts } = useStore();
  const formatEur = (n: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n);

  // Revenue by month
  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const date = subMonths(new Date(), 11 - i);
    const month = format(date, 'MMM yy');
    const rev = payments.filter(p => {
      const pd = parseISO(p.paymentDate);
      return pd.getMonth() === date.getMonth() && pd.getFullYear() === date.getFullYear();
    }).reduce((s, p) => s + p.amount, 0);
    const inv = invoices.filter(inv => {
      const id = parseISO(inv.issueDate);
      return id.getMonth() === date.getMonth() && id.getFullYear() === date.getFullYear();
    }).reduce((s, inv) => s + inv.total, 0);
    return { month, revenue: rev, invoiced: inv };
  });

  // Revenue by client
  const clientRevenue = clients.map(c => {
    const total = invoices.filter(i => i.clientId === c.id).reduce((s, i) => s + i.amountPaid, 0);
    return { name: `${c.firstName} ${c.lastName}${c.company ? ` (${c.company})` : ''}`, value: total };
  }).filter(c => c.value > 0).sort((a, b) => b.value - a.value).slice(0, 10);

  // Invoice status
  const statusData = [
    { name: 'Payées', value: invoices.filter(i => i.status === 'payee').length, color: '#22c55e' },
    { name: 'En attente', value: invoices.filter(i => ['envoyee', 'partiellement_payee'].includes(i.status)).length, color: '#f59e0b' },
    { name: 'En retard', value: invoices.filter(i => i.status === 'en_retard').length, color: '#ef4444' },
    { name: 'Brouillon', value: invoices.filter(i => i.status === 'brouillon').length, color: '#6b7280' },
  ].filter(d => d.value > 0);

  // Aging
  const now = new Date();
  const aging = { current: 0, d30: 0, d60: 0, d90: 0 };
  invoices.filter(i => i.amountDue > 0 && !['payee', 'annulee', 'brouillon'].includes(i.status)).forEach(inv => {
    if (!inv.dueDate) return;
    const days = Math.floor((now.getTime() - parseISO(inv.dueDate).getTime()) / 86400000);
    if (days <= 0) aging.current += inv.amountDue;
    else if (days <= 30) aging.d30 += inv.amountDue;
    else if (days <= 60) aging.d60 += inv.amountDue;
    else aging.d90 += inv.amountDue;
  });

  // Recurring revenue
  const recurringMonthly = contracts.filter(c => c.status === 'actif').reduce((s, c) => {
    const mult = c.frequency === 'mensuelle' ? 1 : c.frequency === 'trimestrielle' ? 1/3 : c.frequency === 'semestrielle' ? 1/6 : 1/12;
    return s + c.amount * mult;
  }, 0);

  const totalRevenue = payments.reduce((s, p) => s + p.amount, 0);
  const totalInvoiced = invoices.reduce((s, i) => s + i.total, 0);
  const totalOutstanding = invoices.reduce((s, i) => s + i.amountDue, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Rapports</h1>
        <p className="text-gray-500 text-sm">Analyse financière et commerciale</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border p-4">
          <p className="text-xs text-gray-500">CA Total encaissé</p>
          <p className="text-xl font-bold text-green-600">{formatEur(totalRevenue)}</p>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <p className="text-xs text-gray-500">Total facturé</p>
          <p className="text-xl font-bold text-blue-600">{formatEur(totalInvoiced)}</p>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <p className="text-xs text-gray-500">Créances</p>
          <p className="text-xl font-bold text-amber-600">{formatEur(totalOutstanding)}</p>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <p className="text-xs text-gray-500">Revenus récurrents/mois</p>
          <p className="text-xl font-bold text-indigo-600">{formatEur(recurringMonthly)}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border p-5">
          <h3 className="font-semibold text-gray-800 mb-4">CA mensuel (12 mois)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" fontSize={11} />
              <YAxis fontSize={11} />
              <Tooltip formatter={(v: number) => formatEur(v)} />
              <Bar dataKey="invoiced" fill="#93c5fd" name="Facturé" radius={[2, 2, 0, 0]} />
              <Bar dataKey="revenue" fill="#3b82f6" name="Encaissé" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Top clients par CA</h3>
          {clientRevenue.length > 0 ? (
            <div className="space-y-2">
              {clientRevenue.slice(0, 8).map((c, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-xs text-gray-400 w-4">{i + 1}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-sm text-gray-700 truncate">{c.name}</span>
                      <span className="text-sm font-semibold">{formatEur(c.value)}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${(c.value / clientRevenue[0].value) * 100}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : <p className="text-sm text-gray-400 text-center py-8">Aucune donnée</p>}
        </div>

        <div className="bg-white rounded-xl border p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Statut des factures</h3>
          {statusData.length > 0 ? (
            <div className="flex items-center gap-6">
              <ResponsiveContainer width="50%" height={200}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} dataKey="value" paddingAngle={2}>
                    {statusData.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {statusData.map((d, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                    <span className="text-sm text-gray-600">{d.name}</span>
                    <span className="text-sm font-semibold ml-auto">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : <p className="text-sm text-gray-400 text-center py-8">Aucune facture</p>}
        </div>

        <div className="bg-white rounded-xl border p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Balance âgée (créances)</h3>
          <div className="space-y-3">
            {[
              { label: 'À échéance', value: aging.current, color: 'bg-green-500' },
              { label: '1-30 jours', value: aging.d30, color: 'bg-amber-500' },
              { label: '31-60 jours', value: aging.d60, color: 'bg-orange-500' },
              { label: '+90 jours', value: aging.d90, color: 'bg-red-500' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${item.color}`} />
                  <span className="text-sm text-gray-600">{item.label}</span>
                </div>
                <span className="text-sm font-semibold">{formatEur(item.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Export buttons */}
      <div className="bg-white rounded-xl border p-5">
        <h3 className="font-semibold text-gray-800 mb-3">Export de données</h3>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => exportCSV('clients', clients.map(c => ({ nom: `${c.firstName} ${c.lastName}`, entreprise: c.company, email: c.email, telephone: c.phone, ville: c.city, statut: c.status })))}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">Export Clients CSV</button>
          <button onClick={() => exportCSV('factures', invoices.map(i => ({ numero: i.number, client: clients.find(c => c.id === i.clientId)?.firstName || '', montant: i.total, paye: i.amountPaid, statut: i.status, date: i.issueDate })))}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">Export Factures CSV</button>
          <button onClick={() => exportCSV('paiements', payments.map(p => ({ montant: p.amount, date: p.paymentDate, methode: p.method, reference: p.reference })))}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">Export Paiements CSV</button>
          <button onClick={() => {
            const data = JSON.stringify({ clients, invoices, payments, projects, quotes: useStore.getState().quotes }, null, 2);
            const blob = new Blob([data], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url; a.download = `backup-creaktif-${new Date().toISOString().split('T')[0]}.json`;
            a.click(); URL.revokeObjectURL(url);
          }} className="px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">Backup JSON complet</button>
        </div>
      </div>
    </div>
  );
}

function exportCSV(filename: string, data: Record<string, any>[]) {
  if (data.length === 0) return;
  const headers = Object.keys(data[0]);
  const csv = [headers.join(','), ...data.map(row => headers.map(h => `"${String(row[h] || '').replace(/"/g, '""')}"`).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`;
  a.click(); URL.revokeObjectURL(url);
}
