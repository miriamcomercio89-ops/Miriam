/** Web Worker: tick de mercado + IA (sin DOM) */
/* eslint-disable no-restricted-globals */
self.onmessage = function (ev) {
  const { type, payload } = ev.data || {};
  if (type !== 'tickMarketAI') return;
  const { items, prices, demand, supply, inflationIndex, competitors, categoryCrisis, energyFloor, waterFloor } = payload;
  const newPrices = { ...prices };
  const newDemand = { ...demand };
  const newSupply = { ...supply };
  const crisis = categoryCrisis;

  for (let i = 0; i < items.length; i++) {
    const it = items[i];
    const base = it.basePrice * inflationIndex;
    let d = newDemand[it.id] || 1;
    let s = newSupply[it.id] || 1;
    if (crisis && it.category === crisis.category) {
      d *= crisis.demandMul || 1;
      s *= crisis.supplyMul || 1;
    }
    const pressure = d / Math.max(0.2, s);
    const target = base * Math.max(0.55, Math.min(2.0, 0.75 + pressure * 0.28));
    const cur = newPrices[it.id] ?? base;
    newPrices[it.id] = cur * 0.94 + target * 0.06;
    if (it.id === 'electricidad') newPrices[it.id] = Math.max(energyFloor * inflationIndex, newPrices[it.id]);
    if (it.id === 'agua_industrial') newPrices[it.id] = Math.max(waterFloor * inflationIndex, newPrices[it.id]);
    newDemand[it.id] = (d - 1) * 0.985 + 1;
    newSupply[it.id] = (s - 1) * 0.985 + 1;
  }

  const aiLogs = [];
  const newCompetitors = competitors.map((c) => {
    const nc = { ...c, sites: (c.sites || []).map((s) => ({ ...s })) };
    nc.money *= 1 + 0.00025 * nc.aggressiveness;
    nc.marketShare = Math.max(0.01, Math.min(0.45, nc.marketShare + (Math.random() - 0.47) * 0.003 * nc.aggressiveness));
    const focusItems = items.filter((i) => i.category === nc.focus).slice(0, 20);
    focusItems.forEach((it) => {
      newDemand[it.id] = (newDemand[it.id] || 1) + 0.01 * nc.aggressiveness;
      newSupply[it.id] = (newSupply[it.id] || 1) + 0.006 * nc.aggressiveness;
    });
    if (Math.random() < 0.05 * nc.aggressiveness) {
      nc.lastAction = 'Expande capacidad productiva';
      aiLogs.push(`${nc.name}: ${nc.lastAction}`);
    }
    return nc;
  });

  self.postMessage({
    type: 'tickMarketAIResult',
    payload: { prices: newPrices, demand: newDemand, supply: newSupply, competitors: newCompetitors, aiLogs },
  });
};
