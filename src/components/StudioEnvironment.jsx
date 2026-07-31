import React, { useMemo, useEffect } from 'react'
import { useGLTF, ContactShadows, Environment, Lightformer } from '@react-three/drei'
import * as THREE from 'three'

export default function StudioEnvironment() {
  const { scene: studioScene } = useGLTF('/models/studio_v1_for_car.glb')
  const clonedStudio = useMemo(() => studioScene.clone(true), [studioScene])

  useEffect(() => {
    if (!clonedStudio) return

    // Scale the imported studio environment up (2.2x) to create a spacious detailing bay
    clonedStudio.scale.set(2.2, 2.2, 2.2)
    clonedStudio.position.set(0, -0.02, 0)
    clonedStudio.rotation.set(0, 0, 0)

    // Traverse and optimize studio materials & emissive LED lights
    clonedStudio.traverse((child) => {
      if (child.isMesh) {
        child.receiveShadow = true
        child.castShadow = false

        const matName = (child.material?.name || '').toLowerCase()
        const meshName = (child.name || '').toLowerCase()

        // 1. Physical Emissive LED Ceiling Light Panels
        if (matName === 'lights' || meshName.includes('light')) {
          child.material.emissive = new THREE.Color('#ffffff')
          child.material.emissiveIntensity = 4.2
          child.material.toneMapped = false
        }

        // 2. Dark Satin Automotive Detailing Studio Floor (Non-mirror, satin concrete / epoxy finish)
        else if (
          matName.includes('tiles') ||
          matName.includes('ground') ||
          matName.includes('floor') ||
          meshName.includes('tiles') ||
          meshName.includes('ground') ||
          meshName.includes('floor')
        ) {
          child.material.color = new THREE.Color('#14161b')
          child.material.roughness = 0.68 // Premium satin finish (no mirror gloss)
          child.material.metalness = 0.05  // Non-metallic dark epoxy feel
          child.material.envMapIntensity = 0.35 // Subtle supporting highlights, no strong car mirror reflection
        }

        // 3. Studio Wall & Structure Enhancement
        else if (matName === 'material' || meshName.includes('wall')) {
          child.material.roughness = 0.88
          child.material.metalness = 0.1
          child.material.envMapIntensity = 0.3
        }
      }
    })
  }, [clonedStudio])

  return (
    <group position={[0, 0, 0]}>
      {/* 1. STUDIO SOFTBOX REFLECTION MAP — single consolidated environment
          (key/fill/rim softboxes baked once since nothing here animates) */}
      <Environment resolution={1024} frames={1}>
        <group position={[0, 10, 0]}>
          {/* Overhead key softbox — large + warm-neutral for a soft gradient across the roof/hood */}
          <Lightformer form="rect" intensity={4.5} color="#fff4e6" position={[0, 0, 0]} scale={[6, 20, 1]} rotation={[Math.PI / 2, 0, 0]} />

          {/* Side fill softboxes — cool, for door/fender reflections */}
          <Lightformer form="rect" intensity={2.0} color="#dbeafe" position={[-13, -2, 0]} scale={[4, 18, 1]} rotation={[0, Math.PI / 2, 0]} />
          <Lightformer form="rect" intensity={2.0} color="#dbeafe" position={[13, -2, 0]} scale={[4, 18, 1]} rotation={[0, -Math.PI / 2, 0]} />
        </group>

        {/* Rim/back kicker strips — positioned behind the car to trace a bright edge along the silhouette */}
        <Lightformer form="rect" intensity={6} color="#eaf4ff" position={[-4, 2, -10]} scale={[2, 6, 1]} rotation={[0, Math.PI / 6, 0]} />
        <Lightformer form="rect" intensity={6} color="#eaf4ff" position={[4, 2, -10]} scale={[2, 6, 1]} rotation={[0, -Math.PI / 6, 0]} />

        {/* Low front bounce — subtle warm ring mimicking floor bounce back into the lower body/bumper */}
        <Lightformer form="ring" intensity={1.2} color="#fff7ed" position={[0, 0.5, 8]} scale={4} />
      </Environment>

      {/* 2. THE ENLARGED 3D DETAILING STUDIO MODEL (STATIONARY, 2.2x SCALE) */}
      <primitive object={clonedStudio} />

      {/* 3. CINEMATIC 3-POINT DIRECT LIGHTING (key / fill / rim) */}

      {/* Ambient gradient fill — cool sky, warm dark ground, mimics studio floor bounce */}
      <hemisphereLight args={['#dbe9ff', '#1a1712', 0.45]} />

      {/* Key light — warm, angled upper-front, sole shadow caster */}
      <directionalLight
        position={[6, 12, 7]}
        intensity={1.8}
        color="#fff2e0"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0002}
        shadow-normalBias={0.02}
      />

      {/* Fill light — cool, opposite side, low intensity, softens key-side shadow without flattening it */}
      <directionalLight position={[-7, 6, 4]} intensity={0.5} color="#cfe3ff" />

      {/* Rim / back lights — trace the trailing edges of the body to separate it from the dark background */}
      <directionalLight position={[-5, 7, -9]} intensity={1.6} color="#eaf4ff" />
      <directionalLight position={[5, 7, -9]} intensity={1.6} color="#eaf4ff" />
    </group>
  )
}

useGLTF.preload('/models/studio_v1_for_car.glb')

