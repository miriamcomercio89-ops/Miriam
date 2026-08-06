import { useEffect, useState } from 'react';
import { DetailPanel } from './components/DetailPanel';
import { SidePanel } from './components/SidePanel';
import { TopBar } from './components/TopBar';
import { TransitMap } from './components/TransitMap';
import { simulatedClock } from './data/schedules';
import type { TransportMode, UserRole } from './data/types';
import { usePanZoom } from './hooks/usePanZoom';
import './App.css';

export default function App() {
  const [role, setRole] = useState<UserRole>('pasajero');
  const [selectedLineId, setSelectedLineId] = useState<string | null>(null);
  const [selectedStationId, setSelectedStationId] = useState<string | null>(null);
  const [filterMode, setFilterMode] = useState<TransportMode | null>(null);
  const [search, setSearch] = useState('');
  const [clock, setClock] = useState(simulatedClock());
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const { state, containerRef, onPointerDown, onPointerMove, onPointerUp, zoomBy, reset } =
    usePanZoom({ scale: 0.72, x: -40, y: -20 });

  useEffect(() => {
    const id = window.setInterval(() => setClock(simulatedClock()), 15_000);
    return () => window.clearInterval(id);
  }, []);

  const selectLine = (id: string) => {
    setSelectedLineId(id);
    setSelectedStationId(null);
  };

  const selectStation = (id: string) => {
    setSelectedStationId(id);
    setSelectedLineId(null);
  };

  const clearSelection = () => {
    setSelectedLineId(null);
    setSelectedStationId(null);
    setFilterMode(null);
    setSearch('');
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
          onClearSelection={clearSelection}
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
              dimOthers={Boolean(selectedLineId || filterMode)}
              onSelectLine={selectLine}
              onSelectStation={selectStation}
            />
          </div>
        </div>

        <TopBar
          role={role}
          onRoleChange={setRole}
          clock={clock}
          onZoomIn={() => zoomBy(1.2)}
          onZoomOut={() => zoomBy(1 / 1.2)}
          onReset={reset}
        />

        <DetailPanel
          role={role}
          selectedLineId={selectedLineId}
          selectedStationId={selectedStationId}
          onSelectLine={selectLine}
          onClose={() => {
            setSelectedLineId(null);
            setSelectedStationId(null);
          }}
        />

        <p className="map-hint">Arrastra el plano · rueda para zoom · clic en línea o estación</p>
      </main>
    </div>
  );
}
