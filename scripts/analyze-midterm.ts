import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const INPUT = resolve('data/onepiece_midterm_rankings_linked.csv')

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

interface Row {
  rank: number
  name: string
  charId: string
  appearance: number | null
  first: number | null
  last: number | null
  sagas: number | null
  arcs: number | null
}

const text = readFileSync(INPUT, 'utf8').replace(/\r\n/g, '\n').trim()
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

const rows: Row[] = lines.map((l) => {
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

// Exclude characters whose data is known to be unreliable.
const EXCLUDE_IDS = new Set(['Pandaman'])
const linked = rows.filter((r) => r.charId !== '' && !EXCLUDE_IDS.has(r.charId))

function fmt(rs: Row[], pickValue: (r: Row) => number | null, label: string) {
  console.log(`\n${label}`)
  console.log('  Rank | Name'.padEnd(50) + ' | Value | CharID')
  for (const r of rs) {
    console.log(
      `  #${String(r.rank).padStart(3)} | ${r.name.padEnd(40)} | ${String(pickValue(r)).padStart(5)} | ${r.charId}`
    )
  }
}

const byApp = [...linked].filter((r) => r.appearance != null)
const bySaga = [...linked].filter((r) => r.sagas != null)
const byArc = [...linked].filter((r) => r.arcs != null)
const byLast = [...linked].filter((r) => r.last != null)

fmt(
  byApp.sort((a, b) => a.appearance! - b.appearance!).slice(0, 5),
  (r) => r.appearance,
  'TOP 5 LOWEST APPEARANCE COUNT'
)
fmt(
  byArc.sort((a, b) => a.arcs! - b.arcs!).slice(0, 5),
  (r) => r.arcs,
  'TOP 5 LOWEST ARC COUNT'
)
fmt(
  bySaga.sort((a, b) => a.sagas! - b.sagas!).slice(0, 5),
  (r) => r.sagas,
  'TOP 5 LOWEST SAGA COUNT'
)
fmt(
  [...byLast].sort((a, b) => b.last! - a.last!).slice(0, 5),
  (r) => r.last,
  'TOP 5 LATEST APPEARANCE (highest last chapter)'
)
fmt(
  [...byLast].sort((a, b) => a.last! - b.last!).slice(0, 5),
  (r) => r.last,
  'BOTTOM 5 LATEST APPEARANCE (lowest last chapter)'
)
