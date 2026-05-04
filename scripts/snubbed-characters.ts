import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { supabase } from '../src/lib/supabase'

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

interface Char {
  id: string
  name: string
  appearance_count: number | null
  saga_list: string[] | null
  arc_list: string[] | null
}

async function fetchAll(): Promise<Char[]> {
  const all: Char[] = []
  const pageSize = 1000
  let from = 0
  while (true) {
    const { data, error } = await supabase
      .from('character')
      .select('id, name, appearance_count, saga_list, arc_list')
      .range(from, from + pageSize - 1)
    if (error) throw error
    if (!data || data.length === 0) break
    for (const r of data) {
      all.push({
        id: String(r.id),
        name: r.name ?? '',
        appearance_count: r.appearance_count ?? null,
        saga_list: (r.saga_list as string[] | null) ?? null,
        arc_list: (r.arc_list as string[] | null) ?? null,
      })
    }
    if (data.length < pageSize) break
    from += pageSize
  }
  return all
}

async function main() {
  // Build the set of top-100-linked character IDs.
  const text = readFileSync(INPUT, 'utf8').replace(/\r\n/g, '\n').trim()
  const [headerLine, ...lines] = text.split('\n')
  const header = parseCsvLine(headerLine)
  const iCid = header.indexOf('Character ID')
  const top100Ids = new Set<string>()
  for (const l of lines) {
    const c = parseCsvLine(l)
    if (c[iCid]) top100Ids.add(c[iCid])
  }

  const chars = await fetchAll()
  const snubbed = chars.filter((c) => !top100Ids.has(c.id))

  function fmt(
    rs: Char[],
    pickValue: (c: Char) => number,
    label: string
  ) {
    console.log(`\n${label}`)
    console.log('  Name'.padEnd(40) + ' | Value | CharID')
    for (const c of rs) {
      console.log(
        `  ${c.name.padEnd(38)} | ${String(pickValue(c)).padStart(5)} | ${c.id}`
      )
    }
  }

  const byChapter = snubbed
    .filter((c) => c.appearance_count != null)
    .sort((a, b) => (b.appearance_count ?? 0) - (a.appearance_count ?? 0))
    .slice(0, 5)
  const byArc = snubbed
    .filter((c) => c.arc_list != null)
    .sort((a, b) => (b.arc_list?.length ?? 0) - (a.arc_list?.length ?? 0))
    .slice(0, 5)
  const bySaga = snubbed
    .filter((c) => c.saga_list != null)
    .sort((a, b) => (b.saga_list?.length ?? 0) - (a.saga_list?.length ?? 0))
    .slice(0, 5)

  fmt(byChapter, (c) => c.appearance_count!, 'TOP 5 SNUBBED BY CHAPTER COUNT')
  fmt(byArc, (c) => c.arc_list!.length, 'TOP 5 SNUBBED BY ARC COUNT')
  fmt(bySaga, (c) => c.saga_list!.length, 'TOP 5 SNUBBED BY SAGA COUNT')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
