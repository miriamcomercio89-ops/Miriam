import { useMemo, useState } from 'react';
import { getUniqueStations } from '../data/network';
import { findRoutes, stationLabel, type RoutePlan } from '../data/routing';
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
  const [plans, setPlans] = useState<RoutePlan[]>([]);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [error, setError] = useState('');

  const swap = () => {
    setFromId(toId);
    setToId(fromId);
    setPlans([]);
    setSelectedIdx(0);
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
    const results = findRoutes(fromId, toId, 3);
    if (!results.length) {
      setError('No hay ruta disponible');
      setPlans([]);
      onRoute(null);
      return;
    }
    setError('');
    setPlans(results);
    setSelectedIdx(0);
    onRoute(results[0]);
  };

  const clear = () => {
    setPlans([]);
    setSelectedIdx(0);
    onRoute(null);
    setError('');
  };

  const selectPlan = (idx: number) => {
    setSelectedIdx(idx);
    onRoute(plans[idx] ?? null);
  };

  const plan = plans[selectedIdx] ?? null;

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
        <button type="button" className="swap-btn" onClick={swap} aria-label="Intercambiar">
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
          Calcular rutas
        </button>
        {plan && (
          <button type="button" className="ghost" onClick={clear}>
            Limpiar
          </button>
        )}
      </div>
      {error && <p className="route-error">{error}</p>}

      {plans.length > 0 && (
        <div className="route-alts">
          {plans.map((p, idx) => (
            <button
              key={`${p.label}-${idx}`}
              type="button"
              className={`alt-chip ${idx === selectedIdx ? 'active' : ''}`}
              onClick={() => selectPlan(idx)}
            >
              <strong>{p.label}</strong>
              <span>
                {p.estimatedMinutes} min · {p.transfers} trasb.
              </span>
            </button>
          ))}
        </div>
      )}

      {plan && (
        <div className="route-result">
          <p className="route-summary">
            <strong>{plan.estimatedMinutes} min</strong>
            <span>
              {plan.totalStops} paradas · {plan.transfers} trasbordo{plan.transfers === 1 ? '' : 's'}
            </span>
          </p>

          <h3 className="steps-title">Indicaciones</h3>
          <ol className="route-steps">
            {plan.steps.map((step, i) => (
              <li key={i} className={`step-${step.kind}`}>
                {step.line && (
                  <span className="leg-badge" style={{ background: step.line.color }}>
                    {step.line.code}
                  </span>
                )}
                <span>
                  {step.text}
                  {step.stationId && (
                    <>
                      {' '}
                      <button type="button" className="inline-link" onClick={() => onPickStation(step.stationId!)}>
                        ver
                      </button>
                    </>
                  )}
                </span>
              </li>
            ))}
          </ol>

          <h3 className="steps-title">Tramos</h3>
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
