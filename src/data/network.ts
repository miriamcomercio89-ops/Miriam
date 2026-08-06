/**
 * Heliora v0.3 — mega-metrópolis costera turística del sur de España.
 * Costa al sur, sierra al norte, pueblos blancos e interior; trazados densos y orgánicos.
 */
import { densifyNetwork } from './densify';
import type {
  BusFamily,
  DistrictLabel,
  LineStatus,
  Station,
  TransitLine,
  TransportMode,
} from './types';

export const CITY = {
  name: 'Heliora',
  tagline: 'Costa, sierra y la red más grande del Mediterráneo',
  population: '64,8 millones',
  dailyTrips: '37,5 millones',
  mapWidth: 4600,
  mapHeight: 3200,
  inspiration: 'Ciudad costera turística del sur de España',
};

type StDef = {
  key: string;
  name: string;
  dx?: number;
  dy?: number;
  interchange?: boolean;
  majorHub?: boolean;
};

type DistrictSeed = {
  id: string;
  name: string;
  x: number;
  y: number;
  stations: StDef[];
};

const DISTRICT_SEEDS: DistrictSeed[] = [
  // ——— Núcleo histórico / centro ———
  {
    id: 'casco',
    name: 'Casco Antiguo',
    x: 2100,
    y: 1500,
    stations: [
      { key: 'plaza_mayor', name: 'Plaza Mayor', interchange: true, majorHub: true },
      { key: 'catedral', name: 'Catedral de Heliora', dx: -80, dy: -55, interchange: true },
      { key: 'alcazaba', name: 'Alcazaba', dx: 70, dy: -70 },
      { key: 'juderia', name: 'La Judería', dx: -100, dy: 40 },
      { key: 'ayuntamiento', name: 'Ayuntamiento', dx: 90, dy: 35 },
      { key: 'plaza_constitucion', name: 'Plaza Constitución', dx: -35, dy: -25 },
      { key: 'calle_larios', name: 'Calle Larios', dx: 25, dy: 15 },
      { key: 'pasaje_chinitas', name: 'Pasaje Chinitas', dx: -55, dy: 20 },
      { key: 'plaza_obispo', name: 'Plaza del Obispo', dx: -60, dy: -40 },
    ],
  },
  {
    id: 'centro_hist_este',
    name: 'Centro Histórico Este',
    x: 2180,
    y: 1460,
    stations: [
      { key: 'teatro_romano', name: 'Teatro Romano', interchange: true },
      { key: 'casa_consulado', name: 'Casa del Consulado', dx: 40, dy: -25 },
      { key: 'calle_granada', name: 'Calle Granada', dx: -30, dy: 35 },
    ],
  },
  {
    id: 'juderia_barrio',
    name: 'Barrio de la Judería',
    x: 2020,
    y: 1540,
    stations: [
      { key: 'sinagoga', name: 'Plaza Sinagoga', interchange: true },
      { key: 'callejon_fresco', name: 'Callejón del Fresco', dx: -35, dy: 30 },
      { key: 'arco_cristianos', name: 'Arco de los Cristianos', dx: 40, dy: -20 },
    ],
  },
  {
    id: 'ensanche_sur',
    name: 'Ensanche Sur',
    x: 2140,
    y: 1640,
    stations: [
      { key: 'alameda_principal', name: 'Alameda Principal', interchange: true },
      { key: 'plaza_marina', name: 'Plaza de la Marina', dx: 45, dy: 30 },
      { key: 'corte_ingles', name: 'El Corte Heliora', dx: -40, dy: 25 },
    ],
  },
  {
    id: 'ciudad_deportiva_ext',
    name: 'Ciudad Deportiva Heliora',
    x: 2020,
    y: 1220,
    stations: [
      { key: 'ciudad_deportiva_hel', name: 'Ciudad Deportiva Heliora', interchange: true, majorHub: true },
      { key: 'pista_atletismo', name: 'Pista de Atletismo', dx: 55, dy: -35 },
      { key: 'piscinas_olimpicas', name: 'Piscinas Olímpicas', dx: -45, dy: 40 },
      { key: 'pabellon_central', name: 'Pabellón Central', dx: 40, dy: 45 },
    ],
  },
  {
    id: 'uni_norte',
    name: 'Ciudad Universitaria Norte',
    x: 1520,
    y: 680,
    stations: [
      { key: 'facultad_derecho', name: 'Facultad de Derecho', interchange: true },
      { key: 'facultad_ciencias', name: 'Facultad de Ciencias', dx: 55, dy: -30 },
      { key: 'cafeteria_campus', name: 'Cafetería Campus', dx: -40, dy: 35 },
    ],
  },
  {
    id: 'residencial_campus',
    name: 'Residencial Campus',
    x: 1700,
    y: 720,
    stations: [
      { key: 'colegio_mayor', name: 'Colegio Mayor', interchange: true },
      { key: 'apartamentos_u', name: 'Apartamentos Universitarios', dx: 45, dy: 30 },
    ],
  },
  {
    id: 'pta_dist',
    name: 'Parque Tecnológico',
    x: 1170,
    y: 1010,
    stations: [
      { key: 'pta_gate', name: 'PTA Acceso Norte', interchange: true },
      { key: 'incubadora', name: 'Incubadora de Empresas', dx: 50, dy: 35 },
    ],
  },
  {
    id: 'sierra_blanca_este',
    name: 'Sierra Blanca Este',
    x: 2900,
    y: 900,
    stations: [
      { key: 'sierra_blanca_e', name: 'Sierra Blanca Este', interchange: true },
      { key: 'urbanizacion_gold', name: 'Urbanización Gold Mar', dx: 45, dy: -35 },
    ],
  },
  {
    id: 'pedregalejo_u',
    name: 'Pedregalejo Urbano',
    x: 2550,
    y: 1780,
    stations: [
      { key: 'pedregalejo', name: 'Pedregalejo', interchange: true },
      { key: 'escuela_nautica', name: 'Escuela Náutica', dx: 40, dy: 35 },
    ],
  },
  {
    id: 'huelin_u',
    name: 'Huelin Urbano',
    x: 1350,
    y: 1680,
    stations: [
      { key: 'huelin_centro', name: 'Huelin Centro', interchange: true },
      { key: 'mercado_huelin', name: 'Mercado de Huelin', dx: -40, dy: 30 },
    ],
  },
  {
    id: 'cruz_humilladero_d',
    name: 'Cruz Humilladero',
    x: 2050,
    y: 1580,
    stations: [
      { key: 'humilladero_centro', name: 'Cruz Humilladero Centro', interchange: true },
      { key: 'estacion_autobus', name: 'Estación de Autobuses', dx: -50, dy: 40, majorHub: true },
    ],
  },
  {
    id: 'palacio_deportes_d',
    name: 'Palacio de Deportes',
    x: 1880,
    y: 1320,
    stations: [
      { key: 'palacio_deportes_est', name: 'Palacio de Deportes', interchange: true },
      { key: 'parking_deportes', name: 'Parking Deportes', dx: 40, dy: 30 },
    ],
  },
  {
    id: 'perchel',
    name: 'El Perchel',
    x: 1920,
    y: 1580,
    stations: [
      { key: 'perchel', name: 'El Perchel', interchange: true, majorHub: true },
      { key: 'atarazanas', name: 'Mercado Atarazanas', dx: -60, dy: -40 },
      { key: 'calle_llanitos', name: 'Calle Llanitos', dx: 50, dy: 45 },
    ],
  },
  {
    id: 'soho',
    name: 'Soho Heliora',
    x: 2220,
    y: 1620,
    stations: [
      { key: 'soho', name: 'Soho', interchange: true },
      { key: 'teatro_cervantes', name: 'Teatro Cervantes', dx: 55, dy: -40 },
      { key: 'plaza_unos', name: 'Plaza de la Merced', dx: -40, dy: 50 },
    ],
  },
  {
    id: 'ense',
    name: 'La Ensenada',
    x: 2100,
    y: 1720,
    stations: [
      { key: 'paseo_maritimo', name: 'Paseo Marítimo', interchange: true, majorHub: true },
      { key: 'muelle_uno', name: 'Muelle Uno', dx: -70, dy: 40 },
      { key: 'palmeral', name: 'Palmeral de Sur', dx: 80, dy: 30 },
    ],
  },

  // ——— Costa / playas (sur y sureste) ———
  {
    id: 'malagueta',
    name: 'Playa del Faro',
    x: 2340,
    y: 1880,
    stations: [
      { key: 'playa_faro', name: 'Playa del Faro', interchange: true },
      { key: 'faro_hel', name: 'El Faro', dx: 60, dy: 50 },
      { key: 'baños_carmen', name: 'Baños del Carmen', dx: 120, dy: 20 },
    ],
  },
  {
    id: 'pedregalejo',
    name: 'Cala Serena',
    x: 2700,
    y: 1950,
    stations: [
      { key: 'cala_serena', name: 'Cala Serena', interchange: true },
      { key: 'chiringuitos', name: 'Los Chiringuitos', dx: 70, dy: 40 },
      { key: 'paseo_cala', name: 'Paseo de la Cala', dx: -50, dy: -30 },
    ],
  },
  {
    id: 'palo',
    name: 'Los Arenales',
    x: 3100,
    y: 2000,
    stations: [
      { key: 'arenales', name: 'Los Arenales', interchange: true },
      { key: 'playa_arenales', name: 'Playa Arenales', dx: 40, dy: 55 },
      { key: 'mercado_arenales', name: 'Mercado Arenales', dx: -55, dy: -25 },
    ],
  },
  {
    id: 'rincon',
    name: 'Rincón del Mar',
    x: 3500,
    y: 2050,
    stations: [
      { key: 'rincon_mar', name: 'Rincón del Mar', interchange: true },
      { key: 'cala_viento', name: 'Cala del Viento', dx: 60, dy: 40 },
      { key: 'faro_este', name: 'Faro Este', dx: 100, dy: 10 },
    ],
  },
  {
    id: 'torres',
    name: 'Torres del Mar',
    x: 1680,
    y: 1980,
    stations: [
      { key: 'torres_mar', name: 'Torres del Mar', interchange: true },
      { key: 'aquapark', name: 'Aquapark Heliora', dx: -60, dy: 45 },
      { key: 'paseo_torres', name: 'Paseo Torres', dx: 55, dy: -20 },
    ],
  },
  {
    id: 'bajadilla',
    name: 'La Bajadilla',
    x: 1400,
    y: 1920,
    stations: [
      { key: 'bajadilla', name: 'La Bajadilla', interchange: true },
      { key: 'puerto_deportivo', name: 'Puerto Deportivo', dx: -50, dy: 50 },
      { key: 'playa_bajadilla', name: 'Playa Bajadilla', dx: 40, dy: 55 },
    ],
  },

  // ——— Puerto / oeste costero ———
  {
    id: 'puerto',
    name: 'Puerto Heliora',
    x: 1100,
    y: 1750,
    stations: [
      { key: 'puerto_hel', name: 'Puerto Heliora', interchange: true, majorHub: true },
      { key: 'muelles_carga', name: 'Muelles de Carga', dx: -80, dy: 40 },
      { key: 'terminal_cruceros', name: 'Terminal Cruceros', dx: 60, dy: 55 },
      { key: 'lonja', name: 'La Lonja', dx: 40, dy: -45 },
    ],
  },
  {
    id: 'san_andres',
    name: 'San Andrés',
    x: 1280,
    y: 1600,
    stations: [
      { key: 'san_andres', name: 'San Andrés', interchange: true },
      { key: 'huelin', name: 'Huelin', dx: 70, dy: 40 },
      { key: 'parque_oeste', name: 'Parque del Oeste', dx: -40, dy: -50 },
    ],
  },

  // ——— Aeropuerto / zona franca (oeste) ———
  {
    id: 'aeropuerto',
    name: 'Aeropuerto Costa del Sol',
    x: 520,
    y: 1500,
    stations: [
      { key: 'aeropuerto', name: 'Aeropuerto T1', interchange: true, majorHub: true },
      { key: 'aeropuerto_t2', name: 'Aeropuerto T2', dx: -40, dy: -70 },
      { key: 'zona_franca', name: 'Zona Franca', dx: 80, dy: 60 },
      { key: 'cargo_aereo', name: 'Carga Aérea', dx: 50, dy: 100 },
    ],
  },
  {
    id: 'guadalmar',
    name: 'Guadalmar',
    x: 780,
    y: 1720,
    stations: [
      { key: 'guadalmar', name: 'Guadalmar', interchange: true },
      { key: 'campo_golf', name: 'Campo de Golf', dx: -50, dy: 40 },
      { key: 'hotel_costa', name: 'Hotel Costa Azul', dx: 55, dy: -30 },
    ],
  },

  // ——— Comercial / avenida ———
  {
    id: 'avenida_sol',
    name: 'Avenida del Sol',
    x: 1750,
    y: 1680,
    stations: [
      { key: 'av_sol', name: 'Avenida del Sol', interchange: true },
      { key: 'cc_miramar', name: 'C.C. Miramar', dx: -60, dy: 50, interchange: true },
      { key: 'larios_sur', name: 'Larios Sur', dx: 70, dy: -30 },
    ],
  },
  {
    id: 'teatinos_com',
    name: 'Plaza Mayor Comercial',
    x: 1500,
    y: 1200,
    stations: [
      { key: 'plaza_comercial', name: 'Plaza Comercial', interchange: true },
      { key: 'ikea_hel', name: 'Parque Comercial', dx: -70, dy: 40 },
      { key: 'outlet_sol', name: 'Outlet del Sol', dx: 60, dy: -35 },
    ],
  },

  // ——— Universidad / norte ———
  {
    id: 'campus',
    name: 'Campus del Olivar',
    x: 1600,
    y: 780,
    stations: [
      { key: 'universidad', name: 'Universidad Heliora', interchange: true, majorHub: true },
      { key: 'rectorado', name: 'Rectorado', dx: -70, dy: -40 },
      { key: 'biblioteca_campus', name: 'Biblioteca Campus', dx: 60, dy: -30 },
      { key: 'residencia_u', name: 'Residencia Universitaria', dx: 80, dy: 50 },
      { key: 'polideportivo_u', name: 'Polideportivo Campus', dx: -50, dy: 60 },
    ],
  },
  {
    id: 'ciudad_jardin',
    name: 'Ciudad Jardín',
    x: 2000,
    y: 1000,
    stations: [
      { key: 'ciudad_jardin', name: 'Ciudad Jardín', interchange: true },
      { key: 'jardin_botanico', name: 'Jardín Botánico', dx: 60, dy: -45 },
      { key: 'parque_norte', name: 'Parque Norte', dx: -50, dy: 40 },
    ],
  },
  {
    id: 'el_pastor',
    name: 'El Pastor',
    x: 1750,
    y: 980,
    stations: [
      { key: 'el_pastor', name: 'El Pastor', interchange: true },
      { key: 'mercado_pastor', name: 'Mercado del Pastor', dx: 45, dy: 40 },
    ],
  },

  // ——— Residencial / colinas ———
  {
    id: 'cerrado',
    name: 'Cerrado de Calderón',
    x: 2500,
    y: 1200,
    stations: [
      { key: 'cerrado', name: 'Cerrado de Calderón', interchange: true },
      { key: 'mirador_calderon', name: 'Mirador Calderón', dx: 50, dy: -55 },
      { key: 'colegios_este', name: 'Zona Colegios Este', dx: -40, dy: 45 },
    ],
  },
  {
    id: 'limonar',
    name: 'El Limonar',
    x: 2400,
    y: 1400,
    stations: [
      { key: 'limonar', name: 'El Limonar', interchange: true },
      { key: 'hospital_este', name: 'Hospital Este', dx: 70, dy: -30, interchange: true },
      { key: 'avenida_limonar', name: 'Av. Limonar', dx: -45, dy: 40 },
    ],
  },
  {
    id: 'monte',
    name: 'Monte Heliora',
    x: 2300,
    y: 900,
    stations: [
      { key: 'monte_hel', name: 'Monte Heliora', interchange: true },
      { key: 'mirador_monte', name: 'Mirador del Monte', dx: 40, dy: -50 },
      { key: 'urbanizacion_pinares', name: 'Urbanización Pinares', dx: -60, dy: 35 },
    ],
  },
  {
    id: 'altos',
    name: 'Altos del Mediterráneo',
    x: 2800,
    y: 1050,
    stations: [
      { key: 'altos_med', name: 'Altos del Mediterráneo', interchange: true },
      { key: 'club_golf_este', name: 'Club de Golf Este', dx: 55, dy: -40 },
      { key: 'sierra_blanca', name: 'Sierra Blanca', dx: -40, dy: 50 },
    ],
  },

  // ——— Deportivo / feria ———
  {
    id: 'estadio',
    name: 'La Rosaleda',
    x: 1950,
    y: 1280,
    stations: [
      { key: 'rosaleda', name: 'Estadio Rosaleda', interchange: true, majorHub: true },
      { key: 'ciudad_deportiva', name: 'Ciudad Deportiva', dx: 70, dy: -40 },
      { key: 'palacio_deportes', name: 'Palacio de Deportes', dx: -50, dy: 45 },
    ],
  },
  {
    id: 'feria',
    name: 'Recinto Ferial',
    x: 1650,
    y: 1380,
    stations: [
      { key: 'feria', name: 'Recinto Ferial', interchange: true },
      { key: 'pabellones', name: 'Pabellones IFEMA-H', dx: 55, dy: 40 },
      { key: 'parking_feria', name: 'Parking Feria', dx: -50, dy: -30 },
    ],
  },

  // ——— Hospital / administrativo ———
  {
    id: 'hospital_civil',
    name: 'Distrito Hospitalario',
    x: 2050,
    y: 1350,
    stations: [
      { key: 'hospital_civil', name: 'Hospital Civil', interchange: true, majorHub: true },
      { key: 'materno', name: 'Materno-Infantil', dx: 60, dy: 40 },
      { key: 'facultad_medicina', name: 'Facultad de Medicina', dx: -55, dy: -35 },
    ],
  },
  {
    id: 'ciudad_jardin_admin',
    name: 'Ciudad de la Justicia',
    x: 1850,
    y: 1150,
    stations: [
      { key: 'justicia', name: 'Ciudad de la Justicia', interchange: true },
      { key: 'comisarías', name: 'Complejo Policial', dx: 50, dy: 40 },
    ],
  },

  // ——— Este interior / nuevo ———
  {
    id: 'nueva_hel',
    name: 'Nueva Heliora',
    x: 3200,
    y: 1500,
    stations: [
      { key: 'nueva_hel', name: 'Nueva Heliora', interchange: true, majorHub: true },
      { key: 'eco_barrio', name: 'Eco-Barrio Levante', dx: 60, dy: -40 },
      { key: 'tech_levante', name: 'Parque Tech Levante', dx: -50, dy: 50 },
      { key: 'plaza_levante', name: 'Plaza Levante', dx: 40, dy: 60 },
    ],
  },
  {
    id: 'vinuela',
    name: 'La Viñuela',
    x: 3600,
    y: 1400,
    stations: [
      { key: 'vinuela', name: 'La Viñuela', interchange: true },
      { key: 'embalse', name: 'Embalse Viñuela', dx: 50, dy: -45 },
      { key: 'pueblo_blanco', name: 'Pueblo Blanco', dx: -40, dy: 40 },
    ],
  },

  // ——— Oeste interior / industrial ———
  {
    id: 'industrial',
    name: 'Polígono Guadalhorce',
    x: 900,
    y: 1300,
    stations: [
      { key: 'poligono', name: 'Polígono Guadalhorce', interchange: true },
      { key: 'logistica', name: 'Hub Logístico', dx: 60, dy: 45 },
      { key: 'nave_central', name: 'Nave Central', dx: -50, dy: -30 },
    ],
  },
  {
    id: 'campanillas',
    name: 'Campanillas',
    x: 1100,
    y: 1050,
    stations: [
      { key: 'campanillas', name: 'Campanillas', interchange: true },
      { key: 'pta', name: 'Parque Tecnológico', dx: 70, dy: -40, interchange: true },
      { key: 'smart_city', name: 'Smart City Hub', dx: -40, dy: 50 },
    ],
  },

  // ——— Intercambiadores anillo ———
  {
    id: 'int_ne',
    name: 'Intercambiador NE',
    x: 2550,
    y: 1100,
    stations: [{ key: 'int_ne', name: 'Intercambiador NE', interchange: true, majorHub: true }],
  },
  {
    id: 'int_se',
    name: 'Intercambiador SE',
    x: 2650,
    y: 1700,
    stations: [{ key: 'int_se', name: 'Intercambiador SE', interchange: true, majorHub: true }],
  },
  {
    id: 'int_so',
    name: 'Intercambiador SO',
    x: 1450,
    y: 1750,
    stations: [{ key: 'int_so', name: 'Intercambiador SO', interchange: true, majorHub: true }],
  },
  {
    id: 'int_no',
    name: 'Intercambiador NO',
    x: 1450,
    y: 1100,
    stations: [{ key: 'int_no', name: 'Intercambiador NO', interchange: true, majorHub: true }],
  },
  {
    id: 'maria_zambrano',
    name: 'Estación María Zambrano',
    x: 1900,
    y: 1480,
    stations: [
      { key: 'maria_zambrano', name: 'María Zambrano', interchange: true, majorHub: true },
      { key: 'renfe_sur', name: 'Andenes Cercanías', dx: 40, dy: 50 },
    ],
  },
  {
    id: 'carretera_cadiz',
    name: 'Carretera de Cádiz',
    x: 1550,
    y: 1550,
    stations: [
      { key: 'ctra_cadiz', name: 'Carretera de Cádiz', interchange: true },
      { key: 'pacifico', name: 'Pacífico', dx: 55, dy: 40 },
      { key: 'el_torcal', name: 'El Torcal', dx: -50, dy: -35 },
    ],
  },
  {
    id: 'capuchinos',
    name: 'Capuchinos',
    x: 2200,
    y: 1380,
    stations: [
      { key: 'capuchinos', name: 'Capuchinos', interchange: true },
      { key: 'cruz_verde', name: 'Cruz Verde', dx: 45, dy: -40 },
      { key: 'olletas', name: 'Olletas', dx: -40, dy: 45 },
    ],
  },
  {
    id: 'victoria',
    name: 'La Victoria',
    x: 2280,
    y: 1520,
    stations: [
      { key: 'victoria', name: 'La Victoria', interchange: true },
      { key: 'cruz_humilladero', name: 'Cruz Humilladero', dx: -80, dy: 60 },
    ],
  },
  {
    id: 'ciudad_olivo',
    name: 'Ciudad del Olivo',
    x: 1300,
    y: 900,
    stations: [
      { key: 'ciudad_olivo', name: 'Ciudad del Olivo', interchange: true },
      { key: 'olivar_norte', name: 'Olivar Norte', dx: 50, dy: -40 },
    ],
  },
  {
    id: 'churriana',
    name: 'Churriana',
    x: 1000,
    y: 1550,
    stations: [
      { key: 'churriana', name: 'Churriana', interchange: true },
      { key: 'jardin_churriana', name: 'Jardín Churriana', dx: 45, dy: -35 },
    ],
  },

  // ——— Costa ampliada (paseos, puertos deportivos, apeaderos de playa) ———
  {
    id: 'paseo_levante',
    name: 'Paseo de Levante',
    x: 2900,
    y: 2080,
    stations: [
      { key: 'paseo_levante', name: 'Paseo de Levante', interchange: true },
      { key: 'balneario', name: 'Balneario Heliora', dx: 50, dy: 40 },
      { key: 'espigon', name: 'Espigón Este', dx: -40, dy: 55 },
    ],
  },
  {
    id: 'puerto_marina',
    name: 'Puerto Marina',
    x: 1850,
    y: 2100,
    stations: [
      { key: 'puerto_marina', name: 'Puerto Marina', interchange: true },
      { key: 'darsena_yates', name: 'Dársena de Yates', dx: 55, dy: 35 },
      { key: 'paseo_marina', name: 'Paseo Marina', dx: -45, dy: -25 },
    ],
  },
  {
    id: 'la_cala',
    name: 'La Cala del Sol',
    x: 3800,
    y: 2180,
    stations: [
      { key: 'cala_sol', name: 'La Cala del Sol', interchange: true },
      { key: 'playa_cala', name: 'Playa La Cala', dx: 40, dy: 50 },
      { key: 'mirador_cala', name: 'Mirador La Cala', dx: -50, dy: -30 },
    ],
  },
  {
    id: 'sacaba',
    name: 'Sacaba Beach',
    x: 2500,
    y: 2050,
    stations: [
      { key: 'sacaba', name: 'Sacaba Beach', interchange: true },
      { key: 'chiringuito_sur', name: 'Chiringuito Sur', dx: 60, dy: 40 },
    ],
  },

  // ——— Sierra / pueblos blancos / interior ———
  {
    id: 'mijas_hel',
    name: 'Mijas de Heliora',
    x: 2400,
    y: 480,
    stations: [
      { key: 'mijas', name: 'Mijas de Heliora', interchange: true, majorHub: true },
      { key: 'mirador_mijas', name: 'Mirador de Mijas', dx: 50, dy: -45 },
      { key: 'casitas_blancas', name: 'Casitas Blancas', dx: -55, dy: 40 },
    ],
  },
  {
    id: 'alhaurin',
    name: 'Alhaurín del Monte',
    x: 1800,
    y: 520,
    stations: [
      { key: 'alhaurin', name: 'Alhaurín del Monte', interchange: true },
      { key: 'huerta_alhaurin', name: 'Huerta Alhaurín', dx: 45, dy: 40 },
      { key: 'ermita', name: 'Ermita del Monte', dx: -40, dy: -35 },
    ],
  },
  {
    id: 'coin',
    name: 'Coín Valle',
    x: 1400,
    y: 420,
    stations: [
      { key: 'coin', name: 'Coín Valle', interchange: true },
      { key: 'plaza_coin', name: 'Plaza de Coín', dx: 40, dy: 35 },
    ],
  },
  {
    id: 'cartama',
    name: 'Cártama Sierra',
    x: 1100,
    y: 600,
    stations: [
      { key: 'cartama', name: 'Cártama Sierra', interchange: true },
      { key: 'estacion_cartama', name: 'Estación Cártama', dx: 50, dy: 40 },
    ],
  },
  {
    id: 'torremolinos_n',
    name: 'Urbanización El Pinillo',
    x: 1600,
    y: 700,
    stations: [
      { key: 'pinillo', name: 'El Pinillo', interchange: true },
      { key: 'los_manantiales', name: 'Los Manantiales', dx: 45, dy: -30 },
    ],
  },
  {
    id: 'benalmadena_p',
    name: 'Arroyo de la Miel',
    x: 2000,
    y: 600,
    stations: [
      { key: 'arroyo_miel', name: 'Arroyo de la Miel', interchange: true },
      { key: 'teleferico_base', name: 'Base Sierra', dx: 40, dy: -50 },
    ],
  },
  {
    id: 'ojén',
    name: 'Ojén Blanco',
    x: 3000,
    y: 550,
    stations: [
      { key: 'ojen', name: 'Ojén Blanco', interchange: true },
      { key: 'plaza_ojen', name: 'Plaza Ojén', dx: -40, dy: 35 },
    ],
  },
  {
    id: 'istefan',
    name: 'Istán Lago',
    x: 3400,
    y: 650,
    stations: [
      { key: 'istan', name: 'Istán Lago', interchange: true },
      { key: 'embalse_istan', name: 'Embalse Istán', dx: 45, dy: -40 },
    ],
  },
  {
    id: 'fuengirola_int',
    name: 'Los Boliches Interior',
    x: 1200,
    y: 750,
    stations: [
      { key: 'boliches', name: 'Los Boliches', interchange: true },
      { key: 'torreblanca', name: 'Torreblanca', dx: 50, dy: 40 },
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
        majorHub: s.majorHub,
      };
    }
  }
  return map;
}

