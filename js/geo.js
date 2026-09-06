/* Meridiano — geocodificación OSM (Photon, datos OpenStreetMap) */
(function (global) {
  const queue = U.throttleQueue(1100);
  const PHOTON = "https://photon.komoot.io";
  const NOM = "https://nominatim.openstreetmap.org";

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

  function fromPhoton(lat, lon, feat) {
    const p = feat.properties || {};
    const addr = [
      p.housenumber,
      p.street || p.name,
      p.district || p.suburb || p.neighbourhood,
      p.city || p.town || p.village || p.municipality,
      p.county || p.state,
      p.country,
    ]
      .filter(Boolean)
      .filter((v, i, a) => a.indexOf(v) === i);
    const city = p.city || p.town || p.village || p.municipality || p.name || "";
    const cc = (p.countrycode || "").toUpperCase();
    const gate = blocked(p);
    return {
      lat,
      lon,
      source: "photon",
      countryCode: cc,
      countryName: p.country || WORLD.country(cc).name,
      city,
      region: p.state || p.county || "",
      street: p.street || "",
      postcode: p.postcode || "",
      osmKey: p.osm_key || "",
      osmValue: p.osm_value || "",
      type: p.type || "",
      name: p.name || "",
      display: addr.join(", ") || city || WORLD.country(cc).name,
      ok: gate.ok,
      reason: gate.reason,
      residential: p.osm_value === "residential" || p.type === "house",
      commercial: /commercial|retail|industrial|office|yes/.test(p.osm_value || ""),
    };
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
      };
    }
    return fromPhoton(lat, lon, feat);
  }

  async function reverseNominatim(lat, lon) {
    const url = `${NOM}/reverse?format=jsonv2&lat=${lat}&lon=${lon}&addressdetails=1&extratags=1&accept-language=es`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Nominatim HTTP " + res.status);
    const j = await res.json();
    if (j.error) {
      return { lat, lon, ok: false, reason: "Nominatim no geocodifica este punto (agua o desierto cartográfico).", display: "" };
    }
    const a = j.address || {};
    const cc = (a.country_code || "").toUpperCase();
    const props = { osm_key: j.category || j.class, osm_value: j.type, type: j.type };
    const gate = blocked(props);
    const city = a.city || a.town || a.village || a.municipality || a.hamlet || "";
    return {
      lat,
      lon,
      source: "nominatim",
      countryCode: cc,
      countryName: a.country || WORLD.country(cc).name,
      city,
      region: a.state || a.region || "",
      street: a.road || "",
      postcode: a.postcode || "",
      osmKey: j.category || j.class || "",
      osmValue: j.type || "",
      type: j.type || "",
      name: j.name || "",
      display: j.display_name || "",
      ok: gate.ok,
      reason: gate.reason,
      residential: j.type === "residential" || j.type === "house",
      commercial: /commercial|retail/.test(j.type || ""),
    };
  }

  async function reverse(lat, lon) {
    return queue(async () => {
      try {
        return await reversePhoton(lat, lon);
      } catch (e) {
        try {
          return await reverseNominatim(lat, lon);
        } catch (e2) {
          return { lat, lon, ok: false, reason: "No se pudo consultar el mapa (red). Inténtalo de nuevo.", display: "" };
        }
      }
    });
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
          const bits = [p.name, p.city || p.town, p.state, p.country].filter(Boolean);
          return {
            label: bits.filter((v, i, a) => a.indexOf(v) === i).join(", "),
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

  function enrich(place) {
    const cc = place.countryCode;
    const ctry = WORLD.country(cc);
    const cityHit = WORLD.findCityByName(place.city, cc) || WORLD.nearestCity(place.lat, place.lon, 70);
    const popK = cityHit ? cityHit.popK : WORLD.estimatePopK(place);
    const tz = WORLD.tzOffset(cc, place.lon);
    return {
      ...place,
      countryName: place.countryName || ctry.name,
      popK,
      cityMatch: cityHit ? cityHit.name : place.city,
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

  global.GEO = { reverse, search, enrich, blocked };
})(window);
