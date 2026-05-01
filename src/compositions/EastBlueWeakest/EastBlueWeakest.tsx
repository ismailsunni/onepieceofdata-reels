import {
  AbsoluteFill,
  Img,
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
export const RECAP_FRAMES = 210 // 7s — long enough to read 7 rows
export const FINAL_FRAMES = 120 // 4s

export function totalFrames(cardCount: number): number {
  return (
    TITLE_FRAMES +
    SUBTITLE_FRAMES +
    cardCount * CARD_FRAMES +
    RECAP_FRAMES +
    FINAL_FRAMES
  )
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

const FOOTER_TEXT = 'onepieceofdata.com'

function Footer() {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 24,
        left: 0,
        right: 0,
        textAlign: 'center',
        fontSize: 22,
        fontWeight: 600,
        letterSpacing: 4,
        color: 'rgba(255,255,255,0.65)',
        textTransform: 'lowercase',
        fontFamily: SANS,
        textShadow: '0 1px 4px rgba(0,0,0,0.6)',
        pointerEvents: 'none',
        zIndex: 10,
      }}
    >
      {FOOTER_TEXT}
    </div>
  )
}

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
        durationInFrames={RECAP_FRAMES}
      >
        <RecapCard cards={cards} />
      </Sequence>

      <Sequence
        from={
          TITLE_FRAMES +
          SUBTITLE_FRAMES +
          cards.length * CARD_FRAMES +
          RECAP_FRAMES
        }
        durationInFrames={FINAL_FRAMES}
      >
        <FinalCard />
      </Sequence>

      <Footer />
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
        <div
          style={{
            marginTop: 36,
            fontSize: 38,
            fontWeight: 600,
            letterSpacing: 1,
            color: 'rgba(255,255,255,0.85)',
          }}
        >
          See what the data says.
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
            Rank #{total - index} of {total}
          </div>
          <div
            style={{
              fontSize: 96,
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
          gap: 20,
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
              key={c.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 28,
                background: 'rgba(0,0,0,0.35)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 24,
                padding: '20px 32px',
                opacity: rowEnter,
                transform: `translateX(${(1 - rowEnter) * 60}px)`,
              }}
            >
              <div
                style={{
                  width: 70,
                  fontSize: 56,
                  fontWeight: 800,
                  color: theme.accent,
                  textAlign: 'center',
                }}
              >
                {i + 1}
              </div>
              <Avatar
                imageUrl={c.imageUrl}
                name={c.name}
                accent={theme.accent}
                size={120}
              />
              <div
                style={{
                  flex: 1,
                  fontSize: 50,
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
                  fontSize: 46,
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
          marginTop: 'auto',
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
            fontSize: 88,
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

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
}

function Avatar({
  imageUrl,
  name,
  accent,
  size,
}: {
  imageUrl: string | null
  name: string
  accent: string
  size: number
}) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        overflow: 'hidden',
        border: `3px solid ${accent}`,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.38,
        fontWeight: 800,
        color: accent,
        boxShadow: '0 6px 16px rgba(0,0,0,0.4)',
        flexShrink: 0,
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
        <span>{initials(name)}</span>
      )}
    </div>
  )
}

function RecapCard({ cards }: { cards: SeaCard[] }) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const titleEnter = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 110 },
  })
  return (
    <AbsoluteFill
      style={{
        background:
          'linear-gradient(180deg, #0b1d3a 0%, #1e3a8a 60%, #0b1d3a 100%)',
        padding: 70,
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          opacity: titleEnter,
          transform: `translateY(${(1 - titleEnter) * 20}px)`,
          textAlign: 'center',
          marginBottom: 40,
        }}
      >
        <div
          style={{
            fontSize: 26,
            letterSpacing: 8,
            color: '#fbbf24',
            fontWeight: 600,
            textTransform: 'uppercase',
          }}
        >
          Recap
        </div>
        <div
          style={{
            fontSize: 72,
            fontWeight: 900,
            lineHeight: 1.05,
            marginTop: 10,
          }}
        >
          Average bounty
          <br />
          per sea
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
        }}
      >
        {[...cards]
          .sort((a, b) => b.averageTop5 - a.averageTop5)
          .map((card, i) => {
          const theme = THEMES[card.theme]
          const top = card.top5[0]
          const rowEnter = spring({
            frame: frame - 14 - i * 7,
            fps,
            config: { damping: 18, stiffness: 130 },
          })
          const isTop = i === 0
          return (
            <div
              key={`${card.label}-${i}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 20,
                background: 'rgba(0,0,0,0.4)',
                border: `1px solid ${isTop ? '#fbbf24' : 'rgba(255,255,255,0.12)'}`,
                borderRadius: 20,
                padding: '14px 22px',
                opacity: rowEnter,
                transform: `translateX(${(1 - rowEnter) * 60}px)`,
              }}
            >
              <div
                style={{
                  width: 50,
                  fontSize: 36,
                  fontWeight: 800,
                  color: theme.accent,
                  textAlign: 'center',
                }}
              >
                {i + 1}
              </div>
              <Avatar
                imageUrl={top?.imageUrl ?? null}
                name={top?.name ?? '?'}
                accent={theme.accent}
                size={84}
              />
              <div
                style={{
                  flex: 1,
                  fontSize: 36,
                  fontWeight: 700,
                  lineHeight: 1.1,
                  whiteSpace: 'pre-line',
                }}
              >
                {card.label}
              </div>
              <div
                style={{
                  fontSize: 40,
                  fontWeight: 800,
                  color: theme.accent,
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {formatBerry(card.averageTop5)}
              </div>
            </div>
          )
        })}
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
