import { useEffect, useState } from 'react'
import { useGameStore } from '../store/gameStore'
import { searchPlaces, type PlaceHit } from '../lib/search'

export function PlaceSearch() {
  const setMapFocus = useGameStore((s) => s.setMapFocus)
  const [q, setQ] = useState('')
  const [hits, setHits] = useState<PlaceHit[]>([])
  const [busy, setBusy] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (q.trim().length < 2) {
      setHits([])
      return
    }
    const t = window.setTimeout(async () => {
      setBusy(true)
      try {
        setHits(await searchPlaces(q))
        setOpen(true)
      } finally {
        setBusy(false)
      }
    }, 350)
    return () => window.clearTimeout(t)
  }, [q])

  return (
    <div className="place-search">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onFocus={() => hits.length && setOpen(true)}
        placeholder="Buscar ciudad o país…"
        aria-label="Buscar ciudad o país"
        title="Escribe una ciudad o país para centrar el mapa"
      />
      {busy && <span className="place-search__busy">…</span>}
      {open && hits.length > 0 && (
        <ul className="place-search__list">
          {hits.map((h) => (
            <li key={`${h.lat}-${h.lng}-${h.label}`}>
              <button
                type="button"
                onClick={() => {
                  setMapFocus({ lat: h.lat, lng: h.lng, zoom: 10 })
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
