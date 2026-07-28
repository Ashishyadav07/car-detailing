import React, { useRef, useState, useEffect } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import { Award, Shield, Cpu, Flame } from 'lucide-react'

const STATS = [
  { value: '15+', label: 'YEARS OF MASTERY' },
  { value: '1,200+', label: 'SUPERCARS COMMISSIONED' },
  { value: '100%', label: 'PRECISION GUARANTEE' },
  { value: '9H+', label: 'CERAMIC HARDNESS' },
]

const FEATURE_CARDS = [
  {
    icon: Shield,
    iconColor: 'text-blue-400',
    title: 'Climate-Controlled Bay',
    desc: 'Filtered, humidity-regulated environment ensuring optimal curing conditions for ceramic coatings and PPF adhesion.',
  },
  {
    icon: Cpu,
    iconColor: 'text-indigo-400',
    title: 'Computer-Cut Patterns',
    desc: "Precision software plotting guarantees zero razor blade contact with your vehicle's factory paint surface.",
  },
  {
    icon: Flame,
    iconColor: 'text-cyan-400',
    title: 'Infrared Curing',
    desc: 'Short-wave IR heat lamps lock in ceramic nano-particles for maximum chemical resistance and mirror sheen.',
  },
  {
    badge: 'CONFIDENCE',
    title: 'Fully Insured Studio',
    desc: 'Comprehensive garage keepers liability insurance covering rare hypercars and bespoke builds.',
  },
]

// Animated Integer Stat Counter
function StatCounter({ value, label }) {
  const nodeRef = useRef(null)
  const isInView = useInView(nodeRef, { once: true, margin: '-50px' })
  const shouldReduceMotion = useReducedMotion()
  const [displayValue, setDisplayValue] = useState(shouldReduceMotion ? value : '0')

  useEffect(() => {
    if (!isInView || shouldReduceMotion) return

    let targetNum = 0
    let prefix = ''
    let suffix = ''
    let isFormattedComma = false

    if (value.includes('1,200')) {
      targetNum = 1200
      suffix = '+'
      isFormattedComma = true
    } else if (value.endsWith('+')) {
      targetNum = parseInt(value, 10) || 0
      suffix = '+'
      if (value.startsWith('9H')) {
        prefix = '9H'
        targetNum = 9
      }
    } else if (value.endsWith('%')) {
      targetNum = parseInt(value, 10) || 0
      suffix = '%'
    }

    if (targetNum === 0) {
      setDisplayValue(value)
      return
    }

    const duration = 1400 // ms
    const steps = 35
    const stepTime = duration / steps
    let currentStep = 0

    const timer = setInterval(() => {
      currentStep++
      const progress = currentStep / steps
      const easeProgress = 1 - Math.pow(1 - progress, 3) // cubic easeOut
      const currentVal = Math.round(easeProgress * targetNum)

      let formatted = currentVal.toString()
      if (isFormattedComma && currentVal >= 1000) {
        formatted = currentVal.toLocaleString()
      }

      if (prefix === '9H') {
        setDisplayValue(`9H${suffix}`)
      } else {
        setDisplayValue(`${prefix}${formatted}${suffix}`)
      }

      if (currentStep >= steps) {
        clearInterval(timer)
        setDisplayValue(value)
      }
    }, stepTime)

    return () => clearInterval(timer)
  }, [isInView, value, shouldReduceMotion])

  return (
    <div ref={nodeRef}>
      <div className="text-2xl md:text-3xl font-black text-white font-mono bg-gradient-to-r from-white via-slate-200 to-blue-400 bg-clip-text text-transparent">
        {displayValue}
      </div>
      <div className="text-[10px] font-mono text-slate-500 font-bold uppercase tracking-wider mt-1">
        {label}
      </div>
    </div>
  )
}

export default function AboutSection() {
  const shouldReduceMotion = useReducedMotion()

  const cardVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 25 },
    visible: (idx) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        delay: shouldReduceMotion ? 0 : idx * 0.1,
        ease: [0.16, 1, 0.3, 1],
      },
    }),
  }

  return (
    <section id="about" className="relative bg-[#060709] py-24 md:py-32 px-6 md:px-12 border-t border-slate-800/40 z-20 overflow-hidden">
      {/* Subtle Ambient Glow Effects */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Column Text & Counters */}
          <motion.div
            initial={{ opacity: 0, x: shouldReduceMotion ? 0 : -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-900 border border-slate-700/60 text-blue-400 text-xs font-mono font-bold tracking-widest uppercase mb-4">
              <Award className="w-3.5 h-3.5" />
              THE STUDIO STANDARD
            </div>
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-white leading-tight mb-6">
              WHERE CRAFTSMANSHIP MEETS{' '}
              <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">
                HIGH-TECH PRECISION
              </span>
            </h2>
            <p className="text-slate-300 text-sm md:text-base leading-relaxed mb-6 font-light">
              APEXSTUDIO was founded on a singular principle: treating luxury and exotic automobiles not merely as vehicles, but as kinetic works of art.
            </p>
            <p className="text-slate-400 text-sm leading-relaxed mb-8 font-light">
              Our state-of-the-art detailing bay features specialized color-matched 5000K LED lighting grids, dust-filtered clean rooms, and digital paint depth inspection instruments ensuring flawless reflections under any light.
            </p>

            {/* Metrics Counters */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-6 border-t border-slate-800/80">
              {STATS.map((stat) => (
                <StatCounter key={stat.label} value={stat.value} label={stat.label} />
              ))}
            </div>
          </motion.div>

          {/* Right Column Feature Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {FEATURE_CARDS.map((card, idx) => {
              const Icon = card.icon
              return (
                <motion.div
                  key={card.title}
                  custom={idx}
                  variants={cardVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: '-50px' }}
                  whileHover={shouldReduceMotion ? {} : { y: -5 }}
                  className="bg-slate-950/70 border border-slate-800/80 hover:border-blue-500/40 rounded-2xl p-6 backdrop-blur-xl transition-all duration-300 shadow-xl flex flex-col justify-between"
                >
                  <div>
                    {Icon ? (
                      <Icon className={`w-8 h-8 ${card.iconColor} mb-4`} />
                    ) : (
                      <div className="text-xs font-mono font-bold text-blue-400 uppercase tracking-widest mb-2">
                        {card.badge}
                      </div>
                    )}
                    <h3 className="text-base font-bold text-white mb-2">{card.title}</h3>
                    <p className="text-slate-400 text-xs leading-relaxed font-light">{card.desc}</p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
