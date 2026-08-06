import type { DistrictLabel, LineStatus, Station, TransitLine, TransportMode } from './types';

export const CITY = {
  name: 'Heliora',
  tagline: 'La red de transporte público más grande del mundo',
  population: '52,8 millones',
  dailyTrips: '28,1 millones',
  mapWidth: 2400,
  mapHeight: 1800,
};

type DistrictSeed = {
  id: string;
  name: string;
  x: number;
  y: number;
  stations: { key: string; name: string; dx?: number; dy?: number; interchange?: boolean }[];
};

/** Distritos de todo tipo repartidos por la mega-metrópolis */
const DISTRICT_SEEDS: DistrictSeed[] = [
  {
    id: 'centro',
    name: 'Centro Histórico',
    x: 1200,
    y: 900,
    stations: [
      { key: 'plaza_orbe', name: 'Plaza del Orbe', interchange: true },
      { key: 'catedral', name: 'Catedral Nova', dx: -70, dy: -50, interchange: true },
      { key: 'agora', name: 'Ágora Central', dx: 70, dy: -50, interchange: true },
      { key: 'museo', name: 'Museo Mundial', dx: 0, dy: -100 },
      { key: 'senado', name: 'Senado', dx: -50, dy: 60 },
      { key: 'bolsa', name: 'Bolsa de Heliora', dx: 50, dy: 60, interchange: true },
      { key: 'mercado_central', name: 'Mercado Central', dx: 0, dy: -30, interchange: true },
      { key: 'biblioteca', name: 'Biblioteca Mundial', dx: -110, dy: -20 },
      { key: 'tribunales', name: 'Tribunales', dx: 110, dy: -20 },
    ],
  },
  {
    id: 'financiero',
    name: 'Distrito Financiero',
    x: 1380,
    y: 820,
    stations: [
      { key: 'torre_helix', name: 'Torre Hélix', interchange: true },
      { key: 'torres_gemelas', name: 'Torres Gemelas', dx: 80, dy: -40 },
      { key: 'banco_central', name: 'Banco Central', dx: 40, dy: 50 },
      { key: 'plaza_trading', name: 'Plaza Trading', dx: -40, dy: 40 },
    ],
  },
  {
    id: 'gubernamental',
    name: 'Distrito Gubernamental',
    x: 1020,
    y: 820,
    stations: [
      { key: 'palacio', name: 'Palacio Federal', interchange: true },
      { key: 'ministerios', name: 'Ministerios', dx: -60, dy: 40 },
      { key: 'embajadas', name: 'Barrio Embajadas', dx: 50, dy: -30 },
    ],
  },
  {
    id: 'artes',
    name: 'Distrito de las Artes',
    x: 1080,
    y: 1040,
    stations: [
      { key: 'plaza_artes', name: 'Plaza de las Artes', interchange: true },
      { key: 'opera', name: 'Ópera Heliora', dx: -50, dy: 50 },
      { key: 'cineteatro', name: 'Cineteatro Imperial', dx: 60, dy: 30 },
      { key: 'galeria', name: 'Galería Contemporánea', dx: 20, dy: -40 },
    ],
  },
  {
    id: 'internacional',
    name: 'Barrio Internacional',
    x: 1320,
    y: 1020,
    stations: [
      { key: 'barrio_oriental', name: 'Barrio Oriental', interchange: true },
      { key: 'little_atlantic', name: 'Little Atlantic', dx: -70, dy: 20 },
      { key: 'plaza_mundos', name: 'Plaza de los Mundos', dx: 50, dy: 40 },
    ],
  },
  {
    id: 'medico',
    name: 'Distrito Médico',
    x: 1500,
    y: 700,
    stations: [
      { key: 'hospital', name: 'Hospital Central', interchange: true },
      { key: 'biomed', name: 'Campus Biomédico', dx: 70, dy: -40 },
      { key: 'farmacia_hub', name: 'Hub Farmacéutico', dx: 40, dy: 50 },
    ],
  },
  {
    id: 'universidad',
    name: 'Campus Universitario',
    x: 1500,
    y: 420,
    stations: [
      { key: 'universidad', name: 'Universidad Heliora', interchange: true },
      { key: 'residencia', name: 'Residencia Estudiantil', dx: 80, dy: -50 },
      { key: 'politecnica', name: 'Politécnica', dx: -40, dy: 60 },
      { key: 'biblioteca_campus', name: 'Biblioteca Campus', dx: 50, dy: 40 },
    ],
  },
  {
    id: 'deportivo',
    name: 'Ciudad Deportiva',
    x: 1680,
    y: 380,
    stations: [
      { key: 'estadio', name: 'Estadio Mundialis', interchange: true },
      { key: 'ciudad_deportiva', name: 'Ciudad Deportiva', dx: 70, dy: -40, interchange: true },
      { key: 'hipodromo', name: 'Hipódromo', dx: 40, dy: 60 },
      { key: 'arena_norte', name: 'Arena Norte', dx: -50, dy: 40 },
    ],
  },
  {
    id: 'puerto_norte',
    name: 'Puerto Norte',
    x: 1200,
    y: 220,
    stations: [
      { key: 'puerto_norte', name: 'Puerto Norte', interchange: true },
      { key: 'astilleros', name: 'Astilleros', dx: -90, dy: 40 },
      { key: 'faro', name: 'El Faro', dx: 90, dy: 40 },
      { key: 'dunas', name: 'Las Dunas', dx: -140, dy: -20 },
      { key: 'mirador', name: 'Mirador del Mar', dx: 140, dy: -20 },
    ],
  },
  {
    id: 'colinas',
    name: 'Colinas Altas',
    x: 820,
    y: 280,
    stations: [
      { key: 'colinas', name: 'Colinas Altas', interchange: true },
      { key: 'observatorio', name: 'Observatorio', dx: -60, dy: -50, interchange: true },
      { key: 'cascada', name: 'Cascada Norte', dx: -100, dy: 20 },
      { key: 'bosque', name: 'Bosque Urbano', dx: 40, dy: 50 },
      { key: 'mirador_colina', name: 'Mirador Colina', dx: 80, dy: -30 },
    ],
  },
  {
    id: 'residencial_norte',
    name: 'Residencial Norte',
    x: 1200,
    y: 480,
    stations: [
      { key: 'norte_viejo', name: 'Barrio Norte', interchange: true },
      { key: 'arco_norte', name: 'Arco Norte', dx: 0, dy: 70, interchange: true },
      { key: 'mercado_norte', name: 'Mercado Norte', dx: -80, dy: 20 },
      { key: 'jardin_botanico', name: 'Jardín Botánico', dx: 80, dy: 20 },
      { key: 'puente_rojo', name: 'Puente Rojo', dx: 60, dy: 90, interchange: true },
    ],
  },
  {
    id: 'lujo',
    name: 'Altos del Lujo',
    x: 900,
    y: 520,
    stations: [
      { key: 'luxury_heights', name: 'Luxury Heights', interchange: true },
      { key: 'club_privado', name: 'Club Privado', dx: -50, dy: -40 },
      { key: 'avenida_palmeras', name: 'Av. Palmeras', dx: 50, dy: 30 },
    ],
  },
  {
    id: 'oeste',
    name: 'Barrio Oeste',
    x: 720,
    y: 900,
    stations: [
      { key: 'barrio_oeste', name: 'Barrio Oeste', interchange: true },
      { key: 'ribera_oeste', name: 'Ribera Oeste', dx: -80, dy: 0, interchange: true },
      { key: 'mercado_oeste', name: 'Mercado Oeste', dx: -40, dy: 80 },
      { key: 'zoologico', name: 'Zoológico', dx: -60, dy: -90 },
    ],
  },
  {
    id: 'satelite_oeste',
    name: 'Satélite Oeste',
    x: 360,
    y: 900,
    stations: [
      { key: 'satelite_oeste', name: 'Satélite Oeste', interchange: true },
      { key: 'canteras', name: 'Las Canteras', dx: 60, dy: -70 },
      { key: 'playa_oeste', name: 'Playa Oeste', dx: -80, dy: -60 },
      { key: 'silos', name: 'Los Silos', dx: -40, dy: 80 },
      { key: 'planta', name: 'Planta Energética', dx: 40, dy: 100 },
      { key: 'valle', name: 'Valle Verde', dx: 90, dy: 40 },
    ],
  },
  {
    id: 'obrero',
    name: 'Barrio Obrero',
    x: 600,
    y: 1100,
    stations: [
      { key: 'barrio_obrero', name: 'Barrio Obrero', interchange: true },
      { key: 'cooperativa', name: 'Cooperativa', dx: -50, dy: 40 },
      { key: 'talleres', name: 'Los Talleres', dx: 50, dy: 30 },
    ],
  },
  {
    id: 'industrial',
    name: 'Zona Industrial',
    x: 780,
    y: 1400,
    stations: [
      { key: 'industrial', name: 'Zona Industrial', interchange: true },
      { key: 'cement_plant', name: 'Fábrica Cemento', dx: -70, dy: 50 },
      { key: 'fundicion', name: 'Fundición', dx: 60, dy: 40 },
      { key: 'logistica_oeste', name: 'Logística Oeste', dx: 20, dy: -50 },
    ],
  },
  {
    id: 'puerto_sur',
    name: 'Puerto Sur',
    x: 1200,
    y: 1580,
    stations: [
      { key: 'puerto_sur', name: 'Puerto Sur', interchange: true },
      { key: 'muelles', name: 'Los Muelles', dx: -100, dy: 0 },
      { key: 'isla_verde', name: 'Isla Verde', dx: 0, dy: 70, interchange: true },
      { key: 'faro_sur', name: 'Faro Sur', dx: 110, dy: 40 },
      { key: 'terminal_sur', name: 'Terminal Sur', dx: 0, dy: -70, interchange: true },
    ],
  },
  {
    id: 'sur',
    name: 'Residencial Sur',
    x: 1200,
    y: 1280,
    stations: [
      { key: 'barrio_sur', name: 'Barrio Sur', interchange: true },
      { key: 'arco_sur', name: 'Arco Sur', dx: 0, dy: -70, interchange: true },
      { key: 'plaza_sol', name: 'Plaza del Sol', dx: -80, dy: -20 },
      { key: 'arena', name: 'Arena Heliora', dx: 80, dy: -20, interchange: true },
      { key: 'vivero', name: 'Vivero Municipal', dx: -100, dy: 40 },
      { key: 'puente_azul', name: 'Puente Azul', dx: -50, dy: -100, interchange: true },
    ],
  },
  {
    id: 'tech',
    name: 'Parque Tecnológico',
    x: 1560,
    y: 1400,
    stations: [
      { key: 'tech_park', name: 'Parque Tecnológico', interchange: true },
      { key: 'data_center', name: 'Centro de Datos', dx: 80, dy: 50 },
      { key: 'logistica', name: 'Hub Logístico', dx: -60, dy: -40 },
      { key: 'startup_valley', name: 'Startup Valley', dx: 40, dy: -60 },
    ],
  },
  {
    id: 'este',
    name: 'Barrio Este',
    x: 1560,
    y: 900,
    stations: [
      { key: 'barrio_este', name: 'Barrio Este', interchange: true },
      { key: 'ribera_este', name: 'Ribera Este', dx: 80, dy: 0, interchange: true },
      { key: 'lago', name: 'Lago Serena', dx: 160, dy: -20, interchange: true },
      { key: 'expo', name: 'Recinto Expo', dx: 100, dy: 90, interchange: true },
    ],
  },
  {
    id: 'satelite_este',
    name: 'Satélite Este',
    x: 1900,
    y: 700,
    stations: [
      { key: 'satelite_este', name: 'Satélite Este', interchange: true },
      { key: 'oriente_nuevo', name: 'Oriente Nuevo', dx: 40, dy: 90 },
      { key: 'marina', name: 'Marina Este', dx: 20, dy: 140 },
      { key: 'playa_este', name: 'Playa Este', dx: 100, dy: 160 },
    ],
  },
  {
    id: 'aeropuerto',
    name: 'Aeropuerto Mundial',
    x: 2140,
    y: 900,
    stations: [
      { key: 'aeropuerto', name: 'Aeropuerto Mundial', interchange: true },
      { key: 'terminal_aerea', name: 'Terminal Aérea T2', dx: -50, dy: -60 },
      { key: 'freetrade', name: 'Zona Franca', dx: -70, dy: 50 },
      { key: 'cargo_air', name: 'Carga Aérea', dx: 40, dy: 70 },
    ],
  },
  {
    id: 'comercial',
    name: 'Distrito Comercial',
    x: 1400,
    y: 1180,
    stations: [
      { key: 'gran_centro', name: 'Gran Centro Comercial', interchange: true },
      { key: 'outlet', name: 'Outlet Mundial', dx: 70, dy: 40 },
      { key: 'feria', name: 'Feria de Muestras', dx: -50, dy: 50 },
    ],
  },
  {
    id: 'memorial',
    name: 'Parque Memorial',
    x: 560,
    y: 640,
    stations: [
      { key: 'cementerio', name: 'Cementerio Histórico', interchange: true },
      { key: 'parque_memorial', name: 'Parque Memorial', dx: 50, dy: -40 },
      { key: 'panteon', name: 'Panteón Cívico', dx: -40, dy: 40 },
    ],
  },
  {
    id: 'anillo_ne',
    name: 'Anillo NE',
    x: 1500,
    y: 560,
    stations: [{ key: 'anillo_ne', name: 'Anillo NE', interchange: true }],
  },
  {
    id: 'anillo_se',
    name: 'Anillo SE',
    x: 1500,
    y: 1200,
    stations: [{ key: 'anillo_se', name: 'Anillo SE', interchange: true }],
  },
  {
    id: 'anillo_so',
    name: 'Anillo SO',
    x: 900,
    y: 1200,
    stations: [{ key: 'anillo_so', name: 'Anillo SO', interchange: true }],
  },
  {
    id: 'anillo_no',
    name: 'Anillo NO',
    x: 900,
    y: 560,
    stations: [{ key: 'anillo_no', name: 'Anillo NO', interchange: true }],
  },
  {
    id: 'nueva_heliora',
    name: 'Nueva Heliora',
    x: 480,
    y: 1400,
    stations: [
      { key: 'nueva_heliora', name: 'Nueva Heliora', interchange: true },
      { key: 'eco_barrio', name: 'Eco-Barrio', dx: -60, dy: 50 },
      { key: 'plaza_nueva', name: 'Plaza Nueva', dx: 50, dy: 30 },
    ],
  },
  {
    id: 'bahia_este',
    name: 'Bahía Este',
    x: 1860,
    y: 1180,
    stations: [
      { key: 'bahia_este', name: 'Bahía Este', interchange: true },
      { key: 'muelle_yates', name: 'Muelle de Yates', dx: 60, dy: 40 },
    ],
  },
  {
    id: 'suburbio_sur',
    name: 'Suburbio Sur',
    x: 1680,
    y: 1580,
    stations: [
      { key: 'suburbio_sur', name: 'Suburbio Sur', interchange: true },
      { key: 'urbanizacion', name: 'Urbanización Sol', dx: -50, dy: -40 },
      { key: 'colegios', name: 'Ciudad Educativa', dx: 50, dy: -30 },
    ],
  },
];

