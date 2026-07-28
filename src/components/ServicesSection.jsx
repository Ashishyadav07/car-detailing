import React from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { ShieldCheck, Sparkles, Wrench, Layers, ArrowRight } from 'lucide-react'

const SERVICES = [
  {
    icon: ShieldCheck,
    title: 'Paint Protection Film (PPF)',
    subtitle: 'Self-Healing Urethane Armor',
    desc: 'Custom computer-cut clear film providing ultimate protection against rock chips, road debris, and micro-scratches with optical clarity.',
    badge: '10-YEAR WARRANTY',
  },
  {
    icon: Sparkles,
    title: 'Ceramic & Nano-Glass Coating',
    subtitle: '9H Hydrophobic Matrix',
    desc: 'Multi-layer permanent hydrophobic glass coating engineering intense depth, wet look gloss, and effortless self-cleaning properties.',
    badge: 'MAXIMUM GLOSS',
  },
  {
    icon: Wrench,
    title: 'Multi-Stage Paint Correction',
    subtitle: 'Defect Removal & Polishing',
    desc: 'Precision paint levelling utilizing digital paint depth gauges to eliminate 99%+ of swirls, scratches, and oxidation.',
    badge: 'MIRROR REFLECTION',
  },
  {
    icon: Layers,
    title: 'Bespoke Interior Concierge',
    subtitle: 'Leather & Alcantara Restoration',
    desc: 'Deep steam extraction, Swissvax leather feeding, matte trim restoration, and hydrophobic fabric defense coatings.',
    badge: 'HYGIENIC PURITY',
  },
]

export default function ServicesSection() {
  const shouldReduceMotion = useReducedMotion()

  const cardVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 30 },
    visible: (idx) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.65,
        delay: shouldReduceMotion ? 0 : idx * 0.1,
        ease: [0.16, 1, 0.3, 1],
      },
    }),
  }

  return (
    <section id="services" className="relative bg-[#08090c] py-24 md:py-32 px-6 md:px-12 border-t border-slate-800/60 z-20 overflow-hidden">
      {/* Subtle Ambient Background Light */}
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-950/60 border border-blue-500/30 text-blue-400 text-xs font-mono font-bold tracking-widest uppercase mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              OUR CAPABILITIES
            </div>
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-white leading-tight">
              BESPOKE DETAILING{' '}
              <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">
                SERVICES
              </span>
            </h2>
          </div>
          <p className="text-slate-400 text-sm md:text-base max-w-md font-light leading-relaxed">
            Elevating automotive aesthetics through uncompromised craftsmanship, advanced chemistry, and clinical precision.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {SERVICES.map((service, idx) => {
            const Icon = service.icon
            return (
              <motion.div
                key={service.title}
                custom={idx}
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-60px' }}
                whileHover={shouldReduceMotion ? {} : { y: -5 }}
                className="group relative bg-slate-950/60 border border-slate-800/80 hover:border-blue-500/50 rounded-2xl p-6 backdrop-blur-xl shadow-xl transition-all duration-300 flex flex-col justify-between h-full"
              >
                <div>
                  {/* Top Icon & Badge */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center group-hover:bg-blue-600 group-hover:border-blue-400 group-hover:scale-105 transition-all duration-300 shadow-md">
                      <Icon className="w-6 h-6 text-blue-400 group-hover:text-white transition-colors duration-300" />
                    </div>
                    <span className="text-[10px] font-mono font-bold tracking-widest text-blue-400/90 bg-blue-950/40 border border-blue-800/40 px-2.5 py-1 rounded-md">
                      {service.badge}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-lg font-bold text-white mb-1 group-hover:text-blue-300 transition-colors duration-300">
                    {service.title}
                  </h3>
                  <div className="text-xs font-mono text-slate-400 mb-3 uppercase tracking-wider">
                    {service.subtitle}
                  </div>
                  <p className="text-slate-400 text-xs leading-relaxed font-light">
                    {service.desc}
                  </p>
                </div>

                {/* Bottom Action */}
                <div className="mt-8 pt-4 border-t border-slate-900/80 flex items-center justify-between text-xs font-bold font-mono text-slate-400 group-hover:text-white transition-colors duration-300">
                  <span className="group-hover:translate-x-0.5 transition-transform duration-300">LEARN MORE</span>
                  <ArrowRight className="w-4 h-4 text-blue-400 group-hover:translate-x-1.5 transition-transform duration-300" />
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
