// Browser-side registry mirroring src/Root.tsx. Each entry tells the
// gallery which composition component to render, what canvas it expects,
// where its prebaked snapshot JSON lives, and how to derive the
// durationInFrames from that snapshot.
import type { ComponentType } from 'react'

import {
  TopBounties,
  type TopBountiesProps,
} from '../../src/compositions/TopBounties/TopBounties'
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

export interface CompositionEntry {
  id: string
  kind: CompositionKind
  title: string
  description: string
  component: ComponentType<Record<string, unknown>>
  width: number
  height: number
  fps: number
  snapshotPath: string
  durationInFrames: (snapshot: Record<string, unknown>) => number
}

// Ordered newest-first — most recently added composition at the top.
export const COMPOSITIONS: CompositionEntry[] = [
  {
    id: 'ArcLengthRanking',
    kind: 'reel',
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
    title: 'Top Bounties',
    description: 'Highest active bounties as a 12s reel.',
    component: TopBounties as ComponentType<Record<string, unknown>>,
    width: REEL_WIDTH,
    height: REEL_HEIGHT,
    fps: REEL_FPS,
    snapshotPath: 'snapshots/TopBounties.json',
    durationInFrames: () => REEL_FPS * 12,
  },
]

// Silence "imported but only used as type-info" warnings for prop shapes we
// rely on indirectly via component generics.
export type { TopBountiesProps }
