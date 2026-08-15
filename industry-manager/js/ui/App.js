/** UI Industry Manager v2 */
window.IM = window.IM || {};

IM.UI = class UI {
  constructor(game) {
    this.game = game;
    this.map = null;
    this.cluster = null;
    this.routeLayer = null;
    this.markers = {};
    this.root = document.getElementById('app');
    this._mapReady = false;
    this._filter = 'all';
  }

  mount() {
    this.root.innerHTML = '';
    this.root.appendChild(this.renderShell());
    this.initMap();
    this.bindKeys();
    this.game.onChange(() => this.refresh());
    this.refresh();
    this.showPanel(this.game.state.ui.panel || 'mapa');
  }

  renderShell() {
    return IM.el('div', { class: 'shell' }, [
      IM.el('header', { class: 'topbar', id: 'topbar' }),
      IM.el('div', { class: 'main' }, [
        IM.el('nav', { class: 'sidebar', id: 'sidebar' }, this.navButtons()),
        IM.el('section', { class: 'content' }, [
          IM.el('div', { class: 'map-wrap', id: 'mapWrap' }, [
            IM.el('div', { id: 'map', class: 'map' }),
            IM.el('div', { class: 'map-toolbar', id: 'mapToolbar' }),
            IM.el('div', { class: 'map-overlay', id: 'mapOverlay' }),
          ]),
          IM.el('div', { class: 'panel-wrap hidden', id: 'panelWrap' }, [
            IM.el('div', { class: 'panel-header', id: 'panelHeader' }),
            IM.el('div', { class: 'panel-body', id: 'panelBody' }),
          ]),
        ]),
        IM.el('aside', { class: 'inspector', id: 'inspector' }),
      ]),
      IM.el('div', { class: 'toast-host', id: 'toasts' }),
      IM.el('dialog', { id: 'modal' }, [IM.el('form', { method: 'dialog', class: 'modal-inner', id: 'modalInner' })]),
    ]);
  }

  navButtons() {
    const items = [
      ['mapa', 'Mapa'],
      ['industria', 'Industria'],
      ['dashboard', 'Dashboard'],
      ['automatizacion', 'Automación'],
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
  }

  bindKeys() {
    document.addEventListener('keydown', (e) => {
      if (e.target.matches('input, textarea, select')) return;
      const map = {
        Space: () => this.game.setSpeed(this.game.state.paused ? this.game.state.speed || 1 : 0),
        Digit1: () => this.game.setSpeed(1),
        Digit2: () => this.game.setSpeed(2),
        Digit3: () => this.game.setSpeed(5),
        Digit4: () => this.game.setSpeed(10),
        Digit5: () => this.game.setSpeed(30),
        KeyM: () => this.showPanel('mapa'),
        KeyI: () => this.showPanel('industria'),
        KeyD: () => this.showPanel('dashboard'),
        KeyA: () => this.showPanel('automatizacion'),
        KeyE: () => this.showPanel('enciclopedia'),
        KeyB: () => this.showPanel('bolsa'),
        KeyL: () => this.showPanel('logistica'),
        Escape: () => {
          const modal = document.getElementById('modal');
          if (modal?.open) modal.close();
        },
      };
      const fn = map[e.code];
      if (fn) {
        e.preventDefault();
        fn();
      }
    });
  }

  initMap() {
    const el = document.getElementById('map');
    if (!el || typeof L === 'undefined') return;
    this.map = L.map(el, { worldCopyJump: true, preferCanvas: true }).setView(IM_CONFIG.mapCenter, IM_CONFIG.mapDefaultZoom);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '&copy; OpenStreetMap',
    }).addTo(this.map);
    this.routeLayer = L.layerGroup().addTo(this.map);

    const useCluster = typeof L.markerClusterGroup === 'function';
    this.cluster = useCluster
      ? L.markerClusterGroup({ chunkedLoading: true, maxClusterRadius: 45 })
      : L.layerGroup();
    this.map.addLayer(this.cluster);

    this.renderMapToolbar();
    this.rebuildMarkers();
    this._mapReady = true;
    setTimeout(() => this.map.invalidateSize(), 120);
  }

  renderMapToolbar() {
    const bar = document.getElementById('mapToolbar');
    if (!bar) return;
    bar.innerHTML = '';
    const types = ['all', 'hub', 'port', 'industrial', 'mining', 'energy', 'agro', 'electronics', 'logistics'];
    types.forEach((t) => {
      bar.append(
        IM.el('button', {
          type: 'button',
          class: `map-filter${this._filter === t ? ' active' : ''}`,
          text: t === 'all' ? 'Todas' : t,
          onclick: () => {
            this._filter = t;
            this.game.state.ui.mapFilter = t;
            this.rebuildMarkers();
            this.renderMapToolbar();
          },
        })
      );
    });
    bar.append(
      IM.el('button', {
        type: 'button',
        class: 'map-filter',
        text: 'Mis plantas',
        onclick: () => {
          this._filter = 'owned';
          this.rebuildMarkers();
          this.renderMapToolbar();
        },
      })
    );
  }

  rebuildMarkers() {
    if (!this.map || !this.cluster) return;
    this.cluster.clearLayers();
    this.markers = {};
    const owned = new Set(this.game.state.sites.map((s) => s.locationId));
    const aiLocs = new Set();
    this.game.state.competitors.forEach((c) => (c.sites || []).forEach((s) => aiLocs.add(s.locationId)));
    const filter = this._filter || 'all';

    (IM_DATA.locations || []).forEach((loc) => {
      if (filter === 'owned' && !owned.has(loc.id)) return;
      if (filter !== 'all' && filter !== 'owned' && loc.type !== filter) return;

      const color = owned.has(loc.id) ? '#7dffb3' : aiLocs.has(loc.id) ? '#ff8f6b' : '#c4a35a';
      const marker = L.circleMarker([loc.lat, loc.lng], {
        radius: owned.has(loc.id) ? 7 : 4,
        color,
        weight: 1.5,
        fillColor: owned.has(loc.id) ? '#2d5a45' : '#1a2a32',
        fillOpacity: 0.9,
      });
      marker.bindTooltip(`${loc.name} · ${loc.country} · ${loc.type}`);
      marker.on('click', () => {
        this.game.state.ui.selectedLocationId = loc.id;
        this.showPanel('industria');
        this.refresh();
      });
      this.markers[loc.id] = marker;
      this.cluster.addLayer(marker);
    });
  }

  drawRoutes() {
    if (!this.routeLayer) return;
    this.routeLayer.clearLayers();
    this.game.state.shipments.forEach((sh) => {
      if (!sh.path) return;
      L.polyline(sh.path, { color: '#c4a35a', weight: 2, opacity: 0.75, dashArray: '6 8' }).addTo(this.routeLayer);
    });
  }

  showPanel(id) {
    this.game.state.ui.panel = id;
    const mapWrap = document.getElementById('mapWrap');
    const panelWrap = document.getElementById('panelWrap');
    document.querySelectorAll('.nav-btn').forEach((b) => b.classList.toggle('active', b.dataset.panel === id));
    if (id === 'mapa') {
      mapWrap.classList.remove('hidden');
      panelWrap.classList.add('hidden');
      if (this.map) setTimeout(() => this.map.invalidateSize(), 50);
      this.drawRoutes();
    } else {
      mapWrap.classList.add('hidden');
      panelWrap.classList.remove('hidden');
      this.renderPanel(id);
    }
    this.refreshInspector();
  }

  refresh() {
    this.renderTopbar();
    this.refreshInspector();
    const panel = this.game.state.ui.panel;
    if (panel && panel !== 'mapa') this.renderPanel(panel);
    else this.drawRoutes();
    this.updateOverlay();
  }

  updateOverlay() {
    const overlay = document.getElementById('mapOverlay');
    if (!overlay) return;
    const s = IM_DATA.summary || {};
    overlay.textContent = `${s.locations || 0} ciudades · ${s.items || 0} ítems · ${s.recipes || 0} recetas · envíos ${this.game.state.shipments.length}`;
  }

  renderTopbar() {
    const st = this.game.state;
    const bar = document.getElementById('topbar');
    if (!bar) return;
    bar.innerHTML = '';
    bar.append(
      IM.el('div', { class: 'brand' }, [
        IM.el('span', { class: 'brand-mark', text: 'IM' }),
        IM.el('div', {}, [
          IM.el('strong', { text: 'Industry Manager' }),
          IM.el('small', { text: st.companyName }),
        ]),
      ]),
      IM.el('div', { class: 'stat' }, [IM.el('span', { class: 'label', text: 'Tesorería' }), IM.el('strong', { text: IM.formatMoney(st.money) })]),
      IM.el('div', { class: 'stat' }, [IM.el('span', { class: 'label', text: 'Tiempo' }), IM.el('strong', { text: IM.formatGameTime(st) })]),
      IM.el('div', { class: 'stat' }, [IM.el('span', { class: 'label', text: 'Plantas' }), IM.el('strong', { text: String(st.sites.length) })]),
      IM.el('div', { class: 'stat' }, [IM.el('span', { class: 'label', text: 'Empleados' }), IM.el('strong', { text: String(st.employees) })]),
      IM.el('div', { class: 'stat' }, [IM.el('span', { class: 'label', text: 'Polución' }), IM.el('strong', { text: IM.formatNum(st.pollutionTotal, 2) })]),
      IM.el('div', { class: 'speed-controls' }, [
        ...[0, 1, 2, 5, 10, 30].map((s) =>
          IM.el('button', {
            type: 'button',
            class: `speed-btn${(st.paused && s === 0) || (!st.paused && st.speed === s) ? ' active' : ''}`,
            text: s === 0 ? '⏸' : `${s}×`,
            onclick: () => this.game.setSpeed(s === 0 ? 0 : s),
          })
        ),
        IM.el('button', {
          type: 'button',
          class: 'speed-btn',
          text: 'Guardar',
          onclick: () => {
            IM.Save.save(st);
            this.toast('Guardado');
          },
        }),
      ])
    );
  }

  refreshInspector() {
    const box = document.getElementById('inspector');
    if (!box) return;
    const st = this.game.state;
    const locId = st.ui.selectedLocationId;
    const loc = IM.locationById(locId);
    const site = st.sites.find((s) => s.locationId === locId);
    box.innerHTML = '';
    box.append(
      IM.el('h2', { text: loc ? loc.name : 'Sin ciudad' }),
      IM.el('p', {
        class: 'muted',
        text: loc
          ? `${loc.country} · ${loc.type} · arancel ${((loc.tariffs || 0) * 100).toFixed(1)}% · límite pol. ${loc.pollutionLimit || '—'}`
          : 'Selecciona una ciudad en el mapa',
      })
    );
    if (!loc) return;

    box.append(
      IM.el('div', { class: 'kv' }, [IM.el('span', { text: 'Labor / Energía' }), IM.el('strong', { text: `×${loc.laborCost?.toFixed?.(2) || loc.laborCost} / ×${loc.energyCost?.toFixed?.(2) || loc.energyCost}` })]),
      IM.el('div', { class: 'kv' }, [
        IM.el('span', { text: 'Infra' }),
        IM.el('strong', {
          text: `${loc.hasPort ? 'Puerto ' : ''}${loc.hasRail ? 'Rail ' : ''}${loc.hasAirport ? 'Aerop.' : '—'}`,
        }),
      ]),
      IM.el('div', { class: 'kv' }, [
        IM.el('span', { text: 'Almacén' }),
        IM.el('strong', {
          text: site
            ? `${IM.formatNum(this.game.usedStorage(locId), 0)}/${IM.formatNum(this.game.storageCap(locId), 0)}`
            : '—',
        }),
      ])
    );

    box.append(IM.el('h3', { text: 'Recursos regionales' }));
    (loc.resources || []).forEach((r) => {
      const it = IM.itemById(r.item);
      box.append(
        IM.el('div', { class: 'kv' }, [
          IM.el('span', { text: it?.name || r.item }),
          IM.el('strong', { text: `×${r.richness}` }),
        ])
      );
    });

    if (!site) {
      box.append(
        IM.el('button', {
          class: 'btn primary',
          type: 'button',
          text: `Fundar oficina (${IM.formatMoney(IM_CONFIG.foundingOfficeCost)})`,
          onclick: () => {
            const r = this.game.foundInCity(locId);
            this.toast(r.ok ? 'Ciudad fundada' : r.error, r.ok ? 'ok' : 'error');
            this.rebuildMarkers();
            this.refresh();
          },
        })
      );
    } else {
      box.append(IM.el('p', { text: `${site.buildings.length} edificios · OEE ${(this.game.oeeForLocation(locId) * 100).toFixed(0)}%` }));
      box.append(
        IM.el('button', {
          class: 'btn',
          type: 'button',
          text: 'Zoom a planta',
          onclick: () => {
            this.showPanel('mapa');
            this.map?.setView([loc.lat, loc.lng], 8);
          },
        })
      );
    }

    box.append(IM.el('h3', { text: 'Atajos' }));
    box.append(IM.el('p', { class: 'muted', text: 'Espacio pausa · 1-5 velocidad · M mapa · I industria · D dashboard · A automación · B bolsa · E enciclopedia' }));

    box.append(IM.el('h3', { text: 'Log' }));
    const log = IM.el('div', { class: 'log-list' });
    st.log.slice(0, 10).forEach((e) => log.append(IM.el('div', { class: `log-item ${e.type}`, text: e.msg })));
    box.append(log);
  }

  renderPanel(id) {
    const header = document.getElementById('panelHeader');
    const body = document.getElementById('panelBody');
    if (!header || !body) return;
    const titles = {
      industria: 'Industria y fábricas',
      dashboard: 'Dashboard de planta',
      automatizacion: 'Automatización',
      almacen: 'Almacenes',
      mercado: 'Mercado',
      bolsa: 'Bolsa de materias primas',
      logistica: 'Logística intermodal',
      investigacion: 'I+D',
      finanzas: 'Finanzas',
      misiones: 'Misiones',
      contratos: 'Contratos',
      enciclopedia: 'Enciclopedia',
      competencia: 'Competencia IA',
      eventos: 'Eventos',
      ajustes: 'Ajustes',
    };
    header.innerHTML = '';
    header.append(IM.el('h1', { text: titles[id] || id }));
    body.innerHTML = '';
    const fn = {
      industria: () => this.panelIndustria(body),
      dashboard: () => this.panelDashboard(body),
      automatizacion: () => this.panelAuto(body),
      almacen: () => this.panelAlmacen(body),
      mercado: () => this.panelMercado(body),
      bolsa: () => this.panelBolsa(body),
      logistica: () => this.panelLogistica(body),
      investigacion: () => this.panelResearch(body),
      finanzas: () => this.panelFinanzas(body),
      misiones: () => this.panelMisiones(body),
      contratos: () => this.panelContratos(body),
      enciclopedia: () => this.panelEnciclopedia(body),
      competencia: () => this.panelCompetencia(body),
      eventos: () => this.panelEventos(body),
      ajustes: () => this.panelAjustes(body),
    }[id];
    if (fn) fn();
  }

  locSelect(selected, onChange) {
    const sel = IM.el('select', { class: 'input', onchange: (e) => onChange(e.target.value) });
    const owned = new Set(this.game.state.sites.map((s) => s.locationId));
    // Prioritize owned + selected, then sample
    const locs = IM_DATA.locations || [];
    const preferred = locs.filter((l) => owned.has(l.id) || l.id === selected);
    const rest = locs.filter((l) => !owned.has(l.id) && l.id !== selected).slice(0, 400);
    [...preferred, ...rest].forEach((l) => {
      const opt = IM.el('option', {
        value: l.id,
        text: `${owned.has(l.id) ? '★ ' : ''}${l.name} (${l.country})`,
      });
      if (l.id === selected) opt.selected = true;
      sel.append(opt);
    });
    return sel;
  }

  openModal(buildFn) {
    const modal = document.getElementById('modal');
    const inner = document.getElementById('modalInner');
    inner.innerHTML = '';
    this.game.pauseForModal(true);
    buildFn(inner, modal);
    modal.addEventListener(
      'close',
      () => {
        this.game.pauseForModal(false);
      },
      { once: true }
    );
    modal.showModal();
  }

  panelIndustria(body) {
    const st = this.game.state;
    let locId = st.ui.selectedLocationId || IM_CONFIG.startingLocation;
    body.append(
      IM.el('div', { class: 'toolbar' }, [
        IM.el('label', { text: 'Ciudad' }),
        this.locSelect(locId, (v) => {
          st.ui.selectedLocationId = v;
          this.refresh();
        }),
      ])
    );
    locId = st.ui.selectedLocationId;
    const site = st.sites.find((s) => s.locationId === locId);
    if (!site) {
      body.append(IM.el('p', { class: 'muted', text: 'Sin presencia. Funda una oficina desde el inspector o el mapa.' }));
      body.append(
        IM.el('button', {
          class: 'btn primary',
          type: 'button',
          text: 'Fundar aquí',
          onclick: () => {
            const r = this.game.foundInCity(locId);
            this.toast(r.ok ? 'Fundada' : r.error, r.ok ? 'ok' : 'error');
            this.rebuildMarkers();
            this.refresh();
          },
        })
      );
      return;
    }

    body.append(IM.el('h2', { text: 'Construir / mejorar' }));
    const grid = IM.el('div', { class: 'card-grid' });
    (IM_DATA.buildings || []).forEach((b) => {
      grid.append(
        IM.el('div', { class: 'mini-card' }, [
          IM.el('strong', { text: b.name }),
          IM.el('p', { class: 'muted', text: `${b.slots} slots · +${b.storage} almacén` }),
          IM.el('p', { text: IM.formatMoney(b.cost * st.inflationIndex) }),
          IM.el('button', {
            class: 'btn',
            type: 'button',
            text: 'Construir',
            onclick: () => {
              const r = this.game.buildBuilding(locId, b.id);
              this.toast(r.ok ? 'OK' : r.error, r.ok ? 'ok' : 'error');
              this.refresh();
            },
          }),
        ])
      );
    });
    body.append(grid);

    body.append(IM.el('h2', { text: 'Edificios' }));
    site.buildings.forEach((building) => {
      const def = IM.buildingById(building.type);
      const block = IM.el('div', { class: 'building-block' });
      block.append(
        IM.el('div', { class: 'toolbar' }, [
          IM.el('h3', { text: `${def?.name || building.type} · Nv.${building.level || 1} · Auto ${building.automation || 0}` }),
          IM.el('button', {
            class: 'btn',
            type: 'button',
            text: 'Mejorar nivel',
            onclick: () => {
              const r = this.game.upgradeBuilding(site.id, building.id);
              this.toast(r.ok ? 'Mejorado' : r.error, r.ok ? 'ok' : 'error');
              this.refresh();
            },
          }),
        ])
      );
      building.slots.forEach((slot, idx) => {
        const row = IM.el('div', { class: 'slot-row' });
        if (!slot) {
          row.append(
            IM.el('span', { text: `Slot ${idx + 1}: vacío` }),
            IM.el('button', {
              class: 'btn',
              type: 'button',
              text: 'Instalar',
              onclick: () => this.openInstallModal(site.id, building, idx),
            })
          );
        } else {
          const recipe = IM.recipeById(slot.recipeId);
          const machine = IM.machineById(slot.machineId);
          const need = (recipe?.timeMinutes || 60) / (machine?.speed || 1);
          const pct = Math.min(100, ((slot.progress || 0) / need) * 100);
          row.append(
            IM.el('div', { class: 'slot-info' }, [
              IM.el('strong', { text: `P${slot.priority} · ${machine?.name} → ${recipe?.name}` }),
              IM.el('div', { class: 'bar' }, [IM.el('div', { class: 'bar-fill', style: `width:${pct}%` })]),
              IM.el('small', {
                text: `${pct.toFixed(0)}% · prod ${IM.formatNum(slot.produced, 1)} · ${slot.lastBlockReason || 'ok'} · maxStock ${slot.maxOutputStock > 1e11 ? '∞' : slot.maxOutputStock}`,
              }),
            ]),
            IM.el('input', {
              class: 'input',
              type: 'number',
              style: 'width:70px',
              value: String(slot.priority),
              title: 'Prioridad',
              onchange: (e) => {
                slot.priority = Number(e.target.value) || 5;
              },
            }),
            IM.el('button', {
              class: 'btn',
              type: 'button',
              text: slot.enabled ? 'Pausar' : 'On',
              onclick: () => {
                slot.enabled = !slot.enabled;
                this.refresh();
              },
            })
          );
        }
        block.append(row);
      });
      body.append(block);
    });
  }

  openInstallModal(siteId, building, slotIndex) {
    this.openModal((inner, modal) => {
      const recipes = (IM_DATA.recipes || []).filter((r) => r.building === building.type);
      inner.append(IM.el('h2', { text: `Instalar slot ${slotIndex + 1}` }));
      const sel = IM.el('select', { class: 'input' });
      recipes.forEach((r) => {
        const locked = r.tech && !this.game.hasTech(r.tech);
        sel.append(IM.el('option', { value: r.id, text: `${r.name}${locked ? ' 🔒' : ''}`, disabled: locked ? 'disabled' : undefined }));
      });
      const prio = IM.el('input', { class: 'input', type: 'number', value: '5', min: '1', max: '10' });
      const maxStock = IM.el('input', { class: 'input', type: 'number', value: '0', title: '0 = sin límite' });
      inner.append(IM.el('label', { text: 'Receta' }), sel, IM.el('label', { text: 'Prioridad 1-10' }), prio, IM.el('label', { text: 'Stock máx salida (0=∞)' }), maxStock);
      inner.append(
        IM.el('button', {
          class: 'btn primary',
          type: 'button',
          text: 'Instalar',
          onclick: () => {
            const recipe = IM.recipeById(sel.value);
            if (!recipe) return;
            const max = Number(maxStock.value) || 0;
            const r = this.game.installMachine(siteId, building.id, slotIndex, recipe.machine, recipe.id, {
              priority: Number(prio.value) || 5,
              maxOutputStock: max > 0 ? max : 1e12,
            });
            this.toast(r.ok ? 'Instalado' : r.error, r.ok ? 'ok' : 'error');
            if (r.ok) {
              modal.close();
              this.refresh();
            }
          },
        }),
        IM.el('button', { class: 'btn', value: 'cancel', text: 'Cerrar' })
      );
    });
  }

  panelDashboard(body) {
    const st = this.game.state;
    const locId = st.ui.selectedLocationId;
    body.append(this.locSelect(locId, (v) => { st.ui.selectedLocationId = v; this.refresh(); }));
    const m = this.game.getPlantMetrics(st.ui.selectedLocationId);
    const oee = this.game.oeeForLocation(st.ui.selectedLocationId);
    body.append(
      IM.el('div', { class: 'stat-grid' }, [
        ['OEE', `${(oee * 100).toFixed(1)}%`],
        ['Energía acumulada', `${IM.formatNum(m.energyKwh, 0)} kWh`],
        ['Agua acumulada', `${IM.formatNum(m.waterM3, 1)} m³`],
        ['Output', IM.formatNum(m.output, 1)],
        ['Runtime', `${IM.formatNum(m.runtime, 0)} min`],
        ['Downtime', `${IM.formatNum(m.downtime, 0)} min`],
        ['Flete gastado', IM.formatMoney(st.stats.freightSpent)],
        ['Salarios', IM.formatMoney(st.stats.wagesPaid)],
        ['Multas', IM.formatMoney(st.finesPaid)],
        ['Créditos verdes', IM.formatNum(st.greenCredits, 1)],
        ['Rechazos calidad', String(st.rejectedLifetime)],
      ].map(([k, v]) => IM.el('div', { class: 'stat-box' }, [IM.el('span', { text: k }), IM.el('strong', { text: v })])))
    );
    body.append(IM.el('h2', { text: 'Alertas' }));
    if (!m.alerts?.length) body.append(IM.el('p', { class: 'muted', text: 'Sin alertas en este tick.' }));
    [...new Set(m.alerts || [])].forEach((a) => body.append(IM.el('div', { class: 'mini-card', text: a })));
  }

  panelAuto(body) {
    const a = this.game.state.automation;
    const toggles = [
      ['autoBuyInputs', 'Auto-comprar inputs / energía / agua'],
      ['autoSellOutputs', 'Auto-vender salidas'],
      ['autoExtract', 'Priorizar extracción regional'],
      ['autoTransport', 'Auto-rutas logísticas'],
      ['autoResearch', 'Cola automática de I+D'],
      ['autoUpgrade', 'Auto-mejorar edificios'],
      ['autoAcceptContracts', 'Contratos activos automáticos'],
    ];
    toggles.forEach(([key, label]) => {
      const id = `auto_${key}`;
      const row = IM.el('label', { class: 'check-row', for: id }, [
        IM.el('input', {
          id,
          type: 'checkbox',
          checked: a[key] ? 'checked' : undefined,
          onchange: (e) => this.game.setAutomation({ [key]: e.target.checked }),
        }),
        IM.el('span', { text: label }),
      ]);
      body.append(row);
    });
    body.append(
      IM.el('div', { class: 'toolbar' }, [
        IM.el('label', { text: 'Calidad objetivo' }),
        IM.el('input', {
          class: 'input',
          type: 'number',
          value: String(a.targetQuality),
          onchange: (e) => this.game.setAutomation({ targetQuality: Number(e.target.value) || 60 }),
        }),
        IM.el('label', { text: 'Vender si calidad ≥' }),
        IM.el('input', {
          class: 'input',
          type: 'number',
          value: String(a.sellAboveQuality),
          onchange: (e) => this.game.setAutomation({ sellAboveQuality: Number(e.target.value) || 50 }),
        }),
      ])
    );

    body.append(IM.el('h2', { text: 'Reglas de stock' }));
    const loc = IM.el('select', { class: 'input' });
    this.game.state.sites.forEach((s) => {
      const L = IM.locationById(s.locationId);
      loc.append(IM.el('option', { value: s.locationId, text: L?.name || s.locationId }));
    });
    const item = IM.el('input', { class: 'input', placeholder: 'id ítem (ej. mena_de_hierro)' });
    const min = IM.el('input', { class: 'input', type: 'number', value: '50' });
    const action = IM.el('select', { class: 'input' }, [
      IM.el('option', { value: 'buy', text: 'Comprar si bajo mínimo' }),
      IM.el('option', { value: 'sell', text: 'Vender si sobre máximo' }),
    ]);
    body.append(
      IM.el('div', { class: 'toolbar' }, [
        loc,
        item,
        min,
        action,
        IM.el('button', {
          class: 'btn primary',
          type: 'button',
          text: 'Añadir regla',
          onclick: () => {
            if (!loc.value || !item.value) return this.toast('Completa regla', 'error');
            this.game.addAutomationRule({
              locationId: loc.value,
              itemId: item.value.trim(),
              min: Number(min.value) || 0,
              max: Number(min.value) || 0,
              action: action.value,
              batch: 20,
            });
            this.toast('Regla añadida');
            this.refresh();
          },
        }),
      ])
    );
    (a.rules || []).forEach((r) => {
      body.append(IM.el('div', { class: 'mini-card', text: `${r.action} ${r.itemId} @ ${r.locationId} (${r.min || r.max})` }));
    });

    body.append(IM.el('h2', { text: 'Rutas automáticas' }));
    const from = IM.el('select', { class: 'input' });
    const to = IM.el('select', { class: 'input' });
    this.game.state.sites.forEach((s) => {
      const L = IM.locationById(s.locationId);
      from.append(IM.el('option', { value: s.locationId, text: L?.name || s.locationId }));
      to.append(IM.el('option', { value: s.locationId, text: L?.name || s.locationId }));
    });
    const rItem = IM.el('input', { class: 'input', placeholder: 'id ítem' });
    const mode = IM.el('select', { class: 'input' });
    (IM_DATA.transportModes || []).forEach((m) => mode.append(IM.el('option', { value: m.id, text: m.name })));
    body.append(
      IM.el('div', { class: 'toolbar' }, [
        from,
        to,
        rItem,
        mode,
        IM.el('button', {
          class: 'btn primary',
          type: 'button',
          text: 'Añadir ruta',
          onclick: () => {
            this.game.addAutomationRoute({
              fromId: from.value,
              toId: to.value,
              itemId: rItem.value.trim(),
              modeId: mode.value,
              threshold: 30,
              qty: 40,
              keep: 10,
            });
            this.toast('Ruta añadida');
            this.refresh();
          },
        }),
      ])
    );
    (a.routes || []).forEach((r) => {
      body.append(IM.el('div', { class: 'mini-card', text: `${r.fromId} → ${r.toId} · ${r.itemId} · ${r.modeId}` }));
    });
  }

  panelAlmacen(body) {
    const st = this.game.state;
    body.append(this.locSelect(st.ui.selectedLocationId, (v) => { st.ui.selectedLocationId = v; this.refresh(); }));
    const locId = st.ui.selectedLocationId;
    if (!st.warehouses[locId] && !st.sites.some((s) => s.locationId === locId)) {
      body.append(IM.el('p', { class: 'muted', text: 'Sin almacén. Funda una planta primero.' }));
      return;
    }
    const wh = this.game.ensureWarehouse(locId);
    body.append(IM.el('p', { text: `Uso ${IM.formatNum(this.game.usedStorage(locId), 1)} / ${IM.formatNum(this.game.storageCap(locId), 1)}` }));
    const table = IM.el('table', { class: 'data-table' });
    table.append(IM.el('thead', {}, [IM.el('tr', {}, ['Ítem', 'Cantidad', 'Calidad', 'Valor'].map((t) => IM.el('th', { text: t })))]));
    const tb = IM.el('tbody');
    Object.entries(wh.stock)
      .sort((a, b) => b[1].qty - a[1].qty)
      .forEach(([id, s]) => {
        const it = IM.itemById(id);
        if (!it) return;
        tb.append(
          IM.el('tr', {}, [
            IM.el('td', { text: it.name }),
            IM.el('td', { text: `${IM.formatNum(s.qty, 2)} ${it.unit}` }),
            IM.el('td', { text: s.quality.toFixed(1) }),
            IM.el('td', { text: IM.formatMoney(s.qty * this.game.priceOf(id)) }),
          ])
        );
      });
    table.append(tb);
    body.append(table);
  }

  panelMercado(body) {
    const st = this.game.state;
    let locId = st.ui.selectedLocationId;
    const q = IM.el('input', { class: 'input', placeholder: 'Buscar…' });
    const cat = IM.el('select', { class: 'input' });
    cat.append(IM.el('option', { value: 'all', text: 'Todas' }));
    Object.entries(IM.categoryLabel).forEach(([k, v]) => cat.append(IM.el('option', { value: k, text: v })));
    const qtyInput = IM.el('input', { class: 'input', type: 'number', value: '10' });
    const renderList = () => {
      body.querySelector('.market-list')?.remove();
      const wrap = IM.el('div', { class: 'market-list' });
      const query = (q.value || '').toLowerCase();
      (IM_DATA.items || [])
        .filter((it) => (cat.value === 'all' || it.category === cat.value) && (!query || it.name.toLowerCase().includes(query)))
        .slice(0, 180)
        .forEach((it) => {
          wrap.append(
            IM.el('div', { class: 'market-row' }, [
              IM.el('div', {}, [IM.el('strong', { text: it.name }), IM.el('small', { class: 'muted', text: ` ${IM.categoryLabel[it.category] || it.category}` })]),
              IM.el('strong', { text: `${IM.formatMoney(this.game.priceOf(it.id))}/${it.unit}` }),
              IM.el('button', { class: 'btn', type: 'button', text: 'Comprar', onclick: () => {
                const r = this.game.buyFromMarket(locId, it.id, Number(qtyInput.value) || 1);
                this.toast(r.ok ? 'OK' : r.error, r.ok ? 'ok' : 'error');
              }}),
              IM.el('button', { class: 'btn', type: 'button', text: 'Vender', onclick: () => {
                const r = this.game.sellToMarket(locId, it.id, Number(qtyInput.value) || 1);
                this.toast(r.ok ? 'OK' : r.error, r.ok ? 'ok' : 'error');
              }}),
            ])
          );
        });
      body.append(wrap);
    };
    body.append(IM.el('div', { class: 'toolbar' }, [
      this.locSelect(locId, (v) => { st.ui.selectedLocationId = v; locId = v; }),
      q, cat, qtyInput,
    ]));
    q.oninput = renderList;
    cat.onchange = renderList;
    renderList();
  }

  panelBolsa(body) {
    const st = this.game.state;
    body.append(IM.el('p', { class: 'muted', text: st.categoryCrisis ? `Crisis activa: ${st.categoryCrisis.category}` : 'Sin crisis de categoría.' }));
    const item = IM.el('input', { class: 'input', placeholder: 'id ítem' , value: 'mena_de_hierro' });
    const qty = IM.el('input', { class: 'input', type: 'number', value: '100' });
    body.append(
      IM.el('div', { class: 'toolbar' }, [
        item,
        qty,
        IM.el('button', { class: 'btn primary', type: 'button', text: 'Futuro LONG', onclick: () => {
          const r = this.game.openFuture(item.value.trim(), Number(qty.value) || 1, 'long');
          this.toast(r.ok ? 'Abierto' : r.error, r.ok ? 'ok' : 'error');
          this.refresh();
        }}),
        IM.el('button', { class: 'btn', type: 'button', text: 'Futuro SHORT', onclick: () => {
          const r = this.game.openFuture(item.value.trim(), Number(qty.value) || 1, 'short');
          this.toast(r.ok ? 'Abierto' : r.error, r.ok ? 'ok' : 'error');
          this.refresh();
        }}),
      ])
    );
    body.append(IM.el('h2', { text: 'Futuros abiertos' }));
    if (!st.futures.length) body.append(IM.el('p', { class: 'muted', text: 'Ninguno. Requiere tech Bolsa o truco.' }));
    st.futures.forEach((f) => {
      const it = IM.itemById(f.itemId);
      const now = this.game.priceOf(f.itemId);
      body.append(IM.el('div', { class: 'mini-card' }, [
        IM.el('strong', { text: `${f.direction.toUpperCase()} ${it?.name || f.itemId}` }),
        IM.el('p', { text: `Entrada ${IM.formatMoney(f.entry)} · Ahora ${IM.formatMoney(now)} · qty ${f.qty}` }),
      ]));
    });

    body.append(IM.el('h2', { text: 'Histórico (muestra)' }));
    const sample = Object.keys(st.priceHistory || {}).slice(0, 12);
    sample.forEach((id) => {
      const hist = st.priceHistory[id] || [];
      const it = IM.itemById(id);
      const spark = hist.map((v, i, arr) => {
        const min = Math.min(...arr);
        const max = Math.max(...arr);
        const h = max === min ? 50 : ((v - min) / (max - min)) * 100;
        return `<span class="spark" style="height:${Math.max(4, h)}%"></span>`;
      }).join('');
      body.append(IM.el('div', { class: 'spark-row' }, [
        IM.el('span', { text: it?.name || id }),
        IM.el('div', { class: 'sparkline', html: spark }),
      ]));
    });
  }

  panelLogistica(body) {
    const st = this.game.state;
    const from = IM.el('select', { class: 'input' });
    const to = IM.el('select', { class: 'input' });
    (IM_DATA.locations || []).slice(0, 500).forEach((l) => {
      from.append(IM.el('option', { value: l.id, text: l.name }));
      to.append(IM.el('option', { value: l.id, text: l.name }));
    });
    st.sites.forEach((s) => {
      const L = IM.locationById(s.locationId);
      if (L) {
        from.append(IM.el('option', { value: L.id, text: `★ ${L.name}` }));
        to.append(IM.el('option', { value: L.id, text: `★ ${L.name}` }));
      }
    });
    from.value = st.ui.selectedLocationId;
    const itemSel = IM.el('select', { class: 'input' });
    const modeSel = IM.el('select', { class: 'input' });
    (IM_DATA.transportModes || []).forEach((m) => {
      const locked = m.unlock && !this.game.hasTech(m.unlock);
      modeSel.append(IM.el('option', { value: m.id, text: `${m.name}${locked ? ' 🔒' : ''}`, disabled: locked ? 'disabled' : undefined }));
    });
    const qty = IM.el('input', { class: 'input', type: 'number', value: '20' });
    const refreshItems = () => {
      itemSel.innerHTML = '';
      const wh = this.game.ensureWarehouse(from.value);
      Object.keys(wh.stock).forEach((id) => {
        const it = IM.itemById(id);
        if (it) itemSel.append(IM.el('option', { value: id, text: `${it.name} (${IM.formatNum(wh.stock[id].qty, 1)})` }));
      });
    };
    from.onchange = refreshItems;
    refreshItems();
    body.append(IM.el('div', { class: 'form-grid' }, [
      IM.el('label', { text: 'Origen' }), from,
      IM.el('label', { text: 'Destino' }), to,
      IM.el('label', { text: 'Ítem' }), itemSel,
      IM.el('label', { text: 'Cantidad' }), qty,
      IM.el('label', { text: 'Modo' }), modeSel,
      IM.el('button', { class: 'btn primary', type: 'button', text: 'Enviar', onclick: () => {
        const r = this.game.startShipment(from.value, to.value, itemSel.value, Number(qty.value) || 1, modeSel.value);
        this.toast(r.ok ? 'Enviado' : r.error, r.ok ? 'ok' : 'error');
        this.refresh();
      }}),
    ]));
    body.append(IM.el('h2', { text: 'En tránsito' }));
    st.shipments.forEach((sh) => {
      const it = IM.itemById(sh.itemId);
      const a = IM.locationById(sh.fromId);
      const b = IM.locationById(sh.toId);
      const pct = 100 - (sh.remainingMinutes / sh.totalMinutes) * 100;
      body.append(IM.el('div', { class: 'mini-card' }, [
        IM.el('strong', { text: `${it?.name}: ${a?.name} → ${b?.name} (${sh.modeId})` }),
        IM.el('div', { class: 'bar' }, [IM.el('div', { class: 'bar-fill', style: `width:${pct}%` })]),
      ]));
    });
  }

  panelResearch(body) {
    const st = this.game.state;
    if (st.researchQueue) {
      const t = IM.techById(st.researchQueue.techId);
      const pct = 100 * (1 - st.researchQueue.remaining / st.researchQueue.total);
      body.append(IM.el('div', { class: 'mini-card' }, [
        IM.el('strong', { text: `En curso: ${t?.name}` }),
        IM.el('div', { class: 'bar' }, [IM.el('div', { class: 'bar-fill', style: `width:${pct}%` })]),
      ]));
    }
    const grid = IM.el('div', { class: 'card-grid' });
    (IM_DATA.techs || []).forEach((t) => {
      const done = this.game.hasTech(t.id);
      const reqOk = (t.requires || []).every((r) => this.game.hasTech(r));
      grid.append(IM.el('div', { class: `mini-card${done ? ' done' : ''}` }, [
        IM.el('strong', { text: t.name }),
        IM.el('p', { class: 'muted', text: t.desc }),
        IM.el('p', { text: done ? 'Desbloqueada' : `${IM.formatMoney(t.cost)} · req ${(t.requires || []).join(', ') || '—'}` }),
        done ? null : IM.el('div', { class: 'toolbar' }, [
          IM.el('button', { class: 'btn', type: 'button', text: reqOk ? 'Investigar' : 'Bloqueada', disabled: reqOk ? undefined : 'disabled', onclick: () => {
            const r = this.game.startResearch(t.id);
            this.toast(r.ok ? 'OK' : r.error, r.ok ? 'ok' : 'error');
            this.refresh();
          }}),
          IM.el('button', { class: 'btn', type: 'button', text: 'A cola auto', onclick: () => {
            st.researchAutoQueue.push(t.id);
            this.toast('Añadida a cola');
          }}),
        ]),
      ]));
    });
    body.append(grid);
  }

  panelFinanzas(body) {
    const st = this.game.state;
    body.append(IM.el('div', { class: 'stat-grid' }, [
      ['Tesorería', IM.formatMoney(st.money)],
      ['Beneficio', IM.formatMoney(st.profitLifetime)],
      ['Energía €', IM.formatMoney(st.stats.energySpent)],
      ['Agua €', IM.formatMoney(st.stats.waterSpent)],
      ['Flete €', IM.formatMoney(st.stats.freightSpent)],
      ['Salarios €', IM.formatMoney(st.stats.wagesPaid)],
      ['Impuestos', IM.formatMoney(st.stats.taxesPaid)],
      ['Rating', String(Math.round(st.creditRating))],
    ].map(([k, v]) => IM.el('div', { class: 'stat-box' }, [IM.el('span', { text: k }), IM.el('strong', { text: v })]))));
    const amount = IM.el('input', { class: 'input', type: 'number', value: '1000000' });
    body.append(IM.el('div', { class: 'toolbar' }, [
      amount,
      IM.el('button', { class: 'btn primary', type: 'button', text: 'Préstamo 5 años', onclick: () => {
        const r = this.game.takeLoan(Number(amount.value) || 0);
        this.toast(r.ok ? 'OK' : r.error, r.ok ? 'ok' : 'error');
        this.refresh();
      }}),
    ]));
  }

  panelMisiones(body) {
    const st = this.game.state;
    body.append(IM.el('p', { text: `Capítulo ${st.missionChapter} · XP ${st.xp} · Completadas ${Object.keys(st.missionsCompleted).length}` }));
    st.activeMissionIds.forEach((id) => {
      const m = this.game.missionById(id);
      if (!m) return;
      const p = this.game.missionProgress(m) * 100;
      body.append(IM.el('div', { class: 'mini-card' }, [
        IM.el('strong', { text: m.title }),
        IM.el('p', { class: 'muted', text: m.description }),
        IM.el('div', { class: 'bar' }, [IM.el('div', { class: 'bar-fill', style: `width:${p}%` })]),
      ]));
    });
  }

  panelContratos(body) {
    const st = this.game.state;
    if (!st.contracts.length) body.append(IM.el('p', { class: 'muted', text: 'Sin contratos. Aparecen con el tiempo.' }));
    st.contracts.forEach((c) => {
      const it = IM.itemById(c.itemId);
      const loc = IM.locationById(c.locationId);
      body.append(IM.el('div', { class: 'mini-card' }, [
        IM.el('strong', { text: `${it?.name} × ${c.qty} → ${loc?.name}` }),
        IM.el('p', { text: `Calidad mínima ${c.minQuality} · Precio ${IM.formatMoney(c.price)} · plazo día ${c.deadlineDay}` }),
      ]));
    });
  }

  panelEnciclopedia(body) {
    const st = this.game.state;
    const q = IM.el('input', { class: 'input', placeholder: 'Buscar…', value: st.ui.encyclopediaQuery || '' });
    const cat = IM.el('select', { class: 'input' });
    cat.append(IM.el('option', { value: 'all', text: 'Todas' }));
    Object.entries(IM.categoryLabel).forEach(([k, v]) => cat.append(IM.el('option', { value: k, text: v })));
    const detail = IM.el('div', { class: 'ency-detail' });
    const list = IM.el('div', { class: 'ency-list' });

    const showItem = (it) => {
      st.ui.encyclopediaItem = it.id;
      const producers = (IM_DATA.recipes || []).filter((r) => (r.outputs || []).some((o) => o.item === it.id));
      const consumers = (IM_DATA.recipes || []).filter((r) => (r.inputs || []).some((i) => i.item === it.id));
      detail.innerHTML = '';
      detail.append(
        IM.el('h2', { text: it.name }),
        IM.el('p', { text: it.description }),
        IM.el('p', { class: 'muted', text: `${IM.categoryLabel[it.category]} · tier ${it.tier} · ${IM.formatMoney(it.basePrice)}/${it.unit}` }),
        IM.el('h3', { text: 'Se produce con' }),
      );
      if (!producers.length) detail.append(IM.el('p', { class: 'muted', text: 'Sin receta / materia prima o compra.' }));
      producers.slice(0, 12).forEach((r) => {
        detail.append(IM.el('div', { class: 'tree-node' }, [
          IM.el('strong', { text: r.name }),
          IM.el('div', { text: `Inputs: ${(r.inputs || []).map((i) => IM.itemById(i.item)?.name + '×' + i.qty).join(', ') || '—'}` }),
          IM.el('div', { text: `Outputs: ${(r.outputs || []).map((o) => IM.itemById(o.item)?.name + '×' + o.qty).join(', ')}` }),
        ]));
      });
      detail.append(IM.el('h3', { text: 'Se consume en' }));
      if (!consumers.length) detail.append(IM.el('p', { class: 'muted', text: 'Ninguna receta aguas abajo.' }));
      consumers.slice(0, 12).forEach((r) => {
        detail.append(IM.el('div', { class: 'tree-node' }, [
          IM.el('strong', { text: r.name }),
          IM.el('button', { class: 'btn', type: 'button', text: 'Ver output', onclick: () => {
            const out = IM.itemById(r.outputs?.[0]?.item);
            if (out) showItem(out);
          }}),
        ]));
      });
    };

    const render = () => {
      st.ui.encyclopediaQuery = q.value;
      list.innerHTML = '';
      const query = q.value.toLowerCase();
      (IM_DATA.items || [])
        .filter((it) => (cat.value === 'all' || it.category === cat.value) && (!query || it.name.toLowerCase().includes(query)))
        .slice(0, 200)
        .forEach((it) => {
          list.append(IM.el('button', {
            class: 'ency-link',
            type: 'button',
            text: it.name,
            onclick: () => showItem(it),
          }));
        });
    };
    q.oninput = render;
    cat.onchange = render;
    body.append(IM.el('div', { class: 'toolbar' }, [q, cat]));
    body.append(IM.el('div', { class: 'ency-layout' }, [list, detail]));
    render();
    if (st.ui.encyclopediaItem) {
      const it = IM.itemById(st.ui.encyclopediaItem);
      if (it) showItem(it);
    }
  }

  panelCompetencia(body) {
    this.game.state.competitors.forEach((c) => {
      body.append(IM.el('div', { class: 'mini-card' }, [
        IM.el('strong', { text: c.name }),
        IM.el('p', { text: `Foco ${IM.categoryLabel[c.focus] || c.focus} · cuota ${(c.marketShare * 100).toFixed(1)}% · capital ${IM.formatMoney(c.money)}` }),
        IM.el('p', { class: 'muted', text: `Plantas IA: ${(c.sites || []).length} · ${c.lastAction || ''}` }),
        IM.el('div', { class: 'bar' }, [IM.el('div', { class: 'bar-fill', style: `width:${c.marketShare * 100}%` })]),
      ]));
    });
  }

  panelEventos(body) {
    const st = this.game.state;
    if (!st.events.length) body.append(IM.el('p', { class: 'muted', text: 'Sin eventos aún.' }));
    st.events.forEach((e) => body.append(IM.el('div', { class: 'mini-card' }, [
      IM.el('strong', { text: e.title }),
      IM.el('p', { text: e.desc }),
      IM.el('small', { class: 'muted', text: `${e.year} · día ${e.day}` }),
    ])));
  }

  panelAjustes(body) {
    const name = IM.el('input', { class: 'input', value: this.game.state.companyName });
    body.append(IM.el('div', { class: 'toolbar' }, [
      name,
      IM.el('button', { class: 'btn', type: 'button', text: 'Renombrar', onclick: () => {
        this.game.state.companyName = name.value || 'Tu Corporación Industrial';
        this.refresh();
      }}),
    ]));
    body.append(IM.el('div', { class: 'toolbar' }, [
      IM.el('button', { class: 'btn primary', type: 'button', text: 'Guardar', onclick: () => { IM.Save.save(this.game.state); this.toast('OK'); }}),
      IM.el('button', { class: 'btn', type: 'button', text: 'Exportar JSON', onclick: () => IM.Save.exportJson(this.game.state) }),
      IM.el('button', { class: 'btn', type: 'button', text: 'Nueva partida', onclick: () => {
        if (confirm('¿Empezar de cero? (100 M€, sin edificios)')) {
          IM.Save.clear();
          this.game.init(IM.createInitialState());
          this.rebuildMarkers();
          this.showPanel('mapa');
        }
      }}),
    ]));
    const cheat = IM.el('input', { class: 'input', placeholder: 'Código truco I+D' });
    body.append(IM.el('div', { class: 'toolbar' }, [
      cheat,
      IM.el('button', { class: 'btn', type: 'button', text: 'Activar', onclick: () => {
        if (cheat.value.trim().toUpperCase() === IM_CONFIG.cheatUnlockAllCode) {
          this.game.unlockAllTechs();
          this.toast('Tech total desbloqueada');
        } else this.toast('Código incorrecto', 'error');
      }}),
    ]));
    body.append(IM.el('p', { class: 'muted', text: `v${IM_CONFIG.version} · partida vacía con ${IM.formatMoney(IM_CONFIG.startingMoney)} · ${IM_DATA.locations?.length || 0} ciudades` }));
    const importInput = IM.el('input', { type: 'file', accept: 'application/json' });
    importInput.onchange = async () => {
      const file = importInput.files?.[0];
      if (!file) return;
      try {
        const data = await IM.Save.importJson(file);
        this.game.init(data);
        this.rebuildMarkers();
        this.toast('Importado');
      } catch {
        this.toast('JSON inválido', 'error');
      }
    };
    body.append(importInput);
  }

  toast(msg, type = 'ok') {
    const host = document.getElementById('toasts');
    if (!host) return;
    const el = IM.el('div', { class: `toast ${type}`, text: msg });
    host.append(el);
    setTimeout(() => el.remove(), 3000);
  }
};
