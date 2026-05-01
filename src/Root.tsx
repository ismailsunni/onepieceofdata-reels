import { Composition } from 'remotion'
import { TopBounties, TopBountiesProps } from './compositions/TopBounties/TopBounties'
import { fetchTopBounties } from './compositions/TopBounties/fetch'
import {
  EastBlueWeakest,
  EastBlueWeakestProps,
  totalFrames as eastBlueWeakestFrames,
} from './compositions/EastBlueWeakest/EastBlueWeakest'
import { fetchSeaCards } from './compositions/EastBlueWeakest/fetch'

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
        defaultProps={{ cards: [] }}
        calculateMetadata={async ({ props }) => {
          const cards = await fetchSeaCards()
          return {
            props: { ...props, cards },
            durationInFrames: eastBlueWeakestFrames(cards.length),
          }
        }}
      />
    </>
  )
}
