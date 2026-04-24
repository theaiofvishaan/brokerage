'use client'

const TEXT = 'SOLUS · REAL ESTATE PARTNERS · PRIVATE · PRECISION · RESULTS · '

export default function Marquee() {
  const repeated = `${TEXT}${TEXT}${TEXT}${TEXT}`

  return (
    <div
      style={{
        borderTop: '0.5px solid rgba(180,160,120,0.2)',
        borderBottom: '0.5px solid rgba(180,160,120,0.2)',
        overflow: 'hidden',
        padding: '14px 0',
      }}
    >
      <div
        style={{
          display: 'flex',
          whiteSpace: 'nowrap',
          '--marquee-speed': '30s',
        } as React.CSSProperties}
      >
        <span
          className="marquee-track"
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: 9,
            letterSpacing: '0.5em',
            color: '#8a7a60',
            textTransform: 'uppercase',
          }}
        >
          {repeated}
        </span>
        <span
          className="marquee-track"
          aria-hidden
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: 9,
            letterSpacing: '0.5em',
            color: '#8a7a60',
            textTransform: 'uppercase',
          }}
        >
          {repeated}
        </span>
      </div>
    </div>
  )
}
