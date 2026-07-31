import React, { useRef, useEffect, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Html } from '@react-three/drei'
import * as THREE from 'three'
import CarModel from './CarModel'
import CameraController from './CameraController'
import StudioEnvironment from './StudioEnvironment'
import { CAMERA_PRESETS, FEATURE_FOCUS_CONFIG } from '../constants/configuratorOptions'

// Helper function to calculate scroll-driven car rotation Y angle AND deterministic cinematic camera pose
function getScrollDrivenTransform(p) {
  const preset34 = CAMERA_PRESETS.find((preset) => preset.id === 'hero-34') || CAMERA_PRESETS[0]
  const presetSide = CAMERA_PRESETS.find((preset) => preset.id === 'side') || CAMERA_PRESETS[1]
  const presetWheels = CAMERA_PRESETS.find((preset) => preset.id === 'wheels') || CAMERA_PRESETS[2]
  const presetFront = CAMERA_PRESETS.find((preset) => preset.id === 'front') || CAMERA_PRESETS[3]

  const CAMERA_STATES = {
    hero34:   { rotY: preset34.targetYRotation, pos: preset34.position, target: preset34.target, name: '3/4 STUDIO' },
    side:     { rotY: presetSide.targetYRotation, pos: presetSide.position, target: presetSide.target, name: 'SIDE PROFILE' },
    wheels:   { rotY: presetWheels.targetYRotation, pos: presetWheels.position, target: presetWheels.target, name: 'RIMS & BRAKES' },
    pullback: { rotY: 1.10, pos: [1.8, 1.4, 4.5], target: [0.15, 0.58, 0.1], name: 'TRANSITION' },
    front:    { rotY: presetFront.targetYRotation, pos: presetFront.position, target: presetFront.target, name: 'FRONT GRILLE' },
  }

  // Immediate continuous keyframes sequence (No dead zone: 0.00 -> 0.22 -> 0.48 -> 0.58 -> 0.70 -> 0.88 -> 1.00)
  const keyframes = [
    { p: 0.00, ...CAMERA_STATES.hero34 },
    { p: 0.22, ...CAMERA_STATES.side },
    { p: 0.48, ...CAMERA_STATES.wheels },
    { p: 0.58, ...CAMERA_STATES.pullback },
    { p: 0.70, ...CAMERA_STATES.front },
    { p: 0.88, ...CAMERA_STATES.hero34 },
    { p: 1.00, ...CAMERA_STATES.hero34 },
  ]


  const clampedP = Math.max(0, Math.min(1, p))

  let i = 0
  while (i < keyframes.length - 1 && keyframes[i + 1].p < clampedP) {
    i++
  }

  if (i >= keyframes.length - 1) {
    const last = keyframes[keyframes.length - 1]
    return { rotY: last.rotY, pos: [...last.pos], target: [...last.target], stageName: last.name }
  }

  const k1 = keyframes[i]
  const k2 = keyframes[i + 1]

  const range = k2.p - k1.p
  const t = range > 0 ? (clampedP - k1.p) / range : 0

  // Hermite smoothstep for natural movement
  const smoothT = t * t * (3 - 2 * t)

  // Shortest angular path calculation for turntable rotation Y
  let diff = (k2.rotY - k1.rotY) % (Math.PI * 2)
  if (diff > Math.PI) diff -= Math.PI * 2
  if (diff < -Math.PI) diff += Math.PI * 2

  const rotY = k1.rotY + diff * smoothT

  // Camera position smooth interpolation
  const pos = [
    k1.pos[0] + (k2.pos[0] - k1.pos[0]) * smoothT,
    k1.pos[1] + (k2.pos[1] - k1.pos[1]) * smoothT,
    k1.pos[2] + (k2.pos[2] - k1.pos[2]) * smoothT,
  ]

  // Camera lookAt target smooth interpolation
  const target = [
    k1.target[0] + (k2.target[0] - k1.target[0]) * smoothT,
    k1.target[1] + (k2.target[1] - k1.target[1]) * smoothT,
    k1.target[2] + (k2.target[2] - k1.target[2]) * smoothT,
  ]

  return { rotY, pos, target, stageName: k1.name }
}

