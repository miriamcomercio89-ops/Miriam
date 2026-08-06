import { memo, useMemo } from 'react';
import {
  CITY,
  getLinesForStation,
  stations,
} from '../data/network';
import {
  DISTRICT_SHAPES,
  HUB_STATIONS,
  MAJOR_STATIONS,
  MUNICIPALITY_SHAPES,
} from '../data/geography';
import { CACHED_LINE_PATHS, labelFontSize, strokeForMode } from '../data/mapCache';
import { WALK_EDGES } from '../data/walk';
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

function dashArray(mode: string): string | undefined {
  if (mode === 'bus') return '6 5';
  return undefined;
}

function TransitMapInner({
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
  const routeSet = useMemo(() => new Set(routeStationIds ?? []), [routeStationIds]);
  const routeLines = useMemo(() => new Set(routeLineIds ?? []), [routeLineIds]);

  // LOD por zoom
  const showMunicipalities = mapScale < 0.85;
  const showDistrictFills = mapScale >= 0.28 && mapScale < 1.4;
  const showMunicipalityLabels = mapScale < 0.55;
  const showDistrictLabels = mapScale >= 0.4 && mapScale < 1.05;
  const showBuses = mapScale >= 0.42 || Boolean(selectedLineId) || routeLines.size > 0;
  const showLocalStops = mapScale >= 0.85;
  const showInterchangeLabels = mapScale >= 0.5;
  const showAllHubLabels = mapScale >= 0.95;
  const showWalkLinks = mapScale >= 1.15;
  const showHubDiagram = mapScale >= 1.3;
  const useSimplePaths = mapScale < 0.5;

  const visibleStations = useMemo(() => {
    if (showLocalStops) {
      // Hubs + densificados solo si hay línea/ruta seleccionada o zoom alto
      if (selectedLineId || routeSet.size) {
        const ids = new Set<string>();
        if (selectedLineId) {
          const line = CACHED_LINE_PATHS.find((c) => c.line.id === selectedLineId)?.line;
          line?.stationIds.forEach((id) => ids.add(id));
        }
        routeSet.forEach((id) => ids.add(id));
        MAJOR_STATIONS.forEach((s) => ids.add(s.id));
        return [...ids].map((id) => stations[id]).filter(Boolean);
      }
      return HUB_STATIONS;
    }
    return MAJOR_STATIONS;
  }, [showLocalStops, selectedLineId, routeSet]);

  const visiblePaths = useMemo(() => {
    return CACHED_LINE_PATHS.filter(({ line }) => {
      if (!showBuses && line.mode === 'bus' && line.id !== selectedLineId && !routeLines.has(line.id)) {
        return false;
      }
      return true;
    });
  }, [showBuses, selectedLineId, routeLines]);

  const walkNearSelection = useMemo(() => {
    if (!showWalkLinks || !selectedStationId) return [];
    return WALK_EDGES.filter((e) => e.from === selectedStationId || e.to === selectedStationId).slice(0, 12);
  }, [showWalkLinks, selectedStationId]);

  const isLineActive = (line: TransitLine) => {
    if (routeLines.size) return routeLines.has(line.id);
    if (selectedLineId) return line.id === selectedLineId;
    if (highlightedMode) return line.mode === highlightedMode;
    return true;
  };

  const lineOpacity = (line: TransitLine) => {
    if (routeLines.size) return routeLines.has(line.id) ? 1 : 0.06;
    if (!dimOthers && !selectedLineId && !highlightedMode) return 1;
    return isLineActive(line) ? 1 : 0.08;
  };

  const selectedStation = selectedStationId ? stations[selectedStationId] : null;
  const hubFocus = showHubDiagram && selectedStation?.majorHub ? selectedStation : null;

  const muniLabelSize = labelFontSize(22, mapScale);
  const distLabelSize = labelFontSize(13, mapScale);
  const stationLabelSize = labelFontSize(10, mapScale);

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
        <pattern id="grid" width="80" height="80" patternUnits="userSpaceOnUse">
          <path d="M 80 0 L 0 0 0 80" fill="none" stroke="rgba(30,40,55,0.025)" strokeWidth="1" />
        </pattern>
        <linearGradient id="sea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(56,140,180,0.07)" />
          <stop offset="100%" stopColor="rgba(56,140,180,0.2)" />
        </linearGradient>
      </defs>

      <rect width={CITY.mapWidth} height={CITY.mapHeight} fill="url(#grid)" />
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

      {showMunicipalities &&
        MUNICIPALITY_SHAPES.map((m) => (
          <polygon key={m.id} points={m.points} className="muni-fill" style={{ fill: m.fill }} />
        ))}

      {showDistrictFills &&
        DISTRICT_SHAPES.map((d) => (
          <polygon key={d.id} points={d.points} className="district-fill" style={{ fill: d.fill }} />
        ))}

      {showMunicipalityLabels &&
        MUNICIPALITY_SHAPES.map((m) => (
          <text
            key={`ml-${m.id}`}
            x={m.cx}
            y={m.cy}
            textAnchor="middle"
            className="muni-label"
            style={{ fontSize: muniLabelSize }}
          >
            {m.name}
          </text>
        ))}

      {showDistrictLabels &&
        DISTRICT_SHAPES.map((d) => (
          <text
            key={`dl-${d.id}`}
            x={d.cx}
            y={d.cy - 8}
            textAnchor="middle"
            className="district-label"
            style={{ fontSize: distLabelSize }}
          >
            {d.name}
          </text>
        ))}

      {walkNearSelection.map((e) => {
        const a = stations[e.from];
        const b = stations[e.to];
        if (!a || !b) return null;
        return (
          <g key={`w-${e.from}-${e.to}`} className="walk-link">
            <line
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke="#78909C"
              strokeWidth={strokeForMode('bus', mapScale) * 0.7}
              strokeDasharray="4 6"
              strokeOpacity={0.7}
            />
            <text
              x={(a.x + b.x) / 2}
              y={(a.y + b.y) / 2 - 6}
              textAnchor="middle"
              className="walk-label"
              style={{ fontSize: labelFontSize(9, mapScale) }}
            >
              {e.minutes} min a pie
            </text>
          </g>
        );
      })}

      {visiblePaths.map(({ line, full, simple }) => {
        const d = useSimplePaths ? simple : full;
        const selected = selectedLineId === line.id || routeLines.has(line.id);
        const sw = strokeForMode(line.mode, mapScale) * (selected ? 1.25 : 1);
        return (
          <g key={line.id} opacity={lineOpacity(line)} className="line-group">
            <path
              d={d}
              fill="none"
              stroke="transparent"
              strokeWidth={Math.max(14, sw * 2.5)}
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
                strokeWidth={sw + 4}
                strokeOpacity={0.2}
                strokeLinejoin="round"
                strokeLinecap="round"
                pointerEvents="none"
              />
            )}
            <path
              d={d}
              fill="none"
              stroke={line.color}
              strokeWidth={sw}
              strokeDasharray={dashArray(line.mode)}
              strokeLinejoin="round"
              strokeLinecap="round"
              pointerEvents="none"
            />
          </g>
        );
      })}

      {visibleStations.map((st) => {
        const onSelectedLine =
          selectedLineId &&
          CACHED_LINE_PATHS.find((c) => c.line.id === selectedLineId)?.line.stationIds.includes(st.id);
        const onRoute = routeSet.has(st.id);
        const atSelected = selectedStationId === st.id || Boolean(onSelectedLine) || onRoute;
        const showLabel =
          atSelected ||
          (showAllHubLabels && (st.interchange || st.majorHub)) ||
          (showInterchangeLabels && st.majorHub);

        const faded =
          (selectedLineId && !onSelectedLine && !st.majorHub) ||
          (routeSet.size > 0 && !onRoute && !st.majorHub);

        const r = st.majorHub ? 11 : st.interchange ? 7.5 : 4;
        const scaledR = r * Math.min(1.8, Math.max(0.7, 0.55 / Math.max(0.25, mapScale)));

        return (
          <g
            key={st.id}
            data-station
            className={`station ${st.interchange ? 'interchange' : ''} ${st.majorHub ? 'major-hub' : ''} ${atSelected ? 'active' : ''}`}
            opacity={faded ? 0.12 : 1}
            transform={`translate(${st.x}, ${st.y})`}
            onClick={(e) => {
              e.stopPropagation();
              onSelectStation(st.id);
            }}
          >
            {st.majorHub ? (
              <>
                <circle r={scaledR + 4} className="hub-ring-outer" />
                <circle r={scaledR} className="station-ring" />
                <circle r={scaledR * 0.45} className="station-core" />
              </>
            ) : st.interchange ? (
              <>
                <circle r={scaledR} className="station-ring" />
                <circle r={scaledR * 0.5} className="station-core" />
              </>
            ) : (
              <circle r={scaledR} className="station-dot" />
            )}
            {showLabel && (
              <text
                className="station-label"
                x={scaledR + 6}
                y={4}
                style={{ fontSize: stationLabelSize * (st.majorHub ? 1.15 : 1) }}
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
          mapScale={mapScale}
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
  mapScale,
  onSelectLine,
}: {
  stationId: string;
  x: number;
  y: number;
  mapScale: number;
  onSelectLine: (id: string) => void;
}) {
  const connected = getLinesForStation(stationId).slice(0, 10);
  const scale = Math.min(1.6, Math.max(0.7, 0.7 / Math.max(0.3, mapScale)));
  const r = 48 * scale;
  return (
    <g className="hub-diagram" transform={`translate(${x}, ${y})`}>
      <circle r={r + 16} className="hub-diagram-bg" />
      <text className="hub-diagram-title" y={-r - 20} textAnchor="middle" style={{ fontSize: 11 * scale }}>
        Intercambiador
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
            <line x1={0} y1={0} x2={x2} y2={y2} stroke={line.color} strokeWidth={3.5 * scale} />
            <circle cx={x2} cy={y2} r={9 * scale} fill={line.color} />
            <text x={x2} y={y2 + 3} textAnchor="middle" className="hub-spoke-code" style={{ fontSize: 7 * scale }}>
              {line.code}
            </text>
          </g>
        );
      })}
      <circle r={9 * scale} fill="#eef1f4" stroke="#1a2332" strokeWidth={2} />
    </g>
  );
}

export const TransitMap = memo(TransitMapInner);
