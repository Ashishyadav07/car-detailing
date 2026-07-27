import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  PAINT_OPTIONS,
  RIM_OPTIONS,
  TIRE_OPTIONS,
  BRAKE_OPTIONS,
  INTERIOR_OPTIONS,
  CAMERA_PRESETS,
} from '../constants/configuratorOptions'
import { Palette, Disc, CircleDot, ShieldAlert, Armchair, Camera, Check } from 'lucide-react'

const TABS = [
  { id: 'paint', label: 'PAINT', icon: Palette },
  { id: 'rim', label: 'RIMS', icon: Disc },
  { id: 'tire', label: 'TIRES', icon: CircleDot },
  { id: 'brake', label: 'BRAKES', icon: ShieldAlert },
  { id: 'interior', label: 'INTERIOR', icon: Armchair },
]

export default function ConfiguratorUI({
  config,
  onChangeConfig,
  activeCameraPreset,
  onSelectCameraPreset,
}) {
  const [activeTab, setActiveTab] = useState('paint')
  const [hoveredOption, setHoveredOption] = useState(null)

  const getTabOptions = () => {
    switch (activeTab) {
      case 'paint':
        return { options: PAINT_OPTIONS, configKey: 'paint', isPaint: true }
      case 'rim':
        return { options: RIM_OPTIONS, configKey: 'rim', isRim: true }
      case 'tire':
        return { options: TIRE_OPTIONS, configKey: 'tire', isTire: true }
      case 'brake':
        return { options: BRAKE_OPTIONS, configKey: 'brake', isBrake: true }
      case 'interior':
        return { options: INTERIOR_OPTIONS, configKey: 'interior', isInterior: true }
      default:
        return { options: PAINT_OPTIONS, configKey: 'paint', isPaint: true }
    }
  }

  const { options, configKey, isPaint, isRim } = getTabOptions()
  const selectedOptionId = config[configKey]
  const currentOption = options.find((o) => o.id === selectedOptionId) || options[0]

  const activeLabel = hoveredOption ? hoveredOption.name : currentOption.name

  return (
    <motion.div
      initial={{ y: 40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-3xl"
    >
      <div className="backdrop-blur-2xl bg-slate-950/70 border-[0.5px] border-slate-800/50 rounded-2xl p-4 shadow-2xl shadow-black/80 flex flex-col items-center">
        
        {/* Category Navigation Tabs */}
        <div className="flex items-center justify-center gap-1 overflow-x-auto pb-1 scrollbar-none w-full">
          {TABS.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-3.5 py-1.5 rounded-xl text-[11px] font-bold uppercase tracking-widest flex items-center gap-1.5 transition-all duration-300 ${
                  isActive
                    ? 'text-white'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTabBadge"
                    className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 rounded-xl shadow-md shadow-blue-500/20"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  {tab.label}
                </span>
              </button>
            )
          })}

          {/* Camera Preset Selector Divider & Buttons */}
          <div className="h-4 w-[1px] bg-slate-800/80 mx-1 hidden sm:block"></div>
          <div className="hidden sm:flex items-center gap-1">
            {CAMERA_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => onSelectCameraPreset(preset.id)}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold tracking-wider transition-all ${
                  activeCameraPreset === preset.id
                    ? 'bg-slate-800 text-blue-400 border-[0.5px] border-blue-500/40'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Single Expanded Category Area */}
        <div className="mt-3 pt-2.5 border-t-[0.5px] border-slate-800/40 w-full flex flex-col items-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="flex items-center justify-center flex-wrap gap-3.5 min-h-[42px]"
            >
              {options.map((opt, idx) => {
                const isSelected = selectedOptionId === opt.id

                // Paint Swatches: Elegant Circular Swatches (● ● ● ● ●)
                if (isPaint) {
                  return (
                    <motion.button
                      key={opt.id}
                      onClick={() => onChangeConfig(configKey, opt.id)}
                      onMouseEnter={() => setHoveredOption(opt)}
                      onMouseLeave={() => setHoveredOption(null)}
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.95 }}
                      className="relative group p-1 focus:outline-none"
                    >
                      {/* Animated Active Outer Ring */}
                      {isSelected && (
                        <motion.div
                          layoutId="activeSwatchRing"
                          className="absolute inset-0 rounded-full border-2 border-blue-500 shadow-lg shadow-blue-500/40"
                          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                        />
                      )}

                      {/* Swatch Circle */}
                      <div
                        className={`w-7 h-7 rounded-full border-[0.5px] border-white/20 shadow-md flex items-center justify-center transition-all duration-200 ${
                          isSelected ? 'scale-90' : 'opacity-85 group-hover:opacity-100'
                        }`}
                        style={{ backgroundColor: opt.color }}
                      >
                        {isSelected && (
                          <Check
                            className={`w-3 h-3 ${
                              opt.color === '#f1f5f9' ? 'text-slate-950 font-bold' : 'text-white'
                            }`}
                          />
                        )}
                      </div>
                    </motion.button>
                  )
                }

                // Rim Previews: Circular Metallic Thumbnails (Rim 1, Rim 2, Rim 3)
                if (isRim) {
                  return (
                    <motion.button
                      key={opt.id}
                      onClick={() => onChangeConfig(configKey, opt.id)}
                      onMouseEnter={() => setHoveredOption(opt)}
                      onMouseLeave={() => setHoveredOption(null)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`relative flex items-center gap-2 px-3 py-1.5 rounded-xl border-[0.5px] transition-all duration-200 ${
                        isSelected
                          ? 'bg-slate-900 border-blue-500/80 shadow-md shadow-blue-500/20'
                          : 'bg-slate-900/40 border-slate-800/60 hover:border-slate-700 hover:bg-slate-900/80'
                      }`}
                    >
                      <span
                        className="w-5 h-5 rounded-full border-[0.5px] border-white/30 shadow-inner flex items-center justify-center shrink-0"
                        style={{
                          background: `radial-gradient(circle at 35% 35%, ${opt.color}, #090a0f)`,
                        }}
                      >
                        <Disc className="w-3 h-3 text-white/80" />
                      </span>
                      <span
                        className={`text-xs font-bold uppercase tracking-wider ${
                          isSelected ? 'text-white' : 'text-slate-300'
                        }`}
                      >
                        {`Rim ${idx + 1}`}
                      </span>
                    </motion.button>
                  )
                }

                // Standard Color / Option Swatches for Tires, Brakes, Interior
                return (
                  <motion.button
                    key={opt.id}
                    onClick={() => onChangeConfig(configKey, opt.id)}
                    onMouseEnter={() => setHoveredOption(opt)}
                    onMouseLeave={() => setHoveredOption(null)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`relative flex items-center gap-2 px-3 py-1.5 rounded-xl border-[0.5px] transition-all duration-200 ${
                      isSelected
                        ? 'bg-slate-900 border-blue-500/80 shadow-md shadow-blue-500/20'
                        : 'bg-slate-900/40 border-slate-800/60 hover:border-slate-700 hover:bg-slate-900/80'
                    }`}
                  >
                    <span
                      className="w-4 h-4 rounded-full border-[0.5px] border-white/20 shadow-inner flex items-center justify-center shrink-0"
                      style={{ backgroundColor: opt.color }}
                    >
                      {isSelected && <Check className="w-2.5 h-2.5 text-white" />}
                    </span>
                    <span
                      className={`text-xs font-semibold tracking-wide ${
                        isSelected ? 'text-white font-bold' : 'text-slate-300'
                      }`}
                    >
                      {opt.name}
                    </span>
                  </motion.button>
                )
              })}
            </motion.div>
          </AnimatePresence>

          {/* Subtle Label Display Below */}
          <div className="mt-1 font-mono text-[10px] uppercase tracking-widest text-slate-400 font-semibold h-4 flex items-center justify-center">
            {activeLabel}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
