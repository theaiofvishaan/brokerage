'use client'

import { useRef } from 'react'
import { motion } from 'framer-motion'

interface MagneticButtonProps {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  strength?: number
}

export default function MagneticButton({
  children,
  className,
  style,
  onClick,
  type = 'button',
  disabled = false,
  strength = 0.25,
}: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement>(null)
  const posRef = useRef({ x: 0, y: 0 })

  const onMouseMove = (e: React.MouseEvent) => {
    if (!ref.current || disabled) return
    const rect = ref.current.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    posRef.current = {
      x: (e.clientX - cx) * strength,
      y: (e.clientY - cy) * strength,
    }
    ref.current.style.transform = `translate(${posRef.current.x}px, ${posRef.current.y}px)`
  }

  const onMouseLeave = () => {
    if (!ref.current) return
    ref.current.style.transform = 'translate(0px, 0px)'
    ref.current.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
  }

  const onMouseEnter = () => {
    if (!ref.current) return
    ref.current.style.transition = 'transform 0.15s ease'
  }

  return (
    <motion.button
      ref={ref}
      type={type}
      className={className}
      style={{ ...style, willChange: 'transform', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={onClick}
      disabled={disabled}
      onMouseMove={onMouseMove}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      whileTap={{ scale: 0.97 }}
    >
      {children}
    </motion.button>
  )
}
