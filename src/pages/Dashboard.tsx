import { useStore } from '../store';
import { TrendingUp, Users, FileText, Receipt, FolderKanban, Clock, AlertTriangle, Euro } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from 'recharts';
import { format, isAfter, isBefore, parseISO, startOfMonth, subMonths } from 'date-fns';

export default function Dashboard() {
  const { clients, invoices, quotes, projects, payments, contracts, currentUser } = useStore();
  
  const now = new Date();
  const monthStart = startOfMonth(now);
  
  // Financial calculations
  const totalRevenue = invoices.filter(i => i.status === 'payee').reduce((s, i) => s + i.amountPaid, 0);
  const monthRevenue = invoices.filter(i => i.status === 'payee' && i.paymentDate && parseISO(i.paymentDate) >= monthStart).reduce((s, i) => s + i.amountPaid, 0);
  const pendingInvoices = invoices.filter(i => ['envoyee', 'partiellement_payee'].includes(i.status));
  const overdueInvoices = invoices.filter(i => i.status === 'en_retard' || (i.dueDate && isBefore(parseISO(i.dueDate), now) && i.amountDue > 0 && !['payee', 'annulee'].includes(i.status)));
  const paidInvoices = invoices.filter(i => i.status === 'payee');
  const pendingQuotes = quotes.filter(q => ['brouillon', 'envoye', 'vu'].includes(q.status));
  const acceptedQuotes = quotes.filter(q => q.status === 'accepte');
  const activeProjects = projects.filter(p => ['en_cours', 'planifie', 'attente_client', 'en_revision'].includes(p.status));
  const finishedProjects = projects.filter(p => p.status === 'termine');
  const recurringRevenue = contracts.filter(c => c.status === 'actif').reduce((s, c) => {
    const mult = c.frequency === 'mensuelle' ? 1 : c.frequency === 'trimestrielle' ? 1/3 : c.frequency === 'semestrielle' ? 1/6 : 1/12;
    return s + c.amount * mult;
  }, 0);

  // Chart data - monthly revenue
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const date = subMonths(now, 5 - i);
    const month = format(date, 'MMM');
    const rev = payments.filter(p => {
      const pd = parseISO(p.paymentDate);
      return pd.getMonth() === date.getMonth() && pd.getFullYear() === date.getFullYear();
    }).reduce((s, p) => s + p.amount, 0);
    return { month, revenue: rev };
  });

  // Invoice status distribution
  const statusData = [
    { name: 'Payées', value: paidInvoices.length, color: '#22c55e' },
    { name: 'En attente', value: pendingInvoices.length, color: '#f59e0b' },
    { name: 'En retard', value: overdueInvoices.length, color: '#ef4444' },
    { name: 'Brouillon', value: invoices.filter(i => i.status === 'brouillon').length, color: '#6b7280' },
  ].filter(d => d.value > 0);

  // Project status
  const projectData = [
    { name: 'En cours', value: activeProjects.length, color: '#3b82f6' },
    { name: 'Terminés', value: finishedProjects.length, color: '#22c55e' },
    { name: 'À planifier', value: projects.filter(p => p.status === 'a_planifier').length, color: '#f59e0b' },
  ].filter(d => d.value > 0);

  const formatEur = (n: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n);

  const stats = [
    { label: 'CA ce mois', value: formatEur(monthRevenue), icon: Euro, color: 'bg-blue-500', change: '+12%' },
    { label: 'Factures en attente', value: pendingInvoices.length, icon: Clock, color: 'bg-amber-500', change: `${formatEur(pendingInvoices.reduce((s, i) => s + i.amountDue, 0))}` },
    { label: 'Factures en retard', value: overdueInvoices.length, icon: AlertTriangle, color: 'bg-red-500', change: `${formatEur(overdueInvoices.reduce((s, i) => s + i.amountDue, 0))}` },
    { label: 'Clients actifs', value: clients.filter(c => c.status === 'actif').length, icon: Users, color: 'bg-green-500', change: `${clients.length} total` },
    { label: 'Projets en cours', value: activeProjects.length, icon: FolderKanban, color: 'bg-purple-500', change: `${finishedProjects.length} terminés` },
    { label: 'Revenus récurrents', value: formatEur(recurringRevenue), icon: TrendingUp, color: 'bg-indigo-500', change: '/mois' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Bonjour, {currentUser?.name || 'Admin'} 👋</h1>
        <p className="text-gray-500 mt-1">Voici un aperçu de votre activité</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-9 h-9 ${stat.color} rounded-lg flex items-center justify-center`}>
                <stat.icon size={18} className="text-white" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
            <p className="text-xs text-gray-400 mt-0.5">{stat.change}</p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue chart */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4">Revenus mensuels</h3>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip formatter={(v: number) => formatEur(v)} />
              <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fill="url(#colorRev)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Invoice status */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4">Statut des factures</h3>
          {statusData.length > 0 ? (
            <div className="flex items-center gap-6">
              <ResponsiveContainer width="50%" height={200}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={2}>
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
                    <span className="text-sm font-semibold text-gray-800 ml-auto">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-gray-400 text-sm">Aucune facture</div>
          )}
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Overdue invoices */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <AlertTriangle size={16} className="text-red-500" /> Factures à relancer
          </h3>
          <div className="space-y-2">
            {overdueInvoices.slice(0, 5).map(inv => {
              const client = clients.find(c => c.id === inv.clientId);
              return (
                <div key={inv.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{inv.number}</p>
                    <p className="text-xs text-gray-500">{client ? `${client.firstName} ${client.lastName}` : '—'}</p>
                  </div>
                  <span className="text-sm font-semibold text-red-600">{formatEur(inv.amountDue)}</span>
                </div>
              );
            })}
            {overdueInvoices.length === 0 && <p className="text-sm text-gray-400 py-4 text-center">Aucune facture en retard ✓</p>}
          </div>
        </div>

        {/* Active projects */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <FolderKanban size={16} className="text-blue-500" /> Projets en cours
          </h3>
          <div className="space-y-2">
            {activeProjects.slice(0, 5).map(p => {
              const client = clients.find(c => c.id === p.clientId);
              return (
                <div key={p.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{p.name}</p>
                    <p className="text-xs text-gray-500">{client ? `${client.firstName} ${client.lastName}` : '—'}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    p.status === 'en_cours' ? 'bg-blue-100 text-blue-700' :
                    p.status === 'en_revision' ? 'bg-amber-100 text-amber-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>{p.status.replace('_', ' ')}</span>
                </div>
              );
            })}
            {activeProjects.length === 0 && <p className="text-sm text-gray-400 py-4 text-center">Aucun projet en cours</p>}
          </div>
        </div>

        {/* Recent payments */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Receipt size={16} className="text-green-500" /> Paiements récents
          </h3>
          <div className="space-y-2">
            {payments.slice(-5).reverse().map(p => {
              const client = clients.find(c => c.id === p.clientId);
              return (
                <div key={p.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{formatEur(p.amount)}</p>
                    <p className="text-xs text-gray-500">{client ? `${client.firstName} ${client.lastName}` : '—'}</p>
                  </div>
                  <span className="text-xs text-gray-400">{p.paymentDate ? format(parseISO(p.paymentDate), 'dd/MM/yy') : ''}</span>
                </div>
              );
            })}
            {payments.length === 0 && <p className="text-sm text-gray-400 py-4 text-center">Aucun paiement enregistré</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
