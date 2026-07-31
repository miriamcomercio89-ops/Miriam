import { OFFICE } from './state.js';
import { formatEuro } from '../data/money.js';
import { formatSelection } from './tickets.js';
import { PRIZE_MGMT_STATUS, PAPERWORK_BY_STATUS, ensureCasePaperwork } from './prizes.js';

/**
 * PDF con estilo: cabeceras de color, tipografía grande, formato claro.
 * PDF 1.4 nativo (sin jsPDF).
 */

const THEME = {
  brand: [0.05, 0.45, 0.48],
  accent: [0.94, 0.64, 0.01],
  coral: [0.91, 0.42, 0.36],
  ink: [0.09, 0.2, 0.23],
  muted: [0.35, 0.45, 0.48],
  ok: [0.11, 0.54, 0.35],
  soft: [0.9, 0.96, 0.95],
  cream: [1, 0.97, 0.92],
};

export function downloadTicketPdf(ticket, business = OFFICE) {
  const blocks = [
    headerBlock('TICKET DE JUEGO', business),
    { type: 'space', h: 10 },
    { type: 'kv', k: 'Ticket', v: ticket.id, bold: true },
    { type: 'kv', k: 'Producto', v: ticket.productName, bold: true },
    { type: 'kv', k: 'Organismo', v: ticket.org || '—' },
    { type: 'kv', k: 'Cliente', v: ticket.clientName || '—' },
    { type: 'kv', k: 'Apuesta', v: formatSelection(ticket) },
    ticket.numberSource ? { type: 'kv', k: 'Origen números', v: ticket.numberSource } : null,
    ticket.drawYmd ? { type: 'kv', k: 'Sorteo', v: ticket.drawYmd } : { type: 'kv', k: 'Tipo', v: 'Rasca / instantáneo' },
    { type: 'kv', k: 'Precio', v: formatEuro(ticket.priceCents), bold: true, color: THEME.brand },
    ticket.saleMethod ? { type: 'kv', k: 'Venta', v: ticket.saleMethod } : null,
    ticket.checkedAt != null
      ? { type: 'kv', k: 'Comprobado', v: `${ticket.checkDetail || ''} · ${formatEuro(ticket.prizeCents || 0)}` }
      : { type: 'kv', k: 'Estado', v: 'Pendiente de comprobar' },
    ticket.paidAt != null ? { type: 'kv', k: 'Pagado', v: formatEuro(ticket.prizeCents || 0), color: THEME.ok } : null,
    ticket.drawSnapshot ? { type: 'kv', k: 'Resultado', v: ticket.drawSnapshot } : null,
    footerBlock(),
  ].filter(Boolean);
  downloadStyledPdf(blocks, `ticket-${ticket.id}.pdf`);
}

export function downloadSaleReceiptPdf({ items, totalCents, clientName, method, tickets }) {
  const blocks = [
    headerBlock('TICKET DE VENTA', OFFICE),
    { type: 'space', h: 8 },
    { type: 'kv', k: 'Cliente', v: clientName || '—' },
    { type: 'kv', k: 'Pago', v: method },
    { type: 'rule' },
    ...items.map((i) => ({
      type: 'line',
      text: `${i.name}  ×${i.qty}   ${formatEuro(i.unitCents * i.qty)}`,
      size: 13,
    })),
    { type: 'rule' },
    { type: 'banner', text: `TOTAL  ${formatEuro(totalCents)}`, color: THEME.brand },
  ];
  if (tickets?.length) {
    blocks.push({ type: 'space', h: 8 }, { type: 'h2', text: 'Tickets emitidos' });
    for (const t of tickets) {
      blocks.push({ type: 'line', text: `${t.id} · ${t.productName}`, size: 12, bold: true });
      blocks.push({ type: 'line', text: `   ${formatSelection(t)}`, size: 12, color: THEME.muted });
    }
  }
  blocks.push(footerBlock());
  downloadStyledPdf(blocks, `venta-${Date.now()}.pdf`);
}