function buildStations(): Record<string, Station> {
  const map: Record<string, Station> = {};
  for (const d of DISTRICT_SEEDS) {
    for (const s of d.stations) {
      map[s.key] = {
        id: s.key,
        name: s.name,
        x: d.x + (s.dx ?? 0),
        y: d.y + (s.dy ?? 0),
        district: d.name,
        interchange: s.interchange,
      };
    }
  }
  return map;
}

export const stations = buildStations();

export const districtLabels: DistrictLabel[] = DISTRICT_SEEDS.map((d) => ({
  id: d.id,
  name: d.name,
  x: d.x,
  y: d.y - 95,
}));

const METRO_COLORS = [
  '#E53935', '#1E88E5', '#43A047', '#FB8C00', '#8E24AA', '#00897B',
  '#3949AB', '#C0CA33', '#00ACC1', '#6D4C41', '#D81B60', '#5E35B1',
  '#039BE5', '#7CB342', '#F4511E', '#00838F',
];
const CERC_COLORS = ['#B71C1C', '#0D47A1', '#1B5E20', '#E65100', '#4A148C', '#00695C', '#4527A0', '#827717'];
const TRAM_COLORS = ['#E65100', '#2E7D32', '#F9A825', '#0277BD', '#AD1457', '#558B2F', '#00695C', '#6A1B9A', '#EF6C00', '#1565C0'];

