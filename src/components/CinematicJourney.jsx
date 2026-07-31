import React, { useRef, useState, useEffect } from 'react'
import { useScroll, motion } from 'framer-motion'
import CraftReel from './craft/CraftReel'
import CraftAtmosphere from './craft/CraftAtmosphere'
import CraftNarrative from './craft/CraftNarrative'

// Act 2 — "The Craft". A full-bleed photographic process reel: five stills
// of hands and tools at work, connected by transitions motivated by the
// detailing action itself (a buffer pad, a raking lamp, steam, foam) rather
// than a generic crossfade. Deliberately no car, no rotation, no WebGL —
// the focus is craftsmanship, not the vehicle. id="the-journey" is
// preserved so the Navbar/Footer anchor keeps working.
export default function CinematicJourney() {
  const sectionRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  })

  const [active, setActive] = useState(false)
  useEffect(() => {
    const el = sectionRef.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(([entry]) => setActive(entry.isIntersecting), {
      rootMargin: '30% 0px 30% 0px',
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <section ref={sectionRef} id="the-journey" className="relative w-full h-[420vh] bg-[#050608]">
      <div className="sticky top-0 left-0 w-full h-screen h-[100dvh] overflow-hidden">
        {/* Handheld micro-drift — sells "standing beside the detailer" rather
            than a locked studio tripod, independent of scroll. */}
        <motion.div
          className="absolute inset-[-2%]"
          animate={{ x: [0, 4, -3, 2, 0], y: [0, -3, 2, -2, 0], rotate: [0, 0.12, -0.08, 0.06, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        >
          <CraftReel scrollYProgress={scrollYProgress} />
        </motion.div>

        {active && <CraftAtmosphere />}
        <CraftNarrative scrollYProgress={scrollYProgress} />
      </div>
    </section>
  )
}
