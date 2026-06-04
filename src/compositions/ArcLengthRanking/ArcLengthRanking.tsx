import { AbsoluteFill, Img, useCurrentFrame } from 'remotion'
import { hashId } from '../../lib/appearanceRace'
import type { ArcCharacter, ArcInfo, ArcRankingSnapshot } from './fetch'
import { Watermark } from '../../components/Watermark'

const CARD_W = 196
const CARD_GAP = 28

// 9:16 reel: 1080 × 1920.
export const ARC_WIDTH = 1080
export const ARC_HEIGHT = 1920
export const ARC_FPS = 30

const TOP_N = 10
const ROW_HEIGHT = 112
const ROW_GAP = 16
const ROW_STEP = ROW_HEIGHT + ROW_GAP
const RACE_TOP = 400
const RACE_LEFT = 60
const RACE_RIGHT = 60
const RANK_COL = 78
const PORTRAIT_COL = 84
const LEN_COL = 150
const BAR_PADDING = 16

// y of the "challenger" slot just below #10 — where a newly revealed arc
// lands before it either climbs into the top 10 or drops off the bottom.
const CHALLENGER_Y = RACE_TOP + TOP_N * ROW_STEP
const OFFSCREEN_Y = ARC_HEIGHT + 60

// Start with one arc, then reveal the rest one beat at a time. Arcs that crack
// the top 10 get a quick beat; arcs that get knocked out get a longer beat so
// the fly-in / knock-out reads. START_HOLD and END_HOLD bookend the build.
const INITIAL_REVEALED = 1
const FAST_FRAMES = 12 // reveal that lands in the top 10
const SLOW_FRAMES = 20 // reveal that gets knocked out (needs time to read)
const START_HOLD = 18
const END_HOLD = 40

const COLOR = {
  bg: '#FFC727', // bright gold
  rowBg: '#1E2C49', // dark navy track — keeps white bar labels legible
  text: '#15233B', // dark navy — numbers, labels
  subtle: 'rgba(21, 35, 59, 0.55)',
  rank: '#15233B',
  accent: '#E8551E', // deep orange, high-contrast on gold
  accentSoft: 'rgba(232, 85, 30, 0.25)',
  border: 'rgba(255, 255, 255, 0.22)', // frames each row against the gold bg
}

export type ArcLengthRankingProps = {
  snapshot: ArcRankingSnapshot | null
} & Record<string, unknown>

interface Step {
  /** Arc index revealed at this step (state goes from j arcs → j+1 arcs). */
  j: number
  /** True when arc j lands outside the top 10 the moment it's revealed. */
  knockout: boolean
  startFrame: number
  frames: number
}

/** Per-arc reveal schedule. Knockout reveals get a longer beat. Built from the
 *  arc list so the same timing is used for duration and playback. */
function buildSchedule(arcs: ArcInfo[]): { steps: Step[]; buildEnd: number } {
  const n = arcs.length
  const steps: Step[] = []
  let acc = START_HOLD
  for (let j = INITIAL_REVEALED; j <= n - 1; j++) {
    const rank = rankingAfter(arcs, j + 1).rankByIndex.get(j) ?? TOP_N + 1
    const knockout = rank > TOP_N
    const frames = knockout ? SLOW_FRAMES : FAST_FRAMES
    steps.push({ j, knockout, startFrame: acc, frames })
    acc += frames
  }
  return { steps, buildEnd: acc }
}

/** Total playback length: the scheduled build plus a trailing hold so viewers
 *  can read the finished ranking. */
export function totalFramesFor(snapshot: ArcRankingSnapshot | null): number {
  const arcs = snapshot?.arcs ?? []
  if (arcs.length === 0) return START_HOLD + END_HOLD
  return buildSchedule(arcs).buildEnd + END_HOLD
}

interface RenderedRow {
  arc: ArcInfo
  index: number // chronological index, stable key
  rank: number // 1..N float — used for z-order only
  displayRank: number // integer shown in the rank column
  y: number // absolute top position
  opacity: number
  fillPct: number // 0..1 against current max length
  isNewest: boolean
}

