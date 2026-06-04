import { AbsoluteFill, Img, useCurrentFrame } from 'remotion'
import type { ResolvedCharacter, ResolvedSlide } from './fetch'
import { SITE } from '../../components/Watermark'

export type VanishedPreSkipProps = {
  slides: ResolvedSlide[]
  latestChapter: number | null
} & Record<string, unknown>

export const SLIDE_WIDTH = 1080
export const SLIDE_HEIGHT = 1350

const SANS = 'system-ui, -apple-system, sans-serif'

// Light "parchment / faded poster" palette — deliberately the opposite of the
// dark navy decks. Warm cream background, deep sienna accent, dark slate text.
const BG_GRADIENT =
  'linear-gradient(180deg, #fdf6e8 0%, #fbe9c8 55%, #f6cf94 100%)'
const ACCENT = '#b45309' // amber-700, warm sienna
const TEXT = '#1c1917' // stone-900
const TEXT_MUTED = '#57534e' // stone-600
const TEXT_SOFT = 'rgba(28, 25, 23, 0.55)'
const TILE_BG = 'rgba(255, 250, 235, 0.6)'
const TILE_BORDER = 'rgba(180, 83, 9, 0.25)'
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
        background: 'rgba(255, 250, 235, 0.9)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.34,
        fontWeight: 800,
        color: ACCENT,
        boxShadow: '0 6px 18px rgba(120, 53, 15, 0.18)',
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
        color: TEXT,
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
        fontWeight: 800,
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
        pointerEvents: 'none',
        zIndex: 10,
      }}
    >
      <div
        style={{
          fontSize: 18,
          fontWeight: 700,
          letterSpacing: 3,
          color: TEXT_MUTED,
        }}
      >
        {FOOTER_SITE}
      </div>
      <div
        style={{
          fontSize: 18,
          fontWeight: 700,
          letterSpacing: 2,
          color: TEXT_MUTED,
        }}
      >
        {index + 1} / {total}
      </div>
      <div
        style={{
          fontSize: 16,
          fontWeight: 600,
          letterSpacing: 1,
          color: TEXT_SOFT,
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
            fontWeight: 800,
            marginBottom: 28,
          }}
        >
          {kicker}
        </div>
        <div
          style={{
            fontSize: 188,
            fontWeight: 900,
            lineHeight: 1,
            letterSpacing: -5,
            color: ACCENT,
          }}
        >
          {title}
        </div>
        <div
          style={{
            marginTop: 36,
            fontSize: 44,
            fontWeight: 600,
            color: TEXT,
            lineHeight: 1.3,
            maxWidth: 920,
          }}
        >
          {subtitle}
        </div>
        <div
          style={{
            marginTop: 90,
            fontSize: 72,
            fontWeight: 800,
            letterSpacing: -1.5,
            color: TEXT,
            lineHeight: 1.1,
          }}
        >
          {question}
        </div>
        <div
          style={{
            marginTop: 72,
            fontSize: 26,
            fontWeight: 700,
            letterSpacing: 4,
            textTransform: 'uppercase',
            color: TEXT_MUTED,
          }}
        >
          Swipe →
        </div>
      </div>
    </SlideFrame>
  )
}

function CriteriaSlide({
  kicker,
  title,
  buckets,
  footer,
}: {
  kicker: string
  title: string
  buckets: { num: string; label: string; desc: string }[]
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
              background: TILE_BG,
              border: `2px solid ${TILE_BORDER}`,
              borderRadius: 22,
              padding: '24px 30px',
            }}
          >
            <div
              style={{
                fontSize: b.num.length >= 4 ? 96 : 130,
                fontWeight: 900,
                color: ACCENT,
                lineHeight: 1,
                fontVariantNumeric: 'tabular-nums',
                width: 280,
                textAlign: 'center',
                flexShrink: 0,
              }}
            >
              {b.num}
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: 46,
                  fontWeight: 800,
                  letterSpacing: -0.5,
                  lineHeight: 1.1,
                  color: TEXT,
                }}
              >
                {b.label}
              </div>
              <div
                style={{
                  marginTop: 10,
                  fontSize: 28,
                  fontWeight: 500,
                  color: TEXT_MUTED,
                  lineHeight: 1.3,
                }}
              >
                {b.desc}
              </div>
            </div>
          </div>
        ))}
      </div>
      {footer && (
        <div
          style={{
            marginTop: 10,
            fontSize: 20,
            fontStyle: 'italic',
            color: TEXT_MUTED,
            textAlign: 'center',
          }}
        >
          {footer}
        </div>
      )}
    </SlideFrame>
  )
}

