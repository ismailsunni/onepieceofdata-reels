import {
  AbsoluteFill,
  Audio,
  Img,
  interpolate,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion'
import type { SeaCard } from './fetch'
import { SITE } from '../../components/Watermark'
import { formatBerry } from '../../lib/format'

export type EastBlueWeakestProps = {
  cards: SeaCard[]
  latestChapter: number | null
} & Record<string, unknown>

// Per-card timing (in frames at 30fps). No baked-in narration — the
// user records voice-over in post, so each scene only needs to be long
// enough for its visual beat.
export const TITLE_FRAMES = 75 // 2.5s
export const SUBTITLE_FRAMES = 45 // 1.5s
export const CARD_FRAMES = 90 // 3s per sea card
export const RECAP_FRAMES = 150 // 5s
export const FINAL_FRAMES = 120 // 4s — loops in place

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

const FOOTER_SITE = SITE

function Footer({ latestChapter }: { latestChapter: number | null }) {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 20,
        left: 0,
        right: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4,
        fontFamily: SANS,
        textShadow: '0 1px 4px rgba(0,0,0,0.6)',
        pointerEvents: 'none',
        zIndex: 10,
      }}
    >
      <div
        style={{
          fontSize: 22,
          fontWeight: 600,
          letterSpacing: 4,
          color: 'rgba(255,255,255,0.7)',
          textTransform: 'lowercase',
        }}
      >
        {FOOTER_SITE}
      </div>
      {latestChapter !== null && (
        <div
          style={{
            fontSize: 16,
            fontWeight: 500,
            letterSpacing: 2,
            color: 'rgba(255,255,255,0.5)',
            textTransform: 'lowercase',
          }}
        >
          data through chapter {latestChapter}
        </div>
      )}
    </div>
  )
}

