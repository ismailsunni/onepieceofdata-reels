import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion'
import type { LowBountyRow } from './fetch'
import { formatBerry } from '../../lib/format'

export type LowestBountiesProps = {
  rows: LowBountyRow[]
} & Record<string, unknown>

const TITLE_DURATION = 28
const ROW_STAGGER = 16

// Title sits big and centered through CENTER_HOLD (~0.5s at 30fps), then slides
// up into its header slot (shrinking to normal size) by TITLE_SETTLED.
const CENTER_HOLD = 15
const TITLE_SETTLED = 43
const SETTLE = 24
const END_HOLD = 60

// Reveal runs bottom-up (#N first, #1 last) so the absurdly cheap #1 lands as
// the punchline. Duration = title + every row staggered in + a hold to read.
export function totalFramesFor(rowCount: number): number {
  const lastStart = TITLE_DURATION + Math.max(0, rowCount - 1) * ROW_STAGGER
  return lastStart + SETTLE + END_HOLD
}

const AVATAR = 100

export function LowestBounties({ rows }: LowestBountiesProps) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // Title pops in big and centered (no fade), holds, then moves up while
  // shrinking to its normal header size as the rows fill in from below.
  const titleY = interpolate(frame, [CENTER_HOLD, TITLE_SETTLED], [800, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.cubic),
  })
  const titleScale = interpolate(
    frame,
    [CENTER_HOLD, TITLE_SETTLED],
    [1.45, 1],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.inOut(Easing.cubic),
    }
  )

  return (
    <AbsoluteFill
      style={{
        background:
          'linear-gradient(165deg, #22d3ee 0%, #3b82f6 45%, #8b5cf6 100%)',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: 'white',
        padding: '72px 56px',
      }}
    >
      <div
        style={{
          textAlign: 'center',
          marginTop: 12,
          marginBottom: 44,
          transform: `translateY(${titleY}px) scale(${titleScale})`,
        }}
      >
        <div
          style={{
            fontSize: 30,
            letterSpacing: 8,
            color: '#fde047',
            textTransform: 'uppercase',
            fontWeight: 700,
            textShadow: '0 2px 8px rgba(0,0,0,0.35)',
          }}
        >
          Wanted — for very little
        </div>
        <div
          style={{
            fontSize: 76,
            fontWeight: 800,
            marginTop: 8,
            lineHeight: 1.02,
            textShadow: '0 3px 12px rgba(0,0,0,0.4)',
          }}
        >
          10 Lowest Bounties
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {rows.map((row, i) => {
          // i === 0 is the cheapest (#1) and reveals last.
          const rank = i + 1
          const isLowest = i === 0
          const rowStart =
            TITLE_DURATION + (rows.length - 1 - i) * ROW_STAGGER
          const enter = spring({
            frame: frame - rowStart,
            fps,
            config: { damping: 14, stiffness: 120 },
          })
          // Gold pop when the cheapest pirate finally lands.
          const pop = isLowest
            ? interpolate(frame - rowStart, [0, 8, 16], [0, 1, 0], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              })
            : 0

          return (
            <div
              key={row.id}
              style={{
                opacity: enter,
                transform: `translateX(${(1 - enter) * -60}px)`,
                display: 'flex',
                alignItems: 'center',
                gap: 24,
                background: isLowest
                  ? 'rgba(253,224,71,0.92)'
                  : 'rgba(255,255,255,0.16)',
                border: isLowest
                  ? '3px solid #ffffff'
                  : '1px solid rgba(255,255,255,0.28)',
                boxShadow: isLowest
                  ? `0 0 ${22 + pop * 44}px rgba(253,224,71,${0.5 + pop * 0.45})`
                  : '0 2px 10px rgba(0,0,0,0.12)',
                borderRadius: 22,
                padding: '16px 30px 16px 20px',
              }}
            >
              <div
                style={{
                  width: 62,
                  fontSize: 56,
                  fontWeight: 800,
                  color: isLowest ? '#b91c1c' : '#ffffff',
                  textAlign: 'center',
                  fontVariantNumeric: 'tabular-nums',
                  textShadow: isLowest
                    ? 'none'
                    : '0 1px 4px rgba(0,0,0,0.3)',
                }}
              >
                {rank}
              </div>

              <Avatar
                imageUrl={row.imageUrl}
                name={row.name}
                ring={isLowest ? '#b91c1c' : '#ffffff'}
              />

              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 50,
                    fontWeight: 700,
                    color: isLowest ? '#1a0606' : '#ffffff',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    textShadow: isLowest
                      ? 'none'
                      : '0 1px 4px rgba(0,0,0,0.3)',
                  }}
                >
                  {row.name.replace(/_/g, ' ')}
                </div>
                {isLowest && (
                  <div
                    style={{
                      fontSize: 26,
                      color: '#b91c1c',
                      fontWeight: 700,
                      marginTop: 2,
                    }}
                  >
                    the cheapest pirate in the seas
                  </div>
                )}
              </div>

              <div
                style={{
                  fontSize: 48,
                  fontWeight: 800,
                  color: isLowest ? '#b91c1c' : '#fde047',
                  fontVariantNumeric: 'tabular-nums',
                  textShadow: isLowest ? 'none' : '0 1px 4px rgba(0,0,0,0.3)',
                }}
              >
                {formatBerry(row.bounty)}
              </div>
            </div>
          )
        })}
      </div>

      <Watermark />
    </AbsoluteFill>
  )
}

function Avatar({
  imageUrl,
  name,
  ring,
}: {
  imageUrl: string | null
  name: string
  ring: string
}) {
  return (
    <div
      style={{
        width: AVATAR,
        height: AVATAR,
        borderRadius: AVATAR / 2,
        overflow: 'hidden',
        flexShrink: 0,
        background: 'rgba(0,0,0,0.2)',
        boxShadow: `0 0 0 3px ${ring}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {imageUrl ? (
        <Img
          src={imageUrl}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'top',
          }}
        />
      ) : (
        <span style={{ fontSize: AVATAR * 0.46, fontWeight: 800, color: '#fff' }}>
          {name.charAt(0)}
        </span>
      )}
    </div>
  )
}

function Watermark() {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 40,
        left: 0,
        right: 0,
        textAlign: 'center',
        fontSize: 22,
        letterSpacing: '0.1em',
        color: 'rgba(255,255,255,0.7)',
        fontWeight: 600,
      }}
    >
      onepieceofdata.com
    </div>
  )
}
