import { useMemo, useState } from 'react'
import {
  COMPOSITIONS,
  type CompositionKind,
  type PublishStatus,
} from './compositions'
import { CompositionCard } from './CompositionCard'

type FormatFilter = 'all' | CompositionKind
type StatusFilter = 'all' | PublishStatus

const FORMAT_FILTERS: { value: FormatFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'reel', label: 'Reels' },
  { value: 'carousel', label: 'Carousels' },
  { value: 'video', label: 'Videos' },
]

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'published', label: 'Published' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'draft', label: 'Draft' },
]

export function App() {
  const [format, setFormat] = useState<FormatFilter>('all')
  const [status, setStatus] = useState<StatusFilter>('all')

  const visible = useMemo(
    () =>
      COMPOSITIONS.filter(
        (c) =>
          (format === 'all' || c.kind === format) &&
          (status === 'all' || c.status === status)
      ),
    [format, status]
  )

  // Counts for one axis, respecting the other axis's current selection.
  const formatCount = (value: FormatFilter) =>
    COMPOSITIONS.filter(
      (c) =>
        (value === 'all' || c.kind === value) &&
        (status === 'all' || c.status === status)
    ).length
  const statusCount = (value: StatusFilter) =>
    COMPOSITIONS.filter(
      (c) =>
        (format === 'all' || c.kind === format) &&
        (value === 'all' || c.status === value)
    ).length

  // Autoplay the first reel on screen so the gallery opens in motion.
  const autoPlayId = useMemo(
    () => visible.find((c) => c.kind === 'reel')?.id,
    [visible]
  )

  return (
    <main className="page">
      <header className="header">
        <h1>One Piece of Data — Reels Preview</h1>
        <p>
          Live previews of the data-driven reels and carousels rendered in
          Remotion. Snapshots are baked at build time; play locally for full
          motion, scrub to inspect single frames.
        </p>
      </header>

      <nav className="filters" aria-label="Filter by format">
        <span className="filter-label">Format</span>
        {FORMAT_FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            className={`pill${format === f.value ? ' pill-active' : ''}`}
            aria-pressed={format === f.value}
            onClick={() => setFormat(f.value)}
          >
            {f.label}
            <span className="pill-count">{formatCount(f.value)}</span>
          </button>
        ))}
      </nav>

      <nav className="filters" aria-label="Filter by status">
        <span className="filter-label">Status</span>
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            className={`pill${status === f.value ? ' pill-active' : ''}`}
            aria-pressed={status === f.value}
            onClick={() => setStatus(f.value)}
          >
            {f.label}
            <span className="pill-count">{statusCount(f.value)}</span>
          </button>
        ))}
      </nav>

      {visible.length === 0 ? (
        <div className="empty-state">
          Nothing matches this filter yet — try another combination.
        </div>
      ) : (
        <section className="gallery">
          {visible.map((c) => (
            <CompositionCard
              key={c.id}
              entry={c}
              autoPlay={c.id === autoPlayId}
            />
          ))}
        </section>
      )}
    </main>
  )
}
