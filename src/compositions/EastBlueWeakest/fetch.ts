import { supabase } from '../../lib/supabase'

export interface SeaCharacter {
  name: string
  bounty: number
}

export interface SeaCard {
  /** Display label, e.g. "East Blue" or "East Blue (without Luffy & Roger)". */
  label: string
  /** Visual theme key — composition picks colours from this. */
  theme: 'east-blue' | 'east-blue-clean' | 'west' | 'north' | 'south' | 'grand-line' | 'new-world'
  top5: SeaCharacter[]
  averageTop5: number
}

const REGIONS: { region: string; theme: SeaCard['theme']; label: string }[] = [
  { region: 'East Blue', theme: 'east-blue', label: 'East Blue' },
  { region: 'West Blue', theme: 'west', label: 'West Blue' },
  { region: 'North Blue', theme: 'north', label: 'North Blue' },
  { region: 'South Blue', theme: 'south', label: 'South Blue' },
  { region: 'Grand Line', theme: 'grand-line', label: 'Grand Line' },
  { region: 'New World', theme: 'new-world', label: 'New World' },
]

const EXCLUDED_FOR_CLEAN_EAST_BLUE = new Set([
  'Monkey D. Luffy',
  'Gol D. Roger',
])

function buildCard(
  label: string,
  theme: SeaCard['theme'],
  characters: SeaCharacter[]
): SeaCard | null {
  const top5 = characters
    .slice()
    .sort((a, b) => b.bounty - a.bounty)
    .slice(0, 5)
  if (top5.length === 0) return null
  const averageTop5 = Math.round(
    top5.reduce((s, c) => s + c.bounty, 0) / top5.length
  )
  return { label, theme, top5, averageTop5 }
}

export async function fetchSeaCards(): Promise<SeaCard[]> {
  const { data, error } = await supabase
    .from('character')
    .select('name, bounty, origin_region')
    .not('bounty', 'is', null)
    .gt('bounty', 0)
    .not('origin_region', 'is', null)

  if (error) throw error

  const byRegion = new Map<string, SeaCharacter[]>()
  for (const row of data ?? []) {
    const region = (row.origin_region as string | null)?.trim()
    if (!region) continue
    const list = byRegion.get(region) ?? []
    list.push({ name: row.name ?? 'Unknown', bounty: row.bounty ?? 0 })
    byRegion.set(region, list)
  }

  const cards: SeaCard[] = []
  for (const r of REGIONS) {
    const chars = byRegion.get(r.region) ?? []
    const card = buildCard(r.label, r.theme, chars)
    if (card) cards.push(card)

    if (r.region === 'East Blue') {
      // Add the dramatic-contrast variant: East Blue without its two outliers.
      const filtered = chars.filter(
        (c) => !EXCLUDED_FOR_CLEAN_EAST_BLUE.has(c.name)
      )
      const cleanCard = buildCard(
        'East Blue\n(without Luffy & Roger)',
        'east-blue-clean',
        filtered
      )
      if (cleanCard) cards.push(cleanCard)
    }
  }

  // Sort ascending by average — weakest first, the punchline at the end.
  cards.sort((a, b) => a.averageTop5 - b.averageTop5)
  return cards
}
