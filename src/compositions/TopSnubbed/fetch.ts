import { staticFile } from 'remotion'

export interface SnubbedRow {
  id: string
  name: string
  appearanceCount: number
  firstChapter: number | null
  lastChapter: number | null
  imageUrl: string | null
  /** How many top-100 characters have fewer appearances than this row. */
  top100WithLessAppearances: number
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

  const rows: SnubbedRow[] = []
  let throughChapter: number | null = null
  for (const l of lines) {
    if (rows.length >= limit) break
    const c = parseCsvLine(l)
    rows.push({
      id: c[iId],
      name: c[iName],
      appearanceCount: Number(c[iApp]),
      firstChapter: num(c[iFirst]),
      lastChapter: num(c[iLast]),
      imageUrl: c[iImg] || null,
      top100WithLessAppearances: Number(c[iBeaten] ?? 0),
    })
    if (throughChapter == null) throughChapter = num(c[iThrough])
  }

  return { rows, throughChapter }
}
