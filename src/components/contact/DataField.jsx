import React, { useState } from 'react'
import { motion } from 'framer-motion'

// Underline-only "data entry" line — no box, no fill. A floating label docks
// up into a mono readout on focus/fill, and the underline itself draws in
// from center rather than just changing color, so focus reads as a distinct
// mechanical action instead of a CSS state swap.
export default function DataField({ label, type = 'text', value, onChange, required, placeholder }) {
  const [focused, setFocused] = useState(false)
  const elevated = focused || Boolean(value)

  return (
    <label className="relative block pt-4">
      <motion.span
        animate={{
          y: elevated ? 0 : 22,
          scale: elevated ? 1 : 1.15,
          color: focused ? 'rgb(96 165 250)' : 'rgb(100 116 139)',
        }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="absolute left-0 top-0 origin-left text-[10px] font-mono font-bold uppercase tracking-[0.25em] pointer-events-none"
      >
        {label}
      </motion.span>
      <input
        type={type}
        required={required}
        placeholder={focused ? placeholder : ''}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="w-full bg-transparent border-0 border-b border-slate-800 pb-2 pt-1 text-sm text-white placeholder-slate-700 focus:outline-none [color-scheme:dark]"
      />
      <span className="absolute left-0 bottom-0 h-px w-full bg-slate-800" />
      <motion.span
        className="absolute left-1/2 bottom-0 h-px bg-gradient-to-r from-blue-500 via-blue-400 to-cyan-400 origin-center -translate-x-1/2"
        animate={{ width: focused ? '100%' : '0%' }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      />
    </label>
  )
}