export function downloadPrizeCasePdf(caseItem, ticket) {
  ensureCasePaperwork(caseItem);
  const blocks = [
    headerBlock('EXPEDIENTE DE PREMIO', OFFICE, THEME.coral),
    { type: 'space', h: 8 },
    { type: 'banner', text: `Caso ${caseItem.id}`, color: THEME.coral },
    { type: 'kv', k: 'Cliente', v: caseItem.clientName },
    { type: 'kv', k: 'Producto', v: caseItem.productName },
    { type: 'kv', k: 'Organismo', v: caseItem.org || '—' },
    { type: 'kv', k: 'Importe', v: formatEuro(caseItem.amountCents), bold: true, color: THEME.coral },
    { type: 'kv', k: 'Nivel', v: caseItem.level || '—' },
    { type: 'kv', k: 'Estado', v: PRIZE_MGMT_STATUS[caseItem.status] || caseItem.status, bold: true },
    { type: 'kv', k: 'Ticket', v: caseItem.ticketId || ticket?.id || '—' },
    caseItem.note ? { type: 'line', text: caseItem.note, size: 12, color: THEME.muted } : null,
    { type: 'space', h: 10 },
    { type: 'h2', text: 'Papeleo del expediente' },
  ].filter(Boolean);

  for (const [status, items] of Object.entries(PAPERWORK_BY_STATUS)) {
    blocks.push({
      type: 'line',
      text: `— ${PRIZE_MGMT_STATUS[status] || status} —`,
      bold: true,
      size: 13,
      color: THEME.brand,
    });
    for (const item of items) {
      const ok = !!caseItem.paperwork?.[status]?.[item.id];
      blocks.push({
        type: 'line',
        text: `${ok ? '[X]' : '[ ]'}  ${item.label}`,
        size: 12,
        color: ok ? THEME.ok : THEME.ink,
      });
    }
  }
  blocks.push(footerBlock());
  downloadStyledPdf(blocks, `expediente-premio-${caseItem.id}.pdf`);
}

export function downloadStatsPdf(state) {
  const s = state.stats || {};
  const f = state.finance || {};
  const blocks = [
    headerBlock('ESTADÍSTICAS DE PARTIDA', OFFICE),
    { type: 'kv', k: 'Versión', v: state.gameVersion || '?' },
    {
      type: 'kv',
      k: 'Fecha juego',
      v: new Date(state.clock?.gameTimeMs || Date.now()).toISOString().slice(0, 10),
    },
    { type: 'rule' },
    { type: 'kv', k: 'Días jugados', v: String(s.daysPlayed ?? 0) },
    { type: 'kv', k: 'Ventas totales', v: formatEuro(s.totalSalesCents || 0) },
    { type: 'kv', k: 'Comisiones', v: formatEuro(s.totalCommissionCents || 0), bold: true },
    { type: 'kv', k: 'Premios pagados', v: formatEuro(s.totalPrizesPaidCents || 0) },
    { type: 'kv', k: 'Faltantes', v: formatEuro(s.totalShortageCents || 0), color: THEME.coral },
    { type: 'kv', k: 'Sobrantes', v: formatEuro(s.totalSurplusCents || 0) },
    { type: 'kv', k: 'Clientes', v: String(s.totalCustomers ?? 0) },
    { type: 'kv', k: 'Alertas premio alto', v: String(s.highPrizesAlerted ?? 0) },
    { type: 'rule' },
    { type: 'kv', k: 'Banco', v: formatEuro(f.bankCents || 0), bold: true, color: THEME.brand },
    { type: 'kv', k: 'Ventas hoy', v: formatEuro(f.daySalesCents || 0) },
    { type: 'kv', k: 'Comisión hoy', v: formatEuro(f.dayCommissionCents || 0) },
    { type: 'kv', k: 'Clientes hoy', v: String(state.customers?.servedToday ?? 0) },
    footerBlock(),
  ];
  downloadStyledPdf(blocks, `estadisticas-alora-${Date.now()}.pdf`);
}

export function downloadWeeklyPdf(weekly) {
  const blocks = [
    headerBlock('EXTRACTO SEMANAL', OFFICE, THEME.accent),
    { type: 'line', text: `${weekly.fromYmd}  →  ${weekly.toYmd}`, size: 14, bold: true },
    { type: 'rule' },
    { type: 'kv', k: 'Ventas', v: formatEuro(weekly.sales) },
    { type: 'kv', k: 'Comisiones', v: formatEuro(weekly.commission), bold: true },
    { type: 'kv', k: 'Premios', v: formatEuro(weekly.prizes) },
    { type: 'kv', k: 'Gastos', v: formatEuro(weekly.expenses) },
    { type: 'kv', k: 'Faltantes', v: formatEuro(weekly.shortage), color: THEME.coral },
    { type: 'kv', k: 'Liquidaciones', v: String(weekly.settlements) },
    { type: 'banner', text: `Neto  ${formatEuro(weekly.net)}`, color: THEME.brand },
    footerBlock(),
  ];
  downloadStyledPdf(blocks, `extracto-semanal-${weekly.toYmd}.pdf`);
}

