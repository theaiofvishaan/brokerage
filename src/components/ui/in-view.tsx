'use client'

import { useRef, useEffect, ReactNode } from 'react'
import { motion, useAnimation, Variants } from 'framer-motion'

interface InViewProps {
  children: ReactNode
  variants?: Variants
  transition?: Record<string, unknown>
  once?: boolean
  margin?: string
}

const defaultVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
}

export function InView({
  children,
  variants = defaultVariants,
  transition = { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  once = true,
  margin = '0px 0px -50px 0px',
}: InViewProps) {
  const ref = useRef<HTMLDivElement>(null)
  const controls = useAnimation()

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          controls.start('visible')
          if (once) observer.unobserve(el)
        }
      },
      { threshold: 0, rootMargin: margin }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [controls, once, margin])

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={variants}
      transition={transition}
    >
      {children}
    </motion.div>
  )
}
