import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { MapContainer, TileLayer, useMap, useMapEvents, CircleMarker } from 'react-leaflet'
import L from 'leaflet'
import { useGameStore } from '../store/gameStore'
import { resolveLocation } from '../lib/geo'
import { filterHotels } from '../lib/economy'
import { createHotelsCanvasLayer, findNearestHotel, hotelTooltipMeta } from '../lib/hotelsCanvasLayer'
import { formatEUR, gameDay } from '../lib/format'
import type { Hotel } from '../types'

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
  const playMode = useGameStore((s) => s.playMode)
  useMapEvents({
    click(e) {
      if (busy) return
      const map = e.target as L.Map
      const nearest = findNearestHotel(map, hotels, e.containerPoint, map.getZoom(), selectedId)
      if (nearest) {
        onSelectHotel(nearest.id)
        return
      }
      if (playMode === 'cliente') return
      if (mode === 'build') onBuild(e.latlng.lat, e.latlng.lng)
    },
    mousemove(e) {
      // hover handled in HotelsLayer via map events too
      void e
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
  }, [map, hotels, onHover, selectedId])

  return null
}

function TileLayers() {
  const layer = useGameStore((s) => s.mapLayer)
  if (layer === 'satellite') {
    return (
      <TileLayer
        attribution="Tiles &copy; Esri"
        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
      />
    )
  }
  if (layer === 'hybrid') {
    return (
      <>
        <TileLayer
          attribution="Tiles &copy; Esri"
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        />
        <TileLayer
          attribution="&copy; OpenStreetMap"
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png"
          opacity={0.9}
        />
      </>
    )
  }
  return (
    <TileLayer
      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    />
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
  const playMode = useGameStore((s) => s.playMode)
  const setClientBookingHotel = useGameStore((s) => s.setClientBookingHotel)
  const clientStay = useGameStore((s) => s.client.stay)
  const bookingHotelId = useGameStore((s) => s.client.bookingHotelId)
  const [busy, setBusy] = useState(false)
  const [hint, setHint] = useState<string | null>(null)
  const [pending, setPending] = useState<{ lat: number; lng: number } | null>(null)
  const [hover, setHover] = useState<{ hotel: Hotel; x: number; y: number } | null>(null)

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

  const tip = hover ? hotelTooltipMeta(hover.hotel) : null

  function onSelectHotel(id: string) {
    if (playMode === 'cliente') {
      setClientBookingHotel(id)
      return
    }
    selectHotel(id)
  }

  return (
    <div className={`map-shell map-shell--${mapMode}${playMode === 'cliente' ? ' map-shell--client' : ''}${clientStay?.status === 'checked_in' ? ' is-hidden-by-stay' : ''}`}>
      <MapContainer
        center={[20, 0]}
        zoom={3}
        minZoom={2}
        maxZoom={18}
        className="world-map"
        worldCopyJump
        preferCanvas
      >
        <TileLayers />
        <MapClickHandler
          busy={busy}
          onBuild={handleBuild}
          onSelectHotel={onSelectHotel}
          hotels={filtered}
          selectedId={playMode === 'cliente' ? bookingHotelId : selectedHotelId}
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
          (playMode === 'cliente'
            ? 'Modo Cliente: clic en un hotel tuyo para reservar esta noche'
            : mapMode === 'build'
              ? 'Modo construir: clic en tierra para un hotel nuevo · clic en un hotel para verlo'
              : 'Modo ver: clic en un hotel para abrir su ficha · cambia a Construir para expandir')}
      </p>
    </div>
  )
}
