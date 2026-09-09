/* Horizon Group — mapa Leaflet, agregación por país/ciudad y clusters de marca.
   Un solo mapa para restaurantes (Horizon Restaurant Group) y hoteles (Horizon
   Hotels): cada venue trae su propio `kind` ("restaurant"|"hotel") y se resuelve
   su marca contra BRAND (restaurantes) o HBRAND (hoteles) según corresponda. */
(function (global) {
  let map, layer, game, searchPin;
  let clickArmed = true;

  function brandOf(v) {
    return v.kind === "hotel" ? HBRAND.get(v.brandId) : BRAND.get(v.brandId);
  }

  function init(g) {
    game = g;
    map = L.map("map", {
      zoomControl: false,
      worldCopyJump: true,
      minZoom: 2,
      maxZoom: 19,
    }).setView([22, 12], 3);

    /* Mundo: satélite Esri (océanos y continentes de color).
       Ciudad: OSM Carto (parques, agua, calles). Sin API key.
       Carto Voyager marca "API Key Required" en cada tesela. */
    const sat = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
      maxZoom: 6,
      maxNativeZoom: 19,
      className: "basemap-sat",
      attribution: 'Imágenes &copy; <a href="https://www.esri.com/">Esri</a>',
    }).addTo(map);
    const osm = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      minZoom: 7,
      maxZoom: 19,
      className: "basemap-vivid",
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);
    const esriTopo = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}", {
      minZoom: 7,
      maxZoom: 19,
      className: "basemap-vivid",
      attribution: 'Teselas &copy; <a href="https://www.esri.com/">Esri</a>',
    });
    let swapped = false;
    let tileErrs = 0;
    osm.on("tileerror", () => {
      if (swapped) return;
      if (++tileErrs < 8) return;
      swapped = true;
      map.removeLayer(osm);
      esriTopo.addTo(map);
    });

    L.control.zoom({ position: "bottomright" }).addTo(map);
    layer = L.layerGroup().addTo(map);

    map.on("dragstart", () => {
      clickArmed = false;
    });
    map.on("click", (e) => {
      if (!clickArmed) {
        clickArmed = true;
        return;
      }
      clearSearchPin();
      game.onMapClick(e.latlng.lat, e.latlng.lng);
    });
    map.on("moveend zoomend", () => refresh());
    let hoverTimer = 0;
    let hoverSeq = 0;
    map.on("mousemove", (e) => {
      if (!game || !game.state) return;
      const tip = document.getElementById("map-tip");
      if (!tip) return;
      const lat = e.latlng.lat;
      const lon = e.latlng.lng;
      const est = SABOR.estimateHover(lat, lon, game.state.gameTime);
      const land = est.distKm < 180;
      tip.style.display = "block";
      tip.style.left = e.originalEvent.clientX + 14 + "px";
      tip.style.top = e.originalEvent.clientY + 14 + "px";
      tip.innerHTML = `<b>${est.city}</b><div>${est.country}${est.hint ? " · " + est.hint : ""}</div><div>Alquiler est. local ${U.formatMoney(est.rentMonthly)}/mes</div><div>${land ? "Identificando núcleo OSM…" : "Lejos de ciudades: posible agua o desierto"}</div>`;
      const seq = ++hoverSeq;
      clearTimeout(hoverTimer);
      hoverTimer = setTimeout(() => {
        GEO.reverseFast(lat, lon)
          .then((raw) => {
            if (seq !== hoverSeq) return;
            const p = GEO.enrich(raw);
            const sett = GEO.formatSettlement(p);
            const where = p.city ? sett.title : est.city;
            tip.innerHTML = `<b>${where}</b><div>${sett.subtitle || est.country}</div><div>${p.settlementLabel ? p.settlementLabel + " · " : ""}Pob. est. ${U.formatInt((p.popK || 0) * 1000)}</div><div>Alquiler est. local ${U.formatMoney(est.rentMonthly)}/mes</div><div>${p.ok === false ? p.reason : "Clic para abrir ficha de construcción"}</div>`;
          })
          .catch(() => {});
      }, 320);
    });
    map.on("mouseout", () => {
      const tip = document.getElementById("map-tip");
      if (tip) tip.style.display = "none";
      clearTimeout(hoverTimer);
    });
    return map;
  }

  function pinLogo(brand, px) {
    const src = (brand && brand.logoFile) || "";
    const s = `${px}px`;
    return `<img class="pin-logo" src="${src}" alt="" width="${px}" height="${px}" decoding="async" style="width:${s};height:${s};max-width:${s};max-height:${s};object-fit:cover;display:block;flex-shrink:0">`;
  }

  function brandIcon(brand, extra, size = 36) {
    const badge = extra
      ? `<span class="pin-badge">${extra > 999 ? "999+" : extra}</span>`
      : "";
    return L.divIcon({
      className: "brand-pin",
      html: `<div class="pin-wrap" style="width:${size}px;height:${size}px;--c:${brand.color};--c2:${brand.color2}">${pinLogo(brand, size)}${badge}</div>`,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
    });
  }

  function countryIcon(count, name) {
    return L.divIcon({
      className: "agg-pin",
      html: `<div class="agg-bubble"><strong>${U.formatInt(count)}</strong><span>${name}</span></div>`,
      iconSize: [88, 54],
      iconAnchor: [44, 27],
    });
  }

  function cityIcon(count, name, brand) {
    const logo = brand ? pinLogo(brand, 28) : "";
    return L.divIcon({
      className: "city-pin",
      html: `<div class="city-bubble" style="--c:${brand ? brand.color : "#2a9d8f"}">${logo}<div><strong>${U.formatInt(count)}</strong><span>${name}</span></div></div>`,
      iconSize: [132, 44],
      iconAnchor: [66, 22],
    });
  }

  function allVenues() {
    const s = game.state;
    if (!s) return [];
    return (s.restaurants || []).concat(s.hotels || []);
  }

  function filtered() {
    const f = game.filters;
    return allVenues().filter((r) => {
      if (r.hallParentId) return false;
      if (f.kind && r.kind !== f.kind) return false;
      if (f.brand && r.brandId !== f.brand) return false;
      if (f.cuisine) {
        if (r.kind === "hotel") {
          const b = HBRAND.get(r.brandId);
          if (!b || b.segment !== f.cuisine) return false;
        } else {
          const b = BRAND.get(r.brandId);
          if (!b || !b.cuisines.includes(f.cuisine)) return false;
        }
      }
      if (f.country && r.country !== f.country) return false;
      if (f.status && r.status !== f.status) return false;
      if (f.profit === "gain" && r.finance.revTotal <= r.finance.costTotal) return false;
      if (f.profit === "loss" && r.finance.revTotal > r.finance.costTotal) return false;
      return true;
    });
  }

  let refreshErrorShown = false;
  function refresh() {
    try {
      refreshInner();
    } catch (err) {
      console.error("MAP.refresh", err);
      if (!refreshErrorShown && game && typeof UI !== "undefined" && UI.toast) {
        refreshErrorShown = true;
        UI.toast("Algún local tenía datos incompletos: se ha omitido para no romper el mapa. El resto se ve con normalidad.", true);
      }
    }
  }

  function refreshInner() {
    if (!map) return;
    layer.clearLayers();
    const list = filtered();
    const z = map.getZoom();
    const b = map.getBounds();

    if (z < 4) {
      const by = {};
      for (const r of list) {
        by[r.country] = (by[r.country] || 0) + 1;
      }
      for (const [cc, n] of Object.entries(by)) {
        const c = WORLD.country(cc);
        const m = L.marker([c.lat, c.lon], { icon: countryIcon(n, c.name), keyboard: false });
        m.on("click", (ev) => {
          L.DomEvent.stop(ev);
          map.setView([c.lat, c.lon], 6);
        });
        m.addTo(layer);
      }
      return;
    }

    if (z < 8) {
      const by = {};
      for (const r of list) {
        const key = r.city ? r.country + "|" + r.city : r.country + "|·";
        if (!by[key]) by[key] = { n: 0, lat: 0, lon: 0, name: r.city || WORLD.country(r.country).name, brands: {}, country: r.country };
        by[key].n++;
        by[key].lat += r.lat;
        by[key].lon += r.lon;
        by[key].brands[r.brandId] = (by[key].brands[r.brandId] || 0) + 1;
      }
      for (const g of Object.values(by)) {
        const lat = g.lat / g.n;
        const lon = g.lon / g.n;
        if (!b.contains([lat, lon])) continue;
        const top = Object.entries(g.brands).sort((a, c) => c[1] - a[1])[0];
        const sample = list.find((r) => r.brandId === top[0]);
        const brand = sample ? brandOf(sample) : null;
        const m = L.marker([lat, lon], { icon: cityIcon(g.n, g.name, brand), keyboard: false });
        m.on("click", (ev) => {
          L.DomEvent.stop(ev);
          map.setView([lat, lon], 12);
        });
        m.addTo(layer);
      }
      return;
    }

    const vis = list.filter((r) => b.contains([r.lat, r.lon]));
    if (game.state) {
      game.state._vp = new Set(vis.map((r) => r.id));
      if (game.openId) game.state._openId = game.openId;
    }
    const maxPins = z >= 14 ? 220 : 120;
    if (vis.length > maxPins || z < 12) {
      const prec = z >= 12 ? 6 : z >= 10 ? 5 : 4;
      const groups = {};
      for (const r of vis) {
        /* Un local de una partida antigua (o de un JSON importado sin este
           campo) puede no traer geohash: si no, un solo registro así
           reventaba el refresco entero del mapa (y con él, cualquier
           local construido dejaba de verse tras importar). */
        const gh = r.gh || U.geohash(r.lat, r.lon, 6);
        const key = gh.slice(0, prec);
        if (!groups[key]) groups[key] = { n: 0, lat: 0, lon: 0, brands: {}, sample: r };
        groups[key].n++;
        groups[key].lat += r.lat;
        groups[key].lon += r.lon;
        groups[key].brands[r.brandId] = (groups[key].brands[r.brandId] || 0) + 1;
      }
      for (const g of Object.values(groups)) {
        const lat = g.lat / g.n;
        const lon = g.lon / g.n;
        const brand = brandOf(g.sample);
        if (g.n === 1) {
          addVenue(g.sample);
        } else {
          const m = L.marker([lat, lon], { icon: brandIcon(brand, g.n, 66), keyboard: false });
          m.on("click", (ev) => {
            L.DomEvent.stop(ev);
            map.setView([lat, lon], Math.min(19, z + 2));
          });
          m.addTo(layer);
        }
      }
      return;
    }
    for (const r of vis) addVenue(r);
  }

  function addVenue(r) {
    const brand = brandOf(r);
    if (!brand) return;
    const profit = (r.finance.revTotal || 0) - (r.finance.costTotal || 0);
    const heat = game.heatmap ? (profit >= 0 ? " pin-gain" : " pin-loss") : "";
    const isHotel = r.kind === "hotel";
    const extra = !isHotel && r.size === "food_hall" ? 1 + (r.hallBrands || []).length : !isHotel && r.size === "ghost" ? "CF" : 0;
    const size = !isHotel && r.size === "food_hall" ? 92 : 82;
    const m = L.marker([r.lat, r.lon], { icon: brandIcon(brand, extra, size), keyboard: false });
    if (heat || (!isHotel && (r.size === "ghost" || r.size === "food_hall"))) {
      const ic = m.options.icon;
      let cls = "pin-wrap" + heat;
      if (!isHotel && r.size === "ghost") cls += " pin-ghost";
      if (!isHotel && r.size === "food_hall") cls += " pin-hall";
      ic.options.html = ic.options.html.replace('class="pin-wrap"', 'class="' + cls + '"');
    }
    m.on("click", (ev) => {
      L.DomEvent.stop(ev);
      if (isHotel) game.openHotel(r.id);
      else game.openRestaurant(r.id);
    });
    m.addTo(layer);
  }

  function fly(lat, lon, zoom = 14) {
    map.setView([lat, lon], zoom, { animate: true });
  }

  function searchIcon() {
    return L.divIcon({
      className: "search-pin",
      html: '<div class="search-pin-drop"></div><div class="search-pin-dot"></div>',
      iconSize: [34, 46],
      iconAnchor: [17, 44],
    });
  }

  function dropSearchPin(lat, lon, label) {
    clearSearchPin();
    searchPin = L.marker([lat, lon], { icon: searchIcon(), keyboard: false, zIndexOffset: 1000 });
    if (label) searchPin.bindTooltip(label, { permanent: false, direction: "top", offset: [0, -44] });
    searchPin.addTo(map);
  }

  function clearSearchPin() {
    if (searchPin) {
      map.removeLayer(searchPin);
      searchPin = null;
    }
  }

  function invalidate() {
    setTimeout(() => map && map.invalidateSize(), 60);
  }

  function jumpProfit(best) {
    const list = allVenues().filter((r) => r.status === "abierto");
    if (!list.length) return;
    list.sort((a, b) => {
      const pa = a.finance.revTotal - a.finance.costTotal;
      const pb = b.finance.revTotal - b.finance.costTotal;
      return best ? pb - pa : pa - pb;
    });
    const r = list[0];
    fly(r.lat, r.lon, 15);
    if (r.kind === "hotel") game.openHotel(r.id);
    else game.openRestaurant(r.id);
  }

  function dotsThumb() {
    const c = document.createElement("canvas");
    c.width = 200;
    c.height = 110;
    const g = c.getContext("2d");
    g.fillStyle = "#7ec8e8";
    g.fillRect(0, 0, 200, 110);
    g.fillStyle = "#1a9b4a";
    g.fillRect(0, 28, 200, 62);
    g.fillStyle = "#e85d04";
    const list = allVenues();
    for (const r of list.slice(0, 2000)) {
      const x = ((r.lon + 180) / 360) * 200;
      const y = ((90 - r.lat) / 180) * 110;
      g.fillRect(x, y, 2, 2);
    }
    return c.toDataURL("image/png");
  }

  global.MAP = { init, refresh, fly, invalidate, get: () => map, jumpProfit, dotsThumb, dropSearchPin, clearSearchPin };
})(window);
