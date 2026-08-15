/** UI v4: campaña amigable, iconos, parcelas, clima, bolsa charts */
window.IM = window.IM || {};

(function () {
  const Proto = IM.UI && IM.UI.prototype;
  if (!Proto) return;

  const _mount = Proto.mount;
  Proto.mount = function () {
    _mount.call(this);
    this.showBranchModalIfNeeded();
    this.showBriefingIfNeeded();
  };

  Proto.showBranchModalIfNeeded = function () {
    if (this.game.state.campaignBranch) return;
    this.openModal((inner, modal) => {
      inner.append(IM.el('h2', { text: 'Elige tu especialización' }));
      inner.append(IM.el('p', { class: 'muted', text: 'Esta decisión marca misiones, clientes y el tono de tu campaña.' }));
      const grid = IM.el('div', { class: 'branch-grid' });
      (IM_DATA.campaignBranches || []).forEach((b) => {
        grid.append(
          IM.el('button', {
            type: 'button',
            class: 'branch-card',
            style: `border-color:${b.color}`,
            onclick: () => {
              this.game.chooseBranch(b.id);
              modal.close();
              this.toast(`Rama: ${b.name}`);
              this.showBriefingIfNeeded();
              this.refresh();
            },
          }, [
            IM.el('strong', { text: b.name, style: `color:${b.color}` }),
            IM.el('p', { text: b.blurb }),
            IM.el('small', { class: 'muted', text: b.starterHint }),
          ])
        );
      });
      inner.append(grid);
    });
  };

  Proto.showBriefingIfNeeded = function () {
    const st = this.game.state;
    if (!st.campaignBranch) return;
    const ch = st.campaignChapter || 1;
    if (st.briefingSeen[ch]) return;
    const brief = this.game.currentBriefing();
    this.openModal((inner, modal) => {
      inner.append(IM.el('div', { class: 'briefing' }, [
        IM.el('span', { class: 'briefing-tag', text: `Capítulo ${ch}` }),
        IM.el('h2', { text: brief.chapter?.name || 'Campaña' }),
        IM.el('p', { text: brief.text }),
        brief.branch ? IM.el('p', { class: 'muted', text: `Rama: ${brief.branch.name}` }) : null,
        IM.el('button', {
          class: 'btn primary',
          type: 'button',
          text: 'Continuar',
          onclick: () => {
            st.briefingSeen[ch] = true;
            modal.close();
          },
        }),
      ]));
    });
  };

  const _rebuild = Proto.rebuildMarkers;
  Proto.rebuildMarkers = function () {
    _rebuild.call(this);
    // Draw parcels
    if (!this.parcelLayer) {
      this.parcelLayer = L.layerGroup().addTo(this.map);
    }
    this.parcelLayer.clearLayers();
    Object.values(this.game.state.parcels || {}).forEach((p) => {
      L.polygon(p.polygon, {
        color: p.color || '#3d9b7a',
        weight: 2,
        fillOpacity: 0.2,
      })
        .bindTooltip(`Parcela ${p.used || 0}/${p.capacity}`)
        .addTo(this.parcelLayer);
    });
  };

  const _inspector = Proto.refreshInspector;
  Proto.refreshInspector = function () {
    _inspector.call(this);
    const box = document.getElementById('inspector');
    const st = this.game.state;
    const locId = st.ui.selectedLocationId;
    if (!box || !locId) return;
    const climate = st.climate[locId] || this.game.updateClimate?.(locId);
    if (climate) {
      box.append(
        IM.el('h3', { text: 'Clima local' }),
        IM.el('div', { class: 'climate-pill' }, [
          IM.el('span', { text: `🌡 ${climate.temp}°C` }),
          IM.el('span', { text: `🌧 ${climate.precip} mm` }),
          IM.el('span', { text: climate.season }),
        ])
      );
    }
    const parcel = st.parcels[locId];
    if (parcel) {
      box.append(
        IM.el('h3', { text: 'Parcela industrial' }),
        IM.el('p', { text: `Capacidad ${parcel.used || 0} / ${parcel.capacity} edificios` }),
        IM.el('button', {
          class: 'btn',
          type: 'button',
          text: 'Ampliar parcela',
          onclick: () => {
            const r = this.game.expandParcel(locId);
            this.toast(r.ok ? 'Ampliada' : r.error, r.ok ? 'ok' : 'error');
            this.rebuildMarkers();
            this.refresh();
          },
        })
      );
    }
  };

  const _renderPanel = Proto.renderPanel;
  Proto.renderPanel = function (id) {
    _renderPanel.call(this, id);
    // Enhance market/ency/bolsa with icons when those panels render
  };

  // Override market to show icons
  const _market = Proto.panelMercado;
  Proto.panelMercado = function (body) {
    const st = this.game.state;
    let locId = st.ui.selectedLocationId;
    const q = IM.el('input', { class: 'input', placeholder: 'Buscar producto…' });
    const cat = IM.el('select', { class: 'input' });
    cat.append(IM.el('option', { value: 'all', text: 'Todas las categorías' }));
    Object.entries(IM.categoryLabel).forEach(([k, v]) => cat.append(IM.el('option', { value: k, text: v })));
    const qtyInput = IM.el('input', { class: 'input', type: 'number', value: '10' });
    const renderList = () => {
      body.querySelector('.market-list')?.remove();
      const wrap = IM.el('div', { class: 'market-list' });
      const query = (q.value || '').toLowerCase();
      (IM_DATA.items || [])
        .filter((it) => (cat.value === 'all' || it.category === cat.value) && (!query || it.name.toLowerCase().includes(query)))
        .slice(0, 120)
        .forEach((it) => {
          const row = IM.el('div', { class: 'market-row product-row' });
          row.append(IM.Icons.el(it, 40));
          const catColor = IM.Icons.categoryColor[it.category] || '#64748B';
          row.append(
            IM.el('div', {}, [
              IM.el('strong', { text: it.name }),
              IM.el('span', {
                class: 'cat-chip',
                style: `background:${catColor}33;color:${catColor};border-color:${catColor}66`,
                text: IM.categoryLabel[it.category] || it.category,
              }),
            ]),
            IM.el('strong', { class: 'price-tag', text: `${IM.formatMoney(this.game.priceOf(it.id))}/${it.unit}` }),
            IM.el('button', {
              class: 'btn btn-buy',
              type: 'button',
              text: 'Comprar',
              onclick: () => {
                const r = this.game.buyFromMarket(locId, it.id, Number(qtyInput.value) || 1);
                this.toast(r.ok ? 'Comprado' : r.error, r.ok ? 'ok' : 'error');
              },
            }),
            IM.el('button', {
              class: 'btn btn-sell',
              type: 'button',
              text: 'Vender',
              onclick: () => {
                const r = this.game.sellToMarket(locId, it.id, Number(qtyInput.value) || 1);
                this.toast(r.ok ? 'Vendido' : r.error, r.ok ? 'ok' : 'error');
              },
            }),
            IM.el('button', {
              class: 'btn',
              type: 'button',
              text: 'Bolsa',
              onclick: () => {
                st.ui.bolsaItemId = it.id;
                this.showPanel('bolsa');
              },
            })
          );
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
        qtyInput,
      ])
    );
    q.oninput = renderList;
    cat.onchange = renderList;
    renderList();
  };

  const _bolsa = Proto.panelBolsa;
  Proto.panelBolsa = function (body) {
    const st = this.game.state;
    body.append(IM.el('p', { class: 'muted', text: st.categoryCrisis ? `Crisis: ${st.categoryCrisis.category}` : 'Mercado estable · gráfico + órdenes límite' }));

    const item = IM.el('input', { class: 'input', value: st.ui.bolsaItemId || 'mena_de_hierro', list: 'bolsa-items' });
    const datalist = IM.el('datalist', { id: 'bolsa-items' });
    (IM_DATA.items || []).slice(0, 400).forEach((it) => datalist.append(IM.el('option', { value: it.id, text: it.name })));
    const qty = IM.el('input', { class: 'input', type: 'number', value: '50', title: 'Cantidad' });
    const limit = IM.el('input', { class: 'input', type: 'number', value: '50', title: 'Precio límite' });
    const chart = IM.el('canvas', { class: 'price-chart', width: '640', height: '180' });
    const head = IM.el('div', { class: 'product-row bolsa-head' });

    const draw = () => {
      const id = item.value.trim();
      st.ui.bolsaItemId = id;
      const it = IM.itemById(id);
      head.innerHTML = '';
      if (it) {
        head.append(IM.Icons.el(it, 48));
        head.append(
          IM.el('div', {}, [
            IM.el('strong', { text: it.name }),
            IM.el('span', {
              class: 'cat-chip',
              style: `background:${(IM.Icons.categoryColor[it.category] || '#64748B')}33;color:${IM.Icons.categoryColor[it.category] || '#64748B'}`,
              text: IM.categoryLabel[it.category] || it.category,
            }),
          ])
        );
      }
      const series = this.game.priceSeries(id, 48);
      const ctx = chart.getContext('2d');
      const w = chart.width;
      const h = chart.height;
      ctx.clearRect(0, 0, w, h);
      const min = Math.min(...series);
      const max = Math.max(...series);
      const grd = ctx.createLinearGradient(0, 0, 0, h);
      grd.addColorStop(0, '#0f2840');
      grd.addColorStop(1, '#071018');
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = '#2dd4bf';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      series.forEach((v, i) => {
        const x = (i / (series.length - 1)) * (w - 20) + 10;
        const y = h - 15 - ((v - min) / Math.max(0.0001, max - min)) * (h - 30);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
      ctx.fillStyle = '#94a3b8';
      ctx.font = '12px Manrope, sans-serif';
      ctx.fillText(`${it?.name || id}: ${IM.formatMoney(series[series.length - 1])}`, 12, 16);
      limit.value = String(Math.round(series[series.length - 1] * 100) / 100);
    };

    body.append(head, datalist);
    body.append(
      IM.el('div', { class: 'toolbar' }, [
        item,
        qty,
        limit,
        IM.el('button', {
          class: 'btn btn-buy',
          type: 'button',
          text: 'Límite COMPRA',
          onclick: () => {
            const r = this.game.placeLimitOrder({
              side: 'buy',
              itemId: item.value.trim(),
              qty: Number(qty.value) || 1,
              limitPrice: Number(limit.value) || 1,
            });
            this.toast(r.ok ? 'Orden puesta' : r.error, r.ok ? 'ok' : 'error');
            this.refresh();
          },
        }),
        IM.el('button', {
          class: 'btn btn-sell',
          type: 'button',
          text: 'Límite VENTA',
          onclick: () => {
            const r = this.game.placeLimitOrder({
              side: 'sell',
              itemId: item.value.trim(),
              qty: Number(qty.value) || 1,
              limitPrice: Number(limit.value) || 1,
            });
            this.toast(r.ok ? 'Orden puesta' : r.error, r.ok ? 'ok' : 'error');
            this.refresh();
          },
        }),
        IM.el('button', { class: 'btn', type: 'button', text: 'Actualizar gráfico', onclick: draw }),
      ]),
      chart
    );
    item.addEventListener('change', draw);
    item.addEventListener('input', () => {
      if (IM.itemById(item.value.trim())) draw();
    });
    draw();

    body.append(IM.el('h2', { text: 'Órdenes límite abiertas' }));
    if (!st.limitOrders?.length) body.append(IM.el('p', { class: 'muted', text: 'Ninguna.' }));
    (st.limitOrders || []).forEach((o) => {
      const it = IM.itemById(o.itemId);
      const row = IM.el('div', { class: 'mini-card product-row' });
      if (it) row.append(IM.Icons.el(it, 32));
      row.append(IM.el('div', {}, [IM.el('strong', { text: `${o.side.toUpperCase()} ${it?.name}` }), IM.el('p', { text: `qty ${o.qty} @ ${IM.formatMoney(o.limitPrice)}` })]));
      body.append(row);
    });

    if (_bolsa) {
      body.append(IM.el('h2', { text: 'Futuros' }));
      const futItem = IM.el('input', { class: 'input', value: st.ui.bolsaItemId || 'mena_de_hierro' });
      const futQty = IM.el('input', { class: 'input', type: 'number', value: '100' });
      body.append(
        IM.el('div', { class: 'toolbar' }, [
          futItem,
          futQty,
          IM.el('button', {
            class: 'btn primary',
            type: 'button',
            text: 'LONG',
            onclick: () => {
              const r = this.game.openFuture(futItem.value.trim(), Number(futQty.value) || 1, 'long');
              this.toast(r.ok ? 'OK' : r.error, r.ok ? 'ok' : 'error');
            },
          }),
          IM.el('button', {
            class: 'btn',
            type: 'button',
            text: 'SHORT',
            onclick: () => {
              const r = this.game.openFuture(futItem.value.trim(), Number(futQty.value) || 1, 'short');
              this.toast(r.ok ? 'OK' : r.error, r.ok ? 'ok' : 'error');
            },
          }),
        ])
      );
    }
  };

  Proto.panelCampana = function (body) {
    const st = this.game.state;
    const brief = this.game.currentBriefing();
    body.append(
      IM.el('div', { class: 'briefing-inline' }, [
        IM.el('span', { class: 'briefing-tag', text: `Capítulo ${st.campaignChapter || 1}` }),
        IM.el('h2', { text: brief.chapter?.name || 'Campaña' }),
        IM.el('p', { text: brief.text }),
        IM.el('p', {
          class: 'muted',
          text: `Rama: ${brief.branch?.name || 'sin elegir'} · ${(IM_DATA.campaignMissions || []).length} misiones de campaña`,
        }),
        IM.el('button', {
          class: 'btn',
          type: 'button',
          text: 'Ver briefing',
          onclick: () => {
            st.briefingSeen[st.campaignChapter || 1] = false;
            this.showBriefingIfNeeded();
          },
        }),
      ])
    );
    body.append(IM.el('h2', { text: 'Misiones activas' }));
    const doneCount = Object.keys(st.missionsCompleted || {}).filter((k) => String(k).startsWith('cm_')).length;
    body.append(
      IM.el('p', {
        class: 'muted',
        text: `Completadas ${doneCount} / ${(IM_DATA.campaignMissions || []).length} · activas ${(st.activeMissionIds || []).length}`,
      })
    );
    (st.activeMissionIds || []).forEach((id) => {
      const m = this.game.missionById(id);
      if (!m) return;
      const p = this.game.missionProgress(m) * 100;
      const done = !!st.missionsCompleted[id] || this.game.missionSatisfied(m);
      body.append(
        IM.el('div', { class: `mini-card mission-card${done ? ' done' : ''}` }, [
          IM.el('strong', { text: m.title }),
          IM.el('p', { class: 'muted', text: m.description }),
          IM.el('div', { class: 'bar' }, [IM.el('div', { class: 'bar-fill', style: `width:${p}%` })]),
          IM.el('small', { text: `${p.toFixed(0)}% · +${IM.formatMoney(m.reward?.money || 0)}` }),
        ])
      );
    });
    body.append(IM.el('h2', { text: 'Capítulos' }));
    (IM_DATA.campaignChapters || []).forEach((c) => {
      body.append(
        IM.el('div', { class: `mini-card${c.id <= (st.campaignChapter || 1) ? ' done' : ''}` }, [
          IM.el('strong', { text: `${c.id}. ${c.name}` }),
          IM.el('p', { text: c.goal }),
          IM.el('small', { class: 'muted', text: `Desbloquea: ${(c.unlocks || []).join(', ')}` }),
        ])
      );
    });
  };

  const _ency = Proto.panelEnciclopedia;
  Proto.panelEnciclopedia = function (body) {
    // wrap original then enhance links — reimplement lighter with icons
    const st = this.game.state;
    const q = IM.el('input', { class: 'input', placeholder: 'Buscar…' });
    const cat = IM.el('select', { class: 'input' });
    cat.append(IM.el('option', { value: 'all', text: 'Todas' }));
    Object.entries(IM.categoryLabel).forEach(([k, v]) => cat.append(IM.el('option', { value: k, text: v })));
    const detail = IM.el('div', { class: 'ency-detail' });
    const list = IM.el('div', { class: 'ency-list' });
    const showItem = (it) => {
      detail.innerHTML = '';
      const head = IM.el('div', { class: 'product-row' });
      head.append(IM.Icons.el(it, 56));
      head.append(IM.el('div', {}, [IM.el('h2', { text: it.name }), IM.el('p', { class: 'muted', text: `${IM.categoryLabel[it.category]} · ${IM.formatMoney(it.basePrice)}/${it.unit}` })]));
      detail.append(head, IM.el('p', { text: it.description }));
      const producers = (IM_DATA.recipes || []).filter((r) => (r.outputs || []).some((o) => o.item === it.id));
      detail.append(IM.el('h3', { text: 'Se produce con' }));
      if (!producers.length) detail.append(IM.el('p', { class: 'muted', text: 'Materia prima / compra.' }));
      producers.slice(0, 8).forEach((r) => detail.append(IM.el('div', { class: 'tree-node', text: r.name })));
    };
    const render = () => {
      list.innerHTML = '';
      const query = q.value.toLowerCase();
      (IM_DATA.items || [])
        .filter((it) => (cat.value === 'all' || it.category === cat.value) && (!query || it.name.toLowerCase().includes(query)))
        .slice(0, 150)
        .forEach((it) => {
          const btn = IM.el('button', { class: 'ency-link product-row', type: 'button', onclick: () => showItem(it) });
          btn.append(IM.Icons.el(it, 28), IM.el('span', { text: it.name }));
          list.append(btn);
        });
    };
    q.oninput = render;
    cat.onchange = render;
    body.append(IM.el('div', { class: 'toolbar' }, [q, cat]));
    body.append(IM.el('div', { class: 'ency-layout' }, [list, detail]));
    render();
  };

  const _refresh = Proto.refresh;
  Proto.refresh = function () {
    _refresh.call(this);
    const st = this.game.state;
    if (st.ui?.showBriefing && st.campaignBranch) {
      st.ui.showBriefing = false;
      this.showBriefingIfNeeded();
    }
  };
})();