const baseStations = buildStations();

export const districtLabels: DistrictLabel[] = DISTRICT_SEEDS.map((d) => ({
  id: d.id,
  name: d.name,
  x: d.x,
  y: d.y - 110,
}));

const METRO = [
  '#C62828', '#1565C0', '#2E7D32', '#EF6C00', '#6A1B9A', '#00838F',
  '#4527A0', '#558B2F', '#AD1457', '#0277BD', '#5D4037', '#00695C',
  '#D84315', '#283593', '#689F38', '#00897B', '#C2185B', '#37474F',
  '#F9A825', '#4E342E',
];
const CERC = ['#B71C1C', '#0D47A1', '#1B5E20', '#E65100', '#4A148C', '#00695C', '#33691E', '#880E4F', '#01579B', '#3E2723'];
const TRAM = ['#E65100', '#2E7D32', '#F9A825', '#0277BD', '#AD1457', '#558B2F', '#00695C', '#6A1B9A', '#EF6C00', '#1565C0', '#8D6E63', '#00838F'];

const BUS_COLORS: Record<BusFamily, string> = {
  U: '#1565C0',
  X: '#C62828',
  A: '#F9A825',
  N: '#212121',
  O: '#6A1B9A',
  P: '#00838F',
  TU: '#EF6C00',
  H: '#AD1457',
  L: '#0277BD',
  R: '#558B2F',
  B: '#5D4037',
  E: '#D84315',
};

