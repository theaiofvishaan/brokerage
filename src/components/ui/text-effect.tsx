'use client'

import { motion, AnimatePresence } from 'framer-motion'

type PresetType = 'blur' | 'fade' | 'slide'
type PerType = 'word' | 'char' | 'line'

interface TextEffectProps {
  children: string
  preset?: PresetType
  per?: PerType
  delay?: number
  className?: string
  as?: React.ElementType
}

const presets = {
  blur: {
    hidden: { opacity: 0, filter: 'blur(12px)', y: 6 },
    visible: { opacity: 1, filter: 'blur(0px)', y: 0 },
  },
  fade: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  slide: {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  },
} as const

export function TextEffect({
  children,
  preset = 'fade',
  per = 'word',
  delay = 0,
  className,
}: TextEffectProps) {
  const p = presets[preset]

  const segments = per === 'char'
    ? children.split('')
    : per === 'line'
    ? children.split('\n')
    : children.split(' ')

  return (
    <AnimatePresence>
      <motion.div
        className={className}
        initial="hidden"
        animate="visible"
        transition={{
          staggerChildren: per === 'char' ? 0.03 : 0.08,
          delayChildren: delay,
        }}
        style={{ display: 'flex', flexWrap: 'wrap', gap: per === 'char' ? 0 : '0.25em' }}
      >
        {segments.map((segment, i) => (
          <motion.span
            key={i}
            variants={{
              hidden: p.hidden,
              visible: {
                ...p.visible,
                transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
              },
            }}
            style={{ display: 'inline-block', willChange: 'transform, opacity, filter' }}
          >
            {segment === ' ' ? ' ' : segment}
          </motion.span>
        ))}
      </motion.div>
    </AnimatePresence>
  )
}
