/** Sistemas v4: parcelas, clima, bolsa límites, campaña con ramas y miles de misiones */
window.IM = window.IM || {};

(function v4() {
  const Proto = IM.Game && IM.Game.prototype;
  if (!Proto) return;

  const _init = Proto.init;
  Proto.init = function (saved) {
    _init.call(this, saved);
    const st = this.state;
    st.campaignBranch = st.campaignBranch || null;
    st.briefingSeen = st.briefingSeen || {};
    st.parcels = st.parcels || {};
    st.climate = st.climate || {};
    st.limitOrders = st.limitOrders || [];
    st.ui = Object.assign(st.ui || {}, { showBriefing: !st.campaignBranch });
    // Prefer campaign missions (thousands)
    if ((IM_DATA.campaignMissions || []).length) {
      this.refreshCampaignMissions();
    }
    this.emit();
  };

  Proto.chooseBranch = function (branchId) {
    const b = (IM_DATA.campaignBranches || []).find((x) => x.id === branchId);
    if (!b) return { ok: false, error: 'Rama inválida' };
    this.state.campaignBranch = branchId;
    this.state.ui.showBriefing = true;
    this.log(`Especialización elegida: ${b.name}`, 'mission');
    this.refreshCampaignMissions();
    this.emit();
    return { ok: true };
  };

  Proto.currentBriefing = function () {
    const ch = (IM_DATA.campaignChapters || []).find((c) => c.id === (this.state.campaignChapter || 1));
    const branch = (IM_DATA.campaignBranches || []).find((b) => b.id === this.state.campaignBranch);
    return {
      chapter: ch,
      branch,
      text: ch?.briefing || 'Continúa expandiendo tu imperio industrial.',
    };
  };

  Proto.refreshCampaignMissions = function () {
    const chapter = this.state.campaignChapter || 1;
    const branch = this.state.campaignBranch;
    const all = IM_DATA.campaignMissions || [];
    let pool = all.filter((m) => m.chapter === chapter && !this.state.missionsCompleted[m.id]);
    if (branch) pool = pool.filter((m) => m.branch === branch);
    // Fallback to generic missions if needed
    if (!pool.length) {
      pool = (IM_DATA.missions || []).filter((m) => m.chapter === Math.min(chapter, 40) && !this.state.missionsCompleted[m.id]);
    }
    this.state.activeMissionIds = pool.slice(0, 8).map((m) => m.id);
    this._campaignMissionMap = this._campaignMissionMap || {};
    pool.slice(0, 8).forEach((m) => {
      this._campaignMissionMap[m.id] = m;
    });
  };

  const _missionById = Proto.missionById;
  Proto.missionById = function (id) {
    return this._campaignMissionMap?.[id] || IM_DATA.campaignMissions?.find((m) => m.id === id) || _missionById.call(this, id);
  };

  const _refreshMissions = Proto.refreshMissions;
  Proto.refreshMissions = function () {
    if ((IM_DATA.campaignMissions || []).length && this.state.campaignBranch) {
      return this.refreshCampaignMissions();
    }
    return _refreshMissions.call(this);
  };

  // Resolve category-based mission requirements
  const _satisfied = Proto.missionSatisfied;
  Proto.missionSatisfied = function (m) {
    const r = m.requirement || {};
    if (r.type === 'reputation') {
      const vals = Object.values(this.state.b2bReputation || {});
      const best = vals.length ? Math.max(...vals) : 0;
      return best >= (r.amount || 50);
    }
    if (r.type === 'chain_step') {
      const chains = IM_DATA.productChains || [];
      const steps = chains.reduce((a, c) => a + (this.state.chainProgress?.[c.id]?.step || 0), 0);
      return steps >= (r.amount || 1);
    }
    if ((r.type === 'produce' || r.type === 'sell' || r.type === 'stock' || r.type === 'transport' || r.type === 'quality') && r.category && !r.item) {
      const items = (IM_DATA.items || []).filter((i) => i.category === r.category);
      if (r.type === 'quality') {
        return items.some((it) => (this.state.bestQuality[it.id] || 0) >= (r.quality || 60));
      }
      const bag = r.type === 'produce' ? this.state.producedLifetime : r.type === 'sell' ? this.state.soldLifetime : r.type === 'transport' ? this.state.transportedLifetime : null;
      if (r.type === 'stock') {
        const total = items.reduce((a, it) => {
          return (
            a +
            Object.values(this.state.warehouses).reduce((x, wh) => x + (wh.stock[it.id]?.qty || 0), 0)
          );
        }, 0);
        return total >= (r.qty || 1);
      }
      const sum = items.reduce((a, it) => a + (bag[it.id] || 0), 0);
      return sum >= (r.qty || 1);
    }
    return _satisfied.call(this, m);
  };

  const _progress = Proto.missionProgress;
  Proto.missionProgress = function (m) {
    const r = m.requirement || {};
    if (r.type === 'reputation') {
      const vals = Object.values(this.state.b2bReputation || {});
      const best = vals.length ? Math.max(...vals) : 0;
      return IM.clamp(best / (r.amount || 50), 0, 1);
    }
    if (r.category && !r.item && (r.type === 'produce' || r.type === 'sell')) {
      const items = (IM_DATA.items || []).filter((i) => i.category === r.category);
      const bag = r.type === 'produce' ? this.state.producedLifetime : this.state.soldLifetime;
      const sum = items.reduce((a, it) => a + (bag[it.id] || 0), 0);
      return IM.clamp(sum / (r.qty || 1), 0, 1);
    }
    return _progress.call(this, m);
  };

  // ——— Parcelas ———
  Proto.createParcel = function (locationId, lat, lng) {
    const size = 0.02; // ~2km box
    const parcel = {
      id: IM.uid('parcel'),
      locationId,
      capacity: 8,
      used: 0,
      polygon: [
        [lat - size, lng - size],
        [lat - size, lng + size],
        [lat + size, lng + size],
        [lat + size, lng - size],
      ],
      color: '#3d9b7a',
    };
    this.state.parcels[locationId] = parcel;
    return parcel;
  };

  Proto.getParcel = function (locationId) {
    return this.state.parcels[locationId];
  };

  const _buildBuilding = Proto.buildBuilding;
  Proto.buildBuilding = function (locationId, buildingTypeId) {
    const parcel = this.state.parcels[locationId];
    if (parcel) {
      const used = (this.state.sites.find((s) => s.locationId === locationId)?.buildings.length) || 0;
      if (used >= parcel.capacity) {
        return { ok: false, error: `Parcela llena (${parcel.capacity} edificios máx). Mejora la parcela.` };
      }
    }
    const r = _buildBuilding.call(this, locationId, buildingTypeId);
    if (r.ok && parcel) parcel.used = (this.state.sites.find((s) => s.locationId === locationId)?.buildings.length) || 0;
    return r;
  };

  Proto.expandParcel = function (locationId) {
    const p = this.state.parcels[locationId];
    if (!p) return { ok: false, error: 'Sin parcela' };
    const cost = 400000 * this.state.inflationIndex * (p.capacity / 8);
    if (!this.canAfford(cost)) return { ok: false, error: 'Fondos insuficientes' };
    this.spend(cost);
    p.capacity += 4;
    // Grow polygon slightly
    const cLat = p.polygon.reduce((a, x) => a + x[0], 0) / 4;
    const cLng = p.polygon.reduce((a, x) => a + x[1], 0) / 4;
    const size = 0.02 + (p.capacity - 8) * 0.002;
    p.polygon = [
      [cLat - size, cLng - size],
      [cLat - size, cLng + size],
      [cLat + size, cLng + size],
      [cLat + size, cLng - size],
    ];
    this.log(`Parcela ampliada a ${p.capacity} slots`, 'build');
    this.emit();
    return { ok: true };
  };

  const _foundAt = Proto.foundAtCoordinates;
  Proto.foundAtCoordinates = async function (lat, lng) {
    const r = await _foundAt.call(this, lat, lng);
    if (r.ok && r.loc) {
      this.createParcel(r.loc.id, r.loc.lat, r.loc.lng);
      this.updateClimate(r.loc.id);
    }
    return r;
  };

  // ——— Clima ———
  Proto.updateClimate = function (locationId) {
    const loc = IM.locationById(locationId);
    if (!loc) return null;
    const season = this.state.season || 'primavera';
    const absLat = Math.abs(loc.lat);
    let baseTemp = 30 - absLat * 0.55;
    if (season === 'verano') baseTemp += 6;
    if (season === 'invierno') baseTemp -= 8;
    if (season === 'otoño') baseTemp -= 2;
    const dayNoise = Math.sin((this.state.day + loc.lat) * 0.7) * 3;
    const temp = Math.round((baseTemp + dayNoise) * 10) / 10;
    // precip mm
    let precip = Math.max(0, (absLat > 10 && absLat < 60 ? 4 : 1) + Math.sin(this.state.day * 0.3 + loc.lng) * 3);
    if (season === 'invierno' && absLat > 40) precip += 2;
    if (Math.abs(loc.lat) < 25 && Math.abs(loc.lng) > 0) precip *= 0.4; // más seco subtropical
    precip = Math.round(precip * 10) / 10;
    const climate = { temp, precip, season, comfort: IM.clamp(1 - Math.abs(temp - 22) / 40, 0.4, 1.2) };
    this.state.climate[locationId] = climate;
    return climate;
  };

  Proto.climateMultiplier = function (locationId, kind) {
    const c = this.state.climate[locationId] || this.updateClimate(locationId);
    if (!c) return 1;
    if (kind === 'agro') {
      // Ideal 15-28C and some rain
      const tempFactor = c.temp >= 12 && c.temp <= 32 ? 1 + (c.precip > 1 ? 0.15 : -0.05) : 0.7;
      return IM.clamp(tempFactor * c.comfort, 0.5, 1.4);
    }
    if (kind === 'solar') {
      return IM.clamp(1.1 - c.precip * 0.05 + (c.temp > 25 ? 0.1 : 0), 0.5, 1.4);
    }
    if (kind === 'wind') {
      return IM.clamp(0.9 + c.precip * 0.03, 0.7, 1.3);
    }
    if (kind === 'logistics') {
      return c.precip > 8 ? 0.85 : 1;
    }
    return 1;
  };

  // Apply climate to extraction richness temporarily
  const _localRichness = Proto.localRichness;
  Proto.localRichness = function (locationId, itemId) {
    let r = _localRichness.call(this, locationId, itemId);
    const it = IM.itemById(itemId);
    if (it?.category === 'agricolas' || itemId === 'aceituna' || itemId === 'trigo' || itemId === 'maiz') {
      r *= this.climateMultiplier(locationId, 'agro');
    }
    return r;
  };

  const _onDay = Proto.onDay;
  Proto.onDay = function () {
    _onDay.call(this);
    (this.state.discoveredLocations || []).forEach((l) => this.updateClimate(l.id));
    this.tickLimitOrders();
  };

  const _checkCampaignAdvance = Proto.checkCampaignAdvance;
  Proto.checkCampaignAdvance = function () {
    const before = this.state.campaignChapter || 1;
    _checkCampaignAdvance.call(this);
    const after = this.state.campaignChapter || 1;
    if (after > before) {
      this.refreshCampaignMissions();
      this.state.ui.showBriefing = true;
      this.emit();
    }
  };

  // ——— Bolsa: órdenes limitadas ———
  Proto.placeLimitOrder = function ({ side, itemId, qty, limitPrice }) {
    if (!this.campaignUnlocked('bolsa') && !this.hasTech('bolsa_materias') && !this.state.unlockAll) {
      // allow from chapter 3 unlock
      if ((this.state.campaignChapter || 1) < 3) return { ok: false, error: 'Desbloquea la bolsa en el capítulo 3' };
    }
    const item = IM.itemById(itemId);
    if (!item || qty <= 0 || limitPrice <= 0) return { ok: false, error: 'Orden inválida' };
    if (side === 'buy') {
      const hold = limitPrice * qty * 0.2;
      if (!this.canAfford(hold)) return { ok: false, error: 'Margen insuficiente' };
      this.spend(hold);
    }
    this.state.limitOrders.push({
      id: IM.uid('lo'),
      side,
      itemId,
      qty,
      limitPrice,
      filled: 0,
      status: 'open',
      createdDay: this.state.day,
      year: this.state.year,
    });
    this.emit();
    return { ok: true };
  };

  Proto.tickLimitOrders = function () {
    const keep = [];
    this.state.limitOrders.forEach((o) => {
      if (o.status !== 'open') return;
      const price = this.priceOf(o.itemId);
      const locId = this.state.ui.selectedLocationId || this.state.sites[0]?.locationId;
      if (!locId) {
        keep.push(o);
        return;
      }
      if (o.side === 'buy' && price <= o.limitPrice) {
        const r = this.buyFromMarket(locId, o.itemId, o.qty - o.filled, true);
        if (r.ok) {
          o.filled = o.qty;
          o.status = 'filled';
          this.log(`Orden límite COMPRA ejecutada: ${IM.itemById(o.itemId)?.name}`, 'market');
        } else keep.push(o);
      } else if (o.side === 'sell' && price >= o.limitPrice) {
        const r = this.sellToMarket(locId, o.itemId, o.qty - o.filled, true);
        if (r.ok) {
          o.filled = o.qty;
          o.status = 'filled';
          this.log(`Orden límite VENTA ejecutada: ${IM.itemById(o.itemId)?.name}`, 'market');
        } else keep.push(o);
      } else keep.push(o);
    });
    this.state.limitOrders = keep.filter((o) => o.status === 'open');
  };

  Proto.priceSeries = function (itemId, points = 48) {
    const hist = this.state.priceHistory?.[itemId];
    if (hist && hist.length >= Math.min(8, points)) return hist.slice(-points);
    const base = this.priceOf(itemId);
    const arr = [];
    const seed = (itemId || '').length;
    for (let i = 0; i < points; i++) {
      const wave = Math.sin((i + seed) / 5) * 0.03 + Math.cos((i + seed) / 9) * 0.015;
      arr.push(base * (0.95 + wave + (i / points) * 0.02));
    }
    if (hist?.length) {
      // merge last known into end
      arr[arr.length - 1] = hist[hist.length - 1];
    }
    return arr;
  };
})();
