export type TransportMode =
  | 'metro'
  | 'cercanias'
  | 'tranvia'
  | 'bus'
  | 'hyperloop'
  | 'ferry'
  | 'cable';

export type LineStatus = 'normal' | 'retrasos' | 'obras' | 'suspendida';

export interface Station {
  id: string;
  name: string;
  x: number;
  y: number;
  district: string;
  interchange?: boolean;
}

export interface TransitLine {
  id: string;
  code: string;
  name: string;
  mode: TransportMode;
  color: string;
  stationIds: string[];
  frequencyMin: number;
  firstDeparture: string;
  lastDeparture: string;
  status: LineStatus;
  occupancy: number;
  operatorNote?: string;
}

export interface DistrictLabel {
  id: string;
  name: string;
  x: number;
  y: number;
}

export type UserRole = 'pasajero' | 'operador';

export const MODE_LABELS: Record<TransportMode, string> = {
  metro: 'Metro',
  cercanias: 'Cercanías',
  tranvia: 'Tranvía',
  bus: 'Bus',
  hyperloop: 'Hyperloop',
  ferry: 'Ferry',
  cable: 'Teleférico',
};

export const MODE_ORDER: TransportMode[] = [
  'metro',
  'cercanias',
  'tranvia',
  'bus',
  'hyperloop',
  'ferry',
  'cable',
];

export const STATUS_LABELS: Record<LineStatus, string> = {
  normal: 'Servicio normal',
  retrasos: 'Retrasos',
  obras: 'Obras',
  suspendida: 'Suspendida',
};

/** Estilos de trazo en leyenda */
export const MODE_LEGEND: { mode: TransportMode; style: 'solid' | 'dashed' | 'dotted' | 'glow' }[] = [
  { mode: 'metro', style: 'solid' },
  { mode: 'cercanias', style: 'solid' },
  { mode: 'tranvia', style: 'solid' },
  { mode: 'bus', style: 'dashed' },
  { mode: 'hyperloop', style: 'glow' },
  { mode: 'ferry', style: 'dashed' },
  { mode: 'cable', style: 'dotted' },
];
