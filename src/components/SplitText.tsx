'use client'

import { useRef, useState, useEffect } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

interface SplitTextProps {
  text: string
  className?: string
  delay?: number
  tag?: 'h1' | 'h2' | 'h3' | 'p'
  style?: React.CSSProperties
}

export default function SplitText({
  text,
  className,
  delay = 0,
  tag: Tag = 'h1',
  style,
}: SplitTextProps) {
  const containerRef = useRef<HTMLElement>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useGSAP(
    () => {
      if (!mounted || !containerRef.current) return

      const chars = containerRef.current.querySelectorAll('.char')
      gsap.from(chars, {
        y: '100%',
        opacity: 0,
        stagger: 0.03,
        duration: 0.7,
        ease: 'expo.out',
        delay,
      })
    },
    { scope: containerRef, dependencies: [mounted] }
  )

  if (!mounted) {
    return (
      <Tag className={className} style={style}>
        {text}
      </Tag>
    )
  }

  const chars = text.split('')

  return (
    <Tag ref={containerRef as React.RefObject<never>} className={className} style={style} aria-label={text}>
      {chars.map((char, i) =>
        char === ' ' ? (
          <span key={i} style={{ display: 'inline-block', width: '0.3em' }}>
            &nbsp;
          </span>
        ) : (
          <span key={i} style={{ display: 'inline-block', overflow: 'hidden' }}>
            <span className="char" style={{ display: 'inline-block' }}>
              {char}
            </span>
          </span>
        )
      )}
    </Tag>
  )
}
