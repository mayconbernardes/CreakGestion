// ============================================
// CREA'KTIF — Types & Interfaces
// ============================================

export type ClientStatus = 'prospect' | 'lead' | 'actif' | 'inactif' | 'ancien';
export type ClientType = 'particulier' | 'entreprise';
export type LeadStage = 'nouveau' | 'contacte' | 'qualification' | 'proposition' | 'negociation' | 'gagne' | 'perdu';
export type ProjectStatus = 'a_planifier' | 'planifie' | 'en_cours' | 'attente_client' | 'en_revision' | 'termine' | 'annule';
export type ProjectPriority = 'basse' | 'normale' | 'haute' | 'urgente';
export type QuoteStatus = 'brouillon' | 'envoye' | 'vu' | 'accepte' | 'refuse' | 'expire' | 'annule';
export type InvoiceStatus = 'brouillon' | 'envoyee' | 'partiellement_payee' | 'payee' | 'en_retard' | 'annulee' | 'avoir';
export type PaymentMethod = 'virement' | 'carte' | 'especes' | 'cheque' | 'paypal' | 'stripe' | 'autre';
export type RecurringFrequency = 'mensuelle' | 'trimestrielle' | 'semestrielle' | 'annuelle';
export type TaskStatus = 'a_faire' | 'en_cours' | 'termine';
export type TaskPriority = 'basse' | 'normale' | 'haute' | 'urgente';
export type UserRole = 'admin' | 'manager' | 'employee' | 'viewer';
export type DocumentType = 'contrat' | 'devis' | 'facture' | 'cahier_charges' | 'technique' | 'autre';
export type InvoiceLanguage = 'fr' | 'en' | 'pt' | 'es';

export interface Client {
  id: string;
  type: ClientType;
  firstName: string;
  lastName: string;
  company: string;
  commercialName: string;
  siren: string;
  siret: string;
  tvaIntra: string;
  legalForm: string;
  sector: string;
  email: string;
  phone: string;
  phone2: string;
  whatsapp: string;
  website: string;
  address: string;
  addressComplement: string;
  postalCode: string;
  city: string;
  country: string;
  leadSource: string;
  status: ClientStatus;
  createdAt: string;
  lastContact: string;
  assignedTo: string;
  notes: string;
  tags: string[];
}

export interface Lead {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  source: string;
  serviceInterest: string;
  estimatedBudget: number;
  probability: number;
  nextAction: string;
  nextActionDate: string;
  notes: string;
  stage: LeadStage;
  createdAt: string;
  updatedAt: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  category: string;
  defaultPrice: number;
  unit: string;
  taxRate: number;
  estimatedDuration: string;
  active: boolean;
}

export interface Project {
  id: string;
  clientId: string;
  name: string;
  description: string;
  serviceId: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  startDate: string;
  expectedEndDate: string;
  actualEndDate: string;
  budget: number;
  invoicedAmount: number;
  paidAmount: number;
  assignedTo: string;
  notes: string;
  createdAt: string;
  siteInfo?: SiteInfo;
}

export interface SiteInfo {
  url: string;
  domain: string;
  registrar: string;
  host: string;
  cms: string;
  framework: string;
  launchDate: string;
  domainExpiry: string;
  ssl: boolean;
  maintenance: boolean;
  backup: boolean;
  technicalNotes: string;
}

export interface QuoteItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  taxRate: number;
  subtotal: number;
  taxAmount: number;
  total: number;
}

export interface Quote {
  id: string;
  number: string;
  clientId: string;
  projectId: string;
  date: string;
  validUntil: string;
  title: string;
  description: string;
  items: QuoteItem[];
  subtotal: number;
  discount: number;
  taxAmount: number;
  total: number;
  paymentTerms: string;
  notes: string;
  status: QuoteStatus;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  taxRate: number;
  subtotal: number;
  taxAmount: number;
  total: number;
}

export interface Invoice {
  id: string;
  number: string;
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
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  invoiceId: string;
  clientId: string;
  amount: number;
  paymentDate: string;
  method: PaymentMethod;
  reference: string;
  notes: string;
  createdAt: string;
}

export interface RecurringContract {
  id: string;
  clientId: string;
  serviceId: string;
  name: string;
  amount: number;
  frequency: RecurringFrequency;
  startDate: string;
  nextDueDate: string;
  status: 'actif' | 'suspendu' | 'annule';
  notes: string;
  createdAt: string;
}

export interface Document {
  id: string;
  name: string;
  type: DocumentType;
  clientId: string;
  projectId: string;
  quoteId: string;
  invoiceId: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
}

export interface Note {
  id: string;
  content: string;
  clientId: string;
  projectId: string;
  createdAt: string;
  updatedAt: string;
  author: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string;
  clientId: string;
  projectId: string;
  assignedTo: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  entity: string;
  entityId: string;
  details: string;
  ip: string;
  createdAt: string;
}

export interface EmailLog {
  id: string;
  to: string;
  subject: string;
  template: string;
  status: 'envoye' | 'echec' | 'en_attente';
  error: string;
  createdAt: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  type: 'devis' | 'facture' | 'projet' | 'rappel';
  subject: string;
  body: string;
  language: InvoiceLanguage;
}

export interface CompanySettings {
  name: string;
  commercialName: string;
  address: string;
  postalCode: string;
  city: string;
  country: string;
  phone: string;
  email: string;
  website: string;
  siren: string;
  siret: string;
  tvaIntra: string;
  legalForm: string;
  rcs: string;
  logo: string;
  iban: string;
  bic: string;
  paymentTerms: string;
  legalMentions: string;
  currency: string;
  defaultTaxRate: number;
  invoicePrefix: string;
  quotePrefix: string;
  invoiceStartNumber: number;
  quoteStartNumber: number;
}

export interface Notification {
  id: string;
  type: 'invoice_due' | 'invoice_overdue' | 'quote_expiring' | 'task_due' | 'maintenance_due';
  title: string;
  message: string;
  entityId: string;
  read: boolean;
  createdAt: string;
}

export interface TimelineEvent {
  id: string;
  clientId: string;
  type: string;
  title: string;
  description: string;
  date: string;
  entityId?: string;
}
