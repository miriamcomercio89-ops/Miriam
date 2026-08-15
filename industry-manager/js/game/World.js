/** Generación de mapa estilo RoI alrededor de Málaga */
window.IM = window.IM || {};

IM.WorldGen = {
  generate(seed = 2000) {
    const W = IM_CONFIG.mapW;
    const H = IM_CONFIG.mapH;
    const rnd = IM.mulberry32(seed);
    const tiles = [];
    for (let y = 0; y < H; y++) {
      tiles[y] = [];
      for (let x = 0; x < W; x++) {
        let t = 'grass';
        // Mar al sur
        if (y > H * 0.72 + Math.sin(x * 0.18) * 2) t = 'water';
        else if (y > H * 0.66 + Math.sin(x * 0.18) * 2) t = 'coast';
        else if (y < H * 0.22 && rnd() < 0.45) t = 'hill';
        else if (rnd() < 0.12) t = 'forest';
        else if (rnd() < 0.18) t = 'farm';
        else if (rnd() < 0.04) t = 'sand';
        else if (rnd() < 0.03) t = 'clay';
        tiles[y][x] = { terrain: t, road: false, buildingId: null };
      }
    }

    // Depósitos minerales en colinas
    const sprinkle = (terrain, n) => {
      let placed = 0;
      let guard = 0;
      while (placed < n && guard++ < 4000) {
        const x = Math.floor(rnd() * W);
        const y = Math.floor(rnd() * H);
        if (tiles[y][x].terrain === 'hill' || tiles[y][x].terrain === 'grass') {
          tiles[y][x].terrain = terrain;
          placed++;
        }
      }
    };
    sprinkle('coal', 14);
    sprinkle('iron', 12);
    sprinkle('copper', 10);
    sprinkle('oil', 8);

    // Más bosque y fértil en bandas
    for (let y = 8; y < 20; y++) {
      for (let x = 2; x < W - 2; x++) {
        if (tiles[y][x].terrain === 'grass' && rnd() < 0.2) tiles[y][x].terrain = 'farm';
        if (tiles[y][x].terrain === 'grass' && rnd() < 0.12) tiles[y][x].terrain = 'forest';
      }
    }

    const towns = [];
    const templates = IM_DATA.townTemplates || [];
    const spots = [
      [26, 22], [18, 24], [34, 20], [22, 12], [40, 24], [12, 10],
    ];
    templates.forEach((tpl, i) => {
      const [tx, ty] = spots[i] || [8 + i * 7, 14];
      this.carveTown(tiles, tx, ty, 2);
      const shops = this.shopsFor(tpl, rnd);
      towns.push({
        id: `town_${i}`,
        name: tpl.name,
        x: tx,
        y: ty,
        pop: tpl.pop,
        type: tpl.type,
        reputation: 55,
        shops,
        shopClosedUntil: null,
      });
    });

    return { tiles, towns, W, H, seed };
  },

  carveTown(tiles, cx, cy, r) {
    for (let y = cy - r; y <= cy + r; y++) {
      for (let x = cx - r; x <= cx + r; x++) {
        if (!tiles[y] || !tiles[y][x]) continue;
        if (tiles[y][x].terrain === 'water') continue;
        tiles[y][x].terrain = 'town';
        tiles[y][x].road = true;
      }
    }
  },

  shopsFor(tpl, rnd) {
    const shops = [{ type: 'farmers', demand: {} }];
    if (tpl.pop >= 600) shops.push({ type: 'grocery', demand: {} });
    if (tpl.pop >= 750) shops.push({ type: 'hardware', demand: {} });
    if (tpl.pop >= 1000) shops.push({ type: 'general', demand: {} });
    shops.forEach((s) => {
      const def = IM_DATA.shopTypes[s.type];
      (def?.buys || []).forEach((pid) => {
        s.demand[pid] = Math.round(8 + rnd() * 18);
      });
    });
    return shops;
  },
};
