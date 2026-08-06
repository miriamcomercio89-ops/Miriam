import { useState } from 'react';
import { getLinesForStation, getStation, lines } from '../data/network';
import {
  delayLabel,
  effectiveFrequency,
  formatCountdown,
  generateSchedule,
  minutesUntilNext,
} from '../data/schedules';
import { occupancyForPeriod, PERIOD_LABELS } from '../data/time';
import {
  BUS_FAMILY_LABELS,
  MODE_LABELS,
  STATUS_LABELS,
  type DayPeriod,
  type UserRole,
} from '../data/types';
import './DetailPanel.css';

interface Props {
  role: UserRole;
  selectedLineId: string | null;
  selectedStationId: string | null;
  simMinutes: number;
  period: DayPeriod;
  onSelectLine: (id: string) => void;
  onClose: () => void;
}

function shareLineUrl(code: string): string {
  const url = new URL(window.location.href);
  url.searchParams.set('linea', code);
  return url.toString();
}

export function DetailPanel({
  role,
  selectedLineId,
  selectedStationId,
  simMinutes,
  period,
  onSelectLine,
  onClose,
}: Props) {
  const [copied, setCopied] = useState(false);
  const line = lines.find((l) => l.id === selectedLineId) ?? null;
  const station = selectedStationId ? getStation(selectedStationId) : null;

  if (!line && !station) return null;

  if (station && !line) {
    const atStation = getLinesForStation(station.id);
    const byCoord = lines.filter((l) =>
      l.stationIds.some((sid) => {
        const s = getStation(sid);
        return s && s.x === station.x && s.y === station.y;
      }),
    );
    const connected = atStation.length ? atStation : byCoord;

    return (
      <div className="detail-panel">
        <button type="button" className="detail-close" onClick={onClose} aria-label="Cerrar">
          ×
        </button>
        <p className="detail-kicker">{station.district}</p>
        <h2>{station.name}</h2>
        <p className="detail-desc">
          {station.majorHub
            ? 'Gran intercambiador · acerca el zoom para ver el esquema'
            : station.interchange
              ? 'Estación de correspondencia'
              : 'Estación'}{' '}
          · {connected.length} líneas
        </p>
        <ul className="station-lines">
          {connected.map((l) => {
            const eta = minutesUntilNext(l, simMinutes);
            return (
              <li key={l.id}>
                <button type="button" onClick={() => onSelectLine(l.id)}>
                  <span className="mini-badge" style={{ background: l.color }}>
                    {l.code}
                  </span>
                  <span>
                    {l.name}
                    <small>
                      {MODE_LABELS[l.mode]} · en {formatCountdown(eta)}
                    </small>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }

  if (!line) return null;

  const schedule = generateSchedule(line, simMinutes, 10);
  const eta = minutesUntilNext(line, simMinutes);
  const freq = effectiveFrequency(line, simMinutes);
  const occ = occupancyForPeriod(line.occupancy, period);
  const stops = line.stationIds.map((id) => getStation(id)).filter(Boolean);
  const delay = delayLabel(line);

  return (
    <div className="detail-panel" style={{ ['--accent' as string]: line.color }}>
      <button type="button" className="detail-close" onClick={onClose} aria-label="Cerrar">
        ×
      </button>
      <div className="detail-header">
        <span className="detail-badge">{line.code}</span>
        <div>
          <p className="detail-kicker">
            {line.busFamily
              ? `Bus · ${BUS_FAMILY_LABELS[line.busFamily]}`
              : MODE_LABELS[line.mode]}
          </p>
          <h2>{line.name}</h2>
        </div>
      </div>

      <div className="next-banner">
        <span>Próximo</span>
        <strong>{formatCountdown(eta)}</strong>
        <em>{PERIOD_LABELS[period]}</em>
      </div>

      <div className="detail-pills">
        <span className={`pill status-${line.status}`}>{STATUS_LABELS[line.status]}</span>
        <span className="pill">Cada {freq} min ahora</span>
        <span className="pill">
          {line.firstDeparture} – {line.lastDeparture}
        </span>
        {delay && <span className="pill warn">{delay}</span>}
      </div>

      <button
        type="button"
        className="share-btn"
        onClick={async () => {
          const link = shareLineUrl(line.code);
          try {
            await navigator.clipboard.writeText(link);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1800);
          } catch {
            window.prompt('Copia el enlace:', link);
          }
        }}
      >
        {copied ? 'Enlace copiado' : `Compartir ${line.code}`}
      </button>

      {role === 'operador' && (
        <div className="operator-box">
          <div className="occ-row">
            <span>Ocupación ({PERIOD_LABELS[period]})</span>
            <strong>{occ}%</strong>
          </div>
          <div className="occ-bar">
            <div
              className="occ-fill"
              style={{
                width: `${occ}%`,
                background: occ > 80 ? '#e53935' : occ > 60 ? '#f5a623' : '#43a047',
              }}
            />
          </div>
          {line.operatorNote && <p className="op-note">{line.operatorNote}</p>}
          <p className="op-meta">Frecuencia base {line.frequencyMin} min · efectiva {freq} min</p>
        </div>
      )}

      <section className="detail-section">
        <h3>Próximas salidas</h3>
        <div className="schedule-grid">
          {schedule.length === 0 && <span className="time-chip">Sin servicio</span>}
          {schedule.map((t, i) => (
            <span key={`${t}-${i}`} className="time-chip">
              {t}
            </span>
          ))}
        </div>
      </section>

      <section className="detail-section">
        <h3>Paradas ({stops.length})</h3>
        <ol className="stop-list">
          {stops
            .filter(
              (s, i) =>
                !s!.id.includes('_s') ||
                i === 0 ||
                i === stops.length - 1 ||
                Boolean(s!.interchange),
            )
            .map((s, i) => (
              <li key={`${s!.id}-${i}`}>
                <span className="stop-dot" />
                <span>
                  {s!.name}
                  <small>{s!.district}</small>
                </span>
              </li>
            ))}
        </ol>
        {stops.length > 12 && (
          <p className="detail-desc">Mostrando paradas principales · {stops.length} en total</p>
        )}
      </section>
    </div>
  );
}
