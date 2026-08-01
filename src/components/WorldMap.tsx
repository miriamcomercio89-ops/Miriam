import { useEffect, useMemo, useState } from 'react'
import { MapContainer, TileLayer, useMap, useMapEvents, CircleMarker } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet.markercluster'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import { useGameStore } from '../store/gameStore'
import { resolveLocation } from '../lib/geo'
import { getSubsidiary, subsidiaryLogoSvg } from '../data/subsidiaries'
import type { Hotel } from '../types'

function MapClickHandler({ onPick, busy }: { onPick: (lat: number, lng: number) => void; busy: boolean }) {
  useMapEvents({
    click(e) {
      if (busy) return
      onPick(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

function ZoomWatcher({ onZoom }: { onZoom: (z: number) => void }) {
  const map = useMap()
  useEffect(() => {
    const sync = () => onZoom(map.getZoom())
    sync()
    map.on('zoomend', sync)
    return () => {
      map.off('zoomend', sync)
    }
  }, [map, onZoom])
  return null
}

function logoIcon(subsidiaryId: string, selected: boolean) {
  const sub = getSubsidiary(subsidiaryId)
  if (!sub) return undefined
  const url = subsidiaryLogoSvg(sub, selected ? 52 : 44)
  const size = selected ? 44 : 36
  return L.divIcon({
    className: `hotel-pin ${selected ? 'hotel-pin--selected' : ''}`,
    html: `<img src="${url}" alt="${sub.name}" width="${size}" height="${size}" />`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  })
}

function HotelClusterLayer({
  hotels,
  selectedId,
  onSelect,
}: {
  hotels: Hotel[]
  selectedId: string | null
  onSelect: (id: string) => void
}) {
  const map = useMap()

  useEffect(() => {
    const cluster = L.markerClusterGroup({
      showCoverageOnHover: false,
      maxClusterRadius: 50,
      spiderfyOnMaxZoom: true,
      disableClusteringAtZoom: 7,
      iconCreateFunction(c) {
        const n = c.getChildCount()
        const size = n > 50 ? 48 : n > 15 ? 42 : 36
        return L.divIcon({
          html: `<div class="orbis-cluster"><span>${n}</span></div>`,
          className: 'orbis-cluster-wrap',
          iconSize: L.point(size, size),
        })
      },
    })

    for (const h of hotels) {
      const icon = logoIcon(h.subsidiaryId, selectedId === h.id)
      if (!icon) continue
      const marker = L.marker([h.lat, h.lng], { icon })
      marker.on('click', (e) => {
        L.DomEvent.stopPropagation(e)
        onSelect(h.id)
      })
      cluster.addLayer(marker)
    }

    map.addLayer(cluster)
    return () => {
      map.removeLayer(cluster)
      cluster.clearLayers()
    }
  }, [map, hotels, selectedId, onSelect])

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
  const selectHotel = useGameStore((s) => s.selectHotel)
  const openBuildAt = useGameStore((s) => s.openBuildAt)
  const selectedHotelId = useGameStore((s) => s.selectedHotelId)
  const [busy, setBusy] = useState(false)
  const [hint, setHint] = useState<string | null>(null)
  const [pending, setPending] = useState<{ lat: number; lng: number } | null>(null)
  const [zoom, setZoom] = useState(3)

  const filtered = useMemo(() => {
    return hotels.filter((h) => {
      if (filters.subsidiaryId !== 'all' && h.subsidiaryId !== filters.subsidiaryId) return false
      if (h.stars < filters.minStars) return false
      if (filters.profit === 'profit' && h.lastDayRevenue - h.lastDayCosts <= 0 && h.lifetimeGuests > 0) return false
      if (filters.profit === 'loss' && (h.lastDayRevenue - h.lastDayCosts >= 0 || h.lifetimeGuests === 0)) return false
      if (filters.profit === 'new' && h.lifetimeGuests > 0) return false
      return true
    })
  }, [hotels, filters])

  async function handlePick(lat: number, lng: number) {
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

  const useSoftCircles = filtered.length > 800 && zoom < 5

  return (
    <div className="map-shell">
      <MapContainer center={[20, 0]} zoom={3} minZoom={2} maxZoom={18} className="world-map" worldCopyJump>
        <TileLayers />
        <MapClickHandler onPick={handlePick} busy={busy} />
        <ZoomWatcher onZoom={setZoom} />

        {useSoftCircles
          ? filtered.map((h) => (
              <CircleMarker
                key={h.id}
                center={[h.lat, h.lng]}
                radius={selectedHotelId === h.id ? 7 : 4}
                pathOptions={{
                  color: getSubsidiary(h.subsidiaryId)?.accent ?? '#C4A35A',
                  fillColor: getSubsidiary(h.subsidiaryId)?.color ?? '#0B1F33',
                  fillOpacity: 0.9,
                  weight: 1,
                }}
                eventHandlers={{
                  click: (e) => {
                    L.DomEvent.stopPropagation(e)
                    selectHotel(h.id)
                  },
                }}
              />
            ))
          : (
            <HotelClusterLayer
              hotels={filtered}
              selectedId={selectedHotelId}
              onSelect={selectHotel}
            />
          )}

        {pending && (
          <CircleMarker
            center={[pending.lat, pending.lng]}
            radius={7}
            pathOptions={{ color: '#C4A35A', fillColor: '#C4A35A', fillOpacity: 0.4 }}
          />
        )}
      </MapContainer>

      <p className="map-hint">
        {hint ?? 'Clic en tierra firme para construir · logos de filial en cada hotel · clustering suave al alejar'}
      </p>
    </div>
  )
}