/** smoothstep — eases a row's settle into its new slot. */
function ease(t: number): number {
  return t * t * (3 - 2 * t)
}

/** Ranking state after the first `count` arcs (chronological) are revealed:
 *  rank-by-index map (1-based, length desc) and the max length seen so far. */
function rankingAfter(
  arcs: ArcInfo[],
  count: number
): { rankByIndex: Map<number, number>; maxLen: number } {
  const revealed = arcs
    .slice(0, count)
    .map((arc, index) => ({ arc, index }))
    .sort((a, b) => b.arc.length - a.arc.length)

  const rankByIndex = new Map<number, number>()
  let maxLen = 1
  revealed.forEach((r, i) => {
    rankByIndex.set(r.index, i + 1)
    if (r.arc.length > maxLen) maxLen = r.arc.length
  })
  return { rankByIndex, maxLen }
}

function rankOrFloor(rankByIndex: Map<number, number>, index: number): number {
  return rankByIndex.get(index) ?? TOP_N + 1
}

/** Deterministic vivid color per arc, shared by its bar and the leader card. */
function arcColor(title: string): string {
  const hue = Math.floor(hashId(title) * 360)
  return `hsl(${hue}, 62%, 54%)`
}

/** Circular headliner portrait sitting left of an arc's bar. */
function PortraitTile({
  char,
  color,
  size,
}: {
  char: ArcCharacter | null
  color: string
  size: number
}) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        overflow: 'hidden',
        flexShrink: 0,
        background: COLOR.rowBg,
        boxShadow: `0 0 0 3px ${color}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {char?.imageUrl ? (
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
        <span style={{ fontSize: size * 0.46, fontWeight: 800, color: '#fff' }}>
          {char?.name.charAt(0) ?? '?'}
        </span>
      )}
    </div>
  )
}

function Row({ row }: { row: RenderedRow }) {
  const barWidth =
    ARC_WIDTH -
    RACE_LEFT -
    RACE_RIGHT -
    RANK_COL -
    PORTRAIT_COL -
    LEN_COL -
    BAR_PADDING * 3
  const fill = Math.max(10, row.fillPct * barWidth)
  const barColor = arcColor(row.arc.title)

  return (
    <div
      style={{
        position: 'absolute',
        top: row.y,
        left: RACE_LEFT,
        right: RACE_RIGHT,
        height: ROW_HEIGHT,
        display: 'flex',
        alignItems: 'center',
        gap: BAR_PADDING,
        opacity: row.opacity,
      }}
    >
      <div
        style={{
          width: RANK_COL,
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
          fontVariantNumeric: 'tabular-nums',
          fontSize: 52,
          fontWeight: 800,
          color: row.displayRank < 1.5 ? COLOR.accent : COLOR.rank,
          textAlign: 'right',
        }}
      >
        {row.displayRank}
      </div>
      <PortraitTile
        char={row.arc.topChar}
        color={barColor}
        size={ROW_HEIGHT - 28}
      />
      <div
        style={{
          position: 'relative',
          width: barWidth,
          height: ROW_HEIGHT - 28,
          background: COLOR.rowBg,
          borderRadius: 14,
          overflow: 'hidden',
          boxSizing: 'border-box',
          // Ongoing arc gets a bold dashed border so it reads as "in progress".
          border: row.arc.ongoing
            ? `5px dashed #fff`
            : row.isNewest
              ? `3px solid ${COLOR.accent}`
              : `2px solid ${COLOR.border}`,
          boxShadow: row.isNewest ? `0 0 28px ${COLOR.accentSoft}` : 'none',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            width: fill,
            background: row.isNewest
              ? `linear-gradient(90deg, ${barColor}, ${COLOR.accent})`
              : barColor,
            borderRadius: 14,
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            paddingLeft: 24,
            color: '#fff',
            fontSize: 38,
            fontWeight: 700,
            letterSpacing: '-0.01em',
            textShadow: '0 1px 2px rgba(0,0,0,0.5)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {row.arc.title}
        </div>
      </div>
      <div
        style={{
          width: LEN_COL,
          textAlign: 'right',
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        <span style={{ fontSize: 52, fontWeight: 800, color: COLOR.text }}>
          {row.arc.length}
        </span>
        <span style={{ fontSize: 24, fontWeight: 600, color: COLOR.subtle }}>
          {' '}
          ch
        </span>
      </div>
    </div>
  )
}

