import { AbsoluteFill, Img, useCurrentFrame } from 'remotion'
import type { ResolvedCharacter, ResolvedSlide } from './fetch'
import { SITE } from '../../components/Watermark'

export type First100ChaptersProps = {
  slides: ResolvedSlide[]
  latestChapter: number | null
} & Record<string, unknown>

export const SLIDE_WIDTH = 1080
export const SLIDE_HEIGHT = 1350

const SANS = 'system-ui, -apple-system, sans-serif'
const ACCENT = '#fbbf24'
const BG_GRADIENT =
  'linear-gradient(180deg, #0b1f3a 0%, #1d3a5b 45%, #050d1a 100%)'
const FOOTER_SITE = SITE

const SAFE_TOP = 80
const SAFE_BOTTOM = 120
const SAFE_X = 80

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
}

function Avatar({
  character,
  size,
}: {
  character: ResolvedCharacter
  size: number
}) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        overflow: 'hidden',
        border: `3px solid ${ACCENT}`,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.34,
        fontWeight: 800,
        color: ACCENT,
        boxShadow: '0 8px 22px rgba(0,0,0,0.55)',
        flexShrink: 0,
      }}
    >
      {character.imageUrl ? (
        <Img
          src={character.imageUrl}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'top',
          }}
        />
      ) : (
        <span>{initials(character.name)}</span>
      )}
    </div>
  )
}

function SlideFrame({ children }: { children: React.ReactNode }) {
  return (
    <AbsoluteFill
      style={{
        background: BG_GRADIENT,
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

function Kicker({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: 22,
        letterSpacing: 6,
        color: ACCENT,
        textTransform: 'uppercase',
        fontWeight: 700,
      }}
    >
      {children}
    </div>
  )
}

function Footer({
  index,
  total,
  latestChapter,
}: {
  index: number
  total: number
  latestChapter: number | null
}) {
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
          fontSize: 18,
          fontWeight: 600,
          letterSpacing: 3,
          color: 'rgba(255,255,255,0.7)',
        }}
      >
        {FOOTER_SITE}
      </div>
      <div
        style={{
          fontSize: 18,
          fontWeight: 700,
          letterSpacing: 2,
          color: 'rgba(255,255,255,0.6)',
        }}
      >
        {index + 1} / {total}
      </div>
      <div
        style={{
          fontSize: 16,
          fontWeight: 500,
          letterSpacing: 1,
          color: 'rgba(255,255,255,0.5)',
        }}
      >
        {latestChapter !== null ? `ch. ${latestChapter}` : ''}
      </div>
    </div>
  )
}

function CoverSlide({
  kicker,
  title,
  subtitle,
  question,
}: {
  kicker: string
  title: string
  subtitle: string
  question: string
}) {
  return (
    <SlideFrame>
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
            fontSize: 24,
            letterSpacing: 8,
            color: ACCENT,
            textTransform: 'uppercase',
            fontWeight: 700,
            marginBottom: 28,
          }}
        >
          {kicker}
        </div>
        <div
          style={{
            fontSize: 168,
            fontWeight: 900,
            lineHeight: 1,
            letterSpacing: -4,
            color: ACCENT,
          }}
        >
          {title}
        </div>
        <div
          style={{
            marginTop: 24,
            fontSize: 38,
            fontWeight: 600,
            letterSpacing: 0,
            color: 'rgba(255,255,255,0.92)',
            lineHeight: 1.3,
            maxWidth: 880,
          }}
        >
          {subtitle}
        </div>
        <div
          style={{
            marginTop: 80,
            fontSize: 56,
            fontWeight: 800,
            letterSpacing: -1,
            color: 'white',
            lineHeight: 1.1,
          }}
        >
          {question}
        </div>
        <div
          style={{
            marginTop: 56,
            fontSize: 22,
            fontWeight: 600,
            letterSpacing: 4,
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.6)',
          }}
        >
          Swipe →
        </div>
      </div>
    </SlideFrame>
  )
}

