'use client'

import { useEffect, useRef, useState } from 'react'

export default function ClientCursor() {
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const mouse = useRef({ x: -100, y: -100 })
  const ringPos = useRef({ x: -100, y: -100 })
  const hoveredRef = useRef(false)
  const rafRef = useRef<number>(0)
  const [isTouch, setIsTouch] = useState(false)

  useEffect(() => {
    if ('ontouchstart' in window) {
      setIsTouch(true)
      return
    }

    const onMove = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY }
      const el = document.elementFromPoint(e.clientX, e.clientY)
      if (el) {
        hoveredRef.current = !!(
          el.closest('a') ||
          el.closest('button') ||
          el.closest('[role="button"]') ||
          el.closest('[data-hover]')
        )
      }
    }

    window.addEventListener('mousemove', onMove, { passive: true })

    const animate = () => {
      const dot = dotRef.current
      const ring = ringRef.current

      if (dot) {
        dot.style.transform = `translate(${mouse.current.x - 4}px, ${mouse.current.y - 4}px)`
      }

      if (ring) {
        ringPos.current.x += (mouse.current.x - ringPos.current.x) * 0.18
        ringPos.current.y += (mouse.current.y - ringPos.current.y) * 0.18
        const scale = hoveredRef.current ? 2.5 : 1
        ring.style.transform = `translate(${ringPos.current.x - 12}px, ${ringPos.current.y - 12}px) scale(${scale})`
      }

      rafRef.current = requestAnimationFrame(animate)
    }

    rafRef.current = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(rafRef.current)
    }
  }, [])

  if (isTouch) return null

  return (
    <>
      <div
        ref={dotRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: 'var(--gold)',
          pointerEvents: 'none',
          zIndex: 9999,
          willChange: 'transform',
        }}
      />
      <div
        ref={ringRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: 24,
          height: 24,
          borderRadius: '50%',
          border: '1px solid var(--gold)',
          pointerEvents: 'none',
          zIndex: 9999,
          willChange: 'transform',
          opacity: 0.6,
          transition: 'transform 0.1s ease-out',
        }}
      />
    </>
  )
}
