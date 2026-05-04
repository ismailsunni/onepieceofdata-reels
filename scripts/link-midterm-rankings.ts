import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { supabase } from '../src/lib/supabase'

const INPUT = resolve('data/onepiece_midterm_rankings.csv')
const OUTPUT = resolve('data/onepiece_midterm_rankings_linked.csv')

// Manual aliases for romanization mismatches the fuzzy matcher can't bridge.
// Maps a normalized CSV name -> exact Supabase character.id, or '' to
// force-skip matching (e.g., ships, which aren't stored in the DB).
const MANUAL_ALIASES: Record<string, string> = {
  SHUSHU: 'Chouchou',
  'GOING MERRY': '',
  'THOUSAND SUNNY': '',
  'KUNG FU DUGONG': '',
}

interface CharRow {
  id: string
  name: string
  appearance_count: number | null
  first_appearance: number | null
  last_appearance: number | null
  arc_list: string[] | null
  saga_list: string[] | null
}

const TITLES = new Set([
  'SAINT',
  'DR',
  'MR',
  'MS',
  'MRS',
  'MISS',
  'CAPTAIN',
  'LORD',
])

function normalize(s: string): string {
  return s
    .toUpperCase()
    .replace(/[.・]/g, ' ')
    .replace(/[()]/g, ' ')
    .replace(/[^A-Z0-9 ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function stripTitles(norm: string): string {
  return norm
    .split(' ')
    .filter((t) => !TITLES.has(t))
    .join(' ')
}

// Romaji-fold: KOU->KO, OU->O at end of token; L<->R is added as an
// extra variant (not a fold), since it's lossy.
function romajiFold(norm: string): string {
  return norm
    .split(' ')
    .map((t) => t.replace(/OU$/, 'O').replace(/OU(?=[^AEIOU])/, 'O'))
    .join(' ')
}

function expand(base: string, out: Set<string>) {
  if (!base) return
  out.add(base)
  const stripped = stripTitles(base)
  if (stripped) out.add(stripped)
  const folded = romajiFold(stripped || base)
  if (folded) out.add(folded)
  // L<->R variant for typo'd romanizations (NEFELTARI<->NEFERTARI)
  out.add((stripped || base).replace(/L/g, 'R'))
  // Compact (no spaces): JOYBOY <-> JOY BOY
  out.add((stripped || base).replace(/ /g, ''))
}

function nameVariants(raw: string): string[] {
  const variants = new Set<string>()
  expand(normalize(raw), variants)

  const parenMatch = raw.match(/^(.*?)\s*\(([^)]+)\)\s*(.*)$/)
  if (parenMatch) {
    const before = (parenMatch[1] + ' ' + parenMatch[3]).trim()
    const inside = parenMatch[2].trim()
    if (before) expand(normalize(before), variants)
    if (inside) expand(normalize(inside), variants)
  }
  return [...variants].filter(Boolean)
}

async function fetchAllCharacters(): Promise<CharRow[]> {
  const all: CharRow[] = []
  const pageSize = 1000
  let from = 0
  while (true) {
    const { data, error } = await supabase
      .from('character')
      .select(
        'id, name, appearance_count, first_appearance, last_appearance, arc_list, saga_list'
      )
      .range(from, from + pageSize - 1)
    if (error) throw error
    if (!data || data.length === 0) break
    for (const r of data) {
      all.push({
        id: String(r.id),
        name: r.name ?? '',
        appearance_count: r.appearance_count ?? null,
        first_appearance: r.first_appearance ?? null,
        last_appearance: r.last_appearance ?? null,
        arc_list: (r.arc_list as string[] | null) ?? null,
        saga_list: (r.saga_list as string[] | null) ?? null,
      })
    }
    if (data.length < pageSize) break
    from += pageSize
  }
  return all
}

function buildIndex(chars: CharRow[]): Map<string, string[]> {
  const index = new Map<string, string[]>()
  for (const c of chars) {
    for (const v of nameVariants(c.name)) {
      const arr = index.get(v) ?? []
      if (!arr.includes(c.id)) arr.push(c.id)
      index.set(v, arr)
    }
  }
  return index
}

const STOP_TOKENS = new Set(['D', 'THE', 'OF'])

function tokens(norm: string): string[] {
  return norm.split(' ').filter((t) => t.length > 1 && !STOP_TOKENS.has(t))
}

function commonPrefixLen(a: string, b: string): number {
  const n = Math.min(a.length, b.length)
  let i = 0
  while (i < n && a[i] === b[i]) i++
  return i
}

// Fallback: score DB chars by token overlap + token-prefix similarity.
// Exact token match is +2; prefix match (>=5 shared chars) is +1.5.
// Requires at least one "strong" hit (exact match of length >= 4, or
// prefix overlap >= 5) to avoid noise from common tokens like CHARLOTTE.
function tokenOverlapMatch(
  csvNorm: string,
  chars: CharRow[]
): { id: string; name: string } | null {
  const csvTokens = tokens(csvNorm)
  if (csvTokens.length === 0) return null
  let best: { id: string; name: string; score: number } | null = null
  for (const c of chars) {
    const cTokens = tokens(stripTitles(normalize(c.name)))
    if (cTokens.length === 0) continue
    let score = 0
    let strong = false
    for (const t of csvTokens) {
      let bestPair = 0
      for (const u of cTokens) {
        if (t === u) {
          bestPair = Math.max(bestPair, 2)
          // A short exact match still counts as strong if the CSV
          // entry is a single token (e.g., "IMU" -> "Nerona Imu").
          if (t.length >= 4 || csvTokens.length === 1) strong = true
        } else {
          const p = commonPrefixLen(t, u)
          if (p >= 5) {
            bestPair = Math.max(bestPair, 1.5)
            strong = true
          }
        }
      }
      score += bestPair
    }
    if (!strong) continue
    if (!best || score > best.score) best = { id: c.id, name: c.name, score }
  }
  return best ? { id: best.id, name: best.name } : null
}

function parseCsvLine(line: string): string[] {
  // Simple parser: handles quoted fields with commas inside
  const out: string[] = []
  let cur = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') {
        cur += '"'
        i++
      } else if (ch === '"') {
        inQuotes = false
      } else {
        cur += ch
      }
    } else {
      if (ch === ',') {
        out.push(cur)
        cur = ''
      } else if (ch === '"') {
        inQuotes = true
      } else {
        cur += ch
      }
    }
  }
  out.push(cur)
  return out
}

