import { staticFile } from 'remotion'
import { supabase } from '../../lib/supabase'
import {
  SLIDES,
  type RankingAxis,
  type RankingSubline,
  type SlideSpec,
} from './slides'

export interface ResolvedCharacter {
  id: string
  name: string
  imageUrl: string | null
  appearanceCount: number | null
  firstChapter: number | null
  lastChapter: number | null
  /** Title of the character's most recent arc, if resolvable. */
  lastArcTitle: string | null
  /** Title of the character's first arc, if resolvable. */
  firstArcTitle: string | null
  /** ISO date of the chapter at `firstChapter` (e.g. "2023-08-21"). */
  firstChapterDate: string | null
  /** ISO date of the chapter at `lastChapter`. */
  lastChapterDate: string | null
  arcCount: number | null
  importanceTier: string | null
  occupation: string | null
  /** 1-based rank by appearance_count among non–Straw-Hat-affiliated chars. */
  rankExSHP: number | null
  /** 1-based rank in the WT100 mid-term top 100, or null if not in. */
  top100Rank: number | null
}

export interface RankingEntry {
  character: ResolvedCharacter
  /** Numeric value used for the ranking, derived from `axis`. */
  value: number | null
  /** Optional secondary line under the name (e.g. "Last arc: Wano"). */
  subline: string | null
}

export interface CaveatsEntry {
  name: string
  rank: number | null
  imageUrl: string
  note: string
}

export type ResolvedSlide =
  | {
      kind: 'cover'
      title: string
      subtitle: string
      kicker: string
    }
  | {
      kind: 'character'
      character: ResolvedCharacter
      headline: string
      pitch: string
      showSpan: boolean
    }
  | {
      kind: 'pair'
      characters: [ResolvedCharacter, ResolvedCharacter]
      groupName: string
      pitch: string
      showRankExSHP: boolean
    }
  | {
      kind: 'group'
      characters: ResolvedCharacter[]
      groupName: string
      pitch: string
    }
  | {
      kind: 'honorable'
      characters: ResolvedCharacter[]
      title: string
      subtitle: string
    }
  | {
      kind: 'ranking'
      kicker: string
      title: string
      subtitle?: string
      entries: RankingEntry[]
      valueLabel: string
      showTop100Rank: boolean
    }
  | {
      kind: 'caveats'
      kicker: string
      title: string
      subtitle: string
      entries: CaveatsEntry[]
      footer: string
    }
  | {
      kind: 'follow'
      kicker: string
      handle: string
      title: string
      subtitle: string
      voteHeader: string
      voteCharacter: ResolvedCharacter
      voteReason: string
    }
  | {
      kind: 'cta'
      kicker: string
      title: string
      url: string
    }

export interface WishlistSnapshot {
  slides: ResolvedSlide[]
  latestChapter: number | null
}

function characterImageUrl(id: string): string {
  return `${process.env.SUPABASE_URL}/storage/v1/object/public/character-images/${encodeURIComponent(id)}.png`
}

async function imageExists(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, { method: 'HEAD' })
    return res.ok
  } catch {
    return false
  }
}

function collectNames(slides: SlideSpec[]): string[] {
  const out = new Set<string>()
  for (const s of slides) {
    if (s.kind === 'character') out.add(s.name)
    else if (s.kind === 'pair') s.names.forEach((n) => out.add(n))
    else if (s.kind === 'group') s.names.forEach((n) => out.add(n))
    else if (s.kind === 'honorable') s.names.forEach((n) => out.add(n))
    else if (s.kind === 'ranking') s.names.forEach((n) => out.add(n))
    else if (s.kind === 'follow') out.add(s.voteName)
  }
  return Array.from(out)
}