function StatSplitSlide({
  kicker,
  title,
  buckets,
  footer,
  callout,
}: {
  kicker: string
  title: string
  buckets: { num: number; label: string; desc: string }[]
  footer?: string
  callout?: { num: number; label: string }
}) {
  return (
    <SlideFrame>
      <div style={{ textAlign: 'center' }}>
        <Kicker>{kicker}</Kicker>
        <div
          style={{
            fontSize: 76,
            fontWeight: 900,
            lineHeight: 1,
            letterSpacing: -2,
            marginTop: 10,
          }}
        >
          {title}
        </div>
      </div>
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: 28,
          marginTop: 24,
        }}
      >
        {buckets.map((b) => (
          <div
            key={b.label}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 28,
              background: 'rgba(255,255,255,0.06)',
              border: '2px solid rgba(255,255,255,0.14)',
              borderRadius: 22,
              padding: '24px 30px',
            }}
          >
            <div
              style={{
                fontSize: 140,
                fontWeight: 900,
                color: ACCENT,
                lineHeight: 1,
                fontVariantNumeric: 'tabular-nums',
                width: 200,
                textAlign: 'right',
              }}
            >
              {b.num}
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: 42,
                  fontWeight: 800,
                  letterSpacing: -0.5,
                  lineHeight: 1.1,
                }}
              >
                {b.label}
              </div>
              <div
                style={{
                  marginTop: 6,
                  fontSize: 24,
                  fontWeight: 500,
                  color: 'rgba(255,255,255,0.75)',
                  lineHeight: 1.3,
                }}
              >
                {b.desc}
              </div>
            </div>
          </div>
        ))}
      </div>
      {callout && (
        <div
          style={{
            marginTop: 18,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 18,
            background: 'rgba(0,0,0,0.35)',
            border: `2px dashed ${ACCENT}`,
            borderRadius: 18,
            padding: '14px 22px',
          }}
        >
          <div
            style={{
              fontSize: 56,
              fontWeight: 900,
              color: ACCENT,
              lineHeight: 1,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {callout.num}
          </div>
          <div
            style={{
              fontSize: 22,
              fontWeight: 600,
              color: 'rgba(255,255,255,0.85)',
              lineHeight: 1.3,
              flex: 1,
            }}
          >
            {callout.label}
          </div>
        </div>
      )}
      {footer && (
        <div
          style={{
            marginTop: 10,
            fontSize: 18,
            fontStyle: 'italic',
            color: 'rgba(255,255,255,0.55)',
            textAlign: 'center',
          }}
        >
          {footer}
        </div>
      )}
    </SlideFrame>
  )
}

function GroupSlide({
  kicker,
  title,
  subtitle,
  characters,
}: {
  kicker: string
  title: string
  subtitle: string
  characters: ResolvedCharacter[]
}) {
  const n = characters.length
  const cols = n <= 2 ? 2 : n <= 4 ? 2 : n <= 6 ? 3 : n <= 9 ? 3 : 4
  const gap = n <= 4 ? 32 : n <= 9 ? 24 : 18
  const innerWidth = SLIDE_WIDTH - SAFE_X * 2
  const tile = Math.floor((innerWidth - gap * (cols - 1)) / cols)
  const labelSize = cols === 2 ? 32 : cols === 3 ? 24 : 20
  return (
    <SlideFrame>
      <div style={{ textAlign: 'center' }}>
        <Kicker>{kicker}</Kicker>
        <div
          style={{
            fontSize: 68,
            fontWeight: 900,
            lineHeight: 1.05,
            letterSpacing: -1.5,
            marginTop: 8,
          }}
        >
          {title}
        </div>
        <div
          style={{
            marginTop: 12,
            fontSize: 26,
            fontWeight: 500,
            lineHeight: 1.3,
            color: 'rgba(255,255,255,0.85)',
          }}
        >
          {subtitle}
        </div>
      </div>
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: 24,
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap,
            justifyContent: 'center',
            alignItems: 'flex-start',
            maxWidth: cols * tile + (cols - 1) * gap,
          }}
        >
          {characters.map((c, i) => (
            <div
              key={c.id + i}
              style={{
                width: tile,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <Avatar character={c} size={tile} />
              <div
                style={{
                  fontSize: labelSize,
                  fontWeight: 800,
                  textAlign: 'center',
                  letterSpacing: -0.5,
                  lineHeight: 1.1,
                  maxWidth: tile + 12,
                }}
              >
                {c.name}
              </div>
            </div>
          ))}
        </div>
      </div>
    </SlideFrame>
  )
}

