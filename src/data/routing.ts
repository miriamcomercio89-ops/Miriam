import { getStation, lines, stations } from './network';
import type { TransitLine } from './types';

export interface RouteLeg {
  line: TransitLine;
  fromId: string;
  toId: string;
  stops: string[];
  stopCount: number;
}

export interface RoutePlan {
  legs: RouteLeg[];
  totalStops: number;
  transfers: number;
  estimatedMinutes: number;
  stationIds: string[];
}

type GraphEdge = { to: string; lineId: string };

function buildGraph(): Map<string, GraphEdge[]> {
  const graph = new Map<string, GraphEdge[]>();
  const add = (from: string, edge: GraphEdge) => {
    const arr = graph.get(from) ?? [];
    arr.push(edge);
    graph.set(from, arr);
  };

  for (const line of lines) {
    if (line.status === 'suspendida') continue;
    const ids = line.stationIds;
    for (let i = 0; i < ids.length - 1; i++) {
      const a = ids[i];
      const b = ids[i + 1];
      if (!stations[a] || !stations[b]) continue;
      add(a, { to: b, lineId: line.id });
      add(b, { to: a, lineId: line.id });
    }
  }
  return graph;
}

const graph = buildGraph();

/**
 * BFS con preferencia a permanecer en la misma línea (menos trasbordos).
 */
export function findRoute(fromId: string, toId: string): RoutePlan | null {
  if (!stations[fromId] || !stations[toId] || fromId === toId) return null;

  type State = { stationId: string; lineId: string | null };
  const q: State[] = [{ stationId: fromId, lineId: null }];
  const prev = new Map<string, { prevKey: string | null; viaLine: string | null }>();
  const startKey = `${fromId}|_`;
  prev.set(startKey, { prevKey: null, viaLine: null });

  while (q.length) {
    const cur = q.shift()!;
    const curKey = `${cur.stationId}|${cur.lineId ?? '_'}`;

    if (cur.stationId === toId) {
      const stationPath: string[] = [];
      const arrivalLines: (string | null)[] = [];
      let k: string | null = curKey;
      while (k) {
        const st = k.split('|')[0];
        const meta = prev.get(k) as { prevKey: string | null; viaLine: string | null };
        stationPath.push(st);
        arrivalLines.push(meta.viaLine);
        k = meta.prevKey;
      }
      stationPath.reverse();
      arrivalLines.reverse();
      return legsFromPath(stationPath, arrivalLines);
    }

    const edges = graph.get(cur.stationId) ?? [];
    // Prefer same line first
    const ordered = [...edges].sort((a, b) => {
      const aSame = cur.lineId && a.lineId === cur.lineId ? 0 : 1;
      const bSame = cur.lineId && b.lineId === cur.lineId ? 0 : 1;
      return aSame - bSame;
    });

    for (const e of ordered) {
      const nk = `${e.to}|${e.lineId}`;
      if (prev.has(nk)) continue;
      prev.set(nk, { prevKey: curKey, viaLine: e.lineId });
      q.push({ stationId: e.to, lineId: e.lineId });
    }
  }
  return null;
}

function legsFromPath(stationPath: string[], arrivalLines: (string | null)[]): RoutePlan | null {
  if (stationPath.length < 2) return null;

  const legs: RouteLeg[] = [];
  let i = 1;
  while (i < stationPath.length) {
    const lineId = arrivalLines[i];
    if (!lineId) {
      i++;
      continue;
    }
    const line = lines.find((l) => l.id === lineId);
    if (!line) {
      i++;
      continue;
    }
    const stops = [stationPath[i - 1]];
    while (i < stationPath.length && arrivalLines[i] === lineId) {
      stops.push(stationPath[i]);
      i++;
    }
    legs.push({
      line,
      fromId: stops[0],
      toId: stops[stops.length - 1],
      stops,
      stopCount: stops.length - 1,
    });
  }

  if (!legs.length) return null;

  const totalStops = legs.reduce((a, l) => a + l.stopCount, 0);
  const transfers = Math.max(0, legs.length - 1);
  const estimatedMinutes = Math.round(
    legs.reduce((acc, leg) => {
      const perStop =
        leg.line.mode === 'hyperloop' ? 1.2 :
        leg.line.mode === 'metro' ? 2.0 :
        leg.line.mode === 'cercanias' ? 3.0 :
        leg.line.mode === 'tranvia' ? 2.4 : 3.5;
      return acc + leg.stopCount * perStop + leg.line.frequencyMin * 0.35;
    }, 0) + transfers * 4,
  );

  return {
    legs,
    totalStops,
    transfers,
    estimatedMinutes,
    stationIds: stationPath,
  };
}

export function stationLabel(id: string): string {
  return getStation(id)?.name ?? id;
}
