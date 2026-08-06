import { simulatedClock } from '../data/schedules';
import type { UserRole } from '../data/types';
import './TopBar.css';

interface Props {
  role: UserRole;
  onRoleChange: (r: UserRole) => void;
  clock: string;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
}

export function TopBar({ role, onRoleChange, clock, onZoomIn, onZoomOut, onReset }: Props) {
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

      <div className="top-center">
        <span className="live-dot" />
        <span>Simulación en vivo</span>
        <time>{clock || simulatedClock()}</time>
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
