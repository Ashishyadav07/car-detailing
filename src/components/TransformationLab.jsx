import React, { useRef, useState } from 'react'
import { useScroll, useMotionValueEvent } from 'framer-motion'
import { PAIRS, pairIndexForProgress, isIntro, isOutro } from '../utils/transformScenes'
import TransformPair from './transform/TransformPair'
import TransformNarrative from './transform/TransformNarrative'

// Act 3 — "The Transformation". Three before/after pairs, each its own
// scroll-scrubbed soft-mask reveal with a synced richness ramp, bead
// overlay, and traveling light seam — a comparison scrubber, not a rotating
// vehicle. id="services" is preserved so the Navbar/Footer anchor keeps
// working.
export default function TransformationLab() {
  const sectionRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  })

  const [activeIndex, setActiveIndex] = useState(0)
  const [phase, setPhase] = useState('intro')

  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    const nextPhase = isIntro(latest) ? 'intro' : isOutro(latest) ? 'outro' : 'pair'
    setPhase((prev) => (prev !== nextPhase ? nextPhase : prev))
    if (nextPhase === 'pair') {
      const idx = pairIndexForProgress(latest)
      setActiveIndex((prev) => (prev !== idx ? idx : prev))
    }
  })

  return (
    <section ref={sectionRef} id="services" className="relative w-full h-[380vh] bg-[#050608]">
      <div className="sticky top-0 left-0 w-full h-screen h-[100dvh] overflow-hidden">
        <div className="absolute inset-0 bg-[#050608]">
          <img
            src={PAIRS[0].before}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            loading="eager"
          />
        </div>

        {PAIRS.map((pair, i) => (
          <TransformPair
            key={pair.id}
            pair={pair}
            scrollYProgress={scrollYProgress}
            active={phase === 'pair' && activeIndex === i}
            holdAtEnd={i === PAIRS.length - 1}
          />
        ))}

        <div className="absolute inset-0 z-20 bg-[radial-gradient(ellipse_75%_65%_at_50%_45%,transparent_45%,rgba(5,6,8,0.7)_100%)] pointer-events-none" />
        <div className="absolute inset-0 z-20 bg-gradient-to-t from-[#050608] via-transparent to-[#050608]/60 pointer-events-none" />

        <TransformNarrative scrollYProgress={scrollYProgress} />
      </div>
    </section>
  )
}
