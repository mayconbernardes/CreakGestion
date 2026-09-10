import type { InvoiceLanguage } from '../types';

type TranslationKeys = {
  invoice: string;
  quote: string;
  number: string;
  date: string;
  dueDate: string;
  paymentDate: string;
  validUntil: string;
  billTo: string;
  from: string;
  description: string;
  quantity: string;
  unitPrice: string;
  discount: string;
  taxRate: string;
  amount: string;
  subtotal: string;
  totalTax: string;
  total: string;
  totalHT: string;
  totalTTC: string;
  amountPaid: string;
  amountDue: string;
  paymentTerms: string;
  notes: string;
  status: string;
  paid: string;
  unpaid: string;
  partiallyPaid: string;
  overdue: string;
  draft: string;
  sent: string;
  cancelled: string;
  page: string;
  of: string;
  currency: string;
  thankYou: string;
  contactUs: string;
  bankDetails: string;
  iban: string;
  bic: string;
  legalMentions: string;
  lateFees: string;
  fixedIndemnity: string;
  noDiscount: string;
};

const translations: Record<InvoiceLanguage, TranslationKeys> = {
  fr: {
    invoice: 'FACTURE',
    quote: 'DEVIS',
    number: 'Numéro',
    date: 'Date',
    dueDate: 'Date d\'échéance',
    paymentDate: 'Date de paiement',
    validUntil: 'Valide jusqu\'au',
    billTo: 'Facturer à',
    from: 'De',
    description: 'Description',
    quantity: 'Qté',
    unitPrice: 'Prix unitaire',
    discount: 'Remise',
    taxRate: 'TVA',
    amount: 'Montant',
    subtotal: 'Sous-total',
    totalTax: 'TVA',
    total: 'Total',
    totalHT: 'Total HT',
    totalTTC: 'Total TTC',
    amountPaid: 'Déjà payé',
    amountDue: 'Reste à payer',
    paymentTerms: 'Conditions de paiement',
    notes: 'Notes',
    status: 'Statut',
    paid: 'Payée',
    unpaid: 'Impayée',
    partiallyPaid: 'Partiellement payée',
    overdue: 'En retard',
    draft: 'Brouillon',
    sent: 'Envoyée',
    cancelled: 'Annulée',
    page: 'Page',
    of: 'de',
    currency: '€',
    thankYou: 'Merci pour votre confiance.',
    contactUs: 'Nous restons à votre disposition pour toute question.',
    bankDetails: 'Coordonnées bancaires',
    iban: 'IBAN',
    bic: 'BIC',
    legalMentions: 'Mentions légales',
    lateFees: 'Pénalités de retard: 3x le taux d\'intérêt légal',
    fixedIndemnity: 'Indemnité forfaitaire de recouvrement: 40€',
    noDiscount: 'Escompte pour paiement anticipé: néant',
  },
  en: {
    invoice: 'INVOICE',
    quote: 'QUOTE',
    number: 'Number',
    date: 'Date',
    dueDate: 'Due date',
    paymentDate: 'Payment date',
    validUntil: 'Valid until',
    billTo: 'Bill to',
    from: 'From',
    description: 'Description',
    quantity: 'Qty',
    unitPrice: 'Unit price',
    discount: 'Discount',
    taxRate: 'Tax',
    amount: 'Amount',
    subtotal: 'Subtotal',
    totalTax: 'Tax',
    total: 'Total',
    totalHT: 'Subtotal',
    totalTTC: 'Total (incl. tax)',
    amountPaid: 'Amount paid',
    amountDue: 'Amount due',
    paymentTerms: 'Payment terms',
    notes: 'Notes',
    status: 'Status',
    paid: 'Paid',
    unpaid: 'Unpaid',
    partiallyPaid: 'Partially paid',
    overdue: 'Overdue',
    draft: 'Draft',
    sent: 'Sent',
    cancelled: 'Cancelled',
    page: 'Page',
    of: 'of',
    currency: '€',
    thankYou: 'Thank you for your business.',
    contactUs: 'Please do not hesitate to contact us for any questions.',
    bankDetails: 'Bank details',
    iban: 'IBAN',
    bic: 'BIC/SWIFT',
    legalMentions: 'Legal notices',
    lateFees: 'Late payment penalties: 3x the legal interest rate',
    fixedIndemnity: 'Fixed recovery indemnity: €40',
    noDiscount: 'No discount for early payment',
  },
  pt: {
    invoice: 'FATURA',
    quote: 'ORÇAMENTO',
    number: 'Número',
    date: 'Data',
    dueDate: 'Data de vencimento',
    paymentDate: 'Data de pagamento',
    validUntil: 'Válido até',
    billTo: 'Faturar para',
    from: 'De',
    description: 'Descrição',
    quantity: 'Qtd',
    unitPrice: 'Preço unitário',
    discount: 'Desconto',
    taxRate: 'IVA',
    amount: 'Valor',
    subtotal: 'Subtotal',
    totalTax: 'IVA',
    total: 'Total',
    totalHT: 'Total s/ imposto',
    totalTTC: 'Total c/ imposto',
    amountPaid: 'Valor pago',
    amountDue: 'Valor pendente',
    paymentTerms: 'Condições de pagamento',
    notes: 'Notas',
    status: 'Estado',
    paid: 'Paga',
    unpaid: 'Não paga',
    partiallyPaid: 'Parcialmente paga',
    overdue: 'Vencida',
    draft: 'Rascunho',
    sent: 'Enviada',
    cancelled: 'Cancelada',
    page: 'Página',
    of: 'de',
    currency: '€',
    thankYou: 'Obrigado pela sua confiança.',
    contactUs: 'Não hesite em contactar-nos para qualquer questão.',
    bankDetails: 'Dados bancários',
    iban: 'IBAN',
    bic: 'BIC/SWIFT',
    legalMentions: 'Menções legais',
    lateFees: 'Penalidades por atraso: 3x a taxa de juro legal',
    fixedIndemnity: 'Indemnização fixa de cobrança: 40€',
    noDiscount: 'Sem desconto para pagamento antecipado',
  },
  es: {
    invoice: 'FACTURA',
    quote: 'PRESUPUESTO',
    number: 'Número',
    date: 'Fecha',
    dueDate: 'Fecha de vencimiento',
    paymentDate: 'Fecha de pago',
    validUntil: 'Válido hasta',
    billTo: 'Facturar a',
    from: 'De',
    description: 'Descripción',
    quantity: 'Cant.',
    unitPrice: 'Precio unitario',
    discount: 'Descuento',
    taxRate: 'IVA',
    amount: 'Importe',
    subtotal: 'Subtotal',
    totalTax: 'IVA',
    total: 'Total',
    totalHT: 'Total s/ impuesto',
    totalTTC: 'Total c/ impuesto',
    amountPaid: 'Importe pagado',
    amountDue: 'Importe pendiente',
    paymentTerms: 'Condiciones de pago',
    notes: 'Notas',
    status: 'Estado',
    paid: 'Pagada',
    unpaid: 'Impagada',
    partiallyPaid: 'Parcialmente pagada',
    overdue: 'Vencida',
    draft: 'Borrador',
    sent: 'Enviada',
    cancelled: 'Cancelada',
    page: 'Página',
    of: 'de',
    currency: '€',
    thankYou: 'Gracias por su confianza.',
    contactUs: 'No dude en contactarnos para cualquier consulta.',
    bankDetails: 'Datos bancarios',
    iban: 'IBAN',
    bic: 'BIC/SWIFT',
    legalMentions: 'Avisos legales',
    lateFees: 'Penalizaciones por retraso: 3x la tasa de interés legal',
    fixedIndemnity: 'Indemnización fija de cobro: 40€',
    noDiscount: 'Sin descuento por pago anticipado',
  },
};

export function t(lang: InvoiceLanguage): TranslationKeys {
  return translations[lang];
}

export const languageNames: Record<InvoiceLanguage, string> = {
  fr: 'Français',
  en: 'English',
  pt: 'Português',
  es: 'Español',
};
