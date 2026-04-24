'use client'

interface MarqueeProps {
  text?: string
  speed?: number
}

const DEFAULT_TEXT = 'SOLUS · REAL ESTATE PARTNERS · PRIVATE · PRECISION · RESULTS ·'

export default function Marquee({ text = DEFAULT_TEXT, speed = 25 }: MarqueeProps) {
  const repeated = `${text}   ${text}   ${text}   ${text}   `

  return (
    <div
      style={{
        borderTop: '0.5px solid var(--hairline)',
        borderBottom: '0.5px solid var(--hairline)',
        overflow: 'hidden',
        padding: '14px 0',
      }}
    >
      <div
        style={{
          display: 'flex',
          whiteSpace: 'nowrap',
          '--marquee-speed': `${speed}s`,
        } as React.CSSProperties}
      >
        <span
          className="marquee-track"
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: 9,
            letterSpacing: '0.5em',
            color: 'rgba(154, 138, 112, 0.7)',
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
            color: 'rgba(154, 138, 112, 0.7)',
            textTransform: 'uppercase',
          }}
        >
          {repeated}
        </span>
      </div>
    </div>
  )
}
