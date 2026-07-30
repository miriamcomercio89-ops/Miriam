import { OFFICE } from './state.js';
import { formatEuro } from '../data/money.js';
import { formatSelection } from './tickets.js';

/**
 * PDF de texto mejorado (v0.8): Helvetica + Bold, márgenes, líneas más largas.
 */

export function downloadTicketPdf(ticket, business = OFFICE) {
  const lines = [
    { text: business.businessName, bold: true, size: 14 },
    { text: `${business.town} · ${business.employee}` },
    { text: '--------------------------------' },
    { text: `Ticket ${ticket.id}`, bold: true },
    { text: ticket.productName, bold: true },
    { text: `Org: ${ticket.org || '—'}` },
    { text: `Cliente: ${ticket.clientName || '—'}` },
    { text: `Apuesta: ${formatSelection(ticket)}` },
    ticket.numberSource ? { text: `Origen números: ${ticket.numberSource}` } : null,
    ticket.drawYmd ? { text: `Sorteo: ${ticket.drawYmd}` } : { text: 'Rasca / instantáneo' },
    { text: `Precio: ${formatEuro(ticket.priceCents)}`, bold: true },
    ticket.saleMethod ? { text: `Venta: ${ticket.saleMethod}` } : null,
    ticket.checkedAt != null
      ? { text: `Comprobado: ${ticket.checkDetail || ''} · ${formatEuro(ticket.prizeCents || 0)}` }
      : { text: 'Pendiente de comprobar' },
    ticket.paidAt != null ? { text: `Pagado: ${formatEuro(ticket.prizeCents || 0)}` } : null,
    ticket.drawSnapshot ? { text: `Resultado sorteo: ${ticket.drawSnapshot}` } : null,
    { text: '--------------------------------' },
    { text: 'Fan-made / no oficial · +18' },
    { text: 'Juego responsable' },
  ].filter(Boolean);

  downloadLinesPdf(lines, `ticket-${ticket.id}.pdf`);
}

export function downloadSaleReceiptPdf({ items, totalCents, clientName, method, tickets }) {
  const lines = [
    { text: OFFICE.businessName, bold: true, size: 14 },
    { text: 'Álora · Miriam' },
    { text: '======== TICKET DE VENTA ========', bold: true },
    { text: `Cliente: ${clientName || '—'}` },
    { text: `Pago: ${method}` },
    { text: '--------------------------------' },
    ...items.map((i) => ({ text: `${i.name} x${i.qty}  ${formatEuro(i.unitCents * i.qty)}` })),
    { text: '--------------------------------' },
    { text: `TOTAL  ${formatEuro(totalCents)}`, bold: true, size: 13 },
  ];
  if (tickets?.length) {
    lines.push({ text: 'Tickets emitidos', bold: true });
    for (const t of tickets) {
      lines.push({ text: `- ${t.id} ${t.productName}` });
      lines.push({ text: `  ${formatSelection(t)}` });
    }
  }
  lines.push({ text: '--------------------------------' }, { text: 'Fan-made / no oficial · +18' });
  downloadLinesPdf(lines, `venta-${Date.now()}.pdf`);
}

function normalizeLines(lines) {
  return lines
    .filter(Boolean)
    .map((l) => {
      if (typeof l === 'string') return { text: l, bold: false, size: 11 };
      return { text: String(l.text ?? ''), bold: !!l.bold, size: l.size || (l.bold ? 12 : 11) };
    });
}

