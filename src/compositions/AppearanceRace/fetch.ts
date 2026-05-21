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

  const { data, error } = await supabase
    .from('character')
    .select('id, name, chapter_list')

  if (error) {
    throw new Error(`Failed to fetch characters: ${error.message}`)
  }

  const rawCharacters = (data ?? []) as {
    id: string
    name: string | null
    chapter_list: number[] | null
  }[]

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

  // Sample every Nth chapter to bound frame count. The reel is 12s @ 30fps
  // = 360 playback frames; with ~1145 chapters and ~300 race-playback
  // frames we want ~4 chapters per sample. Pick 3 to over-sample slightly
  // and let the composition decimate if it wants smoother motion.
  const sampleEvery = 3
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
  }
}
