import { useMemo, useState } from 'react'
import { COMPOSITIONS, type CompositionKind } from './compositions'
import { CompositionCard } from './CompositionCard'

type Filter = 'all' | CompositionKind

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'reel', label: 'Reels' },
  { value: 'carousel', label: 'Carousels' },
  { value: 'video', label: 'Videos' },
]

export function App() {
  const [filter, setFilter] = useState<Filter>('all')

  const counts = useMemo(() => {
    const c: Record<Filter, number> = {
      all: COMPOSITIONS.length,
      reel: 0,
      carousel: 0,
      video: 0,
    }
    for (const entry of COMPOSITIONS) c[entry.kind]++
    return c
  }, [])

  const visible = useMemo(
    () =>
      filter === 'all'
        ? COMPOSITIONS
        : COMPOSITIONS.filter((c) => c.kind === filter),
    [filter]
  )

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
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            className={`pill${filter === f.value ? ' pill-active' : ''}`}
            aria-pressed={filter === f.value}
            onClick={() => setFilter(f.value)}
          >
            {f.label}
            <span className="pill-count">{counts[f.value]}</span>
          </button>
        ))}
      </nav>

      {visible.length === 0 ? (
        <div className="empty-state">
          No {filter === 'video' ? 'videos' : `${filter}s`} yet — check back
          soon.
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
