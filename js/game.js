(() => {
  "use strict";

  const CHUNK = 32;
  const MAX_FLOORS = 60;
  const TILE_M = 2;
  const START_MONEY = 500000;
  const SAVE_KEY = "costa-aurora-save-v2";
  const MAX_W = 4000;
  const MAX_H = 2800;

  const ZONES = [
    { id: 0, name: "Ninguna", tint: null },
    { id: 1, name: "Familiar", tint: "rgba(80,180,80,.28)" },
    { id: 2, name: "Adultos", tint: "rgba(160,60,90,.28)" },
    { id: 3, name: "Lujo", tint: "rgba(212,175,55,.32)" },
    { id: 4, name: "Todo incl.", tint: "rgba(60,160,200,.28)" },
    { id: 5, name: "Spa", tint: "rgba(220,140,190,.28)" },
  ];

  const CATS = [
    { id: "hab", name: "Habitaciones" },
    { id: "serv", name: "Servicios" },
    { id: "ocio", name: "Ocio" },
    { id: "ext", name: "Exterior" },
    { id: "infra", name: "Infra" },
  ];

  const SUBS = [
    { id: "all", name: "Todas" },
    { id: "eco", name: "Económica" },
    { id: "std", name: "Estándar" },
    { id: "sup", name: "Superior" },
    { id: "fam", name: "Familiar" },
    { id: "suite", name: "Suites" },
    { id: "lujo", name: "Lujo" },
  ];

  const T = [];
  const BY_KEY = {};

  function col(h, l) {
    return "hsl(" + h + " 58% " + l + "%)";
  }

  function add(o) {
    o.id = T.length;
    o.minW = o.minW || 1;
    o.minH = o.minH || 1;
    o.maxW = o.maxW || 20;
    o.maxH = o.maxH || 16;
    o.base = o.base || 0;
    o.tile = o.tile || 0;
    o.rate = o.rate || 0;
    o.rt = o.rt || 0;
    o.amenity = o.amenity || 0;
    o.room = o.room || 0;
    o.color2 = o.color2 || col(0, 30);
    T.push(o);
    BY_KEY[o.key] = o;
    return o;
  }

  const SUB_E = {
    eco: { base: 380, tile: 130, rate: 36, rt: 15, minW: 2, minH: 2, maxW: 4, maxH: 3 },
    std: { base: 720, tile: 165, rate: 72, rt: 20, minW: 3, minH: 2, maxW: 5, maxH: 4 },
    sup: { base: 1500, tile: 220, rate: 135, rt: 28, minW: 3, minH: 2, maxW: 6, maxH: 4 },
    fam: { base: 1700, tile: 195, rate: 145, rt: 24, minW: 4, minH: 3, maxW: 8, maxH: 6 },
    suite: { base: 3800, tile: 270, rate: 290, rt: 40, minW: 4, minH: 3, maxW: 10, maxH: 7 },
    lujo: { base: 8500, tile: 350, rate: 540, rt: 55, minW: 5, minH: 4, maxW: 14, maxH: 10 },
  };

  [
    ["ind", "Individual", "eco", 205],
    ["ind_eco", "Individual económica", "eco", 200],
    ["camarote", "Camarote", "eco", 192],
    ["interior", "Habitación interior", "eco", 188],
    ["comp", "Compartida", "eco", 182],
    ["literas", "Literas", "eco", 176],
    ["doble", "Doble", "std", 212],
    ["twin", "Twin", "std", 218],
    ["matrimonio", "Matrimonial", "std", 328],
    ["estandar", "Estándar", "std", 208],
    ["est_jard", "Estándar jardín", "std", 142],
    ["triple", "Triple", "std", 28],
    ["cuadruple", "Cuádruple", "std", 32],
    ["balcon", "Con balcón", "std", 214],
    ["patio", "Patio interior", "std", 148],
    ["accesible", "Accesible", "std", 165],
    ["longstay", "Estancia larga", "std", 172],
    ["superior", "Superior", "sup", 196],
    ["sup_mar", "Superior vista mar", "sup", 199],
    ["deluxe", "Deluxe", "sup", 268],
    ["dlx_mar", "Deluxe vista mar", "sup", 274],
    ["premium", "Premium", "sup", 282],
    ["exec", "Executive", "sup", 228],
    ["club", "Habitación Club", "sup", 234],
    ["business", "Business", "sup", 222],
    ["terraza", "Con terraza", "sup", 216],
    ["panoramica", "Panorámica", "sup", 202],
    ["familiar", "Familiar", "fam", 38],
    ["fam_g", "Familiar grande", "fam", 44],
    ["conectadas", "Conectadas", "fam", 50],
    ["kids_suite", "Kids suite", "fam", 55],
    ["bung_fam", "Bungalow familiar", "fam", 88],
    ["apt1", "Apartamento 1 hab", "fam", 92],
    ["apt2", "Apartamento 2 hab", "fam", 98],
    ["estudio", "Estudio", "fam", 302],
    ["junior", "Junior suite", "suite", 308],
    ["suite", "Suite", "suite", 318],
    ["suite_dlx", "Suite deluxe", "suite", 324],
    ["nupcial", "Suite nupcial", "suite", 338],
    ["suite_fam", "Suite familiar", "suite", 346],
    ["suite_exec", "Suite ejecutiva", "suite", 248],
    ["romantica", "Romántica", "suite", 334],
    ["suite_spa", "Suite spa", "suite", 312],
    ["loft", "Loft", "suite", 258],
    ["duplex", "Dúplex", "suite", 262],
    ["real", "Suite real", "suite", 46],
    ["presidencial", "Presidencial", "lujo", 48],
    ["penthouse", "Penthouse", "lujo", 52],
    ["atico", "Ático", "lujo", 58],
    ["villa", "Villa", "lujo", 72],
    ["villa_pisc", "Villa con piscina", "lujo", 78],
    ["villa_playa", "Villa playa", "lujo", 82],
    ["cabana", "Cabaña", "lujo", 94],
    ["andaluza", "Casa andaluza", "lujo", 14],
    ["riad", "Riad", "lujo", 20],
    ["tatami", "Japonesa tatami", "lujo", 352],
    ["onyx", "Suite ónix", "lujo", 0],
    ["imperial", "Suite imperial", "lujo", 6],
    ["royal_pent", "Royal penthouse", "lujo", 10],
    ["residencia", "Residencia", "lujo", 198],
    ["infinity", "Infinity suite", "lujo", 188],
    ["glamping", "Glamping", "lujo", 105],
    ["yate", "Suite yate", "lujo", 210],
    ["torre", "Torre deluxe", "lujo", 224],
  ].forEach((r) => {
    const e = SUB_E[r[2]];
    const sea = /mar|playa|yate|infinity|panor/i.test(r[1]);
    add({
      key: r[0],
      name: r[1],
      cat: "hab",
      sub: r[2],
      color: col(r[3], 48),
      color2: col(r[3], 36),
      base: e.base * (sea ? 1.12 : 1),
      tile: e.tile,
      rate: e.rate * (sea ? 1.2 : 1),
      rt: e.rt * (sea ? 1.15 : 1),
      minW: e.minW,
      minH: e.minH,
      maxW: e.maxW,
      maxH: e.maxH,
      room: 1,
    });
  });

  [
    ["lobby", "Recepción", "serv", 46, 5000, 220, 0, 0, 4, 3, 10, 6, 3, 0],
    ["rest", "Restaurante", "serv", 24, 6000, 180, 0, 0, 5, 4, 14, 10, 3, 0],
    ["bufe", "Bufé", "serv", 30, 4500, 160, 0, 0, 5, 4, 12, 8, 3, 0],
    ["cafe", "Cafetería", "serv", 28, 2200, 140, 0, 0, 3, 3, 8, 6, 2, 0],
    ["sushi", "Sushi", "serv", 350, 2800, 150, 0, 0, 4, 3, 8, 6, 2, 0],
    ["helado", "Heladería", "serv", 190, 1200, 120, 0, 0, 3, 2, 6, 5, 1, 0],
    ["roomsvc", "Room service", "serv", 20, 1800, 100, 0, 0, 3, 2, 6, 4, 1, 0],
    ["bar", "Bar", "serv", 350, 3500, 140, 0, 0, 3, 3, 10, 6, 2, 0],
    ["kitchen", "Cocina", "serv", 25, 2500, 110, 0, 0, 4, 3, 10, 8, 1, 0],
    ["spa", "Spa", "serv", 330, 8000, 200, 0, 0, 6, 4, 16, 12, 4, 0],
    ["gym", "Gimnasio", "serv", 0, 4000, 130, 0, 0, 4, 4, 12, 8, 2, 0],
    ["shop", "Boutique", "serv", 350, 2500, 120, 0, 0, 3, 3, 8, 6, 1, 0],
    ["disco", "Discoteca", "serv", 280, 9000, 160, 0, 0, 6, 5, 16, 12, 4, 0],
    ["clinic", "Clínica", "serv", 155, 3500, 140, 0, 0, 4, 3, 8, 6, 2, 0],
    ["security", "Seguridad", "serv", 220, 1800, 90, 0, 0, 2, 2, 5, 4, 1, 0],
    ["guarderia", "Guardería", "ocio", 45, 3200, 130, 0, 0, 4, 4, 10, 8, 2, 0],
    ["miniclub", "Miniclub", "ocio", 52, 3800, 140, 0, 0, 5, 4, 12, 8, 2, 0],
    ["tobo", "Toboganes", "ocio", 195, 5000, 150, 0, 0, 6, 4, 16, 10, 2, 1],
    ["golf", "Campo de golf", "ocio", 120, 12000, 80, 0, 0, 14, 10, 40, 28, 3, 1],
    ["tenis", "Pista de tenis", "ocio", 90, 2800, 70, 0, 0, 6, 4, 12, 8, 1, 1],
    ["padel", "Pádel", "ocio", 95, 2200, 70, 0, 0, 4, 4, 8, 6, 1, 1],
    ["yoga", "Yoga", "ocio", 160, 1500, 90, 0, 0, 4, 3, 10, 8, 1, 0],
    ["casino", "Casino", "ocio", 48, 14000, 180, 0, 0, 8, 6, 18, 12, 4, 0],
    ["teatro", "Teatro", "ocio", 300, 10000, 160, 0, 0, 8, 6, 16, 12, 3, 0],
    ["cine", "Cine", "ocio", 265, 7000, 150, 0, 0, 6, 5, 14, 10, 2, 0],
    ["congreso", "Sala congresos", "ocio", 210, 8000, 140, 0, 0, 8, 5, 18, 12, 2, 0],
    ["bodas", "Salón de bodas", "ocio", 330, 9000, 150, 0, 0, 8, 6, 16, 12, 3, 0],
    ["pool", "Piscina", "ext", 188, 400, 90, 0, 0, 4, 3, 30, 20, 2, 1],
    ["pool_inf", "Piscina infinita", "ext", 186, 900, 110, 0, 0, 8, 4, 28, 12, 3, 1],
    ["pool_kid", "Piscina infantil", "ext", 184, 500, 85, 0, 0, 4, 4, 12, 10, 2, 1],
    ["jacuzzi", "Jacuzzi", "ext", 200, 1800, 140, 0, 0, 3, 3, 8, 6, 2, 0],
    ["sauna", "Sauna", "ext", 25, 2200, 130, 0, 0, 3, 2, 6, 5, 2, 0],
    ["hammam", "Hammam", "ext", 175, 3500, 140, 0, 0, 4, 3, 10, 8, 2, 0],
    ["palm", "Palmeras", "ext", 140, 80, 40, 0, 0, 1, 1, 6, 6, 1, 1],
    ["garden", "Jardín", "ext", 125, 60, 35, 0, 0, 2, 2, 20, 20, 1, 1],
    ["fountain", "Fuente", "ext", 190, 1800, 80, 0, 0, 2, 2, 6, 6, 2, 1],
    ["beach", "Chiringuito", "ext", 32, 2800, 120, 0, 0, 3, 3, 8, 6, 2, 1],
    ["pier", "Muelle", "ext", 28, 200, 70, 0, 0, 2, 1, 20, 4, 1, 1],
    ["parking", "Parking", "ext", 220, 40, 25, 0, 0, 2, 2, 40, 20, 0, 1],
    ["paseo", "Paseo", "infra", 40, 10, 18, 0, 0, 1, 1, 80, 8, 0, 1],
    ["pasillo", "Pasillo", "infra", 38, 12, 16, 0, 0, 1, 1, 80, 8, 0, 0],
    ["elevator", "Ascensor", "infra", 210, 4000, 200, 0, 0, 2, 2, 3, 3, 0, 0],
    ["stairs", "Escalera", "infra", 30, 1500, 120, 0, 0, 2, 2, 4, 3, 0, 0],
    ["laundry", "Lavandería", "infra", 210, 2200, 90, 0, 0, 4, 3, 10, 8, 1, 0],
    ["storage", "Almacén", "infra", 30, 800, 50, 0, 0, 3, 3, 12, 10, 0, 0],
    ["trash", "Cuarto de basuras", "infra", 20, 400, 40, 0, 0, 2, 2, 5, 4, 0, 0],
    ["machine", "Cuarto de máquinas", "infra", 0, 2500, 80, 0, 0, 4, 3, 10, 8, 0, 0],
  ].forEach((r) => {
    add({
      key: r[0],
      name: r[1],
      cat: r[2],
      color: col(r[3], 48),
      color2: col(r[3], 34),
      base: r[4],
      tile: r[5],
      rate: r[6],
      rt: r[7],
      minW: r[8],
      minH: r[9],
      maxW: r[10],
      maxH: r[11],
      amenity: r[12],
      outdoor: r[13],
      shaft: r[0] === "elevator" || r[0] === "stairs" ? 1 : 0,
      pier: r[0] === "pier" ? 1 : 0,
    });
  });

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
    mapW: 720,
    mapH: 440,
    buildings: [],
    rooms: [],
    chunks: new Map(),
    nextId: 1,
    numSeq: [],
    occupied: 0,
    incomeSum: 0,
    amenityTypes: 0,
    amenityScore: 0,
    lobby: 0,
    elev: 0,
    stars: 1,
    reputation: 55,
    camera: { x: 120, y: 180, z: 0.7 },
    tool: "piece",
    brush: BY_KEY.doble.id,
    cat: "hab",
    sub: "all",
    search: "",
    zone: 1,
    pieceW: 3,
    pieceH: 2,
    drag: null,
    panning: false,
    panLast: null,
    sel: [],
    clip: null,
    undo: [],
    guests: [],
    keys: new Set(),
    simAcc: 0,
    lastTs: 0,
    miniDirty: true,
    fillCursor: 0,
    pending: null,
  };

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
    setTimeout(() => msg.remove(), 4500);
  }

  function chunkKeys(x, y, w, h) {
    const x0 = Math.floor(x / CHUNK);
    const y0 = Math.floor(y / CHUNK);
    const x1 = Math.floor((x + w - 1) / CHUNK);
    const y1 = Math.floor((y + h - 1) / CHUNK);
    const out = [];
    for (let cy = y0; cy <= y1; cy++) for (let cx = x0; cx <= x1; cx++) out.push(cx + ":" + cy);
    return out;
  }

  function addToChunks(b) {
    for (const k of chunkKeys(b.x, b.y, b.w, b.h)) {
      const key = b.floor + ":" + k;
      let arr = state.chunks.get(key);
      if (!arr) {
        arr = [];
        state.chunks.set(key, arr);
      }
      arr.push(b);
    }
  }

  function removeFromChunks(b) {
    for (const k of chunkKeys(b.x, b.y, b.w, b.h)) {
      const key = b.floor + ":" + k;
      const arr = state.chunks.get(key);
      if (!arr) continue;
      const i = arr.indexOf(b);
      if (i >= 0) arr.splice(i, 1);
    }
  }

  function overlaps(b, x, y, w, h) {
    return b.x < x + w && x < b.x + b.w && b.y < y + h && y < b.y + b.h;
  }

  function queryRect(floor, x, y, w, h) {
    const seen = new Set();
    const out = [];
    for (const k of chunkKeys(x, y, w, h)) {
      const arr = state.chunks.get(floor + ":" + k);
      if (!arr) continue;
      for (const b of arr) {
        if (seen.has(b.id) || !overlaps(b, x, y, w, h)) continue;
        seen.add(b.id);
        out.push(b);
      }
    }
    return out;
  }

  function oceanY() {
    return state.mapH - 10;
  }

  function sandY() {
    return state.mapH - 18;
  }

  function terrainAt(x, y) {
    if (y >= oceanY()) return "ocean";
    if (y >= sandY()) return "sand";
    return "grass";
  }

  function seaView(b) {
    return b.y + b.h >= sandY() - 2;
  }

  function hitsOcean(x, y, w, h) {
    return y + h - 1 >= oceanY();
  }

  function inMap(x, y, w, h) {
    return x >= 0 && y >= 0 && x + w <= state.mapW && y + h <= state.mapH;
  }

  function canPlace(type, floor, x, y, w, h) {
    const t = T[type];
    if (!t || !inMap(x, y, w, h)) return false;
    if (w < t.minW || h < t.minH || w > t.maxW || h > t.maxH) return false;
    if (floor > 0 && t.outdoor && !t.shaft) return false;
    if (hitsOcean(x, y, w, h) && !t.pier) return false;
    if (queryRect(floor, x, y, w, h).length) return false;
    return true;
  }

  function costOf(type, w, h) {
    const t = T[type];
    return Math.round(t.base + t.tile * w * h);
  }

  function rateOf(b) {
    const t = T[b.type];
    if (!t.room) return 0;
    let r = t.rate + t.rt * b.w * b.h;
    if (seaView(b)) r *= 1.22;
    if (b.zone === 1) r *= 1.05;
    if (b.zone === 2) r *= 1.08;
    if (b.zone === 3) r *= 1.18;
    if (b.zone === 4) r *= 1.42;
    if (b.zone === 5) r *= 1.12;
    return Math.round(r);
  }

  function nextNum(floor) {
    state.numSeq[floor] = (state.numSeq[floor] || 0) + 1;
    const n = state.numSeq[floor];
    if (floor === 0) return "J-" + String(n).padStart(3, "0");
    return String(floor * 100 + n);
  }

  function insertB(raw) {
    const t = T[raw.type];
    const b = {
      id: state.nextId++,
      type: raw.type,
      floor: raw.floor,
      x: raw.x,
      y: raw.y,
      w: raw.w,
      h: raw.h,
      zone: raw.zone || 0,
      occ: 0,
      num: t.room ? raw.num || nextNum(raw.floor) : "",
    };
    state.buildings.push(b);
    if (t.room) state.rooms.push(b);
    addToChunks(b);
    if (t.shaft && raw.floor === 0) {
      for (let f = 1; f < state.floors; f++) {
        if (canPlace(raw.type, f, raw.x, raw.y, raw.w, raw.h)) {
          insertB({ type: raw.type, floor: f, x: raw.x, y: raw.y, w: raw.w, h: raw.h, zone: 0 });
        }
      }
    }
    state.miniDirty = true;
    return b;
  }

  function removeB(b) {
    removeFromChunks(b);
    const i = state.buildings.indexOf(b);
    if (i >= 0) state.buildings.splice(i, 1);
    const r = state.rooms.indexOf(b);
    if (r >= 0) {
      if (b.occ) {
        state.occupied--;
        state.incomeSum -= rateOf(b);
      }
      state.rooms.splice(r, 1);
    }
    state.miniDirty = true;
  }

  function recount() {
    let lobby = 0;
    let elev = 0;
    let score = 0;
    const types = new Set();
    for (const b of state.buildings) {
      const t = T[b.type];
      if (t.key === "lobby") lobby++;
      if (t.key === "elevator") elev++;
      if (t.amenity) {
        score += t.amenity;
        types.add(t.key);
      }
    }
    state.lobby = lobby;
    state.elev = elev;
    state.amenityScore = score;
    state.amenityTypes = types.size;
    let stars = 1;
    const rooms = state.rooms.length;
    if (lobby && rooms >= 8) stars = 1;
    if (lobby && rooms >= 25 && types.size >= 3) stars = 2;
    if (lobby && rooms >= 80 && types.size >= 6) stars = 3;
    if (lobby && rooms >= 250 && types.size >= 10) stars = 4;
    if (lobby && rooms >= 800 && types.size >= 14 && elev) stars = 5;
    state.stars = stars;
  }

  function occupancyTarget() {
    if (!state.lobby) return 0;
    let d = 0.36 + state.stars * 0.1 + state.amenityTypes * 0.015 + state.reputation / 500;
    return Math.max(0.25, Math.min(0.97, d));
  }

  function clampSize(t) {
    state.pieceW = Math.max(t.minW, Math.min(t.maxW, state.pieceW));
    state.pieceH = Math.max(t.minH, Math.min(t.maxH, state.pieceH));
  }

  function rect(a, b) {
    const x0 = Math.max(0, Math.min(a.x, b.x));
    const y0 = Math.max(0, Math.min(a.y, b.y));
    const x1 = Math.min(state.mapW - 1, Math.max(a.x, b.x));
    const y1 = Math.min(state.mapH - 1, Math.max(a.y, b.y));
    return { x0, y0, x1, y1, w: x1 - x0 + 1, h: y1 - y0 + 1 };
  }

  function planPiece(R) {
    const t = T[state.brush];
    let w = Math.max(t.minW, Math.min(t.maxW, R.w));
    let h = Math.max(t.minH, Math.min(t.maxH, R.h));
    let x = R.x0;
    let y = R.y0;
    if (x + w > state.mapW) x = state.mapW - w;
    if (y + h > state.mapH) y = state.mapH - h;
    return [{ type: t.id, x, y, w, h, floor: state.floor, zone: 0 }];
  }

  function planFill(R, withHall) {
    const t = T[state.brush];
    clampSize(t);
    const rw = state.pieceW;
    const rh = state.pieceH;
    const gap = withHall ? 1 : 0;
    const pathId = state.floor === 0 ? BY_KEY.paseo.id : BY_KEY.pasillo.id;
    const items = [];
    for (let y = R.y0; y + rh - 1 <= R.y1; y += rh + gap) {
      if (withHall && y > R.y0) {
        items.push({ type: pathId, x: R.x0, y: y - gap, w: R.w, h: 1, floor: state.floor, zone: 0 });
      }
      for (let x = R.x0; x + rw - 1 <= R.x1; x += rw) {
        items.push({ type: t.id, x, y, w: rw, h: rh, floor: state.floor, zone: 0 });
      }
    }
    return items;
  }

  function planWing(R) {
    const t = T[state.brush].room ? T[state.brush] : BY_KEY.doble;
    clampSize(t);
    const rw = state.pieceW;
    const rh = state.pieceH;
    const pathId = state.floor === 0 ? BY_KEY.paseo.id : BY_KEY.pasillo.id;
    const items = [];
    const wide = R.w >= R.h;
    if (wide) {
      const mid = (R.y0 + R.y1) >> 1;
      items.push({ type: pathId, x: R.x0, y: mid, w: R.w, h: 1, floor: state.floor, zone: 0 });
      for (let y = mid - rh; y >= R.y0; y -= rh) {
        for (let x = R.x0; x + rw - 1 <= R.x1; x += rw) items.push({ type: t.id, x, y, w: rw, h: rh, floor: state.floor, zone: 0 });
      }
      for (let y = mid + 1; y + rh - 1 <= R.y1; y += rh) {
        for (let x = R.x0; x + rw - 1 <= R.x1; x += rw) items.push({ type: t.id, x, y, w: rw, h: rh, floor: state.floor, zone: 0 });
      }
    } else {
      const mid = (R.x0 + R.x1) >> 1;
      items.push({ type: pathId, x: mid, y: R.y0, w: 1, h: R.h, floor: state.floor, zone: 0 });
      for (let x = mid - rw; x >= R.x0; x -= rw) {
        for (let y = R.y0; y + rh - 1 <= R.y1; y += rh) items.push({ type: t.id, x, y, w: rw, h: rh, floor: state.floor, zone: 0 });
      }
      for (let x = mid + 1; x + rw - 1 <= R.x1; x += rw) {
        for (let y = R.y0; y + rh - 1 <= R.y1; y += rh) items.push({ type: t.id, x, y, w: rw, h: rh, floor: state.floor, zone: 0 });
      }
    }
    return items;
  }

  function summarize(items) {
    let cost = 0;
    let n = 0;
    let rooms = 0;
    let day = 0;
    let ok = 0;
    const valid = [];
    for (const it of items) {
      if (!canPlace(it.type, it.floor, it.x, it.y, it.w, it.h)) continue;
      const c = costOf(it.type, it.w, it.h);
      cost += c;
      ok++;
      valid.push(it);
      if (T[it.type].room) {
        rooms++;
        day += rateOf(it);
      }
      n++;
    }
    return { cost, n, rooms, day, valid };
  }

  function applyItems(items) {
    const bill = { added: [], money: 0 };
    let spent = 0;
    for (const it of items) {
      if (!canPlace(it.type, it.floor, it.x, it.y, it.w, it.h)) continue;
      const c = costOf(it.type, it.w, it.h);
      if (state.money < c) break;
      state.money -= c;
      spent += c;
      bill.added.push(insertB(it));
    }
    bill.money = spent;
    if (bill.added.length) {
      state.undo.push(bill);
      if (state.undo.length > 20) state.undo.shift();
    }
    recount();
    return bill;
  }

  function undo() {
    const bill = state.undo.pop();
    if (!bill) return;
    if (bill.kind === "erase") {
      state.money -= bill.money;
      for (const snap of bill.removed) insertB(snap);
    } else if (bill.kind === "zone") {
      for (const z of bill.prev) {
        const b = state.buildings.find((x) => x.id === z.id);
        if (b) b.zone = z.zone;
      }
    } else {
      state.money += bill.money;
      for (const b of bill.added) removeB(b);
    }
    recount();
    toast("Deshecho");
    refreshInspector();
  }

  function demolish(list) {
    const bill = { kind: "erase", removed: [], money: 0 };
    for (const b of list) {
      const refund = Math.round(costOf(b.type, b.w, b.h) * 0.4);
      bill.removed.push({ type: b.type, floor: b.floor, x: b.x, y: b.y, w: b.w, h: b.h, zone: b.zone, num: b.num });
      state.money += refund;
      bill.money += refund;
      removeB(b);
    }
    if (bill.removed.length) {
      state.undo.push(bill);
      if (state.undo.length > 20) state.undo.shift();
    }
    recount();
    state.sel = [];
    refreshInspector();
  }

  function copySel() {
    if (!state.sel.length) {
      toast("Selecciona antes un ala o unas habitaciones.");
      return;
    }
    const bs = state.sel;
    const x0 = Math.min(...bs.map((b) => b.x));
    const y0 = Math.min(...bs.map((b) => b.y));
    const x1 = Math.max(...bs.map((b) => b.x + b.w));
    const y1 = Math.max(...bs.map((b) => b.y + b.h));
    state.clip = {
      w: x1 - x0,
      h: y1 - y0,
      items: bs.map((b) => ({ type: b.type, dx: b.x - x0, dy: b.y - y0, w: b.w, h: b.h, zone: b.zone })),
    };
    toast("Copiado: " + bs.length + " piezas. Cambia de planta y usa Pegar.");
    state.tool = "paste";
    syncTools();
  }

  function planPaste(x, y) {
    if (!state.clip) return [];
    return state.clip.items.map((it) => ({
      type: it.type,
      x: x + it.dx,
      y: y + it.dy,
      w: it.w,
      h: it.h,
      floor: state.floor,
      zone: it.zone,
    }));
  }

  function paintZone(list, zone) {
    const bill = { kind: "zone", prev: list.map((b) => ({ id: b.id, zone: b.zone })) };
    for (const b of list) b.zone = zone;
    state.undo.push(bill);
    recount();
    toast("Zona " + ZONES[zone].name + " · " + list.length + " piezas");
  }

  function expandMap(dir, amt) {
    const addW = dir === "e" || dir === "w" ? amt : 0;
    const addH = dir === "n" || dir === "s" ? amt : 0;
    if (state.mapW + addW > MAX_W || state.mapH + addH > MAX_H) {
      toast("El mapa ya es enorme (máximo " + MAX_W + " × " + MAX_H + ").");
      return;
    }
    const area = dir === "e" || dir === "w" ? amt * state.mapH : amt * state.mapW;
    const cost = 6000 + area * 2;
    if (state.money < cost) {
      toast("Necesitas " + moneyFmt(cost) + " para ampliar.");
      return;
    }
    state.money -= cost;
    if (dir === "w") {
      for (const b of state.buildings) b.x += amt;
      state.chunks = new Map();
      for (const b of state.buildings) addToChunks(b);
      state.camera.x += amt;
      state.mapW += amt;
    } else if (dir === "e") state.mapW += amt;
    else if (dir === "n") {
      for (const b of state.buildings) b.y += amt;
      state.chunks = new Map();
      for (const b of state.buildings) addToChunks(b);
      state.camera.y += amt;
      state.mapH += amt;
    } else state.mapH += amt;
    state.miniDirty = true;
    toast("Solar " + state.mapW + " × " + state.mapH + " · " + moneyFmt(cost));
    document.getElementById("expand").hidden = true;
  }

  function cellSize() {
    return 18 * state.camera.z;
  }

  function worldToScreen(x, y) {
    const s = cellSize();
    return { x: (x - state.camera.x) * s + canvas.width / 2, y: (y - state.camera.y) * s + canvas.height / 2 };
  }

  function screenToWorld(px, py) {
    const s = cellSize();
    return {
      x: Math.floor((px - canvas.width / 2) / s + state.camera.x),
      y: Math.floor((py - canvas.height / 2) / s + state.camera.y),
    };
  }

  function previewItems() {
    if (!state.drag || state.drag.painting === false && !state.drag.start) return [];
    if (state.tool === "paste" && state.clip && state.drag) return planPaste(state.drag.cur.x, state.drag.cur.y);
    if (!state.drag || !state.drag.start) return [];
    const R = rect(state.drag.start, state.drag.cur);
    if (state.tool === "piece") return planPiece(R);
    if (state.tool === "fill") return planFill(R, true);
    if (state.tool === "wing") return planWing(R);
    return [];
  }

  function draw() {
    const w = canvas.width;
    const h = canvas.height;
    const s = cellSize();
    const hour = (state.minute / 60) % 24;
    const night = hour < 6 || hour >= 21;
    ctx.fillStyle = state.floor === 0 ? (night ? "#061018" : "#12384a") : "#121820";
    ctx.fillRect(0, 0, w, h);

    const tl = screenToWorld(0, 0);
    const br = screenToWorld(w, h);
    const x0 = Math.max(0, tl.x - 1);
    const y0 = Math.max(0, tl.y - 1);
    const x1 = Math.min(state.mapW - 1, br.x + 1);
    const y1 = Math.min(state.mapH - 1, br.y + 1);

    if (state.floor === 0) {
      for (let y = y0; y <= y1; y++) {
        const terr = terrainAt(0, y);
        ctx.fillStyle = terr === "ocean" ? ((y & 1) ? "#1b7fa8" : "#125e80") : terr === "sand" ? ((y & 1) ? "#e6d09a" : "#cbb37a") : ((y & 1) ? "#3f8f4e" : "#2f6e3c");
        const p = worldToScreen(x0, y);
        ctx.fillRect(p.x, p.y, (x1 - x0 + 1) * s + 1, s + 0.7);
      }
    } else {
      ctx.fillStyle = "#1a222c";
      const p = worldToScreen(x0, y0);
      ctx.fillRect(p.x, p.y, (x1 - x0 + 1) * s + 1, (y1 - y0 + 1) * s + 1);
    }

    const vis = queryRect(state.floor, x0, y0, x1 - x0 + 1, y1 - y0 + 1);
    const showNum = s >= 12;
    const selIds = new Set(state.sel.map((b) => b.id));
    for (const b of vis) {
      const t = T[b.type];
      const p = worldToScreen(b.x, b.y);
      ctx.fillStyle = t.color;
      ctx.fillRect(p.x, p.y, b.w * s - 0.6, b.h * s - 0.6);
      ctx.fillStyle = "rgba(255,255,255,0.12)";
      ctx.fillRect(p.x, p.y, b.w * s - 0.6, Math.max(1, s * 0.12));
      if (b.zone) {
        ctx.fillStyle = ZONES[b.zone].tint;
        ctx.fillRect(p.x, p.y, b.w * s - 0.6, b.h * s - 0.6);
      }
      if (t.room && b.occ) {
        ctx.fillStyle = "rgba(255,255,255,0.28)";
        ctx.fillRect(p.x + 2, p.y + 2, 5, 5);
      }
      if (selIds.has(b.id)) {
        ctx.strokeStyle = "#e0c070";
        ctx.lineWidth = 2;
        ctx.strokeRect(p.x, p.y, b.w * s - 0.6, b.h * s - 0.6);
      }
      if (showNum && t.room && b.num) {
        ctx.fillStyle = "#fff";
        ctx.font = Math.max(8, Math.min(13, s * 0.42)) + "px Segoe UI,sans-serif";
        ctx.fillText(b.num, p.x + 3, p.y + Math.min(b.h * s - 2, s * 0.55));
      }
    }

    let ghost = [];
    if (state.tool === "paste" && state.clip) {
      const cur = state.drag ? state.drag.cur : null;
      if (cur) ghost = planPaste(cur.x, cur.y);
    } else if (state.drag && state.drag.start && (state.tool === "piece" || state.tool === "fill" || state.tool === "wing")) {
      ghost = previewItems();
    }
    if (ghost.length) {
      const cap = ghost.length > 800 ? ghost.slice(0, 800) : ghost;
      ctx.globalAlpha = 0.45;
      for (const it of cap) {
        const t = T[it.type];
        const p = worldToScreen(it.x, it.y);
        ctx.fillStyle = t.color;
        ctx.fillRect(p.x, p.y, it.w * s, it.h * s);
      }
      ctx.globalAlpha = 1;
      const sum = summarize(ghost);
        const box = document.getElementById("cost-preview");
      box.hidden = false;
      const lines = [];
      if (state.tool === "piece" && ghost[0]) {
        lines.push(T[ghost[0].type].name);
        lines.push(ghost[0].w + " × " + ghost[0].h + "  ·  " + ghost[0].w * TILE_M + " × " + ghost[0].h * TILE_M + " m  ·  " + ghost[0].w * ghost[0].h * TILE_M * TILE_M + " m²");
      } else {
        lines.push(sum.rooms ? sum.rooms + " habitaciones · " + sum.n + " piezas" : sum.n + " piezas");
        if (ghost[0] && T[state.brush].room) lines.push("Cada una " + state.pieceW + " × " + state.pieceH + "  ·  " + state.pieceW * TILE_M + " × " + state.pieceH * TILE_M + " m");
      }
      lines.push("Coste " + moneyFmt(sum.cost));
      if (sum.day) lines.push("Si se llenan: +" + moneyFmt(sum.day) + "/día");
      if (state.money < sum.cost) lines.push("No alcanza el dinero");
      box.textContent = lines.join("\n");
      if (state.drag) {
        box.style.left = Math.min(innerWidth - 260, (state.drag.px || 40) + 16) + "px";
        box.style.top = (state.drag.py || 80) + 16 + "px";
      }
    } else if (state.drag && (state.tool === "erase" || state.tool === "select" || state.tool === "zone") && state.drag.start) {
      const R = rect(state.drag.start, state.drag.cur);
      const a = worldToScreen(R.x0, R.y0);
      ctx.strokeStyle = "#e0c070";
      ctx.strokeRect(a.x, a.y, R.w * s, R.h * s);
      document.getElementById("cost-preview").hidden = true;
    } else {
      document.getElementById("cost-preview").hidden = true;
    }

    for (const g of state.guests) {
      if (g.floor !== state.floor) continue;
      const p = worldToScreen(g.x, g.y);
      if (p.x < -8 || p.y < -8 || p.x > w || p.y > h) continue;
      ctx.fillStyle = "hsl(" + g.hue + " 70% 70%)";
      ctx.beginPath();
      ctx.arc(p.x, p.y, Math.max(2, s * 0.16), 0, 6.3);
      ctx.fill();
    }

    if (night) {
      ctx.fillStyle = "rgba(4,10,24,0.28)";
      ctx.fillRect(0, 0, w, h);
    }
    if (state.miniDirty) drawMinimap();
    drawHud();
  }

  function drawMinimap() {
    state.miniDirty = false;
    const mw = mini.width;
    const mh = mini.height;
    mctx.fillStyle = "#0a1824";
    mctx.fillRect(0, 0, mw, mh);
    const sx = mw / state.mapW;
    const sy = mh / state.mapH;
    if (state.floor === 0) {
      mctx.fillStyle = "#2f6e3c";
      mctx.fillRect(0, 0, mw, sandY() * sy);
      mctx.fillStyle = "#cbb37a";
      mctx.fillRect(0, sandY() * sy, mw, (oceanY() - sandY()) * sy);
      mctx.fillStyle = "#125e80";
      mctx.fillRect(0, oceanY() * sy, mw, mh);
    }
    const n = state.buildings.length;
    const step = n > 25000 ? Math.ceil(n / 12000) : 1;
    for (let i = 0; i < n; i += step) {
      const b = state.buildings[i];
      if (b.floor !== state.floor) continue;
      mctx.fillStyle = T[b.type].color;
      mctx.fillRect(b.x * sx, b.y * sy, Math.max(1, b.w * sx), Math.max(1, b.h * sy));
    }
    const s = cellSize();
    const vw = canvas.width / s;
    const vh = canvas.height / s;
    mctx.strokeStyle = "#e0c070";
    mctx.strokeRect((state.camera.x - vw / 2) * sx, (state.camera.y - vh / 2) * sy, vw * sx, vh * sy);
  }

  function clock() {
    const hh = String((state.minute / 60) | 0).padStart(2, "0");
    const mm = String(state.minute % 60).padStart(2, "0");
    return "Día " + state.day + " · " + hh + ":" + mm;
  }

  function drawHud() {
    document.getElementById("ui-money").textContent = moneyFmt(state.money);
    document.getElementById("ui-day").textContent = clock();
    document.getElementById("ui-guests").textContent = state.occupied + " / " + state.rooms.length;
    document.getElementById("ui-rooms").textContent = String(state.rooms.length);
    const occ = state.rooms.length ? Math.round((100 * state.occupied) / state.rooms.length) : 0;
    document.getElementById("ui-occ").textContent = !state.lobby && state.rooms.length ? "Sin recepción" : occ + "%";
    document.getElementById("stars").innerHTML =
      "<span>" + "★".repeat(state.stars) + '</span><span style="opacity:.22">' + "★".repeat(5 - state.stars) + "</span>";
    const fl = state.floor === 0 ? "Jardín · Planta 0" : "Planta " + state.floor;
    document.getElementById("floor-label").textContent = fl + " / " + (state.floors - 1) + " · " + state.mapW + "×" + state.mapH;
    document.getElementById("size-label").textContent = state.pieceW + " × " + state.pieceH;
  }

  function fillRooms(n, occupy) {
    const rooms = state.rooms;
    if (!rooms.length) return;
    let i = state.fillCursor % rooms.length;
    let seen = 0;
    while (n > 0 && seen < rooms.length) {
      const b = rooms[i];
      const elevOk = b.floor === 0 || state.elev;
      if (occupy && !b.occ && elevOk) {
        b.occ = 1;
        state.occupied++;
        state.incomeSum += rateOf(b);
        n--;
      } else if (!occupy && b.occ) {
        b.occ = 0;
        state.occupied--;
        state.incomeSum -= rateOf(b);
        n--;
      }
      i = (i + 1) % rooms.length;
      seen++;
    }
    state.fillCursor = i;
  }

  function sim(dt) {
    const k = state.keys;
    const pan = 22 * dt / Math.max(0.2, state.camera.z);
    if (k.has("KeyW") || k.has("ArrowUp")) state.camera.y -= pan;
    if (k.has("KeyS") || k.has("ArrowDown")) state.camera.y += pan;
    if (k.has("KeyA") || k.has("ArrowLeft")) state.camera.x -= pan;
    if (k.has("KeyD") || k.has("ArrowRight")) state.camera.x += pan;
    if (state.speed === 0) return;
    state.simAcc += dt * state.speed;
    while (state.simAcc >= 0.25) {
      state.simAcc -= 0.25;
      tick();
    }
  }

  function tick() {
    state.minute += 3;
    if (state.minute >= 24 * 60) {
      state.minute -= 24 * 60;
      state.day++;
      endOfDay();
    }
    const cap = state.rooms.length;
    if (!cap) return;
    const want = Math.floor(cap * occupancyTarget());
    if (state.occupied < want) fillRooms(Math.min(40 + ((cap / 80) | 0), want - state.occupied), true);
    else if (state.occupied > want) fillRooms(Math.min(20, state.occupied - want), false);
    const need = Math.min(80, 8 + ((state.occupied / 80) | 0));
    while (state.guests.length < need) {
      state.guests.push({
        x: 10 + Math.random() * (state.mapW - 20),
        y: 10 + Math.random() * (state.mapH - 20),
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        hue: (Math.random() * 360) | 0,
        floor: state.floor,
      });
    }
    if (state.guests.length > need) state.guests.length = need;
    for (const g of state.guests) {
      g.x += g.vx * 0.2;
      g.y += g.vy * 0.2;
      if (g.x < 2 || g.x > state.mapW - 3) g.vx *= -1;
      if (g.y < 2 || g.y > state.mapH - 12) g.vy *= -1;
    }
  }

  function endOfDay() {
    const income = Math.round(state.incomeSum * (0.85 + state.stars * 0.06));
    const staff = Math.round(state.rooms.length * 8 + state.amenityScore * 6 + state.floors * 50 + (state.buildings.filter((b) => b.zone === 4).length ? state.occupied * 4 : 0));
    const net = income - staff;
    state.money += net;
    if (net > 0) state.reputation = Math.min(100, state.reputation + 0.4);
    else state.reputation = Math.max(10, state.reputation - 0.8);
    recount();
    toast("Cierre del día " + state.day + ": " + (net >= 0 ? "+" : "") + moneyFmt(net) + " (ingresos " + moneyFmt(income) + " − personal " + moneyFmt(staff) + ")");
    if (state.day % 2 === 0) save();
  }

  function serialize() {
    return {
      v: 2,
      name: state.name,
      money: state.money,
      day: state.day,
      minute: state.minute,
      floors: state.floors,
      floor: state.floor,
      mapW: state.mapW,
      mapH: state.mapH,
      nextId: state.nextId,
      numSeq: state.numSeq,
      reputation: state.reputation,
      camera: state.camera,
      b: state.buildings.map((b) => [b.type, b.floor, b.x, b.y, b.w, b.h, b.num || "", b.zone || 0, b.occ || 0]),
    };
  }

  function hydrate(data) {
    state.name = data.name || "Costa Aurora";
    state.money = data.money;
    state.day = data.day;
    state.minute = data.minute;
    state.floors = data.floors;
    state.floor = data.floor || 0;
    state.mapW = data.mapW || 720;
    state.mapH = data.mapH || 440;
    state.nextId = data.nextId || 1;
    state.numSeq = data.numSeq || [];
    state.reputation = data.reputation ?? 55;
    state.camera = data.camera || state.camera;
    state.buildings = [];
    state.rooms = [];
    state.chunks = new Map();
    state.occupied = 0;
    state.incomeSum = 0;
    state.guests = [];
    state.undo = [];
    state.sel = [];
    for (const row of data.b || []) {
      const b = {
        id: state.nextId++,
        type: row[0],
        floor: row[1],
        x: row[2],
        y: row[3],
        w: row[4],
        h: row[5],
        num: row[6] || "",
        zone: row[7] || 0,
        occ: row[8] || 0,
      };
      state.buildings.push(b);
      if (T[b.type] && T[b.type].room) {
        state.rooms.push(b);
        if (b.occ) {
          state.occupied++;
          state.incomeSum += rateOf(b);
        }
      }
      addToChunks(b);
    }
    document.getElementById("resort-name").value = state.name;
    recount();
    state.miniDirty = true;
  }

  function save() {
    try {
      const json = JSON.stringify(serialize());
      if (json.length > 4000000) {
        toast("La partida es enorme: usa Descargar (⬇) para no perderla.");
        return;
      }
      localStorage.setItem(SAVE_KEY, json);
    } catch (_) {
      toast("No cupo en el navegador. Descarga la partida con ⬇.");
    }
  }

  function load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return false;
      const data = JSON.parse(raw);
      if (data.v !== 2) return false;
      hydrate(data);
      return true;
    } catch (_) {
      return false;
    }
  }

  function newGame() {
    state.name = "Costa Aurora";
    state.money = START_MONEY;
    state.day = 1;
    state.minute = 8 * 60;
    state.speed = 1;
    state.floors = 1;
    state.floor = 0;
    state.mapW = 720;
    state.mapH = 440;
    state.buildings = [];
    state.rooms = [];
    state.chunks = new Map();
    state.nextId = 1;
    state.numSeq = [];
    state.occupied = 0;
    state.incomeSum = 0;
    state.camera = { x: 140, y: 200, z: 0.65 };
    state.guests = [];
    state.undo = [];
    state.sel = [];
    state.clip = null;
    state.brush = BY_KEY.doble.id;
    state.pieceW = 3;
    state.pieceH = 2;
    document.getElementById("resort-name").value = state.name;
    recount();
    save();
  }

  function addFloor() {
    if (state.floors >= MAX_FLOORS) {
      toast("Máximo " + MAX_FLOORS + " plantas.");
      return;
    }
    const c = 14000 + state.floors * 3500;
    if (state.money < c) {
      toast("Necesitas " + moneyFmt(c) + ".");
      return;
    }
    state.money -= c;
    const f = state.floors;
    state.floors++;
    for (const b of state.buildings.slice()) {
      if (b.floor === 0 && T[b.type].shaft) {
        insertB({ type: b.type, floor: f, x: b.x, y: b.y, w: b.w, h: b.h, zone: 0 });
      }
    }
    state.floor = f;
    recount();
    toast("Planta " + f + " lista. Pega un ala copiada o construye.");
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
        renderSubs();
        renderPalette();
      };
      el.appendChild(b);
    });
  }

  function renderSubs() {
    const el = document.getElementById("subcats");
    el.innerHTML = "";
    if (state.cat !== "hab") return;
    SUBS.forEach((c) => {
      const b = document.createElement("button");
      b.textContent = c.name;
      if (c.id === state.sub) b.classList.add("on");
      b.onclick = () => {
        state.sub = c.id;
        renderSubs();
        renderPalette();
      };
      el.appendChild(b);
    });
  }

  function renderPalette() {
    const pal = document.getElementById("palette");
    pal.innerHTML = "";
    const q = state.search.toLowerCase();
    T.filter((t) => {
      if (t.cat !== state.cat) return false;
      if (state.cat === "hab" && state.sub !== "all" && t.sub !== state.sub) return false;
      if (q && t.name.toLowerCase().indexOf(q) < 0) return false;
      return true;
    }).forEach((t) => {
      const b = document.createElement("button");
      if (t.id === state.brush) b.classList.add("on");
      b.innerHTML = '<span class="swatch" style="background:' + t.color + '"></span><span class="name">' + t.name + '</span><span class="price">' + moneyFmt(costOf(t.id, t.minW, t.minH)) + "</span>";
      b.onclick = () => {
        state.brush = t.id;
        clampSize(t);
        if (state.tool === "erase" || state.tool === "pan") state.tool = "piece";
        syncTools();
        renderPalette();
        drawHud();
      };
      pal.appendChild(b);
    });
  }

  function syncTools() {
    document.querySelectorAll(".tool").forEach((b) => b.classList.toggle("on", b.dataset.tool === state.tool));
    document.querySelectorAll(".speed button").forEach((b) => b.classList.toggle("on", Number(b.dataset.speed) === state.speed));
    document.querySelectorAll("#zone-bar button").forEach((b) => b.classList.toggle("on", Number(b.dataset.zone) === state.zone));
    if (!state.panning) canvas.style.cursor = state.tool === "pan" ? "grab" : "crosshair";
  }

  function hitBuilding(cell) {
    const list = queryRect(state.floor, cell.x, cell.y, 1, 1);
    return list[0] || null;
  }

  function refreshInspector() {
    const box = document.getElementById("inspector");
    if (!state.sel.length) {
      box.hidden = true;
      return;
    }
    box.hidden = false;
    const b = state.sel[0];
    const t = T[b.type];
    document.getElementById("ins-type").textContent = t.name + (state.sel.length > 1 ? " +" + (state.sel.length - 1) : "");
    document.getElementById("ins-meta").textContent =
      b.w + " × " + b.h + " · " + b.w * TILE_M + " × " + b.h * TILE_M + " m · " + (t.room ? moneyFmt(rateOf(b)) + "/día" : moneyFmt(costOf(b.type, b.w, b.h)));
    const num = document.getElementById("ins-num");
    num.value = state.sel.length === 1 && t.room ? b.num : "";
    num.disabled = !(state.sel.length === 1 && t.room);
    document.getElementById("ins-count").textContent = state.sel.length + " seleccionadas · planta " + b.floor;
  }

  function pointerCell(ev) {
    const r = canvas.getBoundingClientRect();
    return screenToWorld(ev.clientX - r.left, ev.clientY - r.top);
  }

  function finishDrag() {
    const d = state.drag;
    if (!d) return;
    const tool = state.tool;
    if (tool === "paste" && state.clip) {
      const items = planPaste(d.cur.x, d.cur.y);
      const sum = summarize(items);
      const go = () => {
        const bill = applyItems(sum.valid);
        toast("Pegado " + bill.added.length + " · " + moneyFmt(bill.money));
      };
      if (sum.rooms > 2500) askConfirm("Vas a pegar " + sum.rooms + " habitaciones por " + moneyFmt(sum.cost) + ".", go);
      else go();
    } else if (tool === "piece" || tool === "fill" || tool === "wing") {
      if (!d.start) return;
      const R = rect(d.start, d.cur);
      if (tool === "piece") {
        state.pieceW = Math.max(T[state.brush].minW, Math.min(T[state.brush].maxW, R.w));
        state.pieceH = Math.max(T[state.brush].minH, Math.min(T[state.brush].maxH, R.h));
      }
      const items = tool === "piece" ? planPiece(R) : tool === "fill" ? planFill(R, true) : planWing(R);
      const sum = summarize(items);
      if (!sum.valid.length) {
        toast("No cabe ahí (solapa otra cosa, el mar, o el tamaño mínimo).");
      } else {
        const go = () => {
          const bill = applyItems(sum.valid);
          toast((sum.rooms ? sum.rooms + " hab. · " : "") + bill.added.length + " piezas · " + moneyFmt(bill.money));
        };
        if (sum.rooms > 2500) askConfirm("Esto coloca " + sum.rooms + " habitaciones (" + sum.n + " piezas) por " + moneyFmt(sum.cost) + ". ¿Seguro?", go);
        else go();
      }
    } else if (tool === "erase" && d.start) {
      const R = rect(d.start, d.cur);
      demolish(queryRect(state.floor, R.x0, R.y0, R.w, R.h));
      toast("Demolido");
    } else if (tool === "select" && d.start) {
      const R = rect(d.start, d.cur);
      if (R.w <= 1 && R.h <= 1) {
        const hit = hitBuilding(d.start);
        state.sel = hit ? [hit] : [];
      } else state.sel = queryRect(state.floor, R.x0, R.y0, R.w, R.h);
      refreshInspector();
    } else if (tool === "zone" && d.start) {
      const R = rect(d.start, d.cur);
      paintZone(queryRect(state.floor, R.x0, R.y0, R.w, R.h), state.zone);
    }
    state.drag = null;
  }

  function askConfirm(text, fn) {
    document.getElementById("confirm-text").textContent = text;
    document.getElementById("confirm").hidden = false;
    state.pending = fn;
  }

  function onDown(ev) {
    if (ev.button === 1 || ev.button === 2 || ev.shiftKey || state.tool === "pan") {
      state.panning = true;
      state.panLast = { x: ev.clientX, y: ev.clientY };
      canvas.style.cursor = "grabbing";
      ev.preventDefault();
      return;
    }
    if (ev.button !== 0) return;
    const c = pointerCell(ev);
    state.drag = { start: c, cur: c, px: ev.clientX, py: ev.clientY };
    if (state.tool === "select" && !ev.shiftKey) {
      const hit = hitBuilding(c);
      if (hit) {
        state.sel = [hit];
        refreshInspector();
      }
    }
  }

  function onMove(ev) {
    if (state.panning && state.panLast) {
      const s = cellSize();
      state.camera.x -= (ev.clientX - state.panLast.x) / s;
      state.camera.y -= (ev.clientY - state.panLast.y) / s;
      state.panLast = { x: ev.clientX, y: ev.clientY };
      state.miniDirty = true;
      return;
    }
    const c = pointerCell(ev);
    if (!state.drag) {
      if (state.tool === "paste" && state.clip) state.drag = { start: null, cur: c, px: ev.clientX, py: ev.clientY, hover: true };
      return;
    }
    state.drag.cur = c;
    state.drag.px = ev.clientX;
    state.drag.py = ev.clientY;
  }

  function onUp(ev) {
    if (state.panning) {
      state.panning = false;
      state.panLast = null;
      canvas.style.cursor = state.tool === "pan" ? "grab" : "crosshair";
      return;
    }
    if (state.drag && !state.drag.hover) finishDrag();
    else if (state.tool !== "paste") state.drag = null;
  }

  function resize() {
    canvas.width = innerWidth;
    canvas.height = innerHeight;
    state.miniDirty = true;
  }

  function loop(ts) {
    if (!state.lastTs) state.lastTs = ts;
    const dt = Math.min(0.05, (ts - state.lastTs) / 1000);
    state.lastTs = ts;
    sim(dt);
    draw();
    requestAnimationFrame(loop);
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
        state.camera.z = Math.max(0.12, Math.min(2.6, state.camera.z * (e.deltaY > 0 ? 0.9 : 1.11)));
        state.miniDirty = true;
      },
      { passive: false }
    );
    mini.addEventListener("mousedown", (e) => {
      const r = mini.getBoundingClientRect();
      state.camera.x = ((e.clientX - r.left) / r.width) * state.mapW;
      state.camera.y = ((e.clientY - r.top) / r.height) * state.mapH;
    });
    window.addEventListener("keydown", (e) => {
      if (e.target && (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")) return;
      state.keys.add(e.code);
      if ((e.ctrlKey || e.metaKey) && e.code === "KeyZ") {
        e.preventDefault();
        undo();
      }
      if ((e.ctrlKey || e.metaKey) && e.code === "KeyC") {
        e.preventDefault();
        copySel();
      }
      if ((e.ctrlKey || e.metaKey) && e.code === "KeyV") {
        e.preventDefault();
        if (state.clip) {
          state.tool = "paste";
          syncTools();
        }
      }
      if (e.code === "Delete" || e.code === "Backspace") {
        if (state.sel.length) demolish(state.sel.slice());
      }
      if (e.key === "1") state.tool = "piece";
      if (e.key === "2") state.tool = "fill";
      if (e.key === "3") state.tool = "wing";
      if (e.key === "4") state.tool = "select";
      if (e.key === " ") {
        e.preventDefault();
        state.speed = state.speed === 0 ? 1 : 0;
      }
      if (e.key === "PageUp" || e.key === "]") state.floor = Math.min(state.floors - 1, state.floor + 1);
      if (e.key === "PageDown" || e.key === "[") state.floor = Math.max(0, state.floor - 1);
      syncTools();
    });
    window.addEventListener("keyup", (e) => state.keys.delete(e.code));
    document.querySelectorAll(".tool").forEach((b) => {
      b.onclick = () => {
        state.tool = b.dataset.tool;
        state.drag = null;
        if (state.tool === "paste" && !state.clip) toast("Primero selecciona y copia (Ctrl+C).");
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
      state.miniDirty = true;
    };
    document.getElementById("btn-floor-down").onclick = () => {
      state.floor = Math.max(0, state.floor - 1);
      state.miniDirty = true;
    };
    document.getElementById("btn-add-floor").onclick = addFloor;
    document.getElementById("btn-expand").onclick = () => (document.getElementById("expand").hidden = false);
    document.getElementById("expand-close").onclick = () => (document.getElementById("expand").hidden = true);
    document.querySelectorAll("#expand [data-dir]").forEach((b) => {
      b.onclick = () => expandMap(b.dataset.dir, Number(b.dataset.amt));
    });
    document.getElementById("btn-undo").onclick = undo;
    document.getElementById("btn-help").onclick = () => (document.getElementById("help").hidden = false);
    document.getElementById("btn-close-help").onclick = () => (document.getElementById("help").hidden = true);
    document.getElementById("confirm-ok").onclick = () => {
      document.getElementById("confirm").hidden = true;
      if (state.pending) state.pending();
      state.pending = null;
    };
    document.getElementById("confirm-no").onclick = () => {
      document.getElementById("confirm").hidden = true;
      state.pending = null;
    };
    document.getElementById("btn-save").onclick = () => {
      save();
      toast("Guardado.");
    };
    document.getElementById("btn-export").onclick = () => {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(new Blob([JSON.stringify(serialize())], { type: "application/json" }));
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
          toast("Archivo no válido.");
        }
      };
      reader.readAsText(file);
    };
    document.getElementById("resort-name").onchange = (e) => {
      state.name = e.target.value.slice(0, 28) || "Costa Aurora";
    };
    document.getElementById("search").oninput = (e) => {
      state.search = e.target.value;
      renderPalette();
    };
    document.getElementById("w-minus").onclick = () => {
      state.pieceW = Math.max(1, state.pieceW - 1);
      clampSize(T[state.brush]);
    };
    document.getElementById("w-plus").onclick = () => {
      state.pieceW++;
      clampSize(T[state.brush]);
    };
    document.getElementById("h-minus").onclick = () => {
      state.pieceH = Math.max(1, state.pieceH - 1);
      clampSize(T[state.brush]);
    };
    document.getElementById("h-plus").onclick = () => {
      state.pieceH++;
      clampSize(T[state.brush]);
    };
    document.getElementById("ins-num").oninput = (e) => {
      if (state.sel.length === 1 && T[state.sel[0].type].room) state.sel[0].num = e.target.value.slice(0, 12);
    };
    document.getElementById("ins-copy").onclick = copySel;
    document.getElementById("ins-delete").onclick = () => demolish(state.sel.slice());
    const zb = document.getElementById("zone-bar");
    ZONES.forEach((z) => {
      const b = document.createElement("button");
      b.textContent = z.name;
      b.dataset.zone = String(z.id);
      if (z.id === state.zone) b.classList.add("on");
      b.onclick = () => {
        state.zone = z.id;
        state.tool = "zone";
        syncTools();
      };
      zb.appendChild(b);
    });
    window.addEventListener("resize", resize);
  }

  function showGame() {
    document.getElementById("title-screen").hidden = true;
    document.getElementById("game").hidden = false;
    resize();
    renderCats();
    renderSubs();
    renderPalette();
    syncTools();
    document.getElementById("help").hidden = false;
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
