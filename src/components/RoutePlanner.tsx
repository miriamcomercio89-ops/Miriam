import { useMemo, useState } from 'react';
import { getUniqueStations } from '../data/network';
import { findRoute, stationLabel, type RoutePlan } from '../data/routing';
import './RoutePlanner.css';

interface Props {
  onRoute: (plan: RoutePlan | null) => void;
  onPickStation: (id: string) => void;
}

export function RoutePlanner({ onRoute, onPickStation }: Props) {
  const stations = useMemo(
    () => getUniqueStations().sort((a, b) => a.name.localeCompare(b.name, 'es')),
    [],
  );
  const [fromId, setFromId] = useState('');
  const [toId, setToId] = useState('');
  const [plan, setPlan] = useState<RoutePlan | null>(null);
  const [error, setError] = useState('');

  const swap = () => {
    setFromId(toId);
    setToId(fromId);
    setPlan(null);
    onRoute(null);
    setError('');
  };

  const calculate = () => {
    if (!fromId || !toId) {
      setError('Elige origen y destino');
      return;
    }
    if (fromId === toId) {
      setError('Origen y destino deben ser distintos');
      return;
    }
    const result = findRoute(fromId, toId);
    if (!result) {
      setError('No hay ruta disponible (línea suspendida o sin conexión)');
      setPlan(null);
      onRoute(null);
      return;
    }
    setError('');
    setPlan(result);
    onRoute(result);
  };

  const clear = () => {
    setPlan(null);
    onRoute(null);
    setError('');
  };

  return (
    <section className="route-planner">
      <h2>Planificar viaje</h2>
      <label>
        <span>Origen</span>
        <select value={fromId} onChange={(e) => { setFromId(e.target.value); clear(); }}>
          <option value="">Elegir estación…</option>
          {stations.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} · {s.district}
            </option>
          ))}
        </select>
      </label>
      <div className="route-swap-row">
        <button type="button" className="swap-btn" onClick={swap} aria-label="Intercambiar origen y destino">
          ↕
        </button>
      </div>
      <label>
        <span>Destino</span>
        <select value={toId} onChange={(e) => { setToId(e.target.value); clear(); }}>
          <option value="">Elegir estación…</option>
          {stations.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} · {s.district}
            </option>
          ))}
        </select>
      </label>
      <div className="route-actions">
        <button type="button" className="primary" onClick={calculate}>
          Calcular ruta
        </button>
        {plan && (
          <button type="button" className="ghost" onClick={clear}>
            Limpiar
          </button>
        )}
      </div>
      {error && <p className="route-error">{error}</p>}
      {plan && (
        <div className="route-result">
          <p className="route-summary">
            <strong>{plan.estimatedMinutes} min</strong>
            <span>
              {plan.totalStops} paradas · {plan.transfers} trasbordo{plan.transfers === 1 ? '' : 's'}
            </span>
          </p>
          <ol className="route-legs">
            {plan.legs.map((leg, idx) => (
              <li key={`${leg.line.id}-${idx}`}>
                <span className="leg-badge" style={{ background: leg.line.color }}>
                  {leg.line.code}
                </span>
                <span className="leg-text">
                  <button type="button" onClick={() => onPickStation(leg.fromId)}>
                    {stationLabel(leg.fromId)}
                  </button>
                  {' → '}
                  <button type="button" onClick={() => onPickStation(leg.toId)}>
                    {stationLabel(leg.toId)}
                  </button>
                  <small>
                    {leg.stopCount} paradas · {leg.line.name}
                  </small>
                </span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </section>
  );
}
