import { useCallback, useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import { useGameStore } from '../store/gameStore'
import { createSitesCanvasLayer, findNearestOsm, findNearestRestaurant } from '../lib/canvasLayer'
import { formatEUR } from '../lib/format'
import { brandById } from '../data/brands'
import type { Restaurant } from '../types'

const STREETS = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png'
const SAT = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
const ATTR =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> · CARTO'

function MapHealth() {
  const map = useMap()
  useEffect(() => {
    const fix = () => {
      try {
        if (map.getContainer().clientWidth > 2) map.invalidateSize({ pan: false })
      } catch {
        /* ignore */
      }
    }
    fix()
    const t = [0, 80, 300, 900].map((ms) => window.setTimeout(fix, ms))
    const ro = new ResizeObserver(fix)
    ro.observe(map.getContainer())
    window.addEventListener('resize', fix)
    return () => {
      t.forEach((id) => window.clearTimeout(id))
      ro.disconnect()
      window.removeEventListener('resize', fix)
    }
  }, [map])
  return null
}

function MapFocus() {
  const map = useMap()
  const focus = useGameStore((s) => s.mapFocus)
  const setMapFocus = useGameStore((s) => s.setMapFocus)
  useEffect(() => {
    if (!focus) return
    map.flyTo([focus.lat, focus.lng], focus.zoom ?? Math.max(map.getZoom(), 11), { duration: 0.8 })
    const t = window.setTimeout(() => setMapFocus(null), 850)
    return () => window.clearTimeout(t)
  }, [focus, map, setMapFocus])
  return null
}

function ScoutButton({ sat, setSat }: { sat: boolean; setSat: (v: boolean | ((p: boolean) => boolean)) => void }) {
  const map = useMap()
  const mapMode = useGameStore((s) => s.mapMode)
  const setMapMode = useGameStore((s) => s.setMapMode)
  const setPanel = useGameStore((s) => s.setPanel)
  const scoutView = useGameStore((s) => s.scoutView)
  const scoutBusy = useGameStore((s) => s.scoutBusy)
  const toolsRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = toolsRef.current
    if (!el) return
    L.DomEvent.disableClickPropagation(el)
    L.DomEvent.disableScrollPropagation(el)
  }, [])
  return (
    <div className="map-tools" ref={toolsRef}>
      <button type="button" className={`chip ${mapMode === 'explore' ? 'on' : ''}`} onClick={() => setMapMode('explore')}>
        Explorar
      </button>
      <button type="button" className={`chip ${mapMode === 'found' ? 'on' : ''}`} onClick={() => setMapMode('found')}>
        Fundar (clic)
      </button>
      <button
        type="button"
        className={`chip ${mapMode === 'scout' ? 'on' : ''}`}
        disabled={scoutBusy}
        onClick={() => {
          const b = map.getBounds()
          void scoutView({ south: b.getSouth(), west: b.getWest(), north: b.getNorth(), east: b.getEast() })
        }}
      >
        {scoutBusy ? 'OSM…' : 'Scout OSM'}
      </button>
      <button type="button" className="chip" onClick={() => setPanel('mass')}>
        Fundación masiva
      </button>
      <button type="button" className="chip" onClick={() => setSat((v) => !v)}>
        {sat ? 'Calles OSM' : 'Satélite'}
      </button>
    </div>
  )
}

function Clicks({
  restaurants,
  selectedId,
}: {
  restaurants: Restaurant[]
  selectedId: string | null
}) {
  const mapMode = useGameStore((s) => s.mapMode)
  const osmSites = useGameStore((s) => s.osmSites)
  const prepareFound = useGameStore((s) => s.prepareFound)
  const setSelected = useGameStore((s) => s.setSelected)
  const setPanel = useGameStore((s) => s.setPanel)
  const acquireOsm = useGameStore((s) => s.acquireOsm)
  const autoBrand = useGameStore((s) => s.autoBrand)

  useMapEvents({
    click(e) {
      const map = e.target as L.Map
      const near = findNearestRestaurant(map, restaurants, e.containerPoint, map.getZoom(), selectedId)
      if (near) {
        setSelected(near.id)
        setPanel('list')
        return
      }
      if (mapMode === 'scout' || mapMode === 'found') {
        const osm = findNearestOsm(map, osmSites, e.containerPoint)
        if (osm) {
          acquireOsm(osm, autoBrand)
          return
        }
      }
      if (mapMode === 'found') void prepareFound(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

function SitesLayer({
  restaurants,
  selectedId,
  onHover,
}: {
  restaurants: Restaurant[]
  selectedId: string | null
  onHover: (p: { r: Restaurant; x: number; y: number } | null) => void
}) {
  const map = useMap()
  const osmSites = useGameStore((s) => s.osmSites)
  const layerRef = useRef<ReturnType<typeof createSitesCanvasLayer> | null>(null)

  useEffect(() => {
    const layer = createSitesCanvasLayer()
    layerRef.current = layer
    map.addLayer(layer)
    return () => {
      map.removeLayer(layer)
      layerRef.current = null
    }
  }, [map])

  useEffect(() => {
    layerRef.current?.setData(restaurants, osmSites, selectedId)
  }, [restaurants, osmSites, selectedId])

  useEffect(() => {
    const onMove = (e: L.LeafletMouseEvent) => {
      const near = findNearestRestaurant(map, restaurants, e.containerPoint, map.getZoom(), selectedId)
      onHover(near ? { r: near, x: e.containerPoint.x, y: e.containerPoint.y } : null)
    }
    map.on('mousemove', onMove)
    map.on('mouseout', () => onHover(null))
    return () => {
      map.off('mousemove', onMove)
    }
  }, [map, restaurants, selectedId, onHover])

  return null
}

export function WorldMap() {
  const restaurants = useGameStore((s) => s.restaurants)
  const selectedId = useGameStore((s) => s.selectedId)
  const [sat, setSat] = useState(false)
  const [hover, setHover] = useState<{ r: Restaurant; x: number; y: number } | null>(null)

  const onHover = useCallback((p: { r: Restaurant; x: number; y: number } | null) => setHover(p), [])

  return (
    <div className="map-wrap">
      <MapContainer center={[36.7213, -4.4214]} zoom={11} minZoom={2} maxZoom={19} worldCopyJump>
        <TileLayer attribution={ATTR} url={sat ? SAT : STREETS} maxZoom={19} />
        <MapHealth />
        <MapFocus />
        <Clicks restaurants={restaurants} selectedId={selectedId} />
        <SitesLayer restaurants={restaurants} selectedId={selectedId} onHover={onHover} />
        <ScoutButton sat={sat} setSat={setSat} />
      </MapContainer>
      <div className="legend">
        <div>
          <i style={{ background: '#c45c26' }} />
          Vuestros locales (canvas, miles a la vez)
        </div>
        <div>
          <i style={{ background: 'transparent', border: '1.5px solid #e8c47a' }} />
          Locales OSM al hacer Scout (zoom alto)
        </div>
      </div>
      {hover && (
        <div className="hover-tip" style={{ left: hover.x, top: hover.y }}>
          <b>{hover.r.name}</b>
          <div className="muted">
            {brandById(hover.r.brandId).name} · {hover.r.city}
          </div>
          <div>{formatEUR(hover.r.lastNet)} / día</div>
        </div>
      )}
    </div>
  )
}
