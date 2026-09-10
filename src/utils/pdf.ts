import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Invoice, CompanySettings, Client, InvoiceLanguage } from '../types';
import { t } from '../i18n';

export function generateInvoicePDF(invoice: Invoice, client: Client, settings: CompanySettings, lang: InvoiceLanguage): jsPDF {
  const tr = t(lang);
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  let y = margin;

  // Header - Company info
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 58, 138);
  doc.text(settings.name, margin, y + 6);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  y += 12;
  const companyLines = [
    settings.address ? `${settings.address}, ${settings.postalCode} ${settings.city}` : '',
    [settings.phone, settings.email].filter(Boolean).join(' | '),
    settings.website || '',
    [settings.siren ? `SIREN: ${settings.siren}` : '', settings.siret ? `SIRET: ${settings.siret}` : ''].filter(Boolean).join(' | '),
    settings.tvaIntra ? `TVA: ${settings.tvaIntra}` : '',
  ].filter(Boolean);
  companyLines.forEach(line => {
    doc.text(line, margin, y);
    y += 4;
  });

  // Invoice title and number
  y += 8;
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 58, 138);
  doc.text(tr.invoice, pageWidth - margin, y, { align: 'right' });
  
  y += 8;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);
  doc.text(`${tr.number}: ${invoice.number}`, pageWidth - margin, y, { align: 'right' });

  // Dates
  y += 12;
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  doc.text(`${tr.date}: ${formatDate(invoice.issueDate, lang)}`, margin, y);
  doc.text(`${tr.dueDate}: ${formatDate(invoice.dueDate, lang)}`, margin, y + 5);
  if (invoice.paymentDate) {
    doc.text(`${tr.paymentDate}: ${formatDate(invoice.paymentDate, lang)}`, margin, y + 10);
  }

  // Client info box
  const clientX = pageWidth / 2 + 10;
  doc.setDrawColor(220, 220, 220);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(clientX, y - 4, pageWidth - margin - clientX, 45, 2, 2, 'F');
  
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 58, 138);
  doc.text(tr.billTo, clientX + 4, y + 2);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 30, 30);
  let cy = y + 9;
  doc.text(`${client.firstName} ${client.lastName}`, clientX + 4, cy);
  cy += 5;
  if (client.company) {
    doc.setFont('helvetica', 'normal');
    doc.text(client.company, clientX + 4, cy);
    cy += 5;
  }
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  if (client.address) { doc.text(`${client.address}, ${client.postalCode} ${client.city}`, clientX + 4, cy); cy += 4; }
  if (client.email) { doc.text(client.email, clientX + 4, cy); cy += 4; }
  if (client.phone) { doc.text(client.phone, clientX + 4, cy); cy += 4; }
  if (client.tvaIntra) { doc.text(`TVA: ${client.tvaIntra}`, clientX + 4, cy); }

  // Items table
  y += 50;
  const tableData = invoice.items.map((item, idx) => [
    String(idx + 1),
    item.description,
    String(item.quantity),
    formatCurrency(item.unitPrice, settings.currency),
    item.discount > 0 ? `${item.discount}%` : '-',
    `${item.taxRate}%`,
    formatCurrency(item.total, settings.currency),
  ]);

  autoTable(doc, {
    startY: y,
    head: [['#', tr.description, tr.quantity, tr.unitPrice, tr.discount, tr.taxRate, tr.amount]],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [30, 58, 138], textColor: [255, 255, 255], fontSize: 8, fontStyle: 'bold' },
    bodyStyles: { fontSize: 8, textColor: [40, 40, 40] },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: margin, right: margin },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 'auto' },
      2: { cellWidth: 15, halign: 'center' },
      3: { cellWidth: 25, halign: 'right' },
      4: { cellWidth: 15, halign: 'center' },
      5: { cellWidth: 15, halign: 'center' },
      6: { cellWidth: 25, halign: 'right' },
    },
  });

  // Totals
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  const totalsX = pageWidth - margin - 65;
  
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  doc.text(`${tr.subtotal}:`, totalsX, finalY);
  doc.text(formatCurrency(invoice.subtotal - invoice.discount, settings.currency), pageWidth - margin, finalY, { align: 'right' });
  
  if (invoice.discount > 0) {
    doc.text(`${tr.discount}:`, totalsX, finalY + 6);
    doc.text(`-${formatCurrency(invoice.discount, settings.currency)}`, pageWidth - margin, finalY + 6, { align: 'right' });
  }

  const taxY = invoice.discount > 0 ? finalY + 12 : finalY + 6;
  doc.text(`${tr.totalTax} (${invoice.items.length > 0 ? invoice.items[0].taxRate : settings.defaultTaxRate}%):`, totalsX, taxY);
  doc.text(formatCurrency(invoice.taxAmount, settings.currency), pageWidth - margin, taxY, { align: 'right' });

  // Total TTC
  doc.setDrawColor(30, 58, 138);
  doc.setFillColor(30, 58, 138);
  doc.roundedRect(totalsX - 5, taxY + 6, 70, 12, 2, 2, 'F');
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text(`${tr.totalTTC}:`, totalsX, taxY + 14);
  doc.text(formatCurrency(invoice.total, settings.currency), pageWidth - margin, taxY + 14, { align: 'right' });

  // Payment status
  let statusY = taxY + 24;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  
  if (invoice.amountPaid > 0) {
    doc.text(`${tr.amountPaid}: ${formatCurrency(invoice.amountPaid, settings.currency)}`, totalsX, statusY);
    statusY += 5;
  }
  if (invoice.amountDue > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(220, 38, 38);
    doc.text(`${tr.amountDue}: ${formatCurrency(invoice.amountDue, settings.currency)}`, totalsX, statusY);
  }

  // Payment terms and bank details
  let bottomY = Math.max(statusY + 15, 240);
  if (bottomY > 265) { doc.addPage(); bottomY = margin; }
  
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 58, 138);
  doc.text(tr.paymentTerms, margin, bottomY);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  doc.text(invoice.paymentTerms || settings.paymentTerms, margin, bottomY + 4);

  if (settings.iban) {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 58, 138);
    doc.text(tr.bankDetails, margin, bottomY + 12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    doc.text(`${tr.iban}: ${settings.iban}`, margin, bottomY + 16);
    if (settings.bic) doc.text(`${tr.bic}: ${settings.bic}`, margin, bottomY + 20);
  }

  // Legal mentions
  if (settings.legalMentions) {
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    const mentions = doc.splitTextToSize(settings.legalMentions, pageWidth - 2 * margin);
    doc.text(mentions, margin, 280);
  }

  // Footer
  doc.setFontSize(7);
  doc.setTextColor(150, 150, 150);
  doc.text(`${settings.name} — ${settings.website || ''}`, pageWidth / 2, 292, { align: 'center' });

  return doc;
}

