/** Denominaciones en euros (céntimos para evitar errores de redondeo) */
export const COINS = [
  { id: 'c1', label: '1 cént.', cents: 1, kind: 'coin' },
  { id: 'c2', label: '2 cént.', cents: 2, kind: 'coin' },
  { id: 'c5', label: '5 cént.', cents: 5, kind: 'coin' },
  { id: 'c10', label: '10 cént.', cents: 10, kind: 'coin' },
  { id: 'c20', label: '20 cént.', cents: 20, kind: 'coin' },
  { id: 'c50', label: '50 cént.', cents: 50, kind: 'coin' },
  { id: 'e1', label: '1 €', cents: 100, kind: 'coin' },
  { id: 'e2', label: '2 €', cents: 200, kind: 'coin' },
];

export const BILLS = [
  { id: 'b5', label: '5 €', cents: 500, kind: 'bill' },
  { id: 'b10', label: '10 €', cents: 1000, kind: 'bill' },
  { id: 'b20', label: '20 €', cents: 2000, kind: 'bill' },
  { id: 'b50', label: '50 €', cents: 5000, kind: 'bill' },
  { id: 'b100', label: '100 €', cents: 10000, kind: 'bill' },
  { id: 'b200', label: '200 €', cents: 20000, kind: 'bill' },
  { id: 'b500', label: '500 €', cents: 50000, kind: 'bill' },
];

export const ALL_DENOMS = [...BILLS, ...COINS];

export function emptyDrawer() {
  const d = {};
  for (const x of ALL_DENOMS) d[x.id] = 0;
  return d;
}

/** Fondo de cambio típico al abrir el día */
export function defaultFloatDrawer() {
  return {
    b5: 10,
    b10: 8,
    b20: 6,
    b50: 2,
    b100: 0,
    b200: 0,
    b500: 0,
    e2: 15,
    e1: 20,
    c50: 20,
    c20: 25,
    c10: 30,
    c5: 40,
    c2: 50,
    c1: 50,
  };
}

export function drawerTotalCents(drawer) {
  return ALL_DENOMS.reduce((sum, d) => sum + (drawer[d.id] || 0) * d.cents, 0);
}

export function countTotalCents(counts) {
  return ALL_DENOMS.reduce((sum, d) => sum + (counts[d.id] || 0) * d.cents, 0);
}

export function formatEuro(cents) {
  const n = (cents / 100).toLocaleString('es-ES', {
    style: 'currency',
    currency: 'EUR',
  });
  return n;
}

export function cloneDrawer(drawer) {
  return { ...drawer };
}

/** Intenta construir cambio exacto con el contenido de la caja (greedy) */
export function makeChange(drawer, changeCents) {
  if (changeCents < 0) return null;
  if (changeCents === 0) return emptyDrawer();
  const sorted = [...ALL_DENOMS].sort((a, b) => b.cents - a.cents);
  const result = emptyDrawer();
  let remaining = changeCents;
  const temp = { ...drawer };
  for (const d of sorted) {
    const available = temp[d.id] || 0;
    const need = Math.floor(remaining / d.cents);
    const take = Math.min(available, need);
    if (take > 0) {
      result[d.id] = take;
      remaining -= take * d.cents;
      temp[d.id] -= take;
    }
  }
  if (remaining !== 0) return null;
  return result;
}

export function addToDrawer(drawer, counts) {
  const next = { ...drawer };
  for (const d of ALL_DENOMS) {
    next[d.id] = (next[d.id] || 0) + (counts[d.id] || 0);
  }
  return next;
}

export function removeFromDrawer(drawer, counts) {
  const next = { ...drawer };
  for (const d of ALL_DENOMS) {
    const n = (next[d.id] || 0) - (counts[d.id] || 0);
    if (n < 0) return null;
    next[d.id] = n;
  }
  return next;
}
