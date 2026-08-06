import type { DayPeriod, UserRole } from '../data/types';
import { PERIOD_LABELS } from '../data/time';
import './TopBar.css';

interface Props {
  role: UserRole;
  onRoleChange: (r: UserRole) => void;
  clock: string;
  period: DayPeriod;
  paused: boolean;
  onTogglePause: () => void;
  onSetTime: (hhmm: string) => void;
  onJump: (deltaMin: number) => void;
  onSyncNow: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
}

export function TopBar({
  role,
  onRoleChange,
  clock,
  period,
  paused,
  onTogglePause,
  onSetTime,
  onJump,
  onSyncNow,
  onZoomIn,
  onZoomOut,
  onReset,
}: Props) {
  return (
    <div className="top-bar">
      <div className="role-switch" role="group" aria-label="Modo de usuario">
        <button
          type="button"
          className={role === 'pasajero' ? 'active' : ''}
          onClick={() => onRoleChange('pasajero')}
        >
          Pasajero
        </button>
        <button
          type="button"
          className={role === 'operador' ? 'active' : ''}
          onClick={() => onRoleChange('operador')}
        >
          Operador
        </button>
      </div>

      <div className="clock-panel">
        <span className={`live-dot ${paused ? 'paused' : ''}`} />
        <label className="clock-input-wrap">
          <span className="sr-only">Hora simulada</span>
          <input
            type="time"
            value={clock}
            onChange={(e) => onSetTime(e.target.value)}
            title="Modificar hora de la simulación"
          />
        </label>
        <span className={`period-pill period-${period}`}>{PERIOD_LABELS[period]}</span>
        <div className="clock-actions">
          <button type="button" onClick={() => onJump(-30)} title="-30 min">
            −30
          </button>
          <button type="button" onClick={onTogglePause} title={paused ? 'Reanudar' : 'Pausar'}>
            {paused ? '▶' : '❚❚'}
          </button>
          <button type="button" onClick={() => onJump(30)} title="+30 min">
            +30
          </button>
          <button type="button" onClick={onSyncNow} title="Hora real">
            Ahora
          </button>
        </div>
      </div>

      <div className="zoom-controls">
        <button type="button" onClick={onZoomOut} aria-label="Alejar">
          −
        </button>
        <button type="button" onClick={onReset} aria-label="Centrar mapa">
          ⊕
        </button>
        <button type="button" onClick={onZoomIn} aria-label="Acercar">
          +
        </button>
      </div>
    </div>
  );
}
