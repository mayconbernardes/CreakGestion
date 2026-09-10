import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type {
  Client, Lead, Service, Project, Quote, Invoice, Payment,
  RecurringContract, Document, Note, Task, AuditLog, EmailLog,
  EmailTemplate, CompanySettings, Notification, TimelineEvent,
  ClientStatus, LeadStage, ProjectStatus, QuoteStatus, InvoiceStatus,
  InvoiceLanguage
} from '../types';

// Default company settings
const defaultSettings: CompanySettings = {
  name: "CREA'KTIF Web & Digital",
  commercialName: "CREA'KTIF",
  address: '',
  postalCode: '',
  city: '',
  country: 'France',
  phone: '',
  email: '',
  website: '',
  siren: '',
  siret: '',
  tvaIntra: '',
  legalForm: '',
  rcs: '',
  logo: '',
  iban: '',
  bic: '',
  paymentTerms: 'Paiement à 30 jours',
  legalMentions: "En cas de retard de paiement, des pénalités de retard au taux de 3 fois le taux d'intérêt légal seront appliquées. Pas d'escompte pour paiement anticipé. Indemnité forfaitaire pour frais de recouvrement: 40€.",
  currency: 'EUR',
  defaultTaxRate: 20,
  invoicePrefix: 'FAC',
  quotePrefix: 'DEV',
  invoiceStartNumber: 1,
  quoteStartNumber: 1,
};

// Default services
const defaultServices: Service[] = [
  { id: uuidv4(), name: 'Création de site web', description: 'Site vitrine ou e-commerce sur mesure', category: 'Web', defaultPrice: 2500, unit: 'projet', taxRate: 20, estimatedDuration: '4-6 semaines', active: true },
  { id: uuidv4(), name: 'Refonte de site', description: 'Modernisation et redesign de site existant', category: 'Web', defaultPrice: 1800, unit: 'projet', taxRate: 20, estimatedDuration: '3-5 semaines', active: true },
  { id: uuidv4(), name: 'Landing page', description: 'Page unique optimisée conversion', category: 'Web', defaultPrice: 800, unit: 'page', taxRate: 20, estimatedDuration: '1-2 semaines', active: true },
  { id: uuidv4(), name: 'Application web', description: 'Application web sur mesure', category: 'Dev', defaultPrice: 5000, unit: 'projet', taxRate: 20, estimatedDuration: '8-12 semaines', active: true },
  { id: uuidv4(), name: 'Application mobile', description: 'App iOS/Android native ou cross-platform', category: 'Dev', defaultPrice: 8000, unit: 'projet', taxRate: 20, estimatedDuration: '10-16 semaines', active: true },
  { id: uuidv4(), name: 'Menu digital', description: 'Menu numérique pour restaurants', category: 'Digital', defaultPrice: 600, unit: 'projet', taxRate: 20, estimatedDuration: '1-2 semaines', active: true },
  { id: uuidv4(), name: 'SEO', description: 'Optimisation référencement naturel', category: 'Marketing', defaultPrice: 500, unit: 'mois', taxRate: 20, estimatedDuration: 'Continu', active: true },
  { id: uuidv4(), name: 'Maintenance site', description: 'Maintenance et mises à jour', category: 'Support', defaultPrice: 150, unit: 'mois', taxRate: 20, estimatedDuration: 'Continu', active: true },
  { id: uuidv4(), name: 'Hébergement', description: 'Hébergement web sécurisé', category: 'Infrastructure', defaultPrice: 50, unit: 'mois', taxRate: 20, estimatedDuration: 'Continu', active: true },
  { id: uuidv4(), name: 'Sécurité', description: 'Audit et renforcement sécurité', category: 'Sécurité', defaultPrice: 800, unit: 'projet', taxRate: 20, estimatedDuration: '1-2 semaines', active: true },
  { id: uuidv4(), name: 'Performance', description: 'Optimisation vitesse et Core Web Vitals', category: 'Optimisation', defaultPrice: 600, unit: 'projet', taxRate: 20, estimatedDuration: '1-2 semaines', active: true },
  { id: uuidv4(), name: 'Automatisation', description: 'Automatisation de processus', category: 'Dev', defaultPrice: 1200, unit: 'projet', taxRate: 20, estimatedDuration: '2-4 semaines', active: true },
  { id: uuidv4(), name: 'API / Intégration', description: 'Développement et intégration API', category: 'Dev', defaultPrice: 1500, unit: 'projet', taxRate: 20, estimatedDuration: '2-3 semaines', active: true },
  { id: uuidv4(), name: 'Conseil informatique', description: 'Consulting et audit technique', category: 'Conseil', defaultPrice: 100, unit: 'heure', taxRate: 20, estimatedDuration: 'Variable', active: true },
];

