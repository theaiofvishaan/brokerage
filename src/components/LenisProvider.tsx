'use client'

import { useEffect } from 'react'
import Lenis from '@studio-freight/lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

export default function LenisProvider({
  children,
}: {
  children: React.ReactNode
}) {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 0.8,
      easing: (t: number) => 1 - Math.pow(1 - t, 3),
      orientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.2,
      touchMultiplier: 2,
    })

    lenis.on('scroll', ScrollTrigger.update)

    const tickerCallback = (time: number) => {
      lenis.raf(time * 1000)
    }

    gsap.ticker.add(tickerCallback)
    gsap.ticker.lagSmoothing(0)

    // Double refresh to ensure correct initialization
    setTimeout(() => ScrollTrigger.refresh(), 100)
    setTimeout(() => ScrollTrigger.refresh(), 500)

    const handleRouteRefresh = () => {
      lenis.resize()
      setTimeout(() => ScrollTrigger.refresh(), 350)
    }
    window.addEventListener('solus:routechange', handleRouteRefresh)

    return () => {
      gsap.ticker.remove(tickerCallback)
      window.removeEventListener('solus:routechange', handleRouteRefresh)
      lenis.destroy()
    }
  }, [])

  return <>{children}</>
}
