import { getLinesForStation, getStation, lines } from '../data/network';
import { delayLabel, generateSchedule, nextDepartures } from '../data/schedules';
import {
  MODE_LABELS,
  STATUS_LABELS,
  type UserRole,
} from '../data/types';
import './DetailPanel.css';

interface Props {
  role: UserRole;
  selectedLineId: string | null;
  selectedStationId: string | null;
  onSelectLine: (id: string) => void;
  onClose: () => void;
}

export function DetailPanel({
  role,
  selectedLineId,
  selectedStationId,
  onSelectLine,
  onClose,
}: Props) {
  const line = lines.find((l) => l.id === selectedLineId) ?? null;
  const station = selectedStationId ? getStation(selectedStationId) : null;

  if (!line && !station) return null;

  if (station && !line) {
    const atStation = getLinesForStation(station.id);
    // Also match by coordinates for interchange aliases
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
          {station.interchange ? 'Estación de correspondencia' : 'Estación'} · {connected.length}{' '}
          líneas
        </p>
        <ul className="station-lines">
          {connected.map((l) => (
            <li key={l.id}>
              <button type="button" onClick={() => onSelectLine(l.id)}>
                <span className="mini-badge" style={{ background: l.color }}>
                  {l.code}
                </span>
                <span>
                  {l.name}
                  <small>
                    {MODE_LABELS[l.mode]} · próximo {nextDepartures(l, 1)[0] ?? '—'}
                  </small>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (!line) return null;

  const schedule = generateSchedule(line, 10);
  const stops = line.stationIds
    .map((id) => getStation(id))
    .filter(Boolean);
  const delay = delayLabel(line);

  return (
    <div className="detail-panel" style={{ ['--accent' as string]: line.color }}>
      <button type="button" className="detail-close" onClick={onClose} aria-label="Cerrar">
        ×
      </button>
      <div className="detail-header">
        <span className="detail-badge">{line.code}</span>
        <div>
          <p className="detail-kicker">{MODE_LABELS[line.mode]}</p>
          <h2>{line.name}</h2>
        </div>
      </div>

      <div className="detail-pills">
        <span className={`pill status-${line.status}`}>{STATUS_LABELS[line.status]}</span>
        <span className="pill">Cada {line.frequencyMin} min</span>
        <span className="pill">
          {line.firstDeparture} – {line.lastDeparture}
        </span>
        {delay && <span className="pill warn">{delay}</span>}
      </div>

      {role === 'operador' && (
        <div className="operator-box">
          <div className="occ-row">
            <span>Ocupación simulada</span>
            <strong>{line.occupancy}%</strong>
          </div>
          <div className="occ-bar">
            <div
              className="occ-fill"
              style={{
                width: `${line.occupancy}%`,
                background:
                  line.occupancy > 80 ? '#e53935' : line.occupancy > 60 ? '#f5a623' : '#43a047',
              }}
            />
          </div>
          {line.operatorNote && <p className="op-note">{line.operatorNote}</p>}
          <p className="op-meta">
            Modo operador · datos simulados en tiempo real de la red Heliora
          </p>
        </div>
      )}

      <section className="detail-section">
        <h3>Próximas salidas</h3>
        <div className="schedule-grid">
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
          {stops.map((s, i) => (
            <li key={`${s!.id}-${i}`}>
              <span className="stop-dot" />
              <span>
                {s!.name}
                <small>{s!.district}</small>
              </span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
