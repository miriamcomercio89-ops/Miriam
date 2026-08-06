import {
  CITY,
  districtLabels,
  getLinePath,
  getUniqueStations,
  lines,
  stations,
} from '../data/network';
import type { TransitLine } from '../data/types';
import './TransitMap.css';

interface Props {
  selectedLineId: string | null;
  selectedStationId: string | null;
  highlightedMode: string | null;
  routeStationIds?: string[] | null;
  routeLineIds?: string[] | null;
  dimOthers: boolean;
  onSelectLine: (id: string) => void;
  onSelectStation: (id: string) => void;
}

function pathD(points: { x: number; y: number }[]): string {
  if (points.length === 0) return '';
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const dx = curr.x - prev.x;
    const dy = curr.y - prev.y;
    if (Math.abs(dx) > 8 && Math.abs(dy) > 8) {
      if (Math.abs(dx) >= Math.abs(dy)) {
        d += ` L ${curr.x} ${prev.y} L ${curr.x} ${curr.y}`;
      } else {
        d += ` L ${prev.x} ${curr.y} L ${curr.x} ${curr.y}`;
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
    case 'cercanias':
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
  return undefined;
}

export function TransitMap({
  selectedLineId,
  selectedStationId,
  highlightedMode,
  routeStationIds,
  routeLineIds,
  dimOthers,
  onSelectLine,
  onSelectStation,
}: Props) {
  const uniqueStations = getUniqueStations();
  const routeSet = new Set(routeStationIds ?? []);
  const routeLines = new Set(routeLineIds ?? []);

  const isLineActive = (line: TransitLine) => {
    if (routeLines.size) return routeLines.has(line.id);
    if (selectedLineId) return line.id === selectedLineId;
    if (highlightedMode) return line.mode === highlightedMode;
    return true;
  };

  const lineOpacity = (line: TransitLine) => {
    if (routeLines.size) return routeLines.has(line.id) ? 1 : 0.08;
    if (!dimOthers && !selectedLineId && !highlightedMode) return 1;
    return isLineActive(line) ? 1 : 0.1;
  };

  const order = ['bus', 'ferry', 'cable', 'tranvia', 'cercanias', 'metro', 'hyperloop'];
  const sorted = [...lines].sort((a, b) => order.indexOf(a.mode) - order.indexOf(b.mode));

  return (
    <svg
      className="transit-map"
      viewBox={`0 0 ${CITY.mapWidth} ${CITY.mapHeight}`}
      width={CITY.mapWidth}
      height={CITY.mapHeight}
      role="img"
      aria-label="Plano de la red de transporte de Heliora"
    >
      <defs>
        <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
          <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(30,40,55,0.035)" strokeWidth="1" />
        </pattern>
        <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2.5" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <rect width={CITY.mapWidth} height={CITY.mapHeight} fill="url(#grid)" />

      <g className="district-labels" pointerEvents="none">
        {districtLabels.map((d) => (
          <text key={d.id} x={d.x} y={d.y} textAnchor="middle">
            {d.name}
          </text>
        ))}
      </g>

      <ellipse className="water-fill" cx="1200" cy="120" rx="160" ry="40" />
      <ellipse className="water-fill" cx="1200" cy="1680" rx="170" ry="42" />
      <ellipse className="water-fill" cx="1720" cy="880" rx="70" ry="45" opacity="0.45" />
      <ellipse className="water-fill" cx="320" cy="840" rx="55" ry="35" opacity="0.35" />

      {sorted.map((line) => {
        const pts = getLinePath(line);
        const d = pathD(pts);
        const selected = selectedLineId === line.id || routeLines.has(line.id);
        return (
          <g key={line.id} opacity={lineOpacity(line)} className="line-group">
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
            {isLineActive(line) && line.status === 'suspendida' && (
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

      {uniqueStations.map((st) => {
        const onSelectedLine =
          selectedLineId &&
          lines
            .find((l) => l.id === selectedLineId)
            ?.stationIds.some((sid) => {
              const s = stations[sid];
              return s && s.x === st.x && s.y === st.y;
            });
        const onRoute = routeSet.size > 0 && [...routeSet].some((id) => {
          const s = stations[id];
          return s && s.x === st.x && s.y === st.y;
        });
        const atSelected = selectedStationId === st.id || onSelectedLine || onRoute;
        const showLabel =
          st.interchange ||
          atSelected ||
          (!selectedLineId && !routeSet.size && st.interchange);

        const faded =
          (selectedLineId && !onSelectedLine) ||
          (routeSet.size > 0 && !onRoute);

        return (
          <g
            key={st.id}
            data-station
            className={`station ${st.interchange ? 'interchange' : ''} ${atSelected ? 'active' : ''}`}
            opacity={faded ? 0.12 : 1}
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
              <text className="station-label" x={11} y={4} style={{ fontSize: st.interchange ? 11 : 9 }}>
                {st.name}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
