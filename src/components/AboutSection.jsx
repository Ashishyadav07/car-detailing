import React from 'react'
import { motion } from 'framer-motion'
import { Award, Shield, Cpu, Flame } from 'lucide-react'

const STATS = [
  { value: '15+', label: 'YEARS OF MASTERY' },
  { value: '1,200+', label: 'SUPERCARS COMMISSIONED' },
  { value: '100%', label: 'PRECISION GUARANTEE' },
  { value: '9H+', label: 'CERAMIC HARDNESS' },
]

export default function AboutSection() {
  return (
    <section id="about" className="relative bg-[#060709] py-28 px-6 md:px-12 border-t border-slate-800/40 z-20 overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Column Text */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
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

            {/* Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-6 border-t border-slate-800/80">
              {STATS.map((stat) => (
                <div key={stat.label}>
                  <div className="text-2xl md:text-3xl font-black text-white font-mono bg-gradient-to-r from-white via-slate-200 to-blue-400 bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <div className="text-[10px] font-mono text-slate-500 font-bold uppercase tracking-wider mt-1">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right Column Grid Cards */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-xl">
              <Shield className="w-8 h-8 text-blue-400 mb-4" />
              <h3 className="text-base font-bold text-white mb-2">Climate-Controlled Bay</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Filtered, humidity-regulated environment ensuring optimal curing conditions for ceramic coatings and PPF adhesion.
              </p>
            </div>

            <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-xl">
              <Cpu className="w-8 h-8 text-indigo-400 mb-4" />
              <h3 className="text-base font-bold text-white mb-2">Computer-Cut Patterns</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Precision software plotting guarantees zero razor blade contact with your vehicle's factory paint surface.
              </p>
            </div>

            <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-xl">
              <Flame className="w-8 h-8 text-cyan-400 mb-4" />
              <h3 className="text-base font-bold text-white mb-2">Infrared Curing</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Short-wave IR heat lamps lock in ceramic nano-particles for maximum chemical resistance and mirror sheen.
              </p>
            </div>

            <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-xl flex flex-col justify-between">
              <div>
                <div className="text-xs font-mono font-bold text-blue-400 uppercase tracking-widest mb-2">
                  CONFIDENCE
                </div>
                <h3 className="text-base font-bold text-white mb-2">Fully Insured Studio</h3>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Comprehensive garage keepers liability insurance covering rare hypercars and bespoke builds.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
