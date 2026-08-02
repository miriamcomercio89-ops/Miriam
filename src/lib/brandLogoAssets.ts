/** Utilidad de prompts para logos de marca Orbis (generación IA). */
export type BrandLogoBrief = {
  id: string
  name: string
  specialty: string
  imageStyle: string
  color: string
  accent: string
}

export function brandLogoPrompt(b: BrandLogoBrief): string {
  const styleHint =
    b.imageStyle === 'coast'
      ? 'coastal resort emblem with stylized sea waves, horizon and soft sun, turquoise and sand tones'
      : b.imageStyle === 'urban'
        ? 'urban hospitality emblem with elegant skyline silhouette and modern geometry'
        : b.imageStyle === 'nature'
          ? 'nature lodge emblem with mountains or canopy leaves, organic shapes'
          : b.imageStyle === 'luxury'
            ? 'luxury hotel seal emblem with gold accents, refined crest, premium minimal ornament'
            : b.imageStyle === 'family'
              ? 'warm family resort emblem, friendly rounded forms, bright welcoming colors'
              : 'adventure travel emblem with peaks, compass or trail motif, bold outdoor energy'

  return [
    'Square professional hotel brand logo emblem, centered icon composition,',
    styleHint + ',',
    `theme: ${b.specialty},`,
    `primary color ${b.color}, accent ${b.accent},`,
    'rich illustrated badge suitable for a hotel chain, soft lighting, high detail,',
    'NO readable text, NO letters, NO watermark, NO photo of a real building facade as the whole logo,',
    'clean edges, app-icon friendly, solid elegant background.',
  ].join(' ')
}

/** Ruta pública del logo de marca (generado por IA). */
export function brandLogoPublicPath(id: string): string {
  return `./marcas/logos/${id}.jpg`
}
