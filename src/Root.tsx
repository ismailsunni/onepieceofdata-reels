import { Composition } from 'remotion'
import { TopBounties, TopBountiesProps } from './compositions/TopBounties/TopBounties'
import { fetchTopBounties } from './compositions/TopBounties/fetch'
import {
  EastBlueWeakest,
  EastBlueWeakestProps,
  totalFrames as eastBlueWeakestFrames,
} from './compositions/EastBlueWeakest/EastBlueWeakest'
import {
  fetchLatestChapter,
  fetchSeaCards,
} from './compositions/EastBlueWeakest/fetch'
import {
  TopSnubbed,
  totalFrames as topSnubbedFrames,
} from './compositions/TopSnubbed/TopSnubbed'
import { loadSnubbedSnapshot } from './compositions/TopSnubbed/fetch'
import {
  Top100Wishlist,
  SLIDE_WIDTH,
  SLIDE_HEIGHT,
} from './compositions/Top100Wishlist/Top100Wishlist'
import { loadWishlistSnapshot } from './compositions/Top100Wishlist/fetch'
import { First100Chapters } from './compositions/First100Chapters/First100Chapters'
import { loadFirst100Snapshot } from './compositions/First100Chapters/fetch'
import { VanishedPreSkip } from './compositions/VanishedPreSkip/VanishedPreSkip'
import { loadVanishedSnapshot } from './compositions/VanishedPreSkip/fetch'

// Instagram Reels: 9:16 portrait, 1080x1920, 30fps.
const REEL_WIDTH = 1080
const REEL_HEIGHT = 1920
const REEL_FPS = 30

export function Root() {
  return (
    <>
      <Composition
        id="TopBounties"
        component={TopBounties}
        width={REEL_WIDTH}
        height={REEL_HEIGHT}
        fps={REEL_FPS}
        durationInFrames={REEL_FPS * 12}
        defaultProps={{ rows: [] }}
        calculateMetadata={async ({ props }) => {
          const rows = await fetchTopBounties(10)
          return { props: { ...props, rows } }
        }}
      />

      <Composition
        id="EastBlueWeakest"
        component={EastBlueWeakest}
        width={REEL_WIDTH}
        height={REEL_HEIGHT}
        fps={REEL_FPS}
        // Placeholder; calculateMetadata sets the real duration once we know
        // how many sea cards came back.
        durationInFrames={REEL_FPS * 30}
        defaultProps={{ cards: [], latestChapter: null }}
        calculateMetadata={async ({ props }) => {
          const [cards, latestChapter] = await Promise.all([
            fetchSeaCards(),
            fetchLatestChapter(),
          ])
          return {
            props: { ...props, cards, latestChapter },
            durationInFrames: eastBlueWeakestFrames(cards.length),
          }
        }}
      />
      <Composition
        id="TopSnubbed"
        component={TopSnubbed}
        width={REEL_WIDTH}
        height={REEL_HEIGHT}
        fps={REEL_FPS}
        durationInFrames={REEL_FPS * 18}
        defaultProps={{ rows: [], latestChapter: null }}
        calculateMetadata={async ({ props }) => {
          const { rows, throughChapter } = await loadSnubbedSnapshot(5)
          return {
            props: { ...props, rows, latestChapter: throughChapter },
            durationInFrames: topSnubbedFrames(rows.length),
          }
        }}
      />
      <Composition
        id="First100Chapters"
        component={First100Chapters}
        width={SLIDE_WIDTH}
        height={SLIDE_HEIGHT}
        fps={1}
        durationInFrames={1}
        defaultProps={{ slides: [], latestChapter: null }}
        calculateMetadata={async ({ props }) => {
          const { slides, latestChapter } = await loadFirst100Snapshot()
          return {
            props: { ...props, slides, latestChapter },
            durationInFrames: Math.max(slides.length, 1),
          }
        }}
      />
      <Composition
        id="VanishedPreSkip"
        component={VanishedPreSkip}
        width={SLIDE_WIDTH}
        height={SLIDE_HEIGHT}
        fps={1}
        durationInFrames={1}
        defaultProps={{ slides: [], latestChapter: null }}
        calculateMetadata={async ({ props }) => {
          const { slides, latestChapter } = await loadVanishedSnapshot()
          return {
            props: { ...props, slides, latestChapter },
            durationInFrames: Math.max(slides.length, 1),
          }
        }}
      />
      <Composition
        id="Top100Wishlist"
        component={Top100Wishlist}
        width={SLIDE_WIDTH}
        height={SLIDE_HEIGHT}
        // Carousel: 1 frame per slide. Render with `npm run carousel`.
        fps={1}
        durationInFrames={1}
        defaultProps={{ slides: [], latestChapter: null }}
        calculateMetadata={async ({ props }) => {
          const { slides, latestChapter } = await loadWishlistSnapshot()
          return {
            props: { ...props, slides, latestChapter },
            durationInFrames: Math.max(slides.length, 1),
          }
        }}
      />
    </>
  )
}