function line(
  code: string,
  name: string,
  mode: TransportMode,
  color: string,
  stationIds: string[],
  opts: Partial<Pick<TransitLine, 'frequencyMin' | 'firstDeparture' | 'lastDeparture' | 'status' | 'occupancy' | 'operatorNote' | 'busFamily'>> = {},
): TransitLine {
  const valid = stationIds.filter((id) => baseStations[id]);
  return {
    id: code.toLowerCase(),
    code,
    name,
    mode,
    color,
    stationIds: valid,
    frequencyMin: opts.frequencyMin ?? 6,
    firstDeparture: opts.firstDeparture ?? '06:00',
    lastDeparture: opts.lastDeparture ?? '23:30',
    status: opts.status ?? 'normal',
    occupancy: opts.occupancy ?? 50,
    operatorNote: opts.operatorNote,
    busFamily: opts.busFamily,
  };
}

function ensureMeta(list: TransitLine[]): TransitLine[] {
  const overrides: Record<string, { status: LineStatus; occupancy: number; note?: string }> = {
    l3: { status: 'retrasos', occupancy: 78, note: 'Retrasos 3–6 min por saturación en María Zambrano.' },
    l7: { status: 'obras', occupancy: 44, note: 'Obras en tramo Puerto–Intercambiador SO.' },
    c2: { status: 'retrasos', occupancy: 82, note: 'Demora en acceso al Aeropuerto T1.' },
    t4: { status: 'obras', occupancy: 36, note: 'Desvío temporal en Cala Serena.' },
    x1: { status: 'retrasos', occupancy: 71, note: 'Tráfico en Avenida del Sol.' },
    hl1: { status: 'suspendida', occupancy: 0, note: 'Hyperloop en mantenimiento hasta las 15:00.' },
  };
  return list.map((l, i) => {
    const o = overrides[l.id];
    if (o) return { ...l, status: o.status, occupancy: o.occupancy, operatorNote: o.note };
    return { ...l, occupancy: 32 + ((i * 13) % 58) };
  });
}

