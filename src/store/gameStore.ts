import { create } from 'zustand'
import { BRANDS, brandById, HQ_UPGRADES } from '../data/brands'
import { CITIES, nearestCity } from '../data/cities'
import { rollDailyEvent } from '../data/events'
import { competitionAt, dailyPnl, foundCost, spiralPoint } from '../lib/economy'
import { uid } from '../lib/format'
import { reverseGeocode, scoutCity, scoutRestaurants, type BBox } from '../lib/osm'
import { loadState, saveState } from '../lib/save'
import type {
  GameEvent,
  GameState,
  MapFocus,
  MapMode,
  OsmSite,
  PanelId,
  Restaurant,
  ReversePlace,
  Speed,
} from '../types'

const START_CASH = 520_000

function emptyState(company = 'Grupo Paladar'): GameState {
  return {
    version: 1,
    company,
    started: false,
    day: 1,
    hour: 8,
    cash: START_CASH,
    hqLevel: 1,
    upgrades: [],
    restaurants: [],
    usedOsm: [],
    history: [],
    events: [],
    autoExpand: false,
    autoBrand: 'tasca',
    autoCount: 8,
    autoCityIndex: 0,
  }
}

function pushEvent(events: GameEvent[], ev: Omit<GameEvent, 'id'>): GameEvent[] {
  return [{ ...ev, id: uid('ev') }, ...events].slice(0, 40)
}

function makeRestaurant(opts: {
  brandId: string
  lat: number
  lng: number
  city: string
  country: string
  cc: string
  name?: string
  osmId?: string
  day: number
  upgrades: string[]
}): Restaurant {
  const b = brandById(opts.brandId)
  const quality = Math.min(100, b.quality + (opts.upgrades.includes('academia') ? 4 : 0))
  return {
    id: uid('r'),
    name: opts.name || `${b.short} ${opts.city}`,
    brandId: opts.brandId,
    lat: opts.lat,
    lng: opts.lng,
    city: opts.city,
    country: opts.country,
    cc: opts.cc,
    osmId: opts.osmId,
    seats: b.seats,
    quality,
    foundedDay: opts.day,
    closed: false,
    lastCovers: 0,
    lastRev: 0,
    lastCost: 0,
    lastNet: 0,
    stars: 0,
  }
}

function seedDemo(company: string): GameState {
  const s = emptyState(company)
  s.started = true
  s.cash = 2_400_000
  s.hqLevel = 3
  s.upgrades = ['compras', 'academia']
  const brands = BRANDS.filter((b) => b.hqLevel <= 3)
  let n = 0
  for (const city of CITIES) {
    const count = city.id === 'alora' ? 4 : city.popM > 3 ? 14 : city.popM > 1 ? 10 : 6
    for (let i = 0; i < count; i++) {
      const brand = brands[(n + i) % brands.length]
      const p = spiralPoint(city.lat, city.lng, i + 1)
      s.restaurants.push(
        makeRestaurant({
          brandId: brand.id,
          lat: p.lat,
          lng: p.lng,
          city: city.name,
          country: city.country,
          cc: city.cc,
          day: 1,
          upgrades: s.upgrades,
        }),
      )
    }
    n += count
    if (s.restaurants.length >= 1000) break
  }
  s.events = pushEvent(s.events, {
    day: 1,
    title: 'Imperio de demostración',
    body: `${s.restaurants.length} locales sembrados en el mapa OSM para probar el canvas y la simulación.`,
    tone: 'info',
  })
  return s
}

interface UiSlice {
  mapMode: MapMode
  speed: Speed
  panel: PanelId
  selectedId: string | null
  mapFocus: MapFocus | null
  osmSites: OsmSite[]
  scoutBusy: boolean
  pendingPlace: ReversePlace | null
  toast: string | null
  hasSave: boolean
  saveBusy: boolean
}

