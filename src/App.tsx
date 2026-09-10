import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import ClientDetail from './pages/ClientDetail';
import Leads from './pages/Leads';
import Services from './pages/Services';
import Projects from './pages/Projects';
import Quotes from './pages/Quotes';
import Invoices from './pages/Invoices';
import InvoiceDetail from './pages/InvoiceDetail';
import Payments from './pages/Payments';
import Contracts from './pages/Contracts';
import Tasks from './pages/Tasks';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const currentUser = useStore((s) => s.currentUser);
  if (!currentUser) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="clients" element={<Clients />} />
          <Route path="clients/:id" element={<ClientDetail />} />
          <Route path="leads" element={<Leads />} />
          <Route path="services" element={<Services />} />
          <Route path="projects" element={<Projects />} />
          <Route path="quotes" element={<Quotes />} />
          <Route path="invoices" element={<Invoices />} />
          <Route path="invoices/:id" element={<InvoiceDetail />} />
          <Route path="payments" element={<Payments />} />
          <Route path="contracts" element={<Contracts />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
