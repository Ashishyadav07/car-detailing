import React from 'react'
import { motion } from 'framer-motion'

export default function HeroSection() {
  return (
    <div className="absolute inset-0 pointer-events-none z-30 flex flex-col justify-between p-6 md:p-12">
      {/* Top Left Minimal Headline */}
      <div className="max-w-md mt-20 md:mt-24">
        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="text-3xl md:text-5xl font-black tracking-tight text-white uppercase leading-none drop-shadow-lg"
        >
          CRAFTED FOR{' '}
          <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">
            PERFECTION
          </span>
        </motion.h1>

        {/* Minimal Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="mt-3 text-xs md:text-sm text-slate-300/80 font-normal tracking-wide max-w-sm drop-shadow-md"
        >
          Bespoke automotive detailing and 3D studio configurator.
        </motion.p>
      </div>
    </div>
  )
}