/** Frecuencias realistas por modo (minutos en hora valle; hora punta se documenta en first/last) */
const F = {
  metroPeak: 3,
  metro: 5,
  cerc: 15,
  cercAirport: 20,
  tram: 8,
  tramCoast: 10,
  busUrban: 12,
  busExpress: 15,
  busUni: 10,
  busNight: 30,
  busAirport: 20,
  hyper: 12,
};

const metroLines: TransitLine[] = [
  line('L1', 'Andalucía Tech – Arenales', 'metro', METRO[0], [
    'pta', 'campanillas', 'ciudad_olivo', 'universidad', 'int_no', 'el_pastor', 'ciudad_jardin',
    'justicia', 'rosaleda', 'hospital_civil', 'maria_zambrano', 'plaza_mayor', 'victoria',
    'limonar', 'int_se', 'cala_serena', 'arenales',
  ], { frequencyMin: F.metroPeak, firstDeparture: '06:15', lastDeparture: '01:15' }),
  line('L2', 'Aeropuerto – Rincón del Mar', 'metro', METRO[1], [
    'aeropuerto', 'churriana', 'guadalmar', 'puerto_hel', 'int_so', 'ctra_cadiz', 'perchel',
    'plaza_mayor', 'soho', 'paseo_maritimo', 'playa_faro', 'int_se', 'cala_serena',
    'arenales', 'rincon_mar',
  ], { frequencyMin: F.metroPeak, firstDeparture: '05:45', lastDeparture: '01:30' }),
  line('L3', 'Campus – Playa del Faro', 'metro', METRO[2], [
    'universidad', 'residencia_u', 'el_pastor', 'feria', 'maria_zambrano', 'plaza_mayor',
    'soho', 'paseo_maritimo', 'playa_faro', 'faro_hel',
  ], { frequencyMin: F.metro, firstDeparture: '06:20', lastDeparture: '00:45' }),
  line('L4', 'Anillo Interior', 'metro', METRO[3], [
    'int_no', 'ciudad_jardin', 'capuchinos', 'int_ne', 'limonar', 'int_se', 'paseo_maritimo',
    'av_sol', 'int_so', 'plaza_comercial', 'int_no',
  ], { frequencyMin: F.metro, firstDeparture: '06:30', lastDeparture: '00:30' }),
  line('L5', 'Puerto – Nueva Heliora', 'metro', METRO[4], [
    'puerto_hel', 'san_andres', 'int_so', 'perchel', 'plaza_mayor', 'victoria', 'capuchinos',
    'cerrado', 'int_ne', 'altos_med', 'nueva_hel', 'vinuela',
  ], { frequencyMin: F.metro, firstDeparture: '06:15', lastDeparture: '00:50' }),
  line('L6', 'Guadalhorce – Torres del Mar', 'metro', METRO[5], [
    'poligono', 'campanillas', 'int_no', 'plaza_comercial', 'ctra_cadiz', 'av_sol',
    'int_so', 'bajadilla', 'torres_mar', 'aquapark',
  ], { frequencyMin: F.metro, firstDeparture: '06:25', lastDeparture: '23:50' }),
  line('L7', 'Costa Oeste', 'metro', METRO[6], [
    'aeropuerto_t2', 'aeropuerto', 'guadalmar', 'puerto_hel', 'bajadilla', 'torres_mar',
    'paseo_maritimo', 'playa_faro',
  ], { frequencyMin: F.metro, firstDeparture: '06:10', lastDeparture: '00:20' }),
  line('L8', 'Hospitalario Express', 'metro', METRO[7], [
    'hospital_civil', 'materno', 'facultad_medicina', 'rosaleda', 'capuchinos', 'hospital_este',
    'limonar', 'cerrado', 'int_ne',
  ], { frequencyMin: 4, firstDeparture: '05:50', lastDeparture: '01:00' }),
  line('L9', 'Monte – Casco', 'metro', METRO[8], [
    'monte_hel', 'mirador_monte', 'ciudad_jardin', 'capuchinos', 'victoria', 'plaza_mayor',
    'catedral', 'alcazaba',
  ], { frequencyMin: F.metro, firstDeparture: '06:40', lastDeparture: '23:40' }),
  line('L10', 'Litoral Este', 'metro', METRO[9], [
    'paseo_maritimo', 'playa_faro', 'baños_carmen', 'cala_serena', 'chiringuitos',
    'arenales', 'playa_arenales', 'rincon_mar', 'faro_este',
  ], { frequencyMin: F.metro, firstDeparture: '06:35', lastDeparture: '00:10' }),
  line('L11', 'Tech Corridor', 'metro', METRO[10], [
    'pta', 'smart_city', 'campanillas', 'ciudad_olivo', 'universidad', 'feria',
    'maria_zambrano', 'plaza_mayor', 'int_se', 'tech_levante', 'nueva_hel',
  ], { frequencyMin: F.metro, firstDeparture: '06:00', lastDeparture: '01:00' }),
  line('L12', 'Justicia – Cruceros', 'metro', METRO[11], [
    'justicia', 'el_pastor', 'rosaleda', 'hospital_civil', 'maria_zambrano', 'perchel',
    'ctra_cadiz', 'san_andres', 'puerto_hel', 'terminal_cruceros',
  ], { frequencyMin: F.metro, firstDeparture: '06:20', lastDeparture: '23:55' }),
  line('L13', 'Altos – Soho', 'metro', METRO[12], [
    'sierra_blanca', 'altos_med', 'club_golf_este', 'int_ne', 'cerrado', 'limonar',
    'victoria', 'soho', 'teatro_cervantes', 'plaza_mayor',
  ], { frequencyMin: 6, firstDeparture: '06:45', lastDeparture: '23:20' }),
  line('L14', 'Feria – Arenales', 'metro', METRO[13], [
    'feria', 'pabellones', 'av_sol', 'paseo_maritimo', 'int_se', 'paseo_cala',
    'cala_serena', 'mercado_arenales', 'arenales',
  ], { frequencyMin: F.metro, firstDeparture: '06:30', lastDeparture: '00:00' }),
  line('L15', 'Churriana – Capuchinos', 'metro', METRO[14], [
    'churriana', 'jardin_churriana', 'guadalmar', 'int_so', 'pacifico', 'perchel',
    'plaza_mayor', 'victoria', 'capuchinos', 'cruz_verde',
  ], { frequencyMin: F.metro, firstDeparture: '06:25', lastDeparture: '23:45' }),
  line('L16', 'Viñuela – María Zambrano', 'metro', METRO[15], [
    'pueblo_blanco', 'vinuela', 'embalse', 'nueva_hel', 'plaza_levante', 'int_ne',
    'hospital_este', 'capuchinos', 'hospital_civil', 'maria_zambrano',
  ], { frequencyMin: 6, firstDeparture: '06:10', lastDeparture: '23:30' }),
  line('L17', 'Perchel – Campus', 'metro', METRO[16], [
    'perchel', 'atarazanas', 'maria_zambrano', 'rosaleda', 'ciudad_jardin',
    'universidad', 'rectorado', 'biblioteca_campus',
  ], { frequencyMin: 4, firstDeparture: '06:05', lastDeparture: '01:10' }),
  line('L18', 'Diagonal Costa', 'metro', METRO[17], [
    'poligono', 'churriana', 'puerto_hel', 'bajadilla', 'torres_mar', 'paseo_maritimo',
    'soho', 'victoria', 'limonar', 'altos_med',
  ], { frequencyMin: F.metro, firstDeparture: '06:20', lastDeparture: '00:15' }),
  line('L19', 'Olivar – Playa', 'metro', METRO[18], [
    'olivar_norte', 'ciudad_olivo', 'universidad', 'plaza_comercial', 'ctra_cadiz',
    'av_sol', 'paseo_maritimo', 'muelle_uno', 'palmeral',
  ], { frequencyMin: F.metro, firstDeparture: '06:35', lastDeparture: '23:35' }),
  line('L20', 'Anillo Exterior Norte', 'metro', METRO[19], [
    'pta', 'ciudad_olivo', 'universidad', 'monte_hel', 'int_ne', 'altos_med',
    'nueva_hel', 'vinuela',
  ], { frequencyMin: 7, firstDeparture: '06:40', lastDeparture: '23:00' }),
];

