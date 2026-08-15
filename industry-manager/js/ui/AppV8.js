/** UI v8: tienda pestañas, dashboard vibrante, saltar día, DJ, guías, misiones locales */
window.IM = window.IM || {};

(function () {
  const Proto = IM.UI && IM.UI.prototype;
  if (!Proto) return;

  const _mount = Proto.mount;
  Proto.mount = function () {
    _mount.call(this);
    document.body.classList.add('theme-v8');
    this.ensureV8Chrome();
  };

  Proto.ensureV8Chrome = function () {
    // DJ floating control
    if (!document.getElementById('djDock')) {
      const dock = IM.el('div', { id: 'djDock', class: 'dj-dock' });
      document.getElementById('app')?.appendChild(dock);
    }
    this.renderDjDock();
  };

  const _renderTopbar = Proto.renderTopbar;
  Proto.renderTopbar = function () {
    _renderTopbar.call(this);
    const bar = document.getElementById('topbar');
    if (!bar) return;
    const speeds = bar.querySelector('.speed-controls');
    if (!speeds || speeds.querySelector('[data-skip-day]')) return;
    speeds.prepend(
      IM.el('button', {
        type: 'button',
        class: 'speed-btn skip-day-btn',
        'data-skip-day': '1',
        text: '▶▶ +1 día',
        title: 'Saltar exactamente un día',
        onclick: () => {
          const r = this.game.skipOneDay();
          this.toast(r.ok ? `Avanzado a ${IM.formatGameDate(this.game.state)}` : r.error || 'Error', r.ok ? 'ok' : 'error');
          this.refresh();
        },
      })
    );
  };

  const _renderSidebar = Proto.renderSidebar;
  Proto.renderSidebar = function () {
    if (_renderSidebar) _renderSidebar.call(this);
    const side = document.getElementById('sidebar');
    if (!side) return;
    const st = this.game.state;
    const extras = [
      ['mundo', 'misiones_locales', 'Misiones ciudad'],
      ['mundo', 'guias', 'Guías siglo'],
      ['corp', 'dj', 'DJ bioma'],
      ['sistema', 'dj', 'DJ bioma'],
    ];
    // Avoid duplicate DJ: prefer corp, else sistema
    const seen = new Set([...side.querySelectorAll('[data-panel]')].map((b) => b.dataset.panel));
    extras.forEach(([group, id, label]) => {
      if (st.ui.navGroup !== group) return;
      if (seen.has(id)) return;
      seen.add(id);
      side.append(
        IM.el('button', {
          class: `nav-btn nav-sub${st.ui.panel === id ? ' active' : ''}`,
          'data-panel': id,
          type: 'button',
          text: label,
          onclick: () => this.showPanel(id),
        })
      );
    });
  };

  const _renderPanel = Proto.renderPanel;
  Proto.renderPanel = function (id) {
    const v8 = {
      misiones_locales: 'Misiones de ciudad (OSM)',
      guias: 'Guía del siglo 2000–2099',
      dj: 'DJ bioma procedural',
    };
    if (id === 'industria') {
      const header = document.getElementById('panelHeader');
      const body = document.getElementById('panelBody');
      header.innerHTML = '';
      header.append(IM.el('h1', { text: 'Industria · tienda por pestañas' }));
      body.innerHTML = '';
      this.panelIndustriaV8(body);
      return;
    }
    if (id === 'dashboard') {
      const header = document.getElementById('panelHeader');
      const body = document.getElementById('panelBody');
      header.innerHTML = '';
      header.append(IM.el('h1', { text: 'Dashboard vibrante' }));
      body.innerHTML = '';
      this.panelDashboardV8(body);
      return;
    }
    if (!v8[id]) {
      _renderPanel.call(this, id);
      return;
    }
    const header = document.getElementById('panelHeader');
    const body = document.getElementById('panelBody');
    header.innerHTML = '';
    header.append(IM.el('h1', { text: v8[id] }));
    body.innerHTML = '';
    if (id === 'misiones_locales') this.panelMisionesLocales(body);
    if (id === 'guias') this.panelGuias(body);
    if (id === 'dj') this.panelDj(body);
  };

  Proto.panelIndustriaV8 = function (body) {
    const st = this.game.state;
    let locId = st.ui.selectedLocationId;
    body.append(
      IM.el('div', { class: 'toolbar' }, [
        this.locSelect(locId, (v) => {
          st.ui.selectedLocationId = v;
          this.refresh();
        }),
      ])
    );
    locId = st.ui.selectedLocationId;
    const site = st.sites.find((s) => s.locationId === locId);
    if (!site) {
      body.append(IM.el('p', { class: 'muted', text: 'Sin planta. Fundá desde el mapa (parte en Málaga).' }));
      return;
    }

    const cats = {};
    (IM_DATA.buildings || []).forEach((b) => {
      // Filtrar residuales Mk por si quedan en datos viejos
      if (/Mk\d/i.test(b.name)) return;
      cats[b.category] = cats[b.category] || [];
      cats[b.category].push(b);
    });
    const catOrder = Object.keys(cats).sort();
    st.ui.buildTab = st.ui.buildTab || catOrder[0] || 'extraccion';
    if (!cats[st.ui.buildTab]) st.ui.buildTab = catOrder[0];

    const tabs = IM.el('div', { class: 'shop-tabs' });
    catOrder.forEach((cat) => {
      tabs.append(
        IM.el('button', {
          type: 'button',
          class: `shop-tab${st.ui.buildTab === cat ? ' active' : ''}`,
          text: `${IM_DATA.buildingCategoryLabel?.[cat] || cat} (${cats[cat].length})`,
          onclick: () => {
            st.ui.buildTab = cat;
            this.refresh();
          },
        })
      );
    });
    body.append(tabs);

    const search = IM.el('input', { class: 'input', placeholder: 'Buscar en esta pestaña…' });
    const grid = IM.el('div', { class: 'build-grid shop-grid' });
    const render = () => {
      grid.innerHTML = '';
      const q = (search.value || '').toLowerCase();
      const list = (cats[st.ui.buildTab] || [])
        .filter((b) => !q || b.name.toLowerCase().includes(q) || b.id.includes(q))
        .sort((a, b) => a.name.localeCompare(b.name, 'es'));
      list.forEach((b) => {
        const card = IM.el('div', { class: 'build-card' });
        card.append(IM.Icons.buildingEl(b, 48));
        card.append(
          IM.el('div', { class: 'build-card-body' }, [
            IM.el('strong', { text: b.name }),
            IM.el('small', {
              class: 'muted',
              text: `${b.slots} slots · fam. ${b.family || b.id}`,
            }),
            IM.el('div', { class: 'build-card-foot' }, [
              IM.el('span', { class: 'price-tag', text: IM.formatMoney(b.cost * st.inflationIndex) }),
              IM.el('button', {
                class: 'btn primary',
                type: 'button',
                text: 'Construir',
                onclick: () => {
                  const r = this.game.buildBuilding(locId, b.id);
                  this.toast(r.ok ? 'Construido' : r.error, r.ok ? 'ok' : 'error');
                  this.refresh();
                },
              }),
            ]),
          ])
        );
        grid.append(card);
      });
    };
    search.oninput = render;
    body.append(
      IM.el('p', {
        class: 'muted',
        text: `${Object.values(cats).reduce((a, x) => a + x.length, 0)} edificios únicos · sin Mk · pestaña activa: ${IM_DATA.buildingCategoryLabel?.[st.ui.buildTab] || st.ui.buildTab}`,
      })
    );
    body.append(IM.el('div', { class: 'toolbar' }, [search]));
    body.append(grid);
    render();

    body.append(IM.el('h2', { text: 'En esta planta' }));
    site.buildings.forEach((building) => {
      const def = IM.buildingById(building.type);
      const block = IM.el('div', { class: 'building-block' });
      const head = IM.el('div', { class: 'product-row' });
      if (def) head.append(IM.Icons.buildingEl(def, 40));
      head.append(IM.el('strong', { text: `${def?.name || building.type} · Nv.${building.level || 1}` }));
      block.append(head);
      block.append(
        IM.el('button', {
          class: 'btn',
          type: 'button',
          text: 'Mejorar nivel',
          onclick: () => {
            const r = this.game.upgradeBuilding(site.id, building.id);
            this.toast(r.ok ? 'OK' : r.error, r.ok ? 'ok' : 'error');
            this.refresh();
          },
        })
      );
      building.slots.forEach((slot, idx) => {
        const row = IM.el('div', { class: 'slot-row' });
        if (!slot) {
          row.append(
            IM.el('span', { text: `Hueco ${idx + 1}` }),
            IM.el('button', {
              class: 'btn',
              type: 'button',
              text: 'Instalar',
              onclick: () => this.openInstallModal(site.id, building, idx),
            })
          );
        } else {
          const recipe = IM.recipeById(slot.recipeId);
          row.append(IM.el('span', { text: `${recipe?.name || slot.recipeId} · ${slot.lastBlockReason || 'ok'}` }));
        }
        block.append(row);
      });
      body.append(block);
    });
  };

  Proto.panelDashboardV8 = function (body) {
    const st = this.game.state;
    const locId = st.ui.selectedLocationId;
    body.append(
      IM.el('div', { class: 'dash-hero' }, [
        IM.el('div', { class: 'dash-hero-brand' }, [
          IM.el('span', { class: 'dash-logo', text: 'IM' }),
          IM.el('div', {}, [
            IM.el('h2', { text: 'Industry Manager' }),
            IM.el('p', { text: `${st.companyName} · ${IM.formatGameDate(st)} · año corp. ${this.game.companyYearsElapsed()}` }),
          ]),
        ]),
        IM.el('div', { class: 'dash-hero-cta' }, [
          IM.el('button', {
            class: 'btn primary',
            type: 'button',
            text: 'Saltar 1 día',
            onclick: () => {
              this.game.skipOneDay();
              this.refresh();
            },
          }),
          IM.el('button', {
            class: 'btn',
            type: 'button',
            text: 'Guía de hoy',
            onclick: () => this.showPanel('guias'),
          }),
        ]),
      ])
    );

    body.append(this.locSelect(locId, (v) => { st.ui.selectedLocationId = v; this.refresh(); }));
    const m = this.game.getPlantMetrics(st.ui.selectedLocationId);
    const oee = this.game.oeeForLocation(st.ui.selectedLocationId);
    const city = this.game.primaryCity();
    const guide = IM.GuideEngine.page(st.year, st.day, this.game);

    const tiles = [
      ['Tesorería', IM.formatMoney(st.money), 'tile-gold'],
      ['OEE', `${(oee * 100).toFixed(1)}%`, 'tile-teal'],
      ['Plantas', String(st.sites.length), 'tile-blue'],
      ['Empleados', String(st.employees), 'tile-coral'],
      ['XP', String(st.xp || 0), 'tile-violet'],
      ['Ciudad ancla', city?.name || 'Málaga', 'tile-lime'],
      ['Anillo guía', guide.ring, 'tile-orange'],
      ['Misiones locales', String((st.localMissions || []).length), 'tile-pink'],
      ['Output', IM.formatNum(m.output, 1), 'tile-cyan'],
      ['Polución', IM.formatNum(st.pollutionTotal, 2), 'tile-rose'],
      ['Créditos verdes', IM.formatNum(st.greenCredits, 1), 'tile-mint'],
      ['Capítulo', String(st.campaignChapter || 1), 'tile-indigo'],
    ];
    body.append(
      IM.el(
        'div',
        { class: 'dash-tiles' },
        tiles.map(([k, v, cls]) =>
          IM.el('div', { class: `dash-tile ${cls}` }, [IM.el('span', { text: k }), IM.el('strong', { text: v })])
        )
      )
    );

    body.append(IM.el('h2', { text: 'Foco del día' }));
    body.append(
      IM.el('div', { class: 'dash-focus' }, [
        IM.el('p', { text: guide.tip }),
        IM.el('p', { class: 'muted', text: `Modo: ${guide.mood} · ${guide.ringFocus}` }),
        IM.el(
          'div',
          { class: 'chip-row' },
          (guide.items || []).slice(0, 6).map((it) => IM.el('span', { class: 'chip', text: it.name }))
        ),
      ])
    );

    body.append(IM.el('h2', { text: 'Alertas' }));
    if (!m.alerts?.length) body.append(IM.el('p', { class: 'muted', text: 'Sin alertas en este tick.' }));
    [...new Set(m.alerts || [])].forEach((a) => body.append(IM.el('div', { class: 'mini-card alert-card', text: a })));
  };

  Proto.panelMisionesLocales = function (body) {
    const st = this.game.state;
    this.game.refreshLocalMissions(false);
    body.append(
      IM.el('p', {
        class: 'muted',
        text: 'Misiones generadas desde tus ciudades fundadas en el mapa OSM. Sin plantas = sin misiones locales.',
      })
    );
    body.append(
      IM.el('button', {
        class: 'btn',
        type: 'button',
        text: 'Regenerar del día',
        onclick: () => {
          this.game.refreshLocalMissions(true);
          this.refresh();
        },
      })
    );
    (st.localMissions || []).forEach((m) => {
      const done = !!st.localMissionDone[m.id];
      const prog = this.game.missionProgress(m);
      body.append(
        IM.el('div', { class: `mission-card${done ? ' done' : ''}` }, [
          IM.el('strong', { text: m.title }),
          IM.el('p', { text: m.desc }),
          IM.el('div', { class: 'progress-bar' }, [IM.el('div', { class: 'progress-fill', style: `width:${(prog * 100).toFixed(0)}%` })]),
          IM.el('small', {
            class: 'muted',
            text: done ? 'Completada' : `Recompensa ${IM.formatMoney(m.reward?.money || 0)} · XP ${m.reward?.xp || 0}`,
          }),
        ])
      );
    });
    if (!(st.localMissions || []).length) {
      body.append(IM.el('p', { text: 'Fundá en Málaga (u otra ciudad real) para desbloquear misiones locales.' }));
    }
  };

  Proto.panelGuias = function (body) {
    const st = this.game.state;
    const bm = st.guideBookmark || { year: st.year, day: st.day };
    const yearInp = IM.el('input', { class: 'input', type: 'number', value: String(bm.year), min: '2000', max: '2099' });
    const dayInp = IM.el('input', { class: 'input', type: 'number', value: String(bm.day), min: '1', max: '366' });
    const viewer = IM.el('div', { class: 'guide-viewer' });

    const render = () => {
      const year = Math.min(2099, Math.max(2000, Number(yearInp.value) || 2000));
      const day = Math.min(IM.daysInYear(year), Math.max(1, Number(dayInp.value) || 1));
      st.guideBookmark = { year, day };
      const g = IM.GuideEngine.page(year, day, this.game);
      viewer.innerHTML = '';
      viewer.append(
        IM.el('h2', { text: g.dateLabel }),
        IM.el('p', { class: 'guide-ring', text: `${g.ring} — ${g.ringFocus}` }),
        IM.el('p', { text: g.tip }),
        IM.el('h3', { text: 'Ítems a dominar hoy' }),
        IM.el(
          'ul',
          {},
          g.items.map((it) => IM.el('li', { text: `${it.name} (${it.category})` }))
        ),
        IM.el('h3', { text: 'Edificios sugeridos' }),
        IM.el(
          'ul',
          {},
          g.buildings.map((b) => IM.el('li', { text: b.name }))
        ),
        IM.el('h3', { text: 'Acciones' }),
        IM.el(
          'ol',
          {},
          g.actions.map((a) => IM.el('li', { text: a }))
        )
      );
    };

    body.append(
      IM.el('p', {
        class: 'muted',
        text: '100 PDFs pregenerados (un año = una página por día). Descarga el ZIP del repo o ábrelos en /guias/.',
      })
    );
    body.append(
      IM.el('div', { class: 'toolbar' }, [
        IM.el('label', { text: 'Año' }),
        yearInp,
        IM.el('label', { text: 'Día del año' }),
        dayInp,
        IM.el('button', { class: 'btn primary', type: 'button', text: 'Ver', onclick: render }),
        IM.el('button', {
          class: 'btn',
          type: 'button',
          text: 'Hoy en partida',
          onclick: () => {
            yearInp.value = String(st.year);
            dayInp.value = String(st.day);
            render();
          },
        }),
      ])
    );

    const list = IM.el('div', { class: 'guide-year-list' });
    for (let y = 2000; y <= 2099; y++) {
      list.append(
        IM.el('a', {
          class: 'guide-year-link',
          href: `guias/ano-${y}.pdf`,
          target: '_blank',
          text: String(y),
          title: `PDF año ${y}`,
        })
      );
    }
    body.append(IM.el('h3', { text: 'PDFs en el repositorio' }));
    body.append(list);
    body.append(
      IM.el('p', {}, [
        IM.el('a', {
          href: 'https://github.com/miriamcomercio89-ops/Miriam/archive/refs/heads/cursor/industry-manager-b124.zip',
          target: '_blank',
          text: 'Descargar ZIP completo del juego + guías',
        }),
      ])
    );
    body.append(viewer);
    render();
  };

  Proto.panelDj = function (body) {
    const dj = this.game.state.dj;
    const biomes = ['auto', 'malaga', 'puerto', 'fundicion', 'almazara', 'campo', 'electronica', 'oficina', 'noche', 'tormenta'];
    body.append(IM.el('p', { class: 'muted', text: 'Banda sonora procedural (Web Audio). Sin pistas comerciales.' }));
    const sel = IM.el('select', { class: 'input' });
    biomes.forEach((b) => sel.append(IM.el('option', { value: b, text: b, selected: dj.biome === b ? 'selected' : undefined })));
    sel.onchange = () => {
      dj.biome = sel.value;
      IM.Audio.applyDj(dj, this.game.primaryCity());
      this.renderDjDock();
    };
    const vol = IM.el('input', { class: 'input', type: 'range', min: '0', max: '50', value: String(Math.round(dj.volume * 100)) });
    vol.oninput = () => {
      dj.volume = Number(vol.value) / 100;
      IM.Audio.setVolume(dj.volume);
    };
    const inten = IM.el('input', { class: 'input', type: 'range', min: '0', max: '100', value: String(Math.round(dj.intensity * 100)) });
    inten.oninput = () => {
      dj.intensity = Number(inten.value) / 100;
      IM.Audio.applyDj(dj, this.game.primaryCity());
    };
    const variety = IM.el('input', { class: 'input', type: 'range', min: '0', max: '100', value: String(Math.round(dj.variety * 100)) });
    variety.oninput = () => {
      dj.variety = Number(variety.value) / 100;
      IM.Audio.applyDj(dj, this.game.primaryCity());
    };
    body.append(IM.el('div', { class: 'toolbar' }, [IM.el('label', { text: 'Bioma' }), sel]));
    body.append(IM.el('div', { class: 'toolbar' }, [IM.el('label', { text: 'Volumen' }), vol]));
    body.append(IM.el('div', { class: 'toolbar' }, [IM.el('label', { text: 'Intensidad' }), inten]));
    body.append(IM.el('div', { class: 'toolbar' }, [IM.el('label', { text: 'Variedad' }), variety]));
    body.append(
      IM.el('button', {
        class: 'btn primary',
        type: 'button',
        text: dj.enabled ? 'Silenciar' : 'Activar',
        onclick: () => {
          dj.enabled = !dj.enabled;
          IM.Audio.setEnabled(dj.enabled);
          if (dj.enabled) IM.Audio.applyDj(dj, this.game.primaryCity());
          this.refresh();
        },
      })
    );
    body.append(
      IM.el('button', {
        class: 'btn',
        type: 'button',
        text: 'Nueva variación',
        onclick: () => {
          IM.Audio.reshuffle(dj);
          IM.Audio.applyDj(dj, this.game.primaryCity());
          this.toast('Nueva mezcla');
        },
      })
    );
  };

  Proto.renderDjDock = function () {
    const dock = document.getElementById('djDock');
    if (!dock) return;
    const dj = this.game.state.dj || {};
    dock.innerHTML = '';
    dock.append(
      IM.el('button', {
        type: 'button',
        class: 'dj-pill',
        text: `DJ ${dj.biome || 'auto'}`,
        onclick: () => this.showPanel('dj'),
      })
    );
  };

  const _showPanel = Proto.showPanel;
  Proto.showPanel = function (id) {
    _showPanel.call(this, id);
    this.renderDjDock();
  };
})();