function buildSimplePdf(rawLines) {
  const lines = normalizeLines(rawLines);
  const maxChars = 95;
  let y = 800;
  const ops = ['BT'];
  let first = true;
  for (const line of lines) {
    const font = line.bold ? '/F2' : '/F1';
    const size = line.size || 11;
    const text = escapePdfText(String(line.text).slice(0, maxChars));
    if (first) {
      ops.push(`${font} ${size} Tf 48 ${y} Td (${text}) Tj`);
      first = false;
    } else {
      const gap = line.bold && size >= 13 ? 20 : 15;
      ops.push(`0 -${gap} Td ${font} ${size} Tf (${text}) Tj`);
    }
  }
  ops.push('ET');
  const stream = ops.join('\n');
  const objects = [];
  objects.push('1 0 obj<< /Type /Catalog /Pages 2 0 R >>endobj\n');
  objects.push('2 0 obj<< /Type /Pages /Kids [3 0 R] /Count 1 >>endobj\n');
  objects.push(
    '3 0 obj<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources<< /Font<< /F1 5 0 R /F2 6 0 R >> >> >>endobj\n',
  );
  objects.push(`4 0 obj<< /Length ${stream.length} >>stream\n${stream}\nendstream\nendobj\n`);
  objects.push('5 0 obj<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>endobj\n');
  objects.push('6 0 obj<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>endobj\n');

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

function downloadLinesPdf(lines, filename) {
  const pdf = buildSimplePdf(lines);
  const blob = new Blob([pdf], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function downloadStatsPdf(state) {
  const s = state.stats || {};
  const f = state.finance || {};
  const lines = [
    { text: OFFICE.businessName, bold: true, size: 14 },
    { text: `${OFFICE.town} · ${OFFICE.employee}` },
    { text: '===== ESTADÍSTICAS DE PARTIDA =====', bold: true },
    { text: `Versión juego: ${state.gameVersion || '?'}` },
    {
      text: `Fecha juego: ${new Date(state.clock?.gameTimeMs || Date.now()).toISOString().slice(0, 10)}`,
    },
    { text: '--------------------------------' },
    { text: `Días jugados: ${s.daysPlayed ?? 0}` },
    { text: `Ventas totales: ${formatEuro(s.totalSalesCents || 0)}` },
    { text: `Comisiones totales: ${formatEuro(s.totalCommissionCents || 0)}` },
    { text: `Premios pagados: ${formatEuro(s.totalPrizesPaidCents || 0)}` },
    { text: `Faltantes de caja: ${formatEuro(s.totalShortageCents || 0)}` },
    { text: `Sobrantes de caja: ${formatEuro(s.totalSurplusCents || 0)}` },
    { text: `Clientes atendidos: ${s.totalCustomers ?? 0}` },
    { text: `Alertas premio alto: ${s.highPrizesAlerted ?? 0}` },
    { text: '--------------------------------' },
    { text: `Banco actual: ${formatEuro(f.bankCents || 0)}`, bold: true },
    { text: `Ventas hoy: ${formatEuro(f.daySalesCents || 0)}` },
    { text: `Comisión hoy: ${formatEuro(f.dayCommissionCents || 0)}` },
    { text: `Clientes hoy: ${state.customers?.servedToday ?? 0}` },
    { text: '--------------------------------' },
    { text: 'Fan-made / no oficial · +18' },
  ];
  downloadLinesPdf(lines, `estadisticas-alora-${Date.now()}.pdf`);
}

export function downloadWeeklyPdf(weekly) {
  const lines = [
    { text: OFFICE.businessName, bold: true, size: 14 },
    { text: '===== EXTRACTO SEMANAL =====', bold: true },
    { text: `${weekly.fromYmd} → ${weekly.toYmd}` },
    { text: '--------------------------------' },
    { text: `Ventas: ${formatEuro(weekly.sales)}` },
    { text: `Comisiones: ${formatEuro(weekly.commission)}` },
    { text: `Premios: ${formatEuro(weekly.prizes)}` },
    { text: `Gastos: ${formatEuro(weekly.expenses)}` },
    { text: `Faltantes: ${formatEuro(weekly.shortage)}` },
    { text: `Liquidaciones: ${weekly.settlements}` },
    { text: `Neto (com.−gastos−falt.): ${formatEuro(weekly.net)}`, bold: true },
    { text: '--------------------------------' },
    { text: 'Fan-made / no oficial · +18' },
  ];
  downloadLinesPdf(lines, `extracto-semanal-${weekly.toYmd}.pdf`);
}

export function downloadDayClosePdf(summary) {
  const settle = summary.settlement;
  const lines = [
    { text: OFFICE.businessName, bold: true, size: 14 },
    { text: '===== CIERRE DEL DÍA =====', bold: true },
    { text: `Fecha: ${summary.date}` },
    { text: `Siguiente laborable: ${summary.nextDay}` },
    { text: '--------------------------------' },
    { text: `Ventas: ${formatEuro(summary.salesCents)}` },
    { text: `Comisiones: ${formatEuro(summary.commissionCents)}`, bold: true },
    { text: `Beneficio (com.−gastos−falt.): ${formatEuro(summary.profitCents)}`, bold: true },
    { text: `Premios pagados: ${formatEuro(summary.prizesPaidCents)}` },
    { text: `Gastos: ${formatEuro(summary.expensesCents)}` },
    { text: `Faltantes: ${formatEuro(summary.shortageCents || 0)}` },
    { text: `Sobrantes: ${formatEuro(summary.surplusCents || 0)}` },
    { text: `Clientes: ${summary.customersServed}` },
    { text: `Cajón: ${formatEuro(summary.drawerCents)}` },
    { text: `Banco: ${formatEuro(summary.bankCents)}` },
    { text: '--------------------------------' },
  ];
  if (settle) {
    lines.push({ text: 'Liquidación (remesa = ventas − comisión)', bold: true });
    lines.push({
      text: `LAE  ventas ${formatEuro(settle.lae?.sales || 0)} · com. ${formatEuro(settle.lae?.commission || 0)} · remesa ${formatEuro(settle.lae?.remittance || 0)}`,
    });
    lines.push({
      text: `ONCE ventas ${formatEuro(settle.once?.sales || 0)} · com. ${formatEuro(settle.once?.commission || 0)} · remesa ${formatEuro(settle.once?.remittance || 0)}`,
    });
    lines.push({
      text: `Otros ventas ${formatEuro(settle.otros?.sales || 0)} · com. ${formatEuro(settle.otros?.commission || 0)} · remesa ${formatEuro(settle.otros?.remittance || 0)}`,
    });
    const reimb =
      (settle.lae?.prizesReimbursed || 0) +
      (settle.once?.prizesReimbursed || 0) +
      (settle.otros?.prizesReimbursed || 0);
    lines.push({ text: `Reembolso premios: ${formatEuro(reimb)}` });
    lines.push({ text: `Delta banco neto: ${formatEuro(settle.netBankDelta || 0)}`, bold: true });
    lines.push({ text: '--------------------------------' });
  }
  if (summary.nextDayReasonSkip?.length) {
    lines.push({ text: `Días saltados: ${summary.nextDayReasonSkip.join(', ')}` });
  }
  lines.push({ text: 'Fan-made / no oficial · +18' });
  downloadLinesPdf(lines, `cierre-${summary.date}.pdf`);
}

export function downloadMonthlyPdf(statement) {
  const lines = [
    { text: OFFICE.businessName, bold: true, size: 14 },
    { text: `Liquidación mensual — ${statement.label}`, bold: true },
    { text: '--------------------------------' },
    { text: `Ventas totales: ${formatEuro(statement.totalSales)}` },
    { text: `Comisiones: ${formatEuro(statement.totalCommission)}`, bold: true },
    { text: `Premios pagados: ${formatEuro(statement.totalPrizes)}` },
    { text: `Gastos local: ${formatEuro(statement.expenses)}` },
    { text: `Proveedor: ${formatEuro(statement.supplier)}` },
    { text: `Faltantes: ${formatEuro(statement.shortage)}` },
    { text: `Sobrantes: ${formatEuro(statement.surplus || 0)}` },
    {
      text: `Neto mes: ${formatEuro(statement.netMonth ?? statement.totalCommission - statement.expenses - statement.shortage)}`,
      bold: true,
    },
    { text: '--------------------------------' },
    { text: 'Remesa = ventas − comisión retenida', bold: true },
  ];
  for (const org of ['LAE', 'ONCE', 'Otros']) {
    const o = statement.orgs[org];
    lines.push({ text: org, bold: true });
    lines.push({ text: `  Ventas ${formatEuro(o.sales)} · Com. ${formatEuro(o.commission)}` });
    lines.push({ text: `  Remesa ${formatEuro(o.remittance)} · Premios ${formatEuro(o.prizes)}` });
  }
  lines.push({ text: '--------------------------------' }, { text: 'Fan-made / no oficial · +18' });
  downloadLinesPdf(lines, `liquidacion-mensual-${statement.year}-${statement.month + 1}.pdf`);
}
