import { staticFile } from 'remotion'

export interface SnubbedComparable {
  /** Top-100 rank (1 = best). */
  rank: number
  /** Display name (title-cased, parenthetical aliases stripped). */
  name: string
  appearances: number
}

export interface SnubbedRow {
  id: string
  name: string
  appearanceCount: number
  firstChapter: number | null
  lastChapter: number | null
  imageUrl: string | null
  /** How many top-100 characters have fewer appearances than this row. */
  top100WithLessAppearances: number
  /** 0–2 top-100 chars with similar appearance counts, best-ranked first. */
  comparables: SnubbedComparable[]
}

export interface SnubbedSnapshot {
  rows: SnubbedRow[]
  throughChapter: number | null
}

const PINNED_CSV_NAME = 'midterm_analysis_snubbed_top5.csv'

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

function num(s: string): number | null {
  return s === '' ? null : Number(s)
}

// CSV holds names in the original ALL-CAPS form with parenthetical aliases
// (e.g. "TRAFALGAR LAW (TRAFALGAR D. WATER LAW)"). Render them in title
// case without the alias so they fit alongside the snubbed character's
// mixed-case name.
function prettyName(raw: string): string {
  const noParen = raw.replace(/\s*\(.*?\)\s*/g, ' ').replace(/\s+/g, ' ').trim()
  return noParen
    .toLowerCase()
    .split(' ')
    .map((tok) => {
      if (tok === 'd.') return 'D.'
      return tok.charAt(0).toUpperCase() + tok.slice(1)
    })
    .join(' ')
}

export async function loadSnubbedSnapshot(limit = 5): Promise<SnubbedSnapshot> {
  const res = await fetch(staticFile(PINNED_CSV_NAME))
  if (!res.ok) {
    throw new Error(
      `Failed to load ${PINNED_CSV_NAME}: ${res.status} ${res.statusText}`
    )
  }
  const text = (await res.text()).replace(/\r\n/g, '\n').trim()
  const [headerLine, ...lines] = text.split('\n')
  const header = parseCsvLine(headerLine)
  const idx = (k: string) => header.indexOf(k)
  const iId = idx('Character ID')
  const iName = idx('Name')
  const iApp = idx('Appearance Count')
  const iFirst = idx('First Chapter')
  const iLast = idx('Last Chapter')
  const iImg = idx('Image URL')
  const iThrough = idx('Through Chapter')
  const iBeaten = idx('Top100 With Less Appearances')
  const iCmp1Name = idx('Comparable 1 Name')
  const iCmp1Rank = idx('Comparable 1 Rank')
  const iCmp1App = idx('Comparable 1 Appearances')
  const iCmp2Name = idx('Comparable 2 Name')
  const iCmp2Rank = idx('Comparable 2 Rank')
  const iCmp2App = idx('Comparable 2 Appearances')

  const rows: SnubbedRow[] = []
  let throughChapter: number | null = null
  for (const l of lines) {
    if (rows.length >= limit) break
    const c = parseCsvLine(l)
    const comparables: SnubbedComparable[] = []
    if (c[iCmp1Name]) {
      comparables.push({
        rank: Number(c[iCmp1Rank]),
        name: prettyName(c[iCmp1Name]),
        appearances: Number(c[iCmp1App]),
      })
    }
    if (c[iCmp2Name]) {
      comparables.push({
        rank: Number(c[iCmp2Rank]),
        name: prettyName(c[iCmp2Name]),
        appearances: Number(c[iCmp2App]),
      })
    }
    rows.push({
      id: c[iId],
      name: c[iName],
      appearanceCount: Number(c[iApp]),
      firstChapter: num(c[iFirst]),
      lastChapter: num(c[iLast]),
      imageUrl: c[iImg] || null,
      top100WithLessAppearances: Number(c[iBeaten] ?? 0),
      comparables,
    })
    if (throughChapter == null) throughChapter = num(c[iThrough])
  }

  return { rows, throughChapter }
}
