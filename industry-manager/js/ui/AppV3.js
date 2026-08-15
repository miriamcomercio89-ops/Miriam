/** Parches UI v3: click-to-build, búsqueda, campaña, planner, B2B, blueprints */
window.IM = window.IM || {};

(function patchUI() {
  const Proto = IM.UI && IM.UI.prototype;
  if (!Proto) return;

  const _nav = Proto.navButtons;
  Proto.navButtons = function () {
    const items = [
      ['mapa', 'Mapa'],
      ['campana', 'Campaña'],
      ['cadenas', 'Cadenas'],
      ['industria', 'Industria'],
      ['planner', 'Planificador'],
      ['dashboard', 'Dashboard'],
      ['automatizacion', 'Automación'],
      ['blueprints', 'Blueprints'],
      ['b2b', 'Clientes B2B'],
      ['almacen', 'Almacenes'],
      ['mercado', 'Mercado'],
      ['bolsa', 'Bolsa'],
      ['logistica', 'Logística'],
      ['investigacion', 'I+D'],
      ['finanzas', 'Finanzas'],
      ['misiones', 'Misiones'],
      ['contratos', 'Contratos'],
      ['enciclopedia', 'Enciclopedia'],
      ['competencia', 'Competencia'],
      ['eventos', 'Eventos'],
      ['ajustes', 'Ajustes'],
    ];
    return items.map(([id, label]) =>
      IM.el('button', {
        class: 'nav-btn',
        'data-panel': id,
        type: 'button',
        text: label,
        onclick: () => this.showPanel(id),
      })
    );
  };

  Proto.initMap = function () {
    const el = document.getElementById('map');
    if (!el || typeof L === 'undefined') return;
    this.map = L.map(el, { worldCopyJump: true, preferCanvas: true }).setView(IM_CONFIG.mapCenter, IM_CONFIG.mapDefaultZoom);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '&copy; OpenStreetMap',
    }).addTo(this.map);
    this.routeLayer = L.layerGroup().addTo(this.map);
    this.markerLayer = L.layerGroup().addTo(this.map);
    this.markers = {};

    this.map.on('click', async (e) => {
      if (this._geoBusy) return;
      this._geoBusy = true;
      this.toast('Detectando ciudad…');
      try {
        const r = await this.game.foundAtCoordinates(e.latlng.lat, e.latlng.lng);
        if (!r.ok) this.toast(r.error || 'No se pudo fundar', 'error');
        else {
          this.toast(`Fundado en ${r.loc?.name || 'ubicación'}`);
          this.game.state.ui.selectedLocationId = r.loc.id;
          this.rebuildMarkers();
          this.showPanel('industria');
        }
      } catch (err) {
        this.toast('Error de geocodificación', 'error');
      }
      this._geoBusy = false;
    });

    this.renderMapToolbar();
    this.rebuildMarkers();
    this._mapReady = true;
    setTimeout(() => this.map.invalidateSize(), 120);
  };

  Proto.renderMapToolbar = function () {
    const bar = document.getElementById('mapToolbar');
    if (!bar) return;
    bar.innerHTML = '';
    const search = IM.el('input', { class: 'input map-search', placeholder: 'Buscar ciudad real (OSM)…' });
    const btn = IM.el('button', {
      type: 'button',
      class: 'map-filter active',
      text: 'Buscar',
      onclick: async () => {
        const q = search.value.trim();
        if (!q) return;
        this.toast('Buscando…');
        const results = await IM.Geo.searchCity(q);
        if (!results.length) return this.toast('Sin resultados', 'error');
        const pick = results[0];
        this.map.setView([pick.lat, pick.lng], 10);
        this.toast(`${pick.name} — click en el mapa para fundar`);
      },
    });
    bar.append(search, btn);
    bar.append(
      IM.el('span', {
        class: 'map-hint',
        text: 'Click en el mapa = detectar ciudad (Nominatim) y fundar planta',
      })
    );
  };

  Proto.rebuildMarkers = function () {
    if (!this.map || !this.markerLayer) return;
    this.markerLayer.clearLayers();
    this.markers = {};
    const owned = new Set(this.game.state.sites.map((s) => s.locationId));
    (this.game.state.discoveredLocations || []).forEach((loc) => {
      const explored = !!this.game.state.fogExplored[loc.id];
      const marker = L.circleMarker([loc.lat, loc.lng], {
        radius: owned.has(loc.id) ? 9 : 6,
        color: owned.has(loc.id) ? '#7dffb3' : explored ? '#c4a35a' : '#666',
        weight: 2,
        fillColor: owned.has(loc.id) ? '#2d5a45' : '#1a2a32',
        fillOpacity: explored ? 0.9 : 0.5,
      });
      const fogTxt = explored
        ? (loc.resources || []).map((r) => `${IM.itemById(r.item)?.name || r.item}×${r.richness}`).join(', ')
        : 'Niebla — explora/funda para revelar';
      marker.bindTooltip(`${loc.name} (${loc.country}) · ${fogTxt}`);
      marker.on('click', (ev) => {
        L.DomEvent.stopPropagation(ev);
        this.game.state.ui.selectedLocationId = loc.id;
        this.showPanel('industria');
        this.refresh();
      });
      this.markers[loc.id] = marker;
      this.markerLayer.addLayer(marker);
    });
  };

  const _renderPanel = Proto.renderPanel;
  Proto.renderPanel = function (id) {
    const extras = {
      campana: 'Campaña',
      cadenas: 'Cadenas productivas',
      planner: 'Planificador de fábrica',
      blueprints: 'Blueprints',
      b2b: 'Clientes B2B',
    };
    if (!extras[id]) return _renderPanel.call(this, id);
    const header = document.getElementById('panelHeader');
    const body = document.getElementById('panelBody');
    header.innerHTML = '';
    header.append(IM.el('h1', { text: extras[id] }));
    body.innerHTML = '';
    if (id === 'campana') this.panelCampana(body);
    if (id === 'cadenas') this.panelCadenas(body);
    if (id === 'planner') this.panelPlanner(body);
    if (id === 'blueprints') this.panelBlueprints(body);
    if (id === 'b2b') this.panelB2B(body);
  };

  Proto.panelCampana = function (body) {
    const st = this.game.state;
    const ch = st.campaignChapter || 1;
    body.append(
      IM.el('p', {
        text: `Modo campaña únicamente · Capítulo ${ch} · Estación: ${st.season} · XP ${st.xp}`,
      })
    );
    (IM_DATA.campaignChapters || []).forEach((c) => {
      body.append(
        IM.el('div', { class: `mini-card${c.id <= ch ? ' done' : ''}` }, [
          IM.el('strong', { text: `${c.id}. ${c.name}` }),
          IM.el('p', { text: c.goal }),
          IM.el('small', { class: 'muted', text: `Desbloquea: ${(c.unlocks || []).join(', ')}` }),
        ])
      );
    });
    body.append(IM.el('h2', { text: 'Tipos de cambio' }));
    Object.entries(st.fx || {}).forEach(([k, v]) => {
      body.append(IM.el('div', { class: 'kv' }, [IM.el('span', { text: k }), IM.el('strong', { text: Number(v).toFixed(4) })]));
    });
  };

  Proto.panelCadenas = function (body) {
    const st = this.game.state;
    (IM_DATA.productChains || []).forEach((chain) => {
      const prog = st.chainProgress[chain.id] || { step: 0, done: false };
      const steps = IM.el('div', { class: 'chain-steps' });
      chain.steps.forEach((s, i) => {
        const it = IM.itemById(s.item);
        const done = prog.done || i < prog.step;
        const current = !prog.done && i === prog.step;
        steps.append(
          IM.el('div', { class: `chain-step${done ? ' done' : ''}${current ? ' current' : ''}` }, [
            IM.el('strong', { text: `${i + 1}. ${s.action === 'sell' ? 'Vender' : 'Producir'} ${it?.name || s.item} ×${s.qty}` }),
            IM.el('p', { class: 'muted', text: s.hint }),
          ])
        );
      });
      body.append(
        IM.el('div', { class: 'mini-card' }, [
          IM.el('strong', { text: chain.name + (prog.done ? ' ✓' : '') }),
          steps,
          IM.el('small', { text: `Recompensa ${IM.formatMoney(chain.reward.money || 0)}` }),
        ])
      );
    });
  };

  Proto.panelPlanner = function (body) {
    const st = this.game.state;
    if (!st.sites.length) {
      body.append(IM.el('p', { class: 'muted', text: 'Fundá una planta en el mapa primero.' }));
      return;
    }
    const sel = IM.el('select', { class: 'input' });
    st.sites.forEach((s) => {
      const loc = IM.locationById(s.locationId);
      sel.append(IM.el('option', { value: s.id, text: `${loc?.name || s.locationId} (${s.buildings.length} edif.)` }));
    });
    const out = IM.el('div', { class: 'planner-out' });
    const render = () => {
      const flow = this.game.getFactoryFlow(sel.value);
      out.innerHTML = '';
      if (!flow) return;
      const bottlenecks = flow.nodes.filter((n) => n.block);
      out.append(IM.el('h2', { text: 'Máquinas' }));
      flow.nodes.forEach((n) => {
        out.append(
          IM.el('div', { class: 'mini-card' }, [
            IM.el('strong', { text: n.label }),
            IM.el('p', { text: `${n.building} · prioridad ${n.priority} · condición ${((n.condition || 1) * 100).toFixed(0)}%` }),
            IM.el('p', { class: n.block ? 'alert-text' : 'muted', text: n.block ? `Cuello: ${n.block}` : 'OK' }),
          ])
        );
      });
      out.append(IM.el('h2', { text: 'Flujos' }));
      flow.edges.slice(0, 40).forEach((e) => {
        const a = e.kind === 'in' ? IM.itemById(e.from)?.name || e.from : e.from;
        const b = e.kind === 'out' ? IM.itemById(e.to)?.name || e.to : e.to;
        out.append(IM.el('div', { class: 'kv' }, [IM.el('span', { text: `${a} → ${b}` }), IM.el('strong', { text: `×${e.qty}` })]));
      });
      if (bottlenecks.length) {
        out.append(IM.el('h2', { text: 'Cuellos de botella' }));
        bottlenecks.forEach((n) => out.append(IM.el('div', { class: 'mini-card', text: `${n.label}: ${n.block}` })));
      }
    };
    sel.onchange = render;
    body.append(sel, out);
    render();
  };

  Proto.panelBlueprints = function (body) {
    const st = this.game.state;
    if (!this.game.campaignUnlocked('blueprints')) {
      body.append(IM.el('p', { class: 'muted', text: 'Desbloquea el capítulo 4 de campaña.' }));
    }
    const siteSel = IM.el('select', { class: 'input' });
    st.sites.forEach((s) => {
      const loc = IM.locationById(s.locationId);
      siteSel.append(IM.el('option', { value: s.id, text: loc?.name || s.id }));
    });
    const name = IM.el('input', { class: 'input', placeholder: 'Nombre blueprint', value: 'Mi planta' });
    body.append(
      IM.el('div', { class: 'toolbar' }, [
        siteSel,
        name,
        IM.el('button', {
          class: 'btn primary',
          type: 'button',
          text: 'Guardar blueprint',
          onclick: () => {
            const r = this.game.saveBlueprint(siteSel.value, name.value);
            this.toast(r.ok ? 'Guardado' : r.error, r.ok ? 'ok' : 'error');
            this.refresh();
          },
        }),
      ])
    );
    body.append(IM.el('h2', { text: 'Aplicar en ciudad seleccionada' }));
    (st.blueprints || []).forEach((bp) => {
      body.append(
        IM.el('div', { class: 'mini-card' }, [
          IM.el('strong', { text: bp.name }),
          IM.el('p', { text: `${bp.buildings.length} edificios` }),
          IM.el('button', {
            class: 'btn',
            type: 'button',
            text: 'Aplicar aquí',
            onclick: () => {
              const locId = st.ui.selectedLocationId;
              if (!locId) return this.toast('Selecciona ciudad', 'error');
              const r = this.game.applyBlueprint(locId, bp.id);
              this.toast(r.ok ? 'Aplicado' : r.error, r.ok ? 'ok' : 'error');
              this.rebuildMarkers();
              this.refresh();
            },
          }),
        ])
      );
    });

    body.append(IM.el('h2', { text: 'Auto-expandir por recurso' }));
    const item = IM.el('input', { class: 'input', value: 'aceituna' });
    const rich = IM.el('input', { class: 'input', type: 'number', value: '1.1', step: '0.1' });
    body.append(
      IM.el('div', { class: 'toolbar' }, [
        item,
        rich,
        IM.el('button', {
          class: 'btn',
          type: 'button',
          text: 'Auto-fundar (descubiertas)',
          onclick: async () => {
            const r = await this.game.autoExpandResource(item.value.trim(), Number(rich.value) || 1.1, 5);
            this.toast(r.ok ? `Creadas ${r.made}` : r.error, r.ok ? 'ok' : 'error');
            this.rebuildMarkers();
            this.refresh();
          },
        }),
      ])
    );
  };

  Proto.panelB2B = function (body) {
    const st = this.game.state;
    if (!this.game.campaignUnlocked('b2b')) {
      body.append(IM.el('p', { class: 'muted', text: 'Desbloquea clientes B2B en el capítulo 3.' }));
    }
    body.append(IM.el('h2', { text: 'Reputación' }));
    (IM_DATA.b2bClients || []).forEach((c) => {
      const rep = st.b2bReputation[c.id] ?? c.reputation;
      body.append(
        IM.el('div', { class: 'mini-card' }, [
          IM.el('strong', { text: c.name }),
          IM.el('div', { class: 'bar' }, [IM.el('div', { class: 'bar-fill', style: `width:${rep}%` })]),
          IM.el('small', { text: `Reputación ${rep} · pide ${(c.preferred || []).map((id) => IM.itemById(id)?.name || id).join(', ')}` }),
        ])
      );
    });
    body.append(IM.el('h2', { text: 'Pedidos activos' }));
    if (!st.b2bOrders?.length) body.append(IM.el('p', { class: 'muted', text: 'Sin pedidos. Aparecen con el tiempo.' }));
    (st.b2bOrders || []).forEach((o) => {
      const c = IM_DATA.b2bClients.find((x) => x.id === o.clientId);
      const it = IM.itemById(o.itemId);
      body.append(
        IM.el('div', { class: 'mini-card' }, [
          IM.el('strong', { text: `${c?.name}: ${it?.name} ×${o.qty}` }),
          IM.el('p', { text: `Calidad ≥ ${o.minQuality} · plazo día ${o.deadlineDay}${o.recurring ? ' · recurrente' : ''}` }),
        ])
      );
    });
  };

  const _inspector = Proto.refreshInspector;
  Proto.refreshInspector = function () {
    _inspector.call(this);
    const box = document.getElementById('inspector');
    if (!box) return;
    const st = this.game.state;
    const locId = st.ui.selectedLocationId;
    const loc = IM.locationById(locId);
    if (!loc) {
      box.append(IM.el('p', { class: 'muted', text: 'Click en el mapa para detectar una ciudad real (OSM) y fundar.' }));
      return;
    }
    if (!st.fogExplored[locId]) {
      box.append(
        IM.el('button', {
          class: 'btn',
          type: 'button',
          text: `Explorar niebla (${IM.formatMoney(IM_CONFIG.exploreCost)})`,
          onclick: () => {
            const r = this.game.exploreLocation(locId);
            this.toast(r.ok ? 'Revelado' : r.error, r.ok ? 'ok' : 'error');
            this.rebuildMarkers();
            this.refresh();
          },
        })
      );
    }
    box.append(IM.el('p', { class: 'muted', text: `Divisa local: ${loc.currency || 'EUR'} · especialización: ${loc.specialization || '—'}` }));
  };

  // Loc select should use discovered locations
  Proto.locSelect = function (selected, onChange) {
    const sel = IM.el('select', { class: 'input', onchange: (e) => onChange(e.target.value) });
    const locs = this.game.state.discoveredLocations || [];
    if (!locs.length) sel.append(IM.el('option', { value: '', text: 'Sin ciudades — click en mapa' }));
    locs.forEach((l) => {
      const opt = IM.el('option', { value: l.id, text: `${l.name} (${l.country})` });
      if (l.id === selected) opt.selected = true;
      sel.append(opt);
    });
    return sel;
  };
})();
