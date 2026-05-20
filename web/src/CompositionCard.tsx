import { useEffect, useState } from 'react'
import { Player } from '@remotion/player'
import type { CompositionEntry } from './compositions'

interface Props {
  entry: CompositionEntry
}

type SnapshotState =
  | { status: 'loading' }
  | { status: 'ok'; data: Record<string, unknown> }
  | { status: 'error'; message: string }

export function CompositionCard({ entry }: Props) {
  const [state, setState] = useState<SnapshotState>({ status: 'loading' })

  useEffect(() => {
    let cancelled = false
    const url = `${import.meta.env.BASE_URL}${entry.snapshotPath}`
    fetch(url)
      .then(async (r) => {
        if (!r.ok) throw new Error(`${r.status} ${r.statusText}`)
        return (await r.json()) as Record<string, unknown>
      })
      .then((data) => {
        if (!cancelled) setState({ status: 'ok', data })
      })
      .catch((err) => {
        if (!cancelled)
          setState({ status: 'error', message: String(err.message ?? err) })
      })
    return () => {
      cancelled = true
    }
  }, [entry.snapshotPath])

  const durationInFrames =
    state.status === 'ok' ? entry.durationInFrames(state.data) : 1

  return (
    <article className="card">
      <header className="card-header">
        <h2 className="card-title">{entry.title}</h2>
        <p className="card-meta">
          {entry.description} · {entry.width}×{entry.height} · {entry.fps} fps
        </p>
      </header>
      <div
        className="player-wrap"
        style={{ aspectRatio: `${entry.width} / ${entry.height}` }}
      >
        {state.status === 'loading' && (
          <div className="status">Loading snapshot…</div>
        )}
        {state.status === 'error' && (
          <div className="status error">
            Couldn’t load snapshot:&nbsp;{state.message}
          </div>
        )}
        {state.status === 'ok' && (
          <Player
            component={entry.component}
            inputProps={state.data}
            durationInFrames={Math.max(durationInFrames, 1)}
            fps={entry.fps}
            compositionWidth={entry.width}
            compositionHeight={entry.height}
            controls
            loop
            style={{ width: '100%', height: '100%' }}
          />
        )}
      </div>
    </article>
  )
}
