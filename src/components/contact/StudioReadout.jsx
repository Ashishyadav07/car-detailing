import React from 'react'
import { MapPin, Phone, Clock } from 'lucide-react'

const ITEMS = [
  { Icon: MapPin, text: '100 Apex Boulevard, Bay 04' },
  { Icon: Phone, text: '+1 (800) 555-APEX' },
  { Icon: Clock, text: 'Mon–Sat, by appointment' },
]

// Docked HUD readout, not a stacked icon list — echoes the Hero's top-right
// spec panel so the console feels like part of the same instrument cluster.
export default function StudioReadout() {
  return (
    <div className="flex flex-wrap gap-x-6 gap-y-2 font-mono text-[10px] text-slate-400 tracking-wide">
      {ITEMS.map(({ Icon, text }) => (
        <div key={text} className="flex items-center gap-1.5">
          <Icon className="w-3 h-3 text-blue-400 shrink-0" />
          <span>{text}</span>
        </div>
      ))}
    </div>
  )
}
