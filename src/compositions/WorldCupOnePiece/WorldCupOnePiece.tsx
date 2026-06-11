import { AbsoluteFill, Img, useCurrentFrame } from 'remotion'
import { SITE } from '../../components/Watermark'
import type { ResolvedSlide, ResolvedWorldCup } from './fetch'

export type WorldCupOnePieceProps = {
  slides: ResolvedSlide[]
  latestChapter: number | null
} & Record<string, unknown>

// IG carousel: 1080×1350 (4:5). One slide per frame at fps=1, so each
// `remotion still --frame=N` renders slide N as a PNG.
export const SLIDE_WIDTH = 1080
export const SLIDE_HEIGHT = 1350

const SANS = 'system-ui, -apple-system, sans-serif'
const GOLD = '#fbbf24' // brand gold — "champions" + One Piece accent
const PITCH = '#34d399' // football-green accent

// IG crops the carousel preview — keep critical content inside these insets.
const SAFE_TOP = 80
const SAFE_BOTTOM = 120
const SAFE_X = 72

function SlideFrame({
  children,
  background,
}: {
  children: React.ReactNode
  background: string
}) {
  return (
    <AbsoluteFill
      style={{
        background,
        fontFamily: SANS,
        color: 'white',
        paddingLeft: SAFE_X,
        paddingRight: SAFE_X,
        paddingTop: SAFE_TOP,
        paddingBottom: SAFE_BOTTOM,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {children}
    </AbsoluteFill>
  )
}

// Generic gold trophy mark (not the FIFA emblem — that's trademarked).
function Trophy({ size = 40, color = GOLD }: { size?: number; color?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      style={{ flexShrink: 0 }}
    >
      <path
        d="M7 4h10v5a5 5 0 0 1-10 0V4Z"
        fill={color}
      />
      <path
        d="M7 5H4.5A1.5 1.5 0 0 0 3 6.5C3 8.5 4.5 10 7 10M17 5h2.5A1.5 1.5 0 0 1 21 6.5C21 8.5 19.5 10 17 10"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M12 14v3m-3 3h6m-5 0c0-1.5 1-2 2-2s2 .5 2 2"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function Footer({ index, total }: { index: number; total: number }) {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 24,
        left: 0,
        right: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingLeft: 40,
        paddingRight: 40,
        fontFamily: SANS,
        textShadow: '0 1px 4px rgba(0,0,0,0.6)',
        pointerEvents: 'none',
        zIndex: 10,
      }}
    >
      <div
        style={{
          fontSize: 19,
          fontWeight: 600,
          letterSpacing: 3,
          color: 'rgba(255,255,255,0.7)',
        }}
      >
        {SITE}
      </div>
      <div
        style={{
          fontSize: 19,
          fontWeight: 700,
          letterSpacing: 2,
          color: 'rgba(255,255,255,0.6)',
        }}
      >
        {index + 1} / {total}
      </div>
    </div>
  )
}

const COVER_BG =
  'linear-gradient(150deg, #0fa855 0%, #1450a0 34%, #a032d6 68%, #3a1560 100%)'
const PLAIN_BG =
  'linear-gradient(180deg, #1450a0 0%, #4a1873 55%, #2c0f47 100%)'

function CoverSlide({
  kicker,
  title,
  subtitle,
}: {
  kicker: string
  title: string
  subtitle: string
}) {
  const lines = title.split('\n')
  return (
    <SlideFrame background={COVER_BG}>
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            fontSize: 28,
            letterSpacing: 10,
            color: GOLD,
            textTransform: 'uppercase',
            fontWeight: 800,
            marginBottom: 32,
          }}
        >
          <Trophy size={34} />
          {kicker}
        </div>
        <div
          style={{
            fontSize: 138,
            fontWeight: 900,
            lineHeight: 0.96,
            letterSpacing: -4,
            textShadow: '0 6px 30px rgba(0,0,0,0.45)',
          }}
        >
          {lines.map((line, i) => (
            <div key={i}>{line}</div>
          ))}
        </div>
        <div
          style={{
            marginTop: 30,
            height: 10,
            width: 260,
            borderRadius: 999,
            background: `linear-gradient(90deg, ${PITCH}, ${GOLD})`,
          }}
        />
        <div
          style={{
            marginTop: 40,
            fontSize: 38,
            fontWeight: 500,
            letterSpacing: 0.5,
            color: 'rgba(255,255,255,0.92)',
            lineHeight: 1.34,
            maxWidth: 880,
          }}
        >
          {subtitle}
        </div>
        <div
          style={{
            marginTop: 52,
            fontSize: 24,
            fontWeight: 700,
            letterSpacing: 5,
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.7)',
          }}
        >
          Swipe →
        </div>
      </div>
    </SlideFrame>
  )
}

