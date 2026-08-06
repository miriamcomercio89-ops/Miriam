export type TransportMode =
  | 'metro'
  | 'cercanias'
  | 'tranvia'
  | 'bus'
  | 'hyperloop';

/** Prefijos de autobús alfanuméricos */
export type BusFamily =
  | 'U' // Universitario
  | 'X' // Express
  | 'A' // Aeropuerto
  | 'N' // Nocturno
  | 'O' // Orbital / Circular
  | 'P' // Playa / Costa
  | 'TU' // Turístico
  | 'H' // Hospitalario
  | 'L' // Litoral
  | 'R' // Residencial
  | 'B' // Barrio
  | 'E'; // Especial / eventos

export type LineStatus = 'normal' | 'retrasos' | 'obras' | 'suspendida';

export interface Station {
  id: string;
  name: string;
  x: number;
  y: number;
  district: string;
  interchange?: boolean;
  /** Hub grande con esquema propio al acercar */
  majorHub?: boolean;
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
  busFamily?: BusFamily;
}

export interface DistrictLabel {
  id: string;
  name: string;
  x: number;
  y: number;
}

export type UserRole = 'pasajero' | 'operador';

export type { DayPeriod } from './time';

export const MODE_LABELS: Record<TransportMode, string> = {
  metro: 'Metro',
  cercanias: 'Cercanías',
  tranvia: 'Tranvía',
  bus: 'Bus',
  hyperloop: 'Hyperloop',
};

export const MODE_ORDER: TransportMode[] = [
  'metro',
  'cercanias',
  'tranvia',
  'bus',
  'hyperloop',
];

export const BUS_FAMILY_LABELS: Record<BusFamily, string> = {
  U: 'Universitario',
  X: 'Express',
  A: 'Aeropuerto',
  N: 'Nocturno',
  O: 'Orbital',
  P: 'Playa',
  TU: 'Turístico',
  H: 'Hospitalario',
  L: 'Litoral',
  R: 'Residencial',
  B: 'Barrio',
  E: 'Especial',
};

export const STATUS_LABELS: Record<LineStatus, string> = {
  normal: 'Servicio normal',
  retrasos: 'Retrasos',
  obras: 'Obras',
  suspendida: 'Suspendida',
};

export const MODE_LEGEND: { mode: TransportMode; style: 'solid' | 'dashed' | 'glow' }[] = [
  { mode: 'metro', style: 'solid' },
  { mode: 'cercanias', style: 'solid' },
  { mode: 'tranvia', style: 'solid' },
  { mode: 'bus', style: 'dashed' },
  { mode: 'hyperloop', style: 'glow' },
];
