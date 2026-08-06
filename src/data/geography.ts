import { districtLabels, getUniqueStations, stations } from './network';

export interface Municipality {
  id: string;
  name: string;
  /** Centros aproximados (para etiqueta) */
  x: number;
  y: number;
  /** Distritos que agrupa (por nombre) */
  districtNames: string[];
  color: string;
}

/** Municipios del área metropolitana de Heliora */
export const MUNICIPALITIES: Municipality[] = [
  {
    id: 'heliora_capital',
    name: 'Heliora Capital',
    x: 2100,
    y: 1500,
    districtNames: [
      'Casco Antiguo', 'El Perchel', 'Soho Heliora', 'La Ensenada', 'La Victoria',
      'Capuchinos', 'Cruz Humilladero', 'Ciudad de la Justicia', 'Distrito Hospitalario',
      'La Rosaleda', 'El Limonar', 'Cerrado de Calderón', 'Ciudad Jardín', 'El Pastor',
      'Avenida del Sol', 'Carretera de Cádiz', 'Estación María Zambrano',
      'Plaza de la Merced', 'La Alcazaba', 'Centro Histórico Este', 'Barrio de la Judería',
      'Ensanche Sur', 'Pedregalejo Urbano', 'Huelin Urbano',
    ],
    color: 'rgba(196, 92, 38, 0.10)',
  },
  {
    id: 'torres_costa',
    name: 'Torres del Mar',
    x: 1680,
    y: 2000,
    districtNames: ['Torres del Mar', 'La Bajadilla', 'Puerto Marina', 'Sacaba Beach', 'Playa del Faro'],
    color: 'rgba(2, 119, 189, 0.10)',
  },
  {
    id: 'arenales_mun',
    name: 'Los Arenales',
    x: 3100,
    y: 2000,
    districtNames: ['Los Arenales', 'Cala Serena', 'Paseo de Levante', 'Rincón del Mar', 'La Cala del Sol'],
    color: 'rgba(0, 151, 167, 0.10)',
  },
  {
    id: 'guadalmar_mun',
    name: 'Guadalmar',
    x: 780,
    y: 1720,
    districtNames: ['Guadalmar', 'Churriana', 'Aeropuerto Costa del Sol', 'Puerto Heliora', 'San Andrés'],
    color: 'rgba(94, 53, 177, 0.09)',
  },
  {
    id: 'campus_mun',
    name: 'Campus del Olivar',
    x: 1600,
    y: 780,
    districtNames: [
      'Campus del Olivar', 'Ciudad del Olivo', 'Plaza Mayor Comercial', 'Campanillas',
      'Parque Tecnológico', 'Ciudad Universitaria Norte', 'Residencial Campus',
    ],
    color: 'rgba(46, 125, 50, 0.10)',
  },
  {
    id: 'mijas_mun',
    name: 'Mijas de Heliora',
    x: 2400,
    y: 480,
    districtNames: ['Mijas de Heliora', 'Arroyo de la Miel', 'Urbanización El Pinillo', 'Monte Heliora', 'Altos del Mediterráneo'],
    color: 'rgba(121, 85, 72, 0.10)',
  },
  {
    id: 'valle_mun',
    name: 'Valle del Guadalhorce',
    x: 1200,
    y: 500,
    districtNames: ['Coín Valle', 'Alhaurín del Monte', 'Cártama Sierra', 'Polígono Guadalhorce', 'Los Boliches Interior'],
    color: 'rgba(85, 139, 47, 0.10)',
  },
  {
    id: 'levante_mun',
    name: 'Nueva Heliora Levante',
    x: 3300,
    y: 1400,
    districtNames: ['Nueva Heliora', 'La Viñuela', 'Ojén Blanco', 'Istán Lago', 'Sierra Blanca Este'],
    color: 'rgba(233, 30, 99, 0.08)',
  },
  {
    id: 'deportivo_mun',
    name: 'Ciudad Deportiva',
    x: 1950,
    y: 1280,
    districtNames: ['La Rosaleda', 'Ciudad Deportiva Heliora', 'Recinto Ferial', 'Palacio de Deportes'],
    color: 'rgba(255, 152, 0, 0.10)',
  },
];