const cercaniasLines: TransitLine[] = [
  line('C1', 'Álora Costa – Rincón', 'cercanias', CERC[0], [
    'pta', 'campanillas', 'universidad', 'maria_zambrano', 'plaza_mayor', 'paseo_maritimo',
    'playa_faro', 'cala_serena', 'arenales', 'rincon_mar',
  ], { frequencyMin: F.cerc, firstDeparture: '05:30', lastDeparture: '23:45' }),
  line('C2', 'Aeropuerto – María Zambrano', 'cercanias', CERC[1], [
    'aeropuerto', 'churriana', 'guadalmar', 'puerto_hel', 'int_so', 'ctra_cadiz',
    'perchel', 'maria_zambrano',
  ], { frequencyMin: F.cercAirport, firstDeparture: '05:00', lastDeparture: '00:30' }),
  line('C3', 'Campus – Nueva Heliora', 'cercanias', CERC[2], [
    'universidad', 'ciudad_jardin', 'rosaleda', 'maria_zambrano', 'capuchinos',
    'int_ne', 'nueva_hel',
  ], { frequencyMin: F.cerc, firstDeparture: '05:45', lastDeparture: '23:20' }),
  line('C4', 'Fuengirola-H – Viñuela (línea litoral)', 'cercanias', CERC[3], [
    'aeropuerto', 'guadalmar', 'torres_mar', 'paseo_maritimo', 'cala_serena',
    'arenales', 'rincon_mar', 'nueva_hel', 'vinuela',
  ], { frequencyMin: 20, firstDeparture: '05:40', lastDeparture: '22:50' }),
  line('C5', 'Polígono – Rosaleda', 'cercanias', CERC[4], [
    'poligono', 'logistica', 'campanillas', 'plaza_comercial', 'feria', 'rosaleda', 'maria_zambrano',
  ], { frequencyMin: F.cerc, firstDeparture: '05:50', lastDeparture: '22:40' }),
  line('C6', 'Churriana – Hospital Este', 'cercanias', CERC[5], [
    'churriana', 'san_andres', 'perchel', 'plaza_mayor', 'victoria', 'limonar', 'hospital_este',
  ], { frequencyMin: 18, firstDeparture: '06:00', lastDeparture: '23:10' }),
  line('C7', 'PTA – Aeropuerto (directo tech)', 'cercanias', CERC[6], [
    'pta', 'campanillas', 'churriana', 'aeropuerto',
  ], { frequencyMin: 25, firstDeparture: '05:20', lastDeparture: '23:00' }),
  line('C8', 'Monte – Puerto', 'cercanias', CERC[7], [
    'monte_hel', 'ciudad_jardin', 'maria_zambrano', 'ctra_cadiz', 'puerto_hel',
  ], { frequencyMin: F.cerc, firstDeparture: '06:05', lastDeparture: '22:55' }),
  line('C9', 'Altos – Casco', 'cercanias', CERC[8], [
    'altos_med', 'cerrado', 'limonar', 'victoria', 'plaza_mayor', 'catedral',
  ], { frequencyMin: 18, firstDeparture: '06:15', lastDeparture: '23:05' }),
  line('C10', 'Cercanías Feria (estacional reforzada)', 'cercanias', CERC[9], [
    'universidad', 'feria', 'av_sol', 'paseo_maritimo', 'playa_faro',
  ], { frequencyMin: 12, firstDeparture: '07:00', lastDeparture: '02:00' }),
];

