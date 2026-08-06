import { getLinePath, lines } from './network';
import { smoothPathD } from './pathSmooth';
import type { TransitLine } from './types';

export interface CachedLinePath {
  line: TransitLine;
  full: string;
  /** Versión simplificada (menos puntos) para zoom bajo */
  simple: string;
  bounds: { minX: number; minY: number; maxX: number; maxY: number };
}

function simplifyPoints<T extends { x: number; y: number }>(pts: T[], step: number): T[] {
  if (pts.length <= 3 || step <= 1) return pts;
  const out: T[] = [pts[0]];
  for (let i = step; i < pts.length - 1; i += step) out.push(pts[i]);
  out.push(pts[pts.length - 1]);
  return out;
}

function tensionFor(mode: string): number {
  if (mode === 'bus') return 0.48;
  if (mode === 'tranvia') return 0.38;
  if (mode === 'metro') return 0.26;
  return 0.32;
}

function computeBounds(pts: { x: number; y: number }[]) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const p of pts) {
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x);
    maxY = Math.max(maxY, p.y);
  }
  return { minX, minY, maxX, maxY };
}

const MODE_ORDER = ['bus', 'tranvia', 'cercanias', 'metro', 'hyperloop'];

export const CACHED_LINE_PATHS: CachedLinePath[] = [...lines]
  .sort((a, b) => MODE_ORDER.indexOf(a.mode) - MODE_ORDER.indexOf(b.mode))
  .map((line) => {
    const pts = getLinePath(line);
    const t = tensionFor(line.mode);
    const simplePts = simplifyPoints(pts, line.mode === 'bus' ? 3 : 2);
    return {
      line,
      full: smoothPathD(pts, t),
      simple: smoothPathD(simplePts, t * 0.8),
      bounds: pts.length ? computeBounds(pts) : { minX: 0, minY: 0, maxX: 0, maxY: 0 },
    };
  });

export function strokeForMode(mode: string, mapScale: number): number {
  const base =
    mode === 'hyperloop' ? 7 :
    mode === 'metro' ? 6 :
    mode === 'cercanias' ? 5.5 :
    mode === 'tranvia' ? 4 : 3;
  // Compensa el scale del transform para tamaño de pantalla más estable
  const inv = 1 / Math.max(0.22, mapScale);
  return base * Math.min(2.4, Math.max(0.55, inv * 0.38));
}

export function labelFontSize(base: number, mapScale: number): number {
  const inv = 1 / Math.max(0.22, mapScale);
  return base * Math.min(2.1, Math.max(0.55, inv * 0.42));
}
