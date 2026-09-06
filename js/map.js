/* Meridiano — mapa Leaflet, agregación por país/ciudad y clusters de marca */
(function (global) {
  let map, layer, game;
  let clickArmed = true;

  function init(g) {
    game = g;
    map = L.map("map", {
      zoomControl: false,
      worldCopyJump: true,
      minZoom: 2,
      maxZoom: 19,
    }).setView([22, 12], 3);

    /* Esri World Street Map: sin API key. Carto Voyager marca cada tesela con "API Key Required". */
    const esri = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}", {
      attribution: 'Teselas &copy; <a href="https://www.esri.com/">Esri</a> · datos &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);
    let osmFallback = false;
    let tileErrs = 0;
    esri.on("tileerror", () => {
      if (osmFallback) return;
      if (++tileErrs < 10) return;
      osmFallback = true;
      map.removeLayer(esri);
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);
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
      game.onMapClick(e.latlng.lat, e.latlng.lng);
    });
    map.on("moveend zoomend", () => refresh());
    map.on("mousemove", (e) => {
      if (!game || !game.state) return;
      const tip = document.getElementById("map-tip");
      if (!tip) return;
      const est = SABOR.estimateHover(e.latlng.lat, e.latlng.lng, game.state.gameTime);
      const land = est.distKm < 180;
      tip.style.display = "block";
      tip.style.left = e.originalEvent.clientX + 14 + "px";
      tip.style.top = e.originalEvent.clientY + 14 + "px";
      tip.innerHTML = `<b>${est.city}</b><div>${est.country}</div><div>Alquiler est. local ${U.formatMoney(est.rentMonthly)}/mes</div><div>${land ? "Probablemente edificable — clic para OSM" : "Lejos de ciudades: posible agua o desierto"}</div>`;
    });
    map.on("mouseout", () => {
      const tip = document.getElementById("map-tip");
      if (tip) tip.style.display = "none";
    });
    return map;
  }

  function brandIcon(brand, extra, size = 40) {
    const badge = extra
      ? `<span class="pin-badge">${extra > 999 ? "999+" : extra}</span>`
      : "";
    return L.divIcon({
      className: "brand-pin",
      html: `<div class="pin-wrap" style="--c:${brand.color};--c2:${brand.color2}">${brand.logo}${badge}</div>`,
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
    const logo = brand ? brand.logo : "";
    return L.divIcon({
      className: "city-pin",
      html: `<div class="city-bubble" style="--c:${brand ? brand.color : "#2a9d8f"}">${logo}<div><strong>${U.formatInt(count)}</strong><span>${name}</span></div></div>`,
      iconSize: [120, 44],
      iconAnchor: [60, 22],
    });
  }

  function filtered() {
    const f = game.filters;
    return game.state.restaurants.filter((r) => {
      if (f.brand && r.brandId !== f.brand) return false;
      if (f.cuisine) {
        const b = BRAND.get(r.brandId);
        if (!b || !b.cuisines.includes(f.cuisine)) return false;
      }
      if (f.country && r.country !== f.country) return false;
      if (f.status && r.status !== f.status) return false;
      if (f.profit === "gain" && r.finance.revTotal <= r.finance.costTotal) return false;
      if (f.profit === "loss" && r.finance.revTotal > r.finance.costTotal) return false;
      return true;
    });
  }

  function refresh() {
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
        const brand = BRAND.get(top[0]);
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
        const key = r.gh.slice(0, prec);
        if (!groups[key]) groups[key] = { n: 0, lat: 0, lon: 0, brands: {}, sample: r };
        groups[key].n++;
        groups[key].lat += r.lat;
        groups[key].lon += r.lon;
        groups[key].brands[r.brandId] = (groups[key].brands[r.brandId] || 0) + 1;
      }
      for (const g of Object.values(groups)) {
        const lat = g.lat / g.n;
        const lon = g.lon / g.n;
        const top = Object.entries(g.brands).sort((a, c) => c[1] - a[1])[0];
        const brand = BRAND.get(top[0]);
        if (g.n === 1) {
          addRest(g.sample);
        } else {
          const m = L.marker([lat, lon], { icon: brandIcon(brand, g.n, 46), keyboard: false });
          m.on("click", (ev) => {
            L.DomEvent.stop(ev);
            map.setView([lat, lon], Math.min(19, z + 2));
          });
          m.addTo(layer);
        }
      }
      return;
    }
    for (const r of vis) addRest(r);
  }

  function addRest(r) {
    const brand = BRAND.get(r.brandId);
    const profit = (r.finance.revTotal || 0) - (r.finance.costTotal || 0);
    const heat = game.heatmap ? (profit >= 0 ? " pin-gain" : " pin-loss") : "";
    const extra = r.size === "food_hall" ? 1 + (r.hallBrands || []).length : r.size === "ghost" ? "CF" : 0;
    const m = L.marker([r.lat, r.lon], { icon: brandIcon(brand, extra, r.size === "food_hall" ? 48 : 42), keyboard: false });
    if (heat || r.size === "ghost" || r.size === "food_hall") {
      const ic = m.options.icon;
      let cls = "pin-wrap" + heat;
      if (r.size === "ghost") cls += " pin-ghost";
      if (r.size === "food_hall") cls += " pin-hall";
      ic.options.html = ic.options.html.replace('class="pin-wrap"', 'class="' + cls + '"');
    }
    m.on("click", (ev) => {
      L.DomEvent.stop(ev);
      game.openRestaurant(r.id);
    });
    m.addTo(layer);
  }

  function fly(lat, lon, zoom = 14) {
    map.setView([lat, lon], zoom, { animate: true });
  }

  function invalidate() {
    setTimeout(() => map && map.invalidateSize(), 60);
  }

  function jumpProfit(best) {
    const list = game.state.restaurants.filter((r) => r.status === "abierto");
    if (!list.length) return;
    list.sort((a, b) => {
      const pa = a.finance.revTotal - a.finance.costTotal;
      const pb = b.finance.revTotal - b.finance.costTotal;
      return best ? pb - pa : pa - pb;
    });
    const r = list[0];
    fly(r.lat, r.lon, 15);
    game.openRestaurant(r.id);
  }

  function dotsThumb() {
    const c = document.createElement("canvas");
    c.width = 200;
    c.height = 110;
    const g = c.getContext("2d");
    g.fillStyle = "#d5e4d0";
    g.fillRect(0, 0, 200, 110);
    g.fillStyle = "#0f7a6c";
    const list = (game.state && game.state.restaurants) || [];
    for (const r of list.slice(0, 2000)) {
      const x = ((r.lon + 180) / 360) * 200;
      const y = ((90 - r.lat) / 180) * 110;
      g.fillRect(x, y, 2, 2);
    }
    return c.toDataURL("image/png");
  }

  global.MAP = { init, refresh, fly, invalidate, get: () => map, jumpProfit, dotsThumb };
})(window);
