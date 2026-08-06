import { getStation, getUniqueStations, stations } from './network';

export interface WalkEdge {
  from: string;
  to: string;
  minutes: number;
  meters: number;
}

const WALK_SPEED_M_PER_MIN = 80; // ~4.8 km/h
/** Unidades mapa → metros (aproximado) */
const MAP_UNITS_TO_M = 4.5;

function dist(a: { x: number; y: number }, b: { x: number; y: number }) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/**
 * Conecta estaciones cercanas a pie (especialmente densas en casco / hubs).
 */
export function buildWalkGraph(maxMapUnits = 95): WalkEdge[] {
  const hubs = getUniqueStations().filter((s) => !s.id.includes('_s') || s.interchange);
  const edges: WalkEdge[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < hubs.length; i++) {
    for (let j = i + 1; j < hubs.length; j++) {
      const a = hubs[i];
      const b = hubs[j];
      const d = dist(a, b);
      // En casco permitir enlaces un poco más largos entre plazas
      const cascoBonus =
        (a.district.includes('Casco') || a.district.includes('Juder') || a.district.includes('Soho') ||
          b.district.includes('Casco') || b.district.includes('Juder') || b.district.includes('Soho'))
          ? 1.35
          : 1;
      if (d > maxMapUnits * cascoBonus) continue;
      const key = a.id < b.id ? `${a.id}|${b.id}` : `${b.id}|${a.id}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const meters = d * MAP_UNITS_TO_M;
      const minutes = Math.max(1, Math.round(meters / WALK_SPEED_M_PER_MIN));
      edges.push({ from: a.id, to: b.id, minutes, meters: Math.round(meters) });
    }
  }
  return edges;
}

export const WALK_EDGES = buildWalkGraph();

const walkAdj = new Map<string, { to: string; minutes: number }[]>();
for (const e of WALK_EDGES) {
  const a = walkAdj.get(e.from) ?? [];
  a.push({ to: e.to, minutes: e.minutes });
  walkAdj.set(e.from, a);
  const b = walkAdj.get(e.to) ?? [];
  b.push({ to: e.from, minutes: e.minutes });
  walkAdj.set(e.to, b);
}

export function walkNeighbors(stationId: string) {
  return walkAdj.get(stationId) ?? [];
}

export function walkMinutesBetween(aId: string, bId: string): number | null {
  if (aId === bId) return 0;
  const a = getStation(aId);
  const b = getStation(bId);
  if (!a || !b) return null;
  // Misma coordenada
  if (a.x === b.x && a.y === b.y) return a.majorHub ? 5 : 2;
  const direct = (walkAdj.get(aId) ?? []).find((x) => x.to === bId);
  if (direct) return direct.minutes;
  return null;
}

export function isCascoDistrict(name: string): boolean {
  return /casco|judería|juderia|alcazaba|soho|perchel|merced|ensanche|centro histórico/i.test(name);
}

export { stations };