async function fetchByNames(
  names: string[]
): Promise<Map<string, ResolvedCharacter>> {
  if (names.length === 0) return new Map()
  const { data, error } = await supabase
    .from('character')
    .select(
      'id, name, appearance_count, first_appearance, last_appearance, arc_list, importance_tier, occupation'
    )
    .in('name', names)
  if (error) throw error

  // First/last arc for each character are the leading/trailing arc_list entries.
  const firstArcByCharId = new Map<string, string>()
  const lastArcByCharId = new Map<string, string>()
  const byName = new Map<string, ResolvedCharacter>()
  for (const row of data ?? []) {
    const arcs = (row.arc_list as string[] | null) ?? null
    const firstArcId = arcs && arcs.length > 0 ? arcs[0] : null
    const lastArcId = arcs && arcs.length > 0 ? arcs[arcs.length - 1] : null
    if (firstArcId) firstArcByCharId.set(String(row.id), firstArcId)
    if (lastArcId) lastArcByCharId.set(String(row.id), lastArcId)
    byName.set(row.name as string, {
      id: String(row.id),
      name: (row.name as string) ?? 'Unknown',
      imageUrl: null,
      appearanceCount: (row.appearance_count as number | null) ?? null,
      firstChapter: (row.first_appearance as number | null) ?? null,
      lastChapter: (row.last_appearance as number | null) ?? null,
      lastArcTitle: null,
      firstArcTitle: null,
      firstChapterDate: null,
      lastChapterDate: null,
      arcCount: arcs ? arcs.length : null,
      importanceTier: (row.importance_tier as string | null) ?? null,
      occupation: (row.occupation as string | null) ?? null,
      rankExSHP: null,
      top100Rank: null,
    })
  }

  // Resolve arc titles in one query (union of first + last).
  const arcIds = Array.from(
    new Set([
      ...firstArcByCharId.values(),
      ...lastArcByCharId.values(),
    ])
  )
  if (arcIds.length > 0) {
    const { data: arcs, error: arcErr } = await supabase
      .from('arc')
      .select('arc_id, title')
      .in('arc_id', arcIds)
    if (arcErr) throw arcErr
    const titleByArcId = new Map<string, string>()
    for (const a of arcs ?? []) {
      titleByArcId.set(a.arc_id as string, a.title as string)
    }
    for (const c of byName.values()) {
      const firstArcId = firstArcByCharId.get(c.id)
      if (firstArcId) c.firstArcTitle = titleByArcId.get(firstArcId) ?? null
      const lastArcId = lastArcByCharId.get(c.id)
      if (lastArcId) c.lastArcTitle = titleByArcId.get(lastArcId) ?? null
    }
  }

  // Resolve first/last chapter dates in one query (union of both numbers).
  const chapterNumbers = Array.from(
    new Set(
      Array.from(byName.values()).flatMap((c) =>
        [c.firstChapter, c.lastChapter].filter((n): n is number => n != null)
      )
    )
  )
  if (chapterNumbers.length > 0) {
    const { data: chapters, error: chErr } = await supabase
      .from('chapter')
      .select('number, date')
      .in('number', chapterNumbers)
    if (chErr) throw chErr
    const dateByNumber = new Map<number, string>()
    for (const ch of chapters ?? []) {
      if (ch.date) dateByNumber.set(ch.number as number, ch.date as string)
    }
    for (const c of byName.values()) {
      if (c.firstChapter != null) {
        c.firstChapterDate = dateByNumber.get(c.firstChapter) ?? null
      }
      if (c.lastChapter != null) {
        c.lastChapterDate = dateByNumber.get(c.lastChapter) ?? null
      }
    }
  }

  await Promise.all(
    Array.from(byName.values()).map(async (c) => {
      const url = characterImageUrl(c.id)
      if (await imageExists(url)) c.imageUrl = url
    })
  )

  return byName
}

// Build a `character_id → 1-based rank by appearance_count` index, excluding
// any character whose affiliation contains "Straw Hat" (so we can show
// "#N ex-SHP" stats for non-crew characters).
async function buildExSHPRankIndex(): Promise<Map<string, number>> {
  const { data: shp, error: shpErr } = await supabase
    .from('character_affiliation')
    .select('character_id')
    .ilike('group_name', '%straw hat%')
  if (shpErr) throw shpErr
  const shpSet = new Set((shp ?? []).map((r) => r.character_id as string))

  const rows: { id: string; ac: number }[] = []
  const pageSize = 1000
  let from = 0
  while (true) {
    const { data, error } = await supabase
      .from('character')
      .select('id, appearance_count')
      .not('appearance_count', 'is', null)
      .order('appearance_count', { ascending: false })
      .range(from, from + pageSize - 1)
    if (error) throw error
    if (!data || data.length === 0) break
    for (const r of data) {
      rows.push({ id: r.id as string, ac: (r.appearance_count as number) ?? 0 })
    }
    if (data.length < pageSize) break
    from += pageSize
  }

  const filtered = rows.filter((r) => !shpSet.has(r.id))
  const rankById = new Map<string, number>()
  filtered.forEach((r, i) => rankById.set(r.id, i + 1))
  return rankById
}

