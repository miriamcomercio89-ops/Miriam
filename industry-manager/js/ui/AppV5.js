/** UI v5: filiales, export hubs, layout drag, coach, crédito, noticias, PDF */
window.IM = window.IM || {};

(function () {
  const Proto = IM.UI && IM.UI.prototype;
  if (!Proto) return;

  const _nav = Proto.navButtons;
  Proto.navButtons = function () {
    const btns = _nav.call(this);
    const extra = [
      ['filiales', 'Filiales'],
      ['export', 'Export hubs'],
      ['coach', '¿Qué hago?'],
      ['noticias', 'Noticias'],
    ];
    const nodes = extra.map(([id, label]) =>
      IM.el('button', {
        class: 'nav-btn',
        'data-panel': id,
        type: 'button',
        text: label,
        onclick: () => this.showPanel(id),
      })
    );
    // Insert after campaña if present
    const campIdx = btns.findIndex((b) => b.dataset?.panel === 'campana');
    if (campIdx >= 0) btns.splice(campIdx + 1, 0, ...nodes);
    else btns.unshift(...nodes);
    return btns;
  };

  const _renderPanel = Proto.renderPanel;
  Proto.renderPanel = function (id) {
    const v5 = {
      filiales: 'Filiales',
      export: 'Export · puertos y aeropuertos',
      coach: '¿Qué hago ahora?',
      noticias: 'Noticias de mercado',
    };
    if (!v5[id]) {
      _renderPanel.call(this, id);
      if (id === 'planner') this.enhancePlannerLayout();
      if (id === 'finanzas') this.enhanceFinanzasV5();
      if (id === 'b2b') this.enhanceB2BV5();
      if (id === 'industria') this.enhanceIndustriaLand();
      return;
    }
    const header = document.getElementById('panelHeader');
    const body = document.getElementById('panelBody');
    header.innerHTML = '';
    header.append(IM.el('h1', { text: v5[id] }));
    body.innerHTML = '';
    if (id === 'filiales') this.panelFiliales(body);
    if (id === 'export') this.panelExport(body);
    if (id === 'coach') this.panelCoach(body);
    if (id === 'noticias') this.panelNoticias(body);
  };

  Proto.panelFiliales = function (body) {
    const st = this.game.state;
    body.append(
      IM.el('p', {
        class: 'muted',
        text: 'Cada filial se especializa: bonus de eficiencia en su foco y ligera penalización fuera.',
      })
    );

    body.append(IM.el('h2', { text: 'Crear filial' }));
    if (!st.sites.length) {
      body.append(IM.el('p', { class: 'muted', text: 'Fundá una planta en el mapa primero.' }));
    } else {
      const siteSel = IM.el('select', { class: 'input' });
      st.sites.forEach((s) => {
        if (this.game.subsidiaryForSite(s)) return;
        const loc = IM.locationById(s.locationId);
        siteSel.append(IM.el('option', { value: s.id, text: loc?.name || s.id }));
      });
      const specSel = IM.el('select', { class: 'input' });
      (IM_DATA.subsidiarySpecialties || []).forEach((sp) => {
        specSel.append(IM.el('option', { value: sp.id, text: sp.name }));
      });
      const name = IM.el('input', { class: 'input', placeholder: 'Nombre filial', value: 'Filial operativa' });
      body.append(
        IM.el('div', { class: 'toolbar' }, [
          siteSel,
          specSel,
          name,
          IM.el('button', {
            class: 'btn primary',
            type: 'button',
            text: 'Crear',
            onclick: () => {
              if (!siteSel.value) return this.toast('No hay sitios libres', 'error');
              const r = this.game.createSubsidiary(siteSel.value, { name: name.value, specialty: specSel.value });
              this.toast(r.ok ? 'Filial creada' : r.error, r.ok ? 'ok' : 'error');
              this.refresh();
            },
          }),
        ])
      );
    }

    body.append(IM.el('h2', { text: 'Filiales activas' }));
    const list = Object.values(st.subsidiaries || {});
    if (!list.length) body.append(IM.el('p', { class: 'muted', text: 'Ninguna aún.' }));
    list.forEach((sub) => {
      const spec = (IM_DATA.subsidiarySpecialties || []).find((s) => s.id === sub.specialty);
      const loc = IM.locationById(sub.locationId);
      const specSel = IM.el('select', { class: 'input' });
      (IM_DATA.subsidiarySpecialties || []).forEach((sp) => {
        const opt = IM.el('option', { value: sp.id, text: sp.name });
        if (sp.id === sub.specialty) opt.selected = true;
        specSel.append(opt);
      });
      body.append(
        IM.el('div', { class: 'mini-card filial-card', style: `border-left:4px solid ${spec?.color || '#64748B'}` }, [
          IM.el('strong', { text: sub.name }),
          IM.el('p', { text: `${loc?.name || '—'} · zona ${loc?.zone || '—'} · suelo ×${(loc?.landCost || 1).toFixed(2)}` }),
          IM.el('p', { class: 'muted', text: `Especialidad: ${spec?.name || sub.specialty} · bonus ×${sub.bonus}` }),
          IM.el('div', { class: 'toolbar' }, [
            specSel,
            IM.el('button', {
              class: 'btn',
              type: 'button',
              text: 'Cambiar foco',
              onclick: () => {
                const r = this.game.setSubsidiarySpecialty(sub.id, specSel.value);
                this.toast(r.ok ? 'Actualizado' : r.error, r.ok ? 'ok' : 'error');
                this.refresh();
              },
            }),
          ]),
        ])
      );
    });

    body.append(IM.el('h2', { text: 'Especialidades' }));
    (IM_DATA.subsidiarySpecialties || []).forEach((sp) => {
      body.append(
        IM.el('div', { class: 'mini-card' }, [
          IM.el('strong', { style: `color:${sp.color}`, text: sp.name }),
          IM.el('p', { class: 'muted', text: `Categorías: ${(sp.categories || []).map((c) => IM.categoryLabel[c] || c).join(', ')}` }),
        ])
      );
    });
  };

  Proto.panelExport = function (body) {
    const st = this.game.state;
    body.append(
      IM.el('p', {
        class: 'muted',
        text: 'Puertos (+14%) y aeropuertos (+22%) pagan prima de exportación. El suelo en capitales es más caro; en polígonos, más barato.',
      })
    );
    const hubs = (st.discoveredLocations || []).filter((l) => l.hasPort || l.hasAirport);
    body.append(IM.el('h2', { text: 'Hubs descubiertos' }));
    if (!hubs.length) body.append(IM.el('p', { class: 'muted', text: 'Ninguno aún. Fundá en costa o capital.' }));
    hubs.forEach((l) => {
      const owned = st.sites.some((s) => s.locationId === l.id);
      body.append(
        IM.el('div', { class: 'mini-card' }, [
          IM.el('strong', { text: `${l.name} (${l.zone || '—'})` }),
          IM.el('p', {
            text: `${l.hasPort ? '⚓ Puerto ' : ''}${l.hasAirport ? '✈ Aeropuerto ' : ''}· suelo ×${(l.landCost || 1).toFixed(2)}${owned ? ' · ★ tuya' : ''}`,
          }),
        ])
      );
    });

    body.append(IM.el('h2', { text: 'Exportar stock' }));
    const locSel = this.locSelect(st.ui.selectedLocationId, (v) => {
      st.ui.selectedLocationId = v;
    });
    const item = IM.el('input', { class: 'input', value: st.ui.bolsaItemId || 'aceite_de_oliva', list: 'export-items' });
    const dl = IM.el('datalist', { id: 'export-items' });
    (IM_DATA.items || []).slice(0, 300).forEach((it) => dl.append(IM.el('option', { value: it.id, text: it.name })));
    const qty = IM.el('input', { class: 'input', type: 'number', value: '20' });
    body.append(dl);
    body.append(
      IM.el('div', { class: 'toolbar' }, [
        locSel,
        item,
        qty,
        IM.el('button', {
          class: 'btn btn-buy',
          type: 'button',
          text: 'Export marítima',
          onclick: () => {
            const r = this.game.exportViaHub(st.ui.selectedLocationId, item.value.trim(), Number(qty.value), 'sea');
            this.toast(r.ok ? `+${IM.formatMoney(r.revenue)}` : r.error, r.ok ? 'ok' : 'error');
            this.refresh();
          },
        }),
        IM.el('button', {
          class: 'btn primary',
          type: 'button',
          text: 'Export aérea',
          onclick: () => {
            const r = this.game.exportViaHub(st.ui.selectedLocationId, item.value.trim(), Number(qty.value), 'air');
            this.toast(r.ok ? `+${IM.formatMoney(r.revenue)}` : r.error, r.ok ? 'ok' : 'error');
            this.refresh();
          },
        }),
      ])
    );
  };

  Proto.panelCoach = function (body) {
    const tips = this.game.getNextActions();
    body.append(IM.el('p', { class: 'muted', text: 'Prioridades sugeridas según el estado de tu corporación.' }));
    tips.forEach((t, i) => {
      body.append(
        IM.el('div', { class: 'mini-card coach-card' }, [
          IM.el('strong', { text: `${i + 1}. ${t.text}` }),
          t.panel
            ? IM.el('button', {
                class: 'btn',
                type: 'button',
                text: 'Ir',
                onclick: () => this.showPanel(t.panel),
              })
            : null,
        ])
      );
    });

    body.append(IM.el('h2', { text: 'Turnicidad' }));
    const policy = this.game.state.shiftPolicy || 'standard';
    const shift = this.game.currentShift();
    body.append(IM.el('p', { text: `Turno actual: ${shift} · política: ${policy} · efi ×${this.game.shiftEfficiencyMul().toFixed(2)} · salario ×${this.game.shiftWageMul().toFixed(2)}` }));
    ['standard', 'dual', 'triple'].forEach((p) => {
      const labels = { standard: 'Estándar (día)', dual: '2 turnos', triple: '3 turnos (24h, noche +35% salario)' };
      body.append(
        IM.el('button', {
          class: `btn${policy === p ? ' primary' : ''}`,
          type: 'button',
          text: labels[p],
          style: 'margin:4px',
          onclick: () => {
            this.game.setShiftPolicy(p);
            this.refresh();
          },
        })
      );
    });

    body.append(IM.el('h2', { text: 'Atajos de teclado' }));
    [
      ['Espacio', 'Pausa / reanudar'],
      ['1 · 2 · 3 · 4 · 5', 'Velocidad 1× / 2× / 5× / 10× / 30×'],
      ['M', 'Mapa'],
      ['I', 'Industria'],
      ['B', 'Bolsa'],
      ['E', 'Enciclopedia'],
      ['Esc', 'Cerrar modal'],
    ].forEach(([k, v]) => {
      body.append(IM.el('div', { class: 'kv' }, [IM.el('span', { text: k }), IM.el('strong', { text: v })]));
    });

    body.append(IM.el('h2', { text: 'Informe PDF' }));
    body.append(
      IM.el('button', {
        class: 'btn primary',
        type: 'button',
        text: 'Exportar informe corporativo',
        onclick: () => this.exportCompanyPdf(),
      })
    );
  };

  Proto.panelNoticias = function (body) {
    const st = this.game.state;
    body.append(IM.el('p', { class: 'muted', text: 'Las noticias mueven precios y demanda por categoría.' }));
    body.append(IM.el('h2', { text: 'Activas' }));
    if (!st.marketNews?.length) body.append(IM.el('p', { class: 'muted', text: 'Sin noticias activas.' }));
    (st.marketNews || []).forEach((n) => {
      body.append(
        IM.el('div', { class: 'mini-card news-card' }, [
          IM.el('strong', { text: n.headline }),
          IM.el('p', {
            text: `${IM.categoryLabel[n.category] || n.category} · precio ×${n.priceMul} · hasta día ${n.expiresDay}`,
          }),
        ])
      );
    });
    body.append(IM.el('h2', { text: 'Historórico' }));
    (st.newsHistory || []).slice(0, 12).forEach((n) => {
      body.append(IM.el('div', { class: 'kv' }, [IM.el('span', { text: `D${n.day}` }), IM.el('strong', { text: n.headline })]));
    });
    body.append(
      IM.el('button', {
        class: 'btn',
        type: 'button',
        text: 'Forzar noticia (debug)',
        onclick: () => {
          this.game.spawnMarketNews();
          this.refresh();
        },
      })
    );
  };

  Proto.enhanceFinanzasV5 = function () {
    const body = document.getElementById('panelBody');
    if (!body) return;
    const st = this.game.state;
    body.append(IM.el('h2', { text: 'Crédito bancario (covenants)' }));
    body.append(
      IM.el('p', {
        class: 'muted',
        text: `Deuda ${IM.formatMoney(this.game.totalDebt())} · rating ${Math.round(st.creditRating)} · tipo ${(st.interestRate * 100).toFixed(1)}%`,
      })
    );
    (IM_DATA.bankProducts || []).forEach((p) => {
      const amount = IM.el('input', { class: 'input', type: 'number', value: String(Math.min(1000000, p.maxAmount)) });
      body.append(
        IM.el('div', { class: 'mini-card' }, [
          IM.el('strong', { text: p.name }),
          IM.el('p', {
            class: 'muted',
            text: `Máx ${IM.formatMoney(p.maxAmount)} · ${p.years} años · cash≥${IM.formatMoney(p.covenant.minCash || 0)} · deuda≤${((p.covenant.maxDebtRatio || 1) * 100).toFixed(0)}%`,
          }),
          IM.el('div', { class: 'toolbar' }, [
            amount,
            IM.el('button', {
              class: 'btn primary',
              type: 'button',
              text: 'Contratar',
              onclick: () => {
                const r = this.game.takeBankProduct(p.id, Number(amount.value) || 0);
                this.toast(r.ok ? 'Crédito OK' : r.error, r.ok ? 'ok' : 'error');
                this.refresh();
              },
            }),
          ]),
        ])
      );
    });
    body.append(
      IM.el('button', {
        class: 'btn',
        type: 'button',
        text: 'Exportar informe PDF',
        onclick: () => this.exportCompanyPdf(),
      })
    );
  };

  Proto.enhanceB2BV5 = function () {
    const body = document.getElementById('panelBody');
    if (!body) return;
    const st = this.game.state;
    body.append(IM.el('h2', { text: 'Franquicias / grandes cuentas' }));
    (IM_DATA.b2bClients || [])
      .filter((c) => c.franchise)
      .forEach((c) => {
        const signed = (st.franchiseContracts || []).includes(c.id);
        body.append(
          IM.el('div', { class: 'mini-card' }, [
            IM.el('strong', { text: c.name + (signed ? ' ✓' : '') }),
            IM.el('p', { text: c.blurb || c.sector }),
            IM.el('p', {
              class: 'muted',
              text: `Pedidos ×${c.orderMul || 3} · calidad ≥${c.minQuality} · ${(c.preferred || []).map((id) => IM.itemById(id)?.name || id).join(', ')}`,
            }),
            signed
              ? IM.el('span', { class: 'cat-chip', text: 'Contrato activo' })
              : IM.el('button', {
                  class: 'btn primary',
                  type: 'button',
                  text: 'Firmar (150k €)',
                  onclick: () => {
                    const r = this.game.signFranchiseContract(c.id);
                    this.toast(r.ok ? 'Firmado' : r.error, r.ok ? 'ok' : 'error');
                    this.refresh();
                  },
                }),
          ])
        );
      });
  };

  Proto.enhanceIndustriaLand = function () {
    const body = document.getElementById('panelBody');
    if (!body) return;
    const loc = IM.locationById(this.game.state.ui.selectedLocationId);
    if (!loc) return;
    this.game.enrichLocationEconomics(loc);
    body.prepend(
      IM.el('div', { class: 'briefing-inline' }, [
        IM.el('strong', { text: `Zona: ${loc.zone || '—'} · suelo ×${(loc.landCost || 1).toFixed(2)}` }),
        IM.el('p', {
          class: 'muted',
          text: `${loc.hasPort ? '⚓ Puerto · ' : ''}${loc.hasAirport ? '✈ Aeropuerto · ' : ''}Capitales caras, polígonos baratos.`,
        }),
      ])
    );
  };

  Proto.enhancePlannerLayout = function () {
    const body = document.getElementById('panelBody');
    if (!body) return;
    const st = this.game.state;
    const bottlenecks = this.game.collectBottlenecks();
    body.append(IM.el('h2', { text: 'Sugerencias de cuellos de botella' }));
    if (!bottlenecks.length) body.append(IM.el('p', { class: 'muted', text: 'Sin cuellos detectados. ¡Bien!' }));
    bottlenecks.slice(0, 8).forEach((b) => {
      body.append(IM.el('div', { class: 'mini-card alert-card' }, [IM.el('strong', { text: b.suggestion })]));
    });

    body.append(IM.el('h2', { text: 'Layout visual (arrastrar máquinas)' }));
    if (!st.sites.length) return;
    const site = st.sites.find((s) => s.id === st.ui.plannerSiteId) || st.sites[0];
    st.ui.plannerSiteId = site.id;
    site.buildings.forEach((b) => {
      const def = IM.buildingById(b.type);
      const canvas = IM.el('div', { class: 'layout-canvas', 'data-building': b.id });
      canvas.append(IM.el('div', { class: 'layout-title', text: def?.name || b.type }));
      (b.slots || []).forEach((slot, idx) => {
        if (!slot) {
          const empty = IM.el('div', { class: 'layout-node empty', text: `Hueco ${idx + 1}` });
          const pos = this.game.getSlotLayout(b.id, idx, idx);
          empty.style.left = pos.x + 'px';
          empty.style.top = pos.y + 'px';
          canvas.append(empty);
          return;
        }
        const recipe = IM.recipeById(slot.recipeId);
        const node = IM.el('div', {
          class: `layout-node${slot.lastBlockReason ? ' blocked' : ''}`,
          draggable: 'true',
          text: recipe?.name || slot.recipeId,
        });
        const pos = this.game.getSlotLayout(b.id, idx, idx);
        node.style.left = pos.x + 'px';
        node.style.top = pos.y + 'px';
        node.title = slot.lastBlockReason || 'OK';
        node.addEventListener('dragstart', (ev) => {
          ev.dataTransfer.setData('text/plain', JSON.stringify({ buildingId: b.id, slotIndex: idx }));
        });
        canvas.append(node);
      });
      canvas.addEventListener('dragover', (ev) => ev.preventDefault());
      canvas.addEventListener('drop', (ev) => {
        ev.preventDefault();
        try {
          const data = JSON.parse(ev.dataTransfer.getData('text/plain'));
          const rect = canvas.getBoundingClientRect();
          const x = ev.clientX - rect.left - 60;
          const y = ev.clientY - rect.top - 20;
          this.game.setSlotLayout(data.buildingId, data.slotIndex, Math.max(0, x), Math.max(24, y));
          this.refresh();
        } catch (e) {
          /* ignore */
        }
      });
      body.append(canvas);
    });
  };

  Proto.exportCompanyPdf = function () {
    const report = this.game.buildCompanyReport();
    const w = window.open('', '_blank');
    if (!w) {
      this.toast('Permite ventanas emergentes para el PDF', 'error');
      return;
    }
    const rows = (report.sites || [])
      .map(
        (s) =>
          `<tr><td>${s.location || ''}</td><td>${s.zone || ''}</td><td>${s.subsidiary || '—'}</td><td>${s.specialty || '—'}</td><td>${s.buildings}</td><td>${s.hasPort ? '⚓' : ''}${s.hasAirport ? '✈' : ''}</td></tr>`
      )
      .join('');
    const subs = (report.subsidiaries || []).map((s) => `<li>${s.name} — ${s.specialty} (${s.location || ''})</li>`).join('');
    const news = (report.news || []).map((n) => `<li>D${n.day}: ${n.headline}</li>`).join('');
    const bn = (report.bottlenecks || []).map((b) => `<li>${b.suggestion}</li>`).join('');
    w.document.write(`<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"/><title>Informe ${report.title}</title>
      <style>
        body{font-family:Manrope,Segoe UI,sans-serif;padding:32px;color:#0f172a;background:#f8fafc}
        h1{font-family:Sora,sans-serif} table{border-collapse:collapse;width:100%;margin:12px 0}
        th,td{border:1px solid #cbd5e1;padding:8px;text-align:left;font-size:13px}
        th{background:#e2e8f0} .grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
        .box{background:#fff;border:1px solid #cbd5e1;border-radius:12px;padding:12px}
        @media print{button{display:none}}
      </style></head><body>
      <button onclick="window.print()">Imprimir / Guardar PDF</button>
      <h1>${report.title}</h1>
      <p>Industry Manager ${report.version} · generado ${report.generatedAt}</p>
      <div class="grid">
        <div class="box"><div>Tesorería</div><strong>${IM.formatMoney(report.money)}</strong></div>
        <div class="box"><div>Beneficio acum.</div><strong>${IM.formatMoney(report.profitLifetime)}</strong></div>
        <div class="box"><div>Deuda</div><strong>${IM.formatMoney(report.debt)}</strong></div>
        <div class="box"><div>Rating</div><strong>${Math.round(report.creditRating)}</strong></div>
        <div class="box"><div>Empleados</div><strong>${report.employees}</strong></div>
        <div class="box"><div>Capítulo / rama</div><strong>${report.chapter} / ${report.branch || '—'}</strong></div>
      </div>
      <h2>Plantas</h2>
      <table><thead><tr><th>Ciudad</th><th>Zona</th><th>Filial</th><th>Foco</th><th>Edif.</th><th>Hub</th></tr></thead><tbody>${rows}</tbody></table>
      <h2>Filiales</h2><ul>${subs || '<li>Ninguna</li>'}</ul>
      <h2>Franquicias</h2><ul>${(report.franchises || []).map((f) => `<li>${f}</li>`).join('') || '<li>Ninguna</li>'}</ul>
      <h2>Noticias recientes</h2><ul>${news || '<li>—</li>'}</ul>
      <h2>Cuellos de botella</h2><ul>${bn || '<li>Ninguno</li>'}</ul>
      <p style="margin-top:24px;color:#64748b">Turnicidad: ${report.shiftPolicy} · Estación: ${report.season}</p>
      </body></html>`);
    w.document.close();
    this.toast('Informe abierto — usa Imprimir / Guardar PDF');
  };

  // Coach dock + news toast on refresh
  const _refresh = Proto.refresh;
  Proto.refresh = function () {
    _refresh.call(this);
    this.renderCoachDock();
  };

  const _mount = Proto.mount;
  Proto.mount = function () {
    _mount.call(this);
    this.renderCoachDock();
  };

  Proto.renderCoachDock = function () {
    let dock = document.getElementById('coachDock');
    if (!dock) {
      dock = IM.el('div', { id: 'coachDock', class: 'coach-dock' });
      document.getElementById('app')?.appendChild(dock);
    }
    const tip = this.game.getNextActions()?.[0];
    dock.innerHTML = '';
    dock.append(
      IM.el('strong', { text: 'Ahora:' }),
      IM.el('span', { text: tip?.text || 'Explora el mapa' }),
      IM.el('button', {
        class: 'btn',
        type: 'button',
        text: 'Ver',
        onclick: () => this.showPanel(tip?.panel || 'coach'),
      })
    );
  };

  // Hub markers on map
  const _rebuild = Proto.rebuildMarkers;
  Proto.rebuildMarkers = function () {
    _rebuild.call(this);
    if (!this.map) return;
    if (!this.hubLayer) this.hubLayer = L.layerGroup().addTo(this.map);
    this.hubLayer.clearLayers();
    (this.game.state.discoveredLocations || []).forEach((loc) => {
      if (!loc.hasPort && !loc.hasAirport) return;
      const m = L.circleMarker([loc.lat, loc.lng], {
        radius: 11,
        color: loc.hasPort ? '#38bdf8' : '#a78bfa',
        weight: 2,
        fillOpacity: 0.15,
      });
      m.bindTooltip(`${loc.name}: ${loc.hasPort ? 'Puerto' : ''}${loc.hasPort && loc.hasAirport ? ' + ' : ''}${loc.hasAirport ? 'Aeropuerto' : ''} · suelo ×${(loc.landCost || 1).toFixed(2)}`);
      m.addTo(this.hubLayer);
    });
  };
})();
