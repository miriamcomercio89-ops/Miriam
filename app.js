// app.js — motor principal (sin servidor)
(() => {
  const BRANCH = 'feature/lottery-full';
  const STORAGE_KEY = 'miriam_state_v1';
  const GAME_TIME_SCALE = 0.25; // el tiempo del juego avanza 4x más lento que el real

  // Default state
  const defaultState = {
    createdAt: new Date().toISOString(),
    gameStartReal: Date.now(),
    gameStartOffsetMs: 0,
    clients: [],
    sales: [],
    accounting: { entries: [] },
    gamesCatalog: [],
    holidays: [],
    seeds: [],
    nextIds: { client: 1, sale: 1, accounting: 1 }
  };

  // State helpers
  function loadState(){
    const raw = localStorage.getItem(STORAGE_KEY);
    if(!raw) return structuredClone(defaultState);
    try{ return JSON.parse(raw); }catch(e){ console.error('estado corrupto',e); return structuredClone(defaultState); }
  }
  function saveState(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }

  // Game clock
  const clockEl = document.getElementById('game-clock');
  const officeStatusEl = document.getElementById('office-status');

  function getGameTimeMs(){
    const realElapsed = Date.now() - state.gameStartReal;
    const scaled = Math.floor(realElapsed * GAME_TIME_SCALE) + state.gameStartOffsetMs;
    return state.gameStartReal + scaled;
  }
  function formatTime(d){
    return d.toLocaleString('es-ES');
  }

  function isOfficeOpen(gameDate){
    // Closed Saturdays (6) and Sundays (0)
    const day = gameDate.getDay();
    if(day === 6 || day === 0) return false;
    // Check holidays
    const ymd = gameDate.toISOString().slice(0,10);
    if(state.holidays && state.holidays.includes(ymd)) return false;
    // Working hours: 09:00-14:00 and 17:00-22:00
    const h = gameDate.getHours();
    const m = gameDate.getMinutes();
    const time = h + m/60;
    if((time >= 9 && time < 14) || (time >=17 && time < 22)) return true;
    return false;
  }

  function tick(){
    const nowMs = getGameTimeMs();
    const now = new Date(nowMs);
    clockEl.textContent = formatTime(now);
    officeStatusEl.textContent = isOfficeOpen(now) ? 'Abierta' : 'Cerrada';
    setTimeout(tick, 1000);
  }

  // UI wiring
  const btnOpenSales = document.getElementById('btn-open-sales');
  const btnOpenAdmin = document.getElementById('btn-open-admin');
  const salesPanel = document.getElementById('sales-panel');
  const adminPanel = document.getElementById('admin-panel');
  const btnExport = document.getElementById('btn-export');
  const importFile = document.getElementById('import-file');
  const selectGame = document.getElementById('select-game');
  const btnSell = document.getElementById('btn-sell');
  const inputAmount = document.getElementById('input-amount');
  const recentSales = document.getElementById('recent-sales');
  const logEntries = document.getElementById('log-entries');
  const clientsList = document.getElementById('clients-list');
  const accountingSummary = document.getElementById('accounting-summary');

  btnOpenSales.addEventListener('click', ()=>{ salesPanel.classList.toggle('hidden'); adminPanel.classList.add('hidden'); });
  btnOpenAdmin.addEventListener('click', ()=>{ adminPanel.classList.toggle('hidden'); salesPanel.classList.add('hidden'); });

  btnExport.addEventListener('click', ()=>{
    const blob = new Blob([JSON.stringify(state, null, 2)], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'miriam-state-'+(new Date()).toISOString()+'.json';
    document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
    log('Exportado estado (JSON)');
  });

  importFile.addEventListener('change', (e)=>{
    const f = e.target.files[0];
    if(!f) return;
    const reader = new FileReader();
    reader.onload = ()=>{
      try{
        const imported = JSON.parse(reader.result);
        Object.assign(state, imported);
        saveState();
        refreshUI();
        log('Importado estado desde archivo');
      }catch(err){ alert('Archivo JSON erróneo'); }
    };
    reader.readAsText(f);
  });

  function log(msg){
    const t = '['+new Date().toLocaleString()+'] '+msg;
    const p = document.createElement('div'); p.textContent = t; logEntries.prepend(p);
  }

  btnSell.addEventListener('click', ()=>{
    const gid = selectGame.value;
    const amount = parseFloat(inputAmount.value) || 0;
    if(!gid){ alert('Seleccione un juego'); return; }
    const g = state.gamesCatalog.find(x=>x.id===gid);
    const sale = {
      id: state.nextIds.sale++,
      createdAt: new Date(getGameTimeMs()).toISOString(),
      gameId: gid,
      gameName: g ? g.name : 'Desconocido',
      amount: amount
    };
    state.sales.push(sale);
    // Accounting entry (simplified)
    const entry = { id: state.nextIds.accounting++, date: sale.createdAt, description: 'Venta: '+sale.gameName, debit: 0, credit: amount };
    state.accounting.entries.push(entry);
    saveState();
    renderRecentSales();
    renderAccounting();
    log('Venta realizada: '+sale.gameName+' €'+amount.toFixed(2));
  });

  // Render helpers
  function populateGamesSelect(){
    selectGame.innerHTML = '<option value="">-- Seleccionar --</option>';
    state.gamesCatalog.forEach(g=>{
      const o = document.createElement('option'); o.value = g.id; o.textContent = g.name+' ('+(g.type||'')+')';
      selectGame.appendChild(o);
    });
  }

  function renderRecentSales(){
    recentSales.innerHTML = '';
    const last = state.sales.slice(-25).reverse();
    last.forEach(s=>{
      const d = document.createElement('div'); d.textContent = s.createdAt+' — '+s.gameName+' — €'+s.amount.toFixed(2);
      recentSales.appendChild(d);
    });
  }

  function renderClients(){
    clientsList.innerHTML = '';
    state.clients.slice(0,50).forEach(c=>{
      const d = document.createElement('div'); d.textContent = c.name+' — ID:'+c.id;
      clientsList.appendChild(d);
    });
  }

  function renderAccounting(){
    accountingSummary.innerHTML = '';
    const totalSales = state.accounting.entries.reduce((s,e)=>s+(e.credit||0)-(e.debit||0),0);
    accountingSummary.textContent = 'Ingresos (simulado): €'+totalSales.toFixed(2)+' — Asientos: '+state.accounting.entries.length;
  }

  function refreshUI(){
    populateGamesSelect(); renderRecentSales(); renderClients(); renderAccounting();
  }

  // Initial load
  let state = loadState();
  // If catalog empty, load template catalog file if present (data/games.json)
  fetch('data/games.json').then(r=>r.json()).then(g=>{
    if(Array.isArray(g) && g.length>0){ state.gamesCatalog = g; saveState(); }
    refreshUI();
  }).catch(()=>{ refreshUI(); });

  // Start clock
  tick();
  log('Simulador iniciado — rama: '+BRANCH);

})();
