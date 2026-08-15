(function boot() {
  const game = new IM.Game();
  const saved = IM.Save.load();
  game.init(saved && saved.version === IM_CONFIG.version ? saved : null);
  const ui = new IM.UI(game);
  ui.mount();
  setInterval(() => IM.Save.autosave(game.state), 120000);
  window.IM_GAME = game;
})();
