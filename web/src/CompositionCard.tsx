import { useEffect, useRef, useState } from 'react'
import { Player, type PlayerRef } from '@remotion/player'
import type {
  CompositionEntry,
  Platform,
  PublishStatus,
} from './compositions'

interface Props {
  entry: CompositionEntry
  autoPlay?: boolean
}

const STATUS_LABEL: Record<PublishStatus, string> = {
  draft: 'Draft',
  scheduled: 'Scheduled',
  published: 'Published',
}

const PLATFORM_LABEL: Record<Platform, string> = {
  instagram: 'Instagram',
  tiktok: 'TikTok',
  youtube: 'YouTube',
  x: 'X',
}

function formatDate(iso: string): string {
  // Parse as a plain calendar date (avoid TZ shifting the day).
  const [y, m, d] = iso.split('-').map(Number)
  if (!y || !m || !d) return iso
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
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

export function CompositionCard({ entry, autoPlay = false }: Props) {
  const [state, setState] = useState<SnapshotState>({ status: 'loading' })
  const playerRef = useRef<PlayerRef>(null)

  // Kick off playback once the snapshot is ready. The Player's own `autoPlay`
  // can be swallowed by the browser's autoplay policy, so we also drive it
  // imperatively and retry on the first user interaction with the page.
  useEffect(() => {
    if (!autoPlay || state.status !== 'ok') return

    const start = () => playerRef.current?.play()
    // Defer to the next tick so the player has mounted and registered.
    const id = window.setTimeout(start, 0)

    const onInteract = () => start()
    window.addEventListener('pointerdown', onInteract, { once: true })
    window.addEventListener('keydown', onInteract, { once: true })

    return () => {
      window.clearTimeout(id)
      window.removeEventListener('pointerdown', onInteract)
      window.removeEventListener('keydown', onInteract)
    }
  }, [autoPlay, state.status])

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
        <div className="card-title-row">
          <h2 className="card-title">{entry.title}</h2>
          <span className={`badge status-${entry.status}`}>
            {STATUS_LABEL[entry.status]}
          </span>
        </div>
        <p className="card-meta">
          {entry.description} · {entry.width}×{entry.height} · {entry.fps} fps
        </p>
        <div className="card-info">
          <span className="card-info-item">
            Created {formatDate(entry.createdAt)}
          </span>
          {entry.publication ? (
            <a
              className="card-info-item link"
              href={entry.publication.url}
              target="_blank"
              rel="noreferrer"
            >
              ↗ {PLATFORM_LABEL[entry.publication.platform]}
              {entry.publication.publishedAt
                ? ` · ${formatDate(entry.publication.publishedAt)}`
                : ''}
            </a>
          ) : (
            <span className="card-info-item muted">Not published</span>
          )}
        </div>
        {entry.tags && entry.tags.length > 0 && (
          <div className="card-tags">
            {entry.tags.map((t) => (
              <span key={t} className="tag">
                #{t}
              </span>
            ))}
          </div>
        )}
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
            ref={playerRef}
            component={entry.component}
            inputProps={state.data}
            durationInFrames={Math.max(durationInFrames, 1)}
            fps={entry.fps}
            compositionWidth={entry.width}
            compositionHeight={entry.height}
            controls
            loop
            autoPlay={autoPlay}
            style={{ width: '100%', height: '100%' }}
          />
        )}
      </div>
    </article>
  )
}