function line(
  code: string,
  name: string,
  mode: TransportMode,
  color: string,
  stationIds: string[],
  opts: Partial<Pick<TransitLine, 'frequencyMin' | 'firstDeparture' | 'lastDeparture' | 'status' | 'occupancy' | 'operatorNote'>> = {},
): TransitLine {
  const valid = stationIds.filter((id) => stations[id]);
  return {
    id: code.toLowerCase(),
    code,
    name,
    mode,
    color,
    stationIds: valid,
    frequencyMin: opts.frequencyMin ?? (mode === 'metro' ? 3 : mode === 'tranvia' ? 7 : mode === 'cercanias' ? 12 : 10),
    firstDeparture: opts.firstDeparture ?? '05:00',
    lastDeparture: opts.lastDeparture ?? '01:00',
    status: opts.status ?? 'normal',
    occupancy: opts.occupancy ?? 50 + Math.floor(Math.random() * 40),
    operatorNote: opts.operatorNote,
  };
}

function ensureStatuses(list: TransitLine[]): TransitLine[] {
  // Deterministic statuses for a few lines (avoid Math.random drift)
  const map: Record<string, { status: LineStatus; occupancy: number; note?: string }> = {
    l3: { status: 'retrasos', occupancy: 72, note: 'Retrasos de 4–7 min por saturación en Torre Hélix.' },
    l6: { status: 'obras', occupancy: 48, note: 'Tramo Canteras–Cementerio con velocidad reducida.' },
    l12: { status: 'retrasos', occupancy: 81 },
    t3: { status: 'obras', occupancy: 33, note: 'Desvío temporal en Vivero Municipal.' },
    c3: { status: 'retrasos', occupancy: 55, note: 'Incidencia de señalización cerca de Anillo SE.' },
    h3: { status: 'suspendida', occupancy: 0, note: 'Mantenimiento del tubo de vacío hasta las 14:00.' },
    b48: { status: 'retrasos', occupancy: 51, note: 'Tráfico denso en Anillo SE–SO.' },
    f3: { status: 'retrasos', occupancy: 28, note: 'Oleaje moderado; demoras de 10–15 min.' },
  };
  return list.map((l, i) => {
    const override = map[l.id];
    if (override) return { ...l, ...override, operatorNote: override.note ?? l.operatorNote };
    // stable occupancy from index
    const occ = 35 + ((i * 17) % 55);
    return { ...l, occupancy: occ };
  });
}

