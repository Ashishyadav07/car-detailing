import React, { useRef, useEffect, useState, useCallback } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Html } from '@react-three/drei'
import * as THREE from 'three'
import CarModel from './CarModel'
import CameraController from './CameraController'
import StudioEnvironment from './StudioEnvironment'
import { FEATURE_FOCUS_CONFIG } from '../constants/configuratorOptions'
import { CriticallyDampedSpring, clamp, clamp01, damp, smootherstep } from '../utils/animation'
import { createPose, evalPose } from '../utils/heroCameraPath'

/* -------------------------------------------------------------------------
 * MOTION TUNING
 * The whole "feel" of the hero lives in these numbers.
 * ---------------------------------------------------------------------- */

// Scroll follower. omega is the spring's natural frequency in rad/s; ~12 gives
// a roughly 0.35s settle — tight enough to feel locked to the page, soft
// enough that a flick of the wheel reads as a camera move, not a jump cut.
const SCROLL_OMEGA = 12
// A critically damped follower trails a constant-velocity target by exactly
// 2/omega seconds. Feeding that much look-ahead back in cancels the trailing
// without giving up any of the smoothing, so the camera stays synchronised
// with the scrollbar instead of chasing it.
const SCROLL_LEAD = 0.55
const SCROLL_LEAD_CLAMP = 0.09
const SCROLL_VEL_LAMBDA = 14

// Turntable drag.
const DRAG_SENSITIVITY = 0.005 // rad per pixel (unchanged)
const DRAG_OMEGA = 20 // weight behind the finger without visible lag
const DRAG_FRICTION = 3.2 // coast decay after release, 1/s
const RETURN_LAMBDA = 2.6 // pull back onto the scroll-driven angle
const RETURN_ENGAGE_VEL = 0.9 // rad/s below which the return blends in
const SETTLE_EPS = 1e-4

// Long frames (tab wake-up, GC, a heavy React commit) would otherwise be
// integrated as one huge step and show up as a lurch.
const MAX_DELTA = 1 / 20

const HERO_START_POSE = evalPose(0, createPose())
const START_CAMERA_POSITION = HERO_START_POSE.pos.toArray()
const START_CAMERA_TARGET = HERO_START_POSE.target.toArray()

/* -------------------------------------------------------------------------
 * CENTRAL ROTATION CONTROLLER
 * ---------------------------------------------------------------------- */

