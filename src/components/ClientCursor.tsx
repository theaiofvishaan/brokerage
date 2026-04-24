'use client'

import { useEffect, useRef } from 'react'

export default function ClientCursor() {
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const mouse = useRef({ x: -100, y: -100 })
  const ringPos = useRef({ x: -100, y: -100 })
  const hoveredRef = useRef(false)
  const darkRef = useRef(false)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY }

      const el = document.elementFromPoint(e.clientX, e.clientY)
      if (el) {
        darkRef.current = document.body.classList.contains('dark-bg')

        hoveredRef.current = !!(
          el.closest('a') ||
          el.closest('button') ||
          el.closest('[role="button"]') ||
          el.closest('[data-cursor="hover"]')
        )
      }
    }

    window.addEventListener('mousemove', onMove, { passive: true })

    const animate = () => {
      const dot = dotRef.current
      const ring = ringRef.current

      if (dot) {
        const color = darkRef.current ? '#C9A96E' : 'rgba(26,21,16,0.6)'
        dot.style.transform = `translate(${mouse.current.x - 4}px, ${mouse.current.y - 4}px)`
        dot.style.background = color
        dot.style.opacity = hoveredRef.current ? '0' : '1'
      }

      if (ring) {
        ringPos.current.x += (mouse.current.x - ringPos.current.x) * 0.15
        ringPos.current.y += (mouse.current.y - ringPos.current.y) * 0.15
        const color = darkRef.current ? '#C9A96E' : 'rgba(26,21,16,0.6)'
        const scale = hoveredRef.current ? 2.5 : 1
        const opacity = hoveredRef.current ? 0.4 : 0.6
        ring.style.transform = `translate(${ringPos.current.x - 12}px, ${ringPos.current.y - 12}px) scale(${scale})`
        ring.style.borderColor = color
        ring.style.opacity = String(opacity)
      }

      rafRef.current = requestAnimationFrame(animate)
    }

    rafRef.current = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(rafRef.current)
    }
  }, [])

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
          background: '#C9A96E',
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
          border: '1px solid #C9A96E',
          pointerEvents: 'none',
          zIndex: 9999,
          willChange: 'transform',
          opacity: 0.6,
        }}
      />
    </>
  )
}
