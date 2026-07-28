import React, { useRef, useState, useEffect } from 'react'
import { motion, useScroll, useTransform, useSpring, useReducedMotion } from 'framer-motion'

const categories = [
  {
    number: '01',
    title: 'PAINT CORRECTION',
    description: 'Restoring clarity, depth and gloss to every surface.',
  },
  {
    number: '02',
    title: 'CERAMIC PROTECTION',
    description: 'Long-lasting protection with an unmistakable finish.',
  },
  {
    number: '03',
    title: 'INTERIOR DETAILING',
    description: 'Precision care for every surface inside the cabin.',
  },
]

export default function ArtOfDetailing() {
  const containerRef = useRef(null)
  const imageFrameRef = useRef(null)
  const [hoveredIndex, setHoveredIndex] = useState(null)
  const [isTouchDevice, setIsTouchDevice] = useState(false)
  const shouldReduceMotion = useReducedMotion()

  // Detect touch devices to gracefully disable mouse tilt interaction
  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0)
  }, [])

  // Section 2 Scroll Progress Tracking
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  })

  // 2.5D Layer Parallax Transforms (Background, Midground Image, Foreground Text)
  const bgY = useTransform(scrollYProgress, [0, 1], shouldReduceMotion ? [0, 0] : [-15, 15])
  const imageParallax = useTransform(scrollYProgress, [0, 1], shouldReduceMotion ? [0, 0] : [-35, 35])
  const textParallax = useTransform(scrollYProgress, [0, 1], shouldReduceMotion ? [0, 0] : [-12, 12])

  // Scroll-linked Focus & Scale Transition for Cinematic Image Reveal
  const imageScale = useTransform(scrollYProgress, [0, 0.45], shouldReduceMotion ? [1, 1] : [1.12, 1.0])
  const imageOpacity = useTransform(scrollYProgress, [0, 0.35], [0.4, 1.0])

  // Mouse Tilt/Parallax Interaction (Spring Damped for Fluid Movement)
  const mouseX = useSpring(0, { stiffness: 120, damping: 18 })
  const mouseY = useSpring(0, { stiffness: 120, damping: 18 })

  const handleMouseMove = (e) => {
    if (isTouchDevice || shouldReduceMotion || !imageFrameRef.current) return
    const rect = imageFrameRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const deltaX = (e.clientX - centerX) / (rect.width / 2)
    const deltaY = (e.clientY - centerY) / (rect.height / 2)

    mouseX.set(deltaX * 8)
    mouseY.set(deltaY * 8)
  }

  const handleMouseLeave = () => {
    mouseX.set(0)
    mouseY.set(0)
  }

  // Framer Motion Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.14,
        delayChildren: 0.1,
      },
    },
  }

  const headlineLineVariants = {
    hidden: { opacity: 0, y: 45, filter: 'blur(8px)' },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] },
    },
  }

  const imageRevealVariants = {
    hidden: { opacity: 0, clipPath: 'inset(100% 0% 0% 0%)' },
    visible: {
      opacity: 1,
      clipPath: 'inset(0% 0% 0% 0%)',
      transition: { duration: 1.15, ease: [0.16, 1, 0.3, 1], delay: 0.15 },
    },
  }

  const categoryVariants = {
    hidden: { opacity: 0, x: 30 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.75, ease: [0.16, 1, 0.3, 1] },
    },
  }

  const lineGrowVariants = {
    hidden: { scaleX: 0 },
    visible: {
      scaleX: 1,
      transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] },
    },
  }

  const floatingLabelVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.45 },
    },
  }

  return (
    <section
      ref={containerRef}
      id="art-of-detailing"
      className="relative w-full bg-[#08090c] text-white py-24 md:py-32 px-6 sm:px-10 lg:px-16 border-t border-white/5 overflow-hidden z-20"
    >
      {/* Section 2 Scroll Progress Bar */}
      <motion.div
        style={{ scaleX: scrollYProgress }}
        className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-600 via-cyan-400 to-indigo-500 origin-left z-30 opacity-70 pointer-events-none"
      />

      {/* 2.5D BACKGROUND LAYER (Subtle Gradient & Depth Parallax) */}
      <motion.div
        style={{ y: bgY }}
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900/40 via-[#08090c] to-[#08090c] pointer-events-none"
      />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* 2.5D FOREGROUND LAYER: Eyebrow, Indicator & Headline */}
        <motion.div
          style={{ y: textParallax }}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="mb-12 lg:mb-16"
        >
          {/* Eyebrow Label & Editorial Number Indicator */}
          <motion.div variants={headlineLineVariants} className="flex items-center justify-between gap-4 mb-5">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
              <span className="text-xs font-mono tracking-[0.25em] text-blue-400 uppercase font-medium">
                THE ART OF DETAILING
              </span>
            </div>

            <div className="hidden sm:flex items-center gap-2 bg-slate-950/80 border border-white/10 px-3 py-1 rounded-full text-[11px] font-mono text-slate-400">
              <span className="text-blue-400 font-semibold">01</span>
              <span>/</span>
              <span>04</span>
            </div>
          </motion.div>

          {/* Staggered Line Headline */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
            <div className="lg:col-span-8">
              <h2 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-light tracking-tight text-white leading-[1.05]">
                <motion.span variants={headlineLineVariants} className="block">
                  PRECISION
                </motion.span>
                <motion.span variants={headlineLineVariants} className="block font-extralight text-slate-300">
                  IN EVERY DETAIL.
                </motion.span>
              </h2>
            </div>

            <div className="lg:col-span-4 lg:pb-2">
              <motion.p
                variants={headlineLineVariants}
                className="text-slate-400 text-sm sm:text-base font-light leading-relaxed border-l border-white/10 pl-5"
              >
                Every surface tells a story. We refine every detail until the finish speaks for itself.
              </motion.p>
            </div>
          </div>
        </motion.div>

        {/* CENTER GRID: 2.5D MIDGROUND IMAGE & FOREGROUND CATEGORIES (Balanced Alignment) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* 2.5D MIDGROUND LAYER: Masked Image Reveal with Subtle Mouse Tilt & Scroll Parallax */}
          <div
            ref={imageFrameRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="lg:col-span-7 relative min-h-[340px] sm:min-h-[420px] lg:min-h-[460px] h-[460px] rounded-2xl overflow-hidden border border-white/10 bg-slate-900/60 shadow-2xl group"
          >
            <motion.div
              variants={imageRevealVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-60px' }}
              className="absolute inset-0 w-full h-full"
            >
              <motion.div
                style={{
                  y: imageParallax,
                  x: mouseX,
                  scale: imageScale,
                  opacity: imageOpacity,
                }}
                className="w-full h-[115%] transform -translate-y-[7.5%]"
              >
                <img
                  src="/images/art_of_detailing_macro.jpg"
                  alt="Luxury Automotive Ceramic Detailing Macro"
                  className="w-full h-full object-cover object-center"
                />
              </motion.div>

              {/* Gradient Vignette Overlays for Depth */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#08090c] via-transparent to-transparent opacity-65 pointer-events-none"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-[#08090c]/40 via-transparent to-transparent pointer-events-none"></div>
            </motion.div>

            {/* Floating Annotation Tag 1 (Top Right) */}
            <motion.div
              variants={floatingLabelVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="absolute top-6 right-6 z-10 hidden sm:flex items-center gap-2 bg-slate-950/80 border border-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-xl text-[10px] font-mono text-slate-300 tracking-wider shadow-lg"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
              <span>SURFACE SPECIFICATION // 9H CERAMIC</span>
            </motion.div>

            {/* Floating Annotation Tag 2 (Bottom Left) */}
            <motion.div
              variants={floatingLabelVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="absolute bottom-6 left-6 z-10 flex items-center gap-2.5 bg-slate-950/85 border border-white/10 backdrop-blur-md px-4 py-2 rounded-xl text-xs font-mono text-slate-200 tracking-wider shadow-xl"
            >
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></span>
              <span>PAINT CLARITY // 99.8%</span>
            </motion.div>
          </div>

          {/* 2.5D FOREGROUND LAYER: Minimal Editorial Detailing Categories */}
          <div className="lg:col-span-5 flex flex-col justify-center py-2">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-60px' }}
              className="space-y-6 lg:space-y-7"
            >

              {categories.map((item, index) => {
                const isHovered = hoveredIndex === index
                const isOtherHovered = hoveredIndex !== null && !isHovered

                return (
                  <motion.div
                    key={item.number}
                    variants={categoryVariants}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    animate={{
                      opacity: isOtherHovered ? 0.45 : 1,
                      x: isHovered ? 8 : 0,
                    }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className="relative cursor-pointer group"
                  >
                    {/* Top Animated Horizontal Divider Line */}
                    <motion.div
                      variants={lineGrowVariants}
                      className={`w-full h-[1px] origin-left mb-6 transition-colors duration-300 ${
                        isHovered
                          ? 'bg-gradient-to-r from-blue-500 via-cyan-400 to-transparent'
                          : 'bg-gradient-to-r from-white/20 via-blue-500/30 to-transparent'
                      }`}
                    ></motion.div>

                    <div className="flex items-start gap-5">
                      <span
                        className={`font-mono text-xs font-medium tracking-widest pt-1 transition-colors duration-300 ${
                          isHovered ? 'text-cyan-400' : 'text-blue-400/90'
                        }`}
                      >
                        {item.number}
                      </span>
                      <div>
                        <h3
                          className={`text-lg sm:text-xl font-medium tracking-wide transition-colors duration-300 ${
                            isHovered ? 'text-blue-400' : 'text-white'
                          }`}
                        >
                          {item.title}
                        </h3>
                        <p className="text-xs sm:text-sm font-light text-slate-400 leading-relaxed mt-1.5">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )
              })}

              {/* Bottom Closing Line */}
              <motion.div
                variants={lineGrowVariants}
                className="w-full h-[1px] bg-gradient-to-r from-white/20 via-blue-500/30 to-transparent origin-left"
              ></motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