function parseCsvLine(line: string): string[] {
  const out: string[] = []
  let cur = ''
  let q = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (q) {
      if (ch === '"' && line[i + 1] === '"') {
        cur += '"'
        i++
      } else if (ch === '"') q = false
      else cur += ch
    } else {
      if (ch === ',') {
        out.push(cur)
        cur = ''
      } else if (ch === '"') q = true
      else cur += ch
    }
  }
  out.push(cur)
  return out
}

// Map character_id → top-100 rank, loaded from the linked rankings CSV
// (mirrored in public/ so it's reachable via staticFile from both the studio
// browser context and the headless renderer).
async function loadTop100RankByCharId(): Promise<Map<string, number>> {
  const res = await fetch(staticFile('onepiece_midterm_rankings_linked.csv'))
  if (!res.ok)
    throw new Error(
      `Failed to load top-100 CSV: ${res.status} ${res.statusText}`
    )
  const text = (await res.text()).replace(/\r\n/g, '\n').trim()
  const [headerLine, ...lines] = text.split('\n')
  const header = parseCsvLine(headerLine)
  const iRank = header.indexOf('Rank')
  const iCid = header.indexOf('Character ID')
  const out = new Map<string, number>()
  for (const l of lines) {
    const c = parseCsvLine(l)
    if (c[iCid]) out.set(c[iCid], Number(c[iRank]))
  }
  return out
}

function placeholder(name: string): ResolvedCharacter {
  return {
    id: name,
    name,
    imageUrl: null,
    appearanceCount: null,
    firstChapter: null,
    lastChapter: null,
    lastArcTitle: null,
    firstArcTitle: null,
    firstChapterDate: null,
    lastChapterDate: null,
    arcCount: null,
    importanceTier: null,
    occupation: null,
    rankExSHP: null,
    top100Rank: null,
  }
}

function resolveOne(
  name: string,
  byName: Map<string, ResolvedCharacter>
): ResolvedCharacter {
  const hit = byName.get(name)
  if (hit) return hit
  console.warn(
    `[Top100Wishlist] no Supabase match for "${name}" — using placeholder`
  )
  return placeholder(name)
}

function rankingValue(c: ResolvedCharacter, axis: RankingAxis): number | null {
  switch (axis) {
    case 'appearance_count':
      return c.appearanceCount
    case 'last_appearance':
      return c.lastChapter
    case 'first_appearance':
      return c.firstChapter
    case 'arc_count':
      return c.arcCount
  }
}

const MONTHS_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

function formatSinceDate(iso: string): string {
  // e.g. "2024-03 · 2y 1mo ago" — short year/month, then humanised age.
  const d = new Date(iso)
  const now = new Date()
  const monthLabel = `${MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}`
  const totalMonths =
    (now.getFullYear() - d.getFullYear()) * 12 +
    (now.getMonth() - d.getMonth())
  const y = Math.floor(totalMonths / 12)
  const m = totalMonths % 12
  let age: string
  if (y === 0 && m === 0) age = 'this month'
  else if (y === 0) age = `${m}mo ago`
  else if (m === 0) age = `${y}y ago`
  else age = `${y}y ${m}mo ago`
  return `${monthLabel} · ${age}`
}

