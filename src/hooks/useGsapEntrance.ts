'use client'

import { type RefObject } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

interface EntranceOptions {
  delay?: number
  duration?: number
  y?: number
  stagger?: number
  trigger?: boolean
  start?: string
}

export function useGsapEntrance(
  ref: RefObject<HTMLElement | null>,
  options: EntranceOptions = {}
) {
  const {
    delay = 0,
    duration = 0.9,
    y = 40,
    stagger,
    trigger = false,
    start = 'top 85%',
  } = options

  useGSAP(
    () => {
      if (!ref.current) return

      const targets = stagger != null ? ref.current.children : ref.current
      const vars: gsap.TweenVars = {
        y,
        opacity: 0,
        duration,
        ease: 'expo.out',
        delay,
        ...(stagger != null && { stagger }),
      }

      if (trigger) {
        vars.scrollTrigger = {
          trigger: ref.current,
          start,
          once: true,
        }
      }

      gsap.from(targets, vars)
    },
    { scope: ref, dependencies: [] }
  )
}
