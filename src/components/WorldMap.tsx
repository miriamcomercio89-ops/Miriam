import { useEffect, useMemo, useRef, useState } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents, CircleMarker } from 'react-leaflet'
import L from 'leaflet'
import { useGameStore } from '../store/gameStore'
import { resolveLocation } from '../lib/geo'
import { getSubsidiary, subsidiaryLogoSvg } from '../data/subsidiaries'

function MapClickHandler({
  onPick,
  busy,
}: {
  onPick: (lat: number, lng: number) => void
  busy: boolean
}) {
  useMapEvents({
    click(e) {
      if (busy) return
      onPick(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

function logoIcon(subsidiaryId: string) {
  const sub = getSubsidiary(subsidiaryId)
  if (!sub) return undefined
  const url = subsidiaryLogoSvg(sub, 44)
  return L.divIcon({
    className: 'hotel-pin',
    html: `<img src="${url}" alt="${sub.name}" width="36" height="36" />`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  })
}

export function WorldMap() {
  const hotels = useGameStore((s) => s.hotels)
  const selectHotel = useGameStore((s) => s.selectHotel)
  const openBuildAt = useGameStore((s) => s.openBuildAt)
  const selectedHotelId = useGameStore((s) => s.selectedHotelId)
  const [busy, setBusy] = useState(false)
  const [hint, setHint] = useState<string | null>(null)
  const [pending, setPending] = useState<{ lat: number; lng: number } | null>(null)
  const hintTimer = useRef<number | null>(null)

  const icons = useMemo(() => {
    const map = new Map<string, L.DivIcon>()
    for (const h of hotels) {
      if (!map.has(h.subsidiaryId)) {
        const icon = logoIcon(h.subsidiaryId)
        if (icon) map.set(h.subsidiaryId, icon)
      }
    }
    return map
  }, [hotels])

  useEffect(() => {
    return () => {
      if (hintTimer.current) window.clearTimeout(hintTimer.current)
    }
  }, [])

  async function handlePick(lat: number, lng: number) {
    setBusy(true)
    setPending({ lat, lng })
    setHint('Analizando ubicación…')
    try {
      const loc = await resolveLocation(lat, lng)
      if (!loc.isLand) {
        setHint('Solo se puede construir en tierra firme.')
        if (hintTimer.current) window.clearTimeout(hintTimer.current)
        hintTimer.current = window.setTimeout(() => setHint(null), 2800)
        return
      }
      openBuildAt(loc)
      setHint(null)
    } catch {
      setHint('No se pudo resolver la ubicación. Inténtalo de nuevo.')
      if (hintTimer.current) window.clearTimeout(hintTimer.current)
      hintTimer.current = window.setTimeout(() => setHint(null), 2800)
    } finally {
      setBusy(false)
      setPending(null)
    }
  }

  // When many hotels, use lightweight circles at low zoom via CSS; markers always for selection accuracy
  const useCircles = hotels.length > 400

  return (
    <div className="map-shell">
      <MapContainer
        center={[20, 0]}
        zoom={3}
        minZoom={2}
        maxZoom={18}
        className="world-map"
        worldCopyJump
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapClickHandler onPick={handlePick} busy={busy} />

        {useCircles
          ? hotels.map((h) => (
              <CircleMarker
                key={h.id}
                center={[h.lat, h.lng]}
                radius={selectedHotelId === h.id ? 8 : 5}
                pathOptions={{
                  color: getSubsidiary(h.subsidiaryId)?.accent ?? '#C4A35A',
                  fillColor: getSubsidiary(h.subsidiaryId)?.color ?? '#0B1F33',
                  fillOpacity: 0.9,
                  weight: 1.5,
                }}
                eventHandlers={{ click: (e) => { L.DomEvent.stopPropagation(e); selectHotel(h.id) } }}
              />
            ))
          : hotels.map((h) => (
              <Marker
                key={h.id}
                position={[h.lat, h.lng]}
                icon={icons.get(h.subsidiaryId)}
                eventHandlers={{
                  click: (e) => {
                    L.DomEvent.stopPropagation(e)
                    selectHotel(h.id)
                  },
                }}
                opacity={selectedHotelId && selectedHotelId !== h.id ? 0.75 : 1}
              />
            ))}

        {pending && (
          <CircleMarker
            center={[pending.lat, pending.lng]}
            radius={7}
            pathOptions={{ color: '#C4A35A', fillColor: '#C4A35A', fillOpacity: 0.4 }}
          />
        )}
      </MapContainer>

      <p className="map-hint">
        {hint ?? 'Haz clic en tierra firme para inspeccionar el lugar y construir.'}
      </p>
    </div>
  )
}
