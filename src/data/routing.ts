import { getStation, lines, stations } from './network';
import type { TransitLine } from './types';

export interface RouteLeg {
  line: TransitLine;
  fromId: string;
  toId: string;
  stops: string[];
  stopCount: number;
}

export interface RouteStep {
  kind: 'board' | 'ride' | 'transfer' | 'alight';
  text: string;
  line?: TransitLine;
  stationId?: string;
}

export interface RoutePlan {
  legs: RouteLeg[];
  totalStops: number;
  transfers: number;
  estimatedMinutes: number;
  stationIds: string[];
  label: string;
  steps: RouteStep[];
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

function modeWeight(mode: string): number {
  switch (mode) {
    case 'hyperloop':
      return 1.0;
    case 'metro':
      return 2.0;
    case 'tranvia':
      return 2.4;
    case 'cercanias':
      return 3.0;
    default:
      return 3.6;
  }
}

function scorePlan(plan: RoutePlan, prefer: 'fast' | 'transfers'): number {
  if (prefer === 'transfers') {
    return plan.transfers * 1000 + plan.estimatedMinutes;
  }
  return plan.estimatedMinutes * 10 + plan.transfers * 40;
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
      const wait = Math.min(8, leg.line.frequencyMin * 0.4);
      return acc + leg.stopCount * modeWeight(leg.line.mode) + wait;
    }, 0) + transfers * 4,
  );

  const plan: RoutePlan = {
    legs,
    totalStops,
    transfers,
    estimatedMinutes,
    stationIds: stationPath,
    label: '',
    steps: [],
  };
  plan.steps = buildSteps(plan);
  return plan;
}

export function buildSteps(plan: RoutePlan): RouteStep[] {
  const steps: RouteStep[] = [];
  plan.legs.forEach((leg, idx) => {
    const fromName = stationLabel(leg.fromId);
    const toName = stationLabel(leg.toId);
    if (idx === 0) {
      steps.push({
        kind: 'board',
        text: `En ${fromName}, toma la ${leg.line.code} (${leg.line.name}) sentido ${toName}`,
        line: leg.line,
        stationId: leg.fromId,
      });
    } else {
      steps.push({
        kind: 'transfer',
        text: `Baja en ${fromName} y cambia a la ${leg.line.code} (${leg.line.name})`,
        line: leg.line,
        stationId: leg.fromId,
      });
    }
    steps.push({
      kind: 'ride',
      text: `Viaja ${leg.stopCount} parada${leg.stopCount === 1 ? '' : 's'} hasta ${toName}`,
      line: leg.line,
      stationId: leg.toId,
    });
  });
  const last = plan.legs[plan.legs.length - 1];
  steps.push({
    kind: 'alight',
    text: `Llegada a ${stationLabel(last.toId)}`,
    stationId: last.toId,
  });
  return steps;
}

function planSignature(plan: RoutePlan): string {
  return plan.legs.map((l) => `${l.line.id}:${l.fromId}>${l.toId}`).join('|');
}

/** Búsqueda de rutas alternativas explorando distintos sesgos */
export function findRoutes(fromId: string, toId: string, maxRoutes = 3): RoutePlan[] {
  if (!stations[fromId] || !stations[toId] || fromId === toId) return [];

  const candidates: RoutePlan[] = [];
  const seen = new Set<string>();

  const trySearch = (transferPenalty: number, avoidLineId?: string) => {
    const plan = searchOne(fromId, toId, transferPenalty, avoidLineId);
    if (!plan) return;
    const sig = planSignature(plan);
    if (seen.has(sig)) return;
    seen.add(sig);
    candidates.push(plan);
  };

  // Menos trasbordos
  trySearch(8);
  // Más rápida (penaliza menos trasbordo, favorece modos rápidos ya en pesos)
  trySearch(2);
  // Evitar primera línea de la mejor para forzar alternativa
  if (candidates[0]?.legs[0]) {
    trySearch(3, candidates[0].legs[0].line.id);
  }
  // Evitar hyperloop si existe en la primera
  const hyperLeg = candidates[0]?.legs.find((l) => l.line.mode === 'hyperloop');
  if (hyperLeg) trySearch(3, hyperLeg.line.id);

  // Rankear: primera = más rápida, segunda = menos trasbordos si distinta
  const byFast = [...candidates].sort((a, b) => scorePlan(a, 'fast') - scorePlan(b, 'fast'));
  const byTrans = [...candidates].sort((a, b) => scorePlan(a, 'transfers') - scorePlan(b, 'transfers'));

  const result: RoutePlan[] = [];
  const pushLabeled = (plan: RoutePlan, label: string) => {
    if (result.some((r) => planSignature(r) === planSignature(plan))) return;
    result.push({ ...plan, label, steps: buildSteps(plan) });
  };

  if (byFast[0]) pushLabeled(byFast[0], 'Más rápida');
  if (byTrans[0]) pushLabeled(byTrans[0], 'Menos trasbordos');
  for (const p of byFast) {
    if (result.length >= maxRoutes) break;
    pushLabeled(p, 'Alternativa');
  }

  return result.slice(0, maxRoutes);
}

function searchOne(
  fromId: string,
  toId: string,
  transferPenalty: number,
  avoidLineId?: string,
): RoutePlan | null {
  type Node = { stationId: string; lineId: string | null; cost: number };
  const keyOf = (s: string, l: string | null) => `${s}|${l ?? '_'}`;
  const dist = new Map<string, number>();
  const prev = new Map<string, { prevKey: string | null; viaLine: string | null }>();
  const startKey = keyOf(fromId, null);
  dist.set(startKey, 0);
  prev.set(startKey, { prevKey: null, viaLine: null });

  const heap: Node[] = [{ stationId: fromId, lineId: null, cost: 0 }];

  while (heap.length) {
    heap.sort((a, b) => a.cost - b.cost);
    const cur = heap.shift()!;
    const curKey = keyOf(cur.stationId, cur.lineId);
    if (cur.cost > (dist.get(curKey) ?? Infinity)) continue;

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

    for (const e of graph.get(cur.stationId) ?? []) {
      if (avoidLineId && e.lineId === avoidLineId && !cur.lineId) continue;
      const line = lines.find((l) => l.id === e.lineId);
      if (!line) continue;
      const transfer = cur.lineId && cur.lineId !== e.lineId ? transferPenalty : 0;
      const nextCost = cur.cost + modeWeight(line.mode) + transfer + line.frequencyMin * 0.05;
      const nk = keyOf(e.to, e.lineId);
      if (nextCost < (dist.get(nk) ?? Infinity)) {
        dist.set(nk, nextCost);
        prev.set(nk, { prevKey: curKey, viaLine: e.lineId });
        heap.push({ stationId: e.to, lineId: e.lineId, cost: nextCost });
      }
    }
  }
  return null;
}

/** Compat: mejor ruta rápida */
export function findRoute(fromId: string, toId: string): RoutePlan | null {
  return findRoutes(fromId, toId, 1)[0] ?? null;
}

export function stationLabel(id: string): string {
  return getStation(id)?.name ?? id;
}
