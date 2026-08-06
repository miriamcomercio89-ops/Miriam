import type { Station, TransitLine } from './types';

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

const STREET_PREFIX = ['Av.', 'C/', 'Paseo', 'Camino', 'Ronda', 'Callejón', 'Travesía'];
const STREET_NAME = [
  'del Mar', 'de la Caleta', 'de los Naranjos', 'del Olivar', 'de la Sierra',
  'de San Juan', 'de la Paz', 'del Sol', 'de la Luna', 'de las Flores',
  'Alameda', 'Victoria', 'Comercio', 'Puerta Nueva', 'Miramar',
  'Los Álamos', 'El Carmen', 'La Esperanza', 'San Miguel', 'Las Palmeras',
  'Doctor Galvez', 'Héroes de Sostoa', 'Jacinto Benavente', 'Salvador Allende',
  'Pacífico', 'Mediterráneo', 'Andalucía', 'Málaga', 'Cádiz',
];

function intermediateName(lineCode: string, seg: number, k: number): string {
  const h = hashStr(`${lineCode}-${seg}-${k}`);
  const prefix = STREET_PREFIX[h % STREET_PREFIX.length];
  const name = STREET_NAME[(h >> 3) % STREET_NAME.length];
  return `${prefix} ${name}`;
}

function spacingForMode(mode: string): number {
  // Un poco más espaciado = menos nodos SVG y mejor rendimiento
  switch (mode) {
    case 'bus':
      return 88;
    case 'tranvia':
      return 95;
    case 'metro':
      return 110;
    case 'cercanias':
      return 170;
    case 'hyperloop':
      return 420;
    default:
      return 100;
  }
}

function amplitudeForMode(mode: string): number {
  switch (mode) {
    case 'bus':
      return 36;
    case 'tranvia':
      return 22;
    case 'metro':
      return 14;
    case 'cercanias':
      return 18;
    default:
      return 10;
  }
}

/**
 * Inserta apeaderos intermedios con desplazamiento lateral (trazado orgánico).
 * Las estaciones hub originales se conservan.
 */
export function densifyNetwork(
  baseStations: Record<string, Station>,
  baseLines: TransitLine[],
): { stations: Record<string, Station>; lines: TransitLine[] } {
  const stations: Record<string, Station> = { ...baseStations };

  const lines = baseLines.map((line) => {
    const ids = line.stationIds;
    if (ids.length < 2) return line;

    const densified: string[] = [];
    const spacing = spacingForMode(line.mode);
    const ampBase = amplitudeForMode(line.mode);
    const lineHash = hashStr(line.id);

    for (let i = 0; i < ids.length; i++) {
      densified.push(ids[i]);
      if (i >= ids.length - 1) break;

      const a = baseStations[ids[i]] ?? stations[ids[i]];
      const b = baseStations[ids[i + 1]] ?? stations[ids[i + 1]];
      if (!a || !b) continue;

      // Evitar densificar bucles al mismo punto
      if (a.id === b.id || (a.x === b.x && a.y === b.y)) continue;

      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.hypot(dx, dy);
      if (dist < spacing * 1.2) continue;

      const n = Math.min(3, Math.max(1, Math.floor(dist / spacing) - 1));
      const len = dist || 1;
      const px = -dy / len;
      const py = dx / len;

      for (let k = 1; k <= n; k++) {
        const t = k / (n + 1);
        // Curva suave tipo seno + componente por línea
        const wave = Math.sin(t * Math.PI) * (1 + ((lineHash + i) % 5) * 0.08);
        const side = (lineHash + i) % 2 === 0 ? 1 : -1;
        const amp = ampBase * wave * side;
        // Segunda ondulación más suave para buses
        const amp2 = line.mode === 'bus' ? Math.sin(t * Math.PI * 2) * ampBase * 0.25 : 0;

        const id = `${line.id}_s${i}_${k}`;
        if (!stations[id]) {
          stations[id] = {
            id,
            name: intermediateName(line.code, i, k),
            x: a.x + dx * t + px * (amp + amp2),
            y: a.y + dy * t + py * (amp + amp2),
            district: t < 0.5 ? a.district : b.district,
            interchange: false,
          };
        }
        densified.push(id);
      }
    }

    return { ...line, stationIds: densified };
  });

  return { stations, lines };
}