export function generateQuotePDF(quote: any, client: Client, settings: CompanySettings, lang: InvoiceLanguage): jsPDF {
  const tr = t(lang);
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  let y = margin;

  // Header
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 58, 138);
  doc.text(settings.name, margin, y + 6);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  y += 12;
  const companyLines = [
    settings.address ? `${settings.address}, ${settings.postalCode} ${settings.city}` : '',
    [settings.phone, settings.email].filter(Boolean).join(' | '),
  ].filter(Boolean);
  companyLines.forEach(line => { doc.text(line, margin, y); y += 4; });

  // Quote title
  y += 8;
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 58, 138);
  doc.text(tr.quote, pageWidth - margin, y, { align: 'right' });
  
  y += 8;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);
  doc.text(`${tr.number}: ${quote.number}`, pageWidth - margin, y, { align: 'right' });

  y += 12;
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  doc.text(`${tr.date}: ${formatDate(quote.date, lang)}`, margin, y);
  doc.text(`${tr.validUntil}: ${formatDate(quote.validUntil, lang)}`, margin, y + 5);

  // Client box
  const clientX = pageWidth / 2 + 10;
  doc.setDrawColor(220, 220, 220);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(clientX, y - 4, pageWidth - margin - clientX, 35, 2, 2, 'F');
  
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 58, 138);
  doc.text(tr.billTo, clientX + 4, y + 2);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 30, 30);
  doc.text(`${client.firstName} ${client.lastName}`, clientX + 4, y + 9);
  if (client.company) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(client.company, clientX + 4, y + 14);
  }

  // Items
  y += 42;
  const tableData = quote.items.map((item: any, idx: number) => [
    String(idx + 1),
    item.description,
    String(item.quantity),
    formatCurrency(item.unitPrice, settings.currency),
    item.discount > 0 ? `${item.discount}%` : '-',
    `${item.taxRate}%`,
    formatCurrency(item.total, settings.currency),
  ]);

  autoTable(doc, {
    startY: y,
    head: [['#', tr.description, tr.quantity, tr.unitPrice, tr.discount, tr.taxRate, tr.amount]],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [30, 58, 138], textColor: [255, 255, 255], fontSize: 8, fontStyle: 'bold' },
    bodyStyles: { fontSize: 8, textColor: [40, 40, 40] },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: margin, right: margin },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 'auto' },
      2: { cellWidth: 15, halign: 'center' },
      3: { cellWidth: 25, halign: 'right' },
      4: { cellWidth: 15, halign: 'center' },
      5: { cellWidth: 15, halign: 'center' },
      6: { cellWidth: 25, halign: 'right' },
    },
  });

  const finalY = (doc as any).lastAutoTable.finalY + 10;
  const totalsX = pageWidth - margin - 65;
  
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  doc.text(`${tr.subtotal}:`, totalsX, finalY);
  doc.text(formatCurrency(quote.subtotal - quote.discount, settings.currency), pageWidth - margin, finalY, { align: 'right' });
  
  doc.text(`${tr.totalTax}:`, totalsX, finalY + 6);
  doc.text(formatCurrency(quote.taxAmount, settings.currency), pageWidth - margin, finalY + 6, { align: 'right' });

  doc.setFillColor(30, 58, 138);
  doc.roundedRect(totalsX - 5, finalY + 10, 70, 12, 2, 2, 'F');
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text(`${tr.totalTTC}:`, totalsX, finalY + 18);
  doc.text(formatCurrency(quote.total, settings.currency), pageWidth - margin, finalY + 18, { align: 'right' });

  // Notes
  if (quote.notes) {
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    const notes = doc.splitTextToSize(`${tr.notes}: ${quote.notes}`, pageWidth - 2 * margin);
    doc.text(notes, margin, finalY + 30);
  }

  // Footer
  doc.setFontSize(7);
  doc.setTextColor(150, 150, 150);
  doc.text(`${settings.name} — ${settings.website || ''}`, pageWidth / 2, 292, { align: 'center' });

  return doc;
}

function formatDate(dateStr: string, lang: InvoiceLanguage): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const locales: Record<InvoiceLanguage, string> = { fr: 'fr-FR', en: 'en-GB', pt: 'pt-PT', es: 'es-ES' };
  return date.toLocaleDateString(locales[lang], { day: '2-digit', month: 'long', year: 'numeric' });
}

function formatCurrency(amount: number, currency: string): string {
  const cur = currency && currency.length === 3 ? currency : 'EUR';
  try {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: cur }).format(amount);
  } catch {
    return `${amount.toFixed(2)} €`;
  }
}
