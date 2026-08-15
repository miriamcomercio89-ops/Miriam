/** UI principal mapa-first estilo Rise of Industry */
window.IM = window.IM || {};

IM.UI = class UI {
  constructor(game) {
    this.game = game;
    this.renderer = null;
    this.root = null;
  }

  mount() {
    const app = document.getElementById('app');
    app.innerHTML = '';
    this.root = IM.el('div', { class: 'shell roi-shell' });
    app.appendChild(this.root);
    this.root.append(
      IM.el('header', { class: 'topbar', id: 'topbar' }),
      IM.el('div', { class: 'roi-main' }, [
        IM.el('aside', { class: 'sidebar', id: 'sidebar' }),
        IM.el('div', { class: 'map-wrap', id: 'mapWrap' }, [
          IM.el('canvas', { id: 'mapCanvas' }),
          IM.el('div', { class: 'map-hint', id: 'mapHint' }),
        ]),
        IM.el('aside', { class: 'inspector', id: 'inspector' }),
      ]),
      IM.el('div', { id: 'toastHost', class: 'toast-host' })
    );

    const canvas = document.getElementById('mapCanvas');
    this.renderer = new IM.Renderer(canvas, this.game);
    this.renderer.resize();
    window.addEventListener('resize', () => this.renderer.resize());
    this.bindMap(canvas);
    this.game.onChange(() => this.refresh());
    this.refresh();
    this.loop();
  }

  loop() {
    let last = performance.now();
    const frame = (now) => {
      const dt = now - last;
      last = now;
      this.game.tick(dt);
      this.renderer?.draw();
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }

  bindMap(canvas) {
    let panning = false;
    let last = null;
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    canvas.addEventListener('mousedown', (e) => {
      const rect = canvas.getBoundingClientRect();
      const tile = this.renderer.screenToTile(e.clientX - rect.left, e.clientY - rect.top);
      if (e.button === 1 || e.button === 2 || this.game.state.ui.tool === 'pan') {
        panning = true;
        last = { x: e.clientX, y: e.clientY };
        return;
      }
      this.onTileClick(tile.x, tile.y, e.shiftKey);
    });
    window.addEventListener('mouseup', () => { panning = false; });
    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      const tile = this.renderer.screenToTile(e.clientX - rect.left, e.clientY - rect.top);
      this.game.state.ui.hover = tile;
      const hint = document.getElementById('mapHint');
      const t = this.game.tile(tile.x, tile.y);
      const terr = t ? IM_DATA.terrain[t.terrain]?.name : '—';
      if (hint) hint.textContent = `(${tile.x},${tile.y}) · ${terr}${t?.road ? ' · carretera' : ''}`;
      if (panning && last) {
        const ts = IM_CONFIG.tileSize;
        this.game.state.ui.camX -= (e.clientX - last.x) / ts;
        this.game.state.ui.camY -= (e.clientY - last.y) / ts;
        last = { x: e.clientX, y: e.clientY };
      }
    });
  }

  onTileClick(x, y, shift) {
    const st = this.game.state;
    const tool = st.ui.tool;
    if (tool === 'road') {
      const r = shift ? this.game.eraseRoad(x, y) : this.game.paintRoad(x, y);
      if (r && r.error) this.toast(r.error, 'error');
      return;
    }
    if (tool === 'build' && st.ui.buildId) {
      const r = this.game.placeBuilding(st.ui.buildId, x, y);
      this.toast(r.ok ? 'Construido' : r.error, r.ok ? 'ok' : 'error');
      return;
    }
    const b = this.game.buildingAt(x, y);
    st.ui.selectedId = b?.id || null;
    st.ui.tool = 'select';
    this.refresh();
  }

  toast(msg, type = 'info') {
    const host = document.getElementById('toastHost');
    if (!host) return;
    const el = IM.el('div', { class: `toast ${type}`, text: msg });
    host.appendChild(el);
    setTimeout(() => el.remove(), 2800);
  }

  refresh() {
    this.renderTopbar();
    this.renderSidebar();
    this.renderInspector();
  }

  renderTopbar() {
    const st = this.game.state;
    const bar = document.getElementById('topbar');
    if (!bar) return;
    const season = this.game.season();
    bar.innerHTML = '';
    bar.append(
      IM.el('div', { class: 'brand' }, [
        IM.el('span', { class: 'brand-mark', text: 'IM' }),
        IM.el('div', {}, [
          IM.el('strong', { text: 'Industry Manager' }),
          IM.el('small', { text: `${st.companyName} · estilo Rise of Industry` }),
        ]),
      ]),
      IM.el('div', { class: 'stat' }, [IM.el('span', { class: 'label', text: 'Caja' }), IM.el('strong', { text: IM.formatMoney(st.money) })]),
      IM.el('div', { class: 'stat' }, [IM.el('span', { class: 'label', text: 'Fecha' }), IM.el('strong', { text: IM.dateLabel(st.year, st.day) })]),
      IM.el('div', { class: 'stat season-stat', style: `border-color:${season.color}` }, [
        IM.el('span', { class: 'label', text: 'Estación' }),
        IM.el('strong', { text: season.name }),
      ]),
      IM.el('div', { class: 'speed-controls' }, [
        IM.el('button', {
          class: 'speed-btn skip-day-btn',
          type: 'button',
          text: '▶▶ +1 día',
          onclick: () => { this.game.skipOneDay(); this.toast(`Día: ${IM.dateLabel(st.year, st.day)}`); },
        }),
        ...IM_CONFIG.speeds.map((s) =>
          IM.el('button', {
            type: 'button',
            class: `speed-btn${(st.paused && s === 0) || (!st.paused && st.speed === s) ? ' active' : ''}`,
            text: s === 0 ? '⏸' : `${s}×`,
            onclick: () => this.game.setSpeed(s === 0 ? 0 : s),
          })
        ),
        IM.el('button', {
          class: 'speed-btn',
          type: 'button',
          text: 'Guardar',
          onclick: () => { IM.Save.save(st); this.toast('Guardado'); },
        }),
      ])
    );
  }

  renderSidebar() {
    const side = document.getElementById('sidebar');
    if (!side) return;
    const st = this.game.state;
    side.innerHTML = '';
    const tabs = [
      ['build', 'Construir'],
      ['contracts', 'Contratos'],
      ['research', 'I+D'],
      ['guides', 'Guías'],
      ['cheats', 'Trucos'],
    ];
    side.append(
      IM.el(
        'div',
        { class: 'side-tabs' },
        tabs.map(([id, label]) =>
          IM.el('button', {
            type: 'button',
            class: `nav-btn${st.ui.panel === id ? ' active' : ''}`,
            text: label,
            onclick: () => { st.ui.panel = id; this.refresh(); },
          })
        )
      )
    );
    const body = IM.el('div', { class: 'side-body' });
    side.append(body);
    if (st.ui.panel === 'build') this.panelBuild(body);
    if (st.ui.panel === 'contracts') this.panelContracts(body);
    if (st.ui.panel === 'research') this.panelResearch(body);
    if (st.ui.panel === 'guides') this.panelGuides(body);
    if (st.ui.panel === 'cheats') this.panelCheats(body);
  }

  panelBuild(body) {
    const st = this.game.state;
    body.append(IM.el('p', { class: 'muted', text: '1) Coloca la Sede cerca de Málaga. 2) Almacén. 3) Extractores/granjas en nodos. 4) Carreteras. 5) Fábricas. 6) Cumple contratos.' }));
    body.append(
      IM.el('div', { class: 'toolbar' }, [
        IM.el('button', {
          class: `btn${st.ui.tool === 'select' ? ' primary' : ''}`,
          type: 'button',
          text: 'Seleccionar',
          onclick: () => { st.ui.tool = 'select'; st.ui.buildId = null; this.refresh(); },
        }),
        IM.el('button', {
          class: `btn${st.ui.tool === 'road' ? ' primary' : ''}`,
          type: 'button',
          text: 'Carretera',
          onclick: () => { st.ui.tool = 'road'; st.ui.buildId = null; this.refresh(); },
        }),
        IM.el('button', {
          class: `btn${st.ui.tool === 'pan' ? ' primary' : ''}`,
          type: 'button',
          text: 'Mover mapa',
          onclick: () => { st.ui.tool = 'pan'; this.refresh(); },
        }),
      ])
    );
    const groups = {
      special: 'Especial',
      logistics: 'Logística',
      gather: 'Extracción',
      farm: 'Granjas',
      factory: 'Fábricas',
    };
    Object.entries(groups).forEach(([kind, label]) => {
      const list = (IM_DATA.buildings || []).filter((b) => b.kind === kind);
      if (!list.length) return;
      body.append(IM.el('h3', { text: label }));
      list.forEach((b) => {
        const locked = !this.game.unlockedBuilding(b);
        const row = IM.el('button', {
          type: 'button',
          class: `build-row${st.ui.buildId === b.id ? ' active' : ''}${locked ? ' locked' : ''}`,
          disabled: locked ? 'disabled' : undefined,
          onclick: () => {
            st.ui.tool = 'build';
            st.ui.buildId = b.id;
            this.refresh();
          },
        });
        row.append(
          IM.el('span', { class: 'swatch', style: `background:${b.color}` }),
          IM.el('span', { text: b.name }),
          IM.el('small', { text: locked ? 'I+D' : IM.formatMoney(b.cost) })
        );
        body.append(row);
      });
    });
  }

  panelContracts(body) {
    const st = this.game.state;
    const season = this.game.season();
    body.append(
      IM.el('p', {
        class: 'muted',
        text: `Contratos semanales. Fallar baja reputación y puede cerrar tiendas ${IM_CONFIG.shopCloseDays} días. Estación: ${season.name} (turismo ×${season.tourism}).`,
      })
    );
    const active = st.contracts.filter((c) => c.status === 'active');
    if (!active.length) body.append(IM.el('p', { text: 'Sin contratos activos esta semana.' }));
    active.forEach((c) => {
      const prod = IM.product(c.productId);
      const card = IM.el('div', { class: 'contract-card' });
      card.append(
        IM.el('strong', { text: `${c.townName} · ${c.shopName}` }),
        IM.el('p', { text: `${prod?.icon || ''} ${prod?.name}: ${c.delivered}/${c.qty} · ${IM.formatMoney(c.unitPrice)}/u` }),
        IM.el('small', { class: 'muted', text: `Plazo: día ${c.deadlineDay}` }),
        IM.el('button', {
          class: 'btn primary',
          type: 'button',
          text: 'Entregar desde selección',
          onclick: () => {
            if (!st.ui.selectedId) return this.toast('Selecciona un almacén/fábrica', 'error');
            const r = this.game.deliverToContract(c.id, st.ui.selectedId);
            this.toast(r.ok ? `+${IM.formatMoney(r.money)}` : r.error, r.ok ? 'ok' : 'error');
            this.refresh();
          },
        })
      );
      body.append(card);
    });
    body.append(IM.el('h3', { text: 'Pueblos' }));
    st.world.towns.forEach((t) => {
      body.append(
        IM.el('div', { class: 'kv' }, [
          IM.el('span', { text: t.name }),
          IM.el('strong', {
            text: t.shopClosedUntil ? `CERRADO hasta d${t.shopClosedUntil}` : `Rep ${t.reputation}`,
          }),
        ])
      );
    });
  }

  panelResearch(body) {
    (IM_DATA.techs || []).forEach((t) => {
      const done = this.game.hasTech(t.id);
      const row = IM.el('div', { class: 'tech-row' });
      row.append(
        IM.el('div', {}, [
          IM.el('strong', { text: t.name }),
          IM.el('p', { class: 'muted', text: t.desc }),
        ]),
        done
          ? IM.el('span', { class: 'ok', text: 'OK' })
          : IM.el('button', {
              class: 'btn',
              type: 'button',
              text: IM.formatMoney(t.cost),
              onclick: () => {
                const r = this.game.research(t.id);
                this.toast(r.ok ? 'Investigado' : r.error, r.ok ? 'ok' : 'error');
                this.refresh();
              },
            })
      );
      body.append(row);
    });
  }

  panelGuides(body) {
    body.append(
      IM.el('p', {
        class: 'muted',
        text: '100 PDFs a color (2000–2099) con qué construir y en qué coordenadas cada día. También en /guias/.',
      })
    );
    const list = IM.el('div', { class: 'guide-year-list' });
    for (let y = 2000; y <= 2099; y++) {
      list.append(
        IM.el('a', {
          class: 'guide-year-link',
          href: `guias/ano-${y}.pdf`,
          target: '_blank',
          text: String(y),
        })
      );
    }
    body.append(list);
    const g = IM.DayGuide?.page(this.game.state.year, this.game.state.day);
    if (g) {
      body.append(IM.el('h3', { text: `Hoy: ${g.dateLabel}` }));
      body.append(IM.el('p', { text: g.headline }));
      body.append(IM.el('ol', {}, g.steps.map((s) => IM.el('li', { text: s }))));
    }
    body.append(
      IM.el('p', {}, [
        IM.el('a', {
          href: 'https://github.com/miriamcomercio89-ops/Miriam/archive/refs/heads/cursor/industry-manager-b124.zip',
          target: '_blank',
          text: 'Descargar ZIP del juego + guías',
        }),
      ])
    );
  }

  panelCheats(body) {
    body.append(IM.el('h3', { text: 'Trucos de dinero' }));
    body.append(
      IM.el('ul', { class: 'cheat-list' }, [
        IM.el('li', { text: 'PASTA_GORDA → +500.000 €' }),
        IM.el('li', { text: 'MILLON_EXPRESS → +1.000.000 €' }),
        IM.el('li', { text: 'SOCORRO_CAJA → mínimo 100.000 €' }),
        IM.el('li', { text: 'INDUSTRIA_TOTAL → desbloquea todo el I+D' }),
        IM.el('li', { text: 'REPUTACION_MAX → reputación 100 en todos los pueblos' }),
      ])
    );
    const input = IM.el('input', { class: 'input', placeholder: 'Código truco…' });
    body.append(
      IM.el('div', { class: 'toolbar' }, [
        input,
        IM.el('button', {
          class: 'btn primary',
          type: 'button',
          text: 'Activar',
          onclick: () => {
            const r = this.game.applyCheat(input.value);
            this.toast(r.ok ? r.msg : r.error, r.ok ? 'ok' : 'error');
            input.value = '';
            this.refresh();
          },
        }),
      ])
    );
  }

  renderInspector() {
    const box = document.getElementById('inspector');
    if (!box) return;
    const st = this.game.state;
    box.innerHTML = '';
    box.append(IM.el('h2', { text: 'Inspector' }));
    const season = this.game.season();
    box.append(
      IM.el('div', { class: 'season-banner', style: `background:${season.color}33;border-color:${season.color}` }, [
        IM.el('strong', { text: season.name }),
        IM.el('p', {
          text: `Olivar ×${season.oliveMul} · Trigo ×${season.wheatMul} · Cítricos ×${season.citrusMul} · Turismo ×${season.tourism}`,
        }),
      ])
    );
    const b = st.buildings.find((x) => x.id === st.ui.selectedId);
    if (!b) {
      box.append(IM.el('p', { class: 'muted', text: 'Click en un edificio o elige herramienta a la izquierda.' }));
      box.append(IM.el('h3', { text: 'Registro' }));
      st.log.slice(0, 12).forEach((l) => box.append(IM.el('div', { class: `log-line ${l.type}`, text: l.msg })));
      return;
    }
    const def = IM.building(b.type);
    box.append(IM.el('h3', { text: def?.name || b.type }));
    box.append(IM.el('p', { class: 'muted', text: `Casilla (${b.x},${b.y}) · ${def?.desc || ''}` }));
    box.append(IM.el('h3', { text: 'Stock' }));
    const entries = Object.entries(b.stock).filter(([, q]) => q > 0);
    if (!entries.length) box.append(IM.el('p', { class: 'muted', text: 'Vacío' }));
    entries.forEach(([pid, q]) => {
      const p = IM.product(pid);
      box.append(IM.el('div', { class: 'kv' }, [IM.el('span', { text: `${p?.icon || ''} ${p?.name || pid}` }), IM.el('strong', { text: String(q) })]));
    });
  }
};

// mini DOM helper (si no existe)
if (!IM.el) {
  IM.el = (tag, attrs = {}, children = []) => {
    const el = document.createElement(tag);
    Object.entries(attrs || {}).forEach(([k, v]) => {
      if (v === undefined || v === null) return;
      if (k === 'text') el.textContent = v;
      else if (k === 'class') el.className = v;
      else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v);
      else el.setAttribute(k, v);
    });
    (Array.isArray(children) ? children : [children]).filter(Boolean).forEach((c) => el.appendChild(typeof c === 'string' ? document.createTextNode(c) : c));
    return el;
  };
}
