import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2 } from 'lucide-react'
import DataField from './DataField'
import ServiceSelector, { SERVICES } from './ServiceSelector'
import MagneticIgnition from './MagneticIgnition'
import StudioReadout from './StudioReadout'

export default function ConsolePanel() {
  const [submitted, setSubmitted] = useState(false)
  const [flashing, setFlashing] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', phone: '', vehicle: '', service: 'ppf', date: '' })

  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))

  const handleIgnite = (e) => {
    e.preventDefault()
    setFlashing(true)
    window.setTimeout(() => {
      setSubmitted(true)
      setFlashing(false)
    }, 420)
  }

  return (
    <>
      {/* Full-bleed ignition bloom — the single strongest micro-moment on the page */}
      <AnimatePresence>
        {flashing && (
          <motion.div
            className="fixed inset-0 z-50 pointer-events-none mix-blend-screen bg-[radial-gradient(circle_at_50%_60%,rgba(219,234,254,0.95),rgba(59,130,246,0.4)_45%,transparent_75%)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 0.42, times: [0, 0.4, 1], ease: 'easeOut' }}
          />
        )}
      </AnimatePresence>

      <div className="w-full max-w-xl bg-slate-950/70 border border-slate-800/80 rounded-3xl p-7 md:p-9 backdrop-blur-xl shadow-2xl shadow-black/60 relative overflow-hidden">
        {/* thin scanning hairline along the top edge — instrument-panel detail */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-400/50 to-transparent" />

        <AnimatePresence mode="wait">
          {submitted ? (
            <motion.div
              key="confirmed"
              initial={{ opacity: 0, filter: 'blur(8px)', y: 12 }}
              animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="py-10 flex flex-col items-center text-center gap-4"
            >
              <div className="w-14 h-14 rounded-full bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-300">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-white uppercase tracking-wide">Session Confirmed</h3>
              <p className="text-slate-400 text-xs max-w-sm leading-relaxed">
                <span className="text-white font-semibold">{form.name || 'Valued client'}</span>, your bay is
                reserved. A studio manager will confirm the final details shortly.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-2 px-5 py-2 rounded-full bg-slate-900 border border-slate-700 text-[10px] font-mono font-bold text-slate-300 hover:text-white uppercase tracking-widest transition-colors"
              >
                New Reservation
              </button>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              onSubmit={handleIgnite}
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div>
                <div className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-slate-500 mb-2">
                  Select Discipline
                </div>
                <ServiceSelector value={form.service} onChange={(v) => setForm((p) => ({ ...p, service: v }))} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
                <DataField label="Full Name" value={form.name} onChange={set('name')} required placeholder="Marcus Vance" />
                <DataField label="Email" type="email" value={form.email} onChange={set('email')} required placeholder="marcus@apex.com" />
                <DataField label="Phone" type="tel" value={form.phone} onChange={set('phone')} required placeholder="+1 (555) 000-0000" />
                <DataField label="Vehicle" value={form.vehicle} onChange={set('vehicle')} required placeholder="2024 Shelby GT500" />
                <DataField label="Preferred Date" type="date" value={form.date} onChange={set('date')} required />
              </div>

              <MagneticIgnition label="RESERVE SESSION" />

              <div className="pt-4 border-t border-slate-800/60">
                <StudioReadout />
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}