function csvEscape(v: string): string {
  if (/[",\n]/.test(v)) return `"${v.replace(/"/g, '""')}"`
  return v
}

async function main() {
  const csvText = readFileSync(INPUT, 'utf8').replace(/\r\n/g, '\n').trim()
  const lines = csvText.split('\n')
  const header = parseCsvLine(lines[0])
  const rows = lines.slice(1).map(parseCsvLine)

  console.log(`Fetching characters from Supabase...`)
  const chars = await fetchAllCharacters()
  console.log(`Fetched ${chars.length} characters.`)
  const index = buildIndex(chars)

  const charById = new Map<string, CharRow>()
  for (const c of chars) charById.set(c.id, c)

  const newHeader = [
    ...header,
    'Character ID',
    'Appearance Count',
    'First Chapter',
    'Last Chapter',
    'Saga Count',
    'Arc Count',
  ]
  const outLines = [newHeader.map(csvEscape).join(',')]

  const unmatched: string[] = []
  const ambiguous: string[] = []

  const fuzzyHits: string[] = []
  for (const row of rows) {
    const [rank, name, image] = row
    let matchedId = ''
    const aliasKey = normalize(name)
    const aliasHit = Object.prototype.hasOwnProperty.call(MANUAL_ALIASES, aliasKey)
    if (aliasHit) matchedId = MANUAL_ALIASES[aliasKey]
    const variants = aliasHit ? [] : nameVariants(name)
    for (const v of variants) {
      const ids = index.get(v)
      if (ids && ids.length > 0) {
        if (ids.length > 1) ambiguous.push(`${rank} ${name} -> ${ids.join(',')}`)
        matchedId = ids[0]
        break
      }
    }
    if (!matchedId && !aliasHit) {
      const fb = tokenOverlapMatch(stripTitles(normalize(name)), chars)
      if (fb) {
        matchedId = fb.id
        fuzzyHits.push(`${rank} ${name} ~> ${fb.name} (${fb.id})`)
      }
    }
    if (!matchedId) unmatched.push(`${rank} ${name}`)
    const c = matchedId ? charById.get(matchedId) : undefined
    const appearanceCount = c?.appearance_count != null ? String(c.appearance_count) : ''
    const firstChapter = c?.first_appearance != null ? String(c.first_appearance) : ''
    const lastChapter = c?.last_appearance != null ? String(c.last_appearance) : ''
    const sagaCount = c?.saga_list ? String(c.saga_list.length) : ''
    const arcCount = c?.arc_list ? String(c.arc_list.length) : ''
    outLines.push(
      [
        rank,
        name,
        image,
        matchedId,
        appearanceCount,
        firstChapter,
        lastChapter,
        sagaCount,
        arcCount,
      ]
        .map(csvEscape)
        .join(',')
    )
  }

  writeFileSync(OUTPUT, outLines.join('\n') + '\n', 'utf8')
  console.log(`Wrote ${OUTPUT}`)
  console.log(`Matched: ${rows.length - unmatched.length}/${rows.length}`)
  if (fuzzyHits.length) {
    console.log(`\nFuzzy matches (token overlap, please verify):`)
    for (const f of fuzzyHits) console.log('  ' + f)
  }
  if (ambiguous.length) {
    console.log(`\nAmbiguous (took first):`)
    for (const a of ambiguous) console.log('  ' + a)
  }
  if (unmatched.length) {
    console.log(`\nUnmatched:`)
    for (const u of unmatched) console.log('  ' + u)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
