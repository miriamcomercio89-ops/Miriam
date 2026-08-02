/** Utilidad de prompts para logos de marca Orbis (generación IA). */
export type BrandLogoBrief = {
  id: string
  name: string
  specialty: string
  imageStyle: string
  color: string
  accent: string
}

/** Motivo único por filial (id estable). */
const MOTIFS: Record<string, string> = {
  'azure-coast': 'circular seal with layered azure waves, rising sun disc, twin palm silhouettes framing a horizon line',
  'marina-bay': 'nautical crest with stylized yacht mast, rope ring border, marina pier silhouette and compass rose',
  'palm-collection': 'lush palm frond monogram inside a soft tropical badge, coconuts and curved fronds in layered greens',
  'coral-keys': 'coral branch and reef fish motif inside an island key badge, soft coral pink and aqua glass effect',
  'dune-resorts': 'desert dune curves with a crescent moon and wind-carved sand ridges, warm mineral luxury seal',
  lagoon: 'still lagoon oval with lily pads, reflected sky bands and a gentle crescent bay shoreline',
  'surf-house': 'dynamic surfboard and breaking wave crest, bold lifestyle badge with spray dots and board silhouette',
  tide: 'editorial boutique mark with rising tide lines, shell spiral and refined coastal geometry',
  'horizon-club': 'exclusive club crest with gold horizon bar, diamond spark accents and midnight navy shield',
  sail: 'yacht sail triangle and helm wheel combined into a refined nautical emblem',
  breeze: 'playful family beach badge with kite, soft wave and sunny orb, cheerful rounded geometry',
  cape: 'lighthouse on a rocky cape silhouette inside a cliffside badge, warm beacon light',
  'reef-lodge': 'eco marine lodge mark with turtle shell geometry, soft kelp curves and leaf-like reef shapes',
  'sunset-inn': 'golden hour sun dipping into sea with warm gradient rays and soft coastal inn silhouette',
  pearl: 'lustrous pearl inside an urban coastal crest, soft metallic sheen and elegant oval frame',
  harbor: 'harbor crane and waterfront pier line forming a modern port emblem',
  'island-house': 'private island villa silhouette under a soft moon, palm and lagoon crescent frame',
  coastline: 'global coast chain mark with linked wave arcs and subtle world meridian accents',
  bayfront: 'urban bay skyline reflected on water, modern city-meets-tide badge',
  atlantica: 'open Atlantic swell crest with bold deep-blue wave and wind lines',
  mediterranea: 'Mediterranean villa arch, olive branch and terracotta sun disc in a classic coastal seal',
  pacific: 'long Pacific sunset arc with deep indigo sea and luminous cyan light trail',
  caribbean: 'Caribbean rhythm badge with steel-drum curve, palm and coral sunburst',
  'nordic-fjord': 'fjord cliff and cold water reflection, aurora whisper and pine silhouette',
  'alpine-lake': 'mirror alpine lake with twin peaks and soft mist rings',
  'city-grand': 'grand urban hotel crest with classical pediment and gold skyline finial',
  'business-hub': 'precise business hub mark with abstract meeting-room geometry and upward arrow node',
  'airport-gate': 'stylized departure gate and aircraft trail forming a clean transit emblem',
  'spa-sanctum': 'spa sanctuary lotus and water droplet inside a soft violet wellness seal',
  'family-village': 'friendly village resort badge with playful sun, path and house silhouette',
  'boutique-noir': 'ultra-minimal black boutique monogram frame with silver edge and art-deco line',
  heritage: 'historic building pediment and key motif in a heritage burgundy seal',
  garden: 'courtyard garden gate with climbing vines and botanical leaf wreath',
  skyline: 'towering skyline needle with amber window lights and vertical city mark',
  retreat: 'remote cabin under forest canopy with quiet path and soft mist badge',
  adventure: 'trail basecamp mark with mountain peak, compass needle and bold backpack silhouette',
  'golf-links': 'golf flag on undulating green links with elegant club-head curve',
  'casino-royale': 'royal casino crest with diamond suit, velvet night field and gold ornate border',
  allsuite: 'suite key and soft purple gem forming a premium all-suite emblem',
  select: 'clean select-service hexagon with smart check geometry and modern blue planes',
  residence: 'residential living mark with soft apartment window grid and warm hearth accent',
  congress: 'congress hall arches and stage geometry with bold event capacity mark',
  'art-house': 'art gallery frame with abstract brush stroke and cultural house badge',
  vineyard: 'grape cluster and vine tendril around a wine-country crest',
  thermal: 'thermal spring steam rings and mineral water droplet in a spa blue seal',
  'safari-coast': 'acacia tree and coastal tide line combined into a safari-to-sea emblem',
  'polar-light': 'aurora borealis arcs over icy coastline with crystalline star points',
  'jungle-canopy': 'jungle canopy layers and hanging vine forming a deep eco lodge mark',
  'desert-mirage': 'mirage oasis palms and sand dune crescent in a luxury desert seal',
  'world-collection': 'flagship Orbis globe crest with gold meridian ring and premium hotel star',
}

export function brandLogoPrompt(b: BrandLogoBrief): string {
  const motif = MOTIFS[b.id] ?? `${b.imageStyle} hospitality emblem for ${b.specialty}`

  return [
    'Square professional hotel brand logo emblem, centered icon composition, rich illustrated badge,',
    `${motif},`,
    `theme: ${b.specialty}, brand feel for ${b.name},`,
    `MUST use primary brand color ${b.color} as the dominant field and accent color ${b.accent} for highlights, trim and light,`,
    'layered depth, soft premium lighting, high detail craftsmanship, polished vector-like edges,',
    'NO readable text, NO letters, NO numbers, NO watermark, NO photoreal building facade as the whole logo,',
    'app-icon friendly, solid elegant background matching the brand palette, not flat generic purple.',
  ].join(' ')
}

/** Ruta pública del logo de marca (generado por IA). */
export function brandLogoPublicPath(id: string): string {
  return `./marcas/logos/${id}.jpg`
}
