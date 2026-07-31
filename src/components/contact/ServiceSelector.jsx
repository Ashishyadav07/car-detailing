import React from 'react'
import { motion } from 'framer-motion'

const SERVICES = [
  { id: 'ppf', label: 'PPF' },
  { id: 'ceramic', label: 'CERAMIC' },
  { id: 'correction', label: 'CORRECTION' },
  { id: 'interior', label: 'INTERIOR' },
  { id: 'full', label: 'FULL BUILD' },
]

// A drive-mode-style segmented control, not a <select>. The active pill is a
// single shared-layout element that physically slides between positions.
export default function ServiceSelector({ value, onChange }) {
  return (
    <div className="flex flex-wrap gap-1.5 p-1.5 rounded-full bg-slate-950/80 border border-slate-800/80">
      {SERVICES.map((s) => {
        const active = s.id === value
        return (
          <button
            key={s.id}
            type="button"
            onClick={() => onChange(s.id)}
            className={`relative px-3.5 py-2 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider transition-colors duration-200 ${
              active ? 'text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {active && (
              <motion.span
                layoutId="service-indicator"
                className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 shadow-lg shadow-blue-600/30"
                transition={{ type: 'spring', stiffness: 400, damping: 32 }}
              />
            )}
            <span className="relative">{s.label}</span>
          </button>
        )
      })}
    </div>
  )
}

export { SERVICES }