const tramLines: TransitLine[] = [
  line('T1', 'Casco Histórico', 'tranvia', TRAM[0], [
    'catedral', 'alcazaba', 'plaza_mayor', 'ayuntamiento', 'juderia', 'atarazanas',
    'perchel', 'maria_zambrano', 'plaza_mayor',
  ], { frequencyMin: F.tram, firstDeparture: '07:00', lastDeparture: '00:00' }),
  line('T2', 'Paseo Marítimo', 'tranvia', TRAM[1], [
    'puerto_deportivo', 'bajadilla', 'torres_mar', 'paseo_maritimo', 'muelle_uno',
    'palmeral', 'playa_faro', 'baños_carmen', 'cala_serena',
  ], { frequencyMin: F.tramCoast, firstDeparture: '07:15', lastDeparture: '00:30' }),
  line('T3', 'Universidad – Justicia', 'tranvia', TRAM[2], [
    'residencia_u', 'universidad', 'polideportivo_u', 'el_pastor', 'justicia',
    'ciudad_jardin', 'rosaleda',
  ], { frequencyMin: F.tram, firstDeparture: '06:45', lastDeparture: '23:30' }),
  line('T4', 'Cala – Arenales', 'tranvia', TRAM[3], [
    'paseo_cala', 'cala_serena', 'chiringuitos', 'mercado_arenales', 'arenales',
    'playa_arenales', 'rincon_mar',
  ], { frequencyMin: F.tramCoast, firstDeparture: '07:30', lastDeparture: '23:45' }),
  line('T5', 'Hospitalario', 'tranvia', TRAM[4], [
    'facultad_medicina', 'hospital_civil', 'materno', 'capuchinos', 'hospital_este', 'limonar',
  ], { frequencyMin: 7, firstDeparture: '06:30', lastDeparture: '22:45' }),
  line('T6', 'Soho Cultural', 'tranvia', TRAM[5], [
    'teatro_cervantes', 'soho', 'plaza_unos', 'victoria', 'cruz_humilladero',
    'plaza_mayor', 'ayuntamiento',
  ], { frequencyMin: F.tram, firstDeparture: '07:00', lastDeparture: '01:00' }),
  line('T7', 'Avenida del Sol', 'tranvia', TRAM[6], [
    'cc_miramar', 'av_sol', 'larios_sur', 'paseo_maritimo', 'soho', 'plaza_mayor',
  ], { frequencyMin: F.tram, firstDeparture: '07:00', lastDeparture: '23:50' }),
  line('T8', 'Campanillas – PTA', 'tranvia', TRAM[7], [
    'pta', 'smart_city', 'campanillas', 'ciudad_olivo', 'plaza_comercial', 'ikea_hel',
  ], { frequencyMin: 9, firstDeparture: '06:50', lastDeparture: '22:30' }),
  line('T9', 'Nueva Heliora Local', 'tranvia', TRAM[8], [
    'eco_barrio', 'nueva_hel', 'plaza_levante', 'tech_levante', 'int_ne', 'cerrado',
  ], { frequencyMin: 9, firstDeparture: '07:10', lastDeparture: '22:40' }),
  line('T10', 'Puerto – San Andrés', 'tranvia', TRAM[9], [
    'lonja', 'puerto_hel', 'muelles_carga', 'terminal_cruceros', 'san_andres', 'huelin', 'parque_oeste',
  ], { frequencyMin: F.tram, firstDeparture: '07:05', lastDeparture: '23:15' }),
  line('T11', 'Feria – Centro', 'tranvia', TRAM[10], [
    'parking_feria', 'feria', 'pabellones', 'av_sol', 'perchel', 'plaza_mayor',
  ], { frequencyMin: 8, firstDeparture: '07:00', lastDeparture: '00:00' }),
  line('T12', 'Monte Urbano', 'tranvia', TRAM[11], [
    'urbanizacion_pinares', 'monte_hel', 'mirador_monte', 'ciudad_jardin', 'jardin_botanico', 'parque_norte',
  ], { frequencyMin: 10, firstDeparture: '07:20', lastDeparture: '22:20' }),
];

function bus(
  code: string,
  name: string,
  family: BusFamily,
  stationIds: string[],
  frequencyMin: number,
  first: string,
  last: string,
): TransitLine {
  return line(code, name, 'bus', BUS_COLORS[family], stationIds, {
    frequencyMin,
    firstDeparture: first,
    lastDeparture: last,
    busFamily: family,
  });
}

