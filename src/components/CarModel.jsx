import React, { useMemo, useRef, useEffect } from 'react'
import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import {
  PAINT_OPTIONS,
  RIM_OPTIONS,
  TIRE_OPTIONS,
  BRAKE_OPTIONS,
  INTERIOR_OPTIONS,
} from '../constants/configuratorOptions'

// Rate (1/s) of the material cross-fade. Expressed as a rate rather than a
// per-frame factor so the 300ms transition lasts 300ms at any frame rate.
const MATERIAL_LAMBDA = 8
// Below this combined error the transition is snapped exact and switched off.
// A lerp is asymptotic, so without this the loop keeps rewriting every
// material of the car on every frame forever.
const MATERIAL_EPS = 1e-3

function stepMaterialGroup(mats, targetColor, option, factor) {
  let maxError = 0
  for (let i = 0; i < mats.length; i++) {
    const mat = mats[i]
    const error =
      Math.abs(mat.color.r - targetColor.r) +
      Math.abs(mat.color.g - targetColor.g) +
      Math.abs(mat.color.b - targetColor.b) +
      Math.abs(mat.roughness - option.roughness) +
      Math.abs(mat.metalness - option.metalness)

    if (error > maxError) maxError = error

    if (error < MATERIAL_EPS) {
      mat.color.copy(targetColor)
      mat.roughness = option.roughness
      mat.metalness = option.metalness
      continue
    }

    mat.color.lerp(targetColor, factor)
    mat.roughness += (option.roughness - mat.roughness) * factor
    mat.metalness += (option.metalness - mat.metalness) * factor
  }
  return maxError
}

// Dull baseline the Transformation Lab blends up from. Untouched by every
// other caller since `finishRef` defaults to null there.
const DULL_ROUGHNESS = 0.75
const DULL_CLEARCOAT = 0.0
const DULL_CLEARCOAT_ROUGHNESS = 0.6
const DULL_ENV_INTENSITY = 0.5
const GLOSSY_ENV_INTENSITY = 1.9

