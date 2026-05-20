import { COMPOSITIONS } from './compositions'
import { CompositionCard } from './CompositionCard'

export function App() {
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
      <section className="gallery">
        {COMPOSITIONS.map((c) => (
          <CompositionCard key={c.id} entry={c} />
        ))}
      </section>
    </main>
  )
}
