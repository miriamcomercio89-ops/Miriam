import { v4 as uuid } from 'uuid'
import { SUBSIDIARIES } from '../data/subsidiaries'
import { defaultImageKey } from './images'
import type { Hotel } from '../types'

/** Ciudades reales para generar hoteles de prueba rápido */
const DEMO_CITIES: { city: string; country: string; cc: string; lat: number; lng: number; tourism: number; beach: number; cost: number; tax: number; geo: string }[] = [
  { city: 'Barcelona', country: 'España', cc: 'ES', lat: 41.39, lng: 2.17, tourism: 88, beach: 72, cost: 1.05, tax: 0.12, geo: 'med' },
  { city: 'Madrid', country: 'España', cc: 'ES', lat: 40.42, lng: -3.7, tourism: 84, beach: 10, cost: 1.05, tax: 0.12, geo: 'med' },
  { city: 'París', country: 'Francia', cc: 'FR', lat: 48.86, lng: 2.35, tourism: 92, beach: 5, cost: 1.18, tax: 0.14, geo: 'europe' },
  { city: 'Roma', country: 'Italia', cc: 'IT', lat: 41.9, lng: 12.5, tourism: 90, beach: 20, cost: 1.08, tax: 0.13, geo: 'med' },
  { city: 'Atenas', country: 'Grecia', cc: 'GR', lat: 37.98, lng: 23.73, tourism: 86, beach: 55, cost: 0.92, tax: 0.13, geo: 'med' },
  { city: 'Lisboa', country: 'Portugal', cc: 'PT', lat: 38.72, lng: -9.14, tourism: 85, beach: 60, cost: 0.95, tax: 0.11, geo: 'med' },
  { city: 'Cancún', country: 'México', cc: 'MX', lat: 21.16, lng: -86.85, tourism: 90, beach: 95, cost: 0.75, tax: 0.12, geo: 'caribbean' },
  { city: 'Miami', country: 'EE.UU.', cc: 'US', lat: 25.76, lng: -80.19, tourism: 88, beach: 90, cost: 1.28, tax: 0.1, geo: 'americas' },
  { city: 'Nueva York', country: 'EE.UU.', cc: 'US', lat: 40.71, lng: -74.0, tourism: 93, beach: 15, cost: 1.35, tax: 0.1, geo: 'americas' },
  { city: 'Dubái', country: 'EAU', cc: 'AE', lat: 25.2, lng: 55.27, tourism: 91, beach: 80, cost: 1.22, tax: 0.05, geo: 'mideast' },
  { city: 'Bangkok', country: 'Tailandia', cc: 'TH', lat: 13.76, lng: 100.5, tourism: 89, beach: 25, cost: 0.72, tax: 0.08, geo: 'seasia' },
  { city: 'Bali', country: 'Indonesia', cc: 'ID', lat: -8.34, lng: 115.09, tourism: 90, beach: 92, cost: 0.65, tax: 0.08, geo: 'seasia' },
  { city: 'Tokio', country: 'Japón', cc: 'JP', lat: 35.68, lng: 139.69, tourism: 90, beach: 20, cost: 1.25, tax: 0.1, geo: 'eastasia' },
  { city: 'Sídney', country: 'Australia', cc: 'AU', lat: -33.87, lng: 151.21, tourism: 87, beach: 85, cost: 1.22, tax: 0.1, geo: 'oceania' },
  { city: 'Ciudad del Cabo', country: 'Sudáfrica', cc: 'ZA', lat: -33.92, lng: 18.42, tourism: 82, beach: 75, cost: 0.8, tax: 0.1, geo: 'africa' },
  { city: 'Londres', country: 'Reino Unido', cc: 'GB', lat: 51.51, lng: -0.13, tourism: 91, beach: 5, cost: 1.25, tax: 0.13, geo: 'europe' },
  { city: 'Berlín', country: 'Alemania', cc: 'DE', lat: 52.52, lng: 13.4, tourism: 82, beach: 5, cost: 1.15, tax: 0.11, geo: 'europe' },
  { city: 'Río de Janeiro', country: 'Brasil', cc: 'BR', lat: -22.91, lng: -43.17, tourism: 86, beach: 93, cost: 0.8, tax: 0.1, geo: 'americas' },
  { city: 'Marrakech', country: 'Marruecos', cc: 'MA', lat: 31.63, lng: -8.0, tourism: 80, beach: 15, cost: 0.7, tax: 0.1, geo: 'africa' },
  { city: 'Maldivas', country: 'Maldivas', cc: 'MV', lat: 4.17, lng: 73.51, tourism: 94, beach: 98, cost: 1.35, tax: 0.08, geo: 'seasia' },
]

