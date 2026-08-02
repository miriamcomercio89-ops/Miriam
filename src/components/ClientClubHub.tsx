import { useState } from 'react'
import { useGameStore } from '../store/gameStore'
import { getSubsidiary, subsidiaryLogoSvg } from '../data/subsidiaries'
import { formatEUR } from '../lib/format'
import { geoRegionLabel } from '../lib/geo'
import {
  BRAND_TOUR_BONUS,
  clientLevelInfo,
} from '../lib/clientMode'
import {
  CLIENT_LEVEL_PERKS,
  POINT_REDEEMS,
  SPECIALIZE_LABEL,
  clientPerkInfo,
  redeemPointsCost,
  type PointRedeemId,
} from '../lib/clientClub'
import { downloadTravelDiaryPdf } from '../lib/travelDiary'
import type { TravelDiaryEntry } from '../types'

type HubTab = 'club' | 'diarios' | 'pasaporte' | 'tour'

type Props = {
  onRedeem: (id: PointRedeemId) => void
  onMsg: (msg: string | null) => void
}

/** Hub único: niveles, canjes, especialización, tour, pasaporte y galería de diarios. */
export function ClientClubHub({ onRedeem, onMsg }: Props) {
  const client = useGameStore((s) => s.client)
  const [tab, setTab] = useState<HubTab>('club')
  const [busyId, setBusyId] = useState<string | null>(null)

  const level = clientLevelInfo(client.level)
  const perk = clientPerkInfo(client.level)
  const tourBrands = new Set((client.brandTourLog ?? []).map((x) => x.subsidiaryId)).size
  const diaries = client.diaries?.length
    ? client.diaries
    : client.lastDiary
      ? [client.lastDiary]
      : []

  const regionChain = (() => {
    const regions: string[] = []
    for (const s of client.brandTourLog ?? []) {
      const label = s.geoRegion ? geoRegionLabel(s.geoRegion) : null
      if (label && regions[regions.length - 1] !== label) regions.push(label)
    }
    return regions
  })()

  async function downloadDiary(entry: TravelDiaryEntry) {
    setBusyId(entry.id)
    onMsg(null)
    try {
      await downloadTravelDiaryPdf(entry)
    } catch {
      onMsg('No se pudo generar el PDF del diario.')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="client-club-hub">
      <div className="client-club-hub__tabs" role="tablist">
        {(
          [
            ['club', 'Club'],
            ['diarios', 'Diarios'],
            ['pasaporte', 'Pasaporte'],
            ['tour', 'Tour'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            className={tab === id ? 'chip chip--active' : 'chip'}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'club' && (
        <div className="client-club-hub__panel">
          <p className="mini-title">
            Nv.{client.level} {level.name} · {client.points.toLocaleString('es-ES')} pts
          </p>
          <p className="muted" style={{ fontSize: '0.8rem', marginTop: 0 }}>
            {perk.perk} · descuento {Math.round(level.discount * 100)}%
          </p>

          <p className="mini-title" style={{ marginTop: '0.75rem' }}>
            Especialización
          </p>
          <p style={{ fontSize: '0.85em', margin: 0 }}>
            <strong>{SPECIALIZE_LABEL[client.specialize]}</strong>
            {client.specialize !== 'none' && (
              <span className="muted"> · {client.specializeNights[client.specialize] ?? 0} noches</span>
            )}
          </p>
          {Object.keys(client.specializeNights).length > 0 && (
            <div className="client-club-hub__tags">
              {(Object.entries(client.specializeNights) as [string, number | undefined][])
                .filter(([, v]) => (v ?? 0) > 0)
                .map(([k, v]) => (
                  <span key={k} className="tag">
                    {(SPECIALIZE_LABEL as Record<string, string>)[k] ?? k}: {v}n
                  </span>
                ))}
            </div>
          )}

          <p className="mini-title" style={{ marginTop: '0.75rem' }}>
            Niveles Club Huésped
          </p>
          <table className="client-levels-table">
            <thead>
              <tr>
                <th>Nivel</th>
                <th>Desc.</th>
                <th>Beneficio</th>
              </tr>
            </thead>
            <tbody>
              {CLIENT_LEVEL_PERKS.map((p) => (
                <tr key={p.level} className={p.level === client.level ? 'is-current' : undefined}>
                  <td>{p.name}</td>
                  <td>{Math.round(p.discount * 100)}%</td>
                  <td>{p.perk}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <p className="mini-title" style={{ marginTop: '0.75rem' }}>
            Canjear puntos
          </p>
          <div className="client-club-hub__redeems">
            {POINT_REDEEMS.map((r) => {
              const cost = redeemPointsCost(r.id, client.level)
              const already = client.pointRedeems.includes(r.id)
              const canAfford = client.points >= cost
              return (
                <div key={r.id} className="client-club-hub__redeem">
                  <div>
                    <strong>{r.label}</strong>
                    <span className="muted"> · {cost} pts</span>
                    <span className="muted" style={{ display: 'block', fontSize: '0.85em' }}>
                      {r.detail}
                    </span>
                  </div>
                  <button
                    type="button"
                    className={already ? 'chip' : 'chip chip--active'}
                    disabled={already || !canAfford}
                    onClick={() => onRedeem(r.id)}
                  >
                    {already ? 'Canjeado' : 'Canjear'}
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {tab === 'diarios' && (
        <div className="client-club-hub__panel">
          <p className="mini-title">Galería de diarios</p>
          <p className="muted" style={{ fontSize: '0.8rem' }}>
            {diaries.length} guardado{diaries.length === 1 ? '' : 's'} (máx. 40)
          </p>
          {diaries.length === 0 ? (
            <p className="muted">Haz check-out para guardar un diario PDF.</p>
          ) : (
            <ul className="client-diary-gallery">
              {diaries.map((d) => (
                <li key={d.id}>
                  <div>
                    <strong>{d.hotelName}</strong>
                    <span className="muted">
                      {' '}
                      · {d.city} · {d.nights}n · {d.weatherLabel} · día {d.day}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="chip"
                    disabled={busyId === d.id}
                    onClick={() => void downloadDiary(d)}
                  >
                    {busyId === d.id ? '…' : 'PDF'}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {tab === 'pasaporte' && (
        <div className="client-club-hub__panel">
          <p className="mini-title">Pasaporte Orbis</p>
          {client.passport.length === 0 ? (
            <p className="muted">Aún sin sellos. Duerme en un hotel del grupo.</p>
          ) : (
            <div className="client-passport-grid">
              {client.passport.slice(0, 24).map((p) => {
                const sub = getSubsidiary(p.subsidiaryId)
                return (
                  <div key={`${p.countryCode}-${p.subsidiaryId}-${p.day}`} className="client-passport-stamp">
                    {p.selfie ? (
                      <img src={p.selfie} alt="" width={56} height={56} />
                    ) : sub ? (
                      <img src={subsidiaryLogoSvg(sub, 64)} alt="" width={40} height={40} />
                    ) : null}
                    <div>
                      <strong>{p.countryCode}</strong>
                      <span className="muted">
                        {sub?.name ?? p.subsidiaryId} · día {p.day}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {tab === 'tour' && (
        <div className="client-club-hub__panel">
          <p className="mini-title">Tour de marca (7 días)</p>
          <p className="muted" style={{ fontSize: '0.8rem' }}>
            {tourBrands} marca{tourBrands === 1 ? '' : 's'} · bonus +{BRAND_TOUR_BONUS} pts al dormir en 2+
          </p>
          {regionChain.length > 0 && (
            <p className="client-tour-chain">
              {regionChain.join(' → ')}
            </p>
          )}
          {(client.brandTourLog ?? []).length === 0 ? (
            <p className="muted">La racha aparece en el mapa al cambiar de región/marca.</p>
          ) : (
            <ul className="client-tour-list">
              {[...(client.brandTourLog ?? [])].reverse().map((s, i) => {
                const sub = getSubsidiary(s.subsidiaryId)
                return (
                  <li key={`${s.day}-${s.subsidiaryId}-${i}`}>
                    <strong>{s.hotelName ?? sub?.name ?? s.subsidiaryId}</strong>
                    <span className="muted">
                      {' '}
                      · día {s.day}
                      {s.geoRegion ? ` · ${geoRegionLabel(s.geoRegion)}` : ''}
                    </span>
                  </li>
                )
              })}
            </ul>
          )}
          <p className="muted" style={{ fontSize: '0.75rem' }}>
            Monedero {formatEUR(client.wallet)} · {client.totalNights} noches totales
          </p>
        </div>
      )}
    </div>
  )
}
