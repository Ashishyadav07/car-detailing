import React from 'react'
import { Car } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-[#050608] border-t border-slate-800/80 py-12 px-6 md:px-12 z-20 relative">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 p-[1px] shadow-md shadow-blue-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[7px] flex items-center justify-center">
              <Car className="w-4 h-4 text-blue-400" />
            </div>
          </div>
          <span className="font-extrabold text-sm tracking-wider text-white">
            APEX<span className="text-blue-500 font-light">STUDIO</span>
          </span>
        </div>

        {/* Links */}
        <div className="flex items-center gap-8 text-xs font-mono font-semibold uppercase tracking-wider text-slate-400">
          <a href="#experience" className="hover:text-blue-400 transition-colors">Experience</a>
          <a href="#services" className="hover:text-blue-400 transition-colors">Services</a>
          <a href="#about" className="hover:text-blue-400 transition-colors">About</a>
          <a href="#book" className="hover:text-blue-400 transition-colors">Book</a>
        </div>

        {/* Copyright */}
        <div className="text-[11px] font-mono text-slate-400">
          &copy; {new Date().getFullYear()} APEXSTUDIO. All rights reserved. High-Performance Automotive Configurator.
        </div>
      </div>
    </footer>
  )
}
