/**
 * Asigna flota mixta amplia a cada operador según sus servicios.
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
    let list = [...pool.values()];
    if (list.length === 0) {
      return { ...op, flota: [] };
    }

    // Preferir bases + algo de variantes
    const bases = list.filter((u) => u.variante === "base" || !u.variante);
    const variants = list.filter((u) => u.variante && u.variante !== "base");
    list = [...bases, ...variants];

    // Nacionales/metropolitanos: más variedad; urbanos: menos
    const maxByTipo = {
      nacional: 22,
      internacional: 16,
      regional: 14,
      metropolitano: 16,
      urbano: 10,
      especializado: 12,
    };
    const target = Math.min(list.length, maxByTipo[op.tipo] || 12);

    const flota = [];
    for (let i = 0; i < list.length && flota.length < target; i++) {
      const unit = list[(idx * 5 + i * 7) % list.length];
      if (flota.find((f) => f.unidad_id === unit.id)) continue;
      const peso = unit.servicios.filter((s) => op.servicios.includes(s)).length;
      const isBase = unit.variante === "base" || !unit.variante;
      flota.push({
        unidad_id: unit.id,
        nombre: unit.nombre,
        workshop_ref: unit.workshop_ref,
        categoria: unit.categoria,
        papel: isBase && peso >= 1 ? (peso >= 2 ? "principal" : "secundario") : "variante",
        unidades_estimadas: 6 + ((idx + i * 11) % 50) + peso * 5 + (isBase ? 8 : 0),
      });
    }

    // Garantizar al menos 2 principales si hay bases
    const principales = flota.filter((f) => f.papel === "principal");
    if (principales.length < 2) {
      for (const f of flota) {
        if (f.papel !== "principal") f.papel = "principal";
        if (flota.filter((x) => x.papel === "principal").length >= 2) break;
      }
    }

    return { ...op, flota };
  });
}