export function downloadDayClosePdf(summary) {
  const settle = summary.settlement;
  const blocks = [
    headerBlock('CIERRE DEL DÍA', OFFICE, THEME.brand),
    { type: 'kv', k: 'Fecha', v: summary.date, bold: true },
    { type: 'kv', k: 'Siguiente laborable', v: summary.nextDay },
    { type: 'rule' },
    { type: 'kv', k: 'Ventas', v: formatEuro(summary.salesCents) },
    { type: 'kv', k: 'Comisiones', v: formatEuro(summary.commissionCents), bold: true, color: THEME.brand },
    { type: 'kv', k: 'Beneficio', v: formatEuro(summary.profitCents), bold: true },
    { type: 'kv', k: 'Premios pagados', v: formatEuro(summary.prizesPaidCents) },
    { type: 'kv', k: 'Gastos', v: formatEuro(summary.expensesCents) },
    { type: 'kv', k: 'Faltantes', v: formatEuro(summary.shortageCents || 0), color: THEME.coral },
    { type: 'kv', k: 'Sobrantes', v: formatEuro(summary.surplusCents || 0) },
    { type: 'kv', k: 'Clientes', v: String(summary.customersServed) },
    { type: 'kv', k: 'Cajón', v: formatEuro(summary.drawerCents) },
    { type: 'kv', k: 'Banco', v: formatEuro(summary.bankCents), bold: true },
  ];
  if (settle) {
    blocks.push({ type: 'space', h: 8 }, { type: 'h2', text: 'Liquidación (remesa = ventas − comisión)' });
    for (const key of ['lae', 'once', 'otros']) {
      const o = settle[key];
      if (!o) continue;
      blocks.push({
        type: 'line',
        text: `${key.toUpperCase()}  ventas ${formatEuro(o.sales || 0)} · com. ${formatEuro(o.commission || 0)} · remesa ${formatEuro(o.remittance || 0)}`,
        size: 12,
      });
    }
    const reimb =
      (settle.lae?.prizesReimbursed || 0) +
      (settle.once?.prizesReimbursed || 0) +
      (settle.otros?.prizesReimbursed || 0);
    blocks.push({ type: 'kv', k: 'Reembolso premios', v: formatEuro(reimb) });
    blocks.push({ type: 'banner', text: `Delta banco  ${formatEuro(settle.netBankDelta || 0)}`, color: THEME.brand });
  }
  if (summary.nextDayReasonSkip?.length) {
    blocks.push({ type: 'line', text: `Días saltados: ${summary.nextDayReasonSkip.join(', ')}`, size: 12, color: THEME.muted });
  }
  blocks.push(footerBlock());
  downloadStyledPdf(blocks, `cierre-${summary.date}.pdf`);
}

export function downloadMonthlyPdf(statement) {
  const blocks = [
    headerBlock(`LIQUIDACIÓN MENSUAL — ${statement.label}`, OFFICE, THEME.accent),
    { type: 'kv', k: 'Ventas totales', v: formatEuro(statement.totalSales) },
    { type: 'kv', k: 'Comisiones', v: formatEuro(statement.totalCommission), bold: true, color: THEME.brand },
    { type: 'kv', k: 'Premios', v: formatEuro(statement.totalPrizes) },
    { type: 'kv', k: 'Gastos local', v: formatEuro(statement.expenses) },
    { type: 'kv', k: 'Proveedor', v: formatEuro(statement.supplier) },
    { type: 'kv', k: 'Faltantes', v: formatEuro(statement.shortage), color: THEME.coral },
    { type: 'kv', k: 'Sobrantes', v: formatEuro(statement.surplus || 0) },
    {
      type: 'banner',
      text: `Neto mes  ${formatEuro(statement.netMonth ?? statement.totalCommission - statement.expenses - statement.shortage)}`,
      color: THEME.brand,
    },
    { type: 'h2', text: 'Por organismo' },
  ];
  for (const org of ['LAE', 'ONCE', 'Otros']) {
    const o = statement.orgs[org];
    blocks.push({ type: 'line', text: org, bold: true, size: 14, color: THEME.brand });
    blocks.push({
      type: 'line',
      text: `  Ventas ${formatEuro(o.sales)} · Com. ${formatEuro(o.commission)} · Remesa ${formatEuro(o.remittance)} · Premios ${formatEuro(o.prizes)}`,
      size: 12,
    });
  }
  blocks.push(footerBlock());
  downloadStyledPdf(blocks, `liquidacion-mensual-${statement.year}-${statement.month + 1}.pdf`);
}

function headerBlock(title, business, color = THEME.brand) {
  return {
    type: 'header',
    title,
    subtitle: `${business.businessName} · ${business.town} · ${business.employee}`,
    color,
  };
}

