/**
 * Asigna flota mixta a cada operador según sus servicios.
 */
export function assignFleets(operators, fleetUnits) {
  const byService = new Map();
  for (const unit of fleetUnits) {
    for (const s of unit.servicios) {
      if (!byService.has(s)) byService.set(s, []);
      byService.get(s).push(unit);
    }
  }

  return operators.map((op, idx) => {
    const pool = new Map();
    for (const s of op.servicios) {
      for (const unit of byService.get(s) || []) {
        pool.set(unit.id, unit);
      }
    }
    const list = [...pool.values()];
    if (list.length === 0) {
      return { ...op, flota: [] };
    }

    // Variedad: 3–8 unidades según amplitud de servicios
    const target = Math.min(list.length, Math.max(3, Math.min(8, op.servicios.length + 2)));
    const flota = [];
    for (let i = 0; i < target; i++) {
      const unit = list[(idx * 3 + i * 5) % list.length];
      if (!flota.find((f) => f.unidad_id === unit.id)) {
        const peso = unit.servicios.filter((s) => op.servicios.includes(s)).length;
        flota.push({
          unidad_id: unit.id,
          nombre: unit.nombre,
          workshop_ref: unit.workshop_ref,
          papel: peso >= 2 ? "principal" : "secundario",
          unidades_estimadas: 8 + ((idx + i * 7) % 40) + peso * 4,
        });
      }
    }
    return { ...op, flota };
  });
}