export interface DistrictShape {
  id: string;
  name: string;
  cx: number;
  cy: number;
  points: string; // SVG polygon points
  kind: 'barrio' | 'municipio';
  fill: string;
}

function ellipsePoints(cx: number, cy: number, rx: number, ry: number, n = 14, rot = 0): string {
  const pts: string[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + rot;
    // Ligera irregularidad para aspecto más orgánico
    const jitter = 1 + Math.sin(i * 1.7 + cx * 0.01) * 0.08;
    const x = cx + Math.cos(a) * rx * jitter;
    const y = cy + Math.sin(a) * ry * jitter;
    pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }
  return pts.join(' ');
}

/** Formas de barrio a partir de estaciones reales */
export function buildDistrictShapes(): DistrictShape[] {
  const byDistrict = new Map<string, { xs: number[]; ys: number[] }>();
  for (const s of Object.values(stations)) {
    // Solo hubs nombrados (no apeaderos densificados) para el bounding
    if (s.id.includes('_s')) continue;
    const bucket = byDistrict.get(s.district) ?? { xs: [], ys: [] };
    bucket.xs.push(s.x);
    bucket.ys.push(s.y);
    byDistrict.set(s.district, bucket);
  }

  // Asegurar etiquetas aunque no tengan estaciones filtradas
  for (const d of districtLabels) {
    if (!byDistrict.has(d.name)) {
      byDistrict.set(d.name, { xs: [d.x], ys: [d.y + 110] });
    }
  }

  const shapes: DistrictShape[] = [];
  let i = 0;
  for (const [name, { xs, ys }] of byDistrict) {
    const cx = xs.reduce((a, b) => a + b, 0) / xs.length;
    const cy = ys.reduce((a, b) => a + b, 0) / ys.length;
    const spreadX = Math.max(70, (Math.max(...xs) - Math.min(...xs)) / 2 + 55);
    const spreadY = Math.max(55, (Math.max(...ys) - Math.min(...ys)) / 2 + 45);
    const hue = (i * 47) % 360;
    shapes.push({
      id: `dist-${i}`,
      name,
      cx,
      cy,
      points: ellipsePoints(cx, cy, spreadX, spreadY, 12, i * 0.2),
      kind: 'barrio',
      fill: `hsla(${hue}, 35%, 55%, 0.11)`,
    });
    i++;
  }
  return shapes;
}

export function buildMunicipalityShapes(): DistrictShape[] {
  const districtShapes = buildDistrictShapes();
  const byName = new Map(districtShapes.map((d) => [d.name, d]));

  return MUNICIPALITIES.map((m, idx) => {
    const members = m.districtNames.map((n) => byName.get(n)).filter(Boolean) as DistrictShape[];
    if (!members.length) {
      return {
        id: m.id,
        name: m.name,
        cx: m.x,
        cy: m.y,
        points: ellipsePoints(m.x, m.y, 220, 160, 16, idx),
        kind: 'municipio' as const,
        fill: m.color,
      };
    }
    const cx = members.reduce((a, d) => a + d.cx, 0) / members.length;
    const cy = members.reduce((a, d) => a + d.cy, 0) / members.length;
    const rx = Math.max(180, ...members.map((d) => Math.abs(d.cx - cx))) + 120;
    const ry = Math.max(140, ...members.map((d) => Math.abs(d.cy - cy))) + 100;
    return {
      id: m.id,
      name: m.name,
      cx,
      cy,
      points: ellipsePoints(cx, cy, rx, ry, 18, idx * 0.3),
      kind: 'municipio' as const,
      fill: m.color,
    };
  });
}

export const DISTRICT_SHAPES = buildDistrictShapes();
export const MUNICIPALITY_SHAPES = buildMunicipalityShapes();

/** Estaciones hub (sin densificados) para LOD rápido */
export const HUB_STATIONS = getUniqueStations().filter((s) => !s.id.includes('_s'));
export const MAJOR_STATIONS = HUB_STATIONS.filter((s) => s.majorHub || s.interchange);
