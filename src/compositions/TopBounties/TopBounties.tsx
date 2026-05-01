import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion'
import type { BountyRow } from './fetch'
import { formatBerry } from '../../lib/format'

export type TopBountiesProps = {
  rows: BountyRow[]
} & Record<string, unknown>

const TITLE_DURATION = 30
const ROW_STAGGER = 12

export function TopBounties({ rows }: TopBountiesProps) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const titleOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: 'clamp',
  })

  return (
    <AbsoluteFill
      style={{
        background:
          'linear-gradient(180deg, #0b1d3a 0%, #1e3a8a 50%, #0b1d3a 100%)',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: 'white',
        padding: 80,
      }}
    >
      <div
        style={{
          opacity: titleOpacity,
          textAlign: 'center',
          marginTop: 40,
          marginBottom: 80,
        }}
      >
        <div
          style={{
            fontSize: 32,
            letterSpacing: 8,
            color: '#fbbf24',
            textTransform: 'uppercase',
            fontWeight: 600,
          }}
        >
          Top Bounties
        </div>
        <div
          style={{
            fontSize: 80,
            fontWeight: 800,
            marginTop: 8,
          }}
        >
          Wanted Dead or Alive
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {rows.map((row, i) => {
          const rowStart = TITLE_DURATION + i * ROW_STAGGER
          const enter = spring({
            frame: frame - rowStart,
            fps,
            config: { damping: 14, stiffness: 120 },
          })
          return (
            <div
              key={row.id}
              style={{
                opacity: enter,
                transform: `translateX(${(1 - enter) * 80}px)`,
                display: 'flex',
                alignItems: 'center',
                gap: 32,
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 24,
                padding: '24px 32px',
              }}
            >
              <div
                style={{
                  width: 72,
                  fontSize: 56,
                  fontWeight: 800,
                  color: '#fbbf24',
                  textAlign: 'center',
                }}
              >
                #{i + 1}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 44, fontWeight: 700 }}>{row.name}</div>
              </div>
              <div
                style={{
                  fontSize: 40,
                  fontWeight: 800,
                  color: '#fbbf24',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {formatBerry(row.bounty)}
              </div>
            </div>
          )
        })}
      </div>
    </AbsoluteFill>
  )
}
