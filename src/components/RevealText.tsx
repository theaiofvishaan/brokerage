'use client'

import { motion } from 'framer-motion'

interface RevealTextProps {
  text: string
  className?: string
  style?: React.CSSProperties
  delay?: number
  tag?: 'h1' | 'h2' | 'h3' | 'p' | 'span'
}

export default function RevealText({
  text,
  className,
  style,
  delay = 0,
  tag = 'span',
}: RevealTextProps) {
  const words = text.split(' ')
  const Tag = tag

  return (
    <Tag className={className} style={{ ...style, display: 'flex', flexWrap: 'wrap', gap: '0.25em' }}>
      {words.map((word, i) => (
        <span key={i} style={{ overflow: 'hidden', display: 'inline-block' }}>
          <motion.span
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{
              duration: 0.75,
              delay: delay + i * 0.08,
              ease: [0.16, 1, 0.3, 1],
            }}
            style={{ display: 'inline-block', willChange: 'transform' }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </Tag>
  )
}
