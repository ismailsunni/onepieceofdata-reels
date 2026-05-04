import {
  AbsoluteFill,
  Audio,
  Img,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion'
import type { SnubbedRow } from './fetch'

// Instagram safe zones for 1080x1920 9:16 reels:
//   - Top ~210px is covered by the username/profile chip
//   - Bottom ~340px is covered by caption + like/comment/share + CTA
// We push the title down to ~y=220 and the footer up to ~y=1600 so nothing
// critical sits under IG's UI.
const SAFE_TOP = 220
const SAFE_BOTTOM = 320

export type TopSnubbedProps = {
  rows: SnubbedRow[]
  latestChapter: number | null
} & Record<string, unknown>

// 10s reel at 30fps. Title settles in ~1s, then rows enter ~1.67s apart,
// landing the #1 reveal just before the end.
const TITLE_DURATION = 30
const ROW_STAGGER = 50
const ACCENT = '#fbbf24'

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

export function TopSnubbed({ rows, latestChapter }: TopSnubbedProps) {
  const frame = useCurrentFrame()
  const { fps, durationInFrames } = useVideoConfig()

  // Loop seam: fade everything to black in the last 10 frames so the cut
  // back to a fully-rendered frame 0 isn't jarring on Instagram's loop.
  const loopOpacity = interpolate(
    frame,
    [durationInFrames - 10, durationInFrames - 1],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  )

  // Audio cues match EastBlueWeakest's recap card: a multi-tick "scan"
  // under the row reveals and a "boom" on the #1 Kin'emon hit.
  // Row #5 (Hattori) enters at TITLE_DURATION; row #1 (Kin'emon) at
  // TITLE_DURATION + (rows.length - 1) * ROW_STAGGER.
  const scanStart = TITLE_DURATION
  const boomFrame = TITLE_DURATION + Math.max(0, rows.length - 1) * ROW_STAGGER

  return (
    <>
      <Sequence from={scanStart}>
        <Audio src={staticFile('sfx/scan-7.mp3')} />
      </Sequence>
      <Sequence from={boomFrame}>
        <Audio src={staticFile('sfx/boom.mp3')} />
      </Sequence>

    <AbsoluteFill
      style={{
        background:
          'linear-gradient(180deg, #2a0b3a 0%, #5b1d6e 45%, #1a0a2e 100%)',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: 'white',
        paddingLeft: 80,
        paddingRight: 80,
        paddingTop: SAFE_TOP,
        paddingBottom: SAFE_BOTTOM,
        opacity: loopOpacity,
      }}
    >
      <div
        style={{
          textAlign: 'center',
          marginBottom: 64,
        }}
      >
        <div
          style={{
            fontSize: 28,
            letterSpacing: 8,
            color: ACCENT,
            textTransform: 'uppercase',
            fontWeight: 600,
          }}
        >
          Snubbed by the Fans
        </div>
        <div
          style={{
            fontSize: 72,
            fontWeight: 800,
            lineHeight: 1.05,
            marginTop: 12,
          }}
        >
          Most Chapters
          <br />
          Yet No Top 100
        </div>
        <div
          style={{
            fontSize: 26,
            marginTop: 16,
            color: 'rgba(255,255,255,0.75)',
            fontWeight: 500,
          }}
        >
          Top 5 by chapter appearances · not in mid-term Top 100
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* DOM order is rank #1 → #5 (Kin'emon at top, Hattori at bottom),
            but the entrance animation staggers from bottom up so Hattori
            appears first and the reveal builds toward Kin'emon. */}
        {rows.map((row, idx) => {
          const rank = idx + 1
          const animOrder = rows.length - 1 - idx
          const rowStart = TITLE_DURATION + animOrder * ROW_STAGGER
          const enter = spring({
            frame: frame - rowStart,
            fps,
            config: { damping: 14, stiffness: 120 },
          })
          return (
            <div
              key={row.id}
              style={{
                opacity: enter,
                transform: `translateX(${(1 - enter) * 80}px)`,
                display: 'flex',
                alignItems: 'center',
                gap: 28,
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.14)',
                borderRadius: 24,
                padding: '20px 28px',
              }}
            >
              <div
                style={{
                  width: 72,
                  fontSize: 56,
                  fontWeight: 800,
                  color: ACCENT,
                  textAlign: 'center',
                }}
              >
                #{rank}
              </div>
              <Avatar
                imageUrl={row.imageUrl}
                name={row.name}
                accent={ACCENT}
                size={132}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 40,
                    fontWeight: 700,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {row.name}
                </div>
                <div
                  style={{
                    fontSize: 22,
                    color: 'rgba(255,255,255,0.7)',
                    marginTop: 4,
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  ch. {row.firstChapter ?? '?'} – {row.lastChapter ?? '?'}
                </div>
                <div
                  style={{
                    fontSize: 22,
                    color: ACCENT,
                    marginTop: 4,
                    fontWeight: 600,
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  Outranks {row.top100WithLessAppearances}/100 voted in
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div
                  style={{
                    fontSize: 56,
                    fontWeight: 800,
                    color: ACCENT,
                    fontVariantNumeric: 'tabular-nums',
                    lineHeight: 1,
                  }}
                >
                  {row.appearanceCount}
                </div>
                <div
                  style={{
                    fontSize: 20,
                    color: 'rgba(255,255,255,0.65)',
                    letterSpacing: 2,
                    textTransform: 'uppercase',
                    marginTop: 6,
                  }}
                >
                  Chapters
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {latestChapter != null && (
        <div
          style={{
            position: 'absolute',
            // Sits just above IG's caption/CTA overlay (~340px tall).
            bottom: SAFE_BOTTOM - 60,
            left: 0,
            right: 0,
            textAlign: 'center',
            fontSize: 22,
            color: 'rgba(255,255,255,0.55)',
            letterSpacing: 2,
            textTransform: 'uppercase',
          }}
        >
          Source: One Piece of Data · through ch. {latestChapter}
        </div>
      )}
    </AbsoluteFill>
    </>
  )
}