function PremiseSlide({
  kicker,
  title,
  body,
}: {
  kicker: string
  title: string
  body: string
}) {
  return (
    <SlideFrame background={PLAIN_BG}>
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            fontSize: 28,
            letterSpacing: 8,
            color: GOLD,
            textTransform: 'uppercase',
            fontWeight: 800,
          }}
        >
          <Trophy size={32} />
          {kicker}
        </div>
        <div
          style={{
            fontSize: 86,
            fontWeight: 900,
            lineHeight: 1.0,
            letterSpacing: -2,
            marginTop: 18,
          }}
        >
          {title.split('\n').map((l, i) => (
            <div key={i}>{l}</div>
          ))}
        </div>
        <div
          style={{
            marginTop: 36,
            fontSize: 40,
            fontWeight: 500,
            lineHeight: 1.42,
            color: 'rgba(255,255,255,0.92)',
          }}
        >
          {body}
        </div>
      </div>
    </SlideFrame>
  )
}

function CharPortrait({
  url,
  name,
  size,
}: {
  url: string | null
  name: string
  size: number
}) {
  const initials = name
    .split(/\s+/)
    .filter((w) => !/^d\.?$/i.test(w))
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        overflow: 'hidden',
        border: `5px solid ${GOLD}`,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.3,
        fontWeight: 900,
        color: GOLD,
        boxShadow: '0 14px 38px rgba(0,0,0,0.55)',
        flexShrink: 0,
      }}
    >
      {url ? (
        <Img
          src={url}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'top',
          }}
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  )
}

function WorldCupSlide({ slide }: { slide: ResolvedWorldCup }) {
  const bg = `linear-gradient(180deg, ${slide.theme} 0%, #4a1873 52%, #2c0f47 100%)`
  const [arcMain, arcSub] = slide.arcTitle.split('\n')
  return (
    <SlideFrame background={bg}>
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* ── World Cup half — centered in the top zone ──────────── */}
        <div
          style={{
            flex: 0.85,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'flex-start',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              gap: 24,
              width: '100%',
            }}
          >
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  fontSize: 27,
                  letterSpacing: 4,
                  textTransform: 'uppercase',
                  fontWeight: 800,
                  color: 'rgba(255,255,255,0.92)',
                }}
              >
                <Trophy size={32} color="#ffffff" />
                World Cup
                <span style={{ fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>
                  · {slide.host}
                </span>
              </div>
              <div
                style={{
                  fontSize: 200,
                  fontWeight: 900,
                  lineHeight: 0.92,
                  letterSpacing: -7,
                  fontVariantNumeric: 'tabular-nums',
                  textShadow: '0 6px 26px rgba(0,0,0,0.4)',
                }}
              >
                {slide.year}
              </div>
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <Img
                src={slide.flagUrl}
                style={{
                  width: 236,
                  height: 157,
                  objectFit: 'cover',
                  borderRadius: 14,
                  border: '4px solid rgba(255,255,255,0.85)',
                  boxShadow: '0 12px 32px rgba(0,0,0,0.5)',
                }}
              />
              <div
                style={{
                  fontSize: 17,
                  letterSpacing: 4,
                  textTransform: 'uppercase',
                  fontWeight: 800,
                  color: 'rgba(255,255,255,0.65)',
                }}
              >
                Champions
              </div>
              <div
                style={{
                  fontSize: 42,
                  fontWeight: 900,
                  color: GOLD,
                  lineHeight: 1,
                }}
              >
                {slide.champion}
              </div>
            </div>
          </div>
          <div
            style={{
              fontSize: 29,
              fontWeight: 500,
              color: 'rgba(255,255,255,0.82)',
              marginTop: 18,
            }}
          >
            {slide.finalResult}
          </div>
        </div>

        {/* ── One Piece half — centered in the bottom zone ───────── */}
        <div
          style={{
            flex: 1.15,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              marginBottom: 34,
            }}
          >
            <div
              style={{
                fontSize: 21,
                letterSpacing: 4,
                textTransform: 'uppercase',
                fontWeight: 800,
                color: GOLD,
                whiteSpace: 'nowrap',
              }}
            >
              Meanwhile, in One Piece
            </div>
            <div
              style={{ flex: 1, height: 2, background: 'rgba(251,191,36,0.45)' }}
            />
          </div>

          <div style={{ display: 'flex', gap: 34, alignItems: 'center' }}>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 14,
                flexShrink: 0,
              }}
            >
              <CharPortrait
                url={slide.characterImageUrl}
                name={slide.characterName}
                size={320}
              />
              <div
                style={{
                  fontSize: 19,
                  letterSpacing: 2,
                  textTransform: 'uppercase',
                  fontWeight: 800,
                  color: '#14071f',
                  background: GOLD,
                  borderRadius: 999,
                  padding: '8px 20px',
                  textAlign: 'center',
                  maxWidth: 320,
                }}
              >
                {slide.characterRole}
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: 72,
                  fontWeight: 900,
                  lineHeight: 0.96,
                  letterSpacing: -2,
                }}
              >
                {arcMain}
              </div>
              {arcSub && (
                <div
                  style={{
                    fontSize: 40,
                    fontWeight: 600,
                    lineHeight: 1.1,
                    color: 'rgba(255,255,255,0.85)',
                    marginTop: 6,
                  }}
                >
                  {arcSub}
                </div>
              )}
              <div
                style={{
                  fontSize: 31,
                  fontWeight: 700,
                  color: GOLD,
                  marginTop: 16,
                  letterSpacing: 0.3,
                }}
              >
                {slide.characterName}
              </div>
              <div
                style={{
                  fontSize: 33,
                  fontWeight: 500,
                  lineHeight: 1.42,
                  color: 'rgba(255,255,255,0.94)',
                  marginTop: 14,
                }}
              >
                {slide.detail}
              </div>
              <div
                style={{
                  marginTop: 20,
                  display: 'inline-block',
                  fontSize: 22,
                  fontWeight: 700,
                  letterSpacing: 2,
                  color: 'rgba(255,255,255,0.65)',
                  background: 'rgba(255,255,255,0.1)',
                  border: '2px solid rgba(255,255,255,0.18)',
                  borderRadius: 999,
                  padding: '7px 20px',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {slide.chapterLabel}
              </div>
            </div>
          </div>
        </div>
      </div>
    </SlideFrame>
  )
}

