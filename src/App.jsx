import React, { useState } from 'react'
import Navbar from './components/Navbar'
import CarViewer from './components/CarViewer'
import HeroSection from './components/HeroSection'
import ConfiguratorUI from './components/ConfiguratorUI'
import DragHint from './components/DragHint'
import BuildSummaryModal from './components/BuildSummaryModal'

function App() {
  // Reusable configuration state system keeping all options active simultaneously
  const [config, setConfig] = useState({
    paint: 'obsidian-black',
    rim: 'silver-chrome',
    tire: 'performance-matte',
    brake: 'brembo-red',
    interior: 'black-leather',
  })

  // Camera preset view state
  const [activeCameraPreset, setActiveCameraPreset] = useState('hero-34')

  // User interaction & hint visibility state
  const [hasInteracted, setHasInteracted] = useState(false)

  // Expandable "Your Build" summary modal state
  const [isSummaryOpen, setIsSummaryOpen] = useState(false)

  const handleChangeConfig = (key, value) => {
    setConfig((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const handleUserInteract = () => {
    if (!hasInteracted) {
      setHasInteracted(true)
    }
  }

  return (
    <div className="relative w-screen h-screen bg-[#090a0d] overflow-hidden select-none font-sans text-white">
      {/* Boxed Floating Navbar */}
      <Navbar onOpenSummary={() => setIsSummaryOpen(true)} />

      {/* Subtle Drag-to-Explore Interaction Hint */}
      <DragHint visible={!hasInteracted} />

      {/* 3D Cinematic Car Viewer Canvas */}
      <CarViewer
        config={config}
        cameraPresetId={activeCameraPreset}
        onUserInteract={handleUserInteract}
      />

      {/* Minimal Hero Branding */}
      <HeroSection />

      {/* Floating Customization Control Dock */}
      <ConfiguratorUI
        config={config}
        onChangeConfig={handleChangeConfig}
        activeCameraPreset={activeCameraPreset}
        onSelectCameraPreset={setActiveCameraPreset}
      />

      {/* Expandable "Your Build" Summary Modal */}
      <BuildSummaryModal
        isOpen={isSummaryOpen}
        onClose={() => setIsSummaryOpen(false)}
        config={config}
      />
    </div>
  )
}

export default App
