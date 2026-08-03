import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { MapContainer, TileLayer, useMap, useMapEvents, CircleMarker } from 'react-leaflet'
import L from 'leaflet'
import { useGameStore } from '../store/gameStore'
import { resolveLocation } from '../lib/geo'
import { filterHotels } from '../lib/economy'
import { createHotelsCanvasLayer, findNearestHotel, hotelTooltipMeta } from '../lib/hotelsCanvasLayer'
import { formatEUR, gameDay } from '../lib/format'
import type { Hotel } from '../types'

/** Carto Voyager sin {r}: más fiable en file:// (offline). */
const STREETS_URL = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png'
const STREETS_FALLBACK = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
const STREETS_ATTR =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
const SAT_URL =
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
const LABELS_URL = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}.png'

function MapClickHandler({
  busy,
  onBuild,
  onSelectHotel,
  hotels,
  selectedId,
}: {
  busy: boolean
  onBuild: (lat: number, lng: number) => void
  onSelectHotel: (id: string) => void
  hotels: Hotel[]
  selectedId: string | null
}) {
  const mode = useGameStore((s) => s.mapMode)
  useMapEvents({
    click(e) {
      if (busy) return
      const map = e.target as L.Map
      const nearest = findNearestHotel(map, hotels, e.containerPoint, map.getZoom(), selectedId)
      if (nearest) {
        onSelectHotel(nearest.id)
        return
      }
      if (mode === 'build') onBuild(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

function MapFocusController() {
  const map = useMap()
  const focus = useGameStore((s) => s.mapFocus)
  const setMapFocus = useGameStore((s) => s.setMapFocus)
  useEffect(() => {
    if (!focus) return
    map.flyTo([focus.lat, focus.lng], focus.zoom ?? Math.max(map.getZoom(), 9), { duration: 0.85 })
    const t = window.setTimeout(() => setMapFocus(null), 900)
    return () => window.clearTimeout(t)
  }, [focus, map, setMapFocus])
  return null
}

/** Mantiene el mapa vivo: tamaño, tiles y arranque tras Continuar partida. */
function MapHealth() {
  const map = useMap()
  const simulating = useGameStore((s) => s.simulating)
  const wasSimulating = useRef(false)
  const tileFails = useRef(0)

  useEffect(() => {
    const fix = () => {
      try {
        const el = map.getContainer()
        if (!el || el.clientWidth < 2 || el.clientHeight < 2) return
        map.invalidateSize({ pan: false })
      } catch {
        /* mapa destruido */
      }
    }
    // Tras salir del landing el contenedor a menudo mide 0px el primer frame
    fix()
    const t1 = window.setTimeout(fix, 0)
    const t2 = window.setTimeout(fix, 80)
    const t3 = window.setTimeout(fix, 250)
    const t4 = window.setTimeout(fix, 700)
    const t5 = window.setTimeout(fix, 1500)

    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => fix()) : null
    const el = map.getContainer()
    ro?.observe(el)
    if (el.parentElement) ro?.observe(el.parentElement)
    window.addEventListener('resize', fix)
    document.addEventListener('visibilitychange', fix)

    const onTileLoad = () => {
      tileFails.current = 0
    }
    const onTileError = () => {
      tileFails.current += 1
      // Tras varios fallos, forzar redraw del mapa
      if (tileFails.current === 4 || tileFails.current === 12) {
        fix()
        try {
          map.eachLayer((layer) => {
            const anyL = layer as L.TileLayer & { redraw?: () => void }
            if (typeof anyL.redraw === 'function') anyL.redraw()
          })
        } catch {
          /* ignore */
        }
      }
    }
    map.on('tileload', onTileLoad)
    map.on('tileerror', onTileError)
    map.whenReady(fix)

    const pulse = window.setInterval(fix, 10000)
    return () => {
      window.clearTimeout(t1)
      window.clearTimeout(t2)
      window.clearTimeout(t3)
      window.clearTimeout(t4)
      window.clearTimeout(t5)
      ro?.disconnect()
      window.removeEventListener('resize', fix)
      document.removeEventListener('visibilitychange', fix)
      map.off('tileload', onTileLoad)
      map.off('tileerror', onTileError)
      window.clearInterval(pulse)
    }
  }, [map])

  useEffect(() => {
    if (wasSimulating.current && !simulating) {
      window.requestAnimationFrame(() => {
        try {
          map.invalidateSize({ pan: false })
          map.fire('viewreset')
        } catch {
          /* ignore */
        }
      })
    }
    wasSimulating.current = simulating
  }, [simulating, map])

  return null
}

function HotelsCanvas({
  hotels,
  selectedId,
  onHover,
}: {
  hotels: Hotel[]
  selectedId: string | null
  onHover: (payload: { hotel: Hotel; x: number; y: number } | null) => void
}) {
  const map = useMap()
  const simulating = useGameStore((s) => s.simulating)
  const layerRef = useRef<L.Layer & { setData: (h: Hotel[], s: string | null) => void } | null>(null)

  useEffect(() => {
    const layer = createHotelsCanvasLayer() as L.Layer & { setData: (h: Hotel[], s: string | null) => void }
    layerRef.current = layer
    map.addLayer(layer)
    return () => {
      map.removeLayer(layer)
      layerRef.current = null
    }
  }, [map])

  useEffect(() => {
    layerRef.current?.setData(hotels, selectedId)
  }, [hotels, selectedId])

  useEffect(() => {
    if (simulating) {
      onHover(null)
      return
    }
    let raf = 0
    let lastId: string | null = null
    const onMove = (e: L.LeafletMouseEvent) => {
      if (raf) cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const nearest = findNearestHotel(map, hotels, e.containerPoint, map.getZoom(), selectedId)
        const id = nearest?.id ?? null
        if (id === lastId && nearest) {
          onHover({ hotel: nearest, x: e.containerPoint.x, y: e.containerPoint.y })
          return
        }
        lastId = id
        if (!nearest) {
          onHover(null)
          return
        }
        onHover({ hotel: nearest, x: e.containerPoint.x, y: e.containerPoint.y })
      })
    }
    const clear = () => {
      lastId = null
      onHover(null)
    }
    map.on('mousemove', onMove)
    map.on('mouseout', clear)
    return () => {
      if (raf) cancelAnimationFrame(raf)
      map.off('mousemove', onMove)
      map.off('mouseout', clear)
    }
  }, [map, hotels, onHover, selectedId, simulating])

  return null
}

function TileLayers() {
  const layer = useGameStore((s) => s.mapLayer)
  const [streetsUrl, setStreetsUrl] = useState(STREETS_URL)
  const fails = useRef(0)

  // Sin crossOrigin: en file:// (zip offline) CORS rompe todas las tiles.
  const common = {
    maxZoom: 18,
    keepBuffer: 2,
    updateWhenIdle: true,
    updateWhenZooming: false,
    detectRetina: false,
  }

  useMapEvents({
    tileerror() {
      if (layer !== 'streets') return
      fails.current += 1
      if (fails.current >= 6 && streetsUrl !== STREETS_FALLBACK) {
        setStreetsUrl(STREETS_FALLBACK)
      }
    },
  })

  if (layer === 'satellite') {
    return <TileLayer key="sat" attribution="Tiles &copy; Esri" url={SAT_URL} {...common} />
  }
  if (layer === 'hybrid') {
    return (
      <>
        <TileLayer key="hy-sat" attribution="Tiles &copy; Esri" url={SAT_URL} {...common} />
        <TileLayer key="hy-lab" attribution={STREETS_ATTR} url={LABELS_URL} opacity={0.9} {...common} />
      </>
    )
  }
  return (
    <TileLayer key={`streets-${streetsUrl}`} attribution={STREETS_ATTR} url={streetsUrl} {...common} />
  )
}

export function WorldMap() {
  const hotels = useGameStore((s) => s.hotels)
  const filters = useGameStore((s) => s.mapFilters)
  const gameMinutes = useGameStore((s) => s.gameMinutes)
  const selectHotel = useGameStore((s) => s.selectHotel)
  const openBuildAt = useGameStore((s) => s.openBuildAt)
  const selectedHotelId = useGameStore((s) => s.selectedHotelId)
  const mapMode = useGameStore((s) => s.mapMode)
  const simulating = useGameStore((s) => s.simulating)
  const mapEpoch = useGameStore((s) => s.mapEpoch)
  const [busy, setBusy] = useState(false)
  const [hint, setHint] = useState<string | null>(null)
  const [pending, setPending] = useState<{ lat: number; lng: number } | null>(null)
  const [hover, setHover] = useState<{ hotel: Hotel; x: number; y: number } | null>(null)
  // Esperar 2 frames de layout tras Continuar partida (grid .stage ya con tamaño)
  const [layoutReady, setLayoutReady] = useState(false)

  useEffect(() => {
    setLayoutReady(false)
    let raf2 = 0
    const raf1 = window.requestAnimationFrame(() => {
      raf2 = window.requestAnimationFrame(() => setLayoutReady(true))
    })
    return () => {
      window.cancelAnimationFrame(raf1)
      if (raf2) window.cancelAnimationFrame(raf2)
    }
  }, [mapEpoch])

  const day = gameDay(gameMinutes)
  const filtered = useMemo(() => filterHotels(hotels, filters, day), [hotels, filters, day])
  const onHover = useCallback((p: { hotel: Hotel; x: number; y: number } | null) => setHover(p), [])

  async function handleBuild(lat: number, lng: number) {
    setBusy(true)
    setPending({ lat, lng })
    setHint('Analizando ubicación…')
    try {
      const loc = await resolveLocation(lat, lng)
      if (!loc.isLand) {
        setHint('Solo se puede construir en tierra firme.')
        window.setTimeout(() => setHint(null), 2800)
        return
      }
      openBuildAt(loc)
      setHint(null)
    } catch {
      setHint('No se pudo resolver la ubicación.')
      window.setTimeout(() => setHint(null), 2800)
    } finally {
      setBusy(false)
      setPending(null)
    }
  }

  const tip = !simulating && hover ? hotelTooltipMeta(hover.hotel) : null

  return (
    <div className={`map-shell map-shell--${mapMode}${simulating ? ' map-shell--sim' : ''}`}>
      {layoutReady ? (
        <MapContainer
          key={`orbis-map-${mapEpoch}`}
          center={[20, 0]}
          zoom={3}
          minZoom={2}
          maxZoom={18}
          className="world-map"
          worldCopyJump
          preferCanvas={false}
          zoomControl
        >
          <TileLayers />
          <MapHealth />
          <MapClickHandler
            busy={busy || simulating}
            onBuild={handleBuild}
            onSelectHotel={selectHotel}
            hotels={filtered}
            selectedId={selectedHotelId}
          />
          <MapFocusController />
          <HotelsCanvas hotels={filtered} selectedId={selectedHotelId} onHover={onHover} />
          {pending && (
            <CircleMarker
              center={[pending.lat, pending.lng]}
              radius={7}
              pathOptions={{ color: '#C4A35A', fillColor: '#C4A35A', fillOpacity: 0.4 }}
            />
          )}
        </MapContainer>
      ) : (
        <div className="world-map world-map--booting" aria-hidden />
      )}

      {tip && hover && (
        <div className="map-mini" style={{ left: hover.x + 14, top: hover.y + 14 }}>
          {tip.logo && <img className="filial-logo filial-logo--md" src={tip.logo} alt="" width={56} height={56} />}
          <div>
            <strong>{tip.title}</strong>
            <span>{tip.sub}</span>
            <em className={tip.net >= 0 ? 'pos' : 'neg'}>{formatEUR(tip.net)}/día</em>
          </div>
        </div>
      )}

      <p className="map-hint">
        {hint ??
          (simulating
            ? 'Calculando el día… el mapa se actualiza al terminar'
            : !layoutReady
              ? 'Preparando mapa…'
              : mapMode === 'build'
                ? 'Modo construir: clic en tierra para un hotel nuevo · clic en un hotel para verlo'
                : 'Modo ver: clic en un hotel para abrir su ficha · cambia a Construir para expandir')}
      </p>
    </div>
  )
}
