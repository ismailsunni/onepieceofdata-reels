import {
  AbsoluteFill,
  Img,
  interpolate,
  Sequence,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion'
import type { SnubbedRow } from './fetch'
import { SITE } from '../../components/Watermark'

export type TopSnubbedProps = {
  rows: SnubbedRow[]
  latestChapter: number | null
} & Record<string, unknown>

// 30fps timing.
export const TITLE_FRAMES = 60 // 2s
export const CARD_FRAMES = 60 // 2s per character
export const RECAP_FRAMES = 108 // 3.6s — scan-7 ticks + boom on #1

export function totalFrames(rowCount: number): number {
  return TITLE_FRAMES + rowCount * CARD_FRAMES + RECAP_FRAMES
}

// IG safe zones (1080x1920): top ~210px username chip, bottom ~340px
// caption + reactions + CTA. Layout uses these as content insets.
const SAFE_TOP = 220
const SAFE_BOTTOM = 320

const SANS = 'system-ui, -apple-system, sans-serif'
const ACCENT = '#fbbf24'
const BG_GRADIENT =
  'linear-gradient(180deg, #2a0b3a 0%, #5b1d6e 45%, #1a0a2e 100%)'
const FOOTER_SITE = SITE

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
        border: `4px solid ${accent}`,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.38,
        fontWeight: 800,
        color: accent,
        boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
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

export function TopSnubbed({ rows, latestChapter }: TopSnubbedProps) {
  return (
    <AbsoluteFill style={{ background: '#000', fontFamily: SANS, color: 'white' }}>
      <Sequence durationInFrames={TITLE_FRAMES}>
        <TitleCard />
      </Sequence>

      {rows.map((row, i) => {
        // Reveal #5 first → #1 last so the climax is the most-snubbed.
        const reverseIdx = rows.length - 1 - i
        const start = TITLE_FRAMES + reverseIdx * CARD_FRAMES
        return (
          <Sequence
            key={row.id}
            from={start}
            durationInFrames={CARD_FRAMES}
          >
            <SnubbedCard row={row} rank={i + 1} />
          </Sequence>
        )
      })}

      <Sequence
        from={TITLE_FRAMES + rows.length * CARD_FRAMES}
        durationInFrames={RECAP_FRAMES}
      >
        <RecapCard rows={rows} />
      </Sequence>

      <Footer latestChapter={latestChapter} />
    </AbsoluteFill>
  )
}

function TitleCard() {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const enter = spring({ frame, fps, config: { damping: 12, stiffness: 90 } })
  const fade = interpolate(frame, [TITLE_FRAMES - 10, TITLE_FRAMES], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  return (
    <AbsoluteFill
      style={{
        background: BG_GRADIENT,
        opacity: fade,
        paddingLeft: 80,
        paddingRight: 80,
        paddingTop: SAFE_TOP,
        paddingBottom: SAFE_BOTTOM,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          transform: `scale(${0.9 + enter * 0.1})`,
          opacity: enter,
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontSize: 28,
            letterSpacing: 8,
            color: ACCENT,
            textTransform: 'uppercase',
            fontWeight: 600,
            marginBottom: 28,
          }}
        >
          Snubbed by the Fans
        </div>
        <div
          style={{
            fontSize: 116,
            fontWeight: 900,
            lineHeight: 1.05,
            letterSpacing: -3,
          }}
        >
          Oda drew them.
          <br />
          <span style={{ color: ACCENT }}>Fans forgot them.</span>
        </div>
        <div
          style={{
            marginTop: 36,
            fontSize: 36,
            fontWeight: 600,
            letterSpacing: 1,
            color: 'rgba(255,255,255,0.85)',
            lineHeight: 1.3,
          }}
        >
          Top snub: almost as many chapters
          <br />
          as <span style={{ color: ACCENT, fontWeight: 800 }}>Trafalgar Law</span>{' '}
          (voted #5).
        </div>
        <div
          style={{
            marginTop: 28,
            fontSize: 22,
            fontWeight: 600,
            letterSpacing: 4,
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.65)',
          }}
        >
          WT100 2026 · Mid-Term Ranking
        </div>
      </div>
    </AbsoluteFill>
  )
}

function SnubbedCard({ row, rank }: { row: SnubbedRow; rank: number }) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const enter = spring({ frame, fps, config: { damping: 16, stiffness: 110 } })
  const fade = interpolate(frame, [CARD_FRAMES - 8, CARD_FRAMES], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  return (
    <AbsoluteFill
      style={{
        background: BG_GRADIENT,
        opacity: fade,
          paddingLeft: 80,
          paddingRight: 80,
          paddingTop: SAFE_TOP,
          paddingBottom: SAFE_BOTTOM,
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* Rank badge */}
        <div
          style={{
            opacity: enter,
            fontSize: 36,
            letterSpacing: 8,
            color: ACCENT,
            textTransform: 'uppercase',
            fontWeight: 700,
          }}
        >
          Snub #{rank}
        </div>

        {/* Portrait */}
        <div
          style={{
            marginTop: 36,
            transform: `scale(${0.85 + enter * 0.15})`,
            opacity: enter,
          }}
        >
          <Avatar
            imageUrl={row.imageUrl}
            name={row.name}
            accent={ACCENT}
            size={420}
          />
        </div>

        {/* Name */}
        <div
          style={{
            marginTop: 36,
            fontSize: 78,
            fontWeight: 900,
            textAlign: 'center',
            lineHeight: 1.05,
            opacity: enter,
            letterSpacing: -1,
          }}
        >
          {row.name}
        </div>

        {/* Big appearance number */}
        <div
          style={{
            marginTop: 32,
            opacity: enter,
            transform: `translateY(${(1 - enter) * 24}px)`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              fontSize: 180,
              fontWeight: 900,
              color: ACCENT,
              lineHeight: 1,
              fontVariantNumeric: 'tabular-nums',
              textShadow: '0 8px 24px rgba(0,0,0,0.5)',
            }}
          >
            {row.appearanceCount}
          </div>
          <div
            style={{
              fontSize: 28,
              letterSpacing: 6,
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.75)',
              fontWeight: 600,
              marginTop: 8,
            }}
          >
            Chapters
          </div>
        </div>

        {/* Comparison callout */}
        {row.comparables.length > 0 && (
          <div
            style={{
              marginTop: 32,
              opacity: enter,
              transform: `translateY(${(1 - enter) * 32}px)`,
              background: 'rgba(0,0,0,0.45)',
              border: `2px solid ${ACCENT}`,
              borderRadius: 20,
              padding: '20px 32px',
              textAlign: 'center',
              maxWidth: 880,
            }}
          >
            <div
              style={{
                fontSize: 22,
                letterSpacing: 4,
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.65)',
                fontWeight: 600,
              }}
            >
              Similar appearances to
            </div>
            <div
              style={{
                marginTop: 10,
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
                fontSize: 34,
                fontWeight: 800,
                lineHeight: 1.2,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {row.comparables.map((c) => (
                <div key={c.rank}>
                  <span style={{ color: ACCENT }}>#{c.rank}</span> {c.name}{' '}
                  <span style={{ color: 'rgba(255,255,255,0.6)' }}>
                    ({c.appearances})
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
    </AbsoluteFill>
  )
}

// Recap: list ticks bottom-up so #1 Kin'emon lands last.
const RECAP_SCAN_START = 18
const RECAP_TICK_GAP = 8

function RecapCard({ rows }: { rows: SnubbedRow[] }) {
  const frame = useCurrentFrame()
  const { fps, durationInFrames } = useVideoConfig()
  const titleEnter = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 110 },
  })
  const lastTick = RECAP_SCAN_START + (rows.length - 1) * RECAP_TICK_GAP
  // After the bottom-up reveal lands on #1, hold briefly, then highlight #1.
  const accentFrame = lastTick + 8
  // Loop seam: fade the recap to black over the final 10 frames so the cut
  // back to the title card on IG's loop doesn't pop.
  const loopFade = interpolate(
    frame,
    [durationInFrames - 10, durationInFrames - 1],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  )

  return (
    <AbsoluteFill
      style={{
        background: BG_GRADIENT,
        paddingLeft: 80,
        paddingRight: 80,
        paddingTop: SAFE_TOP,
        paddingBottom: SAFE_BOTTOM,
        flexDirection: 'column',
        opacity: loopFade,
      }}
    >
        <div
          style={{
            textAlign: 'center',
            marginBottom: 36,
            opacity: titleEnter,
          }}
        >
          <div
            style={{
              fontSize: 26,
              letterSpacing: 8,
              color: ACCENT,
              textTransform: 'uppercase',
              fontWeight: 600,
            }}
          >
            WT100 2026 · The Snub List
          </div>
          <div
            style={{
              fontSize: 64,
              fontWeight: 900,
              lineHeight: 1.05,
              marginTop: 8,
            }}
          >
            All 5, ranked
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {rows.map((row, idx) => {
            const rank = idx + 1
            // Reveal bottom-up so #1 Kin'emon lands last with the boom.
            const animOrder = rows.length - 1 - idx
            const tickFrame = RECAP_SCAN_START + animOrder * RECAP_TICK_GAP
            const enter = spring({
              frame: frame - tickFrame,
              fps,
              config: { damping: 14, stiffness: 130 },
            })
            const isTop = rank === 1
            // Subtle scale-pulse on #1 so it still reads as the climax even
            // without an audio cue.
            const accentScale = isTop
              ? interpolate(
                  frame,
                  [accentFrame, accentFrame + 10, accentFrame + 28],
                  [1, 1.05, 1],
                  { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
                )
              : 1
            return (
              <div
                key={row.id}
                style={{
                  opacity: enter,
                  transform: `translateX(${(1 - enter) * 60}px) scale(${accentScale})`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 24,
                  background: isTop
                    ? 'rgba(251,191,36,0.18)'
                    : 'rgba(255,255,255,0.07)',
                  border: `2px solid ${isTop ? ACCENT : 'rgba(255,255,255,0.14)'}`,
                  borderRadius: 20,
                  padding: '16px 24px',
                }}
              >
                <div
                  style={{
                    width: 60,
                    fontSize: 44,
                    fontWeight: 900,
                    color: ACCENT,
                    textAlign: 'center',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  #{rank}
                </div>
                <Avatar
                  imageUrl={row.imageUrl}
                  name={row.name}
                  accent={ACCENT}
                  size={96}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 36,
                      fontWeight: 700,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {row.name}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div
                    style={{
                      fontSize: 44,
                      fontWeight: 900,
                      color: ACCENT,
                      fontVariantNumeric: 'tabular-nums',
                      lineHeight: 1,
                    }}
                  >
                    {row.appearanceCount}
                  </div>
                  <div
                    style={{
                      fontSize: 16,
                      letterSpacing: 2,
                      textTransform: 'uppercase',
                      color: 'rgba(255,255,255,0.6)',
                      marginTop: 4,
                    }}
                  >
                    Chapters
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div
          style={{
            marginTop: 32,
            textAlign: 'center',
            opacity: titleEnter,
          }}
        >
          <div
            style={{
              fontSize: 22,
              letterSpacing: 4,
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.65)',
              fontWeight: 600,
            }}
          >
            Vote in the final round
          </div>
          <div
            style={{
              marginTop: 6,
              fontSize: 30,
              fontWeight: 800,
              color: ACCENT,
              letterSpacing: 1,
            }}
          >
            onepiecewt100-2026.com
          </div>
        </div>
    </AbsoluteFill>
  )
}
