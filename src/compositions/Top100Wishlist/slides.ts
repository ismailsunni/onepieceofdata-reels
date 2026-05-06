// Editorial deck for the IG carousel. Each entry becomes one slide (PNG).
// Character lookups use `name` (matches `character.name` in Supabase). If a
// name doesn't resolve, fetch.ts logs a warning and the slide falls back to
// the supplied displayName + a placeholder portrait.

export type SlideSpec =
  | {
      kind: 'cover'
      title: string
      subtitle: string
      kicker: string
    }
  | {
      kind: 'character'
      name: string
      headline: string
      pitch: string
      /** Show the "ch. first → last" span badge under the portrait. */
      showSpan?: boolean
    }
  | {
      kind: 'pair'
      names: [string, string]
      groupName: string
      pitch: string
      /** Show "#N outside Straw Hats" badge under each portrait. */
      showRankExSHP?: boolean
    }
  | {
      kind: 'group'
      names: string[]
      groupName: string
      pitch: string
    }
  | {
      kind: 'honorable'
      names: string[]
      title: string
      subtitle: string
    }
  | {
      kind: 'cta'
      kicker: string
      title: string
      url: string
    }

export const SLIDES: SlideSpec[] = [
  {
    kind: 'cover',
    kicker: 'WT100 2026 · Wishlist',
    title: 'Should Be in the\nTop 100',
    subtitle: 'Characters Oda drew. Fans forgot.',
  },
  {
    kind: 'pair',
    names: ["Kin'emon", 'Kouzuki Momonosuke'],
    groupName: 'The Heart of Wano',
    pitch:
      "Boarded the Sunny at Punk Hazard and never left. Outside the Straw Hats themselves, almost nobody appears more.",
    showRankExSHP: true,
  },
  {
    kind: 'pair',
    names: ['Wapol', 'Foxy'],
    groupName: 'The Fun Enemies',
    pitch:
      "Wapol built the Evil Black Drum Kingdom from scratch — and got into the Reverie. Foxy: Slow-Slow trickster, Davy Back King. Comic villains who built whole arcs.",
  },
  {
    kind: 'character',
    name: 'Hatchan',
    headline: 'East Blue to Fish-Man Island',
    pitch:
      "From Arlong's crew (ch. 69) to a redeemed octopus chef (ch. 1168) — Hatchan's panels span the entire series. A Straw Hat ally before it was cool.",
    showSpan: true,
  },
  {
    kind: 'character',
    name: 'Capone Bege',
    headline: 'The Fortress Supernova',
    pitch:
      "Mafia boss, Castle-Castle body — and a family man. Married into the Charlottes for love, then ran the hit on his own mother-in-law to protect his wife and son. The Big Mom arc's smartest move.",
  },
  {
    kind: 'honorable',
    title: 'Honorable Mentions',
    subtitle: 'Belong to important groups — but not fan favourites.',
    names: [
      'Dorry',
      'Brogy',
      'Inuarashi',
      'Nekomamushi',
      'Queen',
      'Scratchmen Apoo',
      'Urouge',
      'Sengoku',
      'Sai',
      'Ideo',
      'Hajrudin',
      'Leo',
      'Orlumbus',
      'Crocus',
      'Wyper',
      'Morgans',
    ],
  },
  {
    kind: 'cta',
    kicker: 'WT100 2026 · Final Round',
    title: 'Vote for the snubbed.',
    url: 'onepiecewt100-2026.com',
  },
]
