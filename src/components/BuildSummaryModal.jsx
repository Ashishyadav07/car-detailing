import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle2, BookmarkPlus, Sparkles, Share2 } from 'lucide-react'
import {
  PAINT_OPTIONS,
  RIM_OPTIONS,
  TIRE_OPTIONS,
  BRAKE_OPTIONS,
  INTERIOR_OPTIONS,
} from '../constants/configuratorOptions'

export default function BuildSummaryModal({ isOpen, onClose, config }) {
  const activePaint = PAINT_OPTIONS.find((p) => p.id === config.paint) || PAINT_OPTIONS[0]
  const activeRim = RIM_OPTIONS.find((r) => r.id === config.rim) || RIM_OPTIONS[0]
  const activeTire = TIRE_OPTIONS.find((t) => t.id === config.tire) || TIRE_OPTIONS[0]
  const activeBrake = BRAKE_OPTIONS.find((b) => b.id === config.brake) || BRAKE_OPTIONS[0]
  const activeInterior = INTERIOR_OPTIONS.find((i) => i.id === config.interior) || INTERIOR_OPTIONS[0]

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop Blur Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-md"
          />

          {/* Compact Floating Summary Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-md bg-slate-950/90 border-[0.5px] border-slate-800/80 rounded-2xl p-6 shadow-2xl shadow-black/90 text-white backdrop-blur-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b-[0.5px] border-slate-800/60">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-400" />
                <h3 className="text-base font-extrabold tracking-wide uppercase">YOUR BESPOKE BUILD</h3>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Config Breakdown List */}
            <div className="my-5 space-y-3 font-sans text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border-[0.5px] border-slate-800/40">
                <span className="text-slate-400 font-mono uppercase tracking-wider">Exterior Paint</span>
                <span className="font-bold text-white flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full border border-white/20" style={{ backgroundColor: activePaint.color }} />
                  {activePaint.name}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border-[0.5px] border-slate-800/40">
                <span className="text-slate-400 font-mono uppercase tracking-wider">Wheel Specification</span>
                <span className="font-bold text-white flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full border border-white/20" style={{ backgroundColor: activeRim.color }} />
                  {activeRim.name}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border-[0.5px] border-slate-800/40">
                <span className="text-slate-400 font-mono uppercase tracking-wider">Tire Package</span>
                <span className="font-bold text-white flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full border border-white/20" style={{ backgroundColor: activeTire.color }} />
                  {activeTire.name}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border-[0.5px] border-slate-800/40">
                <span className="text-slate-400 font-mono uppercase tracking-wider">Brake Calipers</span>
                <span className="font-bold text-white flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full border border-white/20" style={{ backgroundColor: activeBrake.color }} />
                  {activeBrake.name}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border-[0.5px] border-slate-800/40">
                <span className="text-slate-400 font-mono uppercase tracking-wider">Interior Finish</span>
                <span className="font-bold text-white flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full border border-white/20" style={{ backgroundColor: activeInterior.color }} />
                  {activeInterior.name}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => {
                  alert('Build Specification Saved Successfully!')
                  onClose()
                }}
                className="flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2"
              >
                <BookmarkPlus className="w-4 h-4" /> SAVE BUILD
              </button>
              <button
                onClick={onClose}
                className="px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-300 border-[0.5px] border-slate-800 hover:bg-slate-900 transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
