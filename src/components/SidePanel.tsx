import { CITY, lines } from '../data/network';
import {
  MODE_LABELS,
  MODE_ORDER,
  STATUS_LABELS,
  type TransportMode,
  type TransitLine,
  type UserRole,
} from '../data/types';
import './SidePanel.css';

interface Props {
  role: UserRole;
  selectedLineId: string | null;
  filterMode: TransportMode | null;
  search: string;
  onSearch: (q: string) => void;
  onFilterMode: (m: TransportMode | null) => void;
  onSelectLine: (id: string) => void;
  onClearSelection: () => void;
}

function LineRow({
  line,
  selected,
  role,
  onSelect,
}: {
  line: TransitLine;
  selected: boolean;
  role: UserRole;
  onSelect: () => void;
}) {
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
          {MODE_LABELS[line.mode]} · cada {line.frequencyMin} min
          {role === 'operador' && (
            <> · {STATUS_LABELS[line.status]} · {line.occupancy}%</>
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
  onClearSelection,
}: Props) {
  const q = search.trim().toLowerCase();
  const filtered = lines.filter((l) => {
    if (filterMode && l.mode !== filterMode) return false;
    if (!q) return true;
    return (
      l.code.toLowerCase().includes(q) ||
      l.name.toLowerCase().includes(q) ||
      MODE_LABELS[l.mode].toLowerCase().includes(q)
    );
  });

  const grouped = MODE_ORDER.map((mode) => ({
    mode,
    items: filtered.filter((l) => l.mode === mode),
  })).filter((g) => g.items.length > 0);

  return (
    <aside className="side-panel">
      <header className="side-brand">
        <p className="brand-kicker">Red Mundial</p>
        <h1 className="brand-name">{CITY.name}</h1>
        <p className="brand-tag">{CITY.tagline}</p>
        <div className="brand-stats">
          <div>
            <strong>{lines.length}</strong>
            <span>líneas</span>
          </div>
          <div>
            <strong>{CITY.population}</strong>
            <span>hab.</span>
          </div>
          <div>
            <strong>{CITY.dailyTrips}</strong>
            <span>viajes/día</span>
          </div>
        </div>
      </header>

      <div className="side-controls">
        <label className="search-wrap">
          <span className="sr-only">Buscar línea</span>
          <input
            type="search"
            placeholder="Buscar línea o modo…"
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
              />
            ))}
          </section>
        ))}
        {filtered.length === 0 && (
          <p className="empty-list">No hay líneas con ese criterio.</p>
        )}
      </div>
    </aside>
  );
}
