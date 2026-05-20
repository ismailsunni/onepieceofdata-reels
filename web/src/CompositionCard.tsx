import { useEffect, useState } from 'react'
import { Player } from '@remotion/player'
import type { CompositionEntry } from './compositions'

interface Props {
  entry: CompositionEntry
}

interface SnapshotEnvelope {
  ok: boolean
  builtAt: string
  data?: Record<string, unknown>
  error?: string
}

type SnapshotState =
  | { status: 'loading' }
  | { status: 'ok'; data: Record<string, unknown>; builtAt: string }
  | { status: 'build-failed'; message: string; builtAt: string }
  | { status: 'fetch-failed'; message: string }

export function CompositionCard({ entry }: Props) {
  const [state, setState] = useState<SnapshotState>({ status: 'loading' })

  useEffect(() => {
    let cancelled = false
    const url = `${import.meta.env.BASE_URL}${entry.snapshotPath}`
    fetch(url)
      .then(async (r) => {
        if (!r.ok) throw new Error(`${r.status} ${r.statusText}`)
        return (await r.json()) as SnapshotEnvelope
      })
      .then((envelope) => {
        if (cancelled) return
        if (envelope.ok && envelope.data) {
          setState({
            status: 'ok',
            data: envelope.data,
            builtAt: envelope.builtAt,
          })
        } else {
          setState({
            status: 'build-failed',
            message: envelope.error ?? 'Unknown build error',
            builtAt: envelope.builtAt,
          })
        }
      })
      .catch((err) => {
        if (!cancelled)
          setState({
            status: 'fetch-failed',
            message: String(err.message ?? err),
          })
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
        {state.status === 'fetch-failed' && (
          <div className="status error">
            Couldn’t load snapshot:&nbsp;{state.message}
          </div>
        )}
        {state.status === 'build-failed' && (
          <div className="status error">
            <strong>Build failed</strong>
            <br />
            <code style={{ fontSize: '0.8rem', wordBreak: 'break-word' }}>
              {state.message}
            </code>
            <br />
            <small style={{ color: '#9aa0ad' }}>
              last attempt: {new Date(state.builtAt).toLocaleString()}
            </small>
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
