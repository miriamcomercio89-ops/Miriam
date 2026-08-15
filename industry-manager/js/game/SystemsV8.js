/** Sistemas v8: misiones locales OSM, DJ procedural, calendario 2000, guías */
window.IM = window.IM || {};

(function v8() {
  const Proto = IM.Game && IM.Game.prototype;
  if (!Proto) return;

  const _init = Proto.init;
  Proto.init = function (saved) {
    _init.call(this, saved);
    const st = this.state;
    const startY = IM_CONFIG.campaignStartYear || 2000;
    if (!saved) {
      st.year = startY;
      st.day = 1;
      st.hour = 8;
      st.minute = 0;
    }
    // Migración de partidas antiguas (2026 → relativo)
    if (st.year >= 2026 && !st._migratedTo2000) {
      st.year = startY + Math.max(0, st.year - 2026);
      st._migratedTo2000 = true;
    }
    st.localMissions = st.localMissions || [];
    st.localMissionDone = st.localMissionDone || {};
    st.dj = Object.assign(
      {
        enabled: true,
        volume: 0.2,
        biome: 'auto',
        intensity: 0.55,
        variety: 0.8,
        playlist: 'viaje',
      },
      st.dj || {}
    );
    st.guideBookmark = st.guideBookmark || { year: startY, day: 1 };
    this.refreshLocalMissions(false);
    this.emit();
  };

  Proto.companyYearsElapsed = function () {
    const start = IM_CONFIG.campaignStartYear || 2000;
    return Math.max(0, (this.state.year || start) - start);
  };

  Proto.foundedCities = function () {
    return (this.state.sites || [])
      .map((s) => IM.locationById(s.locationId))
      .filter(Boolean);
  };

  Proto.primaryCity = function () {
    const cities = this.foundedCities();
    if (!cities.length) {
      return {
        name: IM_CONFIG.startCityHint || 'Málaga',
        country: 'España',
        lat: IM_CONFIG.mapCenter[0],
        lng: IM_CONFIG.mapCenter[1],
        region: 'Andalucía',
      };
    }
    return cities[0];
  };

  /** Misiones procedurales ancladas a la ciudad OSM fundada */
  Proto.refreshLocalMissions = function (force) {
    const st = this.state;
    const cities = this.foundedCities();
    if (!cities.length) {
      st.localMissions = [];
      return;
    }
    if (!force && st.localMissions.length >= 3 && st.localMissions[0]?.year === st.year && st.localMissions[0]?.seedDay === st.day) {
      return;
    }
    const seed = st.year * 1000 + st.day + cities.length * 17;
    const rnd = IM.mulberry32 ? IM.mulberry32(seed) : (() => {
      let t = seed >>> 0;
      return () => {
        t += 0x6d2b79f5;
        let r = Math.imul(t ^ (t >>> 15), 1 | t);
        r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
        return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
      };
    })();

    const items = (IM_DATA.items || []).filter((i) => !i.isWaste && i.tier <= 4);
    const buildings = IM_DATA.buildings || [];
    const missions = [];
    const templates = [
      (city, item) => ({
        title: `${city.name}: stockear ${item.name}`,
        desc: `La lonja/mercado de ${city.name} pide reserva de ${item.name}.`,
        requirement: { type: 'stock', item: item.id, qty: Math.round(20 + rnd() * 80), locationId: city.id },
        reward: { money: 8000 + Math.round(rnd() * 20000), xp: 40 },
      }),
      (city, item) => ({
        title: `${city.name}: vender ${item.name}`,
        desc: `Demanda local en ${city.country || 'la región'} para ${item.name}.`,
        requirement: { type: 'sell', item: item.id, qty: Math.round(10 + rnd() * 40) },
        reward: { money: 10000 + Math.round(rnd() * 25000), xp: 50 },
      }),
      (city) => {
        const b = buildings[Math.floor(rnd() * buildings.length)];
        return {
          title: `${city.name}: tipología ${b.name}`,
          desc: `El ayuntamiento de ${city.name} favorece instalar ${b.name}.`,
          requirement: { type: 'build', building: b.id, qty: 1 },
          reward: { money: Math.round(b.cost * 0.08), xp: 70 },
        };
      },
      (city, item) => ({
        title: `${city.name}: producir ${item.name}`,
        desc: `Cadena corta en ${city.region || city.name}: fabrica ${item.name}.`,
        requirement: { type: 'produce', item: item.id, qty: Math.round(15 + rnd() * 60) },
        reward: { money: 12000 + Math.round(rnd() * 18000), xp: 55 },
      }),
      (city, item) => ({
        title: `${city.name}: hub logístico`,
        desc: `Mejora reputación transportando ${item.name} desde ${city.name}.`,
        requirement: { type: 'transport', item: item.id, qty: Math.round(30 + rnd() * 120) },
        reward: { money: 15000, xp: 60 },
      }),
    ];

    for (let i = 0; i < 5; i++) {
      const city = cities[Math.floor(rnd() * cities.length)];
      const item = items[Math.floor(rnd() * items.length)];
      const tpl = templates[Math.floor(rnd() * templates.length)];
      const m = tpl(city, item);
      const id = `local_${st.year}_${st.day}_${i}_${city.id || 'x'}`;
      if (st.localMissionDone[id]) continue;
      missions.push({
        id,
        ...m,
        cityId: city.id,
        cityName: city.name,
        year: st.year,
        seedDay: st.day,
        local: true,
      });
    }
    st.localMissions = missions.slice(0, 5);
  };

  Proto.checkLocalMissions = function () {
    const st = this.state;
    (st.localMissions || []).forEach((m) => {
      if (st.localMissionDone[m.id]) return;
      if (this.missionSatisfied(m)) {
        st.localMissionDone[m.id] = true;
        st.money += m.reward?.money || 0;
        st.xp = (st.xp || 0) + (m.reward?.xp || 0);
        this.log(`Misión local: ${m.title}`, 'mission');
        this.pushCorpChat?.(`Completada misión local en ${m.cityName}`, 'ok', 'Ops');
      }
    });
  };

  const _onDay = Proto.onDay;
  Proto.onDay = function () {
    _onDay.call(this);
    this.refreshLocalMissions(true);
    this.checkLocalMissions();
    // DJ auto-biome from primary city climate/lat
    if (this.state.dj?.biome === 'auto' && IM.Audio?.setBiomeFromState) {
      IM.Audio.setBiomeFromState(this.state, this.primaryCity());
    }
  };

  const _onHour = Proto.onHour;
  Proto.onHour = function () {
    _onHour.call(this);
    this.checkLocalMissions();
  };

  /** Guía del día (contenido alineado con PDFs) */
  Proto.guideForDay = function (year, day) {
    return IM.GuideEngine?.page(year, day, this) || null;
  };
})();
