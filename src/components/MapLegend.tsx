import { MODE_LABELS, MODE_LEGEND } from '../data/types';
import './MapLegend.css';

const STYLE_SAMPLE: Record<string, { dash?: string; width: number; glow?: boolean }> = {
  solid: { width: 4 },
  dashed: { dash: '5 4', width: 3.5 },
  dotted: { dash: '2 3', width: 3 },
  glow: { width: 4, glow: true },
};

const SAMPLE_COLORS: Record<string, string> = {
  metro: '#E53935',
  cercanias: '#0D47A1',
  tranvia: '#E65100',
  bus: '#546E7A',
  hyperloop: '#00BFA5',
  ferry: '#0288D1',
  cable: '#8D6E63',
};

export function MapLegend() {
  return (
    <div className="map-legend" aria-label="Leyenda del mapa">
      <p className="legend-title">Leyenda</p>
      <ul>
        {MODE_LEGEND.map(({ mode, style }) => {
          const s = STYLE_SAMPLE[style];
          return (
            <li key={mode}>
              <svg width="28" height="10" aria-hidden>
                {s.glow && (
                  <line
                    x1="1"
                    y1="5"
                    x2="27"
                    y2="5"
                    stroke={SAMPLE_COLORS[mode]}
                    strokeWidth={s.width + 3}
                    strokeOpacity="0.3"
                    strokeLinecap="round"
                  />
                )}
                <line
                  x1="1"
                  y1="5"
                  x2="27"
                  y2="5"
                  stroke={SAMPLE_COLORS[mode]}
                  strokeWidth={s.width}
                  strokeDasharray={s.dash}
                  strokeLinecap="round"
                />
              </svg>
              <span>{MODE_LABELS[mode]}</span>
            </li>
          );
        })}
        <li>
          <svg width="28" height="14" aria-hidden>
            <circle cx="14" cy="7" r="5" fill="#eef1f4" stroke="#1a2332" strokeWidth="2" />
            <circle cx="14" cy="7" r="2.2" fill="#1a2332" />
          </svg>
          <span>Correspondencia</span>
        </li>
      </ul>
      <p className="legend-codes">Metro L · Cercanías C · Tranvía T</p>
    </div>
  );
}