function CloserSlide({
  kicker,
  year,
  hosts,
  question,
  handle,
}: {
  kicker: string
  year: string
  hosts: string
  question: string
  handle: string
}) {
  return (
    <SlideFrame background={COVER_BG}>
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            fontSize: 28,
            letterSpacing: 10,
            color: PITCH,
            textTransform: 'uppercase',
            fontWeight: 800,
            marginBottom: 18,
          }}
        >
          <Trophy size={34} color={PITCH} />
          {kicker}
        </div>
        <div
          style={{
            fontSize: 220,
            fontWeight: 900,
            lineHeight: 1,
            letterSpacing: -8,
            fontVariantNumeric: 'tabular-nums',
            textShadow: '0 6px 30px rgba(0,0,0,0.45)',
          }}
        >
          {year}
        </div>
        <div
          style={{
            marginTop: 14,
            fontSize: 38,
            fontWeight: 800,
            letterSpacing: 2,
            color: 'rgba(255,255,255,0.9)',
          }}
        >
          {hosts}
        </div>
        <div
          style={{
            marginTop: 44,
            fontSize: 40,
            fontWeight: 500,
            lineHeight: 1.38,
            color: 'rgba(255,255,255,0.94)',
            maxWidth: 880,
          }}
        >
          {question}
        </div>
        <div
          style={{
            marginTop: 52,
            background: 'rgba(0,0,0,0.4)',
            border: `3px solid ${GOLD}`,
            borderRadius: 26,
            padding: '22px 40px',
            fontSize: 44,
            fontWeight: 800,
            color: GOLD,
            letterSpacing: 1,
          }}
        >
          {handle}
        </div>
        <div
          style={{
            marginTop: 26,
            fontSize: 26,
            fontWeight: 600,
            letterSpacing: 1,
            color: 'rgba(255,255,255,0.72)',
          }}
        >
          Follow for more One Piece data.
        </div>
      </div>
    </SlideFrame>
  )
}

function renderSlide(slide: ResolvedSlide) {
  switch (slide.kind) {
    case 'cover':
      return (
        <CoverSlide
          kicker={slide.kicker}
          title={slide.title}
          subtitle={slide.subtitle}
        />
      )
    case 'premise':
      return (
        <PremiseSlide kicker={slide.kicker} title={slide.title} body={slide.body} />
      )
    case 'worldcup':
      return <WorldCupSlide slide={slide} />
    case 'closer':
      return (
        <CloserSlide
          kicker={slide.kicker}
          year={slide.year}
          hosts={slide.hosts}
          question={slide.question}
          handle={slide.handle}
        />
      )
  }
}

export function WorldCupOnePiece({ slides }: WorldCupOnePieceProps) {
  const frame = useCurrentFrame()
  const idx = Math.min(frame, slides.length - 1)
  const slide = slides[idx]
  if (!slide) {
    return <AbsoluteFill style={{ background: '#000' }} />
  }
  return (
    <>
      {renderSlide(slide)}
      <Footer index={idx} total={slides.length} />
    </>
  )
}
