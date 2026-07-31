import React, { useRef, useState, useEffect } from 'react'
import { useScroll } from 'framer-motion'
import AboutParallax from './about/AboutParallax'
import AboutAtmosphere from './about/AboutAtmosphere'
import AboutRevealDeck from './about/AboutRevealDeck'
import AboutNarrative from './about/AboutNarrative'

// Act 4 — "The Studio Standard". A pure photographic/Framer Motion scene:
// three depth-composited stills stand in for the live 3D car (deliberately no
// fourth WebGL canvas), with four scroll-triggered macro reveals — each using
// a different mask style — carrying the studio's credentials. id="about" is
// preserved so the Navbar/Footer anchor keeps working.
export default function AboutSection() {
  const sectionRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  })

  const [atmosphereActive, setAtmosphereActive] = useState(false)
  useEffect(() => {
    const el = sectionRef.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(
      ([entry]) => setAtmosphereActive(entry.isIntersecting),
      { rootMargin: '30% 0px 30% 0px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <section ref={sectionRef} id="about" className="relative w-full h-[380vh] bg-[#050608]">
      <div className="sticky top-0 left-0 w-full h-screen h-[100dvh] overflow-hidden">
        <AboutParallax scrollYProgress={scrollYProgress} />
        {atmosphereActive && <AboutAtmosphere scrollYProgress={scrollYProgress} />}
        <AboutRevealDeck scrollYProgress={scrollYProgress} />
        <AboutNarrative scrollYProgress={scrollYProgress} />
      </div>
    </section>
  )
}
