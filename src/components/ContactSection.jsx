import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Phone, Mail, MapPin, CheckCircle2, Clock, Sparkles } from 'lucide-react'

export default function ContactSection() {
  const [formSubmitted, setFormSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    vehicle: '',
    service: 'ppf',
    date: '',
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    setFormSubmitted(true)
  }

  return (
    <section id="book" className="relative bg-[#08090c] py-28 px-6 md:px-12 border-t border-slate-800/60 z-20">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Column Info */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-950/60 border border-blue-500/30 text-blue-400 text-xs font-mono font-bold tracking-widest uppercase mb-4">
                <Calendar className="w-3.5 h-3.5" />
                RESERVE YOUR BAY
              </div>
              <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-white leading-tight mb-6">
                BOOK A STUDIO{' '}
                <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">
                  SESSION
                </span>
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed mb-8 font-light">
                Consult with our master detailers to schedule your vehicle for PPF installation, multi-stage paint correction, or ceramic coating.
              </p>

              {/* Studio Info Items */}
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 text-blue-400">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-mono font-bold text-white uppercase tracking-wider">Studio Location</div>
                    <div className="text-xs text-slate-400 mt-0.5">100 Apex Boulevard, Performance Bay 04, CA 90210</div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 text-blue-400">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-mono font-bold text-white uppercase tracking-wider">Direct Studio Line</div>
                    <div className="text-xs text-slate-400 mt-0.5">+1 (800) 555-APEX / concierge@apexstudio.com</div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 text-blue-400">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-mono font-bold text-white uppercase tracking-wider">Operating Hours</div>
                    <div className="text-xs text-slate-400 mt-0.5">Mon &ndash; Sat: 8:00 AM &ndash; 7:00 PM (By Appointment Only)</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-12 p-4 rounded-2xl bg-slate-950 border border-slate-800/80 text-xs text-slate-400 font-mono flex items-center gap-3">
              <Sparkles className="w-4 h-4 text-blue-400 shrink-0" />
              <span>Complimentary climate-controlled transport available for exotic collections.</span>
            </div>
          </div>

          {/* Right Column Booking Form */}
          <div className="lg:col-span-7 bg-slate-950/70 border border-slate-800/80 rounded-3xl p-8 md:p-10 backdrop-blur-xl shadow-2xl relative">
            {formSubmitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-12 flex flex-col items-center text-center space-y-4"
              >
                <div className="w-16 h-16 rounded-full bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-white">RESERVATION REQUEST RECEIVED</h3>
                <p className="text-slate-400 text-xs max-w-md leading-relaxed">
                  Thank you, <span className="text-white font-semibold">{formData.name || 'Valued Client'}</span>. Our studio manager will contact you shortly to verify vehicle specifications and confirm your session.
                </p>
                <button
                  onClick={() => setFormSubmitted(false)}
                  className="mt-4 px-6 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono font-bold text-slate-300 hover:text-white uppercase tracking-wider transition-colors"
                >
                  Book Another Session
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <h3 className="text-xl font-bold text-white uppercase tracking-tight mb-2">
                  Session Reservation Form
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Marcus Vance"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. marcus@apex.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+1 (555) 000-0000"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                      Vehicle Model & Year
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 2024 Mustang Shelby GT500"
                      value={formData.vehicle}
                      onChange={(e) => setFormData({ ...formData, vehicle: e.target.value })}
                      className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                      Service Package
                    </label>
                    <select
                      value={formData.service}
                      onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                      className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 transition-colors"
                    >
                      <option value="ppf">Paint Protection Film (PPF)</option>
                      <option value="ceramic">Ceramic Coating 9H</option>
                      <option value="correction">Paint Correction Polishing</option>
                      <option value="interior">Interior Bespoke Restoration</option>
                      <option value="full">Full Bespoke Commission</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                      Preferred Date
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full mt-4 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-mono font-bold text-xs uppercase tracking-widest shadow-xl shadow-blue-600/30 border border-blue-400/40 transition-all duration-200"
                >
                  CONFIRM STUDIO RESERVATION
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
