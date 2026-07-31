import React, { useRef, useEffect, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import CarModel from '../CarModel'
import JourneyLighting from './JourneyLighting'
import { damp } from '../../utils/animation'

const BASE_YAW = 0.4
const SCROLL_YAW_SWEEP = 1.3 // total rotation (rad) across the whole section
const YAW_LAMBDA = 3.5
const DOLLY_LAMBDA = 3

function JourneyCarRig({ config, scrollYProgress }) {
  const groupRef = useRef()
  const yawRef = useRef(BASE_YAW)

  useFrame((state, delta) => {
    const dt = Math.min(delta, 1 / 20)
    const p = scrollYProgress ? scrollYProgress.get() : 0

    const targetYaw = BASE_YAW + p * SCROLL_YAW_SWEEP
    yawRef.current = damp(yawRef.current, targetYaw, YAW_LAMBDA, dt)
    if (groupRef.current) groupRef.current.rotation.y = yawRef.current

    // Slow push-in toward the final reveal scene.
    const targetZ = 8.2 - p * 1.0
    const targetY = 1.5 - p * 0.15
    state.camera.position.z = damp(state.camera.position.z, targetZ, DOLLY_LAMBDA, dt)
    state.camera.position.y = damp(state.camera.position.y, targetY, DOLLY_LAMBDA, dt)
    state.camera.lookAt(0, 0.5, 0)
  })

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      <CarModel url="/models/ford_mustang_shelby_gt500.glb" config={config} />
    </group>
  )
}

export default function JourneyCarStage({ config, scrollYProgress }) {
  const rootRef = useRef(null)
  const [inView, setInView] = useState(false)

  // Same pause-when-offscreen pattern as the hero's CarViewer — only one of
  // the two canvases on the page is ever actually driving the render loop.
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

  return (
    // Confined to the upper ~74% of the viewport so the car's rendered pixels
    // can never collide with the caption band below it, whatever the exact
    // camera framing on a given screen size.
    <div ref={rootRef} className="absolute inset-x-0 top-0 h-[74%] z-20 pointer-events-none">
      <Canvas
        frameloop={inView ? 'always' : 'never'}
        camera={{ position: [0, 1.5, 8.2], fov: 28 }}
        gl={{
          antialias: true,
          alpha: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 0.95,
          powerPreference: 'high-performance',
        }}
      >
        {/* No <color attach="background">: the canvas stays transparent so
            the photographic backdrop shows through behind the car. */}
        <JourneyLighting />
        <React.Suspense fallback={null}>
          <JourneyCarRig config={config} scrollYProgress={scrollYProgress} />
        </React.Suspense>
      </Canvas>
    </div>
  )
}
