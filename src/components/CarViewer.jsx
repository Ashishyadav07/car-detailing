import React, { useRef, useEffect, useState, useCallback } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Html } from '@react-three/drei'
import * as THREE from 'three'
import CarModel from './CarModel'
import CameraController from './CameraController'
import StudioEnvironment from './StudioEnvironment'
import { FEATURE_FOCUS_CONFIG } from '../constants/configuratorOptions'
import { CriticallyDampedSpring, clamp, clamp01, damp } from '../utils/animation'
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

// Cinematic cursor camera orbit. The car itself is never rotated by the
// cursor — only the camera orbits around the scroll system's own look-at
// target. Azimuth/elevation targets are the cursor's *absolute* normalized
// position within the hero (not accumulated deltas), so wherever the cursor
// sits is exactly the viewpoint the camera settles at; losing the pointer
// (leave/up/cancel) never resets these targets, so the camera holds its
// current orbit until the cursor moves again.
const MAX_CAMERA_AZIMUTH = (30 * Math.PI) / 180 // +/-30 deg orbit around the car
const MAX_CAMERA_ELEVATION = (20 * Math.PI) / 180 // +/-20 deg camera rise/lower
const CAMERA_CURSOR_OMEGA = 7 // soft, cinematic settle — slower than a UI snap
const CURSOR_DEADZONE = 0.05 // fraction of half-width/height near center that's ignored

// Manual click+drag TURNTABLE. Unlike hover, drag never touches the camera
// at all — the camera is frozen the instant the button goes down, and
// horizontal drag instead spins the car itself around its own vertical
// center axis. targetCarYaw is a running total of pointer-move DELTAS
// (never absolute cursor position, never reset), so the car can spin
// through any number of full turns and always keeps going from wherever it
// currently is. The spring smooths the approach so the car reads as heavy
// rather than snapping straight to the pointer.
const CAR_YAW_SENSITIVITY = 0.004 // rad per pixel — precise, not twitchy
const CAR_YAW_OMEGA = 12 // a little inertia without feeling laggy

// Elevation-angle backstop (angle from horizontal) — purely a degenerate-
// case guard against the offset flipping past straight-up/straight-down. The
// cinematic range itself comes from MAX_CAMERA_ELEVATION above.
const MIN_CAMERA_PHI = (-80 * Math.PI) / 180
const MAX_CAMERA_PHI = (85 * Math.PI) / 180

// World-space floor clearance the orbiting camera must respect. Computed as
// an elevation-angle floor every frame (asin, no allocation) from the
// CURRENT scroll pose's own target height and camera radius, so it stays
// correct across every preset instead of assuming one fixed geometry.
const CAMERA_FLOOR_Y = 0.08

// Long frames (tab wake-up, GC, a heavy React commit) would otherwise be
// integrated as one huge step and show up as a lurch.
const MAX_DELTA = 1 / 20

// Rescales a normalized [-1, 1] axis so the innermost `dz` fraction reads as
// exactly zero, and the remainder is rescaled back out to [-1, 1] — tiny
// cursor jitter near the center produces no camera movement at all.
function applyDeadzone(v, dz) {
  if (v > dz) return (v - dz) / (1 - dz)
  if (v < -dz) return (v + dz) / (1 - dz)
  return 0
}

const HERO_START_POSE = evalPose(0, createPose())
const START_CAMERA_POSITION = HERO_START_POSE.pos.toArray()
const START_CAMERA_TARGET = HERO_START_POSE.target.toArray()

/* -------------------------------------------------------------------------
 * CENTRAL ROTATION CONTROLLER
 * ---------------------------------------------------------------------- */