const metroLines: TransitLine[] = [
  line('L1', 'Norte–Sur', 'metro', METRO_COLORS[0], [
    'puerto_norte', 'astilleros', 'norte_viejo', 'arco_norte', 'catedral', 'plaza_orbe',
    'bolsa', 'arco_sur', 'barrio_sur', 'terminal_sur', 'isla_verde',
  ], { frequencyMin: 2 }),
  line('L2', 'Este–Oeste', 'metro', METRO_COLORS[1], [
    'satelite_oeste', 'ribera_oeste', 'barrio_oeste', 'palacio', 'catedral', 'plaza_orbe',
    'agora', 'torre_helix', 'barrio_este', 'ribera_este', 'lago', 'satelite_este', 'aeropuerto',
  ], { frequencyMin: 2 }),
  line('L3', 'Diagonal Universitaria', 'metro', METRO_COLORS[2], [
    'observatorio', 'colinas', 'anillo_no', 'biblioteca', 'plaza_orbe', 'torre_helix',
    'gran_centro', 'anillo_se', 'tech_park', 'data_center',
  ]),
  line('L4', 'Anillo Interior', 'metro', METRO_COLORS[3], [
    'arco_norte', 'puente_rojo', 'anillo_ne', 'hospital', 'barrio_este', 'torre_helix',
    'arco_sur', 'puente_azul', 'anillo_so', 'plaza_artes', 'barrio_oeste', 'anillo_no', 'arco_norte',
  ]),
  line('L5', 'Costa Atlántica', 'metro', METRO_COLORS[4], [
    'dunas', 'puerto_norte', 'faro', 'mirador', 'universidad', 'estadio', 'anillo_ne',
    'ribera_este', 'expo', 'marina', 'playa_este',
  ]),
  line('L6', 'Corredor Oeste', 'metro', METRO_COLORS[5], [
    'playa_oeste', 'satelite_oeste', 'canteras', 'cementerio', 'zoologico', 'anillo_no',
    'luxury_heights', 'barrio_oeste', 'little_atlantic', 'senado', 'plaza_orbe',
  ]),
  line('L7', 'Sur Industrial', 'metro', METRO_COLORS[6], [
    'plaza_orbe', 'plaza_artes', 'anillo_so', 'barrio_obrero', 'industrial',
    'cement_plant', 'muelles', 'puerto_sur', 'isla_verde',
  ]),
  line('L8', 'Tech Express', 'metro', METRO_COLORS[7], [
    'plaza_orbe', 'agora', 'barrio_oriental', 'tribunales', 'anillo_ne', 'hipodromo',
    'satelite_este', 'freetrade', 'aeropuerto',
  ]),
  line('L9', 'Ribera Completa', 'metro', METRO_COLORS[8], [
    'cascada', 'bosque', 'zoologico', 'anillo_no', 'mercado_norte', 'arco_norte',
    'museo', 'plaza_orbe', 'arco_sur', 'plaza_sol', 'barrio_sur', 'logistica', 'tech_park',
  ]),
  line('L10', 'Perimetral Sur', 'metro', METRO_COLORS[9], [
    'planta', 'valle', 'mercado_oeste', 'anillo_so', 'plaza_sol', 'arena', 'anillo_se',
    'expo', 'bahia_este', 'playa_este',
  ]),
  line('L11', 'Campus–Deportes', 'metro', METRO_COLORS[10], [
    'residencia', 'universidad', 'politecnica', 'estadio', 'ciudad_deportiva', 'anillo_ne',
    'hospital', 'torre_helix', 'plaza_orbe',
  ]),
  line('L12', 'Aeropuerto Directo', 'metro', METRO_COLORS[11], [
    'plaza_orbe', 'torre_helix', 'barrio_este', 'lago', 'terminal_aerea', 'aeropuerto',
  ], { frequencyMin: 3, lastDeparture: '02:30' }),
  line('L13', 'Nueva Heliora', 'metro', METRO_COLORS[12], [
    'nueva_heliora', 'eco_barrio', 'industrial', 'anillo_so', 'plaza_artes', 'plaza_orbe',
    'torre_helix', 'gran_centro', 'suburbio_sur',
  ]),
  line('L14', 'Lujo–Finanzas', 'metro', METRO_COLORS[13], [
    'club_privado', 'luxury_heights', 'avenida_palmeras', 'palacio', 'plaza_orbe',
    'torre_helix', 'torres_gemelas', 'banco_central', 'plaza_trading',
  ]),
  line('L15', 'Médico–Expo', 'metro', METRO_COLORS[14], [
    'biomed', 'hospital', 'farmacia_hub', 'anillo_ne', 'barrio_este', 'expo',
    'bahia_este', 'marina',
  ]),
  line('L16', 'Anillo Exterior Norte', 'metro', METRO_COLORS[15], [
    'observatorio', 'cascada', 'dunas', 'puerto_norte', 'mirador', 'residencia',
    'ciudad_deportiva', 'satelite_este',
  ]),
];

