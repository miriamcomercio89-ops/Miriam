import { OFFICE } from './state.js';
import { formatEuro } from '../data/money.js';
import { formatSelection } from './tickets.js';

/**
 * Genera un PDF mínimo (texto) sin dependencias.
 * Compatible con visores PDF básicos.
 */
export function downloadTicketPdf(ticket, business = OFFICE) {
  const lines = [
    business.businessName,
    `${business.town} · ${business.employee}`,
    '--------------------------------',
    `Ticket ${ticket.id}`,
    ticket.productName,
    `Cliente: ${ticket.clientName || '—'}`,
    `Apuesta: ${formatSelection(ticket)}`,
    ticket.drawYmd ? `Sorteo: ${ticket.drawYmd}` : 'Rasca / instantáneo',
    `Precio: ${formatEuro(ticket.priceCents)}`,
    ticket.checkedAt != null
      ? `Comprobado: ${ticket.checkDetail || ''} · ${formatEuro(ticket.prizeCents || 0)}`
      : 'Pendiente de comprobar',
    '--------------------------------',
    'Fan-made / no oficial · +18',
    'Juego responsable',
  ];

  const pdf = buildSimplePdf(lines);
  const blob = new Blob([pdf], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ticket-${ticket.id}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function downloadSaleReceiptPdf({ items, totalCents, clientName, method, tickets }) {
  const lines = [
    OFFICE.businessName,
    `Álora · Miriam`,
    '======== TICKET DE VENTA ========',
    `Cliente: ${clientName || '—'}`,
    `Pago: ${method}`,
    '--------------------------------',
    ...items.map((i) => `${i.name} x${i.qty}  ${formatEuro(i.unitCents * i.qty)}`),
    '--------------------------------',
    `TOTAL  ${formatEuro(totalCents)}`,
  ];
  if (tickets?.length) {
    lines.push('Tickets:');
    for (const t of tickets) {
      lines.push(`- ${t.id} ${t.productName} ${formatSelection(t)}`);
    }
  }
  lines.push('Fan-made / no oficial · +18');

  const pdf = buildSimplePdf(lines);
  const blob = new Blob([pdf], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `venta-${Date.now()}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function buildSimplePdf(lines) {
  // PDF con una página A4, fuente Helvetica, texto simple
  const escaped = lines.map((l) => escapePdfText(String(l).slice(0, 90)));
  let y = 800;
  const contentParts = ['BT /F1 11 Tf 50 800 Td'];
  escaped.forEach((line, i) => {
    if (i === 0) contentParts.push(`(${line}) Tj`);
    else contentParts.push(`0 -16 Td (${line}) Tj`);
  });
  contentParts.push('ET');
  const stream = contentParts.join('\n');
  const objects = [];
  objects.push('1 0 obj<< /Type /Catalog /Pages 2 0 R >>endobj\n');
  objects.push('2 0 obj<< /Type /Pages /Kids [3 0 R] /Count 1 >>endobj\n');
  objects.push(
    '3 0 obj<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources<< /Font<< /F1 5 0 R >> >> >>endobj\n',
  );
  objects.push(`4 0 obj<< /Length ${stream.length} >>stream\n${stream}\nendstream\nendobj\n`);
  objects.push('5 0 obj<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>endobj\n');

  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  for (const obj of objects) {
    offsets.push(pdf.length);
    pdf += obj;
  }
  const xrefPos = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += '0000000000 65535 f \n';
  for (let i = 1; i < offsets.length; i++) {
    pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }
  pdf += `trailer<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefPos}\n%%EOF`;
  return pdf;
}

function escapePdfText(s) {
  return s.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}
