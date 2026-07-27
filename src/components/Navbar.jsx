import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Car, Menu, X, BookmarkCheck } from 'lucide-react'

export default function Navbar({ onOpenSummary }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <motion.header
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-4 left-0 right-0 z-50 max-w-[1440px] w-[calc(100%-48px)] mx-auto pointer-events-auto"
    >
      <div className="backdrop-blur-xl bg-slate-950/60 border-[0.5px] border-slate-800/60 rounded-2xl px-6 py-3 shadow-2xl shadow-black/50 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-3 cursor-pointer group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-400 p-[1px] shadow-md shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-all duration-300">
            <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
              <Car className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform duration-300" />
            </div>
          </div>
          <span className="font-extrabold text-base tracking-wider bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            APEX<span className="text-blue-500 font-light">STUDIO</span>
          </span>
        </div>

        {/* Center Navigation Links - Desktop */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-semibold uppercase tracking-widest text-slate-300">
          <a href="#experience" className="hover:text-blue-400 transition-colors duration-200">
            Experience
          </a>
          <a href="#services" className="hover:text-blue-400 transition-colors duration-200">
            Services
          </a>
          <a href="#about" className="hover:text-blue-400 transition-colors duration-200">
            About
          </a>
        </nav>

        {/* Right Actions: Your Build Button & Book Now CTA */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={onOpenSummary}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-200 bg-slate-900/80 border-[0.5px] border-slate-700/60 hover:bg-slate-800 transition-all"
          >
            <BookmarkCheck className="w-3.5 h-3.5 text-blue-400" /> YOUR BUILD
          </button>
          <a
            href="#book"
            className="px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-500 border-[0.5px] border-blue-400/40 shadow-lg shadow-blue-600/25 transition-all duration-200"
          >
            BOOK NOW
          </a>
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="md:hidden flex items-center gap-2">
          <button
            onClick={onOpenSummary}
            className="px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider text-white bg-blue-600"
          >
            BUILD
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-300 hover:text-white transition-colors"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="mt-2 backdrop-blur-2xl bg-slate-950/90 border-[0.5px] border-slate-800/80 rounded-2xl p-5 md:hidden shadow-2xl flex flex-col gap-4 text-center"
          >
            <a
              href="#experience"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-semibold uppercase tracking-wider text-slate-300 hover:text-blue-400 py-1"
            >
              Experience
            </a>
            <a
              href="#services"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-semibold uppercase tracking-wider text-slate-300 hover:text-blue-400 py-1"
            >
              Services
            </a>
            <a
              href="#about"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-semibold uppercase tracking-wider text-slate-300 hover:text-blue-400 py-1"
            >
              About
            </a>
            <button
              onClick={() => {
                setMobileMenuOpen(false)
                onOpenSummary()
              }}
              className="py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-200 bg-slate-900 border border-slate-700 flex items-center justify-center gap-2"
            >
              <BookmarkCheck className="w-4 h-4 text-blue-400" /> YOUR BUILD SUMMARY
            </button>
            <a
              href="#book"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/30"
            >
              BOOK NOW
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
