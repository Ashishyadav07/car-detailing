import React, { useRef } from 'react'
import { useScroll, motion, useInView, useReducedMotion } from 'framer-motion'
import { Calendar } from 'lucide-react'
import ContactBackdrop from './contact/ContactBackdrop'
import ConsolePanel from './contact/ConsolePanel'

// Act 5 — "Reserve Your Bay". Short by design (150-200vh): this is the
// film's emotional resolution, not another chapter, so it gets one arrival
// beat and one payoff (the ignition confirm) instead of a scroll-scrubbed
// narrative sequence. id="book" is preserved for the Navbar/Footer anchor.
export default function ContactSection() {
  const sectionRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  })

  const contentRef = useRef(null)
  const isInView = useInView(contentRef, { once: true, margin: '-10% 0px' })
  const shouldReduceMotion = useReducedMotion()

  return (
    <section ref={sectionRef} id="book" className="relative w-full h-[180vh] bg-[#08090c]">
      <div className="sticky top-0 left-0 w-full h-screen h-[100dvh] overflow-hidden flex items-center justify-center">
        <ContactBackdrop scrollYProgress={scrollYProgress} />

        <div
          ref={contentRef}
          className="relative z-20 w-full max-w-6xl mx-auto px-6 flex flex-col items-center"
          style={{ perspective: 1400 }}
        >
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center text-center mb-8"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-950/60 border border-blue-500/30 text-blue-300 text-[10px] font-mono font-bold tracking-[0.3em] uppercase mb-4">
              <Calendar className="w-3 h-3" />
              RESERVE YOUR BAY
            </div>
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-extralight text-white tracking-tight leading-none">
              Configure Your Session
            </h2>
            <p className="mt-3 text-sm md:text-base font-light text-slate-300/70 max-w-md">
              One console. Every detail, dialed in before you arrive.
            </p>
          </motion.div>

          <motion.div
            initial={
              shouldReduceMotion
                ? { opacity: 0 }
                : { opacity: 0, rotateX: 10, y: 50, scale: 0.96 }
            }
            animate={
              isInView
                ? shouldReduceMotion
                  ? { opacity: 1 }
                  : { opacity: 1, rotateX: 0, y: 0, scale: 1 }
                : {}
            }
            transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            style={{ transformStyle: 'preserve-3d' }}
            className="w-full flex justify-center"
          >
            <ConsolePanel />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
