/** UI principal Industry Manager */
window.IM = window.IM || {};

IM.UI = class UI {
  constructor(game) {
    this.game = game;
    this.map = null;
    this.markers = {};
    this.root = document.getElementById('app');
    this._mapReady = false;
    this._lastPanel = null;
  }

  mount() {
    this.root.innerHTML = '';
    this.root.appendChild(this.renderShell());
    this.bindTopbar();
    this.initMap();
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
      IM.el('dialog', { id: 'modal' }, [
        IM.el('form', { method: 'dialog', class: 'modal-inner', id: 'modalInner' }),
      ]),
    ]);
  }

  navButtons() {
    const items = [
      ['mapa', 'Mapa'],
      ['industria', 'Industria'],
      ['almacen', 'Almacenes'],
      ['mercado', 'Mercado'],
      ['logistica', 'Logística'],
      ['investigacion', 'I+D'],
      ['finanzas', 'Finanzas'],
      ['misiones', 'Misiones'],
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

  bindTopbar() {
    // filled in refresh
  }

  initMap() {
    const el = document.getElementById('map');
    if (!el || typeof L === 'undefined') return;
    this.map = L.map(el, { worldCopyJump: true }).setView(IM_CONFIG.mapCenter, IM_CONFIG.mapDefaultZoom);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '&copy; OpenStreetMap',
    }).addTo(this.map);
    (IM_DATA.locations || []).forEach((loc) => {
      const marker = L.circleMarker([loc.lat, loc.lng], {
        radius: 8,
        color: '#c4a35a',
        weight: 2,
        fillColor: '#1a2a32',
        fillOpacity: 0.9,
      }).addTo(this.map);
      marker.bindTooltip(`${loc.name} · ${loc.country}`);
      marker.on('click', () => {
        this.game.state.ui.selectedLocationId = loc.id;
        this.showPanel('industria');
        this.refresh();
      });
      this.markers[loc.id] = marker;
    });
    this._mapReady = true;
    setTimeout(() => this.map.invalidateSize(), 100);
  }

  showPanel(id) {
    this.game.state.ui.panel = id;
    const mapWrap = document.getElementById('mapWrap');
    const panelWrap = document.getElementById('panelWrap');
    document.querySelectorAll('.nav-btn').forEach((b) => {
      b.classList.toggle('active', b.dataset.panel === id);
    });
    if (id === 'mapa') {
      mapWrap.classList.remove('hidden');
      panelWrap.classList.add('hidden');
      if (this.map) setTimeout(() => this.map.invalidateSize(), 50);
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
    this.updateMapMarkers();
  }

  updateMapMarkers() {
    if (!this._mapReady) return;
    const owned = new Set(this.game.state.sites.map((s) => s.locationId));
    Object.entries(this.markers).forEach(([id, marker]) => {
      marker.setStyle({
        fillColor: owned.has(id) ? '#3d7a5a' : '#1a2a32',
        color: owned.has(id) ? '#7dffb3' : '#c4a35a',
      });
    });
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
      IM.el('div', { class: 'stat' }, [
        IM.el('span', { class: 'label', text: 'Tesorería' }),
        IM.el('strong', { text: IM.formatMoney(st.money) }),
      ]),
      IM.el('div', { class: 'stat' }, [
        IM.el('span', { class: 'label', text: 'Tiempo' }),
        IM.el('strong', { text: IM.formatGameTime(st) }),
      ]),
      IM.el('div', { class: 'stat' }, [
        IM.el('span', { class: 'label', text: 'Empleados' }),
        IM.el('strong', { text: String(st.employees) }),
      ]),
      IM.el('div', { class: 'stat' }, [
        IM.el('span', { class: 'label', text: 'Contaminación' }),
        IM.el('strong', { text: IM.formatNum(st.pollutionTotal, 2) }),
      ]),
      IM.el('div', { class: 'speed-controls' }, [
        ...[0, 1, 2, 5, 10].map((s) =>
          IM.el('button', {
            type: 'button',
            class: `speed-btn${st.paused && s === 0 ? ' active' : !st.paused && st.speed === s ? ' active' : ''}`,
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
            this.toast('Partida guardada');
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
      IM.el('h2', { text: loc ? loc.name : 'Sin ubicación' }),
      IM.el('p', {
        class: 'muted',
        text: loc
          ? `${loc.country} · ${loc.region} · ${loc.type} · arancel ${(loc.tariffs * 100).toFixed(0)}%`
          : '',
      })
    );
    if (loc) {
      box.append(
        IM.el('div', { class: 'kv' }, [
          IM.el('span', { text: 'Coste laboral' }),
          IM.el('strong', { text: `×${loc.laborCost}` }),
        ]),
        IM.el('div', { class: 'kv' }, [
          IM.el('span', { text: 'Coste energético' }),
          IM.el('strong', { text: `×${loc.energyCost}` }),
        ]),
        IM.el('div', { class: 'kv' }, [
          IM.el('span', { text: 'Almacén' }),
          IM.el('strong', {
            text: `${IM.formatNum(this.game.usedStorage(locId), 0)} / ${IM.formatNum(this.game.storageCap(locId), 0)}`,
          }),
        ])
      );
      if (!site) {
        box.append(
          IM.el('button', {
            class: 'btn primary',
            type: 'button',
            text: 'Abrir planta aquí (oficina)',
            onclick: () => {
              const r = this.game.buildBuilding(locId, 'oficina');
              if (!r.ok) this.toast(r.error, 'error');
              else this.toast('Planta abierta');
            },
          })
        );
      } else {
        box.append(IM.el('p', { text: `${site.buildings.length} edificios en ${site.name}` }));
      }
    }
    box.append(IM.el('h3', { text: 'Actividad reciente' }));
    const log = IM.el('div', { class: 'log-list' });
    st.log.slice(0, 12).forEach((e) => {
      log.append(IM.el('div', { class: `log-item ${e.type}`, text: e.msg }));
    });
    box.append(log);
  }

  renderPanel(id) {
    const header = document.getElementById('panelHeader');
    const body = document.getElementById('panelBody');
    if (!header || !body) return;
    const titles = {
      industria: 'Industria y fábricas',
      almacen: 'Almacenes por ubicación',
      mercado: 'Mercado global',
      logistica: 'Logística y transporte',
      investigacion: 'Investigación y desarrollo',
      finanzas: 'Finanzas, préstamos e impuestos',
      misiones: 'Misiones de progresión',
      enciclopedia: 'Enciclopedia industrial',
      competencia: 'Competencia',
      eventos: 'Eventos económicos',
      ajustes: 'Ajustes y trucos',
    };
    header.innerHTML = '';
    header.append(IM.el('h1', { text: titles[id] || id }));
    body.innerHTML = '';
    const fn = {
      industria: () => this.panelIndustria(body),
      almacen: () => this.panelAlmacen(body),
      mercado: () => this.panelMercado(body),
      logistica: () => this.panelLogistica(body),
      investigacion: () => this.panelResearch(body),
      finanzas: () => this.panelFinanzas(body),
      misiones: () => this.panelMisiones(body),
      enciclopedia: () => this.panelEnciclopedia(body),
      competencia: () => this.panelCompetencia(body),
      eventos: () => this.panelEventos(body),
      ajustes: () => this.panelAjustes(body),
    }[id];
    if (fn) fn();
  }

  locSelect(selected, onChange) {
    const sel = IM.el('select', {
      class: 'input',
      onchange: (e) => onChange(e.target.value),
    });
    (IM_DATA.locations || []).forEach((l) => {
      const opt = IM.el('option', { value: l.id, text: `${l.name} (${l.country})` });
      if (l.id === selected) opt.selected = true;
      sel.append(opt);
    });
    return sel;
  }

  panelIndustria(body) {
    const st = this.game.state;
    let locId = st.ui.selectedLocationId || IM_CONFIG.startingLocation;
    const toolbar = IM.el('div', { class: 'toolbar' });
    toolbar.append(
      IM.el('label', { text: 'Ubicación ' }),
      this.locSelect(locId, (v) => {
        st.ui.selectedLocationId = v;
        this.refresh();
      })
    );
    body.append(toolbar);

    const site = st.sites.find((s) => s.locationId === locId);
    body.append(IM.el('h2', { text: 'Construir edificio' }));
    const grid = IM.el('div', { class: 'card-grid' });
    (IM_DATA.buildings || []).forEach((b) => {
      const card = IM.el('div', { class: 'mini-card' }, [
        IM.el('strong', { text: b.name }),
        IM.el('p', { class: 'muted', text: `${b.desc} · ${b.slots} slots · almacén +${b.storage}` }),
        IM.el('p', { text: IM.formatMoney(b.cost * this.game.state.inflationIndex) }),
        IM.el('button', {
          class: 'btn',
          type: 'button',
          text: 'Construir',
          onclick: () => {
            const r = this.game.buildBuilding(locId, b.id);
            this.toast(r.ok ? 'Construido' : r.error, r.ok ? 'ok' : 'error');
            this.refresh();
          },
        }),
      ]);
      grid.append(card);
    });
    body.append(grid);

    body.append(IM.el('h2', { text: 'Edificios en esta ubicación' }));
    if (!site || !site.buildings.length) {
      body.append(IM.el('p', { class: 'muted', text: 'Sin edificios. Construye una oficina o planta.' }));
      return;
    }
    site.buildings.forEach((building) => {
      const def = IM.buildingById(building.type);
      const block = IM.el('div', { class: 'building-block' });
      block.append(
        IM.el('h3', { text: def?.name || building.type }),
        IM.el('p', {
          class: 'muted',
          text: `Empleados: ${building.employees} · Eficiencia: ${(building.efficiency * 100).toFixed(0)}%`,
        })
      );
      building.slots.forEach((slot, idx) => {
        const row = IM.el('div', { class: 'slot-row' });
        if (!slot) {
          row.append(
            IM.el('span', { text: `Slot ${idx + 1}: vacío` }),
            IM.el('button', {
              class: 'btn',
              type: 'button',
              text: 'Instalar máquina',
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
              IM.el('strong', { text: `${machine?.name || '?'} → ${recipe?.name || '?'}` }),
              IM.el('div', { class: 'bar' }, [IM.el('div', { class: 'bar-fill', style: `width:${pct}%` })]),
              IM.el('small', { text: `Producido: ${IM.formatNum(slot.produced, 1)} · ${pct.toFixed(0)}%` }),
            ]),
            IM.el('button', {
              class: 'btn',
              type: 'button',
              text: slot.enabled ? 'Pausar' : 'Reanudar',
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
    const modal = document.getElementById('modal');
    const inner = document.getElementById('modalInner');
    inner.innerHTML = '';
    const recipes = (IM_DATA.recipes || []).filter((r) => r.building === building.type);
    inner.append(IM.el('h2', { text: 'Instalar en slot ' + (slotIndex + 1) }));
    if (!recipes.length) {
      inner.append(IM.el('p', { text: 'No hay recetas para este edificio.' }));
      inner.append(IM.el('button', { class: 'btn', value: 'cancel', text: 'Cerrar' }));
      modal.showModal();
      return;
    }
    const sel = IM.el('select', { class: 'input', id: 'recipePick' });
    recipes.forEach((r) => {
      const locked = r.tech && !this.game.hasTech(r.tech);
      sel.append(
        IM.el('option', {
          value: r.id,
          text: `${r.name}${locked ? ' (bloqueada)' : ''}`,
          disabled: locked ? 'disabled' : undefined,
        })
      );
    });
    inner.append(IM.el('label', { text: 'Receta' }), sel);
    inner.append(
      IM.el('button', {
        class: 'btn primary',
        type: 'button',
        text: 'Instalar',
        onclick: () => {
          const recipe = IM.recipeById(sel.value);
          if (!recipe) return;
          const r = this.game.installMachine(siteId, building.id, slotIndex, recipe.machine, recipe.id);
          this.toast(r.ok ? 'Máquina instalada' : r.error, r.ok ? 'ok' : 'error');
          if (r.ok) {
            modal.close();
            this.refresh();
          }
        },
      }),
      IM.el('button', { class: 'btn', value: 'cancel', text: 'Cancelar' })
    );
    modal.showModal();
  }

  panelAlmacen(body) {
    const st = this.game.state;
    let locId = st.ui.selectedLocationId;
    body.append(
      this.locSelect(locId, (v) => {
        st.ui.selectedLocationId = v;
        this.refresh();
      })
    );
    locId = st.ui.selectedLocationId;
    const wh = this.game.ensureWarehouse(locId);
    body.append(
      IM.el('p', {
        text: `Uso: ${IM.formatNum(this.game.usedStorage(locId), 1)} / ${IM.formatNum(this.game.storageCap(locId), 1)}`,
      })
    );
    const table = IM.el('table', { class: 'data-table' });
    table.append(
      IM.el('thead', {}, [
        IM.el('tr', {}, ['Ítem', 'Cantidad', 'Calidad', 'Valor'].map((t) => IM.el('th', { text: t }))),
      ])
    );
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
            IM.el('td', { text: `${s.quality.toFixed(1)}` }),
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
    const q = IM.el('input', {
      class: 'input',
      placeholder: 'Buscar ítem…',
      value: st.ui.marketQuery || '',
    });
    const cat = IM.el('select', { class: 'input' });
    cat.append(IM.el('option', { value: 'all', text: 'Todas las categorías' }));
    Object.entries(IM.categoryLabel).forEach(([k, v]) => cat.append(IM.el('option', { value: k, text: v })));
    const qtyInput = IM.el('input', { class: 'input', type: 'number', value: '10', min: '0.01', step: '1' });

    const renderList = () => {
      const list = body.querySelector('.market-list');
      if (list) list.remove();
      const wrap = IM.el('div', { class: 'market-list' });
      const query = (q.value || '').toLowerCase();
      const c = cat.value;
      (IM_DATA.items || [])
        .filter((it) => (c === 'all' || it.category === c) && (!query || it.name.toLowerCase().includes(query)))
        .slice(0, 200)
        .forEach((it) => {
          const price = this.game.priceOf(it.id);
          const row = IM.el('div', { class: 'market-row' }, [
            IM.el('div', {}, [
              IM.el('strong', { text: it.name }),
              IM.el('small', {
                class: 'muted',
                text: `${IM.categoryLabel[it.category] || it.category} · base ${IM.formatMoney(it.basePrice)}/${it.unit}`,
              }),
            ]),
            IM.el('strong', { text: `${IM.formatMoney(price)} / ${it.unit}` }),
            IM.el('button', {
              class: 'btn',
              type: 'button',
              text: 'Comprar',
              onclick: () => {
                const qty = Number(qtyInput.value) || 1;
                const r = this.game.buyFromMarket(locId, it.id, qty);
                this.toast(r.ok ? 'Comprado' : r.error, r.ok ? 'ok' : 'error');
              },
            }),
            IM.el('button', {
              class: 'btn',
              type: 'button',
              text: 'Vender',
              onclick: () => {
                const qty = Number(qtyInput.value) || 1;
                const r = this.game.sellToMarket(locId, it.id, qty);
                this.toast(r.ok ? 'Vendido' : r.error, r.ok ? 'ok' : 'error');
              },
            }),
          ]);
          wrap.append(row);
        });
      body.append(wrap);
    };

    body.append(
      IM.el('div', { class: 'toolbar' }, [
        this.locSelect(locId, (v) => {
          st.ui.selectedLocationId = v;
          locId = v;
        }),
        q,
        cat,
        IM.el('label', { text: 'Cantidad' }),
        qtyInput,
      ])
    );
    q.addEventListener('input', renderList);
    cat.addEventListener('change', renderList);
    renderList();
  }

  panelLogistica(body) {
    const st = this.game.state;
    const from = IM.el('select', { class: 'input' });
    const to = IM.el('select', { class: 'input' });
    (IM_DATA.locations || []).forEach((l) => {
      from.append(IM.el('option', { value: l.id, text: l.name }));
      to.append(IM.el('option', { value: l.id, text: l.name }));
    });
    from.value = st.ui.selectedLocationId;
    const itemSel = IM.el('select', { class: 'input' });
    const modeSel = IM.el('select', { class: 'input' });
    (IM_DATA.transportModes || []).forEach((m) => {
      const locked = m.unlock && !this.game.hasTech(m.unlock);
      modeSel.append(
        IM.el('option', {
          value: m.id,
          text: `${m.name}${locked ? ' (bloqueado)' : ''}`,
          disabled: locked ? 'disabled' : undefined,
        })
      );
    });
    const qty = IM.el('input', { class: 'input', type: 'number', value: '10' });

    const refreshItems = () => {
      itemSel.innerHTML = '';
      const wh = this.game.ensureWarehouse(from.value);
      Object.keys(wh.stock).forEach((id) => {
        const it = IM.itemById(id);
        if (!it) return;
        itemSel.append(
          IM.el('option', {
            value: id,
            text: `${it.name} (${IM.formatNum(wh.stock[id].qty, 1)} ${it.unit})`,
          })
        );
      });
    };
    from.addEventListener('change', refreshItems);
    refreshItems();

    body.append(
      IM.el('div', { class: 'form-grid' }, [
        IM.el('label', { text: 'Origen' }),
        from,
        IM.el('label', { text: 'Destino' }),
        to,
        IM.el('label', { text: 'Ítem' }),
        itemSel,
        IM.el('label', { text: 'Cantidad' }),
        qty,
        IM.el('label', { text: 'Modo' }),
        modeSel,
        IM.el('button', {
          class: 'btn primary',
          type: 'button',
          text: 'Enviar',
          onclick: () => {
            const r = this.game.startShipment(from.value, to.value, itemSel.value, Number(qty.value) || 1, modeSel.value);
            this.toast(r.ok ? 'Envío iniciado' : r.error, r.ok ? 'ok' : 'error');
            this.refresh();
          },
        }),
      ])
    );

    body.append(IM.el('h2', { text: 'Envíos en tránsito' }));
    if (!st.shipments.length) body.append(IM.el('p', { class: 'muted', text: 'Ningún envío activo.' }));
    st.shipments.forEach((sh) => {
      const it = IM.itemById(sh.itemId);
      const a = IM.locationById(sh.fromId);
      const b = IM.locationById(sh.toId);
      const pct = 100 - (sh.remainingMinutes / sh.totalMinutes) * 100;
      body.append(
        IM.el('div', { class: 'mini-card' }, [
          IM.el('strong', {
            text: `${it?.name || sh.itemId}: ${a?.name} → ${b?.name}`,
          }),
          IM.el('div', { class: 'bar' }, [IM.el('div', { class: 'bar-fill', style: `width:${pct}%` })]),
          IM.el('small', {
            text: `${IM.formatNum(sh.qty, 1)} · ${Math.ceil(sh.remainingMinutes)} min restantes · ${IM.formatMoney(sh.cost)}`,
          }),
        ])
      );
    });
  }

  panelResearch(body) {
    const st = this.game.state;
    if (st.researchQueue) {
      const t = IM.techById(st.researchQueue.techId);
      const pct = 100 * (1 - st.researchQueue.remaining / st.researchQueue.total);
      body.append(
        IM.el('div', { class: 'mini-card' }, [
          IM.el('strong', { text: `En curso: ${t?.name}` }),
          IM.el('div', { class: 'bar' }, [IM.el('div', { class: 'bar-fill', style: `width:${pct}%` })]),
        ])
      );
    }
    const grid = IM.el('div', { class: 'card-grid' });
    (IM_DATA.techs || []).forEach((t) => {
      const done = this.game.hasTech(t.id);
      const reqOk = (t.requires || []).every((r) => this.game.hasTech(r));
      grid.append(
        IM.el('div', { class: `mini-card${done ? ' done' : ''}` }, [
          IM.el('strong', { text: t.name }),
          IM.el('p', { class: 'muted', text: t.desc }),
          IM.el('p', {
            text: done
              ? 'Desbloqueada'
              : `${IM.formatMoney(t.cost)} · ${t.time} min · req: ${(t.requires || []).join(', ') || '—'}`,
          }),
          done
            ? null
            : IM.el('button', {
                class: 'btn',
                type: 'button',
                text: reqOk ? 'Investigar' : 'Bloqueada',
                disabled: reqOk ? undefined : 'disabled',
                onclick: () => {
                  const r = this.game.startResearch(t.id);
                  this.toast(r.ok ? 'Investigación iniciada' : r.error, r.ok ? 'ok' : 'error');
                  this.refresh();
                },
              }),
        ])
      );
    });
    body.append(grid);
  }

  panelFinanzas(body) {
    const st = this.game.state;
    body.append(
      IM.el('div', { class: 'stat-grid' }, [
        ['Tesorería', IM.formatMoney(st.money)],
        ['Beneficio acumulado', IM.formatMoney(st.profitLifetime)],
        ['Ingresos', IM.formatMoney(st.stats.revenue)],
        ['Gastos', IM.formatMoney(st.stats.expenses)],
        ['Impuestos pagados', IM.formatMoney(st.stats.taxesPaid)],
        ['Intereses', IM.formatMoney(st.stats.interestPaid)],
        ['Rating crediticio', String(st.creditRating)],
        ['Inflación índice', st.inflationIndex.toFixed(4)],
        ['Tipo interés', `${(st.interestRate * 100).toFixed(1)}%`],
        ['Multiplicador salarial', `×${st.wageMultiplier.toFixed(2)}`],
      ].map(([k, v]) =>
        IM.el('div', { class: 'stat-box' }, [IM.el('span', { text: k }), IM.el('strong', { text: v })])
      ))
    );

    const amount = IM.el('input', { class: 'input', type: 'number', value: '250000' });
    body.append(
      IM.el('h2', { text: 'Préstamos' }),
      IM.el('div', { class: 'toolbar' }, [
        amount,
        IM.el('button', {
          class: 'btn primary',
          type: 'button',
          text: 'Solicitar préstamo a 5 años',
          onclick: () => {
            const r = this.game.takeLoan(Number(amount.value) || 0, 5);
            this.toast(r.ok ? 'Préstamo concedido' : r.error, r.ok ? 'ok' : 'error');
            this.refresh();
          },
        }),
      ])
    );
    st.loans.forEach((l) => {
      body.append(
        IM.el('div', { class: 'mini-card' }, [
          IM.el('strong', { text: `Deuda ${IM.formatMoney(l.principal)}` }),
          IM.el('p', {
            text: `Cuota diaria ${IM.formatMoney(l.dailyPayment)} · ${(l.rate * 100).toFixed(1)}% · ${l.remainingDays} días`,
          }),
        ])
      );
    });

    body.append(IM.el('h2', { text: 'Salarios' }));
    const wage = IM.el('input', {
      class: 'input',
      type: 'range',
      min: '0.7',
      max: '2',
      step: '0.05',
      value: String(st.wageMultiplier),
    });
    const wageLabel = IM.el('span', { text: `×${st.wageMultiplier.toFixed(2)}` });
    wage.addEventListener('input', () => {
      wageLabel.textContent = `×${Number(wage.value).toFixed(2)}`;
    });
    body.append(
      IM.el('div', { class: 'toolbar' }, [
        wage,
        wageLabel,
        IM.el('button', {
          class: 'btn',
          type: 'button',
          text: 'Aplicar',
          onclick: () => {
            this.game.setWageMultiplier(Number(wage.value));
            this.toast('Política salarial actualizada');
          },
        }),
      ])
    );
  }

  panelMisiones(body) {
    const st = this.game.state;
    body.append(
      IM.el('p', {
        text: `Capítulo ${st.missionChapter} · XP ${st.xp} · Completadas ${Object.keys(st.missionsCompleted).length} / ${(IM_DATA.missions || []).length}`,
      })
    );
    st.activeMissionIds.forEach((id) => {
      const m = IM.missionById(id);
      if (!m) return;
      const p = this.game.missionProgress(m) * 100;
      const done = !!st.missionsCompleted[id];
      body.append(
        IM.el('div', { class: `mini-card${done ? ' done' : ''}` }, [
          IM.el('strong', { text: m.title }),
          IM.el('p', { class: 'muted', text: m.description }),
          IM.el('div', { class: 'bar' }, [IM.el('div', { class: 'bar-fill', style: `width:${p}%` })]),
          IM.el('small', {
            text: `Recompensa ${IM.formatMoney(m.reward.money || 0)} · ${m.reward.xp || 0} XP · ${p.toFixed(0)}%`,
          }),
        ])
      );
    });
  }

  panelEnciclopedia(body) {
    const st = this.game.state;
    const q = IM.el('input', {
      class: 'input',
      placeholder: 'Buscar en catálogo…',
      value: st.ui.encyclopediaQuery || '',
    });
    const cat = IM.el('select', { class: 'input' });
    cat.append(IM.el('option', { value: 'all', text: 'Todas' }));
    Object.entries(IM.categoryLabel).forEach(([k, v]) => cat.append(IM.el('option', { value: k, text: v })));
    cat.value = st.ui.encyclopediaCategory || 'all';
    const meta = IM.el('p', {
      class: 'muted',
      text: `Catálogo: ${(IM_DATA.items || []).length} ítems · ${(IM_DATA.recipes || []).length} recetas · ${(IM_DATA.buildings || []).length} edificios`,
    });
    const list = IM.el('div', { class: 'ency-list' });

    const render = () => {
      st.ui.encyclopediaQuery = q.value;
      st.ui.encyclopediaCategory = cat.value;
      list.innerHTML = '';
      const query = q.value.toLowerCase();
      (IM_DATA.items || [])
        .filter(
          (it) =>
            (cat.value === 'all' || it.category === cat.value) &&
            (!query || it.name.toLowerCase().includes(query) || it.id.includes(query))
        )
        .slice(0, 300)
        .forEach((it) => {
          const recipes = (IM_DATA.recipes || []).filter(
            (r) =>
              (r.outputs || []).some((o) => o.item === it.id) ||
              (r.inputs || []).some((i) => i.item === it.id)
          );
          list.append(
            IM.el('div', { class: 'ency-item' }, [
              IM.el('strong', { text: it.name }),
              IM.el('span', {
                class: 'muted',
                text: `${IM.categoryLabel[it.category] || it.category} · tier ${it.tier} · ${IM.formatMoney(it.basePrice)}/${it.unit}`,
              }),
              IM.el('p', { text: it.description }),
              recipes.length
                ? IM.el('small', {
                    text: `Recetas: ${recipes
                      .slice(0, 5)
                      .map((r) => r.name)
                      .join(' · ')}`,
                  })
                : IM.el('small', { class: 'muted', text: 'Sin recetas directas en v1 (comprable / materia prima).' }),
            ])
          );
        });
    };
    q.addEventListener('input', render);
    cat.addEventListener('change', render);
    body.append(IM.el('div', { class: 'toolbar' }, [q, cat]), meta, list);
    render();
  }

  panelCompetencia(body) {
    this.game.state.competitors.forEach((c) => {
      body.append(
        IM.el('div', { class: 'mini-card' }, [
          IM.el('strong', { text: c.name }),
          IM.el('p', {
            text: `Foco: ${IM.categoryLabel[c.focus] || c.focus} · Agresividad ${(c.aggressiveness * 100).toFixed(0)}%`,
          }),
          IM.el('p', {
            text: `Capital estimado ${IM.formatMoney(c.money)} · Cuota ${(c.marketShare * 100).toFixed(1)}%`,
          }),
          IM.el('div', { class: 'bar' }, [
            IM.el('div', { class: 'bar-fill', style: `width:${c.marketShare * 100}%` }),
          ]),
        ])
      );
    });
  }

  panelEventos(body) {
    const st = this.game.state;
    if (!st.events.length) {
      body.append(IM.el('p', { class: 'muted', text: 'Aún no hay eventos. El mercado evolucionará con el tiempo.' }));
      return;
    }
    st.events.forEach((e) => {
      body.append(
        IM.el('div', { class: 'mini-card' }, [
          IM.el('strong', { text: e.title }),
          IM.el('p', { text: e.desc }),
          IM.el('small', { class: 'muted', text: `Año ${e.year} · día ${e.day}` }),
        ])
      );
    });
  }

  panelAjustes(body) {
    const name = IM.el('input', { class: 'input', value: this.game.state.companyName });
    body.append(
      IM.el('div', { class: 'form-grid' }, [
        IM.el('label', { text: 'Nombre de empresa' }),
        name,
        IM.el('button', {
          class: 'btn',
          type: 'button',
          text: 'Guardar nombre',
          onclick: () => {
            this.game.state.companyName = name.value || 'Tu Corporación Industrial';
            this.refresh();
          },
        }),
      ]),
      IM.el('h2', { text: 'Guardado' }),
      IM.el('div', { class: 'toolbar' }, [
        IM.el('button', {
          class: 'btn primary',
          type: 'button',
          text: 'Guardar ahora',
          onclick: () => {
            IM.Save.save(this.game.state);
            this.toast('Guardado');
          },
        }),
        IM.el('button', {
          class: 'btn',
          type: 'button',
          text: 'Exportar JSON',
          onclick: () => IM.Save.exportJson(this.game.state),
        }),
        IM.el('button', {
          class: 'btn',
          type: 'button',
          text: 'Nueva partida',
          onclick: () => {
            if (confirm('¿Borrar progreso y empezar de nuevo?')) {
              IM.Save.clear();
              this.game.init(IM.createInitialState());
              this.toast('Nueva partida');
              this.showPanel('mapa');
            }
          },
        }),
      ]),
      IM.el('h2', { text: 'Truco I+D' }),
      IM.el('p', {
        class: 'muted',
        text: 'Introduce el código para desbloquear todas las tecnologías.',
      })
    );
    const cheat = IM.el('input', { class: 'input', placeholder: 'Código' });
    body.append(
      IM.el('div', { class: 'toolbar' }, [
        cheat,
        IM.el('button', {
          class: 'btn',
          type: 'button',
          text: 'Activar',
          onclick: () => {
            if (cheat.value.trim().toUpperCase() === IM_CONFIG.cheatUnlockAllCode) {
              this.game.unlockAllTechs();
              this.toast('Todas las tecnologías desbloqueadas');
            } else this.toast('Código incorrecto', 'error');
          },
        }),
      ]),
      IM.el('p', {
        class: 'muted',
        text: `Versión ${IM_CONFIG.version} · 1 min real = 1 h juego · Leaflet + OSM`,
      })
    );

    const importInput = IM.el('input', { type: 'file', accept: 'application/json' });
    importInput.addEventListener('change', async () => {
      const file = importInput.files?.[0];
      if (!file) return;
      try {
        const data = await IM.Save.importJson(file);
        this.game.init(data);
        this.toast('Partida importada');
        this.showPanel('mapa');
      } catch (e) {
        this.toast('JSON inválido', 'error');
      }
    });
    body.append(IM.el('h2', { text: 'Importar' }), importInput);
  }

  toast(msg, type = 'ok') {
    const host = document.getElementById('toasts');
    if (!host) return;
    const el = IM.el('div', { class: `toast ${type}`, text: msg });
    host.append(el);
    setTimeout(() => el.remove(), 3200);
  }
};
