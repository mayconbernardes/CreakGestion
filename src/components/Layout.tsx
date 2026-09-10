import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import {
  LayoutDashboard, Users, Target, Briefcase, FolderKanban, FileText,
  Receipt, CreditCard, RefreshCw, CheckSquare, BarChart3, Settings,
  Menu, X, LogOut, Search, Bell, Globe
} from 'lucide-react';
import type { InvoiceLanguage } from '../types';
import { languageNames } from '../i18n';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Tableau de bord' },
  { path: '/clients', icon: Users, label: 'Clients' },
  { path: '/leads', icon: Target, label: 'Prospects / CRM' },
  { path: '/services', icon: Briefcase, label: 'Services' },
  { path: '/projects', icon: FolderKanban, label: 'Projets' },
  { path: '/quotes', icon: FileText, label: 'Devis' },
  { path: '/invoices', icon: Receipt, label: 'Factures' },
  { path: '/payments', icon: CreditCard, label: 'Paiements' },
  { path: '/contracts', icon: RefreshCw, label: 'Maintenance' },
  { path: '/tasks', icon: CheckSquare, label: 'Tâches' },
  { path: '/reports', icon: BarChart3, label: 'Rapports' },
  { path: '/settings', icon: Settings, label: 'Paramètres' },
];

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { currentUser, logout, settings, invoiceLanguage, setLanguage, clients, invoices, quotes, projects } = useStore();

  const handleLogout = () => { logout(); navigate('/login'); };

  const searchResults = searchQuery.length > 1 ? {
    clients: clients.filter(c => `${c.firstName} ${c.lastName} ${c.company} ${c.email}`.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 5),
    invoices: invoices.filter(i => i.number.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 3),
    quotes: quotes.filter(q => q.number.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 3),
    projects: projects.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 3),
  } : null;

  const unreadNotifs = 3;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar overlay mobile */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      
      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-slate-900 to-slate-800 text-white transform transition-transform duration-200 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} flex flex-col`}>
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center font-bold text-sm">CK</div>
            <div>
              <h1 className="font-bold text-sm">{settings.name}</h1>
              <p className="text-xs text-slate-400">Gestion & Facturation</p>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                }`
              }
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-slate-700">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-xs font-bold">
              {currentUser?.name?.charAt(0) || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{currentUser?.name || 'Admin'}</p>
              <p className="text-xs text-slate-400">Administrateur</p>
            </div>
            <button onClick={handleLogout} className="text-slate-400 hover:text-white" title="Déconnexion">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-4 shrink-0">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden text-gray-600">
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          
          {/* Search */}
          <div className="flex-1 relative max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher clients, factures, projets..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setSearchOpen(true); }}
              onFocus={() => setSearchOpen(true)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {searchOpen && searchResults && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-80 overflow-y-auto">
                {searchResults.clients.length > 0 && (
                  <div className="p-2">
                    <p className="text-xs font-semibold text-gray-500 px-2 mb-1">Clients</p>
                    {searchResults.clients.map(c => (
                      <button key={c.id} onClick={() => { navigate(`/clients/${c.id}`); setSearchOpen(false); setSearchQuery(''); }}
                        className="w-full text-left px-2 py-1.5 text-sm hover:bg-gray-50 rounded">
                        {c.firstName} {c.lastName} {c.company && `— ${c.company}`}
                      </button>
                    ))}
                  </div>
                )}
                {searchResults.invoices.length > 0 && (
                  <div className="p-2 border-t">
                    <p className="text-xs font-semibold text-gray-500 px-2 mb-1">Factures</p>
                    {searchResults.invoices.map(i => (
                      <button key={i.id} onClick={() => { navigate(`/invoices/${i.id}`); setSearchOpen(false); setSearchQuery(''); }}
                        className="w-full text-left px-2 py-1.5 text-sm hover:bg-gray-50 rounded">
                        {i.number}
                      </button>
                    ))}
                  </div>
                )}
                {searchResults.projects.length > 0 && (
                  <div className="p-2 border-t">
                    <p className="text-xs font-semibold text-gray-500 px-2 mb-1">Projets</p>
                    {searchResults.projects.map(p => (
                      <button key={p.id} onClick={() => { setSearchOpen(false); setSearchQuery(''); }}
                        className="w-full text-left px-2 py-1.5 text-sm hover:bg-gray-50 rounded">
                        {p.name}
                      </button>
                    ))}
                  </div>
                )}
                {searchResults.clients.length === 0 && searchResults.invoices.length === 0 && searchResults.projects.length === 0 && (
                  <p className="p-4 text-sm text-gray-500 text-center">Aucun résultat</p>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Language selector */}
            <select
              value={invoiceLanguage}
              onChange={(e) => setLanguage(e.target.value as InvoiceLanguage)}
              className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Object.entries(languageNames).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>

            {/* Notifications */}
            <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
              <Bell size={18} />
              {unreadNotifs > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
                  {unreadNotifs}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