function CharacterTile({
  character,
  tile,
  labelSize,
}: {
  character: ResolvedCharacter
  tile: number
  labelSize: number
}) {
  const lastSize = Math.max(18, labelSize - 14)
  const arcSize = Math.max(15, labelSize - 18)
  return (
    <div
      style={{
        width: tile,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 10,
      }}
    >
      <Avatar character={character} size={tile} />
      <div
        style={{
          fontSize: labelSize,
          fontWeight: 800,
          textAlign: 'center',
          letterSpacing: -0.5,
          lineHeight: 1.1,
          maxWidth: tile + 24,
          color: TEXT,
        }}
      >
        {character.name}
      </div>
      {character.lastChapter != null && (
        <div
          style={{
            fontSize: lastSize,
            fontWeight: 700,
            color: ACCENT,
            fontVariantNumeric: 'tabular-nums',
            letterSpacing: 0.3,
            lineHeight: 1.15,
            textAlign: 'center',
          }}
        >
          last seen · ch {character.lastChapter}
        </div>
      )}
      {character.lastArcTitle && (
        <div
          style={{
            fontSize: arcSize,
            fontWeight: 600,
            color: TEXT_MUTED,
            letterSpacing: 0.2,
            lineHeight: 1.2,
            textAlign: 'center',
            maxWidth: tile + 24,
          }}
        >
          {character.lastArcTitle}
        </div>
      )}
    </div>
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
  const isTriangle = n === 3
  const cols =
    n === 1 ? 1 : n === 2 ? 2 : n === 3 ? 2 : n === 4 ? 2 : n <= 6 ? 3 : n <= 9 ? 3 : 4
  const gap = n <= 2 ? 36 : n <= 4 ? 28 : n <= 9 ? 22 : 18
  const innerWidth = SLIDE_WIDTH - SAFE_X * 2
  const tile =
    n === 1
      ? 640
      : isTriangle
        ? 360
        : Math.floor((innerWidth - gap * (cols - 1)) / cols)
  const labelSize = n === 1 ? 60 : cols === 2 ? 36 : cols === 3 ? 30 : 22
  return (
    <SlideFrame>
      <div style={{ textAlign: 'center' }}>
        <Kicker>{kicker}</Kicker>
        <div
          style={{
            fontSize: 82,
            fontWeight: 900,
            lineHeight: 1.05,
            letterSpacing: -2,
            marginTop: 10,
          }}
        >
          {title}
        </div>
        <div
          style={{
            marginTop: 16,
            fontSize: 30,
            fontWeight: 500,
            lineHeight: 1.35,
            color: TEXT_MUTED,
            maxWidth: 880,
            marginLeft: 'auto',
            marginRight: 'auto',
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
        {isTriangle ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 24,
            }}
          >
            <div style={{ display: 'flex', gap: 40, justifyContent: 'center' }}>
              {characters.slice(0, 2).map((c, i) => (
                <CharacterTile key={c.id + i} character={c} tile={tile} labelSize={labelSize} />
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              {characters[2] && (
                <CharacterTile character={characters[2]} tile={tile} labelSize={labelSize} />
              )}
            </div>
          </div>
        ) : (
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
              <CharacterTile
                key={c.id + i}
                character={c}
                tile={tile}
                labelSize={labelSize}
              />
            ))}
          </div>
        )}
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
  const n = entries.length
  const avatar = n <= 6 ? 110 : n <= 8 ? 92 : n <= 10 ? 78 : 64
  const nameSize = n <= 6 ? 40 : n <= 8 ? 34 : n <= 10 ? 30 : 26
  const labelSize = n <= 6 ? 26 : n <= 8 ? 24 : n <= 10 ? 22 : 20
  return (
    <SlideFrame>
      <div style={{ textAlign: 'center' }}>
        <Kicker>{kicker}</Kicker>
        <div
          style={{
            fontSize: 82,
            fontWeight: 900,
            lineHeight: 1,
            letterSpacing: -2,
            marginTop: 10,
          }}
        >
          {title}
        </div>
        <div
          style={{
            marginTop: 14,
            fontSize: 28,
            fontWeight: 500,
            lineHeight: 1.3,
            color: TEXT_MUTED,
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
          justifyContent: 'space-evenly',
          marginTop: 18,
        }}
      >
        {entries.map((e, i) => (
          <div
            key={e.character.id + i}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 20,
              borderBottom: `1px solid ${TILE_BORDER}`,
              padding: '6px 4px',
            }}
          >
            <Avatar character={e.character} size={avatar} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: nameSize,
                  fontWeight: 800,
                  letterSpacing: -0.5,
                  lineHeight: 1.1,
                  color: TEXT,
                }}
              >
                {e.character.name}
              </div>
            </div>
            <div
              style={{
                fontSize: labelSize,
                fontWeight: 700,
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
            marginTop: 8,
            fontSize: 18,
            fontStyle: 'italic',
            color: TEXT_MUTED,
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
}: {
  kicker: string
  title: string
  subtitle: string
  handle: string
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
            fontWeight: 800,
            marginBottom: 18,
          }}
        >
          {kicker}
        </div>
        <div
          style={{
            fontSize: 150,
            fontWeight: 900,
            lineHeight: 1,
            letterSpacing: -4,
            color: TEXT,
          }}
        >
          {title}
        </div>
        <div
          style={{
            marginTop: 36,
            fontSize: 38,
            fontWeight: 600,
            color: TEXT_MUTED,
            lineHeight: 1.3,
            maxWidth: 880,
          }}
        >
          {subtitle}
        </div>
        <div
          style={{
            marginTop: 64,
            background: 'rgba(255, 250, 235, 0.85)',
            border: `3px solid ${ACCENT}`,
            borderRadius: 999,
            padding: '18px 44px',
            fontSize: 52,
            fontWeight: 800,
            color: ACCENT,
            letterSpacing: 1,
          }}
        >
          {handle}
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
          question={slide.question}
        />
      )
    case 'criteria':
      return (
        <CriteriaSlide
          kicker={slide.kicker}
          title={slide.title}
          buckets={slide.buckets}
          footer={slide.footer}
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
        />
      )
  }
}

export function VanishedPreSkip({ slides, latestChapter }: VanishedPreSkipProps) {
  const frame = useCurrentFrame()
  const idx = Math.min(frame, slides.length - 1)
  const slide = slides[idx]
  if (!slide) return <AbsoluteFill style={{ background: '#fdf6e8' }} />
  return (
    <>
      {renderSlide(slide)}
      <Footer index={idx} total={slides.length} latestChapter={latestChapter} />
    </>
  )
}
