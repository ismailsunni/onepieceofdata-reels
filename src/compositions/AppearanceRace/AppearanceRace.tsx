import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion'
import type {
  AppearanceRaceSnapshot,
  ArcRange,
  RaceCharacterInfo,
  CompactRaceFrame,
} from './fetch'

// 9:16 reel: 1080 × 1920.
export const RACE_WIDTH = 1080
export const RACE_HEIGHT = 1920
export const RACE_FPS = 30

const INTRO_FRAMES = 60 // 2.0s — title settle, viewer reads framing
const RACE_FRAMES = 780 // 26.0s — main playback
const HOLD_FRAMES = 60 // 2.0s — final freeze + CTA
// At 30fps with ~380 sampled race-frames over 780 playback frames, the
// playback runs ~0.49 sampled-frames per playback frame — slow enough to
// read names and follow rank changes between arcs.

const TOP_N = 10
const ROW_HEIGHT = 130
const ROW_GAP = 12
const RACE_TOP = 360
const RACE_LEFT = 60
const RACE_RIGHT = 60
const RANK_COL = 72
const PORTRAIT_COL = 110
const SCORE_COL = 170
const BAR_PADDING = 14

const COLOR = {
  bg: '#0a0a0c',
  panel: '#14171f',
  rowBg: '#1a1d24',
  text: '#f5f5f5',
  subtle: '#8a8d96',
  rank: '#5e616c',
  accent: '#ff6a13', // neon orange
  accentSoft: 'rgba(255, 106, 19, 0.18)',
}

export type AppearanceRaceProps = {
  snapshot: AppearanceRaceSnapshot | null
} & Record<string, unknown>

/** Total playback length for a given snapshot. Caller passes this to
 *  Composition / Player as durationInFrames. */
export function totalFramesFor(_snapshot: AppearanceRaceSnapshot | null): number {
  // ~30s reel: 60 (intro) + 780 (race) + 60 (hold) = 900 frames @ 30fps.
  return INTRO_FRAMES + RACE_FRAMES + HOLD_FRAMES
}

interface RenderedRow {
  char: RaceCharacterInfo
  rank: number // 1..TOP_N (float during interpolation)
  score: number
  visible: boolean
}

/** Linear interpolation respecting the rank-floor sentinel: characters that
 *  drop out of the top-N are pinned at rank = TOP_N + 1 so they slide off
 *  the bottom rather than vanishing. */
function rankOrFloor(frame: CompactRaceFrame, id: string): number {
  const idx = frame.entries.findIndex((e) => e.id === id)
  return idx === -1 ? TOP_N + 1 : idx + 1
}

function scoreOrZero(frame: CompactRaceFrame, id: string): number {
  return frame.entries.find((e) => e.id === id)?.score ?? 0
}

function computeRows(
  a: CompactRaceFrame,
  b: CompactRaceFrame,
  t: number,
  charMap: Map<string, RaceCharacterInfo>
): RenderedRow[] {
  const ids = new Set<string>()
  for (const e of a.entries) ids.add(e.id)
  for (const e of b.entries) ids.add(e.id)

  const rows: RenderedRow[] = []
  for (const id of ids) {
    const ra = rankOrFloor(a, id)
    const rb = rankOrFloor(b, id)
    const rank = ra + (rb - ra) * t
    const sa = scoreOrZero(a, id)
    const sb = scoreOrZero(b, id)
    const score = sa + (sb - sa) * t
    const char = charMap.get(id)
    if (!char) continue
    rows.push({ char, rank, score, visible: rank <= TOP_N + 0.5 })
  }
  // Sort by rank for deterministic z-order.
  rows.sort((x, y) => x.rank - y.rank)
  return rows
}

function PortraitTile({ char, size }: { char: RaceCharacterInfo; size: number }) {
  const radius = size / 2
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        overflow: 'hidden',
        background: char.color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        boxShadow: '0 0 0 2px rgba(255,255,255,0.06)',
      }}
    >
      {char.imageUrl ? (
        <Img
          src={char.imageUrl}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'top',
          }}
        />
      ) : (
        <span
          style={{
            fontSize: size * 0.5,
            color: 'rgba(0,0,0,0.55)',
            fontWeight: 700,
          }}
        >
          {char.name.charAt(0)}
        </span>
      )}
    </div>
  )
}