// Single Central Rotation Controller Component
function CentralRotationController({
  config,
  rotationYRef,
  velocityRef,
  stateRef,
  targetYRef,
  holdTimerRef,
  scrollYProgress,
  controlsRef,
  onDebugUpdate,
}) {
  const pivotGroupRef = useRef()
  const lastScrollPRef = useRef(0)
  const dampedScrollPRef = useRef(0)
  const targetCamPosRef = useRef(new THREE.Vector3())
  const targetCamLookRef = useRef(new THREE.Vector3())


  useFrame((state, delta) => {
    if (!pivotGroupRef.current) return

    const safeDelta = Math.min(delta, 0.1)

    // Sample raw scroll progress (0 to 1)
    const rawP = scrollYProgress ? scrollYProgress.get() : 0
    const scrollDelta = Math.abs(rawP - lastScrollPRef.current)

    // Detect user scrolling: if user scrolls and is not manually dragging, enter SCROLLING state
    if (scrollDelta > 0.0001 && stateRef.current !== 'DRAGGING') {
      stateRef.current = 'SCROLLING'
    }
    lastScrollPRef.current = rawP

    // Smooth continuous damping on scroll progress value for physics-like acceleration & deceleration
    const dampingSpeed = stateRef.current === 'SCROLLING' ? 8.0 : 5.0
    dampedScrollPRef.current += (rawP - dampedScrollPRef.current) * Math.min(safeDelta * dampingSpeed, 1.0)
    
    if (Math.abs(rawP - dampedScrollPRef.current) < 0.0001) {
      dampedScrollPRef.current = rawP
    }

    const { rotY, pos, target, stageName } = getScrollDrivenTransform(dampedScrollPRef.current)

    // Update debug info
    if (onDebugUpdate) {
      onDebugUpdate(dampedScrollPRef.current, stateRef.current, stageName)
    }


    // 1. SCROLLING MODE: Damped scroll progress drives car turntable rotation & camera close-ups
    if (stateRef.current === 'SCROLLING') {
      // Smoothly lerp turntable rotation Y towards scroll target angle
      let diff = (rotY - rotationYRef.current) % (2 * Math.PI)
      if (diff > Math.PI) diff -= 2 * Math.PI
      if (diff < -Math.PI) diff += 2 * Math.PI

      if (Math.abs(diff) < 0.0005) {
        rotationYRef.current = rotY
      } else {
        rotationYRef.current += diff * Math.min(safeDelta * 10, 1.0)
      }

      // Smoothly lerp camera position & OrbitControls lookAt target with deterministic convergence
      if (controlsRef.current && state.camera) {
        targetCamPosRef.current.set(...pos)
        targetCamLookRef.current.set(...target)

        if (state.camera.position.distanceTo(targetCamPosRef.current) < 0.002) {
          state.camera.position.copy(targetCamPosRef.current)
        } else {
          state.camera.position.lerp(targetCamPosRef.current, Math.min(safeDelta * 10, 1.0))
        }

        if (controlsRef.current.target.distanceTo(targetCamLookRef.current) < 0.002) {
          controlsRef.current.target.copy(targetCamLookRef.current)
        } else {
          controlsRef.current.target.lerp(targetCamLookRef.current, Math.min(safeDelta * 10, 1.0))
        }

        controlsRef.current.update()
      }
    }

    // 2. DRAGGING MODE: Directly apply manual drag velocity
    else if (stateRef.current === 'DRAGGING') {
      rotationYRef.current += velocityRef.current
    }

    // 3. MOMENTUM MODE: Decelerate velocity with exponential friction
    else if (stateRef.current === 'MOMENTUM') {
      rotationYRef.current += velocityRef.current
      const friction = 5.5
      velocityRef.current *= Math.exp(-friction * safeDelta)

      // When momentum settles near zero, return to SCROLLING state
      if (Math.abs(velocityRef.current) < 0.0002) {
        velocityRef.current = 0
        stateRef.current = 'SCROLLING'
      }
    }

    // Apply Y-axis turntable rotation to the CAR PIVOT ONLY (Studio remains 100% stationary)
    pivotGroupRef.current.rotation.y = rotationYRef.current
  })

  return (
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

export default function CarViewer({ config, cameraPresetId, onUserInteract, scrollYProgress }) {
  const controlsRef = useRef()
  const rotationYRef = useRef(FEATURE_FOCUS_CONFIG.hero34)
  const velocityRef = useRef(0)
  const previousPointerXRef = useRef(0)
  const targetYRef = useRef(0)
  const holdTimerRef = useRef(null)

  // Debug state tracking for dev verification
  const [debugInfo, setDebugInfo] = useState({ progress: 0, state: 'SCROLLING', stage: '3/4' })

  // Central Rotation Controller State Machine: 'SCROLLING' | 'DRAGGING' | 'MOMENTUM' | 'FOCUSING' | 'FOCUSED'
  const stateRef = useRef('SCROLLING')

  // Drag Interaction Handlers (User Interruption overrides Feature Focus & Scroll immediately)
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

    const sensitivity = 0.005
    const instVelocity = deltaX * sensitivity
    velocityRef.current = velocityRef.current * 0.35 + instVelocity * 0.65
  }

  const handlePointerUp = () => {
    if (stateRef.current !== 'DRAGGING') return
    stateRef.current = 'MOMENTUM'
  }

  const handleDebugUpdate = (progress, stateName, stageName) => {
    // Throttled debug UI update
    if (Math.abs(progress - debugInfo.progress) > 0.02 || stateName !== debugInfo.state) {
      setDebugInfo({ progress, state: stateName, stage: stageName })
    }
  }

  useEffect(() => {
    return () => {
      if (holdTimerRef.current) clearTimeout(holdTimerRef.current)
    }
  }, [])

  return (
    <div
      className="w-full h-full bg-[#08090c] overflow-hidden select-none cursor-grab active:cursor-grabbing relative"
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
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.1 }}
      >
        <color attach="background" args={['#08090c']} />

        {/* 1. SPACIOUS DETAILING STUDIO ENVIRONMENT (Stationary) — sole environment/reflection source */}
        <StudioEnvironment />

        {/* 2. CAMERA CONTROLLER FOR VIEW PRESETS */}
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
            scrollYProgress={scrollYProgress}
            controlsRef={controlsRef}
            onDebugUpdate={handleDebugUpdate}
          />
        </React.Suspense>



        {/* 5. ORBIT CONTROLS FOR MOUSE/TOUCH PANNING (Wheel Zoom Disabled to Allow Natural Page Scroll) */}
        <OrbitControls
          ref={controlsRef}
          enableRotate={false} // Horizontal drag directly drives central rotation controller
          enablePan={false}
          enableZoom={false} // CRITICAL FIX: Disable wheel zoom so mouse wheel triggers page scrolling!
          minPolarAngle={Math.PI / 4} // 45 deg elevation
          maxPolarAngle={Math.PI / 2 - 0.02} // Prevents camera going below floor
          target={[0, 0.7, 0]}
          makeDefault
        />
      </Canvas>

      {/* Temporary Debug Indicator UI (Requirement 14) */}
      <div className="absolute bottom-4 left-4 z-40 bg-slate-950/80 border border-slate-800 backdrop-blur-md px-3 py-1.5 rounded-lg text-[10px] font-mono text-slate-300 pointer-events-none flex items-center gap-3">
        <span>Scroll: <strong className="text-blue-400">{debugInfo.progress.toFixed(2)}</strong></span>
        <span>State: <strong className="text-indigo-400">{debugInfo.state}</strong></span>
        <span>Stage: <strong className="text-cyan-400">{debugInfo.stage}</strong></span>
      </div>
    </div>
  )
}