function rankingSubline(
  c: ResolvedCharacter,
  axis: RankingAxis,
  mode: RankingSubline,
  latestChapter: number | null
): string | null {
  // Resolve "auto" to an axis-driven default, then dispatch.
  const resolved: RankingSubline =
    mode !== 'auto'
      ? mode
      : axis === 'last_appearance'
        ? 'last_arc' // override below renders date+gap; see comment
        : axis === 'first_appearance'
          ? 'first_arc'
          : 'none'

  // 'auto' for last/first_appearance uses date_since variants, not the arc
  // titles. Branch directly off axis when in auto mode.
  if (mode === 'auto') {
    if (axis === 'last_appearance') {
      if (!c.lastChapterDate) return null
      const date = formatSinceDate(c.lastChapterDate)
      if (latestChapter != null && c.lastChapter != null) {
        return `${date} · ${latestChapter - c.lastChapter} ch ago`
      }
      return date
    }
    if (axis === 'first_appearance') {
      return c.firstChapterDate ? formatSinceDate(c.firstChapterDate) : null
    }
    return null
  }

  switch (resolved) {
    case 'first_arc':
      return c.firstArcTitle ? `First arc: ${c.firstArcTitle}` : null
    case 'last_arc':
      return c.lastArcTitle ? `Last arc: ${c.lastArcTitle}` : null
    case 'none':
      return null
    case 'auto':
      return null // unreachable
  }
}

async function fetchLatestChapter(): Promise<number | null> {
  const { data, error } = await supabase
    .from('chapter')
    .select('number')
    .order('number', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (error) throw error
  return data?.number ?? null
}

export async function loadWishlistSnapshot(): Promise<WishlistSnapshot> {
  const names = collectNames(SLIDES)
  const [byName, latestChapter, rankIndex, top100ByCharId] = await Promise.all([
    fetchByNames(names),
    fetchLatestChapter(),
    buildExSHPRankIndex(),
    loadTop100RankByCharId(),
  ])
  for (const c of byName.values()) {
    c.rankExSHP = rankIndex.get(c.id) ?? null
    c.top100Rank = top100ByCharId.get(c.id) ?? null
  }

  const slides: ResolvedSlide[] = SLIDES.map((s): ResolvedSlide => {
    switch (s.kind) {
      case 'cover':
        return {
          kind: 'cover',
          title: s.title,
          subtitle: s.subtitle,
          kicker: s.kicker,
        }
      case 'cta':
        return { kind: 'cta', kicker: s.kicker, title: s.title, url: s.url }
      case 'character':
        return {
          kind: 'character',
          character: resolveOne(s.name, byName),
          headline: s.headline,
          pitch: s.pitch,
          showSpan: s.showSpan ?? false,
        }
      case 'pair':
        return {
          kind: 'pair',
          characters: [
            resolveOne(s.names[0], byName),
            resolveOne(s.names[1], byName),
          ],
          groupName: s.groupName,
          pitch: s.pitch,
          showRankExSHP: s.showRankExSHP ?? false,
        }
      case 'group':
        return {
          kind: 'group',
          characters: s.names.map((n) => resolveOne(n, byName)),
          groupName: s.groupName,
          pitch: s.pitch,
        }
      case 'honorable':
        return {
          kind: 'honorable',
          characters: s.names.map((n) => resolveOne(n, byName)),
          title: s.title,
          subtitle: s.subtitle,
        }
      case 'ranking':
        return {
          kind: 'ranking',
          kicker: s.kicker,
          title: s.title,
          subtitle: s.subtitle,
          valueLabel: s.valueLabel,
          showTop100Rank: s.showTop100Rank ?? false,
          entries: s.names.map((n) => {
            const character = resolveOne(n, byName)
            return {
              character,
              value: rankingValue(character, s.axis),
              subline: rankingSubline(
                character,
                s.axis,
                s.subline ?? 'auto',
                latestChapter
              ),
            }
          }),
        }
      case 'caveats':
        return {
          kind: 'caveats',
          kicker: s.kicker,
          title: s.title,
          subtitle: s.subtitle,
          entries: s.entries,
          footer: s.footer,
        }
      case 'follow':
        return {
          kind: 'follow',
          kicker: s.kicker,
          handle: s.handle,
          title: s.title,
          subtitle: s.subtitle,
          voteHeader: s.voteHeader,
          voteCharacter: resolveOne(s.voteName, byName),
          voteReason: s.voteReason,
        }
    }
  })

  return { slides, latestChapter }
}
