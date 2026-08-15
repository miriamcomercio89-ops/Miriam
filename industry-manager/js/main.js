/** Bootstrap Industry Manager */
(function () {
  const boot = () => {
    const game = new IM.Game();
    const saved = IM.Save.load();
    game.init(saved || null);
    const ui = new IM.UI(game);
    ui.mount();

    // Overlay hint on map
    const overlay = document.getElementById('mapOverlay');
    if (overlay) {
      const s = window.IM_DATA?.summary;
      overlay.textContent = s
        ? `${s.items} ítems · ${s.recipes} recetas · ${s.missions} misiones · click en un nodo del mapa`
        : 'Haz click en un hub industrial del mapa';
    }

    let last = performance.now();
    const frame = (now) => {
      const dt = now - last;
      last = now;
      game.tick(dt);
      // soft UI refresh for progress bars ~4 fps when playing
      if (!game.state.paused && game.state.speed > 0 && Math.floor(now / 250) !== Math.floor((now - dt) / 250)) {
        const panel = game.state.ui.panel;
        if (panel === 'industria' || panel === 'logistica' || panel === 'investigacion' || panel === 'misiones') {
          ui.renderTopbar();
          if (panel !== 'mapa') ui.renderPanel(panel);
        } else {
          ui.renderTopbar();
        }
      }
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);

    window.IM_GAME = game;
    window.IM_UI = ui;
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