const busLines: TransitLine[] = [
  // Universitario
  bus('U1', 'Campus – Casco', 'U', ['universidad', 'el_pastor', 'rosaleda', 'maria_zambrano', 'plaza_mayor'], F.busUni, '06:30', '23:00'),
  bus('U2', 'Campus – PTA', 'U', ['universidad', 'ciudad_olivo', 'campanillas', 'pta'], F.busUni, '06:45', '22:30'),
  bus('U3', 'Residencia – Hospital Civil', 'U', ['residencia_u', 'universidad', 'ciudad_jardin', 'hospital_civil'], F.busUni, '07:00', '22:00'),
  bus('U4', 'Campus – Playa (verano reforzado)', 'U', ['universidad', 'feria', 'av_sol', 'paseo_maritimo', 'playa_faro'], 12, '07:30', '01:00'),
  bus('U5', 'Polideportivo – Justicia', 'U', ['polideportivo_u', 'universidad', 'el_pastor', 'justicia'], F.busUni, '07:00', '21:30'),

  // Express
  bus('X1', 'Express Casco – Aeropuerto', 'X', ['plaza_mayor', 'perchel', 'int_so', 'churriana', 'aeropuerto'], F.busExpress, '05:30', '00:30'),
  bus('X2', 'Express Campus – Arenales', 'X', ['universidad', 'maria_zambrano', 'int_se', 'arenales'], F.busExpress, '06:00', '23:00'),
  bus('X3', 'Express Puerto – Nueva Heliora', 'X', ['puerto_hel', 'plaza_mayor', 'int_ne', 'nueva_hel'], F.busExpress, '06:15', '22:45'),
  bus('X4', 'Express PTA – María Zambrano', 'X', ['pta', 'plaza_comercial', 'maria_zambrano'], 12, '05:45', '23:30'),
  bus('X5', 'Express Torres – Rincón', 'X', ['torres_mar', 'paseo_maritimo', 'cala_serena', 'rincon_mar'], F.busExpress, '07:00', '23:15'),

  // Aeropuerto
  bus('A1', 'Aeropuerto – Plaza Mayor', 'A', ['aeropuerto', 'aeropuerto_t2', 'churriana', 'int_so', 'perchel', 'plaza_mayor'], F.busAirport, '04:45', '01:00'),
  bus('A2', 'Aeropuerto – Hotel Costa / Guadalmar', 'A', ['aeropuerto', 'guadalmar', 'hotel_costa', 'campo_golf', 'bajadilla'], 25, '05:30', '00:00'),
  bus('A3', 'Aeropuerto – Campus', 'A', ['aeropuerto', 'campanillas', 'universidad'], 25, '05:50', '23:00'),
  bus('A4', 'Aeropuerto – Cruceros', 'A', ['aeropuerto', 'puerto_hel', 'terminal_cruceros'], 20, '05:00', '23:30'),

  // Nocturno
  bus('N1', 'Búho Casco – Playa', 'N', ['plaza_mayor', 'soho', 'paseo_maritimo', 'playa_faro', 'cala_serena'], F.busNight, '23:30', '05:30'),
  bus('N2', 'Búho Campus – Centro', 'N', ['universidad', 'rosaleda', 'maria_zambrano', 'plaza_mayor', 'soho'], F.busNight, '23:45', '05:15'),
  bus('N3', 'Búho Puerto – Arenales', 'N', ['puerto_hel', 'torres_mar', 'paseo_maritimo', 'arenales'], 35, '00:00', '05:00'),
  bus('N4', 'Búho Feria (madrugada eventos)', 'N', ['feria', 'av_sol', 'plaza_mayor', 'soho', 'playa_faro'], 25, '22:00', '06:00'),

  // Orbital / Circular (O — no confundir con Cercanías C)
  bus('O1', 'Orbital Centro', 'O', ['plaza_mayor', 'catedral', 'victoria', 'soho', 'paseo_maritimo', 'perchel', 'plaza_mayor'], 10, '07:00', '23:30'),
  bus('O2', 'Orbital Hospitales', 'O', ['hospital_civil', 'rosaleda', 'capuchinos', 'hospital_este', 'limonar', 'hospital_civil'], 12, '06:45', '22:30'),
  bus('O3', 'Orbital Intercambiadores', 'O', ['int_no', 'int_ne', 'int_se', 'int_so', 'int_no'], 15, '06:30', '23:00'),

  // Playa
  bus('P1', 'Playa Express Faro – Rincón', 'P', ['playa_faro', 'baños_carmen', 'cala_serena', 'arenales', 'rincon_mar'], 12, '07:00', '00:30'),
  bus('P2', 'Playa Bajadilla – Faro', 'P', ['bajadilla', 'torres_mar', 'paseo_maritimo', 'playa_faro'], 12, '07:15', '00:00'),
  bus('P3', 'Chiringuitos Shuttle', 'P', ['cala_serena', 'chiringuitos', 'paseo_cala', 'baños_carmen'], 15, '10:00', '02:00'),
  bus('P4', 'Aquapark – Palmeral', 'P', ['aquapark', 'torres_mar', 'paseo_maritimo', 'palmeral'], 20, '09:00', '21:00'),

  // Turístico (TU — no confundir con Tranvía T)
  bus('TU1', 'Bus Turístico Casco (hop-on)', 'TU', ['plaza_mayor', 'catedral', 'alcazaba', 'paseo_maritimo', 'muelle_uno', 'playa_faro', 'plaza_mayor'], 20, '09:30', '20:00'),
  bus('TU2', 'Ruta Pueblos / Viñuela', 'TU', ['plaza_mayor', 'nueva_hel', 'pueblo_blanco', 'vinuela', 'embalse'], 40, '09:00', '19:00'),
  bus('TU3', 'Miradores del Monte', 'TU', ['plaza_mayor', 'ciudad_jardin', 'monte_hel', 'mirador_monte', 'altos_med'], 30, '10:00', '19:30'),

  // Hospitalario
  bus('H1', 'Hospital Civil – Campus Medicina', 'H', ['hospital_civil', 'materno', 'facultad_medicina', 'universidad'], 12, '06:00', '22:00'),
  bus('H2', 'Hospital Este – Capuchinos', 'H', ['hospital_este', 'limonar', 'capuchinos', 'hospital_civil'], 12, '06:15', '21:45'),
  bus('H3', 'Ambulatorio Arenales', 'H', ['arenales', 'mercado_arenales', 'int_se', 'hospital_este'], 15, '07:00', '21:00'),

  // Litoral
  bus('L1', 'Litoral Completo', 'L', ['guadalmar', 'bajadilla', 'torres_mar', 'paseo_maritimo', 'playa_faro', 'cala_serena', 'arenales', 'rincon_mar'], 15, '06:45', '23:30'),
  bus('L2', 'Litoral Oeste', 'L', ['aeropuerto', 'guadalmar', 'puerto_hel', 'bajadilla', 'torres_mar'], 15, '06:30', '23:00'),

  // Residencial
  bus('R1', 'Cerrado – Centro', 'R', ['cerrado', 'colegios_este', 'limonar', 'victoria', 'plaza_mayor'], F.busUrban, '06:40', '22:40'),
  bus('R2', 'Altos – Intercambiador NE', 'R', ['sierra_blanca', 'altos_med', 'club_golf_este', 'int_ne'], F.busUrban, '06:50', '22:20'),
  bus('R3', 'Ciudad Jardín – Pastor', 'R', ['parque_norte', 'ciudad_jardin', 'jardin_botanico', 'el_pastor', 'mercado_pastor'], F.busUrban, '07:00', '22:00'),
  bus('R4', 'Pinares – Rosaleda', 'R', ['urbanizacion_pinares', 'monte_hel', 'ciudad_jardin', 'rosaleda'], F.busUrban, '07:10', '21:50'),

  // Barrio
  bus('B1', 'El Perchel – Cruz Humilladero', 'B', ['perchel', 'atarazanas', 'cruz_humilladero', 'victoria', 'capuchinos'], F.busUrban, '06:35', '22:50'),
  bus('B2', 'San Andrés – Huelin', 'B', ['san_andres', 'huelin', 'parque_oeste', 'ctra_cadiz', 'el_torcal'], F.busUrban, '06:40', '22:30'),
  bus('B3', 'La Victoria Local', 'B', ['victoria', 'olletas', 'cruz_verde', 'capuchinos', 'plaza_unos'], F.busUrban, '07:00', '22:15'),
  bus('B4', 'Churriana Local', 'B', ['churriana', 'jardin_churriana', 'guadalmar', 'san_andres'], F.busUrban, '06:55', '22:00'),
  bus('B5', 'Campanillas Local', 'B', ['campanillas', 'nave_central', 'poligono', 'logistica', 'plaza_comercial'], F.busUrban, '06:30', '21:45'),
  bus('B6', 'Nueva Heliora Barrios', 'B', ['nueva_hel', 'eco_barrio', 'plaza_levante', 'tech_levante'], F.busUrban, '07:05', '22:10'),

  // Especial
  bus('E1', 'Feria de Agosto (especial)', 'E', ['universidad', 'feria', 'pabellones', 'av_sol', 'plaza_mayor', 'paseo_maritimo'], 8, '12:00', '04:00'),
  bus('E2', 'Partido Rosaleda (especial)', 'E', ['maria_zambrano', 'rosaleda', 'ciudad_deportiva', 'palacio_deportes', 'plaza_comercial'], 8, '14:00', '23:30'),
  bus('E3', 'Cruceristas Shuttle', 'E', ['terminal_cruceros', 'puerto_hel', 'paseo_maritimo', 'catedral', 'alcazaba'], 15, '08:00', '20:00'),
];