const cercaniasLines: TransitLine[] = [
  line('C1', 'Regional Costa Norte', 'cercanias', CERC_COLORS[0], [
    'observatorio', 'cascada', 'puerto_norte', 'norte_viejo', 'plaza_orbe', 'barrio_sur',
    'terminal_sur', 'puerto_sur',
  ], { frequencyMin: 12, firstDeparture: '04:30' }),
  line('C2', 'Regional Aeropuerto', 'cercanias', CERC_COLORS[1], [
    'satelite_oeste', 'ribera_oeste', 'plaza_orbe', 'ribera_este', 'lago', 'aeropuerto',
  ], { frequencyMin: 10, firstDeparture: '04:00', lastDeparture: '02:30' }),
  line('C3', 'Tech Corridor', 'cercanias', CERC_COLORS[2], [
    'universidad', 'estadio', 'anillo_ne', 'plaza_orbe', 'anillo_se', 'tech_park', 'data_center',
  ], { frequencyMin: 15 }),
  line('C4', 'Anillo Exterior', 'cercanias', CERC_COLORS[3], [
    'puerto_norte', 'universidad', 'satelite_este', 'aeropuerto', 'marina', 'puerto_sur',
    'industrial', 'nueva_heliora', 'satelite_oeste', 'bosque', 'puerto_norte',
  ], { frequencyMin: 20, lastDeparture: '22:30' }),
  line('C5', 'Expreso Deportivo', 'cercanias', CERC_COLORS[4], [
    'ciudad_deportiva', 'residencia', 'universidad', 'arco_norte', 'plaza_orbe', 'arco_sur', 'arena',
  ], { frequencyMin: 15 }),
  line('C6', 'Valle–Sur', 'cercanias', CERC_COLORS[5], [
    'playa_oeste', 'satelite_oeste', 'valle', 'barrio_obrero', 'industrial', 'terminal_sur', 'suburbio_sur',
  ], { frequencyMin: 18 }),
  line('C7', 'Costera Este', 'cercanias', CERC_COLORS[6], [
    'estadio', 'satelite_este', 'bahia_este', 'expo', 'suburbio_sur', 'faro_sur',
  ], { frequencyMin: 16 }),
  line('C8', 'Gubernamental–Nueva', 'cercanias', CERC_COLORS[7], [
    'embajadas', 'palacio', 'plaza_orbe', 'anillo_so', 'nueva_heliora', 'eco_barrio',
  ], { frequencyMin: 15 }),
];

