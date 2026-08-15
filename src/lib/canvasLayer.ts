import L from 'leaflet'
import { brandById } from '../data/brands'
import type { OsmSite, Restaurant } from '../types'

type LayerRec = L.Layer & {
  setData: (r: Restaurant[], osm: OsmSite[], selected: string | null) => void
}

export function createSitesCanvasLayer(): LayerRec {
  const Layer = L.Layer.extend({
    onAdd(map: L.Map) {
      this._map = map
      this._canvas = L.DomUtil.create('canvas', 'mesa-sites-canvas')
      Object.assign(this._canvas.style, {
        position: 'absolute',
        left: '0',
        top: '0',
        pointerEvents: 'none',
        zIndex: '450',
      })
      map.getPanes().overlayPane.appendChild(this._canvas)
      this._ctx = this._canvas.getContext('2d', { alpha: true })
      this._restaurants = [] as Restaurant[]
      this._osm = [] as OsmSite[]
      this._selectedId = null as string | null
      this._raf = 0
      this._dirty = true
      this._onMove = () => this._schedule()
      map.on('move zoom moveend zoomend resize viewreset', this._onMove, this)
      this._schedule()
    },

    onRemove(map: L.Map) {
      map.off('move zoom moveend zoomend resize viewreset', this._onMove, this)
      if (this._raf) cancelAnimationFrame(this._raf)
      L.DomUtil.remove(this._canvas)
    },

    setData(next: Restaurant[], osm: OsmSite[], selected: string | null) {
      this._restaurants = next
      this._osm = osm
      this._selectedId = selected
      this._schedule()
    },

    _schedule() {
      this._dirty = true
      if (this._raf) return
      this._raf = requestAnimationFrame(() => {
        this._raf = 0
        if (this._dirty) this._redraw()
      })
    },

    _redraw() {
      this._dirty = false
      const map: L.Map = this._map
      const canvas: HTMLCanvasElement = this._canvas
      const ctx: CanvasRenderingContext2D = this._ctx
      if (!map || !canvas || !ctx) return
      const size = map.getSize()
      if (size.x < 2 || size.y < 2) return
      const topLeft = map.containerPointToLayerPoint([0, 0])
      L.DomUtil.setPosition(canvas, topLeft)
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const w = Math.floor(size.x * dpr)
      const h = Math.floor(size.y * dpr)
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w
        canvas.height = h
        canvas.style.width = `${size.x}px`
        canvas.style.height = `${size.y}px`
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, size.x, size.y)

      const bounds = map.getBounds().pad(0.1)
      const zoom = map.getZoom()
      const list: Restaurant[] = this._restaurants
      const osm: OsmSite[] = this._osm
      const selectedId: string | null = this._selectedId

      if (zoom < 5 || (zoom < 7 && list.length > 900)) {
        this._clusters(ctx, map, list, zoom)
      } else {
        for (const r of list) {
          if (!bounds.contains([r.lat, r.lng])) continue
          const p = map.latLngToContainerPoint([r.lat, r.lng])
          const b = brandById(r.brandId)
          const selected = r.id === selectedId
          const rad = selected ? 7 : zoom >= 11 ? 5.2 : zoom >= 8 ? 4 : 3
          ctx.beginPath()
          ctx.fillStyle = r.closed ? '#6b625c' : b.color
          ctx.strokeStyle = selected ? '#f8e7c2' : 'rgba(255,255,255,0.7)'
          ctx.lineWidth = selected ? 2.4 : 1.1
          ctx.arc(p.x, p.y, rad, 0, Math.PI * 2)
          ctx.fill()
          ctx.stroke()
          if (r.stars > 0 && zoom >= 10) {
            ctx.fillStyle = '#e8c47a'
            ctx.font = '9px Outfit, sans-serif'
            ctx.fillText('★'.repeat(Math.min(3, r.stars)), p.x + rad + 2, p.y + 3)
          }
        }
      }

      if (zoom >= 11 && osm.length) {
        for (const s of osm) {
          if (!bounds.contains([s.lat, s.lng])) continue
          const p = map.latLngToContainerPoint([s.lat, s.lng])
          ctx.beginPath()
          ctx.strokeStyle = 'rgba(232, 196, 122, 0.85)'
          ctx.lineWidth = 1.4
          ctx.arc(p.x, p.y, 4.2, 0, Math.PI * 2)
          ctx.stroke()
        }
      }
    },

    _clusters(ctx: CanvasRenderingContext2D, map: L.Map, list: Restaurant[], zoom: number) {
      const cell = zoom < 3 ? 80 : zoom < 5 ? 56 : 40
      const buckets = new Map<string, { x: number; y: number; n: number; color: string }>()
      for (const r of list) {
        if (r.closed) continue
        const p = map.latLngToContainerPoint([r.lat, r.lng])
        const kx = Math.floor(p.x / cell)
        const ky = Math.floor(p.y / cell)
        const k = `${kx}:${ky}`
        const prev = buckets.get(k)
        const color = brandById(r.brandId).color
        if (!prev) buckets.set(k, { x: p.x, y: p.y, n: 1, color })
        else {
          prev.n++
          prev.x += p.x
          prev.y += p.y
        }
      }
      for (const b of buckets.values()) {
        const x = b.x / b.n
        const y = b.y / b.n
        const rad = Math.min(22, 8 + Math.sqrt(b.n) * 1.8)
        ctx.beginPath()
        ctx.fillStyle = b.color
        ctx.globalAlpha = 0.88
        ctx.arc(x, y, rad, 0, Math.PI * 2)
        ctx.fill()
        ctx.globalAlpha = 1
        ctx.fillStyle = '#fff8ee'
        ctx.font = `600 ${rad > 14 ? 11 : 9}px Outfit, sans-serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(String(b.n), x, y + 0.5)
      }
      ctx.textAlign = 'start'
      ctx.textBaseline = 'alphabetic'
    },
  })

  return new Layer() as LayerRec
}

export function findNearestRestaurant(
  map: L.Map,
  list: Restaurant[],
  pt: L.Point,
  zoom: number,
  selectedId: string | null,
): Restaurant | null {
  const maxPx = selectedId ? 26 : zoom >= 10 ? 16 : zoom >= 7 ? 12 : 9
  const maxD = maxPx * maxPx
  let best: Restaurant | null = null
  let bestD = maxD
  const bounds = map.getBounds().pad(0.05)
  for (const r of list) {
    if (!bounds.contains([r.lat, r.lng])) continue
    const p = map.latLngToContainerPoint([r.lat, r.lng])
    const d = (p.x - pt.x) ** 2 + (p.y - pt.y) ** 2
    if (d < bestD) {
      bestD = d
      best = r
    }
  }
  return best
}

export function findNearestOsm(map: L.Map, list: OsmSite[], pt: L.Point): OsmSite | null {
  if (map.getZoom() < 11) return null
  let best: OsmSite | null = null
  let bestD = 14 * 14
  for (const s of list) {
    const p = map.latLngToContainerPoint([s.lat, s.lng])
    const d = (p.x - pt.x) ** 2 + (p.y - pt.y) ** 2
    if (d < bestD) {
      bestD = d
      best = s
    }
  }
  return best
}
