import {
  AbsoluteFill,
  interpolate,
  Sequence,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion'
import type { SeaCard } from './fetch'
import { formatBerry } from '../../lib/format'

export type EastBlueWeakestProps = {
  cards: SeaCard[]
} & Record<string, unknown>

// Per-card timing (in frames at 30fps).
export const TITLE_FRAMES = 75 // 2.5s
export const SUBTITLE_FRAMES = 45 // 1.5s
export const CARD_FRAMES = 120 // 4s per sea card
export const FINAL_FRAMES = 120 // 4s

export function totalFrames(cardCount: number): number {
  return TITLE_FRAMES + SUBTITLE_FRAMES + cardCount * CARD_FRAMES + FINAL_FRAMES
}

const THEMES: Record<
  SeaCard['theme'],
  { gradient: string; accent: string; label: string }
> = {
  'east-blue-clean': {
    gradient: 'linear-gradient(180deg, #0c1330 0%, #1d2a6b 100%)',
    accent: '#94a3b8',
    label: 'EAST BLUE',
  },
  'east-blue': {
    gradient: 'linear-gradient(180deg, #0c1330 0%, #2563eb 100%)',
    accent: '#60a5fa',
    label: 'EAST BLUE',
  },
  west: {
    gradient: 'linear-gradient(180deg, #042f2e 0%, #0d9488 100%)',
    accent: '#5eead4',
    label: 'WEST BLUE',
  },
  north: {
    gradient: 'linear-gradient(180deg, #1e1b4b 0%, #4338ca 100%)',
    accent: '#a5b4fc',
    label: 'NORTH BLUE',
  },
  south: {
    gradient: 'linear-gradient(180deg, #134e4a 0%, #115e59 100%)',
    accent: '#7dd3fc',
    label: 'SOUTH BLUE',
  },
  'grand-line': {
    gradient: 'linear-gradient(180deg, #451a03 0%, #b45309 100%)',
    accent: '#fbbf24',
    label: 'GRAND LINE',
  },
  'new-world': {
    gradient: 'linear-gradient(180deg, #450a0a 0%, #b91c1c 100%)',
    accent: '#fda4af',
    label: 'NEW WORLD',
  },
}

const SANS = 'system-ui, -apple-system, sans-serif'

export function EastBlueWeakest({ cards }: EastBlueWeakestProps) {
  return (
    <AbsoluteFill style={{ background: '#000', fontFamily: SANS, color: 'white' }}>
      <Sequence durationInFrames={TITLE_FRAMES}>
        <TitleCard />
      </Sequence>

      <Sequence from={TITLE_FRAMES} durationInFrames={SUBTITLE_FRAMES}>
        <SubtitleCard />
      </Sequence>

      {cards.map((card, i) => {
        const start = TITLE_FRAMES + SUBTITLE_FRAMES + i * CARD_FRAMES
        return (
          <Sequence
            key={`${card.label}-${i}`}
            from={start}
            durationInFrames={CARD_FRAMES}
          >
            <SeaCardView card={card} index={i} total={cards.length} />
          </Sequence>
        )
      })}

      <Sequence
        from={TITLE_FRAMES + SUBTITLE_FRAMES + cards.length * CARD_FRAMES}
        durationInFrames={FINAL_FRAMES}
      >
        <FinalCard />
      </Sequence>
    </AbsoluteFill>
  )
}

function TitleCard() {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const enter = spring({ frame, fps, config: { damping: 12, stiffness: 90 } })
  const fade = interpolate(frame, [TITLE_FRAMES - 12, TITLE_FRAMES], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  return (
    <AbsoluteFill
      style={{
        background:
          'linear-gradient(180deg, #0b1d3a 0%, #1e3a8a 50%, #0b1d3a 100%)',
        opacity: fade,
        padding: 80,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          transform: `scale(${0.85 + enter * 0.15})`,
          opacity: enter,
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontSize: 28,
            letterSpacing: 10,
            color: '#fbbf24',
            textTransform: 'uppercase',
            fontWeight: 600,
            marginBottom: 24,
          }}
        >
          One Piece Bounty Check
        </div>
        <div
          style={{
            fontSize: 110,
            fontWeight: 900,
            lineHeight: 1.05,
            letterSpacing: -2,
          }}
        >
          Is East Blue
          <br />
          really the
          <br />
          <span style={{ color: '#fbbf24' }}>weakest?</span>
        </div>
      </div>
    </AbsoluteFill>
  )
}

function SubtitleCard() {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const enter = spring({ frame, fps, config: { damping: 14, stiffness: 110 } })
  return (
    <AbsoluteFill
      style={{
        background: '#0b1d3a',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 80,
      }}
    >
      <div
        style={{
          opacity: enter,
          transform: `translateY(${(1 - enter) * 20}px)`,
          fontSize: 64,
          fontWeight: 700,
          textAlign: 'center',
          lineHeight: 1.2,
        }}
      >
        Top 5 bounties per sea
        <div
          style={{
            fontSize: 36,
            color: '#fbbf24',
            marginTop: 24,
            fontWeight: 500,
          }}
        >
          Sorted from weakest average →
        </div>
      </div>
    </AbsoluteFill>
  )
}

function SeaCardView({
  card,
  index,
  total,
}: {
  card: SeaCard
  index: number
  total: number
}) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const theme = THEMES[card.theme]
  const enter = spring({ frame, fps, config: { damping: 16, stiffness: 110 } })
  const isFinalReveal = index === total - 1

  return (
    <AbsoluteFill
      style={{
        background: theme.gradient,
        padding: 70,
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 40,
          opacity: enter,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 24,
              letterSpacing: 6,
              color: theme.accent,
              fontWeight: 600,
              textTransform: 'uppercase',
            }}
          >
            Rank #{index + 1} of {total}
          </div>
          <div
            style={{
              fontSize: 80,
              fontWeight: 900,
              lineHeight: 1,
              marginTop: 8,
              whiteSpace: 'pre-line',
            }}
          >
            {card.label}
          </div>
        </div>
        {isFinalReveal && (
          <div
            style={{
              fontSize: 36,
              fontWeight: 800,
              color: '#fbbf24',
              border: '3px solid #fbbf24',
              padding: '8px 18px',
              borderRadius: 16,
              transform: 'rotate(-6deg)',
              marginTop: 16,
            }}
          >
            STRONGEST
          </div>
        )}
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
          flex: 1,
        }}
      >
        {card.top5.map((c, i) => {
          const rowEnter = spring({
            frame: frame - 8 - i * 6,
            fps,
            config: { damping: 18, stiffness: 130 },
          })
          return (
            <div
              key={c.name}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 24,
                background: 'rgba(0,0,0,0.35)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 20,
                padding: '18px 28px',
                opacity: rowEnter,
                transform: `translateX(${(1 - rowEnter) * 60}px)`,
              }}
            >
              <div
                style={{
                  width: 56,
                  fontSize: 40,
                  fontWeight: 800,
                  color: theme.accent,
                  textAlign: 'center',
                }}
              >
                {i + 1}
              </div>
              <div
                style={{
                  flex: 1,
                  fontSize: 38,
                  fontWeight: 700,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {c.name}
              </div>
              <div
                style={{
                  fontSize: 36,
                  fontWeight: 800,
                  color: theme.accent,
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {formatBerry(c.bounty)}
              </div>
            </div>
          )
        })}
      </div>

      <div
        style={{
          marginTop: 32,
          padding: '24px 32px',
          borderRadius: 24,
          background: 'rgba(0,0,0,0.45)',
          border: `2px solid ${theme.accent}`,
          textAlign: 'center',
          opacity: enter,
        }}
      >
        <div
          style={{
            fontSize: 22,
            letterSpacing: 4,
            color: theme.accent,
            fontWeight: 600,
            textTransform: 'uppercase',
          }}
        >
          Average of top 5
        </div>
        <div
          style={{
            fontSize: 72,
            fontWeight: 900,
            color: 'white',
            lineHeight: 1,
            marginTop: 6,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {formatBerry(card.averageTop5)}
        </div>
      </div>
    </AbsoluteFill>
  )
}

function FinalCard() {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const enter = spring({ frame, fps, config: { damping: 12, stiffness: 80 } })
  const punchEnter = spring({
    frame: frame - 30,
    fps,
    config: { damping: 10, stiffness: 110 },
  })
  return (
    <AbsoluteFill
      style={{
        background:
          'linear-gradient(180deg, #0b1d3a 0%, #1e3a8a 50%, #0b1d3a 100%)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 80,
      }}
    >
      <div
        style={{
          opacity: enter,
          textAlign: 'center',
          fontSize: 72,
          fontWeight: 800,
          lineHeight: 1.2,
        }}
      >
        So… is{' '}
        <span style={{ color: '#fbbf24' }}>East Blue</span>
        <br />
        really the weakest?
      </div>
      <div
        style={{
          marginTop: 60,
          opacity: punchEnter,
          transform: `scale(${0.7 + punchEnter * 0.3})`,
          fontSize: 40,
          fontWeight: 700,
          color: '#fbbf24',
          textAlign: 'center',
          lineHeight: 1.3,
        }}
      >
        It depends who you count.
      </div>
    </AbsoluteFill>
  )
}