function footerBlock() {
  return {
    type: 'footer',
    text: 'Fan-made / no oficial · Juego responsable · +18 · Loterías Álora',
  };
}

function escapePdfText(s) {
  // Helvetica Type1: ASCII seguro + sustitución de acentos frecuentes
  return String(s ?? '')
    .replace(/[áàäâ]/g, 'a')
    .replace(/[éèëê]/g, 'e')
    .replace(/[íìïî]/g, 'i')
    .replace(/[óòöô]/g, 'o')
    .replace(/[úùüû]/g, 'u')
    .replace(/[ÁÀÄÂ]/g, 'A')
    .replace(/[ÉÈËÊ]/g, 'E')
    .replace(/[ÍÌÏÎ]/g, 'I')
    .replace(/[ÓÒÖÔ]/g, 'O')
    .replace(/[ÚÙÜÛ]/g, 'U')
    .replace(/ñ/g, 'n')
    .replace(/Ñ/g, 'N')
    .replace(/€/g, 'EUR')
    .replace(/·/g, '-')
    .replace(/[^\x20-\x7E]/g, '?')
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');
}

function rgb(c) {
  return `${c[0].toFixed(3)} ${c[1].toFixed(3)} ${c[2].toFixed(3)}`;
}

function downloadStyledPdf(blocks, filename) {
  const pageW = 595;
  const pageH = 842;
  const margin = 40;
  let y = pageH - 48;
  const content = [];

  const drawRect = (x, yy, w, h, fill) => {
    content.push(`${rgb(fill)} rg ${x} ${yy} ${w} ${h} re f`);
  };

  for (const b of blocks) {
    if (!b) continue;
    if (b.type === 'space') {
      y -= b.h || 8;
      continue;
    }
    if (b.type === 'header') {
      drawRect(0, y - 8, pageW, 56, b.color || THEME.brand);
      content.push('BT');
      content.push(`/F2 18 Tf 1 1 1 rg ${margin} ${y + 18} Td (${escapePdfText(b.title)}) Tj`);
      content.push(`/F1 11 Tf 1 1 1 rg 0 -16 Td (${escapePdfText(b.subtitle)}) Tj`);
      content.push('ET');
      y -= 64;
      continue;
    }
    if (b.type === 'banner') {
      drawRect(margin - 4, y - 6, pageW - margin * 2 + 8, 28, b.color || THEME.brand);
      content.push('BT');
      content.push(`/F2 15 Tf 1 1 1 rg ${margin + 6} ${y + 2} Td (${escapePdfText(b.text)}) Tj`);
      content.push('ET');
      y -= 36;
      continue;
    }
    if (b.type === 'h2') {
      content.push('BT');
      content.push(`/F2 14 Tf ${rgb(THEME.brand)} rg ${margin} ${y} Td (${escapePdfText(b.text)}) Tj`);
      content.push('ET');
      y -= 22;
      continue;
    }
    if (b.type === 'rule') {
      content.push(`${rgb(THEME.brand)} RG 1.2 w ${margin} ${y} m ${pageW - margin} ${y} l S`);
      y -= 14;
      continue;
    }
    if (b.type === 'kv') {
      const k = escapePdfText(b.k);
      const v = escapePdfText(b.v);
      const col = b.color || THEME.ink;
      content.push('BT');
      content.push(`/F1 12 Tf ${rgb(THEME.muted)} rg ${margin} ${y} Td (${k}) Tj`);
      content.push(`${b.bold ? '/F2' : '/F1'} 13 Tf ${rgb(col)} rg 150 0 Td (${v}) Tj`);
      content.push('ET');
      y -= 20;
      continue;
    }
    if (b.type === 'line') {
      const col = b.color || THEME.ink;
      const size = b.size || 13;
      content.push('BT');
      content.push(`${b.bold ? '/F2' : '/F1'} ${size} Tf ${rgb(col)} rg ${margin} ${y} Td (${escapePdfText(b.text).slice(0, 90)}) Tj`);
      content.push('ET');
      y -= size + 6;
      continue;
    }
    if (b.type === 'footer') {
      y = Math.min(y, 56);
      content.push(`${rgb(THEME.muted)} RG 0.8 w ${margin} ${y + 14} m ${pageW - margin} ${y + 14} l S`);
      content.push('BT');
      content.push(`/F1 10 Tf ${rgb(THEME.muted)} rg ${margin} ${y} Td (${escapePdfText(b.text)}) Tj`);
      content.push('ET');
      y -= 16;
    }
    if (y < 60) break; // una página; suficiente para estos documentos
  }

  // Fondo crema suave arriba (detrás del header ya pintado)
  const stream = content.join('\n');
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
