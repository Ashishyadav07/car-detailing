import React, { useRef, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Environment, Html } from '@react-three/drei'
import * as THREE from 'three'
import CarModel from './CarModel'
import CameraController from './CameraController'
import StudioEnvironment from './StudioEnvironment'
import { CAMERA_PRESETS } from '../constants/configuratorOptions'

// Single Central Rotation Controller Component
function CentralRotationController({ config, rotationYRef, velocityRef, stateRef, targetYRef, holdTimerRef }) {
  const pivotGroupRef = useRef()

  useFrame((_, delta) => {
    if (!pivotGroupRef.current) return

    // Cap delta to avoid frame jumps on tab switch
    const safeDelta = Math.min(delta, 0.1)

    // 1. DRAGGING MODE: Directly apply drag velocity
    if (stateRef.current === 'DRAGGING') {
      rotationYRef.current += velocityRef.current
    }
    
    // 2. MOMENTUM MODE: Decelerate velocity with exponential friction
    else if (stateRef.current === 'MOMENTUM') {
      rotationYRef.current += velocityRef.current
      const friction = 5.5
      velocityRef.current *= Math.exp(-friction * safeDelta)

      // When momentum settles near zero, transition to FOCUSED/IDLE
      if (Math.abs(velocityRef.current) < 0.0002) {
        velocityRef.current = 0
        stateRef.current = 'IDLE'
      }
    }

    // 3. FOCUSING MODE: Smoothly animate car turntable rotation to target feature angle
    else if (stateRef.current === 'FOCUSING') {
      const currentAngle = rotationYRef.current
      const targetAngle = targetYRef.current

      // Calculate shortest angular path (-Math.PI to +Math.PI)
      let diff = (targetAngle - currentAngle) % (2 * Math.PI)
      if (diff > Math.PI) diff -= 2 * Math.PI
      if (diff < -Math.PI) diff += 2 * Math.PI

      // Smooth lerp transition towards target angle
      if (Math.abs(diff) > 0.003) {
        rotationYRef.current += diff * Math.min(safeDelta * 6, 1.0)
      } else {
        // Target reached: lock position and set state to FOCUSED
        rotationYRef.current = targetAngle
        stateRef.current = 'FOCUSED'

        // Hold car completely stationary for feature inspection, then smoothly resume IDLE
        if (holdTimerRef.current) clearTimeout(holdTimerRef.current)
        holdTimerRef.current = setTimeout(() => {
          if (stateRef.current === 'FOCUSED') {
            stateRef.current = 'IDLE'
          }
        }, 3000)
      }
    }

    // 4. FOCUSED MODE: Hold car 100% stationary for feature inspection
    else if (stateRef.current === 'FOCUSED') {
      // Car remains completely stationary
    }

    // 5. IDLE MODE: Slow continuous turntable spin (0.12 rad/s)
    else if (stateRef.current === 'IDLE') {
      rotationYRef.current += safeDelta * 0.12
    }

    // Apply Y-axis turntable rotation to the CAR PIVOT ONLY
    pivotGroupRef.current.rotation.y = rotationYRef.current
  })

  return (
    // PRESERVED MODEL TRANSFORM AT ORIGIN (rotation=[0,0,0])
    <group ref={pivotGroupRef} position={[0, 0, 0]}>
      <CarModel url="/models/ford_mustang_shelby_gt500.glb" config={config} />
    </group>
  )
}

function Loader() {
  return (
    <Html center>
      <div className="flex items-center gap-3 bg-slate-900/90 text-white px-6 py-3.5 rounded-full shadow-2xl border border-slate-700/60 backdrop-blur-md whitespace-nowrap">
        <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="font-semibold text-sm tracking-wide">Loading Mustang Shelby GT500...</span>
      </div>
    </Html>
  )
}

