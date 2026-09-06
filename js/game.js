(() => {
  "use strict";

  const W = 160;
  const H = 100;
  const MAX_FLOORS = 40;
  const FLOOR_COST_BASE = 12000;
  const START_MONEY = 350000;
  const SAVE_KEY = "costa-aurora-save-v1";

  const T = [
    { id: 0,  key: "grass",      name: "Césped",         cat: "terreno",  cost: 0,     color: "#3f8f4e", color2: "#2f6e3c", room: 0, rate: 0,   amenity: 0, outdoor: 1 },
    { id: 1,  key: "sand",       name: "Arena",          cat: "terreno",  cost: 0,     color: "#e6d09a", color2: "#cbb37a", room: 0, rate: 0,   amenity: 0, outdoor: 1 },
    { id: 2,  key: "ocean",      name: "Mar",            cat: "terreno",  cost: 0,     color: "#1b7fa8", color2: "#125e80", room: 0, rate: 0,   amenity: 0, blocked: 1 },
    { id: 3,  key: "path",       name: "Paseo",          cat: "terreno",  cost: 40,    color: "#c9b79a", color2: "#a89474", room: 0, rate: 0,   amenity: 0 },
    { id: 4,  key: "palm",       name: "Palmeras",       cat: "exterior", cost: 180,   color: "#2d6b38", color2: "#1e4d28", room: 0, rate: 0,   amenity: 1, outdoor: 1 },
    { id: 5,  key: "garden",     name: "Jardín",         cat: "exterior", cost: 220,   color: "#5fa84a", color2: "#3d7a32", room: 0, rate: 0,   amenity: 1, outdoor: 1 },
    { id: 6,  key: "pool",       name: "Piscina",        cat: "exterior", cost: 420,   color: "#3ec6d4", color2: "#1e8fa0", room: 0, rate: 0,   amenity: 2 },
    { id: 7,  key: "beachclub",  name: "Chiringuito",    cat: "exterior", cost: 3500,  color: "#e09b4a", color2: "#b87528", room: 0, rate: 0,   amenity: 2, outdoor: 1 },
    { id: 8,  key: "lobby",      name: "Recepción",      cat: "servicios",cost: 6000,  color: "#d4af37", color2: "#a88420", room: 0, rate: 0,   amenity: 3 },
    { id: 9,  key: "elevator",   name: "Ascensor",       cat: "infra",    cost: 4500,  color: "#8ea0b5", color2: "#5d6e82", room: 0, rate: 0,   amenity: 0, shaft: 1 },
    { id: 10, key: "stairs",     name: "Escalera",       cat: "infra",    cost: 1800,  color: "#9a7b5a", color2: "#6e5740", room: 0, rate: 0,   amenity: 0, shaft: 1 },
    { id: 11, key: "room_std",   name: "Habitación",     cat: "hab",      cost: 850,   color: "#5b8def", color2: "#3a68c4", room: 1, rate: 95,  amenity: 0 },
    { id: 12, key: "room_dlx",   name: "Deluxe",         cat: "hab",      cost: 1900,  color: "#7b5cff", color2: "#5539c7", room: 1, rate: 175, amenity: 0 },
    { id: 13, key: "room_suite", name: "Suite",          cat: "hab",      cost: 4800,  color: "#d45ca8", color2: "#a3387c", room: 1, rate: 390, amenity: 0 },
    { id: 14, key: "room_pres",  name: "Presidencial",   cat: "hab",      cost: 14000, color: "#f0c44c", color2: "#c49218", room: 1, rate: 980, amenity: 0 },
    { id: 15, key: "restaurant", name: "Restaurante",    cat: "servicios",cost: 9000,  color: "#e07a3d", color2: "#b35520", room: 0, rate: 0,   amenity: 3 },
    { id: 16, key: "bar",        name: "Bar",            cat: "servicios",cost: 5500,  color: "#8b2942", color2: "#5e1528", room: 0, rate: 0,   amenity: 2 },
    { id: 17, key: "spa",        name: "Spa",            cat: "servicios",cost: 12000, color: "#f0a6ca", color2: "#c46d98", room: 0, rate: 0,   amenity: 4 },
    { id: 18, key: "gym",        name: "Gimnasio",       cat: "servicios",cost: 7000,  color: "#6b7280", color2: "#4b5563", room: 0, rate: 0,   amenity: 2 },
    { id: 19, key: "shop",       name: "Boutique",       cat: "servicios",cost: 4000,  color: "#c45c6a", color2: "#933e4a", room: 0, rate: 0,   amenity: 1 },
    { id: 20, key: "disco",      name: "Discoteca",      cat: "servicios",cost: 16000, color: "#6d28d9", color2: "#4c1d95", room: 0, rate: 0,   amenity: 4 },
    { id: 21, key: "kitchen",    name: "Cocina",         cat: "servicios",cost: 3500,  color: "#78716c", color2: "#57534e", room: 0, rate: 0,   amenity: 1 },
    { id: 22, key: "carpet",     name: "Pasillo",        cat: "infra",    cost: 60,    color: "#8b6914", color2: "#6b4f10", room: 0, rate: 0,   amenity: 0 },
    { id: 23, key: "fountain",   name: "Fuente",         cat: "exterior", cost: 2500,  color: "#67e8f9", color2: "#22d3ee", room: 0, rate: 0,   amenity: 2, outdoor: 1 },
    { id: 24, key: "parking",    name: "Parking",        cat: "exterior", cost: 90,    color: "#475569", color2: "#334155", room: 0, rate: 0,   amenity: 0, outdoor: 1 },
    { id: 25, key: "pier",       name: "Muelle",         cat: "exterior", cost: 280,   color: "#92400e", color2: "#78350f", room: 0, rate: 0,   amenity: 1 },
    { id: 26, key: "interior",   name: "Forjado",        cat: "terreno",  cost: 15,    color: "#2a3340", color2: "#1f2732", room: 0, rate: 0,   amenity: 0 },
  ];

  const BY_KEY = Object.fromEntries(T.map((t) => [t.key, t]));
  const CATS = [
    { id: "hab", name: "Habitaciones" },
    { id: "servicios", name: "Servicios" },
    { id: "exterior", name: "Exterior" },
    { id: "infra", name: "Infra" },
    { id: "terreno", name: "Suelo" },
  ];

  const canvas = document.getElementById("world");
  const ctx = canvas.getContext("2d", { alpha: false });
  const mini = document.getElementById("minimap");
  const mctx = mini.getContext("2d");

  const state = {
    name: "Costa Aurora",
    money: START_MONEY,
    day: 1,
    minute: 8 * 60,
    speed: 1,
    floors: 1,
    floor: 0,
    grids: [],
    occ: [],
    camera: { x: 48, y: 40, z: 1 },
    tool: "paint",
    brush: 11,
    cat: "hab",
    drag: null,
    panning: false,
    panLast: null,
    guests: [],
    stats: { rooms: 0, occupied: 0, capacity: 0 },
    stars: 1,
    reputation: 55,
    lastIncome: 0,
    undo: [],
    seenHelp: false,
    simAcc: 0,
    lastTs: 0,
    keys: new Set(),
  };

  function idx(x, y) {
    return y * W + x;
  }
  function inMap(x, y) {
    return x >= 0 && y >= 0 && x < W && y < H;
  }
  function tileAt(f, x, y) {
    return T[state.grids[f][idx(x, y)]];
  }

  function makeFloor(kind) {
    const g = new Uint8Array(W * H);
    if (kind === "ground") {
      for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
          if (y > H - 8) g[idx(x, y)] = 2;
          else if (y > H - 14) g[idx(x, y)] = 1;
          else g[idx(x, y)] = 0;
        }
      }
      for (let i = 0; i < 90; i++) {
        const x = 4 + ((i * 37) % (W - 8));
        const y = 6 + ((i * 53) % (H - 28));
        if (g[idx(x, y)] === 0) g[idx(x, y)] = 4;
      }
    } else {
      g.fill(26);
    }
    return g;
  }

  function newGame() {
    state.name = "Costa Aurora";
    state.money = START_MONEY;
    state.day = 1;
    state.minute = 8 * 60;
    state.speed = 1;
    state.floors = 1;
    state.floor = 0;
    state.grids = [makeFloor("ground")];
    state.occ = [new Uint8Array(W * H)];
    state.camera = { x: 70, y: 55, z: 0.85 };
    state.guests = [];
    state.reputation = 55;
    state.lastIncome = 0;
    state.undo = [];
    state.brush = 11;
    state.tool = "paint";
    document.getElementById("resort-name").value = state.name;
    recount();
    save();
  }

  function serialize() {
    return {
      name: state.name,
      money: state.money,
      day: state.day,
      minute: state.minute,
      floors: state.floors,
      floor: state.floor,
      grids: state.grids.map((g) => Array.from(g)),
      occ: state.occ.map((g) => Array.from(g)),
      reputation: state.reputation,
      camera: state.camera,
      seenHelp: true,
    };
  }

  function hydrate(data) {
    state.name = data.name || "Costa Aurora";
    state.money = data.money;
    state.day = data.day;
    state.minute = data.minute;
    state.floors = data.floors;
    state.floor = data.floor || 0;
    state.grids = data.grids.map((g) => Uint8Array.from(g));
    state.occ = data.occ.map((g) => Uint8Array.from(g));
    state.reputation = data.reputation ?? 55;
    state.camera = data.camera || state.camera;
    state.guests = [];
    state.undo = [];
    document.getElementById("resort-name").value = state.name;
    recount();
  }

  function save() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(serialize()));
    } catch (_) {}
  }

  function load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return false;
      hydrate(JSON.parse(raw));
      return true;
    } catch (_) {
      return false;
    }
  }

  function moneyFmt(n) {
    const neg = n < 0;
    const s = Math.abs(Math.round(n)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return (neg ? "−" : "") + s + " €";
  }

  function toast(text) {
    const el = document.getElementById("toast");
    const msg = document.createElement("div");
    msg.className = "msg";
    msg.textContent = text;
    el.appendChild(msg);
    setTimeout(() => msg.remove(), 4200);
  }

  function floorCost() {
    return FLOOR_COST_BASE + state.floors * 4000;
  }

  function canBuild(id, floor, x, y) {
    const t = T[id];
    if (!inMap(x, y)) return false;
    const cur = tileAt(floor, x, y);
    if (cur.blocked && t.key !== "pier") return false;
    if (floor > 0 && t.outdoor) return false;
    if (floor > 0 && (t.key === "grass" || t.key === "sand" || t.key === "ocean")) return false;
    return true;
  }

  function placeOne(floor, x, y, id, bill) {
    if (!canBuild(id, floor, x, y)) return false;
    const i = idx(x, y);
    const prev = state.grids[floor][i];
    if (prev === id) return false;
    const t = T[id];
    if (t.cost > 0) {
      if (state.money < t.cost) return false;
      state.money -= t.cost;
      bill.spent += t.cost;
    }
    bill.changes.push({ f: floor, i, prev, occ: state.occ[floor][i] });
    state.grids[floor][i] = id;
    state.occ[floor][i] = 0;
    if (t.shaft && floor === 0) {
      for (let f = 1; f < state.floors; f++) {
        const p2 = state.grids[f][i];
        bill.changes.push({ f, i, prev: p2, occ: state.occ[f][i] });
        state.grids[f][i] = id;
        state.occ[f][i] = 0;
      }
    }
    bill.n++;
    return true;
  }

  function eraseOne(floor, x, y, bill) {
    if (!inMap(x, y)) return;
    const i = idx(x, y);
    const prev = state.grids[floor][i];
    const t = T[prev];
    if (t.blocked) return;
    if (floor === 0 && (t.key === "grass" || t.key === "sand")) return;
    const restore = floor === 0 ? (y > H - 14 && y <= H - 8 ? 1 : 0) : 26;
    if (prev === restore) return;
    bill.changes.push({ f: floor, i, prev, occ: state.occ[floor][i] });
    state.grids[floor][i] = restore;
    state.occ[floor][i] = 0;
    bill.n++;
  }

  function pushUndo(bill) {
    if (!bill.changes.length) return;
    state.undo.push(bill);
    if (state.undo.length > 25) state.undo.shift();
  }

  function undo() {
    const bill = state.undo.pop();
    if (!bill) return;
    state.money += bill.spent || 0;
    for (let k = bill.changes.length - 1; k >= 0; k--) {
      const c = bill.changes[k];
      state.grids[c.f][c.i] = c.prev;
      state.occ[c.f][c.i] = c.occ;
    }
    recount();
    toast("Deshecho");
  }

  function rectBounds(a, b) {
    const x0 = Math.max(0, Math.min(a.x, b.x));
    const y0 = Math.max(0, Math.min(a.y, b.y));
    const x1 = Math.min(W - 1, Math.max(a.x, b.x));
    const y1 = Math.min(H - 1, Math.max(a.y, b.y));
    return { x0, y0, x1, y1 };
  }

  function applyRect(a, b, mode) {
    const { x0, y0, x1, y1 } = rectBounds(a, b);
    const bill = { changes: [], spent: 0, n: 0 };
    const f = state.floor;
    if (mode === "erase") {
      for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) eraseOne(f, x, y, bill);
    } else if (mode === "wing") {
      fillWing(f, x0, y0, x1, y1, bill);
    } else {
      for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) placeOne(f, x, y, state.brush, bill);
    }
    pushUndo(bill);
    recount();
    if (bill.n) toast(bill.n + " casillas · " + moneyFmt(bill.spent));
    else if (bill.spent === 0 && mode !== "erase") toast("No hay dinero suficiente o el terreno no admite eso.");
  }

  function fillWing(f, x0, y0, x1, y1, bill) {
    const w = x1 - x0 + 1;
    const h = y1 - y0 + 1;
    if (w < 3 && h < 3) {
      for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) placeOne(f, x, y, state.brush, bill);
      return;
    }
    const hall = f === 0 ? BY_KEY.path.id : BY_KEY.carpet.id;
    const room = T[state.brush].room ? state.brush : BY_KEY.room_std.id;
    if (w >= h) {
      const mid = (y0 + y1) >> 1;
      for (let y = y0; y <= y1; y++) {
        for (let x = x0; x <= x1; x++) {
          const id = y === mid ? hall : room;
          placeOne(f, x, y, id, bill);
        }
      }
    } else {
      const mid = (x0 + x1) >> 1;
      for (let y = y0; y <= y1; y++) {
        for (let x = x0; x <= x1; x++) {
          const id = x === mid ? hall : room;
          placeOne(f, x, y, id, bill);
        }
      }
    }
  }

  function previewCost(a, b, mode) {
    const { x0, y0, x1, y1 } = rectBounds(a, b);
    let n = 0;
    let cost = 0;
    const f = state.floor;
    const hall = f === 0 ? BY_KEY.path.id : BY_KEY.carpet.id;
    const room = T[state.brush].room ? state.brush : BY_KEY.room_std.id;
    const w = x1 - x0 + 1;
    const h = y1 - y0 + 1;
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        let id = state.brush;
        if (mode === "erase") {
          n++;
          continue;
        }
        if (mode === "wing") {
          if (w >= h) id = y === ((y0 + y1) >> 1) ? hall : room;
          else id = x === ((x0 + x1) >> 1) ? hall : room;
        }
        if (!canBuild(id, f, x, y)) continue;
        if (state.grids[f][idx(x, y)] === id) continue;
        n++;
        cost += T[id].cost;
      }
    }
    return { n, cost, x0, y0, x1, y1 };
  }

  function recount() {
    let rooms = 0;
    let occupied = 0;
    let capacity = 0;
    let amenityScore = 0;
    let lobby = 0;
    let elev = 0;
    let suites = 0;
    let pres = 0;
    const amenityTypes = new Set();
    for (let f = 0; f < state.floors; f++) {
      const g = state.grids[f];
      const o = state.occ[f];
      for (let i = 0; i < g.length; i++) {
        const t = T[g[i]];
        if (t.room) {
          rooms++;
          capacity++;
          if (o[i]) occupied++;
          if (t.key === "room_suite") suites++;
          if (t.key === "room_pres") pres++;
        }
        if (t.amenity) {
          amenityScore += t.amenity;
          amenityTypes.add(t.key);
        }
        if (t.key === "lobby") lobby++;
        if (t.key === "elevator") elev++;
      }
    }
    state.stats = { rooms, occupied, capacity, amenityScore, lobby, elev, suites, pres, amenityTypes: amenityTypes.size };
    let stars = 1;
    if (lobby && rooms >= 8) stars = 1;
    if (lobby && rooms >= 25 && amenityTypes.size >= 2) stars = 2;
    if (lobby && rooms >= 80 && amenityTypes.size >= 4) stars = 3;
    if (lobby && rooms >= 200 && amenityTypes.size >= 6 && suites >= 12) stars = 4;
    if (lobby && rooms >= 500 && amenityTypes.size >= 8 && pres >= 8 && elev) stars = 5;
    if (!lobby) stars = Math.min(stars, 1);
    state.stars = stars;
  }

  function hasVerticalAccess() {
    return state.stats.elev > 0;
  }

  function occupancyTarget() {
    const s = state.stats;
    if (!s.lobby) return 0;
    let demand = 0.38 + state.stars * 0.1 + s.amenityTypes * 0.03 + state.reputation / 500;
    if (s.rooms > 0 && s.amenityScore / Math.max(1, s.rooms) < 0.02 && s.rooms > 40) demand *= 0.8;
    return Math.max(0.28, Math.min(0.97, demand));
  }

  function sim(dt) {
    const k = state.keys;
    const pan = 14 * dt / Math.max(0.25, state.camera.z);
    if (k.has("KeyW") || k.has("ArrowUp")) state.camera.y -= pan;
    if (k.has("KeyS") || k.has("ArrowDown")) state.camera.y += pan;
    if (k.has("KeyA") || k.has("ArrowLeft")) state.camera.x -= pan;
    if (k.has("KeyD") || k.has("ArrowRight")) state.camera.x += pan;
    if (state.speed === 0) return;
    state.simAcc += dt * state.speed;
    const step = 0.25;
    while (state.simAcc >= step) {
      state.simAcc -= step;
      tick(step);
    }
  }

  function tick() {
    state.minute += 3;
    if (state.minute >= 24 * 60) {
      state.minute -= 24 * 60;
      state.day++;
      endOfDay();
    }
    const hour = (state.minute / 60) | 0;
    const arriving = hour >= 13 && hour <= 22;
    const leaving = hour >= 9 && hour <= 11;
    const target = occupancyTarget();
    const s = state.stats;
    if (!s.capacity) return;
    const want = Math.floor(s.capacity * target);
    if (arriving && s.occupied < want) {
      const n = Math.min(12 + (s.capacity / 80) | 0, want - s.occupied);
      fillRooms(n, true);
    }
    if (leaving && s.occupied > want) {
      const n = Math.min(8 + (s.capacity / 100) | 0, s.occupied - want);
      fillRooms(n, false);
    }
    spawnWalkers();
  }

  function fillRooms(n, occupy) {
    let left = n;
    const startF = hasVerticalAccess() ? 0 : 0;
    const maxF = hasVerticalAccess() ? state.floors : 1;
    for (let f = startF; f < maxF && left > 0; f++) {
      const g = state.grids[f];
      const o = state.occ[f];
      for (let i = 0; i < g.length && left > 0; i++) {
        if (!T[g[i]].room) continue;
        if (occupy && !o[i]) {
          o[i] = 1;
          left--;
          state.stats.occupied++;
        } else if (!occupy && o[i]) {
          o[i] = 0;
          left--;
          state.stats.occupied--;
        }
      }
    }
  }

  function endOfDay() {
    const g = state.grids;
    let income = 0;
    for (let f = 0; f < state.floors; f++) {
      const grid = g[f];
      const o = state.occ[f];
      for (let i = 0; i < grid.length; i++) {
        const t = T[grid[i]];
        if (t.room && o[i]) income += t.rate;
      }
    }
    income = Math.round(income * (0.85 + state.stars * 0.06));
    const staff = Math.round(state.stats.rooms * 9 + state.stats.amenityScore * 4 + state.floors * 40);
    const net = income - staff;
    state.money += net;
    state.lastIncome = net;
    if (net > 0) state.reputation = Math.min(100, state.reputation + 0.4);
    else state.reputation = Math.max(10, state.reputation - 0.8);
    recount();
    const sign = net >= 0 ? "+" : "";
    toast("Cierre del día " + state.day + ": " + sign + moneyFmt(net) + " (ingresos " + moneyFmt(income) + " − personal " + moneyFmt(staff) + ")");
    if (state.day % 2 === 0) save();
    maybeEvent();
  }

  function maybeEvent() {
    const r = Math.random();
    if (r < 0.08 && state.stats.rooms > 20) {
      const bonus = 2000 + state.stars * 1500;
      state.money += bonus;
      toast("Un grupo de bodas reserva el resort: +" + moneyFmt(bonus));
    } else if (r < 0.12) {
      const loss = 800 + ((Math.random() * 1200) | 0);
      state.money -= loss;
      toast("Tormenta tropical: reparaciones −" + moneyFmt(loss));
    } else if (r < 0.16 && state.stars >= 3) {
      toast("Una revista de viajes destaca Costa Aurora. Sube la demanda.");
      state.reputation = Math.min(100, state.reputation + 6);
    }
  }

  function spawnWalkers() {
    const need = Math.min(70, 8 + (state.stats.occupied / 40) | 0);
    while (state.guests.length < need) {
      state.guests.push({
        x: 20 + Math.random() * (W - 40),
        y: 20 + Math.random() * (H - 30),
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        hue: (Math.random() * 360) | 0,
        floor: Math.random() < 0.7 ? state.floor : ((Math.random() * state.floors) | 0),
      });
    }
    if (state.guests.length > need) state.guests.length = need;
    for (const g of state.guests) {
      g.x += g.vx * 0.15;
      g.y += g.vy * 0.15;
      if (g.x < 2 || g.x > W - 3) g.vx *= -1;
      if (g.y < 2 || g.y > H - 10) g.vy *= -1;
    }
  }

  function cellSize() {
    return 22 * state.camera.z;
  }

  function worldToScreen(x, y) {
    const s = cellSize();
    return {
      x: (x - state.camera.x) * s + canvas.width / 2,
      y: (y - state.camera.y) * s + canvas.height / 2,
    };
  }

  function screenToWorld(px, py) {
    const s = cellSize();
    return {
      x: Math.floor((px - canvas.width / 2) / s + state.camera.x),
      y: Math.floor((py - canvas.height / 2) / s + state.camera.y),
    };
  }

  function resize() {
    canvas.width = innerWidth;
    canvas.height = innerHeight;
  }

  function draw() {
    const s = cellSize();
    const w = canvas.width;
    const h = canvas.height;
    const hour = (state.minute / 60) % 24;
    const night = hour < 6 || hour >= 21;
    ctx.fillStyle = night ? "#061018" : "#12384a";
    ctx.fillRect(0, 0, w, h);

    const topLeft = screenToWorld(0, 0);
    const botRight = screenToWorld(w, h);
    const x0 = Math.max(0, topLeft.x - 1);
    const y0 = Math.max(0, topLeft.y - 1);
    const x1 = Math.min(W - 1, botRight.x + 1);
    const y1 = Math.min(H - 1, botRight.y + 1);
    const f = state.floor;
    const g = state.grids[f];
    const o = state.occ[f];
    const showIcon = s >= 16;
    const show3d = s >= 10;

    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        const t = T[g[idx(x, y)]];
        const p = worldToScreen(x, y);
        ctx.fillStyle = ((x + y) & 1) === 0 ? t.color : t.color2;
        ctx.fillRect(p.x, p.y, s + 0.6, s + 0.6);
        if (show3d) {
          ctx.fillStyle = "rgba(255,255,255,0.12)";
          ctx.fillRect(p.x, p.y, s, Math.max(1, s * 0.12));
        }
        if (t.room && o[idx(x, y)]) {
          ctx.fillStyle = "rgba(255,255,255,0.22)";
          ctx.fillRect(p.x + s * 0.2, p.y + s * 0.2, s * 0.25, s * 0.25);
        }
        if (showIcon && t.room) {
          ctx.fillStyle = "rgba(0,0,0,0.18)";
          ctx.fillRect(p.x + s * 0.25, p.y + s * 0.45, s * 0.5, s * 0.28);
        }
        if (t.key === "pool") {
          ctx.fillStyle = "rgba(255,255,255,0.18)";
          ctx.fillRect(p.x + s * 0.15, p.y + s * 0.2, s * 0.7, s * 0.18);
        }
        if (t.key === "palm" && showIcon) {
          ctx.fillStyle = "#1a4a24";
          ctx.beginPath();
          ctx.arc(p.x + s * 0.5, p.y + s * 0.4, s * 0.28, 0, 6.3);
          ctx.fill();
        }
        if (t.key === "lobby") {
          ctx.fillStyle = "#fff3c4";
          ctx.fillRect(p.x + s * 0.35, p.y + s * 0.2, s * 0.3, s * 0.6);
        }
      }
    }

    if (state.drag && (state.tool === "rect" || state.tool === "wing" || (state.tool === "erase" && state.drag.moved))) {
      const pr = previewCost(state.drag.start, state.drag.cur, state.tool === "paint" ? "rect" : state.tool);
      const a = worldToScreen(pr.x0, pr.y0);
      const b = worldToScreen(pr.x1 + 1, pr.y1 + 1);
      ctx.strokeStyle = state.money >= pr.cost ? "#e0c070" : "#ef4444";
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.9;
      ctx.strokeRect(a.x, a.y, b.x - a.x, b.y - a.y);
      ctx.fillStyle = state.money >= pr.cost ? "rgba(224,192,112,0.18)" : "rgba(239,68,68,0.18)";
      ctx.fillRect(a.x, a.y, b.x - a.x, b.y - a.y);
      ctx.globalAlpha = 1;
      const box = document.getElementById("cost-preview");
      box.hidden = false;
      box.textContent = pr.n + " casillas · " + moneyFmt(pr.cost);
      box.style.left = Math.min(innerWidth - 180, state.drag.px + 16) + "px";
      box.style.top = state.drag.py + 16 + "px";
    } else {
      document.getElementById("cost-preview").hidden = true;
    }

    for (const guest of state.guests) {
      if (guest.floor !== f) continue;
      const p = worldToScreen(guest.x, guest.y);
      if (p.x < -10 || p.y < -10 || p.x > w || p.y > h) continue;
      ctx.fillStyle = "hsl(" + guest.hue + " 70% 70%)";
      ctx.beginPath();
      ctx.arc(p.x, p.y, Math.max(2, s * 0.18), 0, 6.3);
      ctx.fill();
    }

    if (night) {
      ctx.fillStyle = "rgba(4,10,24,0.28)";
      ctx.fillRect(0, 0, w, h);
    }

    drawMinimap();
    drawHud();
  }

  function drawMinimap() {
    const f = state.floor;
    const g = state.grids[f];
    const img = mctx.createImageData(200, 124);
    const d = img.data;
    for (let py = 0; py < 124; py++) {
      for (let px = 0; px < 200; px++) {
        const x = Math.min(W - 1, (px * W / 200) | 0);
        const y = Math.min(H - 1, (py * H / 124) | 0);
        const c = T[g[idx(x, y)]].color;
        const r = parseInt(c.slice(1, 3), 16);
        const gr = parseInt(c.slice(3, 5), 16);
        const b = parseInt(c.slice(5, 7), 16);
        const i = (py * 200 + px) * 4;
        d[i] = r;
        d[i + 1] = gr;
        d[i + 2] = b;
        d[i + 3] = 255;
      }
    }
    mctx.putImageData(img, 0, 0);
    const s = cellSize();
    const vw = canvas.width / s;
    const vh = canvas.height / s;
    const mx = (state.camera.x - vw / 2) * (200 / W);
    const my = (state.camera.y - vh / 2) * (124 / H);
    mctx.strokeStyle = "#e0c070";
    mctx.strokeRect(mx, my, vw * (200 / W), vh * (124 / H));
  }

  function starString(n) {
    return "★★★★★".slice(0, n) + "☆☆☆☆☆".slice(0, 5 - n);
  }

  function clock() {
    const hh = String((state.minute / 60) | 0).padStart(2, "0");
    const mm = String(state.minute % 60).padStart(2, "0");
    return "Día " + state.day + " · " + hh + ":" + mm;
  }

  function drawHud() {
    document.getElementById("ui-money").textContent = moneyFmt(state.money);
    document.getElementById("ui-day").textContent = clock();
    document.getElementById("ui-guests").textContent = state.stats.occupied + " / " + state.stats.capacity;
    document.getElementById("ui-rooms").textContent = String(state.stats.rooms);
    const occ = state.stats.capacity ? Math.round((100 * state.stats.occupied) / state.stats.capacity) : 0;
    document.getElementById("ui-occ").textContent = occ + "%";
    if (!state.stats.lobby && state.stats.rooms) {
      document.getElementById("ui-occ").textContent = "Sin recepción";
    }
    document.getElementById("stars").textContent = starString(state.stars);
    const fl = state.floor === 0 ? "Jardín · Planta 0" : "Planta " + state.floor;
    document.getElementById("floor-label").textContent = fl + " / " + (state.floors - 1);
  }

  function loop(ts) {
    if (!state.lastTs) state.lastTs = ts;
    const dt = Math.min(0.05, (ts - state.lastTs) / 1000);
    state.lastTs = ts;
    sim(dt);
    draw();
    requestAnimationFrame(loop);
  }

  function renderPalette() {
    const pal = document.getElementById("palette");
    pal.innerHTML = "";
    T.filter((t) => t.cat === state.cat && t.key !== "ocean").forEach((t) => {
      const b = document.createElement("button");
      if (t.id === state.brush) b.classList.add("on");
      b.innerHTML = '<span class="swatch" style="background:' + t.color + '"></span><span class="name">' + t.name + '</span><span class="price">' + (t.cost ? moneyFmt(t.cost) : "—") + "</span>";
      b.onclick = () => {
        state.brush = t.id;
        if (state.tool === "erase") state.tool = "paint";
        syncTools();
        renderPalette();
      };
      pal.appendChild(b);
    });
  }

  function renderCats() {
    const el = document.getElementById("cats");
    el.innerHTML = "";
    CATS.forEach((c) => {
      const b = document.createElement("button");
      b.textContent = c.name;
      if (c.id === state.cat) b.classList.add("on");
      b.onclick = () => {
        state.cat = c.id;
        renderCats();
        renderPalette();
      };
      el.appendChild(b);
    });
  }

  function syncTools() {
    document.querySelectorAll(".tool").forEach((b) => {
      b.classList.toggle("on", b.dataset.tool === state.tool);
    });
    document.querySelectorAll(".speed button").forEach((b) => {
      b.classList.toggle("on", Number(b.dataset.speed) === state.speed);
    });
    if (!state.panning) canvas.style.cursor = state.tool === "pan" ? "grab" : "crosshair";
  }

  function addFloor() {
    if (state.floors >= MAX_FLOORS) {
      toast("Has llegado al máximo de " + MAX_FLOORS + " plantas.");
      return;
    }
    const c = floorCost();
    if (state.money < c) {
      toast("Necesitas " + moneyFmt(c) + " para una planta nueva.");
      return;
    }
    state.money -= c;
    const nf = makeFloor("sky");
    for (let i = 0; i < nf.length; i++) {
      const t = T[state.grids[0][i]];
      if (t.shaft) nf[i] = t.id;
    }
    state.grids.push(nf);
    state.occ.push(new Uint8Array(W * H));
    state.floors++;
    state.floor = state.floors - 1;
    recount();
    toast("Nueva planta " + (state.floors - 1) + " · " + moneyFmt(c) + ". Coloca habitaciones y un ascensor en el jardín.");
    save();
  }

  function pointerCell(ev) {
    const r = canvas.getBoundingClientRect();
    return screenToWorld(ev.clientX - r.left, ev.clientY - r.top);
  }

  function onDown(ev) {
    if (state.tool === "pan" || ev.button === 1 || ev.button === 2 || ev.shiftKey) {
      state.panning = true;
      state.panLast = { x: ev.clientX, y: ev.clientY };
      canvas.style.cursor = "grabbing";
      ev.preventDefault();
      return;
    }
    if (ev.button !== 0) return;
    const c = pointerCell(ev);
    state.drag = { start: c, cur: c, px: ev.clientX, py: ev.clientY, moved: false, painting: state.tool === "paint" || state.tool === "erase" };
    if (state.tool === "paint") {
      const bill = { changes: [], spent: 0, n: 0 };
      placeOne(state.floor, c.x, c.y, state.brush, bill);
      state.drag.bill = bill;
    } else if (state.tool === "erase") {
      const bill = { changes: [], spent: 0, n: 0 };
      eraseOne(state.floor, c.x, c.y, bill);
      state.drag.bill = bill;
    }
  }

  function onMove(ev) {
    if (state.panning && state.panLast) {
      const s = cellSize();
      state.camera.x -= (ev.clientX - state.panLast.x) / s;
      state.camera.y -= (ev.clientY - state.panLast.y) / s;
      state.panLast = { x: ev.clientX, y: ev.clientY };
      return;
    }
    if (!state.drag) return;
    const c = pointerCell(ev);
    if (c.x !== state.drag.cur.x || c.y !== state.drag.cur.y) state.drag.moved = true;
    state.drag.cur = c;
    state.drag.px = ev.clientX;
    state.drag.py = ev.clientY;
    if (state.drag.painting) {
      const bill = state.drag.bill;
      if (state.tool === "paint") placeOne(state.floor, c.x, c.y, state.brush, bill);
      else eraseOne(state.floor, c.x, c.y, bill);
    }
  }

  function onUp() {
    if (state.panning) {
      state.panning = false;
      state.panLast = null;
      canvas.style.cursor = state.tool === "pan" ? "grab" : "crosshair";
      return;
    }
    if (!state.drag) return;
    if (state.drag.painting) {
      pushUndo(state.drag.bill);
      recount();
    } else if (state.tool === "rect" || state.tool === "wing" || state.tool === "erase") {
      applyRect(state.drag.start, state.drag.cur, state.tool);
    }
    state.drag = null;
  }

  function bind() {
    canvas.addEventListener("mousedown", onDown);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    canvas.addEventListener("contextmenu", (e) => e.preventDefault());
    canvas.addEventListener(
      "wheel",
      (e) => {
        e.preventDefault();
        const old = state.camera.z;
        state.camera.z = Math.max(0.18, Math.min(2.4, state.camera.z * (e.deltaY > 0 ? 0.9 : 1.1)));
        if (state.camera.z === old) return;
      },
      { passive: false }
    );
    mini.addEventListener("mousedown", (e) => {
      const r = mini.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width) * W;
      const y = ((e.clientY - r.top) / r.height) * H;
      state.camera.x = x;
      state.camera.y = y;
    });
    window.addEventListener("keydown", (e) => {
      if (e.target && e.target.tagName === "INPUT") return;
      state.keys.add(e.code);
      if (e.code === "KeyZ" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        undo();
      }
      if (e.key === "1") state.tool = "paint";
      if (e.key === "2") state.tool = "rect";
      if (e.key === "3") state.tool = "wing";
      if (e.key === "4") state.tool = "erase";
      if (e.key === "5" || e.key === "h" || e.key === "H") state.tool = "pan";
      if (e.key === "PageUp" || e.key === "]") state.floor = Math.min(state.floors - 1, state.floor + 1);
      if (e.key === "PageDown" || e.key === "[") state.floor = Math.max(0, state.floor - 1);
      if (e.key === " " || e.key === "p" || e.key === "P") {
        e.preventDefault();
        state.speed = state.speed === 0 ? 1 : 0;
      }
      syncTools();
    });
    window.addEventListener("keyup", (e) => {
      state.keys.delete(e.code);
    });
    document.querySelectorAll(".tool").forEach((b) => {
      b.onclick = () => {
        state.tool = b.dataset.tool;
        syncTools();
      };
    });
    document.querySelectorAll(".speed button").forEach((b) => {
      b.onclick = () => {
        state.speed = Number(b.dataset.speed);
        syncTools();
      };
    });
    document.getElementById("btn-floor-up").onclick = () => {
      state.floor = Math.min(state.floors - 1, state.floor + 1);
    };
    document.getElementById("btn-floor-down").onclick = () => {
      state.floor = Math.max(0, state.floor - 1);
    };
    document.getElementById("btn-add-floor").onclick = addFloor;
    document.getElementById("btn-undo").onclick = undo;
    document.getElementById("btn-help").onclick = () => (document.getElementById("help").hidden = false);
    document.getElementById("btn-close-help").onclick = () => (document.getElementById("help").hidden = true);
    document.getElementById("btn-save").onclick = () => {
      save();
      toast("Partida guardada en este navegador.");
    };
    document.getElementById("btn-export").onclick = () => {
      const blob = new Blob([JSON.stringify(serialize())], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = (state.name || "costa-aurora") + ".json";
      a.click();
    };
    document.getElementById("import-file").onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          hydrate(JSON.parse(reader.result));
          save();
          toast("Partida cargada.");
        } catch (_) {
          toast("Ese archivo no es una partida válida.");
        }
      };
      reader.readAsText(file);
    };
    document.getElementById("resort-name").onchange = (e) => {
      state.name = e.target.value.slice(0, 28) || "Costa Aurora";
    };
    window.addEventListener("resize", resize);
  }

  function showGame() {
    document.getElementById("title-screen").hidden = true;
    document.getElementById("game").hidden = false;
    resize();
    renderCats();
    renderPalette();
    syncTools();
    if (!state.seenHelp) {
      document.getElementById("help").hidden = false;
      state.seenHelp = true;
    }
    requestAnimationFrame(loop);
  }

  document.getElementById("btn-new").onclick = () => {
    newGame();
    showGame();
  };
  const cont = document.getElementById("btn-continue");
  if (localStorage.getItem(SAVE_KEY)) {
    cont.hidden = false;
    cont.onclick = () => {
      if (!load()) newGame();
      showGame();
    };
  }
  bind();
})();
