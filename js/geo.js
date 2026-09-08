/* Horizon — geocodificación OSM (Photon + Nominatim, datos OpenStreetMap) */
(function (global) {
  const queue = U.throttleQueue(1100);
  const PHOTON = "https://photon.komoot.io";
  const NOM = "https://nominatim.openstreetmap.org";
  const NOM_HEADERS = {
    Accept: "application/json",
    "Accept-Language": "es",
    "User-Agent": "HorizonRestaurantGroup/1.0 (educational browser tycoon; OSM reverse geocoding)",
  };

  const BLOCK_KEYS = new Set(["waterway", "natural", "leisure", "boundary", "aeroway", "landuse"]);
  const BLOCK_VALUES = new Set([
    "water",
    "bay",
    "sea",
    "ocean",
    "strait",
    "coastline",
    "beach",
    "wetland",
    "glacier",
    "wood",
    "forest",
    "scrub",
    "heath",
    "grassland",
    "park",
    "nature_reserve",
    "garden",
    "protected_area",
    "national_park",
    "meadow",
    "farmland",
    "farmyard",
    "orchard",
    "vineyard",
    "cemetery",
    "grass",
    "recreation_ground",
    "aerodrome",
    "runway",
    "taxiway",
  ]);
  const WATER_TYPES = new Set(["ocean", "sea", "water", "river", "lake", "bay"]);
  const STREET_VALUES = new Set([
    "residential",
    "primary",
    "secondary",
    "tertiary",
    "unclassified",
    "service",
    "track",
    "path",
    "footway",
    "cycleway",
    "living_street",
    "motorway",
    "trunk",
    "pedestrian",
    "road",
    "house",
    "yes",
    "building",
    "apartments",
    "detached",
    "terrace",
    "retail",
    "commercial",
    "industrial",
    "office",
    "garage",
    "parking",
  ]);
  const PLACE_VALUES = new Set([
    "hamlet",
    "village",
    "town",
    "city",
    "municipality",
    "suburb",
    "neighbourhood",
    "quarter",
    "isolated_dwelling",
    "farm",
    "locality",
  ]);
  const KIND_LABEL = {
    hamlet: "Pueblo",
    village: "Pueblo",
    town: "Villa",
    city: "Ciudad",
    municipality: "Municipio",
    suburb: "Barrio",
    neighbourhood: "Barrio",
    quarter: "Barrio",
    isolated_dwelling: "Núcleo",
    farm: "Núcleo",
    locality: "Paraje",
  };

  const hoverCache = new Map();
  const HOVER_CACHE_MAX = 400;

  function blocked(props) {
    if (!props) return { ok: false, reason: "No hay datos de este punto (posible océano o zona sin cartografiar)." };
    const key = (props.osm_key || props.class || "").toLowerCase();
    const val = (props.osm_value || props.type || "").toLowerCase();
    const type = (props.type || "").toLowerCase();
    if (WATER_TYPES.has(type) || WATER_TYPES.has(val)) {
      return { ok: false, reason: "No se puede construir sobre agua." };
    }
    if (key === "natural" && (val === "water" || val === "bay" || val === "coastline" || val === "beach" || val === "wetland")) {
      return { ok: false, reason: "Costa, playa o masa de agua protegida." };
    }
    if (key === "leisure" && (val === "park" || val === "nature_reserve" || val === "garden")) {
      return { ok: false, reason: "Parques y reservas no admiten locales." };
    }
    if (key === "landuse" && BLOCK_VALUES.has(val)) {
      return { ok: false, reason: "Zonificación incompatible (" + val + ")." };
    }
    if (key === "boundary" && (val === "protected_area" || val === "national_park")) {
      return { ok: false, reason: "Espacio protegido." };
    }
    if (key === "aeroway") return { ok: false, reason: "Zona aeroportuaria." };
    if (key === "waterway") return { ok: false, reason: "Cauce o canal." };
    return { ok: true };
  }

  function uniq(list) {
    return list.filter(Boolean).filter((v, i, a) => a.indexOf(v) === i);
  }

  function isPlaceOsm(key, val) {
    const k = (key || "").toLowerCase();
    const v = (val || "").toLowerCase();
    return k === "place" || PLACE_VALUES.has(v);
  }

  function looksLikeStreetName(name, street, osmValue) {
    if (!name) return true;
    if (street && name === street) return true;
    if (STREET_VALUES.has((osmValue || "").toLowerCase()) && (!street || name === street)) return true;
    if (/^\d+/.test(name)) return true;
    if (/\b(calle|avenida|avda\.?|plaza|carretera|camí|camino|paseo|rúa|rua|carrer|kalea)\b/i.test(name) && street) return true;
    return false;
  }

  function pickSettlement(fields) {
    const street = fields.street || "";
    const osmKey = fields.osmKey || "";
    const osmValue = fields.osmValue || "";
    const order = [
      ["hamlet", "Pueblo"],
      ["village", "Pueblo"],
      ["town", "Villa"],
      ["city", "Ciudad"],
      ["municipality", "Municipio"],
    ];
    for (const [key, label] of order) {
      const val = (fields[key] || "").trim();
      if (val && val !== street) {
        return {
          city: val,
          settlementKind: key,
          settlementLabel: label,
          municipality: (fields.municipality || "").trim(),
          district: (fields.suburb || fields.neighbourhood || "").trim(),
        };
      }
    }
    const suburb = (fields.suburb || fields.neighbourhood || "").trim();
    if (suburb && suburb !== street) {
      return {
        city: suburb,
        settlementKind: "suburb",
        settlementLabel: "Barrio",
        municipality: (fields.municipality || "").trim(),
        district: suburb,
      };
    }
    const name = (fields.name || "").trim();
    if (name && isPlaceOsm(osmKey, osmValue) && !looksLikeStreetName(name, street, osmValue)) {
      const kind = PLACE_VALUES.has(osmValue.toLowerCase()) ? osmValue.toLowerCase() : "locality";
      return {
        city: name,
        settlementKind: kind,
        settlementLabel: KIND_LABEL[kind] || "Localidad",
        municipality: (fields.municipality || "").trim(),
        district: "",
      };
    }
    return {
      city: "",
      settlementKind: "",
      settlementLabel: "Localidad",
      municipality: (fields.municipality || "").trim(),
      district: suburb,
    };
  }

  function finishPlace(base, extra) {
    const picked = pickSettlement(extra);
    const city = picked.city;
    const municipality = picked.municipality && picked.municipality !== city ? picked.municipality : picked.municipality || "";
    const region = extra.region || "";
    const province = extra.province || extra.county || "";
    const addr = uniq([
      extra.housenumber ? extra.street + " " + extra.housenumber : extra.street,
      picked.district && picked.district !== city ? picked.district : "",
      city,
      municipality && municipality !== city ? municipality : "",
      province && province !== city && province !== municipality ? province : "",
      region && region !== province && region !== city ? region : "",
      extra.countryName,
    ]);
    return {
      ...base,
      city,
      settlementKind: picked.settlementKind,
      settlementLabel: picked.settlementLabel,
      municipality,
      district: picked.district || "",
      province,
      region: region || province,
      street: extra.street || "",
      postcode: extra.postcode || "",
      display: extra.display || addr.join(", ") || city || extra.countryName || "",
    };
  }

  function fromPhoton(lat, lon, feat) {
    const p = feat.properties || {};
    const gate = blocked(p);
    const street = p.street || "";
    const osmValue = p.osm_value || p.type || "";
    const name = p.name || "";
    const hamlet = p.hamlet || (osmValue === "hamlet" ? name : "");
    const village = p.village || (osmValue === "village" ? name : "");
    const town = p.town || (osmValue === "town" ? name : "");
    const cityField = p.city || (osmValue === "city" ? name : "");
    const extra = {
      hamlet,
      village,
      town,
      city: cityField,
      municipality: p.municipality || "",
      suburb: p.district || p.suburb || p.neighbourhood || p.locality || "",
      neighbourhood: p.neighbourhood || "",
      street,
      housenumber: p.housenumber || "",
      name,
      osmKey: p.osm_key || "",
      osmValue,
      region: p.state || "",
      county: p.county || "",
      province: p.county || "",
      postcode: p.postcode || "",
      countryName: p.country || "",
      display: "",
    };
    const cc = (p.countrycode || "").toUpperCase();
    extra.countryName = extra.countryName || WORLD.country(cc).name;
    extra.display = uniq([
      p.housenumber,
      street || (looksLikeStreetName(name, street, osmValue) ? name : ""),
      extra.suburb,
      cityField || town || village || hamlet || p.municipality,
      p.county || p.state,
      extra.countryName,
    ]).join(", ");
    const base = {
      lat,
      lon,
      source: "photon",
      countryCode: cc,
      countryName: extra.countryName,
      osmKey: p.osm_key || "",
      osmValue,
      type: p.type || "",
      name,
      ok: gate.ok,
      reason: gate.reason,
      residential: osmValue === "residential" || p.type === "house",
      commercial: /commercial|retail|industrial|office|yes/.test(osmValue),
    };
    return finishPlace(base, extra);
  }

  function fromNominatim(lat, lon, j) {
    const a = j.address || {};
    const cc = (a.country_code || "").toUpperCase();
    const props = { osm_key: j.category || j.class, osm_value: j.type, type: j.type };
    const gate = blocked(props);
    const extra = {
      hamlet: a.hamlet || a.isolated_dwelling || "",
      village: a.village || "",
      town: a.town || "",
      city: a.city || "",
      municipality: a.municipality || a.city_district || "",
      suburb: a.suburb || a.city_district || a.neighbourhood || a.quarter || "",
      neighbourhood: a.neighbourhood || "",
      street: a.road || a.pedestrian || a.footway || "",
      housenumber: a.house_number || "",
      name: j.name || "",
      osmKey: j.category || j.class || "",
      osmValue: j.type || "",
      region: a.state || a.region || "",
      county: a.county || "",
      province: a.province || a.county || a.state_district || "",
      postcode: a.postcode || "",
      countryName: a.country || WORLD.country(cc).name,
      display: j.display_name || "",
    };
    const base = {
      lat,
      lon,
      source: "nominatim",
      countryCode: cc,
      countryName: extra.countryName,
      osmKey: extra.osmKey,
      osmValue: extra.osmValue,
      type: j.type || "",
      name: j.name || "",
      ok: gate.ok,
      reason: gate.reason,
      residential: j.type === "residential" || j.type === "house",
      commercial: /commercial|retail/.test(j.type || ""),
    };
    return finishPlace(base, extra);
  }

  async function reversePhoton(lat, lon) {
    const url = `${PHOTON}/reverse?lat=${lat}&lon=${lon}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Photon HTTP " + res.status);
    const json = await res.json();
    const feat = json.features && json.features[0];
    if (!feat) {
      return {
        lat,
        lon,
        ok: false,
        reason: "Sin datos OSM: probablemente océano o zona inhabitada no edificable.",
        countryCode: "",
        display: "",
        city: "",
      };
    }
    return fromPhoton(lat, lon, feat);
  }

  async function reverseNominatim(lat, lon) {
    const url = `${NOM}/reverse?format=jsonv2&lat=${lat}&lon=${lon}&addressdetails=1&extratags=1&zoom=18&accept-language=es`;
    const res = await fetch(url, { headers: NOM_HEADERS });
    if (!res.ok) throw new Error("Nominatim HTTP " + res.status);
    const j = await res.json();
    if (j.error) {
      return { lat, lon, ok: false, reason: "Nominatim no geocodifica este punto (agua o desierto cartográfico).", display: "", city: "" };
    }
    return fromNominatim(lat, lon, j);
  }

  function mergePlaces(photon, nom) {
    const a = photon && photon.ok !== false ? photon : null;
    const b = nom && nom.ok !== false ? nom : null;
    if (!b && !a) return nom || photon;
    if (!b) return a;
    if (!a) return b;
    const preferNom = !!b.city;
    const primary = preferNom ? b : a;
    const other = preferNom ? a : b;
    const city = primary.city || other.city || "";
    const municipality = primary.municipality || other.municipality || "";
    return {
      ...other,
      ...primary,
      city,
      settlementKind: primary.settlementKind || other.settlementKind,
      settlementLabel: primary.settlementLabel || other.settlementLabel,
      municipality: municipality !== city ? municipality : municipality,
      district: primary.district || other.district || "",
      province: primary.province || other.province || "",
      region: primary.region || other.region || "",
      street: primary.street || other.street || "",
      postcode: primary.postcode || other.postcode || "",
      display: primary.display || other.display || "",
      countryCode: primary.countryCode || other.countryCode,
      countryName: primary.countryName || other.countryName,
      ok: primary.ok !== false && other.ok !== false ? primary.ok : primary.ok && other.ok,
      reason: primary.ok === false ? primary.reason : other.ok === false ? other.reason : primary.reason,
      source: preferNom ? "nominatim+photon" : "photon+nominatim",
    };
  }

  async function reverse(lat, lon) {
    const photonP = reversePhoton(lat, lon).catch(() => null);
    const nomP = queue(async () => {
      try {
        return await reverseNominatim(lat, lon);
      } catch {
        return null;
      }
    });
    const [photon, nom] = await Promise.all([photonP, nomP]);
    const merged = mergePlaces(photon, nom);
    if (merged) return merged;
    return { lat, lon, ok: false, reason: "No se pudo consultar el mapa (red). Inténtalo de nuevo.", display: "", city: "" };
  }

  async function reverseFast(lat, lon) {
    const key = lat.toFixed(3) + "," + lon.toFixed(3);
    if (hoverCache.has(key)) return hoverCache.get(key);
    try {
      const place = await reversePhoton(lat, lon);
      if (hoverCache.size > HOVER_CACHE_MAX) hoverCache.clear();
      hoverCache.set(key, place);
      return place;
    } catch {
      return { lat, lon, ok: false, city: "", countryCode: "", display: "" };
    }
  }

  async function search(q) {
    const query = String(q || "").trim();
    if (query.length < 2) return [];
    const asCoords = query.match(/^\s*(-?\d+(\.\d+)?)\s*[,;\s]\s*(-?\d+(\.\d+)?)\s*$/);
    if (asCoords) {
      const lat = parseFloat(asCoords[1]);
      const lon = parseFloat(asCoords[3]);
      if (Math.abs(lat) <= 90 && Math.abs(lon) <= 180) {
        return [{ label: `${lat.toFixed(5)}, ${lon.toFixed(5)}`, lat, lon, kind: "coords" }];
      }
    }
    return queue(async () => {
      try {
        const url = `${PHOTON}/api/?q=${encodeURIComponent(query)}&limit=6`;
        const res = await fetch(url);
        const json = await res.json();
        return (json.features || []).map((f) => {
          const p = f.properties || {};
          const [lon, lat] = f.geometry.coordinates;
          const bits = uniq([p.name, p.city || p.town || p.village, p.state, p.country]);
          return {
            label: bits.join(", "),
            lat,
            lon,
            kind: p.type || "place",
          };
        });
      } catch {
        return [];
      }
    });
  }

  function popFromKind(place, metro) {
    const named = WORLD.findCityByName(place.city, place.countryCode);
    if (named) return named.popK;
    const kind = (place.settlementKind || "").toLowerCase();
    if (kind === "hamlet" || kind === "isolated_dwelling" || kind === "farm") return 0.35;
    if (kind === "village") return 2.2;
    if (kind === "town") return 22;
    if (kind === "suburb" || kind === "neighbourhood" || kind === "quarter") {
      return metro && metro.distKm < 25 ? Math.max(18, metro.popK * 0.08) : 18;
    }
    if (kind === "city") return metro ? metro.popK : 180;
    if (kind === "municipality") return metro && metro.distKm < 12 ? metro.popK : 8;
    if (metro && metro.distKm < 8) return metro.popK;
    return WORLD.estimatePopK(place);
  }

  function enrich(place) {
    const cc = place.countryCode;
    const ctry = WORLD.country(cc);
    const metro = WORLD.nearestCity(place.lat, place.lon, 90);
    const popK = popFromKind(place, metro);
    const tz = WORLD.tzOffset(cc, place.lon);
    const city = place.city || "";
    const metroName = metro && metro.name && metro.name !== city ? metro.name : "";
    return {
      ...place,
      countryName: place.countryName || ctry.name,
      popK,
      cityMatch: city,
      metroName,
      metroKm: metro && metroName ? metro.distKm : null,
      tz,
      gdppc: ctry.gdppc,
      rentIndex: ctry.rent,
      wage: ctry.wage,
      tax: ctry.tax,
      vat: ctry.vat,
      competitor: WORLD.competitorBase(cc),
      poi: typeof SABOR !== "undefined" ? SABOR.classifyPoi(place) : "urbano",
      ...(typeof SABOR !== "undefined" ? SABOR.streetFlags(place) : {}),
    };
  }

  function formatSettlement(place) {
    const name = place.city || place.municipality || "";
    const kind = place.settlementKind || "";
    const label = place.settlementLabel || (kind === "city" ? "Ciudad" : "Localidad");
    let title = name || place.countryName || "Ubicación";
    if (name) {
      if (kind === "city") title = "Ciudad de " + name;
      else if (kind === "town") title = "Villa de " + name;
      else if (kind === "village" || kind === "hamlet") title = "Pueblo de " + name;
      else if (kind === "municipality") title = "Municipio de " + name;
      else if (kind === "suburb" || kind === "neighbourhood") title = name;
      else title = name;
    }
    const sub = uniq([
      place.district && place.district !== name ? place.district : "",
      place.municipality && place.municipality !== name ? "Municipio de " + place.municipality : "",
      place.province && place.province !== name && place.province !== place.municipality ? place.province : "",
      place.region && place.region !== place.province && place.region !== name ? place.region : "",
      place.countryName,
    ]).join(" · ");
    return { title, subtitle: sub, label, name };
  }

  global.GEO = { reverse, reverseFast, search, enrich, blocked, formatSettlement, pickSettlement };
})(window);