export default function CarViewer({ config, cameraPresetId, onUserInteract }) {
  const controlsRef = useRef()
  const rotationYRef = useRef(0)
  const velocityRef = useRef(0)
  const previousPointerXRef = useRef(0)
  const targetYRef = useRef(0)
  const holdTimerRef = useRef(null)

  // Single Rotation Controller State Machine: 'IDLE' | 'DRAGGING' | 'MOMENTUM' | 'FOCUSING' | 'FOCUSED'
  const stateRef = useRef('IDLE')

  // Listen for Feature Focus Preset Button Clicks (Side, Rims, Brakes, Front, 3/4)
  useEffect(() => {
    const preset = CAMERA_PRESETS.find((p) => p.id === cameraPresetId)
    if (preset && preset.targetYRotation !== undefined) {
      // Immediately cancel idle, momentum, and drag velocity
      velocityRef.current = 0
      targetYRef.current = preset.targetYRotation
      stateRef.current = 'FOCUSING'

      if (holdTimerRef.current) clearTimeout(holdTimerRef.current)
    }
  }, [cameraPresetId])

  // Drag Interaction Handlers (User Interruption overrides Feature Focus immediately)
  const handlePointerDown = (e) => {
    stateRef.current = 'DRAGGING'
    previousPointerXRef.current = e.clientX || (e.touches && e.touches[0].clientX) || 0
    velocityRef.current = 0

    if (onUserInteract) onUserInteract()
    if (holdTimerRef.current) clearTimeout(holdTimerRef.current)
  }

  const handlePointerMove = (e) => {
    if (stateRef.current !== 'DRAGGING') return
    const currentX = e.clientX || (e.touches && e.touches[0].clientX) || 0
    const deltaX = currentX - previousPointerXRef.current
    previousPointerXRef.current = currentX

    // Convert drag displacement into instant rotational velocity
    const sensitivity = 0.005
    const instVelocity = deltaX * sensitivity
    velocityRef.current = velocityRef.current * 0.35 + instVelocity * 0.65
  }

  const handlePointerUp = () => {
    if (stateRef.current !== 'DRAGGING') return
    stateRef.current = 'MOMENTUM'
  }

  useEffect(() => {
    return () => {
      if (holdTimerRef.current) clearTimeout(holdTimerRef.current)
    }
  }, [])

  return (
    <div
      className="absolute inset-0 w-full h-full bg-[#08090c] overflow-hidden select-none cursor-grab active:cursor-grabbing"
      onMouseDown={handlePointerDown}
      onMouseMove={handlePointerMove}
      onMouseUp={handlePointerUp}
      onTouchStart={handlePointerDown}
      onTouchMove={handlePointerMove}
      onTouchEnd={handlePointerUp}
    >
      <Canvas
        shadows
        camera={{ position: [4.8, 1.8, 4.8], fov: 38 }}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.35 }}
      >
        <color attach="background" args={['#08090c']} />

        {/* 1. SPACIOUS DETAILING STUDIO ENVIRONMENT (Stationary) */}
        <StudioEnvironment />

        {/* 2. STUDIO HDRI ENVIRONMENT REFLECTIONS */}
        <Environment preset="city" environmentIntensity={1.6} />

        {/* 3. CAMERA CONTROLLER FOR VIEW PRESETS */}
        <CameraController cameraPresetId={cameraPresetId} controlsRef={controlsRef} />

        {/* 4. CENTRAL ROTATION CONTROLLER (Single State Machine driving Turntable Y-Rotation) */}
        <React.Suspense fallback={<Loader />}>
          <CentralRotationController
            config={config}
            rotationYRef={rotationYRef}
            velocityRef={velocityRef}
            stateRef={stateRef}
            targetYRef={targetYRef}
            holdTimerRef={holdTimerRef}
          />
        </React.Suspense>

        {/* 5. ORBIT CONTROLS FOR ZOOM & TILT */}
        <OrbitControls
          ref={controlsRef}
          enableRotate={false} // Horizontal drag directly drives single central rotation controller
          enablePan={false}
          enableZoom={true}
          minDistance={2.5} // Prevents clipping into car body
          maxDistance={11.0} // Generous zoom out inside spacious studio bay
          minPolarAngle={Math.PI / 4} // 45 deg elevation
          maxPolarAngle={Math.PI / 2 - 0.02} // Prevents camera going below floor
          target={[0, 0.7, 0]}
          makeDefault
        />
      </Canvas>
    </div>
  )
}
