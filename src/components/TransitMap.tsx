import { getLinePath, getUniqueStations, lines, stations } from '../data/network';
import type { TransitLine } from '../data/types';
import './TransitMap.css';

interface Props {
  selectedLineId: string | null;
  selectedStationId: string | null;
  highlightedMode: string | null;
  dimOthers: boolean;
  onSelectLine: (id: string) => void;
  onSelectStation: (id: string) => void;
}

function pathD(points: { x: number; y: number }[]): string {
  if (points.length === 0) return '';
  // Orthogonal-ish metro style: slight rounded corners via midpoints
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const dx = curr.x - prev.x;
    const dy = curr.y - prev.y;
    if (Math.abs(dx) > 8 && Math.abs(dy) > 8) {
      // elbow: horizontal then vertical (or vice versa based on longer)
      if (Math.abs(dx) >= Math.abs(dy)) {
        const midX = curr.x;
        d += ` L ${midX} ${prev.y} L ${curr.x} ${curr.y}`;
      } else {
        const midY = curr.y;
        d += ` L ${prev.x} ${midY} L ${curr.x} ${curr.y}`;
      }
    } else {
      d += ` L ${curr.x} ${curr.y}`;
    }
  }
  return d;
}

function strokeWidth(mode: string): number {
  switch (mode) {
    case 'hyperloop':
      return 7;
    case 'metro':
      return 6;
    case 'tren':
      return 5.5;
    case 'tranvia':
      return 4;
    case 'ferry':
      return 3.5;
    case 'cable':
      return 3;
    default:
      return 3.2;
  }
}

function dashArray(mode: string): string | undefined {
  if (mode === 'bus') return '6 5';
  if (mode === 'ferry') return '10 6';
  if (mode === 'cable') return '2 4';
  if (mode === 'hyperloop') return undefined;
  return undefined;
}

export function TransitMap({
  selectedLineId,
  selectedStationId,
  highlightedMode,
  dimOthers,
  onSelectLine,
  onSelectStation,
}: Props) {
  const uniqueStations = getUniqueStations();

  const isLineActive = (line: TransitLine) => {
    if (selectedLineId) return line.id === selectedLineId;
    if (highlightedMode) return line.mode === highlightedMode;
    return true;
  };

  const lineOpacity = (line: TransitLine) => {
    if (!dimOthers && !selectedLineId && !highlightedMode) return 1;
    return isLineActive(line) ? 1 : 0.12;
  };

  // Draw order: bus under, then ferry, cable, tram, train, metro, hyperloop on top
  const order = ['bus', 'ferry', 'cable', 'tranvia', 'tren', 'metro', 'hyperloop'];
  const sorted = [...lines].sort(
    (a, b) => order.indexOf(a.mode) - order.indexOf(b.mode),
  );

  return (
    <svg
      className="transit-map"
      viewBox="0 0 1400 1000"
      role="img"
      aria-label="Plano de la red de transporte de Heliora"
    >
      <defs>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(30,40,55,0.04)" strokeWidth="1" />
        </pattern>
        <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <rect width="1400" height="1000" fill="url(#grid)" />

      {/* District labels */}
      <g className="district-labels" pointerEvents="none">
        <text x="700" y="55" textAnchor="middle">Puerto Norte</text>
        <text x="200" y="490" textAnchor="middle">Oeste</text>
        <text x="1200" y="390" textAnchor="middle">Aeropuerto</text>
        <text x="700" y="985" textAnchor="middle">Puerto Sur</text>
        <text x="1040" y="140" textAnchor="middle">Campus</text>
        <text x="340" y="860" textAnchor="middle">Industrial</text>
        <text x="980" y="860" textAnchor="middle">Tech</text>
      </g>

      {/* River / bay suggestion */}
      <path
        className="water"
        d="M 650 0 C 680 80, 720 80, 750 0 M 650 1000 C 680 920, 720 920, 750 1000"
        fill="none"
      />
      <ellipse className="water-fill" cx="700" cy="40" rx="90" ry="28" />
      <ellipse className="water-fill" cx="700" cy="960" rx="100" ry="30" />
      <ellipse className="water-fill" cx="1080" cy="500" rx="50" ry="35" opacity="0.5" />

      {/* Lines */}
      {sorted.map((line) => {
        const pts = getLinePath(line);
        const d = pathD(pts);
        const active = isLineActive(line);
        const selected = selectedLineId === line.id;
        return (
          <g key={line.id} opacity={lineOpacity(line)} className="line-group">
            {/* Hit area */}
            <path
              d={d}
              fill="none"
              stroke="transparent"
              strokeWidth={18}
              strokeLinejoin="round"
              strokeLinecap="round"
              data-line-hit
              className="line-hit"
              onClick={(e) => {
                e.stopPropagation();
                onSelectLine(line.id);
              }}
            />
            {line.mode === 'hyperloop' && (
              <path
                d={d}
                fill="none"
                stroke={line.color}
                strokeWidth={strokeWidth(line.mode) + 4}
                strokeOpacity={0.25}
                strokeLinejoin="round"
                strokeLinecap="round"
                filter={selected ? 'url(#softGlow)' : undefined}
                pointerEvents="none"
              />
            )}
            <path
              d={d}
              fill="none"
              stroke={line.color}
              strokeWidth={selected ? strokeWidth(line.mode) + 1.5 : strokeWidth(line.mode)}
              strokeDasharray={dashArray(line.mode)}
              strokeLinejoin="round"
              strokeLinecap="round"
              className={selected ? 'line-selected' : 'line-path'}
              pointerEvents="none"
            />
            {active && line.status === 'suspendida' && (
              <path
                d={d}
                fill="none"
                stroke="#1a2332"
                strokeWidth={2}
                strokeDasharray="4 6"
                strokeLinejoin="round"
                pointerEvents="none"
              />
            )}
          </g>
        );
      })}

      {/* Stations */}
      {uniqueStations.map((st) => {
        const atSelected =
          selectedStationId === st.id ||
          (selectedLineId &&
            lines.find((l) => l.id === selectedLineId)?.stationIds.some(
              (sid) => stations[sid]?.x === st.x && stations[sid]?.y === st.y,
            ));
        const showLabel =
          st.interchange ||
          atSelected ||
          selectedStationId === st.id ||
          (!selectedLineId && st.interchange);

        const onLine =
          !selectedLineId ||
          lines
            .find((l) => l.id === selectedLineId)
            ?.stationIds.some((sid) => {
              const s = stations[sid];
              return s && s.x === st.x && s.y === st.y;
            });

        return (
          <g
            key={`${st.x}-${st.y}-${st.name}`}
            data-station
            className={`station ${st.interchange ? 'interchange' : ''} ${atSelected ? 'active' : ''}`}
            opacity={!selectedLineId || onLine ? 1 : 0.15}
            transform={`translate(${st.x}, ${st.y})`}
            onClick={(e) => {
              e.stopPropagation();
              onSelectStation(st.id);
            }}
          >
            {st.interchange ? (
              <>
                <circle r="9" className="station-ring" />
                <circle r="5" className="station-core" />
              </>
            ) : (
              <circle r="4.5" className="station-dot" />
            )}
            {showLabel && (
              <text
                className="station-label"
                x={10}
                y={4}
                style={{ fontSize: st.interchange ? 11 : 9 }}
              >
                {st.name}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
