import { useMemo, useRef, useState } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useGameStore } from '../store/gameStore'
import { filterHotels, hotelNet } from '../lib/economy'
import { formatEUR, formatPct } from '../lib/format'
import { getSubsidiary, subsidiaryLogoSvg } from '../data/subsidiaries'
import type { HotelSort } from '../types'

export function HotelListPanel() {
  const open = useGameStore((s) => s.showHotels)
  const setShowHotels = useGameStore((s) => s.setShowHotels)
  const hotels = useGameStore((s) => s.hotels)
  const filters = useGameStore((s) => s.mapFilters)
  const focusHotel = useGameStore((s) => s.focusHotel)
  const [q, setQ] = useState('')
  const [sort, setSort] = useState<HotelSort>('net')
  const parentRef = useRef<HTMLDivElement>(null)

  const rows = useMemo(() => {
    const base = filterHotels(hotels, filters)
    const qq = q.trim().toLowerCase()
    const filtered = qq
      ? base.filter(
          (h) =>
            h.name.toLowerCase().includes(qq) ||
            h.city.toLowerCase().includes(qq) ||
            h.country.toLowerCase().includes(qq) ||
            (getSubsidiary(h.subsidiaryId)?.name.toLowerCase().includes(qq) ?? false),
        )
      : base

    filtered.sort((a, b) => {
      if (sort === 'name') return a.name.localeCompare(b.name, 'es')
      if (sort === 'city') return a.city.localeCompare(b.city, 'es')
      if (sort === 'stars') return b.stars - a.stars
      if (sort === 'occupancy') return b.lastDayOccupancy - a.lastDayOccupancy
      return hotelNet(b) - hotelNet(a)
    })
    return filtered
  }, [hotels, filters, q, sort])

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 64,
    overscan: 12,
  })

  if (!open) return null

  return (
    <aside className="panel panel--list">
      <div className="panel__head">
        <div>
          <p className="panel__eyebrow">Red Orbis</p>
          <h2>Lista de hoteles</h2>
          <p className="panel__meta">{rows.length.toLocaleString('es-ES')} visibles · virtualizada</p>
        </div>
        <button type="button" className="icon-btn" onClick={() => setShowHotels(false)} aria-label="Cerrar">
          ×
        </button>
      </div>
      <div className="panel__body">
        <div className="field-row">
          <label className="field">
            <span>Buscar</span>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Nombre, ciudad, filial…" />
          </label>
          <label className="field">
            <span>Orden</span>
            <select value={sort} onChange={(e) => setSort(e.target.value as HotelSort)}>
              <option value="net">Neto / día</option>
              <option value="occupancy">Ocupación</option>
              <option value="name">Nombre</option>
              <option value="city">Ciudad</option>
              <option value="stars">Estrellas</option>
            </select>
          </label>
        </div>
        <div ref={parentRef} className="virt-list">
          <div style={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
            {virtualizer.getVirtualItems().map((item) => {
              const h = rows[item.index]
              const sub = getSubsidiary(h.subsidiaryId)
              const net = hotelNet(h)
              return (
                <button
                  key={h.id}
                  type="button"
                  className="virt-row"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: item.size,
                    transform: `translateY(${item.start}px)`,
                  }}
                  onClick={() => focusHotel(h.id)}
                  title="Ir al hotel en el mapa"
                >
                  {sub && <img src={subsidiaryLogoSvg(sub, 40)} alt="" width={32} height={32} />}
                  <div className="virt-row__main">
                    <strong>{h.name}</strong>
                    <span>
                      {h.city} · {sub?.name}
                    </span>
                  </div>
                  <div className="virt-row__meta">
                    <em className={net >= 0 ? 'pos' : 'neg'}>{formatEUR(net, true)}</em>
                    <span>{h.lastDayOccupancy ? formatPct(h.lastDayOccupancy) : '—'}</span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </aside>
  )
}
