import type { LocationInsight, Subsidiary } from '../types'

export type SiteFit = {
  score: number
  level: 'excelente' | 'buena' | 'media' | 'baja' | 'mala'
  warnings: string[]
  tips: string[]
}

/** Afinidad marca ↔ solar (0–100) con avisos claros. */
export function evaluateSiteFit(sub: Subsidiary, loc: LocationInsight): SiteFit {
  const warnings: string[] = []
  const tips: string[] = []
  let score = 55

  const beachNeed = sub.beachAffinity
  const beach = loc.beachScore / 100
  if (beachNeed >= 0.85) {
    score += beach * 28
    if (beach < 0.45) {
      warnings.push('Marca muy playera en un sitio con poca costa / playa.')
      score -= 22
    } else if (beach < 0.65) {
      warnings.push('La marca pide más costa de la que ofrece este solar.')
      score -= 10
    } else {
      tips.push('Buen encaje costero para esta marca.')
    }
  } else if (beachNeed <= 0.25) {
    score += (1 - beach) * 12
    if (beach > 0.75 && sub.imageStyle === 'urban') {
      warnings.push('Marca urbana en primera línea de playa: puede encarecer sin aportar demanda de costa.')
      score -= 8
    }
  } else {
    score += beach * beachNeed * 18
  }

  if (sub.imageStyle === 'urban' || sub.targets.includes('negocios')) {
    if (loc.tourismIndex < 45 && loc.beachScore < 40) {
      tips.push('Solar discreto: mira costes y fama del país.')
    }
    if (/airport|aeropuerto/i.test(sub.id) || sub.id === 'airport-gate') {
      if (loc.tourismIndex > 85 && loc.beachScore > 70) {
        warnings.push('Orbis Airport Gate rinde mejor cerca de hubs, no en resort puro.')
        score -= 12
      }
    }
  }

  if (sub.imageStyle === 'luxury' || sub.minStars >= 4) {
    if (loc.costIndex < 0.75) {
      tips.push('Mercado de obra barato: el lujo puede destacar… o sobrar.')
      score += 4
    }
    if (loc.tourismIndex < 50) {
      warnings.push('Lujo en destino de demanda media-baja: ocupación más frágil.')
      score -= 10
    }
  }

  if (sub.targets.includes('negocios') && loc.beachScore > 80 && !sub.targets.includes('playa')) {
    warnings.push('Público de negocios en destino muy vacacional.')
    score -= 8
  }

  if (sub.targets.includes('playa') && loc.beachScore < 40) {
    warnings.push('Clientela de playa poco alineada con este solar.')
    score -= 14
  }

  if (sub.targets.includes('aventura') && Math.abs(loc.lat) < 15 && loc.beachScore < 30) {
    tips.push('Clima tropical: revisa si la oferta adventure encaja con la ciudad.')
  }

  if (loc.tourismIndex >= 80) {
    score += 8
    tips.push('Destino de alta demanda internacional.')
  } else if (loc.tourismIndex <= 40) {
    score -= 6
    warnings.push('Turismo local flojo: el precio IA será más conservador.')
  }

  if (loc.costIndex >= 1.3) {
    tips.push('Solar caro: la obra se dispara.')
    score -= 4
  }

  // Stars vs market
  if (sub.maxStars <= 3 && loc.tourismIndex >= 85) {
    tips.push('Marca select en destino top: volumen sí, tarifa premium limitada.')
  }

  score = Math.max(8, Math.min(98, Math.round(score)))
  const level =
    score >= 80 ? 'excelente' : score >= 65 ? 'buena' : score >= 50 ? 'media' : score >= 35 ? 'baja' : 'mala'

  if (warnings.length === 0 && score >= 70) {
    tips.push('Encaje sólido marca–ubicación.')
  }

  return { score, level, warnings, tips }
}