const tramLines: TransitLine[] = [
  line('T1', 'Centro Histórico', 'tranvia', TRAM_COLORS[0], [
    'biblioteca', 'catedral', 'museo', 'agora', 'tribunales', 'bolsa', 'plaza_artes', 'senado', 'biblioteca',
  ], { frequencyMin: 6, firstDeparture: '06:00', lastDeparture: '23:00' }),
  line('T2', 'Norte Verde', 'tranvia', TRAM_COLORS[1], [
    'jardin_botanico', 'arco_norte', 'mercado_norte', 'anillo_no', 'luxury_heights', 'mercado_central',
  ], { frequencyMin: 7 }),
  line('T3', 'Sur Solar', 'tranvia', TRAM_COLORS[2], [
    'arena', 'arco_sur', 'plaza_sol', 'vivero', 'barrio_sur', 'logistica', 'arena',
  ], { frequencyMin: 7 }),
  line('T4', 'Ribera Este', 'tranvia', TRAM_COLORS[3], [
    'hospital', 'barrio_este', 'ribera_este', 'lago', 'expo', 'marina',
  ], { frequencyMin: 8 }),
  line('T5', 'Campus', 'tranvia', TRAM_COLORS[4], [
    'residencia', 'universidad', 'estadio', 'hipodromo', 'anillo_ne', 'hospital',
  ], { frequencyMin: 6, lastDeparture: '00:00' }),
  line('T6', 'Financiero', 'tranvia', TRAM_COLORS[5], [
    'plaza_trading', 'banco_central', 'torre_helix', 'torres_gemelas', 'barrio_oriental', 'agora',
  ], { frequencyMin: 6 }),
  line('T7', 'Artes–Comercial', 'tranvia', TRAM_COLORS[6], [
    'opera', 'plaza_artes', 'galeria', 'cineteatro', 'gran_centro', 'outlet', 'feria',
  ], { frequencyMin: 8 }),
  line('T8', 'Oeste Local', 'tranvia', TRAM_COLORS[7], [
    'playa_oeste', 'satelite_oeste', 'canteras', 'ribera_oeste', 'barrio_oeste', 'mercado_oeste',
  ], { frequencyMin: 9 }),
  line('T9', 'Médico Circular', 'tranvia', TRAM_COLORS[8], [
    'hospital', 'biomed', 'farmacia_hub', 'anillo_ne', 'hospital',
  ], { frequencyMin: 7 }),
  line('T10', 'Puerto Sur Local', 'tranvia', TRAM_COLORS[9], [
    'muelles', 'terminal_sur', 'isla_verde', 'faro_sur', 'puerto_sur', 'muelles',
  ], { frequencyMin: 10 }),
];

