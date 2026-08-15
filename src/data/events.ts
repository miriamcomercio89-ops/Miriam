export interface EventDef {
  title: string
  body: string
  tone: 'good' | 'bad' | 'info'
  cash?: number
  qualityAll?: number
}

export function rollDailyEvent(day: number, nRest: number, cash: number): EventDef | null {
  if (day < 3) return null
  const r = Math.random()
  if (r > 0.22) return null
  const pool: EventDef[] = [
    {
      title: 'Crítico gastronómico',
      body: 'Una reseña nacional destaca vuestro local estrella. Sube la demanda un día.',
      tone: 'good',
      cash: Math.round(8000 + nRest * 40),
    },
    {
      title: 'Inspección sanitaria',
      body: 'Multas menores y revisiones. La calidad media se resiente un punto.',
      tone: 'bad',
      cash: -Math.round(3000 + nRest * 12),
      qualityAll: -1,
    },
    {
      title: 'Viral en redes',
      body: 'Un reel de tapas recorre el mundo. Colas inesperadas.',
      tone: 'good',
      cash: Math.round(12000 + nRest * 25),
    },
    {
      title: 'Huelga de reparto',
      body: 'El delivery se cae 24 h. Los dark kitchen lo notan.',
      tone: 'bad',
      cash: -Math.round(2000 + nRest * 18),
    },
    {
      title: 'Feria de turismo',
      body: 'Visitantes extra en ciudades OSM con alto turismo.',
      tone: 'good',
      cash: Math.round(5000 + nRest * 30),
    },
    {
      title: 'Subida de alquileres',
      body: 'Los caseros de centros históricos aprietan.',
      tone: 'bad',
      cash: -Math.round(4000 + nRest * 22),
    },
    {
      title: 'Cosecha de AOVE',
      body: 'Aceite de la Axarquía a buen precio. Márgenes de La Tasca mejoran.',
      tone: 'good',
      cash: Math.round(6000 + nRest * 8),
    },
    {
      title: 'Gripe estacional',
      body: 'Baja el cubierto en locales de oficina.',
      tone: 'bad',
      cash: -Math.round(2500 + nRest * 10),
    },
  ]
  if (cash < 0) {
    pool.push({
      title: 'El banco llama',
      body: 'Números rojos. Si no equilibráis, algunos locales tendrán que cerrar.',
      tone: 'bad',
    })
  }
  if (nRest >= 100) {
    pool.push({
      title: 'Cadena reconocida',
      body: 'Ya sois noticia internacional. Proveedores ofrecen mejores condiciones.',
      tone: 'good',
      cash: 25000,
    })
  }
  return pool[Math.floor(Math.random() * pool.length)]
}
