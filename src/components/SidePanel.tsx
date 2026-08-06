import { CITY, getUniqueStations, lines } from '../data/network';
import {
  effectiveFrequency,
  formatCountdown,
  minutesUntilNext,
} from '../data/schedules';
import { occupancyForPeriod, PERIOD_LABELS } from '../data/time';
import {
  BUS_FAMILY_LABELS,
  MODE_LABELS,
  MODE_ORDER,
  STATUS_LABELS,
  type DayPeriod,
  type TransportMode,
  type TransitLine,
  type UserRole,
} from '../data/types';
import { RoutePlanner } from './RoutePlanner';
import type { RoutePlan } from '../data/routing';
import './SidePanel.css';

interface Props {
  role: UserRole;
  selectedLineId: string | null;
  filterMode: TransportMode | null;
  search: string;
  onSearch: (q: string) => void;
  onFilterMode: (m: TransportMode | null) => void;
  onSelectLine: (id: string) => void;
  onSelectStation: (id: string) => void;
  onClearSelection: () => void;
  onRoute: (plan: RoutePlan | null) => void;
  simMinutes: number;
  period: DayPeriod;
}

function LineRow({
  line,
  selected,
  role,
  onSelect,
  simMinutes,
  period,
}: {
  line: TransitLine;
  selected: boolean;
  role: UserRole;
  onSelect: () => void;
  simMinutes: number;
  period: DayPeriod;
}) {
  const freq = effectiveFrequency(line, simMinutes);
  const eta = minutesUntilNext(line, simMinutes);
  const occ = occupancyForPeriod(line.occupancy, period);
  return (
    <button
      type="button"
      className={`line-row ${selected ? 'selected' : ''} status-${line.status}`}
      onClick={onSelect}
      style={{ ['--line-color' as string]: line.color }}
    >
      <span className="line-badge">{line.code}</span>
      <span className="line-meta">
        <span className="line-name">{line.name}</span>
        <span className="line-sub">
          {line.busFamily
            ? `Bus ${BUS_FAMILY_LABELS[line.busFamily]}`
            : MODE_LABELS[line.mode]}{' '}
          · cada {freq} min · próximo {formatCountdown(eta)}
          {role === 'operador' && (
            <> · {STATUS_LABELS[line.status]} · {occ}%</>
          )}
        </span>
      </span>
      {line.status !== 'normal' && <span className="status-dot" title={STATUS_LABELS[line.status]} />}
    </button>
  );
}

export function SidePanel({
  role,
  selectedLineId,
  filterMode,
  search,
  onSearch,
  onFilterMode,
  onSelectLine,
  onSelectStation,
  onClearSelection,
  onRoute,
  simMinutes,
  period,
}: Props) {
  const q = search.trim().toLowerCase();
  const filteredLines = lines.filter((l) => {
    if (filterMode && l.mode !== filterMode) return false;
    if (!q) return true;
    return (
      l.code.toLowerCase().includes(q) ||
      l.name.toLowerCase().includes(q) ||
      MODE_LABELS[l.mode].toLowerCase().includes(q)
    );
  });

  const stationMatches = q
    ? getUniqueStations()
        .filter(
          (s) =>
            s.name.toLowerCase().includes(q) ||
            s.district.toLowerCase().includes(q),
        )
        .slice(0, 12)
    : [];

  const grouped = MODE_ORDER.map((mode) => ({
    mode,
    items: filteredLines.filter((l) => l.mode === mode),
  })).filter((g) => g.items.length > 0);

  return (
    <aside className="side-panel">
      <header className="side-brand">
        <p className="brand-kicker">Costa Sur · v0.3 · {PERIOD_LABELS[period]}</p>
        <h1 className="brand-name">{CITY.name}</h1>
        <p className="brand-tag">{CITY.tagline}</p>
        <div className="brand-stats">
          <div>
            <strong>{lines.length}</strong>
            <span>líneas</span>
          </div>
          <div>
            <strong>{getUniqueStations().length}</strong>
            <span>estaciones</span>
          </div>
          <div>
            <strong>{CITY.population}</strong>
            <span>hab.</span>
          </div>
        </div>
      </header>

      <RoutePlanner onRoute={onRoute} onPickStation={onSelectStation} />

      <div className="side-controls">
        <label className="search-wrap">
          <span className="sr-only">Buscar línea o estación</span>
          <input
            type="search"
            placeholder="Buscar línea o estación…"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
          />
        </label>
        <div className="mode-filters">
          <button
            type="button"
            className={`mode-chip ${filterMode === null ? 'active' : ''}`}
            onClick={() => onFilterMode(null)}
          >
            Todas
          </button>
          {MODE_ORDER.map((m) => (
            <button
              key={m}
              type="button"
              className={`mode-chip ${filterMode === m ? 'active' : ''}`}
              onClick={() => onFilterMode(filterMode === m ? null : m)}
            >
              {MODE_LABELS[m]}
            </button>
          ))}
        </div>
        {(selectedLineId || filterMode || search) && (
          <button type="button" className="clear-btn" onClick={onClearSelection}>
            Limpiar selección
          </button>
        )}
      </div>

      <div className="line-list">
        {stationMatches.length > 0 && (
          <section className="line-group-section">
            <h2>
              Estaciones
              <span>{stationMatches.length}</span>
            </h2>
            {stationMatches.map((s) => (
              <button
                key={s.id}
                type="button"
                className="line-row station-row"
                onClick={() => onSelectStation(s.id)}
              >
                <span className="line-badge station-badge">◉</span>
                <span className="line-meta">
                  <span className="line-name">{s.name}</span>
                  <span className="line-sub">{s.district}</span>
                </span>
              </button>
            ))}
          </section>
        )}

        {grouped.map(({ mode, items }) => (
          <section key={mode} className="line-group-section">
            <h2>
              {MODE_LABELS[mode]}
              <span>{items.length}</span>
            </h2>
            {items.map((line) => (
              <LineRow
                key={line.id}
                line={line}
                selected={selectedLineId === line.id}
                role={role}
                onSelect={() => onSelectLine(line.id)}
                simMinutes={simMinutes}
                period={period}
              />
            ))}
          </section>
        ))}
        {filteredLines.length === 0 && stationMatches.length === 0 && (
          <p className="empty-list">No hay resultados con ese criterio.</p>
        )}
      </div>
    </aside>
  );
}