/** Top-right portrait of the headliner (top non-Straw-Hat character) of the
 *  arc currently sitting at #1. Swaps as the leader changes. */
function LeaderCharCard({ arc }: { arc: ArcInfo | null }) {
  const char = arc?.topChar ?? null
  const ring = arc ? arcColor(arc.title) : COLOR.rowBg
  return (
    <div
      style={{
        position: 'absolute',
        top: 64,
        right: RACE_RIGHT,
        width: CARD_W,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 10,
      }}
    >
      <div
        style={{
          fontSize: 20,
          fontWeight: 800,
          letterSpacing: '0.12em',
          color: COLOR.accent,
          textTransform: 'uppercase',
        }}
      >
        Face of #1
      </div>
      <div
        style={{
          width: CARD_W,
          height: CARD_W,
          borderRadius: 22,
          overflow: 'hidden',
          background: COLOR.rowBg,
          boxShadow: `0 0 0 4px ${ring}, 0 10px 24px rgba(21,35,59,0.35)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {char?.imageUrl ? (
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
          <span style={{ fontSize: 88, fontWeight: 800, color: '#fff' }}>
            {char?.name.charAt(0) ?? '—'}
          </span>
        )}
      </div>
      <div
        style={{
          fontSize: 26,
          fontWeight: 800,
          color: COLOR.text,
          textAlign: 'center',
          lineHeight: 1.1,
          maxWidth: CARD_W,
        }}
      >
        {char?.name ?? '—'}
      </div>
    </div>
  )
}

function Header({
  newest,
  revealed,
  total,
  done,
}: {
  newest: ArcInfo | null
  revealed: number
  total: number
  done: boolean
}) {
  return (
    <div
      style={{
        position: 'absolute',
        top: 70,
        left: RACE_LEFT,
        right: RACE_RIGHT + CARD_W + CARD_GAP,
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
        Longest Arcs
      </div>
      <div
        style={{
          fontSize: 52,
          fontWeight: 800,
          color: COLOR.text,
          lineHeight: 1.08,
          letterSpacing: '-0.02em',
        }}
      >
        Every One Piece arc,
        <br />
        ranked by chapter count
      </div>
      <div
        style={{
          marginTop: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 16,
        }}
      >
        <div
          style={{
            fontSize: 26,
            fontWeight: 800,
            color: '#fff',
            background: COLOR.accent,
            padding: '6px 16px',
            borderRadius: 999,
            whiteSpace: 'nowrap',
          }}
        >
          {revealed} / {total}
        </div>
        {done ? (
          <div
            style={{
              fontSize: 28,
              fontWeight: 800,
              color: COLOR.accent,
              letterSpacing: '0.04em',
              whiteSpace: 'nowrap',
            }}
          >
            Final ranking
          </div>
        ) : (
          newest && (
            <div
              style={{
                fontSize: 28,
                fontWeight: 700,
                color: COLOR.text,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              <span style={{ color: COLOR.subtle, fontWeight: 600 }}>
                entering:{' '}
              </span>
              {newest.title}
              <span
                style={{ color: COLOR.subtle, fontWeight: 600, fontSize: 24 }}
              >
                {' '}
                · Ch {newest.startChapter}–{newest.endChapter}
              </span>
            </div>
          )
        )}
      </div>
    </div>
  )
}

export function ArcLengthRanking({ snapshot }: ArcLengthRankingProps) {
  const frame = useCurrentFrame()

  if (!snapshot || snapshot.arcs.length === 0) {
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
        Loading arcs…
      </AbsoluteFill>
    )
  }

  const arcs = snapshot.arcs
  const n = arcs.length
  const { steps, buildEnd } = buildSchedule(arcs)

  // Resolve the current frame into a transition: the state before (countBefore
  // arcs) and after (countAfter arcs) the reveal, plus where we are within it.
  let countBefore = INITIAL_REVEALED
  let countAfter = INITIAL_REVEALED
  let rawT = 0
  let revealIndex = -1
  let knockout = false
  let done = false

  if (frame < START_HOLD) {
    // Opening hold on the first arc(s).
  } else if (frame >= buildEnd) {
    countBefore = n
    countAfter = n
    done = true
  } else {
    const step =
      steps.find((s) => frame >= s.startFrame && frame < s.startFrame + s.frames) ??
      steps[steps.length - 1]
    revealIndex = step.j
    knockout = step.knockout
    countBefore = step.j
    countAfter = step.j + 1
    rawT = (frame - step.startFrame) / step.frames
  }

  const t = ease(rawT)
  const stateA = rankingAfter(arcs, countBefore)
  const stateB = rankingAfter(arcs, countAfter)
  const maxLen = stateA.maxLen + (stateB.maxLen - stateA.maxLen) * t

  const rows: RenderedRow[] = arcs.map((arc, index) => {
    const ra = rankOrFloor(stateA.rankByIndex, index)
    const rb = rankOrFloor(stateB.rankByIndex, index)
    const rank = ra + (rb - ra) * t
    const opacity = rank > TOP_N ? Math.max(0, 1 - (rank - TOP_N) * 2) : 1
    return {
      arc,
      index,
      rank,
      displayRank: Math.round(rank),
      y: RACE_TOP + (rank - 1) * ROW_STEP,
      opacity,
      fillPct: Math.min(1, arc.length / maxLen),
      // Highlight the arc sliding in; once done, keep the #1 arc highlighted.
      isNewest:
        (index === revealIndex && !knockout && t > 0.15) ||
        (done && Math.round(rank) === 1),
    }
  })

  // A knockout arc never enters the top 10, so the rank interpolation leaves it
  // invisible. Override it onto the challenger slot: rise in, hold, drop off.
  let challenger: RenderedRow | null = null
  if (knockout && revealIndex >= 0) {
    const row = rows[revealIndex]
    const finalRank = stateB.rankByIndex.get(revealIndex) ?? TOP_N + 1
    let y: number
    let opacity: number
    if (rawT < 0.28) {
      const p = ease(rawT / 0.28)
      y = CHALLENGER_Y + 60 * (1 - p)
      opacity = p
    } else if (rawT < 0.66) {
      y = CHALLENGER_Y
      opacity = 1
    } else {
      const p = ease((rawT - 0.66) / 0.34)
      y = CHALLENGER_Y + (OFFSCREEN_Y - CHALLENGER_Y) * p
      opacity = 1 - p
    }
    row.y = y
    row.opacity = opacity
    row.displayRank = finalRank
    row.isNewest = true
    challenger = row
  }

  rows.sort((x, y) => x.rank - y.rank)
  // The arc currently sitting at #1 drives the top-right headliner card.
  const leaderArc = rows[0]?.arc ?? null
  // Render the top 10 + the transient bumped-out row; ensure the challenger is
  // drawn last (on top) since its rank places it outside that slice.
  const rendered = rows.slice(0, TOP_N + 1)
  if (challenger && !rendered.includes(challenger)) rendered.push(challenger)

  return (
    <AbsoluteFill
      style={{
        background: COLOR.bg,
        color: COLOR.text,
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      }}
    >
      <Header
        newest={revealIndex >= 0 ? arcs[revealIndex] : null}
        revealed={Math.min(countAfter, n)}
        total={n}
        done={done}
      />
      <LeaderCharCard arc={leaderArc} />
      {rendered.map((row) => (
        <Row key={row.index} row={row} />
      ))}
      <Watermark bg="light" bottom={56} />
    </AbsoluteFill>
  )
}