function CentralRotationController({
  config,
  rotationYRef,
  isDraggingRef,
  dragTargetRef,
  dragSpringRef,
  scrollYProgress,
  controlsRef,
  debugRefs,
}) {
  const pivotGroupRef = useRef()

  // Every mutable piece of frame state is preallocated once.
  const scrollSpringRef = useRef(null)
  if (scrollSpringRef.current === null) {
    scrollSpringRef.current = new CriticallyDampedSpring(
      scrollYProgress ? scrollYProgress.get() : 0
    )
  }
  const lastRawPRef = useRef(scrollYProgress ? scrollYProgress.get() : 0)
  const scrollVelRef = useRef(0)
  const debugAccumRef = useRef(0)
  const poseRef = useRef(null)
  if (poseRef.current === null) poseRef.current = createPose()

  // Priority -2 so this runs *before* drei's OrbitControls update (which is
  // registered at -1). The controls then apply our pose once per frame instead
  // of the scene being updated twice.
  useFrame((state, delta) => {
    const pivot = pivotGroupRef.current
    if (!pivot) return

    const dt = delta > MAX_DELTA ? MAX_DELTA : delta
    if (dt <= 0) return

    /* --- 1. Scroll progress -> one smoothing stage, zero net lag --------- */

    const rawP = scrollYProgress ? scrollYProgress.get() : 0

    const instVel = (rawP - lastRawPRef.current) / dt
    lastRawPRef.current = rawP
    scrollVelRef.current = damp(scrollVelRef.current, instVel, SCROLL_VEL_LAMBDA, dt)

    const lead = clamp(
      scrollVelRef.current * ((SCROLL_LEAD * 2) / SCROLL_OMEGA),
      -SCROLL_LEAD_CLAMP,
      SCROLL_LEAD_CLAMP
    )
    const p = scrollSpringRef.current.step(rawP + lead, SCROLL_OMEGA, dt)

    /* --- 2. Pose is read straight from the smoothed progress ------------- */
    // No second filter: the source is already C1-smooth, so there is nothing
    // left to damp and therefore no trailing error to snap away later.

    const pose = evalPose(p, poseRef.current)

    /* --- 3. Turntable = scroll angle + drag offset ----------------------- */

    const drag = dragSpringRef.current
    if (isDraggingRef.current) {
      // The offset springs toward the raw pointer target: the car has weight
      // behind the finger and single-pixel pointer jitter is filtered out.
      drag.step(dragTargetRef.current, DRAG_OMEGA, dt)
    } else {
      // Release keeps the spring's own velocity, so there is no discontinuity
      // at the moment the pointer lifts. Momentum coasts under friction and
      // the pull back onto the scroll angle fades in as that momentum dies,
      // which removes the hard state switch the old machine had.
      drag.velocity *= Math.exp(-DRAG_FRICTION * dt)
      drag.value += drag.velocity * dt

      const engage = smootherstep(
        1 - clamp01(Math.abs(drag.velocity) / RETURN_ENGAGE_VEL)
      )
      if (engage > 0) {
        drag.value = damp(drag.value, 0, RETURN_LAMBDA * engage, dt)
      }

      if (Math.abs(drag.velocity) < SETTLE_EPS && Math.abs(drag.value) < SETTLE_EPS) {
        drag.velocity = 0
        drag.value = 0
      }
      dragTargetRef.current = drag.value
    }

    rotationYRef.current = pose.rotY + drag.value
    pivot.rotation.y = rotationYRef.current

    /* --- 4. Camera ------------------------------------------------------- */

    state.camera.position.copy(pose.pos)
    const controls = controlsRef.current
    if (controls) {
      controls.target.copy(pose.target)
    } else {
      state.camera.lookAt(pose.target)
    }

    /* --- 5. Debug HUD, written straight to the DOM at 10Hz --------------- */
    // Deliberately not React state: re-rendering this component every frame
    // used to hand the main thread a commit that competed with the render.

    debugAccumRef.current += dt
    if (debugAccumRef.current >= 0.1) {
      debugAccumRef.current = 0
      const stateName = isDraggingRef.current
        ? 'DRAGGING'
        : drag.velocity !== 0 || drag.value !== 0
          ? 'MOMENTUM'
          : 'SCROLLING'
      writeDebug(debugRefs.progress.current, clamp01(p).toFixed(2))
      writeDebug(debugRefs.state.current, stateName)
      writeDebug(debugRefs.stage.current, pose.stage)
    }
  }, -2)

  return (
    <group ref={pivotGroupRef} position={[0, 0, 0]}>
      <CarModel url="/models/ford_mustang_shelby_gt500.glb" config={config} />
    </group>
  )
}