function SilentListSlide({
  kicker,
  title,
  subtitle,
  entries,
  footer,
}: {
  kicker: string
  title: string
  subtitle: string
  entries: { character: ResolvedCharacter; label: string }[]
  footer?: string
}) {
  return (
    <SlideFrame>
      <div style={{ textAlign: 'center' }}>
        <Kicker>{kicker}</Kicker>
        <div
          style={{
            fontSize: 76,
            fontWeight: 900,
            lineHeight: 1,
            letterSpacing: -2,
            marginTop: 8,
          }}
        >
          {title}
        </div>
        <div
          style={{
            marginTop: 12,
            fontSize: 24,
            fontWeight: 500,
            lineHeight: 1.3,
            color: 'rgba(255,255,255,0.8)',
          }}
        >
          {subtitle}
        </div>
      </div>
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: 12,
          marginTop: 24,
        }}
      >
        {entries.map((e, i) => (
          <div
            key={e.character.id + i}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 18,
              borderBottom: '1px solid rgba(255,255,255,0.12)',
              padding: '10px 4px',
            }}
          >
            <Avatar character={e.character} size={72} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: 30,
                  fontWeight: 800,
                  letterSpacing: -0.5,
                  lineHeight: 1.1,
                }}
              >
                {e.character.name}
              </div>
            </div>
            <div
              style={{
                fontSize: 22,
                fontWeight: 600,
                color: ACCENT,
                fontVariantNumeric: 'tabular-nums',
                letterSpacing: 0.5,
                textAlign: 'right',
              }}
            >
              {e.label}
            </div>
          </div>
        ))}
      </div>
      {footer && (
        <div
          style={{
            marginTop: 6,
            fontSize: 18,
            fontStyle: 'italic',
            color: 'rgba(255,255,255,0.55)',
            textAlign: 'center',
          }}
        >
          {footer}
        </div>
      )}
    </SlideFrame>
  )
}

function ThanksSlide({
  kicker,
  title,
  subtitle,
  handle,
  stillWaiting,
}: {
  kicker: string
  title: string
  subtitle: string
  handle: string
  stillWaiting: ResolvedCharacter[]
}) {
  return (
    <SlideFrame>
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
            fontSize: 26,
            letterSpacing: 8,
            color: ACCENT,
            textTransform: 'uppercase',
            fontWeight: 700,
            marginBottom: 18,
          }}
        >
          {kicker}
        </div>
        <div
          style={{
            fontSize: 128,
            fontWeight: 900,
            lineHeight: 1,
            letterSpacing: -3,
          }}
        >
          {title}
        </div>
        <div
          style={{
            marginTop: 24,
            fontSize: 30,
            fontWeight: 600,
            color: 'rgba(255,255,255,0.85)',
            lineHeight: 1.3,
            maxWidth: 820,
          }}
        >
          {subtitle}
        </div>
        <div
          style={{
            marginTop: 38,
            background: 'rgba(0,0,0,0.45)',
            border: `3px solid ${ACCENT}`,
            borderRadius: 999,
            padding: '14px 36px',
            fontSize: 42,
            fontWeight: 800,
            color: ACCENT,
            letterSpacing: 1,
          }}
        >
          {handle}
        </div>
        <div
          style={{
            marginTop: 64,
            fontSize: 22,
            letterSpacing: 5,
            textTransform: 'uppercase',
            fontWeight: 700,
            color: 'rgba(255,255,255,0.6)',
          }}
        >
          Still waiting on
        </div>
        {(() => {
          const tile = 140
          const gap = 26
          const perRow = 4
          return (
            <div
              style={{
                marginTop: 18,
                display: 'flex',
                flexWrap: 'wrap',
                gap,
                justifyContent: 'center',
                maxWidth: perRow * tile + (perRow - 1) * gap,
              }}
            >
              {stillWaiting.map((c, i) => (
                <div
                  key={c.id + i}
                  style={{
                    width: tile,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <Avatar character={c} size={tile} />
                  <div
                    style={{
                      fontSize: 22,
                      fontWeight: 700,
                      letterSpacing: -0.5,
                      textAlign: 'center',
                      lineHeight: 1.1,
                    }}
                  >
                    {c.name}
                  </div>
                </div>
              ))}
            </div>
          )
        })()}
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
          question={slide.question}
        />
      )
    case 'stat_split':
      return (
        <StatSplitSlide
          kicker={slide.kicker}
          title={slide.title}
          buckets={slide.buckets}
          footer={slide.footer}
          callout={slide.callout}
        />
      )
    case 'group':
      return (
        <GroupSlide
          kicker={slide.kicker}
          title={slide.title}
          subtitle={slide.subtitle}
          characters={slide.characters}
        />
      )
    case 'silent_list':
      return (
        <SilentListSlide
          kicker={slide.kicker}
          title={slide.title}
          subtitle={slide.subtitle}
          entries={slide.entries}
          footer={slide.footer}
        />
      )
    case 'thanks':
      return (
        <ThanksSlide
          kicker={slide.kicker}
          title={slide.title}
          subtitle={slide.subtitle}
          handle={slide.handle}
          stillWaiting={slide.stillWaiting}
        />
      )
  }
}

export function First100Chapters({ slides, latestChapter }: First100ChaptersProps) {
  const frame = useCurrentFrame()
  const idx = Math.min(frame, slides.length - 1)
  const slide = slides[idx]
  if (!slide) return <AbsoluteFill style={{ background: '#000' }} />
  return (
    <>
      {renderSlide(slide)}
      <Footer index={idx} total={slides.length} latestChapter={latestChapter} />
    </>
  )
}
