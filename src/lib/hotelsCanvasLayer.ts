import L from 'leaflet'
import type { Hotel } from '../types'
import { SUBSIDIARY_COLOR, SUBSIDIARY_ACCENT, getSubsidiary, subsidiaryLogoSvg } from '../data/subsidiaries'
import { hotelNet } from '../lib/economy'

/**
 * Canvas overlay for 50k+ hotels (draw-only, no pointer capture).
 * Picking is done from map click/mousemove via findNearestHotel().
 */
export function createHotelsCanvasLayer() {
  const Layer = L.Layer.extend({
    onAdd(map: L.Map) {
      this._map = map
      this._canvas = L.DomUtil.create('canvas', 'orbis-hotels-canvas')
      Object.assign(this._canvas.style, {
        position: 'absolute',
        left: '0',
        top: '0',
        pointerEvents: 'none',
        zIndex: '450',
      })
      map.getContainer().appendChild(this._canvas)
      this._ctx = this._canvas.getContext('2d')
      this._hotels = [] as Hotel[]
      this._selectedId = null as string | null
      this._logoCache = new Map<string, HTMLImageElement>()
      this._onMove = () => this._redraw()
      map.on('move zoom moveend zoomend resize viewreset', this._onMove, this)
      this._redraw()
    },

    onRemove(map: L.Map) {
      map.off('move zoom moveend zoomend resize viewreset', this._onMove, this)
      L.DomUtil.remove(this._canvas)
    },

    setData(next: Hotel[], selected: string | null) {
      this._hotels = next
      this._selectedId = selected
      this._redraw()
    },

    _redraw() {
      const map: L.Map = this._map
      const canvas: HTMLCanvasElement = this._canvas
      const ctx: CanvasRenderingContext2D = this._ctx
      if (!map || !canvas || !ctx) return

      const size = map.getSize()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.floor(size.x * dpr)
      canvas.height = Math.floor(size.y * dpr)
      canvas.style.width = `${size.x}px`
      canvas.style.height = `${size.y}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, size.x, size.y)

      const bounds = map.getBounds().pad(0.12)
      const zoom = map.getZoom()
      const list: Hotel[] = this._hotels
      const selectedId: string | null = this._selectedId

      if (zoom < 6 && list.length > 3000) {
        this._drawClusters(ctx, map, list, zoom, size)
        return
      }
      if (zoom < 5 && list.length > 1500) {
        this._drawClusters(ctx, map, list, zoom, size)
        return
      }

      const useLogos = zoom >= 9 && list.length < 8000
      let logos = 0
      const maxLogos = list.length > 5000 ? 120 : 280

      // Sampling when extremely dense at mid zoom
      const step = zoom < 7 && list.length > 8000 ? 2 : 1

      for (let i = 0; i < list.length; i += step) {
        const h = list[i]
        if (!bounds.contains([h.lat, h.lng])) continue
        const p = map.latLngToContainerPoint([h.lat, h.lng])
        const selected = h.id === selectedId
        const color = SUBSIDIARY_COLOR[h.subsidiaryId] ?? '#C4A35A'
        const accent = SUBSIDIARY_ACCENT[h.subsidiaryId] ?? '#F2E6C8'

        if (useLogos && logos < maxLogos) {
          this._drawLogo(ctx, h.subsidiaryId, p.x, p.y, selected)
          logos++
        } else {
          const r = selected ? 5.5 : zoom >= 6 ? 3.2 : 2.2
          ctx.beginPath()
          ctx.fillStyle = color
          ctx.strokeStyle = selected ? accent : 'rgba(255,255,255,0.35)'
          ctx.lineWidth = selected ? 2 : 1
          ctx.arc(p.x, p.y, r, 0, Math.PI * 2)
          ctx.fill()
          ctx.stroke()
        }
      }
    },

    _drawClusters(
      ctx: CanvasRenderingContext2D,
      map: L.Map,
      list: Hotel[],
      zoom: number,
      size: L.Point,
    ) {
      const cell = zoom < 3 ? 52 : zoom < 4 ? 40 : 30
      const grid = new Map<string, { n: number; x: number; y: number; color: string }>()

      for (let i = 0; i < list.length; i++) {
        const h = list[i]
        const p = map.latLngToContainerPoint([h.lat, h.lng])
        if (p.x < -50 || p.y < -50 || p.x > size.x + 50 || p.y > size.y + 50) continue
        const gx = Math.floor(p.x / cell)
        const gy = Math.floor(p.y / cell)
        const key = `${gx}:${gy}`
        const cur = grid.get(key)
        if (cur) {
          cur.n++
          cur.x += (p.x - cur.x) / cur.n
          cur.y += (p.y - cur.y) / cur.n
        } else {
          grid.set(key, {
            n: 1,
            x: p.x,
            y: p.y,
            color: SUBSIDIARY_COLOR[h.subsidiaryId] ?? '#1f5f73',
          })
        }
      }

      for (const c of grid.values()) {
        const r = Math.min(24, 8 + Math.sqrt(c.n) * 1.7)
        ctx.beginPath()
        ctx.fillStyle = c.color
        ctx.strokeStyle = '#C4A35A'
        ctx.lineWidth = 1.5
        ctx.arc(c.x, c.y, r, 0, Math.PI * 2)
        ctx.fill()
        ctx.stroke()
        ctx.fillStyle = '#F7F3EA'
        ctx.font = 'bold 10px Sora, sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(c.n > 999 ? `${Math.round(c.n / 1000)}k` : String(c.n), c.x, c.y)
      }
    },

    _drawLogo(ctx: CanvasRenderingContext2D, subsidiaryId: string, x: number, y: number, selected: boolean) {
      const cache: Map<string, HTMLImageElement> = this._logoCache
      let img = cache.get(subsidiaryId)
      if (!img) {
        const sub = getSubsidiary(subsidiaryId)
        if (!sub) return
        img = new Image()
        img.src = subsidiaryLogoSvg(sub, 64)
        cache.set(subsidiaryId, img)
        img.onload = () => this._redraw()
      }
      if (!img.complete) {
        ctx.beginPath()
        ctx.fillStyle = SUBSIDIARY_COLOR[subsidiaryId] ?? '#C4A35A'
        ctx.arc(x, y, selected ? 6 : 4, 0, Math.PI * 2)
        ctx.fill()
        return
      }
      const s = selected ? 28 : 22
      ctx.drawImage(img, x - s / 2, y - s / 2, s, s)
    },
  })

  return new Layer()
}

export function findNearestHotel(
  map: L.Map,
  hotels: Hotel[],
  containerPoint: L.Point,
  zoom: number,
): Hotel | null {
  const maxDist = zoom >= 8 ? 22 : zoom >= 5 ? 14 : 11
  let best: Hotel | null = null
  let bestD = maxDist * maxDist
  const bounds = map.getBounds().pad(0.05)

  // Fast path: skip hotels outside padded bounds; subsample at low zoom
  const step = zoom < 5 && hotels.length > 4000 ? 3 : zoom < 7 && hotels.length > 8000 ? 2 : 1

  for (let i = 0; i < hotels.length; i += step) {
    const h = hotels[i]
    if (!bounds.contains([h.lat, h.lng])) continue
    const p = map.latLngToContainerPoint([h.lat, h.lng])
    const dx = p.x - containerPoint.x
    const dy = p.y - containerPoint.y
    const d = dx * dx + dy * dy
    if (d < bestD) {
      bestD = d
      best = h
    }
  }
  return best
}

export function hotelTooltipMeta(h: Hotel) {
  const sub = getSubsidiary(h.subsidiaryId)
  return {
    title: h.name,
    sub: `${sub?.name ?? 'Orbis'} · ${h.city}`,
    net: hotelNet(h),
    logo: sub ? subsidiaryLogoSvg(sub, 40) : '',
  }
}
