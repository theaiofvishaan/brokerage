'use client'

import { useEffect, useRef, useState } from 'react'

export default function ClientCursor() {
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const mouse = useRef({ x: -100, y: -100 })
  const ring = useRef({ x: -100, y: -100 })
  const rafRef = useRef<number>(0)
  const [hovered, setHovered] = useState(false)
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY }

      const el = document.elementFromPoint(e.clientX, e.clientY)
      if (el) {
        const dark = !!el.closest('[data-cursor-dark]')
        setDarkMode(dark)

        const interactive = !!(
          el.closest('a') ||
          el.closest('button') ||
          el.closest('[role="button"]') ||
          el.closest('input') ||
          el.closest('textarea') ||
          el.closest('[data-hover]')
        )
        setHovered(interactive)
      }
    }

    window.addEventListener('mousemove', onMove)

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t

    const animate = () => {
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${mouse.current.x - 4}px, ${mouse.current.y - 4}px)`
      }
      if (ringRef.current) {
        ring.current.x = lerp(ring.current.x, mouse.current.x, 0.12)
        ring.current.y = lerp(ring.current.y, mouse.current.y, 0.12)
        ringRef.current.style.transform = `translate(${ring.current.x - 12}px, ${ring.current.y - 12}px) scale(${hovered ? 1.8 : 1})`
      }
      rafRef.current = requestAnimationFrame(animate)
    }

    rafRef.current = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(rafRef.current)
    }
  }, [hovered])

  const color = darkMode ? '#1A1510' : '#C9A96E'

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
          background: color,
          pointerEvents: 'none',
          zIndex: 99999,
          willChange: 'transform',
          transition: 'background 0.3s ease',
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
          border: `0.5px solid ${color}`,
          pointerEvents: 'none',
          zIndex: 99998,
          willChange: 'transform',
          transition: `border-color 0.3s ease, transform 0.15s var(--ease-expo)`,
          opacity: 0.7,
        }}
      />
    </>
  )
}