// Default email templates
const defaultTemplates: EmailTemplate[] = [
  { id: uuidv4(), name: 'Envoi de devis', type: 'devis', subject: 'Votre devis {{quote.number}} — CREA\'KTIF Web & Digital', body: 'Bonjour {{client.firstName}},\n\nVeuillez trouver ci-joint votre devis {{quote.number}} d\'un montant de {{quote.total}} €.\n\nCe devis est valable jusqu\'au {{quote.validUntil}}.\n\nN\'hésitez pas à me contacter pour toute question.\n\nCordialement,\nCREA\'KTIF Web & Digital', language: 'fr' },
  { id: uuidv4(), name: 'Envoi de facture', type: 'facture', subject: 'Votre facture {{invoice.number}} — CREA\'KTIF Web & Digital', body: 'Bonjour {{client.firstName}},\n\nVeuillez trouver ci-joint votre facture {{invoice.number}} d\'un montant de {{invoice.total}} €.\n\nDate d\'échéance : {{invoice.dueDate}}\n\nMerci pour votre confiance.\n\nCordialement,\nCREA\'KTIF Web & Digital', language: 'fr' },
  { id: uuidv4(), name: 'Rappel paiement', type: 'rappel', subject: 'Rappel — Facture {{invoice.number}} en attente', body: 'Bonjour {{client.firstName}},\n\nSauf erreur de notre part, la facture {{invoice.number}} d\'un montant de {{invoice.amountDue}} € arrive à échéance le {{invoice.dueDate}}.\n\nMerci de bien vouloir procéder au règlement.\n\nCordialement,\nCREA\'KTIF Web & Digital', language: 'fr' },
  { id: uuidv4(), name: 'Projet commencé', type: 'projet', subject: 'Votre projet "{{project.name}}" a démarré', body: 'Bonjour {{client.firstName}},\n\nNous avons le plaisir de vous informer que votre projet "{{project.name}}" a démarré.\n\nNous vous tiendrons informé de l\'avancement.\n\nCordialement,\nCREA\'KTIF Web & Digital', language: 'fr' },
];

interface AppState {
  // Data
  clients: Client[];
  leads: Lead[];
  services: Service[];
  projects: Project[];
  quotes: Quote[];
  invoices: Invoice[];
  payments: Payment[];
  contracts: RecurringContract[];
  documents: Document[];
  notes: Note[];
  tasks: Task[];
  auditLogs: AuditLog[];
  emailLogs: EmailLog[];
  emailTemplates: EmailTemplate[];
  notifications: Notification[];
  timeline: TimelineEvent[];
  settings: CompanySettings;
  currentUser: { id: string; name: string; role: string } | null;
  invoiceLanguage: InvoiceLanguage;

