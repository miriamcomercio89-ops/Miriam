import {
  CITY,
  districtLabels,
  getLinePath,
  getLinesForStation,
  getUniqueStations,
  lines,
  stations,
} from '../data/network';
import { smoothPathD } from '../data/pathSmooth';
import type { TransitLine } from '../data/types';
import './TransitMap.css';

interface Props {
  selectedLineId: string | null;
  selectedStationId: string | null;
  highlightedMode: string | null;
  routeStationIds?: string[] | null;
  routeLineIds?: string[] | null;
  mapScale: number;
  dimOthers: boolean;
  onSelectLine: (id: string) => void;
  onSelectStation: (id: string) => void;
}

function pathD(points: { x: number; y: number }[], mode: string): string {
  // Buses más orgánicos; metro un poco más tenso (sigue siendo curvo)
  const tension = mode === 'bus' ? 0.5 : mode === 'tranvia' ? 0.4 : mode === 'metro' ? 0.28 : 0.35;
  return smoothPathD(points, tension);
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
    default:
      return 3.2;
  }
}

function dashArray(mode: string): string | undefined {
  if (mode === 'bus') return '6 5';
  return undefined;
}

export function TransitMap({
  selectedLineId,
  selectedStationId,
  highlightedMode,
  routeStationIds,
  routeLineIds,
  mapScale,
  dimOthers,
  onSelectLine,
  onSelectStation,
}: Props) {
  const uniqueStations = getUniqueStations();
  const routeSet = new Set(routeStationIds ?? []);
  const routeLines = new Set(routeLineIds ?? []);

  const showDistricts = mapScale < 0.75;
  const showInterchangeLabels = mapScale >= 0.55;
  const showAllLabels = mapScale >= 1.05;
  const showHubDiagram = mapScale >= 1.25;

  const isLineActive = (line: TransitLine) => {
    if (routeLines.size) return routeLines.has(line.id);
    if (selectedLineId) return line.id === selectedLineId;
    if (highlightedMode) return line.mode === highlightedMode;
    return true;
  };

  const lineOpacity = (line: TransitLine) => {
    if (routeLines.size) return routeLines.has(line.id) ? 1 : 0.07;
    if (!dimOthers && !selectedLineId && !highlightedMode) return 1;
    return isLineActive(line) ? 1 : 0.09;
  };

  const order = ['bus', 'tranvia', 'cercanias', 'metro', 'hyperloop'];
  const sorted = [...lines].sort((a, b) => order.indexOf(a.mode) - order.indexOf(b.mode));

  const selectedStation = selectedStationId ? stations[selectedStationId] : null;
  const hubFocus =
    showHubDiagram &&
    selectedStation?.majorHub
      ? selectedStation
      : null;

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
        <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
          <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(30,40,55,0.03)" strokeWidth="1" />
        </pattern>
        <linearGradient id="sea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(56,140,180,0.08)" />
          <stop offset="100%" stopColor="rgba(56,140,180,0.22)" />
        </linearGradient>
      </defs>

      <rect width={CITY.mapWidth} height={CITY.mapHeight} fill="url(#grid)" />

      {/* Franja marítima al sur + sugerencia de sierra al norte */}
      <rect className="sea-band" x="0" y="2300" width={CITY.mapWidth} height="900" fill="url(#sea)" />
      <path
        className="coastline"
        d="M 0 2360 C 500 2420, 900 2280, 1400 2340 S 2100 2460, 2600 2380 S 3400 2280, 4000 2360 S 4400 2440, 4600 2370"
        fill="none"
      />
      <path
        className="sierra-hint"
        d="M 800 380 C 1200 280, 1600 320, 2000 240 S 2600 180, 3000 260 S 3600 300, 4000 220"
        fill="none"
      />

      {showDistricts && (
        <g className="district-labels" pointerEvents="none">
          {districtLabels.map((d) => (
            <text key={d.id} x={d.x} y={d.y} textAnchor="middle">
              {d.name}
            </text>
          ))}
        </g>
      )}

      {sorted.map((line) => {
        const pts = getLinePath(line);
        const d = pathD(pts, line.mode);
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
                strokeOpacity={0.22}
                strokeLinejoin="round"
                strokeLinecap="round"
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
        const onRoute =
          routeSet.size > 0 &&
          [...routeSet].some((id) => {
            const s = stations[id];
            return s && s.x === st.x && s.y === st.y;
          });
        const atSelected = selectedStationId === st.id || Boolean(onSelectedLine) || onRoute;
        const showLabel =
          atSelected ||
          showAllLabels ||
          (showInterchangeLabels && (st.interchange || st.majorHub));

        const faded =
          (selectedLineId && !onSelectedLine) || (routeSet.size > 0 && !onRoute);

        return (
          <g
            key={st.id}
            data-station
            className={`station ${st.interchange ? 'interchange' : ''} ${st.majorHub ? 'major-hub' : ''} ${atSelected ? 'active' : ''}`}
            opacity={faded ? 0.1 : 1}
            transform={`translate(${st.x}, ${st.y})`}
            onClick={(e) => {
              e.stopPropagation();
              onSelectStation(st.id);
            }}
          >
            {st.majorHub ? (
              <>
                <circle r="13" className="hub-ring-outer" />
                <circle r="8" className="station-ring" />
                <circle r="4" className="station-core" />
              </>
            ) : st.interchange ? (
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
                x={st.majorHub ? 16 : 11}
                y={4}
                style={{ fontSize: st.majorHub ? 12 : st.interchange ? 11 : 9 }}
              >
                {st.name}
              </text>
            )}
          </g>
        );
      })}

      {hubFocus && (
        <HubDiagram
          stationId={hubFocus.id}
          x={hubFocus.x}
          y={hubFocus.y}
          onSelectLine={onSelectLine}
        />
      )}
    </svg>
  );
}

function HubDiagram({
  stationId,
  x,
  y,
  onSelectLine,
}: {
  stationId: string;
  x: number;
  y: number;
  onSelectLine: (id: string) => void;
}) {
  const connected = getLinesForStation(stationId).slice(0, 12);
  const r = 52;
  return (
    <g className="hub-diagram" transform={`translate(${x}, ${y})`}>
      <circle r={r + 18} className="hub-diagram-bg" />
      <text className="hub-diagram-title" y={-r - 24} textAnchor="middle">
        Esquema del intercambiador
      </text>
      {connected.map((line, i) => {
        const angle = (i / Math.max(connected.length, 1)) * Math.PI * 2 - Math.PI / 2;
        const x2 = Math.cos(angle) * r;
        const y2 = Math.sin(angle) * r;
        return (
          <g
            key={line.id}
            className="hub-spoke"
            onClick={(e) => {
              e.stopPropagation();
              onSelectLine(line.id);
            }}
          >
            <line x1={0} y1={0} x2={x2} y2={y2} stroke={line.color} strokeWidth={4} />
            <circle cx={x2} cy={y2} r={10} fill={line.color} />
            <text
              x={x2}
              y={y2 + 3.5}
              textAnchor="middle"
              className="hub-spoke-code"
            >
              {line.code}
            </text>
          </g>
        );
      })}
      <circle r={10} fill="#eef1f4" stroke="#1a2332" strokeWidth={2.5} />
    </g>
  );
}
