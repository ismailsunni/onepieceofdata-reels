import { AbsoluteFill, Img, useCurrentFrame } from 'remotion'
import type {
  CaveatsEntry,
  RankingEntry,
  ResolvedCharacter,
  ResolvedSlide,
} from './fetch'

export type Top100WishlistProps = {
  slides: ResolvedSlide[]
  latestChapter: number | null
} & Record<string, unknown>

// IG carousel: 1080×1350 (4:5). One slide per frame at fps=1, so each
// `remotion still --frame=N` renders slide N as a PNG.
export const SLIDE_WIDTH = 1080
export const SLIDE_HEIGHT = 1350

const SANS = 'system-ui, -apple-system, sans-serif'
const ACCENT = '#fbbf24'
const BG_GRADIENT =
  'linear-gradient(180deg, #2a0b3a 0%, #5b1d6e 45%, #1a0a2e 100%)'
const FOOTER_SITE = 'onepieceofdata.com'

// IG crops ~120px off the top in the carousel preview. Keep critical
// content inside these insets so nothing important gets clipped.
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
  accent = ACCENT,
}: {
  character: ResolvedCharacter
  size: number
  accent?: string
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
        fontSize: size * 0.34,
        fontWeight: 800,
        color: accent,
        boxShadow: '0 12px 32px rgba(0,0,0,0.6)',
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

function NameTag({ name, size = 48 }: { name: string; size?: number }) {
  return (
    <div
      style={{
        fontSize: size,
        fontWeight: 900,
        textAlign: 'center',
        lineHeight: 1.05,
        letterSpacing: -1,
      }}
    >
      {name}
    </div>
  )
}

function SpanBadge({
  first,
  last,
}: {
  first: number | null
  last: number | null
}) {
  if (first == null || last == null) return null
  const span = last - first
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'baseline',
        gap: 12,
        background: 'rgba(0,0,0,0.35)',
        border: '2px solid rgba(255,255,255,0.25)',
        borderRadius: 999,
        padding: '6px 18px',
        fontFamily: SANS,
      }}
    >
      <span
        style={{
          fontSize: 24,
          fontWeight: 700,
          color: 'rgba(255,255,255,0.9)',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        ch. {first} → {last}
      </span>
      <span
        style={{
          fontSize: 16,
          letterSpacing: 3,
          textTransform: 'uppercase',
          color: ACCENT,
          fontWeight: 700,
        }}
      >
        {span}-ch span
      </span>
    </div>
  )
}

function StatBadge({ count }: { count: number | null }) {
  if (count == null) return null
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'baseline',
        gap: 10,
        background: 'rgba(0,0,0,0.45)',
        border: `2px solid ${ACCENT}`,
        borderRadius: 999,
        padding: '8px 18px',
        fontFamily: SANS,
      }}
    >
      <span
        style={{
          fontSize: 36,
          fontWeight: 900,
          color: ACCENT,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {count}
      </span>
      <span
        style={{
          fontSize: 16,
          letterSpacing: 4,
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.75)',
          fontWeight: 600,
        }}
      >
        Chapters
      </span>
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
        flexDirection: 'row',
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
          textTransform: 'lowercase',
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
        fontSize: 24,
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

function GroupTitle({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: 56,
        fontWeight: 900,
        lineHeight: 1.05,
        letterSpacing: -1,
        marginTop: 12,
      }}
    >
      {children}
    </div>
  )
}

function Pitch({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: 30,
        fontWeight: 500,
        lineHeight: 1.35,
        color: 'rgba(255,255,255,0.92)',
        marginTop: 20,
      }}
    >
      {children}
    </div>
  )
}

const WT100_LOGO_URL =
  'https://onepiecewt100-2026.com/_app/logo--large--black.png-DQT1HagL.webp'

function CoverSlide({
  kicker,
  title,
  subtitle,
}: {
  kicker: string
  title: string
  subtitle: string
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
        {/* Logo is the black version — sit it on a white pill so the
            mark stays legible against our dark gradient. */}
        <div
          style={{
            background: 'white',
            borderRadius: 32,
            padding: '20px 36px',
            marginBottom: 36,
            boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
          }}
        >
          <Img
            src={WT100_LOGO_URL}
            style={{ height: 140, display: 'block' }}
          />
        </div>
        <div
          style={{
            fontSize: 26,
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
            fontSize: 128,
            fontWeight: 900,
            lineHeight: 1,
            letterSpacing: -3,
            whiteSpace: 'pre-line',
          }}
        >
          {title.split('\n').map((line, i) => (
            <div key={i} style={i === title.split('\n').length - 1 ? { color: ACCENT } : undefined}>
              {line}
            </div>
          ))}
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
          {subtitle}
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

function CharacterSlide({
  character,
  headline,
  pitch,
  showSpan,
}: {
  character: ResolvedCharacter
  headline: string
  pitch: string
  showSpan: boolean
}) {
  return (
    <SlideFrame>
      <Kicker>{headline}</Kicker>
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          gap: 24,
        }}
      >
        <Avatar character={character} size={520} />
        <NameTag name={character.name} size={84} />
        <StatBadge count={character.appearanceCount} />
        {showSpan && (
          <SpanBadge
            first={character.firstChapter}
            last={character.lastChapter}
          />
        )}
        <Pitch>{pitch}</Pitch>
      </div>
    </SlideFrame>
  )
}

