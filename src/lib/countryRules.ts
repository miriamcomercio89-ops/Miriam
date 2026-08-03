/** Reglas locales por país: impuestos, tasa turística, tasa verde y notas. */

export type CountryRules = {
  taxRate: number
  /** € por habitación ocupada / noche (city tax / tasa turística) */
  touristTaxPerNight: number
  /** Tasa verde / eco-turística €/hab. noche (compat: se deriva si falta). */
  greenTaxPerNight?: number
  rules: string[]
}

const DEFAULT: CountryRules = {
  taxRate: 0.1,
  touristTaxPerNight: 1.5,
  greenTaxPerNight: 0.5,
  rules: ['Impuesto hotelero estándar', 'Tasa turística moderada', 'Tasa verde básica'],
}

const RULES: Record<string, CountryRules> = {
  ES: {
    taxRate: 0.12,
    touristTaxPerNight: 2.5,
    rules: ['IVA reducido hostelero', 'Tasa turística municipal', 'Alta estacionalidad costa'],
  },
  FR: {
    taxRate: 0.14,
    touristTaxPerNight: 3.2,
    rules: ['TVA hôtelière', 'Taxe de séjour por estrella', 'Normativa laboral estricta'],
  },
  IT: {
    taxRate: 0.13,
    touristTaxPerNight: 3.5,
    rules: ['IVA alberghi', 'Tassa di soggiorno comunal', 'Ciudades arte con tope de plazas'],
  },
  DE: {
    taxRate: 0.11,
    touristTaxPerNight: 2.0,
    rules: ['MwSt. hoteles', 'City tax en grandes ciudades', 'Mercado MICE fuerte'],
  },
  PT: {
    taxRate: 0.11,
    touristTaxPerNight: 2.0,
    rules: ['IVA turismo', 'Taxa turística local', 'Costa atlántica en auge'],
  },
  GR: {
    taxRate: 0.13,
    touristTaxPerNight: 2.8,
    rules: ['IVA islas variable', 'Climate crisis resilience fee', 'Temporada corta intensa'],
  },
  GB: {
    taxRate: 0.13,
    touristTaxPerNight: 2.2,
    rules: ['VAT hoteles', 'Congestion / city levy', 'Mercado de negocios estable'],
  },
  US: {
    taxRate: 0.1,
    touristTaxPerNight: 4.0,
    rules: ['Sales + occupancy tax', 'Resort fee habitual', 'Mercado caro de personal'],
  },
  AE: {
    taxRate: 0.05,
    touristTaxPerNight: 5.5,
    rules: ['VAT bajo', 'Tourism dirham / municipality fee', 'Lujo y MICE'],
  },
  SG: {
    taxRate: 0.08,
    touristTaxPerNight: 3.0,
    rules: ['GST', 'Hotel licensing estricto', 'Hub de escala Asia'],
  },
  CH: {
    taxRate: 0.09,
    touristTaxPerNight: 3.8,
    rules: ['IVA reducido', 'Kurtaxe / taxe de séjour', 'Costes de obra muy altos'],
  },
  JP: {
    taxRate: 0.1,
    touristTaxPerNight: 2.5,
    rules: ['Consumption tax', 'Accommodation tax en megaciudades', 'Servicio impecable esperado'],
  },
  MX: {
    taxRate: 0.12,
    touristTaxPerNight: 2.0,
    rules: ['IVA + ISH', 'Derecho de saneamiento turístico', 'Sol y playa dominante'],
  },
  TH: {
    taxRate: 0.08,
    touristTaxPerNight: 1.2,
    rules: ['VAT turismo', 'Tasa aeroportuaria / hotel', 'Alta competencia resort'],
  },
  HR: {
    taxRate: 0.12,
    touristTaxPerNight: 1.8,
    rules: ['VAT temporada', 'Boravišna pristojba', 'Costa adriática saturada en verano'],
  },
  NL: {
    taxRate: 0.12,
    touristTaxPerNight: 4.5,
    rules: ['BTW', 'Toeristenbelasting alta en Ámsterdam', 'Límites de alquiler corto'],
  },
  TR: {
    taxRate: 0.1,
    touristTaxPerNight: 1.5,
    rules: ['KDV turismo', 'Tasa de alojamiento', 'Todo incluido competitivo'],
  },
  BR: {
    taxRate: 0.1,
    touristTaxPerNight: 1.8,
    rules: ['ISS municipal', 'Taxa de turismo variable', 'Mercado interno fuerte'],
  },
  AU: {
    taxRate: 0.1,
    touristTaxPerNight: 2.4,
    rules: ['GST', 'Bed tax en algunos estados', 'Costes laborales altos'],
  },
  CA: {
    taxRate: 0.11,
    touristTaxPerNight: 3.0,
    rules: ['GST/HST + provincial', 'Municipal accommodation tax', 'Temporada invierno/verano'],
  },
  ID: {
    taxRate: 0.08,
    touristTaxPerNight: 1.0,
    rules: ['PPN turismo', 'Tasa local de destino', 'Bali con reglas propias'],
  },
  MV: {
    taxRate: 0.12,
    touristTaxPerNight: 6.0,
    rules: ['TGST', 'Green tax por persona', 'Modelo isla-resort'],
  },
  SC: {
    taxRate: 0.12,
    touristTaxPerNight: 5.0,
    rules: ['VAT turismo', 'Tourism environmental levy', 'Lujo aislado'],
  },
  MA: {
    taxRate: 0.1,
    touristTaxPerNight: 1.5,
    rules: ['TVA hôtelière', 'Taxe de séjour', 'Ciudades imperiales + costa'],
  },
  EG: {
    taxRate: 0.09,
    touristTaxPerNight: 1.2,
    rules: ['VAT', 'City service charge', 'Mar Rojo y culturales'],
  },
  NO: {
    taxRate: 0.12,
    touristTaxPerNight: 2.5,
    rules: ['MVA', 'Sin city tax general', 'Costes nórdicos altos'],
  },
  SE: {
    taxRate: 0.12,
    touristTaxPerNight: 2.2,
    rules: ['Moms', 'Turistskatt local puntual', 'Sostenibilidad exigida'],
  },
  AT: {
    taxRate: 0.11,
    touristTaxPerNight: 2.8,
    rules: ['USt.', 'Ortstaxe / Kurtaxe', 'Alpes y congresos'],
  },
  PL: {
    taxRate: 0.1,
    touristTaxPerNight: 1.4,
    rules: ['VAT hoteles', 'Opłata miejscowa', 'Crecimiento urbano'],
  },
  CZ: {
    taxRate: 0.11,
    touristTaxPerNight: 1.6,
    rules: ['DPH', 'Local stay fee', 'Praga muy turística'],
  },
  KR: {
    taxRate: 0.1,
    touristTaxPerNight: 2.0,
    rules: ['VAT', 'Special tourism tax puntual', 'Negocios + K-culture'],
  },
  HK: {
    taxRate: 0.08,
    touristTaxPerNight: 3.5,
    rules: ['Sin VAT clásico', 'Hotel accommodation tax', 'Hub premium'],
  },
  NZ: {
    taxRate: 0.11,
    touristTaxPerNight: 2.0,
    rules: ['GST', 'IVL turista internacional', 'Naturaleza como producto'],
  },
  IE: {
    taxRate: 0.12,
    touristTaxPerNight: 2.5,
    rules: ['VAT turismo', 'Local hotel tax debates', 'Dublín caro'],
  },
  BE: {
    taxRate: 0.12,
    touristTaxPerNight: 3.0,
    rules: ['TVA', 'Taxe de séjour comunal', 'Bruselas MICE'],
  },
  DK: {
    taxRate: 0.13,
    touristTaxPerNight: 2.0,
    rules: ['Moms alto', 'Sin city tax general', 'Coste de vida alto'],
  },
  FI: {
    taxRate: 0.12,
    touristTaxPerNight: 1.8,
    rules: ['ALV', 'Tasa local baja', 'Turismo naturaleza'],
  },
  IS: {
    taxRate: 0.12,
    touristTaxPerNight: 3.0,
    rules: ['VSK', 'Lodging tax', 'Capacidad limitada'],
  },
  MT: {
    taxRate: 0.11,
    touristTaxPerNight: 2.0,
    rules: ['VAT', 'Eco contribution', 'Isla compacta'],
  },
  CY: {
    taxRate: 0.11,
    touristTaxPerNight: 2.2,
    rules: ['VAT', 'City tax hotelera', 'Sol mediterráneo'],
  },
  DO: {
    taxRate: 0.1,
    touristTaxPerNight: 2.5,
    rules: ['ITBIS', 'Tax turístico', 'Todo incluido Caribe'],
  },
  CU: {
    taxRate: 0.1,
    touristTaxPerNight: 1.5,
    rules: ['Impuestos turísticos', 'Divisa y suministros', 'Patrimonio + playa'],
  },
  JM: {
    taxRate: 0.1,
    touristTaxPerNight: 2.0,
    rules: ['GCT', 'Room tax', 'Resort costeño'],
  },
  AR: {
    taxRate: 0.12,
    touristTaxPerNight: 1.5,
    rules: ['IVA', 'Tasa turística CABA', 'Inflación relevante'],
  },
  CL: {
    taxRate: 0.11,
    touristTaxPerNight: 1.8,
    rules: ['IVA', 'Derechos municipales', 'Naturaleza extremo'],
  },
  PE: {
    taxRate: 0.11,
    touristTaxPerNight: 1.5,
    rules: ['IGV', 'Impuesto albergue', 'Cultura + costa'],
  },
  CO: {
    taxRate: 0.11,
    touristTaxPerNight: 1.6,
    rules: ['IVA turismo', 'Sobretasa hotelera', 'Ciudades + Caribe'],
  },
  ZA: {
    taxRate: 0.1,
    touristTaxPerNight: 1.4,
    rules: ['VAT', 'Tourism levy', 'Safari + ciudad'],
  },
  KE: {
    taxRate: 0.1,
    touristTaxPerNight: 1.2,
    rules: ['VAT', 'Training levy turismo', 'Safari + costa'],
  },
  VN: {
    taxRate: 0.08,
    touristTaxPerNight: 1.0,
    rules: ['VAT', 'Tasa local destino', 'Crecimiento rápido'],
  },
  PH: {
    taxRate: 0.09,
    touristTaxPerNight: 1.2,
    rules: ['VAT', 'Local travel tax', 'Islas y resorts'],
  },
  IN: {
    taxRate: 0.12,
    touristTaxPerNight: 1.5,
    rules: ['GST tramos', 'Luxury tax puntual', 'Mercado interno enorme'],
  },
  CN: {
    taxRate: 0.09,
    touristTaxPerNight: 1.8,
    rules: ['VAT', 'City construction tax', 'Negocios + ocio'],
  },
  SA: {
    taxRate: 0.08,
    touristTaxPerNight: 4.0,
    rules: ['VAT', 'Tourism levy Vision 2030', 'Nuevos destinos'],
  },
  QA: {
    taxRate: 0.05,
    touristTaxPerNight: 3.5,
    rules: ['VAT bajo', 'Municipality fee', 'Eventos y lujo'],
  },
  HU: {
    taxRate: 0.11,
    touristTaxPerNight: 1.8,
    rules: ['ÁFA', 'Idegenforgalmi adó', 'Budapest turística'],
  },
  LU: {
    taxRate: 0.1,
    touristTaxPerNight: 2.5,
    rules: ['TVA', 'Taxe de séjour', 'Negocios compacto'],
  },
  MY: {
    taxRate: 0.08,
    touristTaxPerNight: 1.4,
    rules: ['SST turismo', 'Tourism tax local', 'Hub SE Asia · resorts'],
  },
  RO: {
    taxRate: 0.1,
    touristTaxPerNight: 1.3,
    rules: ['TVA', 'Taxă hotelieră locală', 'Crecimiento urbano y costa'],
  },
  SK: {
    taxRate: 0.11,
    touristTaxPerNight: 1.5,
    rules: ['DPH', 'Local stay fee', 'Termas y montaña'],
  },
  BG: {
    taxRate: 0.1,
    touristTaxPerNight: 1.2,
    rules: ['ДДС', 'Tourist tax municipal', 'Costa del Mar Negro'],
  },
}

export function getCountryRules(countryCode: string): CountryRules {
  const cc = (countryCode || 'XX').toUpperCase()
  const raw = RULES[cc] ?? DEFAULT
  const green =
    raw.greenTaxPerNight ?? Math.round(Math.max(0.3, raw.touristTaxPerNight * 0.35) * 10) / 10
  return { ...raw, greenTaxPerNight: green }
}

export function countryTaxRate(countryCode: string): number {
  return getCountryRules(countryCode).taxRate
}

export function formatTouristTax(countryCode: string): string {
  const n = getCountryRules(countryCode).touristTaxPerNight
  return `${n.toLocaleString('es-ES', { minimumFractionDigits: n % 1 ? 1 : 0, maximumFractionDigits: 1 })} €/hab.`
}

export function formatGreenTax(countryCode: string): string {
  const n = getCountryRules(countryCode).greenTaxPerNight ?? 0
  return `${n.toLocaleString('es-ES', { minimumFractionDigits: n % 1 ? 1 : 0, maximumFractionDigits: 1 })} €/hab.`
}
