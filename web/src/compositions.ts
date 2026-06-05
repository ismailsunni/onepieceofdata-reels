// Browser-side registry mirroring src/Root.tsx. Each entry tells the
// gallery which composition component to render, what canvas it expects,
// where its prebaked snapshot JSON lives, and how to derive the
// durationInFrames from that snapshot.
import type { ComponentType } from 'react'

import {
  TopBounties,
  totalFramesFor as topBountiesFrames,
  type TopBountiesProps,
} from '../../src/compositions/TopBounties/TopBounties'
import {
  LowestBounties,
  totalFramesFor as lowestBountiesFrames,
} from '../../src/compositions/LowestBounties/LowestBounties'
import {
  EastBlueWeakest,
  totalFrames as eastBlueWeakestFrames,
  type EastBlueWeakestProps,
} from '../../src/compositions/EastBlueWeakest/EastBlueWeakest'
import {
  TopSnubbed,
  totalFrames as topSnubbedFrames,
} from '../../src/compositions/TopSnubbed/TopSnubbed'
import { First100Chapters } from '../../src/compositions/First100Chapters/First100Chapters'
import { VanishedPreSkip } from '../../src/compositions/VanishedPreSkip/VanishedPreSkip'
import {
  Top100Wishlist,
  SLIDE_WIDTH,
  SLIDE_HEIGHT,
} from '../../src/compositions/Top100Wishlist/Top100Wishlist'
import {
  AppearanceRace,
  RACE_WIDTH,
  RACE_HEIGHT,
  RACE_FPS,
  totalFramesFor as appearanceRaceFrames,
} from '../../src/compositions/AppearanceRace/AppearanceRace'
import type { AppearanceRaceSnapshot } from '../../src/compositions/AppearanceRace/fetch'
import {
  ArcLengthRanking,
  ARC_WIDTH,
  ARC_HEIGHT,
  ARC_FPS,
  totalFramesFor as arcLengthRankingFrames,
} from '../../src/compositions/ArcLengthRanking/ArcLengthRanking'
import type { ArcRankingSnapshot } from '../../src/compositions/ArcLengthRanking/fetch'

const REEL_WIDTH = 1080
const REEL_HEIGHT = 1920
const REEL_FPS = 30

export type CompositionKind = 'reel' | 'carousel' | 'video'

export type PublishStatus = 'draft' | 'scheduled' | 'published'

export type Platform = 'instagram' | 'tiktok' | 'youtube' | 'x'

export interface Publication {
  platform: Platform
  url: string
  /** ISO date (YYYY-MM-DD) the piece went live, if known. */
  publishedAt?: string
}

export interface CompositionEntry {
  id: string
  kind: CompositionKind
  title: string
  description: string
  /** ISO date (YYYY-MM-DD) the composition was first created. */
  createdAt: string
  status: PublishStatus
  /** Where this piece is posted. Omitted while it's still a draft. */
  publication?: Publication
  tags?: string[]
  component: ComponentType<Record<string, unknown>>
  width: number
  height: number
  fps: number
  snapshotPath: string
  durationInFrames: (snapshot: Record<string, unknown>) => number
}