function PairSlide({
  characters,
  groupName,
  pitch,
  showRankExSHP,
}: {
  characters: [ResolvedCharacter, ResolvedCharacter]
  groupName: string
  pitch: string
  showRankExSHP: boolean
}) {
  return (
    <SlideFrame>
      <Kicker>The Pair</Kicker>
      <GroupTitle>{groupName}</GroupTitle>
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 28,
        }}
      >
        <div style={{ display: 'flex', gap: 32, alignItems: 'flex-end' }}>
          {characters.map((c, i) => (
            <div
              key={c.id + i}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <Avatar character={c} size={360} />
              <NameTag name={c.name} size={42} />
              <StatBadge count={c.appearanceCount} />
              {showRankExSHP && c.rankExSHP != null && (
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 700,
                    letterSpacing: 1,
                    color: 'rgba(255,255,255,0.85)',
                    textAlign: 'center',
                    lineHeight: 1.2,
                  }}
                >
                  <span style={{ color: ACCENT, fontWeight: 900 }}>
                    #{c.rankExSHP}
                  </span>{' '}
                  appearance
                  <br />
                  outside Straw Hats
                </div>
              )}
            </div>
          ))}
        </div>
        <Pitch>{pitch}</Pitch>
      </div>
    </SlideFrame>
  )
}

function GroupSlide({
  characters,
  groupName,
  pitch,
}: {
  characters: ResolvedCharacter[]
  groupName: string
  pitch: string
}) {
  const size = characters.length <= 3 ? 280 : 220
  return (
    <SlideFrame>
      <Kicker>The Group</Kicker>
      <GroupTitle>{groupName}</GroupTitle>
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 32,
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 24,
            justifyContent: 'center',
            alignItems: 'flex-end',
          }}
        >
          {characters.map((c, i) => (
            <div
              key={c.id + i}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 10,
                width: size + 20,
              }}
            >
              <Avatar character={c} size={size} />
              <NameTag name={c.name} size={28} />
            </div>
          ))}
        </div>
        <Pitch>{pitch}</Pitch>
      </div>
    </SlideFrame>
  )
}

function RankingSlide({
  kicker,
  title,
  subtitle,
  entries,
  valueLabel,
  showTop100Rank,
}: {
  kicker: string
  title: string
  subtitle?: string
  entries: RankingEntry[]
  valueLabel: string
  showTop100Rank: boolean
}) {
  return (
    <SlideFrame>
      <div style={{ textAlign: 'left' }}>
        <Kicker>{kicker}</Kicker>
        <div
          style={{
            fontSize: 80,
            fontWeight: 900,
            lineHeight: 1.0,
            letterSpacing: -2,
            marginTop: 6,
          }}
        >
          {title}
        </div>
        {subtitle && (
          <div
            style={{
              marginTop: 14,
              fontSize: 26,
              fontWeight: 500,
              lineHeight: 1.3,
              color: 'rgba(255,255,255,0.85)',
            }}
          >
            {subtitle}
          </div>
        )}
      </div>
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: 16,
          marginTop: 24,
        }}
      >
        {entries.map((e, i) => (
          <div
            key={e.character.id + i}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 20,
              background: 'rgba(255,255,255,0.06)',
              border: '2px solid rgba(255,255,255,0.12)',
              borderRadius: 18,
              padding: '14px 20px',
            }}
          >
            {showTop100Rank && e.character.top100Rank != null && (
              <div
                style={{
                  width: 80,
                  textAlign: 'center',
                  fontSize: 36,
                  fontWeight: 900,
                  color: ACCENT,
                  fontVariantNumeric: 'tabular-nums',
                  lineHeight: 1,
                }}
              >
                #{e.character.top100Rank}
              </div>
            )}
            <Avatar character={e.character} size={120} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: 32,
                  fontWeight: 800,
                  lineHeight: 1.1,
                  letterSpacing: -0.5,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {e.character.name}
              </div>
              {e.subline && (
                <div
                  style={{
                    fontSize: 20,
                    fontWeight: 600,
                    color: 'rgba(255,255,255,0.7)',
                    marginTop: 6,
                    lineHeight: 1.2,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {e.subline}
                </div>
              )}
            </div>
            <div style={{ textAlign: 'right' }}>
              <div
                style={{
                  fontSize: 48,
                  fontWeight: 900,
                  color: ACCENT,
                  lineHeight: 1,
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {e.value ?? '—'}
              </div>
              <div
                style={{
                  fontSize: 16,
                  letterSpacing: 2,
                  textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.65)',
                  marginTop: 4,
                  fontWeight: 600,
                }}
              >
                {valueLabel}
              </div>
            </div>
          </div>
        ))}
      </div>
    </SlideFrame>
  )
}

