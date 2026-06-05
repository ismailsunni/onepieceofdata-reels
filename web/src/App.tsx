import { useEffect, useMemo, useState } from 'react'
import {
  COMPOSITIONS,
  type CompositionKind,
  type PublishStatus,
} from './compositions'
import { CompositionCard } from './CompositionCard'

type FormatFilter = 'all' | CompositionKind
type StatusFilter = 'all' | PublishStatus
type Theme = 'system' | 'light' | 'dark'

const THEME_ORDER: Theme[] = ['system', 'light', 'dark']
const THEME_LABEL: Record<Theme, string> = {
  system: 'System',
  light: 'Light',
  dark: 'Dark',
}

function nextTheme(t: Theme): Theme {
  return THEME_ORDER[(THEME_ORDER.indexOf(t) + 1) % THEME_ORDER.length]
}

function ThemeIcon({ theme }: { theme: Theme }) {
  const common = {
    width: 18,
    height: 18,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  }
  if (theme === 'light') {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
      </svg>
    )
  }
  if (theme === 'dark') {
    return (
      <svg {...common}>
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
    )
  }
  return (
    <svg {...common}>
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <path d="M8 21h8M12 17v4" />
    </svg>
  )
}

function readTheme(): Theme {
  try {
    const t = localStorage.getItem('theme')
    if (t === 'light' || t === 'dark' || t === 'system') return t
  } catch {
    /* localStorage unavailable */
  }
  return 'system'
}

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
  const [theme, setTheme] = useState<Theme>(readTheme)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try {
      localStorage.setItem('theme', theme)
    } catch {
      /* localStorage unavailable */
    }
  }, [theme])

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
        <div className="header-top">
          <h1>One Piece of Data — Studio</h1>
          <button
            type="button"
            className="theme-toggle"
            onClick={() => setTheme(nextTheme(theme))}
            aria-label={`Theme: ${THEME_LABEL[theme]}. Click to switch to ${THEME_LABEL[nextTheme(theme)]}.`}
            title={`Theme: ${THEME_LABEL[theme]} (click to change)`}
          >
            <ThemeIcon theme={theme} />
          </button>
        </div>
        <p className="header-cta">
          Data-driven reels and carousels about the world of One Piece — every
          chart, ranking, and number pulled straight from the dataset, with new
          drops landing here — follow along on{' '}
          <a
            href="https://www.instagram.com/onepieceofdata/"
            target="_blank"
            rel="noreferrer"
          >
            Instagram
          </a>
          . Want to dig into the data yourself, run custom analytics, or build
          your own visualizations? Head to{' '}
          <a href="https://onepieceofdata.com" target="_blank" rel="noreferrer">
            onepieceofdata.com
          </a>
          .
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