function writeDebug(el, text) {
  if (el && el.textContent !== text) el.textContent = text
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

  // Drag state. Shared by reference with the frame loop so pointer events
  // never trigger a React render.
  const isDraggingRef = useRef(false)
  const dragTargetRef = useRef(0)
  const dragSpringRef = useRef(null)
  if (dragSpringRef.current === null) dragSpringRef.current = new CriticallyDampedSpring(0)
  const lastPointerXRef = useRef(0)
  const activePointerRef = useRef(null)

  const debugRefs = useRef({
    progress: React.createRef(),
    state: React.createRef(),
    stage: React.createRef(),
  }).current

  // Pause the render loop once the hero is well clear of the viewport. The
  // sticky canvas otherwise keeps drawing a full PBR scene with a 2048px
  // shadow map behind every section below it.
  const rootRef = useRef(null)
  const [inView, setInView] = useState(true)

  useEffect(() => {
    const el = rootRef.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: '25% 0px 25% 0px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const handlePointerDown = useCallback(
    (e) => {
      if (e.button !== undefined && e.button !== 0) return
      isDraggingRef.current = true
      activePointerRef.current = e.pointerId
      lastPointerXRef.current = e.clientX
      // Catch the car exactly where it is; the spring bleeds off any leftover
      // momentum instead of the rotation jumping.
      dragTargetRef.current = dragSpringRef.current.value
      try {
        e.currentTarget.setPointerCapture(e.pointerId)
      } catch {
        /* capture is best-effort */
      }
      if (onUserInteract) onUserInteract()
    },
    [onUserInteract]
  )

  const handlePointerMove = useCallback((e) => {
    if (!isDraggingRef.current) return
    if (activePointerRef.current !== null && e.pointerId !== activePointerRef.current) return
    const x = e.clientX
    dragTargetRef.current += (x - lastPointerXRef.current) * DRAG_SENSITIVITY
    lastPointerXRef.current = x
  }, [])

  // Pointer capture guarantees this fires even when the release happens
  // outside the canvas, which previously left the controller stuck in
  // DRAGGING and froze the scroll animation.
  const handlePointerUp = useCallback((e) => {
    if (!isDraggingRef.current) return
    if (activePointerRef.current !== null && e.pointerId !== activePointerRef.current) return
    isDraggingRef.current = false
    activePointerRef.current = null
  }, [])

  return (
    <div
      ref={rootRef}
      className="w-full h-full bg-[#08090c] overflow-hidden select-none cursor-grab active:cursor-grabbing relative"
      // pan-y keeps vertical page scrolling native on touch while horizontal
      // gestures reach us as pointer events without being cancelled.
      style={{ touchAction: 'pan-y' }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onLostPointerCapture={handlePointerUp}
    >
      <Canvas
        shadows
        frameloop={inView ? 'always' : 'never'}
        camera={{ position: START_CAMERA_POSITION, fov: 38 }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.1,
          powerPreference: 'high-performance',
        }}
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
            isDraggingRef={isDraggingRef}
            dragTargetRef={dragTargetRef}
            dragSpringRef={dragSpringRef}
            scrollYProgress={scrollYProgress}
            controlsRef={controlsRef}
            debugRefs={debugRefs}
          />
        </React.Suspense>

        {/* 5. ORBIT CONTROLS FOR MOUSE/TOUCH PANNING (Wheel Zoom Disabled to Allow Natural Page Scroll) */}
        <OrbitControls
          ref={controlsRef}
          enableRotate={false} // Horizontal drag directly drives central rotation controller
          enablePan={false}
          enableZoom={false} // CRITICAL FIX: Disable wheel zoom so mouse wheel triggers page scrolling!
          enableDamping={false} // All damping is handled by the controller above
          minPolarAngle={Math.PI / 4} // 45 deg elevation
          maxPolarAngle={Math.PI / 2 - 0.02} // Prevents camera going below floor
          target={START_CAMERA_TARGET}
          makeDefault
        />
      </Canvas>

      {/* Temporary Debug Indicator UI (Requirement 14) */}
      <div className="absolute bottom-4 left-4 z-40 bg-slate-950/80 border border-slate-800 backdrop-blur-md px-3 py-1.5 rounded-lg text-[10px] font-mono text-slate-300 pointer-events-none flex items-center gap-3">
        <span>Scroll: <strong className="text-blue-400" ref={debugRefs.progress}>0.00</strong></span>
        <span>State: <strong className="text-indigo-400" ref={debugRefs.state}>SCROLLING</strong></span>
        <span>Stage: <strong className="text-cyan-400" ref={debugRefs.stage}>3/4 STUDIO</strong></span>
      </div>
    </div>
  )
}
