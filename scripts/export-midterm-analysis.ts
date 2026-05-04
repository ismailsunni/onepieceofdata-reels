import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { supabase } from '../src/lib/supabase'

const LINKED = resolve('data/onepiece_midterm_rankings_linked.csv')
const OUT_LOWEST = resolve('data/midterm_analysis_lowest.csv')
const OUT_LATEST = resolve('data/midterm_analysis_latest.csv')
// Snubbed snapshot lives in public/ so the Remotion bundle can fetch it via
// staticFile() at metadata time. (data/* is read by Node-only scripts.)
const OUT_SNUBBED = resolve('public/midterm_analysis_snubbed_top5.csv')

// Characters whose data is unreliable and should be excluded from analysis.
const EXCLUDE_IDS = new Set(['Pandaman'])

function parseCsvLine(line: string): string[] {
  const out: string[] = []
  let cur = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') {
        cur += '"'
        i++
      } else if (ch === '"') inQuotes = false
      else cur += ch
    } else {
      if (ch === ',') {
        out.push(cur)
        cur = ''
      } else if (ch === '"') inQuotes = true
      else cur += ch
    }
  }
  out.push(cur)
  return out
}

function csvEscape(v: string): string {
  if (/[",\n]/.test(v)) return `"${v.replace(/"/g, '""')}"`
  return v
}

function writeCsv(path: string, header: string[], rows: string[][]) {
  const lines = [header, ...rows].map((r) => r.map(csvEscape).join(','))
  writeFileSync(path, lines.join('\n') + '\n', 'utf8')
  console.log(`Wrote ${path} (${rows.length} rows)`)
}

interface LinkedRow {
  rank: number
  name: string
  charId: string
  appearance: number | null
  first: number | null
  last: number | null
  sagas: number | null
  arcs: number | null
}

function loadLinked(): LinkedRow[] {
  const text = readFileSync(LINKED, 'utf8').replace(/\r\n/g, '\n').trim()
  const [headerLine, ...lines] = text.split('\n')
  const header = parseCsvLine(headerLine)
  const idx = (k: string) => header.indexOf(k)
  const iRank = idx('Rank')
  const iName = idx('Name')
  const iCid = idx('Character ID')
  const iApp = idx('Appearance Count')
  const iFirst = idx('First Chapter')
  const iLast = idx('Last Chapter')
  const iSaga = idx('Saga Count')
  const iArc = idx('Arc Count')
  const num = (s: string): number | null => (s === '' ? null : Number(s))
  return lines.map((l) => {
    const c = parseCsvLine(l)
    return {
      rank: Number(c[iRank]),
      name: c[iName],
      charId: c[iCid],
      appearance: num(c[iApp]),
      first: num(c[iFirst]),
      last: num(c[iLast]),
      sagas: num(c[iSaga]),
      arcs: num(c[iArc]),
    }
  })
}

interface DbChar {
  id: string
  name: string
  appearance_count: number | null
  first_appearance: number | null
  last_appearance: number | null
  saga_list: string[] | null
  arc_list: string[] | null
}

async function fetchAllChars(): Promise<DbChar[]> {
  const all: DbChar[] = []
  const pageSize = 1000
  let from = 0
  while (true) {
    const { data, error } = await supabase
      .from('character')
      .select(
        'id, name, appearance_count, first_appearance, last_appearance, saga_list, arc_list'
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
        saga_list: (r.saga_list as string[] | null) ?? null,
        arc_list: (r.arc_list as string[] | null) ?? null,
      })
    }
    if (data.length < pageSize) break
    from += pageSize
  }
  return all
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

function rowOut(
  category: string,
  metric: string,
  rank: number,
  r: LinkedRow,
  value: number | null
): string[] {
  return [
    category,
    metric,
    String(rank),
    String(r.rank),
    r.name,
    r.charId,
    value != null ? String(value) : '',
  ]
}

async function main() {
  const linked = loadLinked().filter(
    (r) => r.charId !== '' && !EXCLUDE_IDS.has(r.charId)
  )

  // --- midterm_analysis_lowest.csv : lowest by appearance, arc, saga ---
  const lowestRows: string[][] = []
  const byApp = [...linked]
    .filter((r) => r.appearance != null)
    .sort((a, b) => a.appearance! - b.appearance!)
    .slice(0, 5)
  byApp.forEach((r, i) =>
    lowestRows.push(rowOut('lowest', 'appearance_count', i + 1, r, r.appearance))
  )
  const byArc = [...linked]
    .filter((r) => r.arcs != null)
    .sort((a, b) => a.arcs! - b.arcs!)
    .slice(0, 5)
  byArc.forEach((r, i) =>
    lowestRows.push(rowOut('lowest', 'arc_count', i + 1, r, r.arcs))
  )
  const bySaga = [...linked]
    .filter((r) => r.sagas != null)
    .sort((a, b) => a.sagas! - b.sagas!)
    .slice(0, 5)
  bySaga.forEach((r, i) =>
    lowestRows.push(rowOut('lowest', 'saga_count', i + 1, r, r.sagas))
  )
  writeCsv(
    OUT_LOWEST,
    ['Category', 'Metric', 'Position', 'Midterm Rank', 'Name', 'Character ID', 'Value'],
    lowestRows
  )

  // --- midterm_analysis_latest.csv : latest / earliest last appearance ---
  const latestRows: string[][] = []
  const byLast = [...linked].filter((r) => r.last != null)
  ;[...byLast]
    .sort((a, b) => b.last! - a.last!)
    .slice(0, 5)
    .forEach((r, i) =>
      latestRows.push(rowOut('latest', 'last_chapter', i + 1, r, r.last))
    )
  ;[...byLast]
    .sort((a, b) => a.last! - b.last!)
    .slice(0, 5)
    .forEach((r, i) =>
      latestRows.push(rowOut('earliest', 'last_chapter', i + 1, r, r.last))
    )
  writeCsv(
    OUT_LATEST,
    ['Category', 'Metric', 'Position', 'Midterm Rank', 'Name', 'Character ID', 'Value'],
    latestRows
  )

  // --- midterm_analysis_snubbed_top5.csv : most-appearing chars NOT in top 100 ---
  console.log('Fetching all characters from Supabase...')
  const chars = await fetchAllChars()
  const top100Ids = new Set(linked.map((r) => r.charId))
  const snubbed = chars
    .filter(
      (c) =>
        c.appearance_count != null &&
        !top100Ids.has(c.id) &&
        !EXCLUDE_IDS.has(c.id)
    )
    .sort((a, b) => (b.appearance_count ?? 0) - (a.appearance_count ?? 0))
    .slice(0, 5)

  console.log('Resolving portrait URLs...')
  const imageUrls = await Promise.all(
    snubbed.map(async (c) => {
      const url = characterImageUrl(c.id)
      return (await imageExists(url)) ? url : ''
    })
  )

  const latestChapter = await fetchLatestChapter()

  // For each snubbed char, count how many top-100 chars have a *lower*
  // appearance count — i.e., the number of less-frequently-appearing
  // characters that the fans nonetheless voted into the top 100.
  const top100Appearances = linked
    .map((r) => r.appearance)
    .filter((v): v is number => v != null)

  const snubbedRows: string[][] = snubbed.map((c, i) => {
    const ac = c.appearance_count ?? 0
    const beatenByLess = top100Appearances.filter((v) => v < ac).length
    return [
      String(i + 1),
      c.id,
      c.name,
      String(c.appearance_count ?? ''),
      c.first_appearance != null ? String(c.first_appearance) : '',
      c.last_appearance != null ? String(c.last_appearance) : '',
      c.saga_list ? String(c.saga_list.length) : '',
      c.arc_list ? String(c.arc_list.length) : '',
      imageUrls[i],
      latestChapter != null ? String(latestChapter) : '',
      String(beatenByLess),
    ]
  })
  writeCsv(
    OUT_SNUBBED,
    [
      'Position',
      'Character ID',
      'Name',
      'Appearance Count',
      'First Chapter',
      'Last Chapter',
      'Saga Count',
      'Arc Count',
      'Image URL',
      'Through Chapter',
      'Top100 With Less Appearances',
    ],
    snubbedRows
  )
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
