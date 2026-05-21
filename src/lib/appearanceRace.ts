/**
 * Precompute a bar-chart-race dataset: per-chapter top-K appearance ranking
 * with a rolling window. Pure functions, no React or env dependencies, so
 * the same code runs in Node (snapshot builder) and in the browser (Player).
 *
 * Ported from onepieceofdata-react/src/utils/appearanceRace.ts.
 */

/** FNV-1a-ish deterministic hash → stable per-id pseudo-randomness. */
export function hashId(id: string): number {
  let h = 2166136261
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return (h >>> 0) / 0xffffffff
}

export interface RaceEntry {
  id: string
  name: string
  score: number
  isSHP: boolean
}

export interface RaceFrame {
  chapter: number
  entries: RaceEntry[]
}

export type RaceScoringMode = 'window' | 'decay' | 'cumulative'

export interface RaceComputeInput {
  characters: {
    id: string
    name: string | null
    chapter_list: number[] | null
  }[]
  shpIds: Set<string>
  windowSize: number
  topN: number
  shpFilter: 'all' | 'hide' | 'only'
  scoringMode?: RaceScoringMode
  hysteresisMargin?: number
  hysteresisMinRank?: number
}

export interface RaceResult {
  frames: RaceFrame[]
  minChapter: number
  maxChapter: number
  maxScore: number
}

export function computeRaceFrames(input: RaceComputeInput): RaceResult {
  const {
    characters,
    shpIds,
    windowSize,
    topN,
    shpFilter,
    scoringMode = 'window',
    hysteresisMargin = 0,
    hysteresisMinRank = 1,
  } = input

  const validChars = characters
    .filter((c) => c.name && c.chapter_list && c.chapter_list.length > 0)
    .map((c) => ({
      id: c.id,
      name: c.name as string,
      isSHP: shpIds.has(c.id),
      chapters: c.chapter_list as number[],
    }))
    .filter((c) =>
      shpFilter === 'hide' ? !c.isSHP : shpFilter === 'only' ? c.isSHP : true
    )

  const decay =
    scoringMode === 'decay' ? Math.pow(0.5, 1 / Math.max(1, windowSize)) : 0
  let maxScore =
    scoringMode === 'decay'
      ? 1 / (1 - decay)
      : scoringMode === 'cumulative'
        ? 1
        : windowSize

  if (validChars.length === 0) {
    return { frames: [], minChapter: 1, maxChapter: 0, maxScore }
  }

  const chapterToChars = new Map<number, string[]>()
  const charById = new Map<string, (typeof validChars)[number]>()
  let maxCh = 0
  let minCh = Infinity
  for (const c of validChars) {
    charById.set(c.id, c)
    for (const ch of c.chapters) {
      if (ch > maxCh) maxCh = ch
      if (ch < minCh) minCh = ch
      const arr = chapterToChars.get(ch)
      if (arr) arr.push(c.id)
      else chapterToChars.set(ch, [c.id])
    }
  }
  const startChapter = Math.max(1, minCh)
  const endChapter = maxCh

  const PRUNE_EPSILON = 0.01
  const scores = new Map<string, number>()
  const frames: RaceFrame[] = []
  let prevRanks = new Map<string, number>()

  for (let ch = startChapter; ch <= endChapter; ch++) {
    if (scoringMode === 'decay') {
      for (const [id, v] of scores) {
        const next = v * decay
        if (next < PRUNE_EPSILON) scores.delete(id)
        else scores.set(id, next)
      }
      const entering = chapterToChars.get(ch)
      if (entering) {
        for (const id of entering) {
          scores.set(id, (scores.get(id) ?? 0) + 1)
        }
      }
    } else if (scoringMode === 'cumulative') {
      const entering = chapterToChars.get(ch)
      if (entering) {
        for (const id of entering) {
          scores.set(id, (scores.get(id) ?? 0) + 1)
        }
      }
    } else {
      const entering = chapterToChars.get(ch)
      if (entering) {
        for (const id of entering) {
          scores.set(id, (scores.get(id) ?? 0) + 1)
        }
      }
      const leavingChapter = ch - windowSize
      if (leavingChapter >= startChapter) {
        const leaving = chapterToChars.get(leavingChapter)
        if (leaving) {
          for (const id of leaving) {
            const v = (scores.get(id) ?? 0) - 1
            if (v <= 0) scores.delete(id)
            else scores.set(id, v)
          }
        }
      }
    }

    const ranked: RaceEntry[] = []
    for (const [id, score] of scores) {
      const c = charById.get(id)
      if (!c) continue
      ranked.push({ id, name: c.name, score, isSHP: c.isSHP })
    }
    ranked.sort((a, b) => b.score - a.score || hashId(a.id) - hashId(b.id))

    if (hysteresisMargin > 0 && prevRanks.size > 0) {
      const SLICE = Math.min(ranked.length, topN * 2)
      const startI = Math.max(0, hysteresisMinRank - 1)
      let changed = true
      let guard = 0
      while (changed && guard++ < SLICE) {
        changed = false
        for (let i = startI; i < SLICE - 1; i++) {
          const a = ranked[i]
          const b = ranked[i + 1]
          const pa = prevRanks.get(a.id) ?? Infinity
          const pb = prevRanks.get(b.id) ?? Infinity
          if (pb < pa && a.score - b.score <= hysteresisMargin) {
            ranked[i] = b
            ranked[i + 1] = a
            changed = true
          }
        }
      }
    }

    const nextPrev = new Map<string, number>()
    const snapLimit = Math.min(ranked.length, topN * 2)
    for (let i = 0; i < snapLimit; i++) {
      nextPrev.set(ranked[i].id, i + 1)
    }
    prevRanks = nextPrev

    frames.push({ chapter: ch, entries: ranked.slice(0, topN) })
  }

  if (scoringMode === 'cumulative' && frames.length > 0) {
    const last = frames[frames.length - 1].entries
    maxScore = last.length > 0 ? last[0].score : 1
  }

  return { frames, minChapter: startChapter, maxChapter: endChapter, maxScore }
}
