/**
 * Generates JSON snapshots for each Remotion composition so the static
 * web/ gallery can hand them to <Player> at runtime without ever touching
 * Supabase from the browser.
 *
 * Run via `npm run web:snapshots` (loads .env automatically).
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

// Remotion's `staticFile()` returns relative URLs like "/foo.csv", which
// works inside the Studio's dev server but explodes in Node — `fetch` has
// no base to resolve against. Wrap fetch so that root-relative paths read
// directly from the `public/` directory on disk.
const projectRoot = resolve(fileURLToPath(import.meta.url), '..', '..')
const publicDir = resolve(projectRoot, 'public')
const originalFetch = globalThis.fetch
globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
  const url = typeof input === 'string' ? input : input.toString()
  if (url.startsWith('/') && !url.startsWith('//')) {
    const filePath = resolve(publicDir, url.replace(/^\/+/, ''))
    try {
      const body = await readFile(filePath)
      return new Response(body, { status: 200, statusText: 'OK' })
    } catch (err) {
      return new Response(String((err as Error).message), {
        status: 404,
        statusText: 'Not Found',
      })
    }
  }
  return originalFetch(input as never, init)
}) as typeof fetch

import { fetchTopBounties } from '../src/compositions/TopBounties/fetch'
import { fetchLowestBounties } from '../src/compositions/LowestBounties/fetch'
import {
  fetchSeaCards,
  fetchLatestChapter,
} from '../src/compositions/EastBlueWeakest/fetch'
import { loadSnubbedSnapshot } from '../src/compositions/TopSnubbed/fetch'
import { loadFirst100Snapshot } from '../src/compositions/First100Chapters/fetch'
import { loadVanishedSnapshot } from '../src/compositions/VanishedPreSkip/fetch'
import { loadWishlistSnapshot } from '../src/compositions/Top100Wishlist/fetch'
import { loadAppearanceRaceSnapshot } from '../src/compositions/AppearanceRace/fetch'
import { loadArcRankingSnapshot } from '../src/compositions/ArcLengthRanking/fetch'

const here = dirname(fileURLToPath(import.meta.url))
const outDir = resolve(here, '..', 'web', 'public', 'snapshots')

interface SnapshotEnvelope {
  ok: boolean
  builtAt: string
  data?: unknown
  error?: string
}

async function writeEnvelope(id: string, envelope: SnapshotEnvelope) {
  await mkdir(outDir, { recursive: true })
  const file = resolve(outDir, `${id}.json`)
  await writeFile(file, JSON.stringify(envelope, null, 2), 'utf8')
  const marker = envelope.ok ? '✓' : '✗'
  console.log(`${marker} ${id} → ${file}`)
}

async function main() {
  const tasks: { id: string; run: () => Promise<unknown> }[] = [
    {
      id: 'TopBounties',
      run: async () => ({ rows: await fetchTopBounties(10) }),
    },
    {
      id: 'LowestBounties',
      run: async () => ({ rows: await fetchLowestBounties(10) }),
    },
    {
      id: 'EastBlueWeakest',
      run: async () => {
        const [cards, latestChapter] = await Promise.all([
          fetchSeaCards(),
          fetchLatestChapter(),
        ])
        return { cards, latestChapter }
      },
    },
    {
      id: 'TopSnubbed',
      run: async () => {
        const { rows, throughChapter } = await loadSnubbedSnapshot(5)
        return { rows, latestChapter: throughChapter }
      },
    },
    {
      id: 'First100Chapters',
      run: async () => loadFirst100Snapshot(),
    },
    {
      id: 'VanishedPreSkip',
      run: async () => loadVanishedSnapshot(),
    },
    {
      id: 'Top100Wishlist',
      run: async () => loadWishlistSnapshot(),
    },
    {
      id: 'AppearanceRace',
      run: async () => ({ snapshot: await loadAppearanceRaceSnapshot() }),
    },
    {
      id: 'ArcLengthRanking',
      run: async () => ({ snapshot: await loadArcRankingSnapshot() }),
    },
  ]

  const builtAt = new Date().toISOString()
  const failures: string[] = []
  for (const t of tasks) {
    try {
      const data = await t.run()
      await writeEnvelope(t.id, { ok: true, builtAt, data })
    } catch (err) {
      const message = (err as Error).message ?? String(err)
      console.error(`  ${t.id} failed: ${message}`)
      await writeEnvelope(t.id, { ok: false, builtAt, error: message })
      failures.push(t.id)
    }
  }

  if (failures.length) {
    console.error(
      `\n${failures.length} of ${tasks.length} snapshot(s) failed: ${failures.join(', ')}`
    )
    console.error(
      'Continuing so the deploy can still publish the remaining reels.'
    )
    // Optional strict mode: set BUILD_SNAPSHOTS_STRICT=1 to fail the build
    // hard on any individual failure (e.g. for a release pipeline).
    if (process.env.BUILD_SNAPSHOTS_STRICT === '1') {
      process.exit(1)
    }
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
