/** UI v7: tutorial, chat, minimapa, escenarios, cloud, construcción por tipo */
window.IM = window.IM || {};

(function () {
  const Proto = IM.UI && IM.UI.prototype;
  if (!Proto) return;

  // Extend nav groups via patching AppV6 NAV by re-wrapping navButtons
  const _nav = Proto.navButtons;
  Proto.navButtons = function () {
    // Rebuild with v7 extras injected into groups by temporarily patching showPanel targets
    const btns = _nav.call(this);
    // Append v7 entries into open groups by re-render logic below — instead inject into sidebar after
    return btns;
  };

  const _mount = Proto.mount;
  Proto.mount = function () {
    _mount.call(this);
    this.ensureV7Chrome();
    if (!this.game.state.tutorialDone && !this.game.state.tutorialSkipped) {
      this.renderTutorial();
    }
  };

  Proto.ensureV7Chrome = function () {
    if (!document.getElementById('corpChatDock')) {
      const chat = IM.el('div', { id: 'corpChatDock', class: 'corp-chat-dock' });
      document.getElementById('app')?.appendChild(chat);
    }
    if (!document.getElementById('filialMinimap')) {
      const mm = IM.el('div', { id: 'filialMinimap', class: 'filial-minimap' });
      document.getElementById('app')?.appendChild(mm);
    }
    this.renderCorpChatDock();
    this.renderFilialMinimap();
  };

  const _showPanel = Proto.showPanel;
  Proto.showPanel = function (id) {
    _showPanel.call(this, id);
    this.renderCorpChatDock();
    this.renderFilialMinimap();
    this.renderTutorial();
  };

  const _renderPanel = Proto.renderPanel;
  Proto.renderPanel = function (id) {
    const v7 = {
      chat: 'Chat corporativo',
      escenarios: 'Escenarios sandbox',
      politica: 'Eventos políticos',
    };
    if (id === 'industria') {
      // full replace with ordered build UI
      const header = document.getElementById('panelHeader');
      const body = document.getElementById('panelBody');
      header.innerHTML = '';
      header.append(IM.el('h1', { text: 'Industria · construcción' }));
      body.innerHTML = '';
      this.panelIndustriaV7(body);
      return;
    }
    if (!v7[id]) {
      _renderPanel.call(this, id);
      if (id === 'ajustes') this.enhanceAjustesCloud();
      if (id === 'filiales') this.enhanceFilialesMinimap();
      return;
    }
    const header = document.getElementById('panelHeader');
    const body = document.getElementById('panelBody');
    header.innerHTML = '';
    header.append(IM.el('h1', { text: v7[id] }));
    body.innerHTML = '';
    if (id === 'chat') this.panelChat(body);
    if (id === 'escenarios') this.panelEscenarios(body);
    if (id === 'politica') this.panelPolitica(body);
  };

  // Patch sidebar groups: after renderSidebar from v6, inject extra buttons
  const _renderSidebar = Proto.renderSidebar;
  Proto.renderSidebar = function () {
    if (_renderSidebar) _renderSidebar.call(this);
    else {
      const side = document.getElementById('sidebar');
      if (side) {
        side.innerHTML = '';
        this.navButtons().forEach((n) => side.append(n));
      }
    }
    const side = document.getElementById('sidebar');
    if (!side) return;
    const st = this.game.state;
    const extras = [
      ['mundo', 'chat', 'Chat corp.'],
      ['mundo', 'escenarios', 'Escenarios'],
      ['mercado', 'politica', 'Política'],
    ];
    extras.forEach(([group, id, label]) => {
      if (st.ui.navGroup !== group) return;
      if ([...side.querySelectorAll('[data-panel]')].some((b) => b.dataset.panel === id)) return;
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

  Proto.panelIndustriaV7 = function (body) {
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
      body.append(IM.el('p', { class: 'muted', text: 'Sin planta. Fundá desde el mapa.' }));
      return;
    }

    const cats = {};
    (IM_DATA.buildings || []).forEach((b) => {
      cats[b.category] = cats[b.category] || [];
      cats[b.category].push(b);
    });
    const catOrder = Object.keys(cats).sort();
    const filterCat = IM.el('select', { class: 'input' });
    filterCat.append(IM.el('option', { value: 'all', text: 'Todas las categorías' }));
    catOrder.forEach((c) =>
      filterCat.append(
        IM.el('option', {
          value: c,
          text: `${IM_DATA.buildingCategoryLabel?.[c] || c} (${cats[c].length})`,
        })
      )
    );
    const search = IM.el('input', { class: 'input', placeholder: 'Buscar edificio…' });
    const grid = IM.el('div', { class: 'build-catalog' });

    const render = () => {
      grid.innerHTML = '';
      const q = (search.value || '').toLowerCase();
      const selected = filterCat.value;
      catOrder.forEach((cat) => {
        if (selected !== 'all' && selected !== cat) return;
        const list = cats[cat]
          .filter((b) => !q || b.name.toLowerCase().includes(q) || b.id.includes(q))
          .sort((a, b) => a.name.localeCompare(b.name, 'es'));
        if (!list.length) return;
        grid.append(IM.el('h2', { class: 'build-cat-title', text: IM_DATA.buildingCategoryLabel?.[cat] || cat }));
        const row = IM.el('div', { class: 'build-grid' });
        list.forEach((b) => {
          const card = IM.el('div', { class: 'build-card' });
          card.append(IM.Icons.buildingEl(b, 48));
          card.append(
            IM.el('div', { class: 'build-card-body' }, [
              IM.el('strong', { text: b.name }),
              IM.el('small', {
                class: 'muted',
                text: `${b.slots} slots · almacén ${b.storage} · fam. ${b.family || b.id}`,
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
          row.append(card);
        });
        grid.append(row);
      });
    };
    filterCat.onchange = render;
    search.oninput = render;
    body.append(IM.el('div', { class: 'toolbar' }, [filterCat, search]));
    body.append(IM.el('p', { class: 'muted', text: `${(IM_DATA.buildings || []).length} edificios · logos por tipo · recetas compatibles por familia` }));
    body.append(grid);
    render();

    // Existing buildings list with logos
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

  Proto.openInstallModal = function (siteId, building, slotIndex) {
    this.openModal((inner, modal) => {
      const fam = this.game.buildingRecipeFamily(building.type);
      const recipes = (IM_DATA.recipes || []).filter((r) => r.building === building.type || r.building === fam);
      inner.append(IM.el('h2', { text: `Instalar slot ${slotIndex + 1}` }));
      if (!recipes.length) inner.append(IM.el('p', { class: 'muted', text: 'No hay recetas para esta familia de edificio.' }));
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
  };

  Proto.panelChat = function (body) {
    body.append(IM.el('p', { class: 'muted', text: 'Mensajes de filiales, lobby y gobierno.' }));
    if (!this.game.state.corpChat?.length) body.append(IM.el('p', { class: 'muted', text: 'Sin mensajes aún.' }));
    (this.game.state.corpChat || []).forEach((m) => {
      body.append(
        IM.el('div', { class: `mini-card chat-msg ${m.kind || ''}` }, [
          IM.el('strong', { text: m.from }),
          IM.el('small', { class: 'muted', text: ` · día ${m.day}` }),
          IM.el('p', { text: m.text }),
        ])
      );
    });
  };

  Proto.panelEscenarios = function (body) {
    const st = this.game.state;
    body.append(
      IM.el('p', {
        class: 'muted',
        text: 'Al avanzar la campaña se desbloquean sandboxes. Capítulo actual: ' + (st.campaignChapter || 1),
      })
    );
    (IM_DATA.sandboxScenarios || []).forEach((sc) => {
      const unlocked = (st.unlockedScenarios || []).includes(sc.id) || st.unlockAll;
      body.append(
        IM.el('div', { class: `mini-card${unlocked ? '' : ' locked'}` }, [
          IM.el('strong', { text: sc.name + (unlocked ? '' : ` 🔒 cap.${sc.unlockChapter}`) }),
          IM.el('p', { text: sc.blurb }),
          unlocked
            ? IM.el('button', {
                class: 'btn primary',
                type: 'button',
                text: 'Jugar escenario',
                onclick: () => {
                  const r = this.game.startSandbox(sc.id);
                  this.toast(r.ok ? 'Sandbox OK' : r.error, r.ok ? 'ok' : 'error');
                  if (r.ok) this.refresh();
                },
              })
            : IM.el('small', { class: 'muted', text: 'Sigue la campaña para desbloquear' }),
        ])
      );
    });
  };

  Proto.panelPolitica = function (body) {
    body.append(IM.el('p', { class: 'muted', text: 'Subvenciones, aranceles y normas que mueven la economía.' }));
    const mods = this.game.state.policyMods || {};
    body.append(
      IM.el('div', { class: 'stat-grid' }, [
        ['Flete ×', String(mods.freightMul || 1)],
        ['Agua ×', String(mods.waterMul || 1)],
        ['Export ×', String(mods.exportMul || 1)],
        ['Multas ×', String(mods.pollutionFineMul || 1)],
      ].map(([k, v]) => IM.el('div', { class: 'stat-box' }, [IM.el('span', { text: k }), IM.el('strong', { text: v })])))
    );
    if (!this.game.state.politicalEvents?.length) body.append(IM.el('p', { class: 'muted', text: 'Sin eventos activos.' }));
    (this.game.state.politicalEvents || []).forEach((e) => {
      body.append(
        IM.el('div', { class: 'mini-card news-card' }, [
          IM.el('strong', { text: e.title }),
          IM.el('p', { text: e.text }),
          IM.el('small', { class: 'muted', text: `Hasta día ${e.expiresDay}` }),
        ])
      );
    });
    body.append(
      IM.el('button', {
        class: 'btn',
        type: 'button',
        text: 'Forzar evento (debug)',
        onclick: () => {
          this.game.spawnPoliticalEvent();
          this.refresh();
        },
      })
    );
  };

  Proto.enhanceFilialesMinimap = function () {
    const body = document.getElementById('panelBody');
    if (!body) return;
    body.append(IM.el('h2', { text: 'Minimapa de salud' }));
    const wrap = IM.el('div', { class: 'status-grid' });
    this.game.getSubsidiaryMinimap().forEach((f) => {
      wrap.append(
        IM.el('div', { class: `status-pill ${f.status}` }, [
          IM.el('span', { class: 'dot' }),
          IM.el('strong', { text: f.name }),
          IM.el('small', { text: `${f.location || ''} · ${f.buildings} edif.` }),
        ])
      );
    });
    body.append(wrap);
  };

  Proto.enhanceAjustesCloud = function () {
    const body = document.getElementById('panelBody');
    if (!body) return;
    body.append(IM.el('h2', { text: 'Nube / cuenta' }));
    const user = IM.el('input', { class: 'input', placeholder: 'Usuario', value: IM.Cloud.currentUser() || '' });
    const pass = IM.el('input', { class: 'input', type: 'password', placeholder: 'Clave' });
    const slot = IM.el('input', { class: 'input', placeholder: 'Nombre slot', value: 'partida1' });
    body.append(
      IM.el('p', {
        class: 'muted',
        text: 'Cuenta local multi-slot (nube en este navegador). Combínalo con códigos IM6 para otro PC.',
      })
    );
    body.append(
      IM.el('div', { class: 'toolbar' }, [
        user,
        pass,
        IM.el('button', {
          class: 'btn',
          type: 'button',
          text: 'Registrar',
          onclick: () => {
            const r = IM.Cloud.register(user.value, pass.value);
            this.toast(r.ok ? 'Cuenta creada' : r.error, r.ok ? 'ok' : 'error');
          },
        }),
        IM.el('button', {
          class: 'btn primary',
          type: 'button',
          text: 'Entrar',
          onclick: () => {
            const r = IM.Cloud.login(user.value, pass.value);
            this.toast(r.ok ? `Hola ${r.user}` : r.error, r.ok ? 'ok' : 'error');
            this.refresh();
          },
        }),
        IM.el('button', {
          class: 'btn',
          type: 'button',
          text: 'Salir',
          onclick: () => {
            IM.Cloud.logout();
            this.toast('Sesión cerrada');
            this.refresh();
          },
        }),
      ])
    );
    const cur = IM.Cloud.currentUser();
    body.append(IM.el('p', { text: cur ? `Sesión: ${cur}` : 'Sin sesión' }));
    if (cur) {
      body.append(
        IM.el('div', { class: 'toolbar' }, [
          slot,
          IM.el('button', {
            class: 'btn primary',
            type: 'button',
            text: 'Subir partida a la nube',
            onclick: () => {
              const r = IM.Cloud.upload(slot.value || 'partida1', this.game.state);
              this.toast(r.ok ? `Subido (${r.id})` : r.error, r.ok ? 'ok' : 'error');
              this.refresh();
            },
          }),
        ])
      );
      IM.Cloud.listSlots().forEach((s) => {
        body.append(
          IM.el('div', { class: 'mini-card' }, [
            IM.el('strong', { text: s.name }),
            IM.el('p', { class: 'muted', text: `${IM.formatMoney(s.money)} · ${s.year} · cap.${s.chapter}` }),
            IM.el('button', {
              class: 'btn',
              type: 'button',
              text: 'Descargar / cargar',
              onclick: () => {
                const r = IM.Cloud.download(s.id);
                if (!r.ok) return this.toast(r.error, 'error');
                this.game.applyCloudSnapshot(r.data);
                this.toast('Partida nube cargada');
                this.refresh();
              },
            }),
          ])
        );
      });
    }
    body.append(
      IM.el('button', {
        class: 'btn',
        type: 'button',
        text: 'Reiniciar tutorial',
        onclick: () => {
          this.game.state.tutorialDone = false;
          this.game.state.tutorialSkipped = false;
          this.game.state.tutorialStep = 0;
          this.renderTutorial();
        },
      })
    );
  };

  Proto.renderCorpChatDock = function () {
    const dock = document.getElementById('corpChatDock');
    if (!dock) return;
    const last = (this.game.state.corpChat || [])[0];
    dock.innerHTML = '';
    dock.append(
      IM.el('strong', { text: 'Chat' }),
      IM.el('span', { text: last ? `${last.from}: ${last.text}` : 'Sin mensajes' }),
      IM.el('button', { class: 'btn', type: 'button', text: 'Abrir', onclick: () => this.showPanel('chat') })
    );
  };

  Proto.renderFilialMinimap = function () {
    const box = document.getElementById('filialMinimap');
    if (!box) return;
    box.innerHTML = '';
    box.append(IM.el('strong', { text: 'Filiales' }));
    const list = this.game.getSubsidiaryMinimap?.() || [];
    if (!list.length) {
      box.append(IM.el('span', { class: 'muted', text: 'Ninguna' }));
      return;
    }
    list.slice(0, 6).forEach((f) => {
      box.append(
        IM.el('div', {
          class: `mm-item ${f.status}`,
          title: f.location || '',
          text: f.name,
          onclick: () => {
            this.game.state.ui.selectedLocationId = this.game.state.subsidiaries[f.id]?.locationId;
            this.showPanel('filiales');
          },
        })
      );
    });
  };

  Proto.renderTutorial = function () {
    let host = document.getElementById('tutorialHost');
    if (this.game.state.tutorialDone || this.game.state.tutorialSkipped) {
      host?.remove();
      return;
    }
    if (!host) {
      host = IM.el('div', { id: 'tutorialHost', class: 'tutorial-host' });
      document.getElementById('app')?.appendChild(host);
    }
    const step = this.game.tutorialCurrent();
    if (!step) return;
    // auto-advance if check passes
    if (typeof step.check === 'function' && step.check(this.game)) {
      /* show as completed but wait for next click */
    }
    host.innerHTML = '';
    const card = IM.el('div', { class: 'tutorial-card' });
    card.append(IM.el('span', { class: 'briefing-tag', text: `Tutorial ${this.game.state.tutorialStep + 1}/${(IM_DATA.tutorialSteps || []).length}` }));
    card.append(IM.el('h2', { text: step.title }));
    card.append(IM.el('p', { text: step.body }));
    const ok = typeof step.check === 'function' ? step.check(this.game) : true;
    card.append(
      IM.el('div', { class: 'toolbar' }, [
        step.panel
          ? IM.el('button', {
              class: 'btn',
              type: 'button',
              text: 'Ir al panel',
              onclick: () => this.showPanel(step.panel),
            })
          : null,
        IM.el('button', {
          class: 'btn primary',
          type: 'button',
          text: ok ? 'Siguiente' : 'Hecho — siguiente',
          onclick: () => {
            const r = this.game.tutorialNext();
            if (r.done) this.toast('Tutorial completado');
            this.renderTutorial();
            this.refresh();
          },
        }),
        IM.el('button', {
          class: 'btn',
          type: 'button',
          text: 'Saltar tutorial',
          onclick: () => {
            this.game.tutorialSkip();
            this.renderTutorial();
          },
        }),
      ])
    );
    host.append(card);
  };

  const _refresh = Proto.refresh;
  Proto.refresh = function () {
    _refresh.call(this);
    this.renderCorpChatDock();
    this.renderFilialMinimap();
    if (!this.game.state.tutorialDone) this.renderTutorial();
  };
})();