function CentralRotationController({
  config,
  rotationYRef,
  targetCameraAzimuthRef,
  targetCameraElevationRef,
  cameraAzimuthSpringRef,
  cameraElevationSpringRef,
  targetCarYawRef,
  carYawSpringRef,
  isDraggingRef,
  scrollYProgress,
  controlsRef,
  debugRefs,
}) {
  // yawGroup is the car's ONE transform: rotation.y = scrollYaw + dragYaw.
  // Nothing else ever touches the car (no position offset, no pitch/roll) —
  // it rotates around its own vertical center axis exactly like the scroll
  // turntable always did, drag just adds a persistent offset on top.
  const yawGroupRef = useRef()

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
  // Reused every frame for the cursor camera orbit — never reallocated.
  const orbitOffsetRef = useRef(null)
  if (orbitOffsetRef.current === null) orbitOffsetRef.current = new THREE.Vector3()
  // Camera pose frozen at the instant a drag starts — reused every frame
  // while dragging so the camera is bit-for-bit static, tripod-mounted.
  const frozenCameraPosRef = useRef(null)
  if (frozenCameraPosRef.current === null) frozenCameraPosRef.current = new THREE.Vector3()
  const frozenCameraTargetRef = useRef(null)
  if (frozenCameraTargetRef.current === null) frozenCameraTargetRef.current = new THREE.Vector3()
  const wasDraggingRef = useRef(false)

  // Priority -2 so this runs *before* drei's OrbitControls update (which is
  // registered at -1). The controls then apply our pose once per frame instead
  // of the scene being updated twice.
  useFrame((state, delta) => {
    const yawGroup = yawGroupRef.current
    if (!yawGroup) return

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

    /* --- 3. Turntable = scroll angle + persistent drag yaw ----------------
     * finalYaw = scrollYaw + userDragYaw. Scroll keeps driving its own
     * turntable exactly as before; drag adds an independent, persistent
     * offset that scroll never resets and drag never fights. */

    const carYawSpring = carYawSpringRef.current
    carYawSpring.step(targetCarYawRef.current, CAR_YAW_OMEGA, dt)

    rotationYRef.current = pose.rotY + carYawSpring.value
    yawGroup.rotation.y = rotationYRef.current

    /* --- 4. Camera ---------------------------------------------------------
     * MODE 1 (hover, no button held): unchanged cinematic behavior — cursor
     * position drives an azimuth/elevation OFFSET on top of the scroll
     * camera pose via a critically-damped spring that never resets.
     * MODE 2 (drag): the camera is a locked-off tripod. The pose captured
     * on the very first dragging frame is reasserted, verbatim, every
     * frame — hover's springs are left completely untouched (frozen in
     * place) so there is no jump the instant the button is released and
     * hover resumes from exactly where it left off. */

    const controls = controlsRef.current

    if (isDraggingRef.current) {
      if (!wasDraggingRef.current) {
        // First frame of this drag: freeze whatever hover left on screen.
        frozenCameraPosRef.current.copy(state.camera.position)
        frozenCameraTargetRef.current.copy(controls ? controls.target : pose.target)
        wasDraggingRef.current = true
      }
      state.camera.position.copy(frozenCameraPosRef.current)
      if (controls) {
        controls.target.copy(frozenCameraTargetRef.current)
      } else {
        state.camera.lookAt(frozenCameraTargetRef.current)
      }
    } else {
      wasDraggingRef.current = false

      const azimuthSpring = cameraAzimuthSpringRef.current
      azimuthSpring.step(targetCameraAzimuthRef.current, CAMERA_CURSOR_OMEGA, dt)

      const elevationSpring = cameraElevationSpringRef.current
      elevationSpring.step(targetCameraElevationRef.current, CAMERA_CURSOR_OMEGA, dt)

      const offset = orbitOffsetRef.current
      offset.copy(pose.pos).sub(pose.target)
      const radius = offset.length()
      if (radius > 1e-4) {
        const theta = Math.atan2(offset.x, offset.z) + azimuthSpring.value
        // Floor safety, solved fresh each frame for the current pose's own
        // target height and camera radius: the lowest phi that still keeps
        // camera.y >= CAMERA_FLOOR_Y. Whichever floor is higher — this or
        // the fixed backstop — wins.
        const floorPhi = Math.asin(clamp((CAMERA_FLOOR_Y - pose.target.y) / radius, -1, 1))
        const phi = clamp(
          Math.asin(clamp(offset.y / radius, -1, 1)) + elevationSpring.value,
          Math.max(MIN_CAMERA_PHI, floorPhi),
          MAX_CAMERA_PHI
        )
        const horizontalR = radius * Math.cos(phi)
        offset.set(horizontalR * Math.sin(theta), radius * Math.sin(phi), horizontalR * Math.cos(theta))
      }

      state.camera.position.copy(pose.target).add(offset)
      if (controls) {
        controls.target.copy(pose.target)
      } else {
        state.camera.lookAt(pose.target)
      }
    }

    /* --- 5. Debug HUD, written straight to the DOM at 10Hz --------------- */
    // Deliberately not React state: re-rendering this component every frame
    // used to hand the main thread a commit that competed with the render.

    debugAccumRef.current += dt
    if (debugAccumRef.current >= 0.1) {
      debugAccumRef.current = 0
      const stateName = isDraggingRef.current
        ? 'CAR ROTATE (camera locked)'
        : carYawSpring.value !== 0 ||
            targetCameraAzimuthRef.current !== 0 ||
            targetCameraElevationRef.current !== 0
          ? 'CAMERA ORBIT'
          : 'SCROLLING'
      writeDebug(debugRefs.progress.current, clamp01(p).toFixed(2))
      writeDebug(debugRefs.state.current, stateName)
      writeDebug(debugRefs.stage.current, pose.stage)
    }
  }, -2)

  return (
    <group ref={yawGroupRef}>
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

  // Persistent cursor CAMERA orbit state — this never touches the car.
  // targetCameraAzimuthRef/targetCameraElevationRef hold the cursor's
  // current (deadzoned) normalized position, shared by reference with the
  // frame loop so pointer movement never triggers a React render.
  const targetCameraAzimuthRef = useRef(0)
  const targetCameraElevationRef = useRef(0)
  const cameraAzimuthSpringRef = useRef(null)
  if (cameraAzimuthSpringRef.current === null)
    cameraAzimuthSpringRef.current = new CriticallyDampedSpring(0)
  const cameraElevationSpringRef = useRef(null)
  if (cameraElevationSpringRef.current === null)
    cameraElevationSpringRef.current = new CriticallyDampedSpring(0)

  // Hero bounding rect, cached on pointer-enter so pointermove never forces
  // a synchronous layout read.
  const rectRef = useRef(null)
  const activePointerRef = useRef(null)
  const hasInteractedRef = useRef(false)

  // Manual click+drag CAR TURNTABLE state. isDraggingRef gates
  // handlePointerMove between the two modes (and tells the frame loop to
  // freeze the camera). targetCarYawRef is a running total of pointer-move
  // DELTAS — never absolute cursor position, never reset by scroll, hover,
  // or pointer-leave/up/cancel — so the car keeps spinning from wherever it
  // currently is, through any number of full turns.
  const isDraggingRef = useRef(false)
  const lastDragClientXRef = useRef(0)
  const targetCarYawRef = useRef(0)
  const carYawSpringRef = useRef(null)
  if (carYawSpringRef.current === null) carYawSpringRef.current = new CriticallyDampedSpring(0)

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

  // Cursor control is hover-driven when no button is held, not click-drag: a
  // mouse only ever emits pointermove while it is over the canvas (no button
  // needed), while touch only emits it while a finger is in contact, so the
  // same handler gives mice free hover-orbit and touch a drag-orbit for
  // free. Pressing the button switches the SAME pointermove stream into
  // manual drag mode (see handlePointerDown/handlePointerMove below).
  const captureBaseline = useCallback((e) => {
    activePointerRef.current = e.pointerId
    if (rootRef.current) rectRef.current = rootRef.current.getBoundingClientRect()
  }, [])

  // Only the primary button/touch starts a drag; a stray right-click drag,
  // for example, should not hijack the car. No camera/target capture is
  // needed here — the frame loop freezes whatever's currently on screen the
  // moment it next sees isDraggingRef true (see CentralRotationController).
  const handlePointerDown = useCallback((e) => {
    if (e.button !== 0) return
    activePointerRef.current = e.pointerId
    isDraggingRef.current = true
    lastDragClientXRef.current = e.clientX
    e.currentTarget.setPointerCapture(e.pointerId)
  }, [])

  const handlePointerMove = useCallback(
    (e) => {
      if (activePointerRef.current === null) activePointerRef.current = e.pointerId
      if (e.pointerId !== activePointerRef.current) return

      if (isDraggingRef.current) {
        // Manual drag takes priority over hover and spins the CAR, not the
        // camera. Frame-to-frame DELTA (not absolute position, not
        // distance-from-pointerdown) accumulates into a running total that
        // is never clamped or normalized — the car can spin through any
        // number of full turns and always continues from wherever it is.
        const dx = e.clientX - lastDragClientXRef.current
        lastDragClientXRef.current = e.clientX
        targetCarYawRef.current += dx * CAR_YAW_SENSITIVITY
      } else {
        const rect = rectRef.current
        if (!rect || rect.width === 0 || rect.height === 0) return

        // Normalize to the hero bounds: X in [-1 left, +1 right],
        // Y in [-1 bottom, +1 top] (screen Y grows downward, so it's flipped).
        const nx = clamp(((e.clientX - rect.left) / rect.width) * 2 - 1, -1, 1)
        const ny = clamp(-(((e.clientY - rect.top) / rect.height) * 2 - 1), -1, 1)

        // These are the cursor's ABSOLUTE position mapped straight to a
        // camera orbit target — not an accumulated delta — so the camera
        // orbit always matches where the cursor currently sits, and holds
        // there unchanged the instant the cursor stops moving. Completely
        // untouched by drag: the car and camera are separate axes now, so
        // there's nothing to reconcile on the mode transition.
        targetCameraAzimuthRef.current = applyDeadzone(nx, CURSOR_DEADZONE) * MAX_CAMERA_AZIMUTH
        targetCameraElevationRef.current = applyDeadzone(ny, CURSOR_DEADZONE) * MAX_CAMERA_ELEVATION
      }

      if (!hasInteractedRef.current) {
        hasInteractedRef.current = true
        if (onUserInteract) onUserInteract()
      }
    },
    [onUserInteract]
  )

  // Ends a drag (pointerup/pointercancel). targetCarYawRef is deliberately
  // left untouched — the car simply stays at whatever rotation the drag
  // reached, and hover resumes computing its own independent camera target
  // exactly as it always has (hover was never touched by the drag, so
  // there's no baseline to reconcile here).
  const endDrag = useCallback((e) => {
    if (activePointerRef.current !== null && e.pointerId !== activePointerRef.current) return
    isDraggingRef.current = false
    activePointerRef.current = null
  }, [])

  // Plain hover leaving the canvas: pointer capture keeps a drag's
  // move/up events routed to us regardless of where the cursor physically
  // is, so this only ever fires for the non-drag hover case.
  const handlePointerLeave = useCallback((e) => {
    if (isDraggingRef.current) return
    if (activePointerRef.current !== null && e.pointerId !== activePointerRef.current) return
    activePointerRef.current = null
  }, [])

  return (
    <div
      ref={rootRef}
      className="w-full h-full bg-[#08090c] overflow-hidden select-none relative"
      // pan-y keeps vertical page scrolling native on touch while horizontal
      // gestures reach us as pointer events without being cancelled.
      style={{ touchAction: 'pan-y' }}
      onPointerEnter={captureBaseline}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
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

        {/* 4. CENTRAL ROTATION CONTROLLER (scroll+drag car turntable, cinematic hover camera / locked drag camera) */}
        <React.Suspense fallback={<Loader />}>
          <CentralRotationController
            config={config}
            rotationYRef={rotationYRef}
            targetCameraAzimuthRef={targetCameraAzimuthRef}
            targetCameraElevationRef={targetCameraElevationRef}
            cameraAzimuthSpringRef={cameraAzimuthSpringRef}
            cameraElevationSpringRef={cameraElevationSpringRef}
            targetCarYawRef={targetCarYawRef}
            carYawSpringRef={carYawSpringRef}
            isDraggingRef={isDraggingRef}
            scrollYProgress={scrollYProgress}
            controlsRef={controlsRef}
            debugRefs={debugRefs}
          />
        </React.Suspense>

        {/* 5. ORBIT CONTROLS FOR MOUSE/TOUCH PANNING (Wheel Zoom Disabled to Allow Natural Page Scroll) */}
        <OrbitControls
          ref={controlsRef}
          enableRotate={false} // Camera pose is driven entirely by the controller above
          enablePan={false}
          enableZoom={false} // CRITICAL FIX: Disable wheel zoom so mouse wheel triggers page scrolling!
          enableDamping={false} // All damping is handled by the controller above
          // Kept deliberately permissive: the controller above is the sole
          // authority on elevation range (MIN_CAMERA_PHI/MAX_CAMERA_PHI plus
          // the dynamic floor clamp for both hover and manual drag). These
          // are just a last-resort guard against the polar angle reaching
          // the degenerate poles.
          minPolarAngle={0.05}
          maxPolarAngle={Math.PI - 0.05}
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