export function EastBlueWeakest({
  cards,
  latestChapter,
}: EastBlueWeakestProps) {
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

      <Footer latestChapter={latestChapter} />
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
          fontSize: 96,
          fontWeight: 800,
          textAlign: 'center',
          lineHeight: 1.1,
          letterSpacing: -1,
        }}
      >
        Top 5 bounties
        <br />
        per sea
        <div
          style={{
            fontSize: 44,
            color: '#fbbf24',
            marginTop: 36,
            fontWeight: 600,
            letterSpacing: 0,
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
    <>
      <Sequence from={SCAN_START}>
        <Audio src={staticFile('sfx/scan.mp3')} />
      </Sequence>
      <Sequence from={BOOM_FRAME}>
        <Audio src={staticFile('sfx/boom.mp3')} />
      </Sequence>

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

      <ListWithScan card={card} accent={theme.accent} />

      <div
        style={{
          marginTop: 'auto',
          marginBottom: 40,
          padding: '28px 36px',
          borderRadius: 24,
          background: 'rgba(0,0,0,0.45)',
          border: `2px solid ${theme.accent}`,
          textAlign: 'center',
          opacity: enter,
        }}
      >
        <div
          style={{
            fontSize: 24,
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
            fontSize: 96,
            fontWeight: 900,
            color: 'white',
            lineHeight: 1,
            marginTop: 8,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {formatBerry(card.averageTop5)}
        </div>
      </div>
    </AbsoluteFill>
    </>
  )
}

// Frame budget for the per-card scan animation. The list appears at
// SCAN_START, ticks 5 -> 4 -> 3 -> 2 -> 1 once per TICK_GAP frames, holds
// for SCAN_HOLD, then BOOM-scales row #1.
export const SCAN_START = 6 // wait a beat after the card label slides in
export const TICK_GAP = 4 // ~0.13s between ticks — fast scan
export const SCAN_HOLD = 9 // 0.3s pause on #1
export const BOOM_DURATION = 18 // 0.6s pulse
export const BOOM_FRAME = SCAN_START + 4 * TICK_GAP + SCAN_HOLD

function ListWithScan({ card, accent }: { card: SeaCard; accent: string }) {
  const frame = useCurrentFrame()

  // Tick frames in display-rank order (#1 at index 0, #5 at index 4).
  // Scan visits ranks 5 -> 1, so the *first* tick lands on rank 5
  // (display index 4), the *last* tick lands on rank 1 (display index 0).
  const tickFor = (i: number) => SCAN_START + (4 - i) * TICK_GAP
  const lastTick = tickFor(0)
  const boomStart = lastTick + SCAN_HOLD

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}
    >
      {card.top5.map((c, i) => {
        const isFirst = i === 0
        const tick = tickFor(i)
        const sinceTick = frame - tick
        // Brief pop when the scan lands on this row (does not apply to
        // #1 — that gets the bigger BOOM treatment instead).
        const tickPulse =
          !isFirst && sinceTick >= 0 && sinceTick < 8
            ? 1 + Math.sin((sinceTick / 8) * Math.PI) * 0.06
            : 1
        // BOOM on #1 — short pop after the hold. Kept modest so the
        // 1080-wide row never overflows the card edge.
        const boomT = (frame - boomStart) / BOOM_DURATION
        const boom =
          isFirst && boomT >= 0 && boomT <= 1
            ? 1 + Math.sin(boomT * Math.PI) * 0.08
            : 1
        // Size hierarchy comes from fontSize/padding/avatar — no base
        // scale, so rows always fit within the card width.
        const scale = tickPulse * boom

        const baseOpacity = isFirst ? 1 : 0.62
        const baseGlow = isFirst
          ? `0 0 28px ${accent}55, 0 0 48px ${accent}33`
          : 'none'
        const boomGlow =
          isFirst && boomT >= 0 && boomT <= 1
            ? `0 0 ${28 + 40 * Math.sin(boomT * Math.PI)}px ${accent}, 0 0 80px ${accent}88`
            : baseGlow

        return (
          <div
            key={c.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: isFirst ? 28 : 22,
              background: isFirst
                ? 'rgba(0,0,0,0.55)'
                : 'rgba(0,0,0,0.3)',
              border: isFirst
                ? `2px solid ${accent}`
                : '1px solid rgba(255,255,255,0.1)',
              borderRadius: 24,
              padding: isFirst ? '22px 32px' : '14px 26px',
              transform: `scale(${scale})`,
              transformOrigin: 'center center',
              opacity: baseOpacity,
              boxShadow: boomGlow,
              transition: 'box-shadow 0s',
            }}
          >
            <div
              style={{
                width: isFirst ? 80 : 60,
                fontSize: isFirst ? 64 : 44,
                fontWeight: 800,
                color: accent,
                textAlign: 'center',
                textShadow: isFirst ? `0 0 16px ${accent}88` : 'none',
              }}
            >
              {i + 1}
            </div>
            <Avatar
              imageUrl={c.imageUrl}
              name={c.name}
              accent={accent}
              size={isFirst ? 130 : 95}
            />
            <div
              style={{
                flex: 1,
                fontSize: isFirst ? 50 : 38,
                fontWeight: isFirst ? 800 : 600,
                color: isFirst ? 'white' : 'rgba(255,255,255,0.85)',
                lineHeight: 1.05,
                wordBreak: 'break-word',
              }}
            >
              {c.name}
            </div>
            <div
              style={{
                fontSize: isFirst ? 50 : 38,
                fontWeight: 800,
                color: accent,
                fontVariantNumeric: 'tabular-nums',
                textShadow: isFirst ? `0 0 14px ${accent}aa` : 'none',
              }}
            >
              {formatBerry(c.bounty)}
            </div>
          </div>
        )
      })}
    </div>
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

// Recap-card scan timing. Title intro lands first, then a slower scan
// across all 7 rows ending with a BOOM on row #1.
const RECAP_SCAN_START = 30
const RECAP_TICK_GAP = 4

function RecapCard({ cards }: { cards: SeaCard[] }) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const titleEnter = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 110 },
  })

  const sorted = [...cards].sort((a, b) => b.averageTop5 - a.averageTop5)
  const lastTick =
    RECAP_SCAN_START + (sorted.length - 1) * RECAP_TICK_GAP
  const recapBoomFrame = lastTick + SCAN_HOLD

  return (
    <>
      <Sequence from={RECAP_SCAN_START}>
        <Audio src={staticFile('sfx/scan-7.mp3')} />
      </Sequence>
      <Sequence from={recapBoomFrame}>
        <Audio src={staticFile('sfx/boom.mp3')} />
      </Sequence>

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
        {sorted.map((card, i) => {
          const theme = THEMES[card.theme]
          const top = card.top5[0]
          const isFirst = i === 0
          const tick =
            RECAP_SCAN_START + (sorted.length - 1 - i) * RECAP_TICK_GAP
          const sinceTick = frame - tick
          const tickPulse =
            !isFirst && sinceTick >= 0 && sinceTick < 8
              ? 1 + Math.sin((sinceTick / 8) * Math.PI) * 0.05
              : 1
          const boomT = (frame - recapBoomFrame) / BOOM_DURATION
          const boom =
            isFirst && boomT >= 0 && boomT <= 1
              ? 1 + Math.sin(boomT * Math.PI) * 0.07
              : 1
          const scale = tickPulse * boom

          const baseGlow = isFirst
            ? `0 0 28px ${theme.accent}55, 0 0 48px ${theme.accent}33`
            : 'none'
          const boomGlow =
            isFirst && boomT >= 0 && boomT <= 1
              ? `0 0 ${28 + 40 * Math.sin(boomT * Math.PI)}px ${theme.accent}, 0 0 80px ${theme.accent}88`
              : baseGlow

          return (
            <div
              key={`${card.label}-${i}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: isFirst ? 26 : 22,
                background: isFirst
                  ? 'rgba(0,0,0,0.55)'
                  : 'rgba(0,0,0,0.35)',
                border: isFirst
                  ? `2px solid ${theme.accent}`
                  : '1px solid rgba(255,255,255,0.1)',
                borderRadius: 22,
                padding: isFirst ? '22px 30px' : '14px 24px',
                opacity: isFirst ? 1 : 0.72,
                transform: `scale(${scale})`,
                transformOrigin: 'center center',
                boxShadow: boomGlow,
              }}
            >
              <div
                style={{
                  width: isFirst ? 76 : 58,
                  fontSize: isFirst ? 60 : 44,
                  fontWeight: 800,
                  color: theme.accent,
                  textAlign: 'center',
                  textShadow: isFirst ? `0 0 14px ${theme.accent}88` : 'none',
                }}
              >
                {i + 1}
              </div>
              <Avatar
                imageUrl={top?.imageUrl ?? null}
                name={top?.name ?? '?'}
                accent={theme.accent}
                size={isFirst ? 130 : 95}
              />
              <div
                style={{
                  flex: 1,
                  fontSize: isFirst ? 50 : 38,
                  fontWeight: isFirst ? 800 : 700,
                  color: isFirst ? 'white' : 'rgba(255,255,255,0.88)',
                  lineHeight: 1.05,
                  whiteSpace: 'pre-line',
                  wordBreak: 'break-word',
                }}
              >
                {card.label}
              </div>
              <div
                style={{
                  fontSize: isFirst ? 52 : 40,
                  fontWeight: 800,
                  color: theme.accent,
                  fontVariantNumeric: 'tabular-nums',
                  textShadow: isFirst ? `0 0 14px ${theme.accent}aa` : 'none',
                }}
              >
                {formatBerry(card.averageTop5)}
              </div>
            </div>
          )
        })}
      </div>
    </AbsoluteFill>
    </>
  )
}

function FinalCard() {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const enter = spring({ frame, fps, config: { damping: 12, stiffness: 80 } })
  const punchEnter = spring({
    frame: frame - 24,
    fps,
    config: { damping: 10, stiffness: 110 },
  })

  // Continuous heartbeat pulse on the question and tagline. Period 60
  // frames (2s) — calm, looped, IG keeps replaying the reel anyway so
  // this gives the end an "alive" feel.
  const beat = (Math.sin((frame / 30) * Math.PI * 2 - Math.PI / 2) + 1) / 2
  const headlineScale = 1 + beat * 0.04
  const taglineScale = 1 + beat * 0.06

  // Soft shimmer across the question word "really" — colour cycles.
  const shimmer = 0.5 + 0.5 * Math.sin((frame / 45) * Math.PI * 2)

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
          transform: `scale(${headlineScale})`,
          textAlign: 'center',
          fontSize: 72,
          fontWeight: 800,
          lineHeight: 1.2,
          textShadow: `0 0 ${20 + 30 * beat}px rgba(251,191,36,${0.25 + 0.4 * beat})`,
        }}
      >
        So… is{' '}
        <span style={{ color: '#fbbf24' }}>East Blue</span>
        <br />
        <span
          style={{
            color: `rgba(255,255,255,${0.7 + 0.3 * shimmer})`,
          }}
        >
          really
        </span>{' '}
        the weakest?
      </div>
      <div
        style={{
          marginTop: 60,
          opacity: punchEnter,
          transform: `scale(${(0.7 + punchEnter * 0.3) * taglineScale})`,
          fontSize: 40,
          fontWeight: 700,
          color: '#fbbf24',
          textAlign: 'center',
          lineHeight: 1.3,
          textShadow: `0 0 ${10 + 20 * beat}px rgba(251,191,36,${0.3 + 0.5 * beat})`,
        }}
      >
        It depends who you count.
      </div>
    </AbsoluteFill>
  )
}
