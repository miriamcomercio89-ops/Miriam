/** Render canvas del mapa RoI */
window.IM = window.IM || {};

IM.Renderer = class Renderer {
  constructor(canvas, game) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.game = game;
    this.drag = null;
  }

  resize() {
    const parent = this.canvas.parentElement;
    this.canvas.width = parent.clientWidth;
    this.canvas.height = parent.clientHeight;
  }

  screenToTile(sx, sy) {
    const st = this.game.state;
    const ts = IM_CONFIG.tileSize;
    const x = Math.floor(st.ui.camX + sx / ts);
    const y = Math.floor(st.ui.camY + sy / ts);
    return { x, y };
  }

  draw() {
    const ctx = this.ctx;
    const st = this.game.state;
    const ts = IM_CONFIG.tileSize;
    const w = this.canvas.width;
    const h = this.canvas.height;
    ctx.clearRect(0, 0, w, h);

    // cielo / fondo
    const season = IM.season(st.day);
    ctx.fillStyle = '#0b1220';
    ctx.fillRect(0, 0, w, h);

    const x0 = Math.floor(st.ui.camX);
    const y0 = Math.floor(st.ui.camY);
    const cols = Math.ceil(w / ts) + 2;
    const rows = Math.ceil(h / ts) + 2;

    for (let y = y0; y < y0 + rows; y++) {
      for (let x = x0; x < x0 + cols; x++) {
        const t = this.game.tile(x, y);
        if (!t) continue;
        const sx = (x - st.ui.camX) * ts;
        const sy = (y - st.ui.camY) * ts;
        const terr = IM_DATA.terrain[t.terrain] || IM_DATA.terrain.grass;
        ctx.fillStyle = terr.color;
        ctx.fillRect(sx, sy, ts + 0.5, ts + 0.5);
        if (t.road) {
          ctx.fillStyle = '#3f3f46';
          ctx.fillRect(sx + 4, sy + ts * 0.35, ts - 8, ts * 0.3);
          ctx.fillRect(sx + ts * 0.35, sy + 4, ts * 0.3, ts - 8);
        }
        // recurso hint
        if (terr.resource && !t.buildingId) {
          ctx.globalAlpha = 0.35;
          ctx.fillStyle = '#fff';
          ctx.fillRect(sx + ts * 0.35, sy + ts * 0.35, ts * 0.3, ts * 0.3);
          ctx.globalAlpha = 1;
        }
      }
    }

    // edificios
    st.buildings.forEach((b) => {
      const def = IM.building(b.type);
      const sx = (b.x - st.ui.camX) * ts;
      const sy = (b.y - st.ui.camY) * ts;
      ctx.fillStyle = def?.color || '#888';
      ctx.fillRect(sx + 2, sy + 2, b.w * ts - 4, b.h * ts - 4);
      ctx.strokeStyle = st.ui.selectedId === b.id ? '#fbbf24' : 'rgba(0,0,0,0.35)';
      ctx.lineWidth = st.ui.selectedId === b.id ? 3 : 1;
      ctx.strokeRect(sx + 2, sy + 2, b.w * ts - 4, b.h * ts - 4);
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 10px sans-serif';
      ctx.fillText((def?.name || b.type).slice(0, 10), sx + 6, sy + 14);
      if (def?.kind === 'logistics') {
        const r = (def.radius || 6) * ts;
        ctx.strokeStyle = 'rgba(96,165,250,0.25)';
        ctx.beginPath();
        ctx.arc(sx + (b.w * ts) / 2, sy + (b.h * ts) / 2, r, 0, Math.PI * 2);
        ctx.stroke();
      }
    });

    // pueblos
    st.world.towns.forEach((town) => {
      const sx = (town.x - st.ui.camX) * ts;
      const sy = (town.y - st.ui.camY) * ts;
      ctx.fillStyle = town.shopClosedUntil ? '#7f1d1d' : '#f8fafc';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText(town.name, sx - 10, sy - 6);
      ctx.font = '10px sans-serif';
      ctx.fillStyle = season.color;
      ctx.fillText(`rep ${town.reputation}`, sx - 10, sy + 8);
    });

    // camiones
    st.trucks.forEach((tr) => {
      const sx = (tr.x - st.ui.camX) * ts;
      const sy = (tr.y - st.ui.camY) * ts;
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(sx - 4, sy - 3, 10, 6);
    });

    // ghost build
    if (st.ui.tool === 'build' && st.ui.buildId && st.ui.hover) {
      const def = IM.building(st.ui.buildId);
      const { x, y } = st.ui.hover;
      const ok = this.game.canPlace(def, x, y).ok;
      ctx.fillStyle = ok ? 'rgba(52,211,153,0.4)' : 'rgba(248,113,113,0.4)';
      ctx.fillRect((x - st.ui.camX) * ts, (y - st.ui.camY) * ts, def.w * ts, def.h * ts);
    }
  }
};
