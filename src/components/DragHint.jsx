import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MoveHorizontal } from 'lucide-react'

export default function DragHint({ visible }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 0.7, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.4 } }}
          transition={{ duration: 0.8, delay: 1.0 }}
          className="absolute top-28 left-1/2 -translate-x-1/2 z-30 pointer-events-none"
        >
          <div className="flex items-center gap-2 bg-slate-900/60 text-slate-300 px-4 py-1.5 rounded-full border-[0.5px] border-slate-700/40 backdrop-blur-md text-[11px] font-mono tracking-widest uppercase shadow-lg">
            <MoveHorizontal className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
            <span>Drag to Explore 360°</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