const otherLines: TransitLine[] = [
  line('B11', 'Bus Expreso Norte', 'bus', '#546E7A', ['puerto_norte', 'norte_viejo', 'arco_norte', 'plaza_orbe'], { frequencyMin: 5 }),
  line('B22', 'Bus Expreso Sur', 'bus', '#607D8B', ['plaza_orbe', 'arco_sur', 'barrio_sur', 'terminal_sur'], { frequencyMin: 5 }),
  line('B35', 'Bus Aeropuerto', 'bus', '#455A64', ['plaza_orbe', 'barrio_este', 'lago', 'terminal_aerea', 'aeropuerto'], { frequencyMin: 8, firstDeparture: '04:00', lastDeparture: '03:00' }),
  line('B48', 'Bus Circunvalación', 'bus', '#78909C', ['anillo_no', 'anillo_ne', 'anillo_se', 'anillo_so', 'anillo_no'], { frequencyMin: 10 }),
  line('B60', 'Bus Puerto–Tech', 'bus', '#90A4AE', ['muelles', 'industrial', 'barrio_sur', 'logistica', 'tech_park'], { frequencyMin: 12 }),
  line('B71', 'Bus Colinas', 'bus', '#78909C', ['observatorio', 'cascada', 'bosque', 'colinas', 'anillo_no', 'plaza_orbe'], { frequencyMin: 12 }),
  line('B82', 'Bus Nocturno Centro', 'bus', '#263238', ['catedral', 'plaza_orbe', 'agora', 'torre_helix', 'bolsa', 'catedral'], { frequencyMin: 15, firstDeparture: '23:00', lastDeparture: '05:00' }),
  line('B90', 'Bus Satélite Oeste', 'bus', '#37474F', ['playa_oeste', 'satelite_oeste', 'silos', 'planta', 'valle', 'ribera_oeste'], { frequencyMin: 15 }),
  line('B100', 'Bus Nueva Heliora', 'bus', '#546E7A', ['nueva_heliora', 'plaza_nueva', 'barrio_obrero', 'anillo_so', 'plaza_orbe'], { frequencyMin: 12 }),
  line('B110', 'Bus Suburbio Sur', 'bus', '#607D8B', ['suburbio_sur', 'colegios', 'urbanizacion', 'tech_park', 'anillo_se'], { frequencyMin: 14 }),

  line('H1', 'Hyperloop Orbe–Aeropuerto', 'hyperloop', '#00BFA5', ['plaza_orbe', 'lago', 'aeropuerto'], { frequencyMin: 8 }),
  line('H2', 'Hyperloop Costa a Costa', 'hyperloop', '#1DE9B6', ['satelite_oeste', 'plaza_orbe', 'satelite_este'], { frequencyMin: 10 }),
  line('H3', 'Hyperloop Norte–Tech', 'hyperloop', '#64FFDA', ['puerto_norte', 'plaza_orbe', 'tech_park'], { frequencyMin: 12 }),

  line('F1', 'Ferry Bahía Norte', 'ferry', '#0288D1', ['dunas', 'puerto_norte', 'faro', 'mirador'], { frequencyMin: 20, firstDeparture: '06:30', lastDeparture: '21:00' }),
  line('F2', 'Ferry Delta Sur', 'ferry', '#039BE5', ['muelles', 'isla_verde', 'faro_sur', 'puerto_sur'], { frequencyMin: 25, firstDeparture: '07:00', lastDeparture: '20:30' }),
  line('F3', 'Ferry Transbahía', 'ferry', '#29B6F6', ['puerto_norte', 'marina', 'puerto_sur'], { frequencyMin: 40, firstDeparture: '08:00', lastDeparture: '19:00' }),

  line('CBL1', 'Teleférico Colinas', 'cable', '#8D6E63', ['cascada', 'observatorio', 'bosque', 'colinas'], { frequencyMin: 8, firstDeparture: '08:00', lastDeparture: '20:00' }),
  line('CBL2', 'Teleférico Mirador', 'cable', '#A1887F', ['faro', 'mirador', 'universidad'], { frequencyMin: 10, firstDeparture: '09:00', lastDeparture: '19:30' }),
];