function CaveatsSlide({
  kicker,
  title,
  subtitle,
  entries,
  footer,
}: {
  kicker: string
  title: string
  subtitle: string
  entries: CaveatsEntry[]
  footer: string
}) {
  return (
    <SlideFrame>
      <div style={{ textAlign: 'left' }}>
        <Kicker>{kicker}</Kicker>
        <div
          style={{
            fontSize: 80,
            fontWeight: 900,
            lineHeight: 1.0,
            letterSpacing: -2,
            marginTop: 6,
          }}
        >
          {title}
        </div>
        <div
          style={{
            marginTop: 14,
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
          flexDirection: 'column',
          justifyContent: 'center',
          gap: 18,
          marginTop: 28,
        }}
      >
        {entries.map((e, i) => (
          <div
            key={e.name + i}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 20,
              background: 'rgba(255,255,255,0.06)',
              border: '2px solid rgba(255,255,255,0.12)',
              borderRadius: 18,
              padding: '16px 22px',
            }}
          >
            {e.rank != null && (
              <div
                style={{
                  width: 80,
                  textAlign: 'center',
                  fontSize: 36,
                  fontWeight: 900,
                  color: ACCENT,
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                #{e.rank}
              </div>
            )}
            <div
              style={{
                width: 130,
                height: 130,
                borderRadius: '50%',
                overflow: 'hidden',
                border: `4px solid ${ACCENT}`,
                background: 'rgba(0,0,0,0.5)',
                flexShrink: 0,
              }}
            >
              <Img
                src={e.imageUrl}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: 36,
                  fontWeight: 800,
                  lineHeight: 1.1,
                  letterSpacing: -0.5,
                }}
              >
                {e.name}
              </div>
              <div
                style={{
                  fontSize: 22,
                  letterSpacing: 1,
                  color: 'rgba(255,255,255,0.7)',
                  marginTop: 6,
                  fontWeight: 600,
                }}
              >
                {e.note}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div
        style={{
          marginTop: 16,
          fontSize: 22,
          lineHeight: 1.35,
          fontStyle: 'italic',
          color: 'rgba(255,255,255,0.65)',
          textAlign: 'center',
        }}
      >
        {footer}
      </div>
    </SlideFrame>
  )
}

function HonorableSlide({
  characters,
  title,
  subtitle,
}: {
  characters: ResolvedCharacter[]
  title: string
  subtitle: string
}) {
  // Pick column count by entry count so portraits stay legible.
  const cols = characters.length <= 9 ? 3 : characters.length <= 16 ? 4 : 4
  const gap = characters.length <= 9 ? 24 : 18
  const innerWidth = SLIDE_WIDTH - SAFE_X * 2
  const tile = Math.floor((innerWidth - gap * (cols - 1)) / cols)
  const labelSize = cols === 3 ? 22 : 18
  return (
    <SlideFrame>
      <div style={{ textAlign: 'center' }}>
        <Kicker>Honorable Mentions</Kicker>
        <div
          style={{
            fontSize: 64,
            fontWeight: 900,
            lineHeight: 1.05,
            letterSpacing: -1,
            marginTop: 8,
          }}
        >
          {title}
        </div>
        <div
          style={{
            marginTop: 14,
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
            display: 'grid',
            gridTemplateColumns: `repeat(${cols}, ${tile}px)`,
            gap,
            justifyContent: 'center',
          }}
        >
          {characters.map((c, i) => (
            <div
              key={c.id + i}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <Avatar character={c} size={tile} />
              <div
                style={{
                  fontSize: labelSize,
                  fontWeight: 700,
                  textAlign: 'center',
                  letterSpacing: -0.5,
                  lineHeight: 1.1,
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

function FollowSlide({
  kicker,
  handle,
  title,
  subtitle,
  voteHeader,
  voteCharacter,
  voteReason,
}: {
  kicker: string
  handle: string
  title: string
  subtitle: string
  voteHeader: string
  voteCharacter: ResolvedCharacter
  voteReason: string
}) {
  return (
    <SlideFrame>
      <div style={{ textAlign: 'center' }}>
        <Kicker>{kicker}</Kicker>
        <div
          style={{
            fontSize: 76,
            fontWeight: 900,
            lineHeight: 1.0,
            letterSpacing: -2,
            marginTop: 8,
            whiteSpace: 'pre-line',
          }}
        >
          {title}
        </div>
        <div
          style={{
            marginTop: 18,
            background: 'rgba(0,0,0,0.45)',
            border: `3px solid ${ACCENT}`,
            borderRadius: 999,
            padding: '14px 32px',
            display: 'inline-block',
            fontSize: 38,
            fontWeight: 800,
            color: ACCENT,
            letterSpacing: 1,
          }}
        >
          {handle}
        </div>
        <div
          style={{
            marginTop: 16,
            fontSize: 26,
            fontWeight: 500,
            color: 'rgba(255,255,255,0.85)',
            lineHeight: 1.3,
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
          alignItems: 'center',
          gap: 18,
          marginTop: 24,
        }}
      >
        <div
          style={{
            fontSize: 22,
            letterSpacing: 6,
            textTransform: 'uppercase',
            fontWeight: 700,
            color: ACCENT,
          }}
        >
          {voteHeader}
        </div>
        <Avatar character={voteCharacter} size={360} />
        <NameTag name={voteCharacter.name} size={64} />
        <div
          style={{
            maxWidth: 820,
            fontSize: 28,
            fontWeight: 500,
            lineHeight: 1.35,
            color: 'rgba(255,255,255,0.92)',
            textAlign: 'center',
          }}
        >
          {voteReason}
        </div>
      </div>
    </SlideFrame>
  )
}

function CtaSlide({
  kicker,
  title,
  url,
}: {
  kicker: string
  title: string
  url: string
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
            marginBottom: 28,
          }}
        >
          {kicker}
        </div>
        <div
          style={{
            fontSize: 96,
            fontWeight: 900,
            lineHeight: 1.05,
            letterSpacing: -2,
          }}
        >
          {title}
        </div>
        <div
          style={{
            marginTop: 48,
            background: 'rgba(0,0,0,0.45)',
            border: `3px solid ${ACCENT}`,
            borderRadius: 24,
            padding: '24px 40px',
            fontSize: 44,
            fontWeight: 800,
            color: ACCENT,
            letterSpacing: 1,
          }}
        >
          {url}
        </div>
        <div
          style={{
            marginTop: 36,
            fontSize: 26,
            fontWeight: 600,
            letterSpacing: 1,
            color: 'rgba(255,255,255,0.75)',
          }}
        >
          Save · Share · Tag a friend who'd vote.
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
    case 'character':
      return (
        <CharacterSlide
          character={slide.character}
          headline={slide.headline}
          pitch={slide.pitch}
          showSpan={slide.showSpan}
        />
      )
    case 'pair':
      return (
        <PairSlide
          characters={slide.characters}
          groupName={slide.groupName}
          pitch={slide.pitch}
          showRankExSHP={slide.showRankExSHP}
        />
      )
    case 'group':
      return (
        <GroupSlide
          characters={slide.characters}
          groupName={slide.groupName}
          pitch={slide.pitch}
        />
      )
    case 'honorable':
      return (
        <HonorableSlide
          characters={slide.characters}
          title={slide.title}
          subtitle={slide.subtitle}
        />
      )
    case 'ranking':
      return (
        <RankingSlide
          kicker={slide.kicker}
          title={slide.title}
          subtitle={slide.subtitle}
          entries={slide.entries}
          valueLabel={slide.valueLabel}
          showTop100Rank={slide.showTop100Rank}
        />
      )
    case 'caveats':
      return (
        <CaveatsSlide
          kicker={slide.kicker}
          title={slide.title}
          subtitle={slide.subtitle}
          entries={slide.entries}
          footer={slide.footer}
        />
      )
    case 'follow':
      return (
        <FollowSlide
          kicker={slide.kicker}
          handle={slide.handle}
          title={slide.title}
          subtitle={slide.subtitle}
          voteHeader={slide.voteHeader}
          voteCharacter={slide.voteCharacter}
          voteReason={slide.voteReason}
        />
      )
    case 'cta':
      return (
        <CtaSlide kicker={slide.kicker} title={slide.title} url={slide.url} />
      )
  }
}

export function Top100Wishlist({ slides, latestChapter }: Top100WishlistProps) {
  const frame = useCurrentFrame()
  const idx = Math.min(frame, slides.length - 1)
  const slide = slides[idx]
  if (!slide) {
    return <AbsoluteFill style={{ background: '#000' }} />
  }
  return (
    <>
      {renderSlide(slide)}
      <Footer index={idx} total={slides.length} latestChapter={latestChapter} />
    </>
  )
}
