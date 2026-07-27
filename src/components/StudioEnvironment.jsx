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
          child.material.emissiveIntensity = 4.5
          child.material.toneMapped = false
        }

        // 2. Slate Tile Ground Floor Material Enhancement
        else if (matName.includes('tiles') || meshName.includes('ground')) {
          child.material.roughness = 0.28
          child.material.metalness = 0.55
          child.material.envMapIntensity = 1.4
        }

        // 3. Studio Wall Material Enhancement
        else if (matName === 'material' || meshName.includes('wall')) {
          child.material.roughness = 0.85
          child.material.metalness = 0.2
        }
      }
    })
  }, [clonedStudio])

  return (
    <group position={[0, 0, 0]}>
      {/* 1. REAL-TIME CEILING LED REFLECTION MAP (SCALED MATCHING ENLARGED STUDIO) */}
      <Environment resolution={1024}>
        <group position={[0, 10, 0]}>
          {/* Overhead Parallel LED Grid Reflection Bars */}
          <Lightformer form="rect" intensity={7.0} color="#ffffff" position={[-6, 0, 0]} scale={[2.5, 16, 1]} rotation={[Math.PI / 2, 0, 0]} />
          <Lightformer form="rect" intensity={8.0} color="#ffffff" position={[0, 0, 0]} scale={[3.0, 16, 1]} rotation={[Math.PI / 2, 0, 0]} />
          <Lightformer form="rect" intensity={7.0} color="#ffffff" position={[6, 0, 0]} scale={[2.5, 16, 1]} rotation={[Math.PI / 2, 0, 0]} />
          
          {/* Side Soft Fill Reflections for Doors & Fenders */}
          <Lightformer form="rect" intensity={3.5} color="#e0f2fe" position={[-12, -2, 0]} scale={[3, 18, 1]} rotation={[0, Math.PI / 2, 0]} />
          <Lightformer form="rect" intensity={3.5} color="#e0f2fe" position={[12, -2, 0]} scale={[3, 18, 1]} rotation={[0, -Math.PI / 2, 0]} />
        </group>
      </Environment>

      {/* 2. THE ENLARGED 3D DETAILING STUDIO MODEL (STATIONARY, 2.2x SCALE) */}
      <primitive object={clonedStudio} />

      {/* 3. SOFT REALISTIC GROUND CONTACT SHADOW ON STUDIO FLOOR */}
      <ContactShadows
        position={[0, 0.003, 0]}
        opacity={0.92}
        scale={16}
        blur={1.6}
        far={4.0}
        resolution={1024}
        color="#000000"
      />

      {/* 4. CINEMATIC DIRECT LIGHTING MATCHING ENLARGED STUDIO */}
      <ambientLight intensity={0.7} />

      {/* Overhead Key Light */}
      <directionalLight
        position={[0, 18, 0]}
        intensity={3.0}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0001}
      />

      {/* Parallel Row Directional Light Bars */}
      <directionalLight position={[-8, 15, 6]} intensity={2.4} color="#f8fafc" />
      <directionalLight position={[8, 15, 6]} intensity={2.4} color="#f8fafc" />
      <directionalLight position={[-8, 15, -6]} intensity={2.0} color="#e0f2fe" />
      <directionalLight position={[8, 15, -6]} intensity={2.0} color="#e0f2fe" />

      {/* Low Side Fill for Rims & Tires */}
      <directionalLight position={[-15, 5, 10]} intensity={1.2} />
      <directionalLight position={[15, 5, 10]} intensity={1.2} />
      <directionalLight position={[0, 5, -15]} intensity={1.4} />
    </group>
  )
}

useGLTF.preload('/models/studio_v1_for_car.glb')
