import { useEffect, useState } from 'react'
import { useGameStore } from '../store/gameStore'
import { searchPlaces } from '../lib/osm'
import type { PlaceHit } from '../types'

export function PlaceSearch() {
  const setMapFocus = useGameStore((s) => s.setMapFocus)
  const [q, setQ] = useState('')
  const [hits, setHits] = useState<PlaceHit[]>([])
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (q.trim().length < 2) {
      setHits([])
      return
    }
    const t = window.setTimeout(async () => {
      const found = await searchPlaces(q)
      setHits(found)
      setOpen(true)
    }, 380)
    return () => window.clearTimeout(t)
  }, [q])

  return (
    <div className="place-search">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onFocus={() => hits.length && setOpen(true)}
        placeholder="Buscar ciudad en OSM…"
        aria-label="Buscar ciudad"
      />
      {open && hits.length > 0 && (
        <ul className="place-search__list">
          {hits.map((h) => (
            <li key={`${h.lat}-${h.lng}-${h.label}`}>
              <button
                type="button"
                onClick={() => {
                  setMapFocus({ lat: h.lat, lng: h.lng, zoom: 13 })
                  setQ(h.label.split(',').slice(0, 2).join(','))
                  setOpen(false)
                }}
              >
                {h.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
