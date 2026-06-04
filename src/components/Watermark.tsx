// Shared footer watermark — see docs/composition-guidelines.md §3.
// Every composition should render this (or, for footers that also carry a
// chapter label, reuse the SITE constant).

export const SITE = 'onepieceofdata.com'

const SANS = 'system-ui, -apple-system, sans-serif'

export function Watermark({
  bg = 'dark',
  bottom = 48,
  color,
}: {
  /** Background the watermark sits on — picks a legible default text color. */
  bg?: 'dark' | 'light'
  /** Distance from the bottom edge, in px. */
  bottom?: number
  /** Explicit color override (wins over `bg`). */
  color?: string
}) {
  const resolved =
    color ?? (bg === 'light' ? 'rgba(21,35,59,0.5)' : 'rgba(245,245,245,0.45)')
  return (
    <div
      style={{
        position: 'absolute',
        bottom,
        left: 0,
        right: 0,
        textAlign: 'center',
        fontFamily: SANS,
        fontSize: 22,
        letterSpacing: '0.1em',
        fontWeight: bg === 'light' ? 700 : 600,
        color: resolved,
        pointerEvents: 'none',
      }}
    >
      {SITE}
    </div>
  )
}
