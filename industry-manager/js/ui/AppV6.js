/** UI v6: nav agrupada, comparador, índices, consejo, códigos, audio */
window.IM = window.IM || {};

(function () {
  const Proto = IM.UI && IM.UI.prototype;
  if (!Proto) return;

  const NAV_GROUPS = [
    {
      id: 'mundo',
      label: 'Mundo',
      items: [
        ['mapa', 'Mapa'],
        ['campana', 'Campaña'],
        ['coach', '¿Qué hago?'],
        ['filiales', 'Filiales'],
        ['export', 'Export hubs'],
        ['misiones_locales', 'Misiones ciudad'],
        ['guias', 'Guías siglo'],
      ],
    },
    {
      id: 'produccion',
      label: 'Producción',
      items: [
        ['industria', 'Industria'],
        ['planner', 'Planificador'],
        ['cadenas', 'Cadenas'],
        ['almacen', 'Almacenes'],
        ['logistica', 'Logística'],
        ['automatizacion', 'Automación'],
        ['blueprints', 'Blueprints'],
      ],
    },
    {
      id: 'mercado',
      label: 'Mercado',
      items: [
        ['mercado', 'Mercado'],
        ['comparador', 'Comparador'],
        ['indices', 'Índices'],
        ['bolsa', 'Bolsa'],
        ['noticias', 'Noticias'],
        ['b2b', 'Clientes B2B'],
        ['contratos', 'Contratos'],
      ],
    },
    {
      id: 'corp',
      label: 'Corporación',
      items: [
        ['consejo', 'Consejo'],
        ['dashboard', 'Dashboard'],
        ['finanzas', 'Finanzas'],
        ['investigacion', 'I+D'],
        ['misiones', 'Misiones'],
        ['enciclopedia', 'Enciclopedia'],
        ['competencia', 'Competencia'],
        ['eventos', 'Eventos'],
        ['dj', 'DJ bioma'],
      ],
    },
    {
      id: 'sistema',
      label: 'Sistema',
      items: [
        ['ajustes', 'Ajustes'],
      ],
    },
  ];

  Proto.navButtons = function () {
    const st = this.game.state;
    const wrap = [];
    NAV_GROUPS.forEach((g) => {
      const open = (st.ui.navGroup || 'mundo') === g.id;
      wrap.push(
        IM.el('button', {
          type: 'button',
          class: `nav-group-btn${open ? ' open' : ''}`,
          text: g.label,
          onclick: () => {
            st.ui.navGroup = open ? '' : g.id;
            this.renderSidebar();
          },
        })
      );
      if (open) {
        g.items.forEach(([id, label]) => {
          wrap.push(
            IM.el('button', {
              class: `nav-btn nav-sub${st.ui.panel === id ? ' active' : ''}`,
              'data-panel': id,
              type: 'button',
              text: label,
              onclick: () => this.showPanel(id),
            })
          );
        });
      }
    });
    return wrap;
  };

  Proto.renderSidebar = function () {
    const side = document.getElementById('sidebar');
    if (!side) return;
    side.innerHTML = '';
    this.navButtons().forEach((n) => side.append(n));
  };

  const _showPanel = Proto.showPanel;
  Proto.showPanel = function (id) {
    // Ensure group containing panel is open
    const g = NAV_GROUPS.find((x) => x.items.some((it) => it[0] === id));
    if (g) this.game.state.ui.navGroup = g.id;
    _showPanel.call(this, id);
    this.renderSidebar();
    this.syncAudioZone();
  };

  const _mount = Proto.mount;
  Proto.mount = function () {
    _mount.call(this);
    this.renderSidebar();
    // Unlock audio on first click
    const unlock = () => {
      IM.Audio.ensure();
      IM.Audio.setEnabled(this.game.state.ui.audioEnabled !== false);
      this.syncAudioZone();
      document.removeEventListener('pointerdown', unlock);
    };
    document.addEventListener('pointerdown', unlock);
  };

  Proto.syncAudioZone = function () {
    if (this.game.state.ui.audioEnabled === false) {
      IM.Audio.setEnabled(false);
      return;
    }
    const locId = this.game.state.ui.selectedLocationId;
    const loc = IM.locationById(locId);
    const site = this.game.state.sites.find((s) => s.locationId === locId);
    const zone = IM.Audio.zoneFromLocation(loc, site);
    IM.Audio.setEnabled(true);
    IM.Audio.playZone(zone);
  };

  const _renderPanel = Proto.renderPanel;
  Proto.renderPanel = function (id) {
    const v6 = {
      comparador: 'Comparador de productos',
      indices: 'Índices sectoriales',
      consejo: 'Consejo de administración',
    };
    if (!v6[id]) {
      _renderPanel.call(this, id);
      if (id === 'ajustes') this.enhanceAjustesV6();
      if (id === 'campana') this.enhanceCampanaDeep();
      return;
    }
    const header = document.getElementById('panelHeader');
    const body = document.getElementById('panelBody');
    header.innerHTML = '';
    header.append(IM.el('h1', { text: v6[id] }));
    body.innerHTML = '';
    if (id === 'comparador') this.panelComparador(body);
    if (id === 'indices') this.panelIndices(body);
    if (id === 'consejo') this.panelConsejo(body);
  };

  Proto.panelComparador = function (body) {
    const st = this.game.state;
    const mkInput = (key) => {
      const inp = IM.el('input', { class: 'input', value: st.ui[key] || '', list: 'cmp-items' });
      inp.addEventListener('change', () => {
        st.ui[key] = inp.value.trim();
        this.refresh();
      });
      return inp;
    };
    const dl = IM.el('datalist', { id: 'cmp-items' });
    (IM_DATA.items || []).slice(0, 500).forEach((it) => dl.append(IM.el('option', { value: it.id, text: it.name })));
    body.append(dl);
    body.append(
      IM.el('div', { class: 'toolbar' }, [
        mkInput('compareA'),
        mkInput('compareB'),
        IM.el('button', { class: 'btn primary', type: 'button', text: 'Comparar', onclick: () => this.refresh() }),
      ])
    );
    const cmp = this.game.compareProducts(st.ui.compareA, st.ui.compareB);
    if (!cmp) {
      body.append(IM.el('p', { class: 'muted', text: 'Elige dos IDs de producto válidos.' }));
      return;
    }
    const card = (it, price, prod, sell, q) => {
      const c = IM.el('div', { class: 'compare-card' });
      c.append(IM.Icons.el(it, 64));
      c.append(IM.el('h2', { text: it.name }));
      c.append(
        IM.el('span', {
          class: 'cat-chip',
          style: `background:${(IM.Icons.categoryColor[it.category] || '#64748B')}33;color:${IM.Icons.categoryColor[it.category] || '#64748B'}`,
          text: IM.categoryLabel[it.category] || it.category,
        })
      );
      c.append(IM.el('p', { text: it.description || '' }));
      [
        ['Precio', IM.formatMoney(price) + '/' + it.unit],
        ['Base', IM.formatMoney(it.basePrice)],
        ['Producido', IM.formatNum(prod)],
        ['Vendido', IM.formatNum(sell)],
        ['Mejor calidad', q.toFixed(0)],
        ['Tier', String(it.tier)],
      ].forEach(([k, v]) => c.append(IM.el('div', { class: 'kv' }, [IM.el('span', { text: k }), IM.el('strong', { text: v })])));
      return c;
    };
    body.append(
      IM.el('div', { class: 'compare-grid' }, [
        card(cmp.a, cmp.priceA, cmp.prodA, cmp.sellA, cmp.qA),
        card(cmp.b, cmp.priceB, cmp.prodB, cmp.sellB, cmp.qB),
      ])
    );
    const winner =
      cmp.priceA / cmp.a.basePrice > cmp.priceB / cmp.b.basePrice ? cmp.a.name : cmp.b.name;
    body.append(IM.el('p', { class: 'muted', text: `Mayor tension de precio vs base: ${winner}` }));
  };

  Proto.panelIndices = function (body) {
    body.append(IM.el('p', { class: 'muted', text: '100 = paridad con precio base×inflación. Sube = mercado caliente.' }));
    (IM_DATA.sectorIndices || []).forEach((def) => {
      const cur = this.game.computeSectorIndex(def);
      const series = this.game.sectorSeries(def.id, 48);
      const canvas = IM.el('canvas', { class: 'price-chart', width: '640', height: '120' });
      const ctx = canvas.getContext('2d');
      const w = canvas.width;
      const h = canvas.height;
      const min = Math.min(...series);
      const max = Math.max(...series);
      ctx.fillStyle = '#0b1c26';
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = def.color || '#2dd4bf';
      ctx.lineWidth = 2;
      ctx.beginPath();
      series.forEach((v, i) => {
        const x = (i / (series.length - 1)) * (w - 16) + 8;
        const y = h - 10 - ((v - min) / Math.max(0.0001, max - min)) * (h - 24);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
      body.append(
        IM.el('div', { class: 'mini-card' }, [
          IM.el('strong', { style: `color:${def.color}`, text: `${def.name}: ${cur}` }),
          IM.el('p', { class: 'muted', text: (def.categories || []).map((c) => IM.categoryLabel[c] || c).join(' · ') }),
          canvas,
        ])
      );
    });
  };

  Proto.panelConsejo = function (body) {
    const st = this.game.state;
    const board = st.board || {};
    body.append(
      IM.el('p', {
        class: 'muted',
        text: `Próxima resolución automática: día ${board.nextVoteDay || 7}. Edad corporativa: ${this.game.companyYearsElapsed()} años.`,
      })
    );
    if (board.activeMotionId) {
      const m = (IM_DATA.boardMotions || []).find((x) => x.id === board.activeMotionId);
      body.append(IM.el('div', { class: 'briefing-inline' }, [IM.el('strong', { text: `Política activa: ${m?.name || board.activeMotionId}` }), IM.el('p', { text: m?.blurb || '' })]));
    }
    body.append(IM.el('h2', { text: 'Mociones' }));
    (IM_DATA.boardMotions || []).forEach((m) => {
      body.append(
        IM.el('div', { class: 'mini-card' }, [
          IM.el('strong', { text: m.name }),
          IM.el('p', { class: 'muted', text: m.blurb }),
          IM.el('button', {
            class: 'btn primary',
            type: 'button',
            text: board.pendingMotionId === m.id ? 'En votación…' : 'Proponer',
            onclick: () => {
              this.game.proposeBoardMotion(m.id);
              this.refresh();
            },
          }),
        ])
      );
    });
    if (board.pendingMotionId) {
      body.append(IM.el('h2', { text: 'Votación' }));
      ['ceo', 'ops', 'finance'].forEach((seat) => {
        const labels = { ceo: 'CEO (tú)', ops: 'COO', finance: 'CFO' };
        body.append(
          IM.el('div', { class: 'toolbar' }, [
            IM.el('span', { text: labels[seat] }),
            IM.el('button', {
              class: 'btn btn-buy',
              type: 'button',
              text: 'A favor',
              onclick: () => {
                this.game.castBoardVote(seat, true);
                this.refresh();
              },
            }),
            IM.el('button', {
              class: 'btn btn-sell',
              type: 'button',
              text: 'En contra',
              onclick: () => {
                this.game.castBoardVote(seat, false);
                this.refresh();
              },
            }),
          ])
        );
      });
      body.append(
        IM.el('button', {
          class: 'btn primary',
          type: 'button',
          text: 'Resolver votación ahora',
          onclick: () => {
            const r = this.game.resolveBoardVote();
            this.toast(r.passed ? 'Aprobada' : 'Rechazada', r.passed ? 'ok' : 'error');
            this.refresh();
          },
        })
      );
    }
  };

  Proto.enhanceCampanaDeep = function () {
    const body = document.getElementById('panelBody');
    if (!body) return;
    const st = this.game.state;
    const years = this.game.companyYearsElapsed();
    const eras = {};
    (IM_DATA.campaignChapters || []).forEach((c) => {
      eras[c.era] = eras[c.era] || [];
      eras[c.era].push(c);
    });
    const box = IM.el('div', { class: 'deep-campaign' });
    box.append(
      IM.el('div', { class: 'briefing-inline' }, [
        IM.el('span', { class: 'briefing-tag', text: `Año corporativo ${years}` }),
        IM.el('p', {
          text: `Capítulo narrativo ${st.campaignChapter || 1}/24 · pista de misiones ${st.campaignMissionChapter || 1}/100 · ${(IM_DATA.campaignMissions || []).length} misiones en total`,
        }),
      ])
    );
    Object.entries(eras).forEach(([era, chapters]) => {
      box.append(IM.el('h3', { text: era }));
      chapters.forEach((c) => {
        const done = c.id <= (st.campaignChapter || 1);
        const locked = years < (c.yearTarget || 0) && !done;
        box.append(
          IM.el('div', { class: `mini-card${done ? ' done' : ''}${locked ? ' locked' : ''}` }, [
            IM.el('strong', { text: `${c.id}. ${c.name}` }),
            IM.el('p', { text: c.goal }),
            IM.el('small', { class: 'muted', text: `Objetivo ~año ${c.yearTarget}${locked ? ' · bloqueado por tiempo' : ''}` }),
          ])
        );
      });
    });
    body.prepend(box);
  };

  Proto.enhanceAjustesV6 = function () {
    const body = document.getElementById('panelBody');
    if (!body) return;
    body.append(IM.el('h2', { text: 'Audio / ambience' }));
    const vol = IM.el('input', { class: 'input', type: 'range', min: '0', max: '40', value: String(Math.round(IM.Audio.volume * 100)) });
    body.append(
      IM.el('div', { class: 'toolbar' }, [
        IM.el('button', {
          class: 'btn',
          type: 'button',
          text: this.game.state.ui.audioEnabled === false ? 'Activar audio' : 'Silenciar',
          onclick: () => {
            this.game.state.ui.audioEnabled = this.game.state.ui.audioEnabled === false;
            this.syncAudioZone();
            this.refresh();
          },
        }),
        vol,
        IM.el('button', {
          class: 'btn',
          type: 'button',
          text: 'Aplicar volumen',
          onclick: () => {
            IM.Audio.setVolume(Number(vol.value) / 100);
            this.toast('Volumen OK');
          },
        }),
      ])
    );
    body.append(IM.el('p', { class: 'muted', text: 'Ambience procedural: almazara, fundición, puerto, electrónica…' }));

    body.append(IM.el('h2', { text: 'Código de partida (compartible)' }));
    body.append(
      IM.el('p', {
        class: 'muted',
        text: 'Genera un código IM6… para copiar/pegar en otro navegador. No es nube real: es tu partida codificada.',
      })
    );
    const area = IM.el('textarea', { class: 'input share-code', rows: '4', placeholder: 'IM6....' });
    body.append(area);
    body.append(
      IM.el('div', { class: 'toolbar' }, [
        IM.el('button', {
          class: 'btn primary',
          type: 'button',
          text: 'Generar código',
          onclick: () => {
            const r = this.game.exportShareCode();
            if (!r.ok) return this.toast(r.error, 'error');
            area.value = r.code;
            navigator.clipboard?.writeText(r.code).catch(() => {});
            this.toast('Código generado (copiado si el navegador lo permite)');
          },
        }),
        IM.el('button', {
          class: 'btn',
          type: 'button',
          text: 'Importar código',
          onclick: () => {
            const r = this.game.importShareCode(area.value);
            this.toast(r.ok ? 'Partida cargada' : r.error, r.ok ? 'ok' : 'error');
            if (r.ok) this.refresh();
          },
        }),
      ])
    );
  };

  const _refresh = Proto.refresh;
  Proto.refresh = function () {
    _refresh.call(this);
    this.renderSidebar();
  };
})();