const hyperLines: TransitLine[] = [
  line('HL1', 'Hyperloop Aeropuerto – Casco', 'hyperloop', '#00BFA5', [
    'aeropuerto', 'maria_zambrano', 'plaza_mayor',
  ], { frequencyMin: F.hyper, firstDeparture: '06:00', lastDeparture: '00:00' }),
  line('HL2', 'Hyperloop Campus – Arenales', 'hyperloop', '#1DE9B6', [
    'universidad', 'plaza_mayor', 'arenales',
  ], { frequencyMin: F.hyper, firstDeparture: '06:30', lastDeparture: '23:30' }),
  line('HL3', 'Hyperloop Puerto – Nueva Heliora', 'hyperloop', '#64FFDA', [
    'puerto_hel', 'plaza_mayor', 'nueva_hel',
  ], { frequencyMin: 15, firstDeparture: '07:00', lastDeparture: '23:00' }),
];

/** Ampliación costa + sierra (v0.3) */
const coastalSierraExtra: TransitLine[] = [
  line('L21', 'Sierra – Casco', 'metro', '#795548', [
    'coin', 'alhaurin', 'arroyo_miel', 'mijas', 'monte_hel', 'ciudad_jardin',
    'capuchinos', 'plaza_mayor',
  ], { frequencyMin: 6, firstDeparture: '06:20', lastDeparture: '23:10' }),
  line('L22', 'Costa Levante Extendida', 'metro', '#00838F', [
    'paseo_maritimo', 'sacaba', 'paseo_levante', 'cala_serena', 'arenales',
    'rincon_mar', 'cala_sol',
  ], { frequencyMin: 5, firstDeparture: '06:30', lastDeparture: '00:20' }),
  line('L23', 'Marina – Puerto', 'metro', '#5C6BC0', [
    'puerto_marina', 'paseo_marina', 'torres_mar', 'bajadilla', 'puerto_hel',
  ], { frequencyMin: 6, firstDeparture: '06:40', lastDeparture: '23:40' }),
  line('C11', 'Cercanías Sierra', 'cercanias', '#4E342E', [
    'coin', 'cartama', 'boliches', 'universidad', 'maria_zambrano', 'plaza_mayor',
  ], { frequencyMin: 20, firstDeparture: '05:50', lastDeparture: '22:30' }),
  line('C12', 'Cercanías Pueblos Blancos', 'cercanias', '#BF360C', [
    'ojen', 'istan', 'mijas', 'altos_med', 'nueva_hel', 'vinuela',
  ], { frequencyMin: 25, firstDeparture: '06:10', lastDeparture: '21:50' }),
  line('T13', 'Tranvía Paseo Levante', 'tranvia', '#0097A7', [
    'sacaba', 'chiringuito_sur', 'paseo_levante', 'balneario', 'espigon',
    'cala_serena', 'chiringuitos',
  ], { frequencyMin: 9, firstDeparture: '07:20', lastDeparture: '00:15' }),
  line('T14', 'Tranvía Puerto Marina', 'tranvia', '#7B1FA2', [
    'darsena_yates', 'puerto_marina', 'paseo_marina', 'torres_mar', 'paseo_maritimo', 'muelle_uno',
  ], { frequencyMin: 9, firstDeparture: '07:15', lastDeparture: '23:50' }),
  bus('P5', 'Playa Sacaba – La Cala', 'P', [
    'sacaba', 'paseo_levante', 'arenales', 'rincon_mar', 'cala_sol', 'playa_cala',
  ], 12, '07:00', '00:45'),
  bus('P6', 'Puerto Marina Shuttle', 'P', [
    'puerto_marina', 'darsena_yates', 'torres_mar', 'paseo_maritimo', 'playa_faro',
  ], 15, '08:00', '01:00'),
  bus('R5', 'Sierra Residencial', 'R', [
    'mijas', 'casitas_blancas', 'arroyo_miel', 'pinillo', 'universidad',
  ], 15, '06:45', '22:15'),
  bus('R6', 'Valle Coín – Campus', 'R', [
    'coin', 'plaza_coin', 'alhaurin', 'cartama', 'ciudad_olivo', 'universidad',
  ], 18, '06:30', '21:45'),
  bus('TU4', 'Ruta Pueblos Blancos', 'TU', [
    'plaza_mayor', 'mijas', 'mirador_mijas', 'ojen', 'istan', 'embalse_istan',
  ], 45, '09:30', '18:30'),
  bus('B7', 'El Pinillo – Manantiales', 'B', [
    'pinillo', 'los_manantiales', 'arroyo_miel', 'alhaurin',
  ], 14, '07:00', '22:00'),
  bus('X6', 'Express Sierra – Aeropuerto', 'X', [
    'mijas', 'universidad', 'campanillas', 'aeropuerto',
  ], 20, '05:40', '23:00'),
  line('T15', 'Casco Histórico Denso', 'tranvia', '#A1887F', [
    'sinagoga', 'callejon_fresco', 'juderia', 'plaza_constitucion', 'calle_larios',
    'plaza_mayor', 'pasaje_chinitas', 'plaza_obispo', 'catedral', 'teatro_romano',
    'calle_granada', 'alameda_principal', 'plaza_marina',
  ], { frequencyMin: 7, firstDeparture: '07:00', lastDeparture: '00:30' }),
  line('L24', 'Ciudad Deportiva – Universidad', 'metro', '#FF6F00', [
    'piscinas_olimpicas', 'ciudad_deportiva_hel', 'pabellon_central', 'rosaleda',
    'palacio_deportes_est', 'el_pastor', 'colegio_mayor', 'universidad',
    'facultad_derecho', 'facultad_ciencias',
  ], { frequencyMin: 5, firstDeparture: '06:10', lastDeparture: '00:40' }),
  bus('U6', 'Facultades Shuttle', 'U', [
    'facultad_ciencias', 'facultad_derecho', 'cafeteria_campus', 'universidad',
    'biblioteca_campus', 'residencia_u', 'colegio_mayor',
  ], 8, '07:00', '22:30'),
  bus('B8', 'Casco a pie (lanzadera)', 'B', [
    'estacion_autobus', 'humilladero_centro', 'alameda_principal', 'plaza_mayor',
    'teatro_romano', 'alcazaba',
  ], 10, '07:00', '23:00'),
  bus('E4', 'Evento Deportivo', 'E', [
    'maria_zambrano', 'ciudad_deportiva_hel', 'pista_atletismo', 'piscinas_olimpicas',
    'palacio_deportes_est', 'rosaleda',
  ], 8, '10:00', '01:00'),
];

const rawLines = ensureMeta([
  ...metroLines,
  ...cercaniasLines,
  ...tramLines,
  ...busLines,
  ...hyperLines,
  ...coastalSierraExtra,
]);

const densified = densifyNetwork(baseStations, rawLines);
export const stations: Record<string, Station> = densified.stations;
export const lines: TransitLine[] = densified.lines;

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

export function getLineBounds(line: TransitLine) {
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

export function getMajorHubs(): Station[] {
  return getUniqueStations().filter((s) => s.majorHub);
}