  // Actions
  setLanguage: (lang: InvoiceLanguage) => void;
  addClient: (client: Omit<Client, 'id' | 'createdAt'>) => Client;
  updateClient: (id: string, data: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  addLead: (lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => Lead;
  updateLead: (id: string, data: Partial<Lead>) => void;
  deleteLead: (id: string) => void;
  updateLeadStage: (id: string, stage: LeadStage) => void;
  addService: (service: Omit<Service, 'id'>) => Service;
  updateService: (id: string, data: Partial<Service>) => void;
  deleteService: (id: string) => void;
  addProject: (project: Omit<Project, 'id' | 'createdAt'>) => Project;
  updateProject: (id: string, data: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  addQuote: (quote: Omit<Quote, 'id' | 'number' | 'createdAt' | 'updatedAt'>) => Quote;
  updateQuote: (id: string, data: Partial<Quote>) => void;
  deleteQuote: (id: string) => void;
  addInvoice: (invoice: Omit<Invoice, 'id' | 'number' | 'createdAt' | 'updatedAt'>) => Invoice;
  updateInvoice: (id: string, data: Partial<Invoice>) => void;
  deleteInvoice: (id: string) => void;
  addPayment: (payment: Omit<Payment, 'id' | 'createdAt'>) => Payment;
  deletePayment: (id: string) => void;
  addContract: (contract: Omit<RecurringContract, 'id' | 'createdAt'>) => RecurringContract;
  updateContract: (id: string, data: Partial<RecurringContract>) => void;
  deleteContract: (id: string) => void;
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => Note;
  updateNote: (id: string, data: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => Task;
  updateTask: (id: string, data: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  updateSettings: (data: Partial<CompanySettings>) => void;
  updateEmailTemplate: (id: string, data: Partial<EmailTemplate>) => void;
  addTimelineEvent: (event: Omit<TimelineEvent, 'id'>) => void;
  markNotificationRead: (id: string) => void;
  addAuditLog: (log: Omit<AuditLog, 'id' | 'createdAt'>) => void;
  login: (name: string) => void;
  logout: () => void;
  getClientFinancials: (clientId: string) => { totalInvoiced: number; totalPaid: number; totalDue: number };
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      clients: [],
      leads: [],
      services: defaultServices,
      projects: [],
      quotes: [],
      invoices: [],
      payments: [],
      contracts: [],
      documents: [],
      notes: [],
      tasks: [],
      auditLogs: [],
      emailLogs: [],
      emailTemplates: defaultTemplates,
      notifications: [],
      timeline: [],
      settings: defaultSettings,
      currentUser: null,
      invoiceLanguage: 'fr',

      setLanguage: (lang) => set({ invoiceLanguage: lang }),

      addClient: (data) => {
        const client: Client = { ...data, id: uuidv4(), createdAt: new Date().toISOString() };
        set((s) => ({ clients: [...s.clients, client] }));
        get().addAuditLog({ userId: get().currentUser?.id || '', action: 'create', entity: 'client', entityId: client.id, details: `Client créé: ${client.firstName} ${client.lastName}`, ip: '' });
        get().addTimelineEvent({ clientId: client.id, type: 'client_created', title: 'Client créé', description: `${client.firstName} ${client.lastName} a été ajouté`, date: new Date().toISOString() });
        return client;
      },
      updateClient: (id, data) => set((s) => ({ clients: s.clients.map(c => c.id === id ? { ...c, ...data } : c) })),
      deleteClient: (id) => set((s) => ({ clients: s.clients.filter(c => c.id !== id) })),

      addLead: (data) => {
        const lead: Lead = { ...data, id: uuidv4(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
        set((s) => ({ leads: [...s.leads, lead] }));
        return lead;
      },
      updateLead: (id, data) => set((s) => ({ leads: s.leads.map(l => l.id === id ? { ...l, ...data, updatedAt: new Date().toISOString() } : l) })),
      deleteLead: (id) => set((s) => ({ leads: s.leads.filter(l => l.id !== id) })),
      updateLeadStage: (id, stage) => set((s) => ({ leads: s.leads.map(l => l.id === id ? { ...l, stage, updatedAt: new Date().toISOString() } : l) })),

      addService: (data) => {
        const service: Service = { ...data, id: uuidv4() };
        set((s) => ({ services: [...s.services, service] }));
        return service;
      },
      updateService: (id, data) => set((s) => ({ services: s.services.map(sv => sv.id === id ? { ...sv, ...data } : sv) })),
      deleteService: (id) => set((s) => ({ services: s.services.filter(sv => sv.id !== id) })),

      addProject: (data) => {
        const project: Project = { ...data, id: uuidv4(), createdAt: new Date().toISOString() };
        set((s) => ({ projects: [...s.projects, project] }));
        get().addTimelineEvent({ clientId: project.clientId, type: 'project_created', title: 'Projet créé', description: project.name, date: new Date().toISOString(), entityId: project.id });
        return project;
      },
      updateProject: (id, data) => set((s) => ({ projects: s.projects.map(p => p.id === id ? { ...p, ...data } : p) })),
      deleteProject: (id) => set((s) => ({ projects: s.projects.filter(p => p.id !== id) })),

      addQuote: (data) => {
        const settings = get().settings;
        const count = get().quotes.filter(q => q.number.includes(new Date().getFullYear().toString())).length + 1;
        const number = `${settings.quotePrefix}-${new Date().getFullYear()}-${String(count).padStart(4, '0')}`;
        const quote: Quote = { ...data, id: uuidv4(), number, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
        set((s) => ({ quotes: [...s.quotes, quote] }));
        get().addTimelineEvent({ clientId: quote.clientId, type: 'quote_created', title: 'Devis créé', description: number, date: new Date().toISOString(), entityId: quote.id });
        return quote;
      },
      updateQuote: (id, data) => {
        set((s) => ({ quotes: s.quotes.map(q => q.id === id ? { ...q, ...data, updatedAt: new Date().toISOString() } : q) }));
        if (data.status) {
          const quote = get().quotes.find(q => q.id === id);
          if (quote) get().addTimelineEvent({ clientId: quote.clientId, type: 'quote_status', title: `Devis ${data.status}`, description: `${quote.number} — ${data.status}`, date: new Date().toISOString(), entityId: id });
        }
      },
      deleteQuote: (id) => set((s) => ({ quotes: s.quotes.filter(q => q.id !== id) })),

      addInvoice: (data) => {
        const settings = get().settings;
        const count = get().invoices.filter(i => i.number.includes(new Date().getFullYear().toString())).length + 1;
        const number = `${settings.invoicePrefix}-${new Date().getFullYear()}-${String(count).padStart(4, '0')}`;
        const invoice: Invoice = { ...data, id: uuidv4(), number, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
        set((s) => ({ invoices: [...s.invoices, invoice] }));
        get().addTimelineEvent({ clientId: invoice.clientId, type: 'invoice_created', title: 'Facture créée', description: number, date: new Date().toISOString(), entityId: invoice.id });
        return invoice;
      },
      updateInvoice: (id, data) => {
        set((s) => ({ invoices: s.invoices.map(i => i.id === id ? { ...i, ...data, updatedAt: new Date().toISOString() } : i) }));
        if (data.status) {
          const inv = get().invoices.find(i => i.id === id);
          if (inv) get().addTimelineEvent({ clientId: inv.clientId, type: 'invoice_status', title: `Facture ${data.status}`, description: `${inv.number} — ${data.status}`, date: new Date().toISOString(), entityId: id });
        }
      },
      deleteInvoice: (id) => set((s) => ({ invoices: s.invoices.filter(i => i.id !== id) })),

      addPayment: (data) => {
        const payment: Payment = { ...data, id: uuidv4(), createdAt: new Date().toISOString() };
        set((s) => {
          const invoice = s.invoices.find(i => i.id === data.invoiceId);
          if (!invoice) return { payments: [...s.payments, payment] };
          const newAmountPaid = invoice.amountPaid + data.amount;
          let newStatus: InvoiceStatus = 'partiellement_payee';
          if (newAmountPaid >= invoice.total) newStatus = 'payee';
          const updatedInvoices = s.invoices.map(i => i.id === data.invoiceId ? { ...i, amountPaid: newAmountPaid, amountDue: i.total - newAmountPaid, status: newStatus, paymentDate: newAmountPaid >= i.total ? data.paymentDate : i.paymentDate } : i);
          return { payments: [...s.payments, payment], invoices: updatedInvoices };
        });
        get().addTimelineEvent({ clientId: data.clientId, type: 'payment_received', title: 'Paiement reçu', description: `${data.amount} €`, date: data.paymentDate });
        return payment;
      },
      deletePayment: (id) => set((s) => ({ payments: s.payments.filter(p => p.id !== id) })),

      addContract: (data) => {
        const contract: RecurringContract = { ...data, id: uuidv4(), createdAt: new Date().toISOString() };
        set((s) => ({ contracts: [...s.contracts, contract] }));
        return contract;
      },
      updateContract: (id, data) => set((s) => ({ contracts: s.contracts.map(c => c.id === id ? { ...c, ...data } : c) })),
      deleteContract: (id) => set((s) => ({ contracts: s.contracts.filter(c => c.id !== id) })),

      addNote: (data) => {
        const note: Note = { ...data, id: uuidv4(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
        set((s) => ({ notes: [...s.notes, note] }));
        return note;
      },
      updateNote: (id, data) => set((s) => ({ notes: s.notes.map(n => n.id === id ? { ...n, ...data, updatedAt: new Date().toISOString() } : n) })),
      deleteNote: (id) => set((s) => ({ notes: s.notes.filter(n => n.id !== id) })),

      addTask: (data) => {
        const task: Task = { ...data, id: uuidv4(), createdAt: new Date().toISOString() };
        set((s) => ({ tasks: [...s.tasks, task] }));
        return task;
      },
      updateTask: (id, data) => set((s) => ({ tasks: s.tasks.map(t => t.id === id ? { ...t, ...data } : t) })),
      deleteTask: (id) => set((s) => ({ tasks: s.tasks.filter(t => t.id !== id) })),

      updateSettings: (data) => set((s) => ({ settings: { ...s.settings, ...data } })),
      updateEmailTemplate: (id, data) => set((s) => ({ emailTemplates: s.emailTemplates.map(t => t.id === id ? { ...t, ...data } : t) })),

      addTimelineEvent: (event) => {
        const e: TimelineEvent = { ...event, id: uuidv4() };
        set((s) => ({ timeline: [...s.timeline, e] }));
      },

      markNotificationRead: (id) => set((s) => ({ notifications: s.notifications.map(n => n.id === id ? { ...n, read: true } : n) })),

      addAuditLog: (log) => {
        const entry: AuditLog = { ...log, id: uuidv4(), createdAt: new Date().toISOString() };
        set((s) => ({ auditLogs: [...s.auditLogs, entry] }));
      },

      login: (name) => set({ currentUser: { id: uuidv4(), name, role: 'admin' } }),
      logout: () => set({ currentUser: null }),

      getClientFinancials: (clientId) => {
        const invoices = get().invoices.filter(i => i.clientId === clientId);
        const totalInvoiced = invoices.reduce((sum, i) => sum + i.total, 0);
        const totalPaid = invoices.reduce((sum, i) => sum + i.amountPaid, 0);
        const totalDue = totalInvoiced - totalPaid;
        return { totalInvoiced, totalPaid, totalDue };
      },
    }),
    { name: 'creaktif-storage' }
  )
);