function Row({
  row,
  maxScore,
  isLeader,
}: {
  row: RenderedRow
  maxScore: number
  isLeader: boolean
}) {
  const yBase = RACE_TOP + (row.rank - 1) * (ROW_HEIGHT + ROW_GAP)
  const opacity = row.rank > TOP_N ? Math.max(0, 1 - (row.rank - TOP_N) * 2) : 1
  const barWidth = RACE_WIDTH - RACE_LEFT - RACE_RIGHT - RANK_COL - PORTRAIT_COL - SCORE_COL - BAR_PADDING * 2
  const fillPct = Math.min(1, row.score / maxScore)
  const fill = Math.max(8, fillPct * barWidth)

  return (
    <div
      style={{
        position: 'absolute',
        top: yBase,
        left: RACE_LEFT,
        right: RACE_RIGHT,
        height: ROW_HEIGHT,
        display: 'flex',
        alignItems: 'center',
        gap: BAR_PADDING,
        opacity,
      }}
    >
      <div
        style={{
          width: RANK_COL,
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
          fontVariantNumeric: 'tabular-nums',
          fontSize: 56,
          fontWeight: 800,
          color: isLeader ? COLOR.accent : COLOR.rank,
          textAlign: 'right',
        }}
      >
        {Math.round(row.rank)}
      </div>
      <PortraitTile char={row.char} size={ROW_HEIGHT - 20} />
      <div
        style={{
          position: 'relative',
          width: barWidth,
          height: ROW_HEIGHT - 32,
          background: COLOR.rowBg,
          borderRadius: 14,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            width: fill,
            background: isLeader
              ? `linear-gradient(90deg, ${row.char.color}, ${COLOR.accent})`
              : row.char.color,
            borderRadius: 14,
            boxShadow: isLeader ? `0 0 32px ${COLOR.accentSoft}` : 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            paddingLeft: 22,
            color: '#fff',
            fontSize: 36,
            fontWeight: 700,
            letterSpacing: '-0.01em',
            textShadow: '0 1px 2px rgba(0,0,0,0.4)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {row.char.name.replace(/_/g, ' ')}
        </div>
      </div>
      <div
        style={{
          width: SCORE_COL,
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
          fontVariantNumeric: 'tabular-nums',
          fontSize: 56,
          fontWeight: 700,
          color: COLOR.text,
          textAlign: 'right',
        }}
      >
        {row.score.toFixed(0)}
      </div>
    </div>
  )
}

function arcTitleFor(chapter: number, arcs: ArcRange[]): string | null {
  // Arcs are ordered by startChapter ascending; first match wins.
  for (const a of arcs) {
    if (chapter >= a.startChapter && chapter <= a.endChapter) return a.title
  }
  return null
}

function Header({
  chapter,
  arcTitle,
  windowSize,
  introT,
}: {
  chapter: number
  arcTitle: string | null
  windowSize: number
  introT: number
}) {
  return (
    <div
      style={{
        position: 'absolute',
        top: 70,
        left: RACE_LEFT,
        right: RACE_RIGHT,
        opacity: introT,
      }}
    >
      <div
        style={{
          fontSize: 28,
          fontWeight: 700,
          color: COLOR.accent,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          marginBottom: 12,
        }}
      >
        Appearance Race
      </div>
      <div
        style={{
          fontSize: 64,
          fontWeight: 800,
          color: COLOR.text,
          lineHeight: 1.05,
          letterSpacing: '-0.02em',
        }}
      >
        Who ran One Piece
        <br />
        <span style={{ color: COLOR.subtle, fontWeight: 600, fontSize: 36 }}>
          pre-timeskip?
        </span>
      </div>
      <div
        style={{
          marginTop: 18,
          display: 'flex',
          alignItems: 'baseline',
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        <div
          style={{
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
            fontVariantNumeric: 'tabular-nums',
            fontSize: 44,
            fontWeight: 700,
            color: COLOR.text,
          }}
        >
          Ch. {chapter}
        </div>
        {arcTitle && (
          <div
            style={{
              fontSize: 30,
              fontWeight: 700,
              color: COLOR.accent,
              padding: '4px 14px',
              borderRadius: 999,
              background: COLOR.accentSoft,
              letterSpacing: '-0.01em',
              maxWidth: RACE_WIDTH - RACE_LEFT - RACE_RIGHT - 200,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {arcTitle}
          </div>
        )}
        <div style={{ fontSize: 22, color: COLOR.subtle, width: '100%' }}>
          rolling {windowSize}-chapter window
        </div>
      </div>
    </div>
  )
}

function Footer({ opacity }: { opacity: number }) {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 56,
        left: RACE_LEFT,
        right: RACE_RIGHT,
        textAlign: 'center',
        color: COLOR.subtle,
        fontSize: 26,
        letterSpacing: '0.05em',
        opacity,
      }}
    >
      <span style={{ color: COLOR.accent, fontWeight: 700 }}>
        @onepieceofdata
      </span>
      <span style={{ marginLeft: 14 }}>follow for more data</span>
    </div>
  )
}

export function AppearanceRace({ snapshot }: AppearanceRaceProps) {
  const frame = useCurrentFrame()
  const { durationInFrames } = useVideoConfig()

  if (!snapshot || snapshot.frames.length === 0) {
    return (
      <AbsoluteFill
        style={{
          background: COLOR.bg,
          color: COLOR.text,
          fontFamily: 'system-ui, sans-serif',
          fontSize: 32,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        Loading race…
      </AbsoluteFill>
    )
  }

  const charMap = new Map<string, RaceCharacterInfo>()
  for (const c of snapshot.characters) charMap.set(c.id, c)

  const raceFrames = durationInFrames - INTRO_FRAMES - HOLD_FRAMES
  const introT = Math.min(1, frame / INTRO_FRAMES)

  // Map playback-frame → race-frame index (float).
  let raceFloat: number
  if (frame < INTRO_FRAMES) {
    raceFloat = 0
  } else if (frame < INTRO_FRAMES + raceFrames) {
    raceFloat = interpolate(
      frame,
      [INTRO_FRAMES, INTRO_FRAMES + raceFrames],
      [0, snapshot.frames.length - 1],
      { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    )
  } else {
    raceFloat = snapshot.frames.length - 1
  }

  const a = Math.floor(raceFloat)
  const b = Math.min(a + 1, snapshot.frames.length - 1)
  const t = raceFloat - a

  const frameA = snapshot.frames[a]
  const frameB = snapshot.frames[b]
  const currentChapter = Math.round(
    frameA.chapter + (frameB.chapter - frameA.chapter) * t
  )

  const rows = computeRows(frameA, frameB, t, charMap)
  // Maximum score across both endpoints for stable bar normalization in
  // 'window' scoring this is just windowSize; we keep a runtime max so the
  // leader's bar never overflows even if computeRaceFrames returned a
  // higher-than-window value due to dedup edge cases.
  const maxScore = Math.max(snapshot.maxScore, snapshot.windowSize)

  // CTA fade-in during the hold.
  const ctaT = spring({
    frame: frame - (INTRO_FRAMES + raceFrames),
    fps: RACE_FPS,
    config: { damping: 200 },
    durationInFrames: HOLD_FRAMES,
  })

  return (
    <AbsoluteFill
      style={{
        background: COLOR.bg,
        color: COLOR.text,
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      }}
    >
      <Header
        chapter={currentChapter}
        arcTitle={arcTitleFor(currentChapter, snapshot.arcs)}
        windowSize={snapshot.windowSize}
        introT={introT}
      />

      {rows.slice(0, TOP_N + 1).map((row, i) => (
        <Row
          key={row.char.id}
          row={row}
          maxScore={maxScore}
          isLeader={i === 0 && row.visible}
        />
      ))}

      <Footer opacity={ctaT} />
    </AbsoluteFill>
  )
}