// Ordered newest-first — most recently added composition at the top.
//
// `createdAt` is seeded from each composition's first git commit; `status` and
// `tags` are editorial. When a piece goes live, flip its status and add the
// publication, e.g.:
//
//   status: 'published',
//   publication: {
//     platform: 'instagram',
//     url: 'https://www.instagram.com/reel/XXXXXXXXXXX/',
//     publishedAt: '2026-06-01',
//   },
//
// Order in this array is irrelevant — COMPOSITIONS is sorted newest-first by
// `createdAt` at the bottom of the file.
const ENTRIES: CompositionEntry[] = [
  {
    id: 'LowestBounties',
    kind: 'reel',
    createdAt: '2026-06-03',
    status: 'draft',
    tags: ['bounties', 'pirates', 'ranking'],
    title: 'Lowest Bounties',
    description:
      'The 10 lowest confirmed bounties among pirates, revealed bottom-up so Chopper (฿1K) lands as the punchline. Ties broken by appearance count.',
    component: LowestBounties as ComponentType<Record<string, unknown>>,
    width: REEL_WIDTH,
    height: REEL_HEIGHT,
    fps: REEL_FPS,
    snapshotPath: 'snapshots/LowestBounties.json',
    durationInFrames: (snap) => {
      const rows = (snap as { rows?: unknown[] }).rows ?? []
      return lowestBountiesFrames(rows.length)
    },
  },
  {
    id: 'ArcLengthRanking',
    kind: 'reel',
    createdAt: '2026-05-29',
    status: 'published',
    publication: {
      platform: 'instagram',
      url: 'https://www.instagram.com/p/DY9PNUYREHr/',
      publishedAt: '2026-05-30',
    },
    tags: ['arcs', 'ranking', 'chapters'],
    title: 'Longest Arcs',
    description:
      'Every One Piece arc ranked by chapter count, revealed in story order — arcs that miss the top 10 get knocked off the board. Headlined by each arc’s main non-Straw-Hat character.',
    component: ArcLengthRanking as ComponentType<Record<string, unknown>>,
    width: ARC_WIDTH,
    height: ARC_HEIGHT,
    fps: ARC_FPS,
    snapshotPath: 'snapshots/ArcLengthRanking.json',
    durationInFrames: (snap) => {
      const inner = (snap as { snapshot?: ArcRankingSnapshot }).snapshot
      return arcLengthRankingFrames(inner ?? null)
    },
  },
  {
    id: 'AppearanceRace',
    kind: 'reel',
    createdAt: '2026-05-21',
    status: 'published',
    publication: {
      platform: 'instagram',
      url: 'https://www.instagram.com/p/DYopj1hxnaa/',
      publishedAt: '2026-05-22',
    },
    tags: ['appearances', 'pre-timeskip', 'bar-chart-race'],
    title: 'Appearance Race',
    description:
      'Who ran pre-timeskip One Piece besides the Straw Hats? Bar-chart race over the rolling 30-chapter window, Ch.1 → Marineford.',
    component: AppearanceRace as ComponentType<Record<string, unknown>>,
    width: RACE_WIDTH,
    height: RACE_HEIGHT,
    fps: RACE_FPS,
    snapshotPath: 'snapshots/AppearanceRace.json',
    durationInFrames: (snap) => {
      const inner = (snap as { snapshot?: AppearanceRaceSnapshot }).snapshot
      return appearanceRaceFrames(inner ?? null)
    },
  },
  {
    id: 'VanishedPreSkip',
    kind: 'carousel',
    createdAt: '2026-05-20',
    status: 'draft',
    tags: ['characters', 'pre-timeskip', 'missing'],
    title: 'Vanished Pre-Skip',
    description: 'Characters last seen before the time skip — a who’s-still-missing carousel.',
    component: VanishedPreSkip as ComponentType<Record<string, unknown>>,
    width: SLIDE_WIDTH,
    height: SLIDE_HEIGHT,
    fps: 1,
    snapshotPath: 'snapshots/VanishedPreSkip.json',
    durationInFrames: (snap) => {
      const slides = (snap as { slides?: unknown[] }).slides ?? []
      return Math.max(slides.length, 1)
    },
  },
  {
    id: 'First100Chapters',
    kind: 'carousel',
    createdAt: '2026-05-15',
    status: 'published',
    publication: {
      platform: 'instagram',
      url: 'https://www.instagram.com/p/DYY9PR0lNkK/',
      publishedAt: '2026-05-16',
    },
    tags: ['characters', 'east-blue', 'milestone'],
    title: 'First 100 Chapters',
    description: 'Carousel celebrating early-era characters at the 100-follower milestone.',
    component: First100Chapters as ComponentType<Record<string, unknown>>,
    width: SLIDE_WIDTH,
    height: SLIDE_HEIGHT,
    fps: 1,
    snapshotPath: 'snapshots/First100Chapters.json',
    durationInFrames: (snap) => {
      const slides = (snap as { slides?: unknown[] }).slides ?? []
      return Math.max(slides.length, 1)
    },
  },
  {
    id: 'TopSnubbed',
    kind: 'reel',
    createdAt: '2026-05-04',
    status: 'draft',
    tags: ['characters', 'popularity', 'screen-time'],
    title: 'Top Snubbed',
    description: 'Characters with the biggest gap between popularity and screen time.',
    component: TopSnubbed as ComponentType<Record<string, unknown>>,
    width: REEL_WIDTH,
    height: REEL_HEIGHT,
    fps: REEL_FPS,
    snapshotPath: 'snapshots/TopSnubbed.json',
    durationInFrames: (snap) => {
      const rows = (snap as { rows?: unknown[] }).rows ?? []
      return topSnubbedFrames(rows.length)
    },
  },
  {
    id: 'Top100Wishlist',
    kind: 'carousel',
    createdAt: '2026-05-06',
    status: 'published',
    publication: {
      platform: 'instagram',
      url: 'https://www.instagram.com/p/DYCWfkEFOtN/',
      publishedAt: '2026-05-07',
    },
    tags: ['community', 'wishlist', 'ranking'],
    title: 'Top 100 Wishlist',
    description: 'Ranked data-driven snapshot of the community wishlist.',
    component: Top100Wishlist as ComponentType<Record<string, unknown>>,
    width: SLIDE_WIDTH,
    height: SLIDE_HEIGHT,
    fps: 1,
    snapshotPath: 'snapshots/Top100Wishlist.json',
    durationInFrames: (snap) => {
      const slides = (snap as { slides?: unknown[] }).slides ?? []
      return Math.max(slides.length, 1)
    },
  },
  {
    id: 'EastBlueWeakest',
    kind: 'reel',
    createdAt: '2026-05-01',
    status: 'published',
    publication: {
      platform: 'instagram',
      url: 'https://www.instagram.com/p/DX1q4bYTdAF/',
      publishedAt: '2026-05-02',
    },
    tags: ['power-levels', 'east-blue'],
    title: 'East Blue Weakest',
    description: "Sea-by-sea breakdown of the world's softest fighters.",
    component: EastBlueWeakest as ComponentType<Record<string, unknown>>,
    width: REEL_WIDTH,
    height: REEL_HEIGHT,
    fps: REEL_FPS,
    snapshotPath: 'snapshots/EastBlueWeakest.json',
    durationInFrames: (snap) => {
      const cards = (snap as EastBlueWeakestProps).cards ?? []
      return eastBlueWeakestFrames(cards.length)
    },
  },
  {
    id: 'TopBounties',
    kind: 'reel',
    createdAt: '2026-05-01',
    status: 'published',
    publication: {
      platform: 'instagram',
      url: 'https://www.instagram.com/p/DZKkcQPR_Jf/',
      publishedAt: '2026-06-04',
    },
    tags: ['bounties', 'ranking'],
    title: 'Top Bounties',
    description:
      'The 10 highest bounties, revealed bottom-up to Gol D. Roger — with the seven-way ฿3.0B tie collapsed into one rank.',
    component: TopBounties as ComponentType<Record<string, unknown>>,
    width: REEL_WIDTH,
    height: REEL_HEIGHT,
    fps: REEL_FPS,
    snapshotPath: 'snapshots/TopBounties.json',
    durationInFrames: (snap) => {
      const entries = (snap as { entries?: unknown[] }).entries ?? []
      return topBountiesFrames(entries.length)
    },
  },
]

// Newest-first by creation date. localeCompare on ISO YYYY-MM-DD strings sorts
// chronologically; Array.prototype.sort is stable, so same-day entries keep
// their ENTRIES order.
export const COMPOSITIONS: CompositionEntry[] = [...ENTRIES].sort((a, b) =>
  b.createdAt.localeCompare(a.createdAt)
)

// Silence "imported but only used as type-info" warnings for prop shapes we
// rely on indirectly via component generics.
export type { TopBountiesProps }