interface Actions {
  boot: () => Promise<void>
  startNew: (company: string, demo?: boolean) => void
  continueSave: () => Promise<void>
  importSave: (state: GameState) => void
  persist: () => Promise<void>
  setSpeed: (s: Speed) => void
  setMapMode: (m: MapMode) => void
  setPanel: (p: PanelId) => void
  setSelected: (id: string | null) => void
  setMapFocus: (f: MapFocus | null) => void
  setToast: (t: string | null) => void
  setAuto: (partial: Partial<Pick<GameState, 'autoExpand' | 'autoBrand' | 'autoCount'>>) => void
  scoutView: (bbox: BBox) => Promise<void>
  prepareFound: (lat: number, lng: number) => Promise<void>
  confirmFound: (brandId: string) => void
  acquireOsm: (site: OsmSite, brandId: string) => void
  bulkFound: (cityId: string, brandId: string, count: number, useOsm: boolean) => Promise<number>
  upgradeSeats: (id: string) => void
  upgradeQuality: (id: string) => void
  toggleClosed: (id: string) => void
  sellRestaurant: (id: string) => void
  buyUpgrade: (id: string) => void
  upgradeHq: () => void
  tick: () => void
}

export const useGameStore = create<GameState & UiSlice & Actions>((set, get) => ({
  ...emptyState(),
  mapMode: 'explore',
  speed: 1,
  panel: 'help',
  selectedId: null,
  mapFocus: { lat: 36.8231, lng: -4.7064, zoom: 12 },
  osmSites: [],
  scoutBusy: false,
  pendingPlace: null,
  toast: null,
  hasSave: false,
  saveBusy: false,

  boot: async () => {
    const saved = await loadState()
    set({ hasSave: !!saved })
  },

  startNew: (company, demo) => {
    const base = demo ? seedDemo(company) : emptyState(company)
    base.started = true
    base.events = pushEvent(base.events, {
      day: 1,
      title: 'Apertura en Álora',
      body: 'La sede está en el Valle del Guadalhorce. Busca calles reales en OpenStreetMap y funda el primer local.',
      tone: 'info',
    })
    set({
      ...base,
      mapMode: 'found',
      speed: 1,
      panel: demo ? 'list' : 'help',
      selectedId: null,
      mapFocus: { lat: 36.8231, lng: -4.7064, zoom: demo ? 5 : 13 },
      osmSites: [],
      pendingPlace: null,
      toast: demo ? `${base.restaurants.length} restaurantes en el mapa` : 'Modo fundar: pulsa el mapa',
      hasSave: true,
    })
    void get().persist()
  },

  continueSave: async () => {
    const saved = await loadState()
    if (!saved) {
      set({ toast: 'No hay partida guardada' })
      return
    }
    set({
      ...saved,
      started: true,
      mapMode: 'explore',
      speed: 1,
      panel: 'list',
      selectedId: null,
      mapFocus: saved.restaurants[0]
        ? { lat: saved.restaurants[0].lat, lng: saved.restaurants[0].lng, zoom: 11 }
        : { lat: 36.8231, lng: -4.7064, zoom: 12 },
      osmSites: [],
      pendingPlace: null,
      toast: `Partida del día ${saved.day}`,
      hasSave: true,
    })
  },

  importSave: (state) => {
    set({
      ...state,
      started: true,
      mapMode: 'explore',
      speed: 1,
      panel: 'list',
      selectedId: null,
      osmSites: [],
      pendingPlace: null,
      toast: 'Partida importada',
      hasSave: true,
    })
    void get().persist()
  },

  persist: async () => {
    const s = get()
    if (!s.started) return
    set({ saveBusy: true })
    const snap: GameState = {
      version: 1,
      company: s.company,
      started: s.started,
      day: s.day,
      hour: s.hour,
      cash: s.cash,
      hqLevel: s.hqLevel,
      upgrades: s.upgrades,
      restaurants: s.restaurants,
      usedOsm: s.usedOsm,
      history: s.history,
      events: s.events,
      autoExpand: s.autoExpand,
      autoBrand: s.autoBrand,
      autoCount: s.autoCount,
      autoCityIndex: s.autoCityIndex,
    }
    await saveState(snap)
    set({ saveBusy: false, hasSave: true })
  },

  setSpeed: (speed) => set({ speed }),
  setMapMode: (mapMode) => set({ mapMode, pendingPlace: mapMode === 'found' ? get().pendingPlace : null }),
  setPanel: (panel) => set({ panel }),
  setSelected: (selectedId) => set({ selectedId }),
  setMapFocus: (mapFocus) => set({ mapFocus }),
  setToast: (toast) => set({ toast }),
  setAuto: (partial) => set(partial),

  scoutView: async (bbox) => {
    set({ scoutBusy: true, mapMode: 'scout', panel: 'scout' })
    const sites = await scoutRestaurants(bbox)
    const used = new Set(get().usedOsm)
    set({
      osmSites: sites.filter((s) => !used.has(s.osmId)),
      scoutBusy: false,
      toast: sites.length ? `${sites.length} locales OSM en vista` : 'Overpass no devolvió locales. Prueba más zoom.',
    })
  },

  prepareFound: async (lat, lng) => {
    const place = await reverseGeocode(lat, lng)
    if (place.water) {
      set({ toast: 'Eso es agua según OSM. Elige tierra firme.', pendingPlace: null })
      return
    }
    set({ pendingPlace: place, panel: 'build', mapMode: 'found' })
  },

  confirmFound: (brandId) => {
    const s = get()
    const place = s.pendingPlace
    if (!place) return
    const city = nearestCity(place.lat, place.lng)
    const cost = foundCost(brandId, city, s.upgrades)
    if (s.cash < cost) {
      set({ toast: `Faltan ${Math.round(cost - s.cash).toLocaleString('es-ES')} €` })
      return
    }
    const r = makeRestaurant({
      brandId,
      lat: place.lat,
      lng: place.lng,
      city: place.city || city.name,
      country: place.country || city.country,
      cc: place.cc !== 'XX' ? place.cc : city.cc,
      name: `${brandById(brandId).short} ${place.city}`,
      day: s.day,
      upgrades: s.upgrades,
    })
    set({
      cash: s.cash - cost,
      restaurants: [...s.restaurants, r],
      selectedId: r.id,
      pendingPlace: null,
      toast: `Abierto: ${r.name} (−${cost.toLocaleString('es-ES')} €)`,
      panel: 'list',
    })
    void get().persist()
  },

  acquireOsm: (site, brandId) => {
    const s = get()
    if (s.usedOsm.includes(site.osmId)) {
      set({ toast: 'Ese local OSM ya es vuestro' })
      return
    }
    const city = nearestCity(site.lat, site.lng)
    const cost = Math.round(foundCost(brandId, city, s.upgrades) * 1.12)
    if (s.cash < cost) {
      set({ toast: 'No hay caja para adquirir ese local OSM' })
      return
    }
    const r = makeRestaurant({
      brandId,
      lat: site.lat,
      lng: site.lng,
      city: site.city || city.name,
      country: city.country,
      cc: city.cc,
      name: `${brandById(brandId).short} · ${site.name}`,
      osmId: site.osmId,
      day: s.day,
      upgrades: s.upgrades,
    })
    set({
      cash: s.cash - cost,
      restaurants: [...s.restaurants, r],
      usedOsm: [...s.usedOsm, site.osmId],
      osmSites: s.osmSites.filter((x) => x.osmId !== site.osmId),
      selectedId: r.id,
      toast: `Adquirido en mapa real: ${site.name}`,
      panel: 'list',
    })
    void get().persist()
  },

  bulkFound: async (cityId, brandId, count, useOsm) => {
    const s = get()
    const city = CITIES.find((c) => c.id === cityId)
    if (!city) return 0
    let sites: OsmSite[] = []
    if (useOsm) {
      set({ scoutBusy: true, toast: `Consultando Overpass en ${city.name}…` })
      sites = (await scoutCity(city.lat, city.lng, city.popM > 2 ? 0.06 : 0.04, count + 20)).filter(
        (x) => !s.usedOsm.includes(x.osmId) && !get().usedOsm.includes(x.osmId),
      )
    }
    const created: Restaurant[] = []
    const used: string[] = []
    let spent = 0
    let cash = s.cash
    for (let i = 0; i < count; i++) {
      const cost = foundCost(brandId, city, s.upgrades)
      if (cash < cost) break
      const site = sites[i]
      const p = site ? { lat: site.lat, lng: site.lng } : spiralPoint(city.lat, city.lng, s.restaurants.length + i)
      cash -= cost
      spent += cost
      const r = makeRestaurant({
        brandId,
        lat: p.lat,
        lng: p.lng,
        city: city.name,
        country: city.country,
        cc: city.cc,
        name: site ? `${brandById(brandId).short} · ${site.name}` : `${brandById(brandId).short} ${city.name} ${i + 1}`,
        osmId: site?.osmId,
        day: s.day,
        upgrades: s.upgrades,
      })
      created.push(r)
      if (site) used.push(site.osmId)
    }
    set({
      cash,
      restaurants: [...s.restaurants, ...created],
      usedOsm: [...s.usedOsm, ...used],
      scoutBusy: false,
      toast: created.length
        ? `Fundados ${created.length} en ${city.name} (−${Math.round(spent).toLocaleString('es-ES')} €)`
        : 'Sin caja para esa oleada',
      mapFocus: { lat: city.lat, lng: city.lng, zoom: 12 },
      panel: 'list',
    })
    void get().persist()
    return created.length
  },

  upgradeSeats: (id) => {
    const s = get()
    const r = s.restaurants.find((x) => x.id === id)
    if (!r || r.closed) return
    const cost = Math.round(12000 * nearestCity(r.lat, r.lng).col + r.seats * 180)
    if (s.cash < cost) {
      set({ toast: 'Caja insuficiente para ampliar' })
      return
    }
    set({
      cash: s.cash - cost,
      restaurants: s.restaurants.map((x) => (x.id === id ? { ...x, seats: x.seats + 8 } : x)),
      toast: `+8 asientos (−${cost.toLocaleString('es-ES')} €)`,
    })
  },

  upgradeQuality: (id) => {
    const s = get()
    const r = s.restaurants.find((x) => x.id === id)
    if (!r || r.closed || r.quality >= 100) return
    const cost = Math.round(18000 + r.quality * 400)
    if (s.cash < cost) {
      set({ toast: 'Caja insuficiente para cocina' })
      return
    }
    set({
      cash: s.cash - cost,
      restaurants: s.restaurants.map((x) => (x.id === id ? { ...x, quality: Math.min(100, x.quality + 6) } : x)),
      toast: `Cocina mejorada (−${cost.toLocaleString('es-ES')} €)`,
    })
  },

  toggleClosed: (id) => {
    set({
      restaurants: get().restaurants.map((x) => (x.id === id ? { ...x, closed: !x.closed } : x)),
    })
  },

  sellRestaurant: (id) => {
    const s = get()
    const r = s.restaurants.find((x) => x.id === id)
    if (!r) return
    const city = nearestCity(r.lat, r.lng)
    const price = Math.round(foundCost(r.brandId, city, s.upgrades) * (0.45 + r.quality / 250))
    set({
      cash: s.cash + price,
      restaurants: s.restaurants.filter((x) => x.id !== id),
      selectedId: s.selectedId === id ? null : s.selectedId,
      toast: `Vendido por ${price.toLocaleString('es-ES')} €`,
    })
    void get().persist()
  },

  buyUpgrade: (id) => {
    const s = get()
    const u = HQ_UPGRADES.find((x) => x.id === id)
    if (!u || s.upgrades.includes(id) || s.hqLevel < u.levelReq) return
    if (s.cash < u.cost) {
      set({ toast: 'Caja insuficiente para esa mejora HQ' })
      return
    }
    let cash = s.cash - u.cost
    let restaurants = s.restaurants
    if (id === 'academia') {
      restaurants = restaurants.map((r) => ({ ...r, quality: Math.min(100, r.quality + 4) }))
    }
    if (id === 'ipo') cash += 8_000_000
    const events = pushEvent(s.events, {
      day: s.day,
      title: u.name,
      body: u.desc + (id === 'ipo' ? ' Entra una inyección de 8 M€.' : ''),
      tone: 'good',
    })
    set({ cash, upgrades: [...s.upgrades, id], restaurants, events, toast: u.name })
    void get().persist()
  },

  upgradeHq: () => {
    const s = get()
    if (s.hqLevel >= 6) return
    const cost = Math.round(180000 * s.hqLevel ** 1.45)
    if (s.cash < cost) {
      set({ toast: 'Caja insuficiente para subir HQ' })
      return
    }
    set({ cash: s.cash - cost, hqLevel: s.hqLevel + 1, toast: `HQ nivel ${s.hqLevel + 1}` })
  },

  tick: () => {
    const s = get()
    if (!s.started || s.speed === 0) return
    let hour = s.hour + 1
    let day = s.day
    let cash = s.cash
    let restaurants = s.restaurants
    let events = s.events
    let history = s.history
    let autoCityIndex = s.autoCityIndex
    const foundedToday = { n: 0 }

    if (hour >= 24) {
      hour = 0
      day += 1
      let rev = 0
      let cost = 0
      let closed = 0
      restaurants = restaurants.map((r) => {
        const city = nearestCity(r.lat, r.lng)
        const comp = competitionAt(r.lat, r.lng, restaurants)
        const pnl = dailyPnl(r, city, s.upgrades, comp)
        rev += pnl.rev
        cost += pnl.cost
        let stars = r.stars
        if (s.upgrades.includes('michelin') && !r.closed && r.quality >= 86 && Math.random() < 0.012 && stars < 3) {
          stars += 1
        }
        return { ...r, lastCovers: pnl.covers, lastRev: pnl.rev, lastCost: pnl.cost, lastNet: pnl.net, stars }
      })
      cash += rev - cost
      if (cash < -250000) {
        const extra = restaurants.filter((r) => !r.closed && r.lastNet < 0).slice(0, 3)
        restaurants = restaurants.map((r) => (extra.some((e) => e.id === r.id) ? { ...r, closed: true } : r))
        closed = extra.length
        events = pushEvent(events, {
          day,
          title: 'Cierres de emergencia',
          body: `Números rojos: se cierran ${closed} locales deficitarios.`,
          tone: 'bad',
        })
      }
      const ev = rollDailyEvent(day, restaurants.filter((r) => !r.closed).length, cash)
      if (ev) {
        cash += ev.cash ?? 0
        if (ev.qualityAll) {
          restaurants = restaurants.map((r) => ({
            ...r,
            quality: Math.max(20, Math.min(100, r.quality + ev.qualityAll!)),
          }))
        }
        events = pushEvent(events, { day, title: ev.title, body: ev.body, tone: ev.tone })
      }
      if (s.autoExpand && s.upgrades.includes('auto')) {
        const city = CITIES[autoCityIndex % CITIES.length]
        const brand = s.autoBrand
        const unit = foundCost(brand, city, s.upgrades)
        const n = Math.min(s.autoCount, Math.floor(Math.max(0, cash - 80000) / unit))
        for (let i = 0; i < n; i++) {
          const p = spiralPoint(city.lat, city.lng, restaurants.length + i)
          cash -= unit
          restaurants.push(
            makeRestaurant({
              brandId: brand,
              lat: p.lat,
              lng: p.lng,
              city: city.name,
              country: city.country,
              cc: city.cc,
              name: `${brandById(brand).short} ${city.name} ${restaurants.length + 1}`,
              day,
              upgrades: s.upgrades,
            }),
          )
          foundedToday.n++
        }
        if (n > 0) autoCityIndex += 1
      }
      history = [
        ...history,
        { day, cash, rev, cost, net: rev - cost, founded: foundedToday.n, closed },
      ].slice(-60)
    }

    set({ hour, day, cash, restaurants, events, history, autoCityIndex })
    if (hour === 0 && day % 2 === 0) void get().persist()
  },
}))