export default function CarModel({ url, config, finishRef = null, onBoundsReady = null }) {
  const { scene } = useGLTF(url)
  const clonedScene = useMemo(() => scene.clone(true), [scene])
  const groupRef = useRef()

  // Target Color Refs for Smooth Lerping
  const targetPaintColor = useRef(new THREE.Color())
  const targetRimColor = useRef(new THREE.Color())
  const targetTireColor = useRef(new THREE.Color())
  const targetBrakeColor = useRef(new THREE.Color())
  const targetInteriorColor = useRef(new THREE.Color())

  // Material references
  const materialsRef = useRef({
    paint: [],
    rim: [],
    tire: [],
    brake: [],
    interior: [],
    glass: [],
  })

  // Find active options
  const activePaint = useMemo(
    () => PAINT_OPTIONS.find((p) => p.id === config.paint) || PAINT_OPTIONS[0],
    [config.paint]
  )
  const activeRim = useMemo(
    () => RIM_OPTIONS.find((r) => r.id === config.rim) || RIM_OPTIONS[0],
    [config.rim]
  )
  const activeTire = useMemo(
    () => TIRE_OPTIONS.find((t) => t.id === config.tire) || TIRE_OPTIONS[0],
    [config.tire]
  )
  const activeBrake = useMemo(
    () => BRAKE_OPTIONS.find((b) => b.id === config.brake) || BRAKE_OPTIONS[0],
    [config.brake]
  )
  const activeInterior = useMemo(
    () => INTERIOR_OPTIONS.find((i) => i.id === config.interior) || INTERIOR_OPTIONS[0],
    [config.interior]
  )

  // True only while a material cross-fade is actually in flight.
  const isTransitioningRef = useRef(true)

  // Update target colors when config changes
  useEffect(() => {
    targetPaintColor.current.set(activePaint.color)
    targetRimColor.current.set(activeRim.color)
    targetTireColor.current.set(activeTire.color)
    targetBrakeColor.current.set(activeBrake.color)
    targetInteriorColor.current.set(activeInterior.color)
    isTransitioningRef.current = true
  }, [activePaint, activeRim, activeTire, activeBrake, activeInterior])

  // Setup Initial Positioning (PRESERVED: rotation=[0,0,0]) & Categorize Materials
  useEffect(() => {
    if (!clonedScene) return

    clonedScene.rotation.set(0, 0, 0)
    clonedScene.position.set(0, 0, 0)
    clonedScene.scale.set(1, 1, 1)

    // Calculate unrotated bounding box for natural wheel placement at Y = 0
    const box = new THREE.Box3().setFromObject(clonedScene)
    const center = new THREE.Vector3()
    box.getCenter(center)

    clonedScene.position.x = -center.x
    clonedScene.position.z = -center.z
    clonedScene.position.y = -box.min.y

    // Bounds in this group's own frame, now that the offsets above pin the
    // bottom at y=0 and the footprint at x=0/z=0: height and half-depth are
    // exactly what a caller needs to reason about vertical tilt without ever
    // re-running Box3 on the live (possibly rotated) scene.
    if (onBoundsReady) {
      onBoundsReady({
        height: box.max.y - box.min.y,
        halfDepth: (box.max.z - box.min.z) / 2,
      })
    }

    // Reset categorization refs
    materialsRef.current = { paint: [], rim: [], tire: [], brake: [], interior: [], glass: [] }

    clonedScene.traverse((child) => {
      if (!child.isMesh || !child.material) return

      child.castShadow = true
      child.receiveShadow = true

      const matName = (child.material.name || '').toLowerCase()
      const meshName = (child.name || '').toLowerCase()

      // 1. Body Paint
      if (matName === 'carpaint' || meshName.includes('_carpaint_')) {
        if (!(child.material instanceof THREE.MeshPhysicalMaterial)) {
          child.material = new THREE.MeshPhysicalMaterial({
            name: child.material.name,
            clearcoat: 1.0,
            clearcoatRoughness: 0.03,
            reflectivity: 0.9,
          })
        }
        child.material.envMapIntensity = 1.9
        materialsRef.current.paint.push(child.material)
      }

      // 2. Rims
      else if (matName === 'lambert1' || meshName.includes('_lambert1_')) {
        if (!(child.material instanceof THREE.MeshStandardMaterial)) {
          child.material = new THREE.MeshStandardMaterial({ name: child.material.name })
        }
        child.material.envMapIntensity = 2.4
        materialsRef.current.rim.push(child.material)
      }

      // 3. Tires
      else if (matName === 'tire' || meshName.includes('_tire_')) {
        if (!(child.material instanceof THREE.MeshStandardMaterial)) {
          child.material = new THREE.MeshStandardMaterial({ name: child.material.name })
        }
        child.material.envMapIntensity = 0.8
        materialsRef.current.tire.push(child.material)
      }

      // 4. Brake Calipers
      else if (matName === 'brake' || meshName.includes('_brake_')) {
        if (!(child.material instanceof THREE.MeshStandardMaterial)) {
          child.material = new THREE.MeshStandardMaterial({ name: child.material.name })
        }
        child.material.envMapIntensity = 1.5
        materialsRef.current.brake.push(child.material)
      }

      // 5. Interior
      else if (
        matName === 'leather' ||
        matName === 'seat' ||
        meshName.includes('_seat_') ||
        meshName.includes('_leather_')
      ) {
        if (!(child.material instanceof THREE.MeshStandardMaterial)) {
          child.material = new THREE.MeshStandardMaterial({ name: child.material.name })
        }
        child.material.envMapIntensity = 1.0
        materialsRef.current.interior.push(child.material)
      }

      // 6. Glass
      else if (matName === 'tinted_glass' || meshName.includes('_tinted_glass_')) {
        child.material.transparent = true
        child.material.opacity = 0.42
        child.material.roughness = 0.05
        child.material.metalness = 0.95
        child.material.envMapIntensity = 2.8
      }
    })

    // Freshly collected materials still carry their GLTF values.
    isTransitioningRef.current = true
  }, [clonedScene])

  // Smooth Material Lerping in Frame Loop (300ms smooth transition).
  // Idles out completely once the cross-fade has converged, so a static car
  // costs nothing per frame.
  useFrame((_, delta) => {
    // finishRef keeps this frame loop alive even after the config transition
    // has converged, since it drives roughness/clearcoat every frame from an
    // external scroll value.
    if (!isTransitioningRef.current && !finishRef) return

    const groups = materialsRef.current
    const total =
      groups.paint.length +
      groups.rim.length +
      groups.tire.length +
      groups.brake.length +
      groups.interior.length
    if (total === 0) return

    if (isTransitioningRef.current) {
      const factor = 1 - Math.exp(-MATERIAL_LAMBDA * Math.min(delta, 0.1))

      let maxError = 0
      maxError = Math.max(maxError, stepMaterialGroup(groups.paint, targetPaintColor.current, activePaint, factor))
      maxError = Math.max(maxError, stepMaterialGroup(groups.rim, targetRimColor.current, activeRim, factor))
      maxError = Math.max(maxError, stepMaterialGroup(groups.tire, targetTireColor.current, activeTire, factor))
      maxError = Math.max(maxError, stepMaterialGroup(groups.brake, targetBrakeColor.current, activeBrake, factor))
      maxError = Math.max(maxError, stepMaterialGroup(groups.interior, targetInteriorColor.current, activeInterior, factor))

      if (maxError < MATERIAL_EPS) isTransitioningRef.current = false
    }

    // Transformation Lab gloss sweep: overrides roughness/clearcoat/env
    // intensity on the paint group only, blending from a dull baseline up to
    // the option's own natural glossy values. Computed fresh each frame from
    // `finishRef.current`, so it never fights the color lerp above.
    if (finishRef) {
      const f = Math.min(1, Math.max(0, finishRef.current))
      const paintMats = groups.paint
      for (let i = 0; i < paintMats.length; i++) {
        const mat = paintMats[i]
        mat.roughness = DULL_ROUGHNESS + (activePaint.roughness - DULL_ROUGHNESS) * f
        mat.envMapIntensity = DULL_ENV_INTENSITY + (GLOSSY_ENV_INTENSITY - DULL_ENV_INTENSITY) * f
        if ('clearcoat' in mat) {
          mat.clearcoat = DULL_CLEARCOAT + (activePaint.clearcoat - DULL_CLEARCOAT) * f
          mat.clearcoatRoughness =
            DULL_CLEARCOAT_ROUGHNESS + (activePaint.clearcoatRoughness - DULL_CLEARCOAT_ROUGHNESS) * f
        }
      }
    }
  })

  return (
    // PRESERVED: rotation={[0, 0, 0]}
    <group ref={groupRef} rotation={[0, 0, 0]}>
      <primitive object={clonedScene} />
    </group>
  )
}
