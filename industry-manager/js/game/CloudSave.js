/** Guardado en la nube (cuentas locales multi-slot + sync de partida) */
window.IM = window.IM || {};

IM.Cloud = {
  KEY: 'industry_manager_cloud_v7',

  _read() {
    try {
      return JSON.parse(localStorage.getItem(this.KEY) || '{"accounts":{}}');
    } catch (e) {
      return { accounts: {} };
    }
  },

  _write(db) {
    localStorage.setItem(this.KEY, JSON.stringify(db));
  },

  hash(pw) {
    let h = 2166136261;
    const s = String(pw || '');
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return (h >>> 0).toString(16);
  },

  register(user, password) {
    const u = String(user || '').trim().toLowerCase();
    if (u.length < 3) return { ok: false, error: 'Usuario mínimo 3 caracteres' };
    if (String(password || '').length < 4) return { ok: false, error: 'Clave mínima 4 caracteres' };
    const db = this._read();
    if (db.accounts[u]) return { ok: false, error: 'Usuario ya existe' };
    db.accounts[u] = { pass: this.hash(password), slots: {}, created: Date.now() };
    this._write(db);
    return { ok: true };
  },

  login(user, password) {
    const u = String(user || '').trim().toLowerCase();
    const db = this._read();
    const acc = db.accounts[u];
    if (!acc || acc.pass !== this.hash(password)) return { ok: false, error: 'Usuario o clave incorrectos' };
    db.session = u;
    this._write(db);
    return { ok: true, user: u };
  },

  logout() {
    const db = this._read();
    delete db.session;
    this._write(db);
  },

  currentUser() {
    return this._read().session || null;
  },

  listSlots(user) {
    const db = this._read();
    const acc = db.accounts[user || this.currentUser()];
    if (!acc) return [];
    return Object.entries(acc.slots).map(([id, s]) => ({
      id,
      name: s.name,
      updated: s.updated,
      money: s.money,
      year: s.year,
      chapter: s.chapter,
    }));
  },

  upload(slotName, gameState) {
    const user = this.currentUser();
    if (!user) return { ok: false, error: 'Inicia sesión en la nube' };
    const db = this._read();
    const acc = db.accounts[user];
    const id = IM.idify ? IM.idify(slotName) : String(slotName).replace(/\W+/g, '_');
    // portable slim snapshot
    const portable = {
      companyName: gameState.companyName,
      money: gameState.money,
      year: gameState.year,
      day: gameState.day,
      campaignBranch: gameState.campaignBranch,
      campaignChapter: gameState.campaignChapter,
      campaignMissionChapter: gameState.campaignMissionChapter,
      xp: gameState.xp,
      sites: gameState.sites,
      warehouses: gameState.warehouses,
      subsidiaries: gameState.subsidiaries,
      discoveredLocations: gameState.discoveredLocations,
      fogExplored: gameState.fogExplored,
      researched: gameState.researched,
      missionsCompleted: gameState.missionsCompleted,
      loans: gameState.loans,
      franchiseContracts: gameState.franchiseContracts,
      board: gameState.board,
      shiftPolicy: gameState.shiftPolicy,
      parcels: gameState.parcels,
      producedLifetime: gameState.producedLifetime,
      soldLifetime: gameState.soldLifetime,
      employees: gameState.employees,
      creditRating: gameState.creditRating,
      inflationIndex: gameState.inflationIndex,
      unlockAll: gameState.unlockAll,
      sandboxId: gameState.sandboxId,
      tutorialDone: gameState.tutorialDone,
    };
    acc.slots[id] = {
      name: slotName || id,
      updated: Date.now(),
      money: Math.round(gameState.money),
      year: gameState.year,
      chapter: gameState.campaignChapter,
      data: portable,
    };
    this._write(db);
    return { ok: true, id };
  },

  download(slotId) {
    const user = this.currentUser();
    if (!user) return { ok: false, error: 'Sin sesión' };
    const db = this._read();
    const slot = db.accounts[user]?.slots?.[slotId];
    if (!slot?.data) return { ok: false, error: 'Slot vacío' };
    return { ok: true, data: slot.data };
  },

  removeSlot(slotId) {
    const user = this.currentUser();
    if (!user) return { ok: false, error: 'Sin sesión' };
    const db = this._read();
    delete db.accounts[user].slots[slotId];
    this._write(db);
    return { ok: true };
  },
};
