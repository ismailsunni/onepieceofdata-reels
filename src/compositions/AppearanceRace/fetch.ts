import { supabase } from '../../lib/supabase'
import {
  computeRaceFrames,
  hashId,
  type RaceFrame,
} from '../../lib/appearanceRace'

const STRAW_HAT_IDS = new Set([
  'Monkey_D._Luffy',
  'Roronoa_Zoro',
  'Nami',
  'Usopp',
  'Sanji',
  'Tony_Tony_Chopper',
  'Nico_Robin',
  'Franky',
  'Brook',
  'Jinbe',
])

export interface RaceCharacterInfo {
  id: string
  name: string
  imageUrl: string | null
  color: string
}

/** Compact frame: just chapter + (id, score) pairs. Characters resolved
 *  separately via the lookup so we don't repeat names 11,000 times. */
export interface CompactRaceFrame {
  chapter: number
  entries: { id: string; score: number }[]
}

export interface ArcRange {
  title: string
  startChapter: number
  endChapter: number
}

export interface AppearanceRaceSnapshot {
  characters: RaceCharacterInfo[]
  frames: CompactRaceFrame[]
  minChapter: number
  maxChapter: number
  windowSize: number
  topN: number
  /** Theoretical ceiling so the composition can normalize bar widths. */
  maxScore: number
  /** Sample interval — every Nth chapter is included; null = every chapter. */
  sampleEvery: number
  /** Ordered by startChapter ascending. Used to label the current arc. */
  arcs: ArcRange[]
}

function characterImageUrl(id: string): string {
  const ascii = id.normalize('NFD').replace(/\p{Diacritic}/gu, '')
  return `${process.env.SUPABASE_URL}/storage/v1/object/public/character-images/${encodeURIComponent(ascii)}.png`
}

async function imageExists(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, { method: 'HEAD' })
    return res.ok
  } catch {
    return false
  }
}

/** Deterministic vivid color per character. */
function colorFor(id: string): string {
  const hue = Math.floor(hashId(id) * 360)
  const sat = 65 + Math.floor(hashId(id + '#') * 15) // 65–80%
  const light = 50 + Math.floor(hashId(id + '@') * 8) // 50–58%
  return `hsl(${hue}, ${sat}%, ${light}%)`
}

export async function loadAppearanceRaceSnapshot(): Promise<AppearanceRaceSnapshot> {
  const windowSize = 30
  const topN = 10

  const [charactersRes, arcsRes] = await Promise.all([
    supabase.from('character').select('id, name, chapter_list'),
    supabase
      .from('arc')
      .select('title, start_chapter, end_chapter')
      .order('start_chapter', { ascending: true }),
  ])

  if (charactersRes.error) {
    throw new Error(
      `Failed to fetch characters: ${charactersRes.error.message}`
    )
  }
  if (arcsRes.error) {
    throw new Error(`Failed to fetch arcs: ${arcsRes.error.message}`)
  }

  const rawCharacters = (charactersRes.data ?? []) as {
    id: string
    name: string | null
    chapter_list: number[] | null
  }[]

  const arcs: ArcRange[] = (arcsRes.data ?? [])
    .filter(
      (a): a is { title: string; start_chapter: number; end_chapter: number } =>
        typeof a.title === 'string' &&
        typeof a.start_chapter === 'number' &&
        typeof a.end_chapter === 'number'
    )
    .map((a) => ({
      title: a.title,
      startChapter: a.start_chapter,
      endChapter: a.end_chapter,
    }))

  const result = computeRaceFrames({
    characters: rawCharacters,
    shpIds: STRAW_HAT_IDS,
    windowSize,
    topN,
    shpFilter: 'hide',
    scoringMode: 'window',
    // Mild rank hysteresis to kill flicker between near-tied antagonists
    // late in long arcs (esp. Wano / Egghead crowd scenes).
    hysteresisMargin: 0.5,
    hysteresisMinRank: 4,
  })

  // Sample every Nth chapter. With a 30-chapter window, sampling every 15
  // gives 2 samples per window — coarse but each sampled state holds
  // ~340 ms on screen over the 30s reel, which reads like a ticker. Yields
  // ~76 sampled frames across ~1145 chapters.
  const sampleEvery = 15
  const sampled: RaceFrame[] = []
  for (let i = 0; i < result.frames.length; i += sampleEvery) {
    sampled.push(result.frames[i])
  }
  // Always include the final chapter so the reel lands on the true endpoint.
  if (result.frames.length > 0) {
    const last = result.frames[result.frames.length - 1]
    if (sampled[sampled.length - 1]?.chapter !== last.chapter) {
      sampled.push(last)
    }
  }

  // Collect the set of characters that ever appear in any sampled frame so
  // we only resolve images for the ones the viewer will see.
  const seen = new Set<string>()
  for (const f of sampled) {
    for (const e of f.entries) seen.add(e.id)
  }
  const nameById = new Map<string, string>()
  for (const c of rawCharacters) {
    if (c.name) nameById.set(c.id, c.name)
  }

  // Resolve portrait URLs (HEAD-checked) for each character that appears.
  const characters: RaceCharacterInfo[] = await Promise.all(
    Array.from(seen).map(async (id) => {
      const url = characterImageUrl(id)
      const exists = await imageExists(url)
      return {
        id,
        name: nameById.get(id) ?? id,
        imageUrl: exists ? url : null,
        color: colorFor(id),
      }
    })
  )

  const frames: CompactRaceFrame[] = sampled.map((f) => ({
    chapter: f.chapter,
    entries: f.entries.map((e) => ({ id: e.id, score: e.score })),
  }))

  return {
    characters,
    frames,
    minChapter: result.minChapter,
    maxChapter: result.maxChapter,
    windowSize,
    topN,
    maxScore: result.maxScore,
    sampleEvery,
    arcs,
  }
}
