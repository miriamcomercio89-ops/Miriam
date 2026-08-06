import { useEffect, useState } from 'react';
import { DetailPanel } from './components/DetailPanel';
import { MapLegend } from './components/MapLegend';
import { SidePanel } from './components/SidePanel';
import { TopBar } from './components/TopBar';
import { TransitMap } from './components/TransitMap';
import { findLineByCode, getLineBounds, getStation, lines } from './data/network';
import type { RoutePlan } from './data/routing';
import { periodFromMinutes } from './data/time';
import type { TransportMode, UserRole } from './data/types';
import { usePanZoom } from './hooks/usePanZoom';
import { useSimClock } from './hooks/useSimClock';
import './App.css';

function readLineFromUrl(): string | null {
  const params = new URLSearchParams(window.location.search);
  const code = params.get('linea');
  if (!code) return null;
  return findLineByCode(code)?.id ?? null;
}

function writeLineToUrl(lineId: string | null) {
  if (window.location.protocol === 'file:') return;
  const url = new URL(window.location.href);
  if (lineId) {
    const line = lines.find((l) => l.id === lineId);
    if (line) url.searchParams.set('linea', line.code);
  } else {
    url.searchParams.delete('linea');
  }
  window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
}

export default function App() {
  const [role, setRole] = useState<UserRole>('pasajero');
  const [selectedLineId, setSelectedLineId] = useState<string | null>(() => readLineFromUrl());
  const [selectedStationId, setSelectedStationId] = useState<string | null>(null);
  const [filterMode, setFilterMode] = useState<TransportMode | null>(null);
  const [search, setSearch] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [routePlan, setRoutePlan] = useState<RoutePlan | null>(null);

  const sim = useSimClock();
  const period = periodFromMinutes(sim.minutes);

  const {
    state,
    containerRef,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    zoomBy,
    reset,
    fitBounds,
    focusPoint,
  } = usePanZoom({ scale: 0.24, x: 10, y: 0 });

  useEffect(() => {
    const id = readLineFromUrl();
    if (!id) return;
    const line = lines.find((l) => l.id === id);
    if (!line) return;
    const bounds = getLineBounds(line);
    if (bounds) window.setTimeout(() => fitBounds(bounds, 100), 50);
  }, [fitBounds]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return;

      if (e.key === 'Escape') {
        setSelectedLineId(null);
        setSelectedStationId(null);
        setRoutePlan(null);
        writeLineToUrl(null);
      } else if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        zoomBy(1.2);
      } else if (e.key === '-' || e.key === '_') {
        e.preventDefault();
        zoomBy(1 / 1.2);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [zoomBy]);

  const selectLine = (id: string) => {
    setSelectedLineId(id);
    setSelectedStationId(null);
    setRoutePlan(null);
    writeLineToUrl(id);
    const line = lines.find((l) => l.id === id);
    if (line) {
      const bounds = getLineBounds(line);
      if (bounds) fitBounds(bounds, 100);
    }
  };

  const selectStation = (id: string) => {
    setSelectedStationId(id);
    setSelectedLineId(null);
    writeLineToUrl(null);
    const st = getStation(id);
    if (st) focusPoint(st.x, st.y, 1.15);
  };

  const clearSelection = () => {
    setSelectedLineId(null);
    setSelectedStationId(null);
    setFilterMode(null);
    setSearch('');
    setRoutePlan(null);
    writeLineToUrl(null);
  };

  const handleRoute = (plan: RoutePlan | null) => {
    setRoutePlan(plan);
    setSelectedLineId(null);
    setSelectedStationId(null);
    writeLineToUrl(null);
    if (plan && plan.stationIds.length) {
      const xs = plan.stationIds.map((id) => getStation(id)!).filter(Boolean);
      if (xs.length) {
        fitBounds(
          {
            minX: Math.min(...xs.map((s) => s.x)),
            minY: Math.min(...xs.map((s) => s.y)),
            maxX: Math.max(...xs.map((s) => s.x)),
            maxY: Math.max(...xs.map((s) => s.y)),
          },
          120,
        );
      }
    }
  };

  return (
    <div className={`app ${sidebarOpen ? '' : 'sidebar-collapsed'}`}>
      <button
        type="button"
        className="sidebar-toggle"
        onClick={() => setSidebarOpen((v) => !v)}
        aria-label={sidebarOpen ? 'Ocultar menú' : 'Mostrar menú'}
      >
        {sidebarOpen ? '‹' : '›'}
      </button>

      <div className="sidebar-slot">
        <SidePanel
          role={role}
          selectedLineId={selectedLineId}
          filterMode={filterMode}
          search={search}
          onSearch={setSearch}
          onFilterMode={setFilterMode}
          onSelectLine={selectLine}
          onSelectStation={selectStation}
          onClearSelection={clearSelection}
          onRoute={handleRoute}
          simMinutes={sim.minutes}
          period={period}
        />
      </div>

      <main className="map-stage">
        <div
          className="map-viewport"
          ref={containerRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
        >
          <div
            className="map-transform"
            style={{
              transform: `translate(${state.x}px, ${state.y}px) scale(${state.scale})`,
            }}
          >
            <TransitMap
              selectedLineId={selectedLineId}
              selectedStationId={selectedStationId}
              highlightedMode={filterMode}
              routeStationIds={routePlan?.stationIds ?? null}
              routeLineIds={routePlan?.legs.map((l) => l.line.id) ?? null}
              mapScale={state.scale}
              dimOthers={Boolean(selectedLineId || filterMode || routePlan)}
              onSelectLine={selectLine}
              onSelectStation={selectStation}
            />
          </div>
        </div>

        <TopBar
          role={role}
          onRoleChange={setRole}
          clock={sim.clock}
          period={period}
          paused={sim.paused}
          onTogglePause={sim.togglePause}
          onSetTime={sim.setTime}
          onJump={sim.jumpMinutes}
          onSyncNow={sim.syncNow}
          onZoomIn={() => zoomBy(1.2)}
          onZoomOut={() => zoomBy(1 / 1.2)}
          onReset={reset}
        />

        <MapLegend />

        <DetailPanel
          role={role}
          selectedLineId={selectedLineId}
          selectedStationId={selectedStationId}
          simMinutes={sim.minutes}
          period={period}
          onSelectLine={selectLine}
          onClose={() => {
            setSelectedLineId(null);
            setSelectedStationId(null);
            writeLineToUrl(null);
          }}
        />

        <p className="map-hint">
          Reloj en vivo · punta/valle/noche · Esc cierra · +/- zoom
        </p>
      </main>
    </div>
  );
}
