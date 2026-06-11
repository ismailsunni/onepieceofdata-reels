// The World Cup ↔ One Piece mapping is hand-authored (see slides.ts), but each
// `worldcup` slide is fronted by the arc's signature character — so we do hit
// Supabase to resolve those portraits, exactly like the other carousels. Flags
// come from the flagcdn.com CDN (free, ISO 3166-1 alpha-2 codes).
//
// `latestChapter` stays null: the timeline is historical, nothing to stamp.

import { supabase } from '../../lib/supabase'
import { SLIDES, type SlideSpec } from './slides'

export interface ResolvedWorldCup {
  kind: 'worldcup'
  year: number
  host: string
  champion: string
  flagUrl: string
  finalResult: string
  characterName: string
  characterRole: string
  characterImageUrl: string | null
  arcTitle: string
  detail: string
  chapterLabel: string
  theme: string
}

export type ResolvedSlide =
  | { kind: 'cover'; kicker: string; title: string; subtitle: string }
  | { kind: 'premise'; kicker: string; title: string; body: string }
  | ResolvedWorldCup
  | {
      kind: 'closer'
      kicker: string
      year: string
      hosts: string
      question: string
      handle: string
    }

export interface WorldCupSnapshot {
  slides: ResolvedSlide[]
  latestChapter: number | null
}

function flagUrl(code: string): string {
  return `https://flagcdn.com/w320/${code.toLowerCase()}.png`
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

/** name → portrait URL (null when the character has no image on file). */
async function resolvePortraits(
  names: string[]
): Promise<Map<string, string | null>> {
  const out = new Map<string, string | null>()
  if (names.length === 0) return out
  const { data, error } = await supabase
    .from('character')
    .select('id, name')
    .in('name', names)
  if (error) throw error

  await Promise.all(
    (data ?? []).map(async (row) => {
      const url = characterImageUrl(String(row.id))
      out.set(row.name as string, (await imageExists(url)) ? url : null)
    })
  )
  return out
}

export async function loadWorldCupSnapshot(): Promise<WorldCupSnapshot> {
  const names = Array.from(
    new Set(
      SLIDES.flatMap((s) =>
        s.kind === 'worldcup' ? [s.characterName] : []
      )
    )
  )
  const portraits = await resolvePortraits(names)

  const slides: ResolvedSlide[] = (SLIDES as SlideSpec[]).map((s) => {
    if (s.kind !== 'worldcup') return s
    return {
      kind: 'worldcup',
      year: s.year,
      host: s.host,
      champion: s.champion,
      flagUrl: flagUrl(s.championCode),
      finalResult: s.finalResult,
      characterName: s.characterName,
      characterRole: s.characterRole,
      characterImageUrl: portraits.get(s.characterName) ?? null,
      arcTitle: s.arcTitle,
      detail: s.detail,
      chapterLabel: s.chapterLabel,
      theme: s.theme,
    }
  })

  return { slides, latestChapter: null }
}