export function generateDemoHotels(count: number, gameDayNow: number): Hotel[] {
  const out: Hotel[] = []
  for (let i = 0; i < count; i++) {
    const place = DEMO_CITIES[i % DEMO_CITIES.length]
    const sub = SUBSIDIARIES[i % SUBSIDIARIES.length]
    const jitterLat = ((i * 17) % 100) / 1000 - 0.05
    const jitterLng = ((i * 29) % 100) / 1000 - 0.05
    const rooms = 60 + (i % 20) * 15
    const stars = Math.min(sub.maxStars, Math.max(sub.minStars, 2 + (i % 4)))
    const hotel: Hotel = {
      id: uuid(),
      name: `${sub.name.replace('Orbis ', '')} Demo ${place.city} ${Math.floor(i / DEMO_CITIES.length) + 1}`,
      subsidiaryId: sub.id,
      lat: place.lat + jitterLat,
      lng: place.lng + jitterLng,
      stars,
      rooms,
      pricePerNight: 80 + stars * 40 + (i % 30),
      services: ['wifi_premium', 'restaurante', 'parking'],
      staffLevel: i % 3 === 0 ? 'premium' : 'estandar',
      target: sub.targets[0],
      imageKey: defaultImageKey(sub.id),
      country: place.country,
      countryCode: place.cc,
      city: place.city,
      region: '',
      tourismIndex: place.tourism,
      beachScore: place.beach,
      costIndex: place.cost,
      taxRate: place.tax,
      geoRegion: place.geo,
      builtAtGameDay: gameDayNow,
      constructionCost: rooms * (40_000 + stars * 20_000),
      lastDayRevenue: 0,
      lastDayCosts: 0,
      lastDayOccupancy: 0,
      lastDayTax: 0,
      lifetimeRevenue: 0,
      lifetimeCosts: 0,
      lifetimeGuests: 0,
      lifetimeTax: 0,
      satisfaction: 65 + (i % 20),
      contract: null,
      insurance: null,
      roomMix: 'estandar',
      buildQuality: 'bueno',
      floors: 3 + (i % 8),
      greenLevel: 'basico',
      meetingRooms: i % 4,
      parkingSpots: 20 + (i % 10) * 5,
      restaurantLevel: 1 + (i % 3),
      openingPromoDays: 0,
      securityLevel: 'medio',
      techLevel: 'moderno',
      breakfastIncluded: true,
      seaViewShare: place.beach > 50 ? 40 : 5,
      loyaltyProgram: i % 5 === 0,
      vipTonight: false,
      lastVipDay: 0,
      boardRegime: i % 7 === 0 ? 'ti' : i % 3 === 0 ? 'desayuno' : 'solo',
      availableRegimes:
        i % 7 === 0
          ? ['ti', 'ti_premium', 'completa', 'media']
          : i % 3 === 0
            ? ['solo', 'desayuno', 'media']
            : ['solo', 'desayuno'],
      condition: 70 + (i % 30),
      lastRenovationDay: 0,
      designFocus: (['vistas', 'silencio', 'fiesta', 'trabajo', 'familia'] as const)[i % 5],
      buffetType: (['ninguno', 'continental', 'americano', 'tematico', 'gourmet'] as const)[i % 5],
      barType: (['ninguno', 'lobby', 'azotea', 'cocteleria', 'beach_bar', 'varios'] as const)[i % 6],
      restaurantConcept: (['ninguno', 'buffet', 'a_la_carta', 'gourmet', 'tematico', 'mixto'] as const)[i % 6],
      lateCheckout: i % 3 === 0,
      airportDesk: i % 7 === 0,
      quietHours: i % 4 === 0,
      bikeRental: i % 5 === 0,
      shuttleCity: i % 6 === 0,
      priceManual: false,
      closed: false,
    }
    out.push(hotel)
  }
  return out
}
