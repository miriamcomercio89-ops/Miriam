/** Geocodificación inversa (Nominatim / OpenStreetMap) + heurística de recursos */
window.IM = window.IM || {};

IM.Geo = {
  _cache: {},
  _queue: [],
  _busy: false,
  _lastReq: 0,

  /** Heurística de recursos según lat/lng / país (sin ciudades inventadas) */
  inferResources(lat, lng, country, region) {
    const rnd = Math.abs(Math.sin(lat * 12.9898 + lng * 78.233)) % 1;
    const absLat = Math.abs(lat);
    const resources = [];
    const push = (item, richness) => resources.push({ item, richness: Math.round(richness * 100) / 100 });

    // Agro cinturones
    if (absLat > 25 && absLat < 55) {
      push('trigo', 0.9 + rnd * 0.5);
      push('maiz', 0.8 + rnd * 0.4);
    }
    // Mediterráneo / Andalucía-like
    if (lat > 30 && lat < 45 && lng > -10 && lng < 40) {
      push('aceituna', 1.2 + rnd * 0.4);
      push('uva_vinifera', 1.1 + rnd * 0.3);
      push('naranja', 1.0 + rnd * 0.3);
      push('caliza', 1.0);
    }
    // Petróleo/gas cinturones aproximados
    if ((lat > 20 && lat < 40 && lng > 40 && lng < 60) || (lat > 25 && lat < 35 && lng > -100 && lng < -80)) {
      push('petroleo_crudo', 1.3 + rnd * 0.4);
      push('gas_natural', 1.2 + rnd * 0.3);
    }
    // Minería latitud media / cordilleras
    if (absLat > 15 && absLat < 50) {
      push('mena_de_hierro', 0.9 + rnd * 0.5);
      push('mena_de_cobre', 0.85 + rnd * 0.55);
      if (rnd > 0.6) push('bauxita', 1.0 + rnd * 0.3);
      if (rnd > 0.75) push('espodumeno_litio', 1.1);
    }
    // Carbón Europa/Asia/América norte
    if ((lat > 40 && lat < 60) || (lat > 30 && lat < 50 && lng < -60)) {
      push('carbon_mineral', 1.0 + rnd * 0.4);
    }
    // Silicio / electrónica hubs costeros
    if (Math.abs(lng) > 100 || (lat > 20 && lat < 40 && lng > 100)) {
      push('arena_de_silice', 1.2);
      push('concentrado_de_tierras_raras', 0.9 + rnd * 0.4);
    }
    // Defaults
    if (!resources.length) {
      push('caliza', 0.9);
      push('arcilla_industrial', 0.85);
      push('arena_de_construccion', 1.0);
    }
    // Dedup by item keep max richness
    const map = {};
    resources.forEach((r) => {
      map[r.item] = Math.max(map[r.item] || 0, r.richness);
    });
    return Object.entries(map).map(([item, richness]) => ({ item, richness }));
  },

  inferType(lat, lng, address) {
    const cls = (address?.city || address?.town || address?.village || '').toLowerCase();
    if (address?.leisure === 'marina' || address?.industrial) return 'industrial';
    if (Math.abs(lat) < 5) return 'port';
    // Costas aproximadas: si hay country y está cerca del mar es difícil sin coastline; usar tags
    if (address?.suburb && /port|harbour|hafen|puerto/.test(JSON.stringify(address).toLowerCase())) return 'port';
    if (lat > 28 && lat < 42 && lng > -10 && lng < 0) return 'agro';
    return 'hub';
  },

  regionOf(countryCode, lat) {
    const eu = ['ES','PT','FR','DE','IT','GB','NL','BE','PL','SE','NO','FI','IE','AT','CH','CZ','RO','GR','DK','HU'];
    const am = ['US','CA','MX','BR','AR','CL','CO','PE','UY','VE'];
    const as = ['CN','JP','KR','IN','ID','TH','VN','MY','SG','SA','AE','TR','KZ'];
    const af = ['ZA','NG','MA','EG','KE','DZ','TN','GH'];
    const oc = ['AU','NZ','PG','FJ'];
    const cc = (countryCode || '').toUpperCase();
    if (eu.includes(cc)) return 'Europa';
    if (am.includes(cc)) return 'América';
    if (as.includes(cc)) return 'Asia';
    if (af.includes(cc)) return 'África';
    if (oc.includes(cc)) return 'Oceanía';
    if (lat > 35) return 'Europa';
    return 'América';
  },

  laborEnergy(region, countryCode) {
    const table = {
      Europa: [1.15, 1.1],
      América: [1.1, 0.95],
      Asia: [0.6, 0.8],
      África: [0.4, 0.7],
      Oceanía: [1.3, 1.0],
    };
    const [labor, energy] = table[region] || [1, 1];
    if ((countryCode || '').toUpperCase() === 'ES') return { laborCost: 1.0, energyCost: 1.05, tariffs: 0.05 };
    return { laborCost: labor, energyCost: energy, tariffs: region === 'Europa' ? 0.05 : 0.09 };
  },

  currencyOf(region, countryCode) {
    const cc = (countryCode || '').toUpperCase();
    if (cc === 'ES' || cc === 'DE' || cc === 'FR' || cc === 'IT' || cc === 'PT' || cc === 'NL' || cc === 'BE') return 'EUR';
    if (cc === 'GB') return 'GBP';
    if (cc === 'US' || cc === 'CA' || cc === 'MX') return 'USD';
    if (cc === 'JP') return 'JPY';
    if (cc === 'CN') return 'CNY';
    if (cc === 'BR') return 'BRL';
    if (region === 'Europa') return 'EUR';
    if (region === 'Asia') return 'USD';
    return 'USD';
  },

  idFrom(lat, lng, name) {
    const base = IM.idify
      ? IM.idify(name)
      : String(name)
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '_')
          .replace(/^_|_$/g, '');
    return `${base}_${Math.round(lat * 100)}_${Math.round(lng * 100)}`;
  },

  async reverse(lat, lng) {
    const key = `${lat.toFixed(3)},${lng.toFixed(3)}`;
    if (this._cache[key]) return this._cache[key];

    // Nominatim — 1 req/s
    const wait = Math.max(0, 1100 - (Date.now() - this._lastReq));
    if (wait) await new Promise((r) => setTimeout(r, wait));
    this._lastReq = Date.now();

    const url =
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1&accept-language=es`;
    try {
      const res = await fetch(url, {
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      const addr = data.address || {};
      const city =
        addr.city ||
        addr.town ||
        addr.village ||
        addr.municipality ||
        addr.county ||
        addr.state_district ||
        data.name ||
        `Paraje ${lat.toFixed(2)}, ${lng.toFixed(2)}`;
      const country = addr.country || 'Desconocido';
      const countryCode = addr.country_code || '';
      const region = this.regionOf(countryCode, lat);
      const le = this.laborEnergy(region, countryCode);
      const type = this.inferType(lat, lng, addr);
      const loc = {
        id: this.idFrom(lat, lng, city),
        name: city,
        country,
        countryCode: countryCode.toUpperCase(),
        region,
        lat: Math.round(lat * 10000) / 10000,
        lng: Math.round(lng * 10000) / 10000,
        type,
        tariffs: le.tariffs,
        laborCost: le.laborCost,
        energyCost: le.energyCost,
        resources: this.inferResources(lat, lng, country, region),
        pollutionLimit: region === 'Europa' ? 80 : region === 'Asia' ? 120 : 100,
        hubLevel: type === 'hub' || type === 'port' ? 2 : 1,
        hasPort: type === 'port' || !!addr.maritime,
        hasRail: true,
        hasAirport: type === 'hub',
        currency: this.currencyOf(region, countryCode),
        specialization: this.inferSpecialization(type, lat, lng, countryCode),
        discovered: true,
        source: 'nominatim',
        displayName: data.display_name || city,
      };
      const land = this.inferLandZone(loc);
      loc.zone = land.zone;
      loc.landCost = land.landCost;
      loc.hasPort = land.hasPort;
      loc.hasAirport = land.hasAirport;
      this._cache[key] = loc;
      return loc;
    } catch (e) {
      // Fallback offline
      const region = this.regionOf('', lat);
      const le = this.laborEnergy(region, '');
      const name = `Paraje ${lat.toFixed(2)}°, ${lng.toFixed(2)}°`;
      const loc = {
        id: this.idFrom(lat, lng, name),
        name,
        country: 'Zona sin datos',
        countryCode: '',
        region,
        lat,
        lng,
        type: 'hub',
        ...le,
        resources: this.inferResources(lat, lng, '', region),
        pollutionLimit: 100,
        hubLevel: 1,
        hasPort: false,
        hasRail: true,
        hasAirport: false,
        currency: this.currencyOf(region, ''),
        specialization: 'industrial',
        discovered: true,
        source: 'fallback',
        displayName: name,
        error: String(e.message || e),
      };
      const land = this.inferLandZone(loc);
      loc.zone = land.zone;
      loc.landCost = land.landCost;
      loc.hasPort = land.hasPort;
      loc.hasAirport = land.hasAirport;
      this._cache[key] = loc;
      return loc;
    }
  },

  inferSpecialization(type, lat, lng, countryCode) {
    const cc = (countryCode || '').toUpperCase();
    if (cc === 'ES' && lat < 40) return 'agro';
    if (type === 'port') return 'logistica';
    if (lat > 20 && lat < 40 && lng > 100) return 'electronica';
    if (type === 'mining' || (Math.abs(lat) > 20 && Math.abs(lat) < 40 && lng < -60)) return 'mineria';
    if (type === 'energy') return 'energia';
    if (type === 'agro') return 'agro';
    return type === 'industrial' ? 'industria' : 'general';
  },

  /** Zonas de coste de suelo + hubs (puerto / aeropuerto) */
  inferLandZone(loc) {
    const name = String(loc.name || loc.displayName || '').toLowerCase();
    const lat = loc.lat || 0;
    const lng = loc.lng || 0;
    const capitals =
      /madrid|barcelona|paris|berlin|london|roma|lisboa|lisbon|amsterdam|bruselas|varsovia|viena|atenas|dublin|estocolmo|oslo|helsinki|washington|tokio|beijing|se[uú]l|ciudad de m[eé]xico|buenos aires|santiago|lima|bogot/i;
    const portWord = /puerto|port|harbour|hafen|porto|haven|mar[ií]timo/i;
    const industrialWord = /pol[ií]gono|industrial|zona franca|parque tecnol|tecnol[oó]gico/i;
    const nearCoastES =
      lat > 35.5 && lat < 44 && lng > -10 && lng < 4 && (lat < 37.5 || lat > 41.5 || lng < -5.5 || lng > -0.5);

    let hasPort = !!loc.hasPort || portWord.test(name) || loc.type === 'port' || nearCoastES;
    let hasAirport = !!loc.hasAirport || loc.type === 'hub' || capitals.test(name);
    let zone = 'rural';
    let landCost = 0.75;

    if (capitals.test(name)) {
      zone = 'capital';
      landCost = 1.85;
      hasAirport = true;
    } else if (industrialWord.test(name) || loc.type === 'industrial') {
      zone = 'poligono';
      landCost = 0.82;
    } else if (hasPort || loc.type === 'port') {
      zone = 'puerto';
      landCost = 1.35;
      hasPort = true;
    } else if (loc.type === 'hub' || hasAirport) {
      zone = 'hub';
      landCost = 1.25;
    } else if (nearCoastES) {
      zone = 'costa';
      landCost = 1.1;
      hasPort = true;
    } else {
      zone = 'rural';
      landCost = 0.72;
    }

    if ((loc.countryCode || '').toUpperCase() === 'ES' && lat < 39 && zone === 'rural') {
      landCost = 0.68;
    }

    return { zone, landCost, hasPort, hasAirport };
  },

  async searchCity(query) {
    const q = String(query || '').trim();
    if (q.length < 2) return [];
    const wait = Math.max(0, 1100 - (Date.now() - this._lastReq));
    if (wait) await new Promise((r) => setTimeout(r, wait));
    this._lastReq = Date.now();
    const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(q)}&addressdetails=1&limit=8&accept-language=es`;
    try {
      const res = await fetch(url, { headers: { Accept: 'application/json' } });
      if (!res.ok) return [];
      const data = await res.json();
      return (data || []).map((d) => ({
        lat: Number(d.lat),
        lng: Number(d.lon),
        name: d.name || d.display_name,
        displayName: d.display_name,
        country: d.address?.country,
      }));
    } catch {
      return [];
    }
  },
};

// helper used by Geo before utils loads fully
IM.idify =
  IM.idify ||
  function (s) {
    return String(s)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_|_$/g, '');
  };