// Fix cable codes for display - user asked L/T/C for metro/tram/cercanias. Cable can stay as TF or CBL.
// Remap cable codes to TF1/TF2 for clarity
otherLines.forEach((l) => {
  if (l.id === 'cbl1') {
    l.code = 'TF1';
    l.id = 'tf1';
  }
  if (l.id === 'cbl2') {
    l.code = 'TF2';
    l.id = 'tf2';
  }
});

export const lines: TransitLine[] = ensureStatuses([
  ...metroLines,
  ...cercaniasLines,
  ...tramLines,
  ...otherLines,
]);

export function getUniqueStations(): Station[] {
  const seen = new Set<string>();
  const result: Station[] = [];
  for (const s of Object.values(stations)) {
    const key = `${s.x},${s.y}`;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(s);
  }
  return result;
}

export function getStation(id: string): Station | undefined {
  return stations[id];
}

export function getLinesForStation(stationId: string): TransitLine[] {
  const st = stations[stationId];
  if (!st) return [];
  return lines.filter((l) =>
    l.stationIds.some((sid) => {
      const s = stations[sid];
      return sid === stationId || (s && s.x === st.x && s.y === st.y);
    }),
  );
}

export function getLinePath(line: TransitLine): { x: number; y: number }[] {
  return line.stationIds
    .map((id) => stations[id])
    .filter(Boolean)
    .map((s) => ({ x: s.x, y: s.y }));
}

export function findLineByCode(code: string): TransitLine | undefined {
  const c = code.trim().toLowerCase();
  return lines.find((l) => l.code.toLowerCase() === c || l.id === c);
}

export function getLineBounds(line: TransitLine): { minX: number; minY: number; maxX: number; maxY: number } | null {
  const pts = getLinePath(line);
  if (!pts.length) return null;
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const p of pts) {
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x);
    maxY = Math.max(maxY, p.y);
  }
  return { minX, minY, maxX, maxY };
}
