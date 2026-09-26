import { Cloud, Sky } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { SAMPLE_MEMORY } from '../data/sampleMemory'
import { Landmark } from './Landmark'

function Tree({
  position,
  scale = 1,
  canopy = '#5f8a4e',
}: {
  position: [number, number, number]
  scale?: number
  canopy?: string
}) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.7, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.18, 1.4, 6]} />
        <meshStandardMaterial color="#6b4f35" roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.85, 0]} castShadow>
        <sphereGeometry args={[0.85, 10, 10]} />
        <meshStandardMaterial color={canopy} roughness={0.85} />
      </mesh>
      <mesh position={[0.35, 2.15, -0.2]} castShadow>
        <sphereGeometry args={[0.5, 8, 8]} />
        <meshStandardMaterial color="#6e9a58" roughness={0.85} />
      </mesh>
    </group>
  )
}

function Bush({
  position,
  color = '#6a9458',
  scale = 1,
}: {
  position: [number, number, number]
  color?: string
  scale?: number
}) {
  return (
    <group position={position} scale={scale}>
      <mesh castShadow>
        <sphereGeometry args={[0.55, 8, 8]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      <mesh position={[0.35, 0.1, 0.1]} castShadow>
        <sphereGeometry args={[0.4, 8, 8]} />
        <meshStandardMaterial color="#7aa566" roughness={0.9} />
      </mesh>
    </group>
  )
}

function PathRibbon() {
  const geometry = useMemo(() => {
    const shape = new THREE.Shape()
    const half = 1.15
    const pts = [
      new THREE.Vector2(-half, 5.5),
      new THREE.Vector2(half, 5.5),
      new THREE.Vector2(half + 0.3, 2),
      new THREE.Vector2(half * 0.9, -1),
      new THREE.Vector2(half * 0.85, -4),
      new THREE.Vector2(half * 0.9, -7.5),
      new THREE.Vector2(half + 0.4, -9.5),
      new THREE.Vector2(-half - 0.4, -9.5),
      new THREE.Vector2(-half * 0.9, -7.5),
      new THREE.Vector2(-half * 0.85, -4),
      new THREE.Vector2(-half * 0.9, -1),
      new THREE.Vector2(-half - 0.3, 2),
    ]
    shape.moveTo(pts[0].x, pts[0].y)
    for (let i = 1; i < pts.length; i++) shape.lineTo(pts[i].x, pts[i].y)
    shape.closePath()
    const geo = new THREE.ShapeGeometry(shape)
    geo.rotateX(-Math.PI / 2)
    return geo
  }, [])

  return (
    <mesh geometry={geometry} position={[0, 0.015, 0]} receiveShadow>
      <meshStandardMaterial color="#c4a882" roughness={0.95} />
    </mesh>
  )
}

function GardenBackdrop() {
  const texture = useMemo(() => {
    const tex = new THREE.TextureLoader().load('./ghibli-garden-main.jpg')
    tex.colorSpace = THREE.SRGBColorSpace
    return tex
  }, [])

  return (
    <mesh position={[0, 6.5, -24]}>
      <planeGeometry args={[22, 12]} />
      <meshBasicMaterial map={texture} transparent opacity={0.5} depthWrite={false} />
    </mesh>
  )
}

function DragonflyAccent() {
  const ref = useRef<THREE.Group>(null)

  useFrame(({ clock }) => {
    if (!ref.current) return
    const t = clock.elapsedTime
    ref.current.position.y = 1.35 + Math.sin(t * 1.8) * 0.15
    ref.current.position.x = 2.2 + Math.cos(t * 0.7) * 0.35
    ref.current.rotation.y = Math.sin(t * 0.9) * 0.4
  })

  return (
    <group ref={ref} position={[2.2, 1.35, -8.6]}>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <capsuleGeometry args={[0.025, 0.16, 4, 8]} />
        <meshStandardMaterial
          color="#4a8fb8"
          emissive="#2a6080"
          emissiveIntensity={0.3}
        />
      </mesh>
      <mesh position={[0, 0.04, 0.06]} rotation={[0.3, 0.2, 0.2]}>
        <planeGeometry args={[0.2, 0.09]} />
        <meshStandardMaterial
          color="#a8d8f0"
          transparent
          opacity={0.7}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      <mesh position={[0, -0.04, 0.06]} rotation={[-0.3, -0.2, -0.2]}>
        <planeGeometry args={[0.18, 0.07]} />
        <meshStandardMaterial
          color="#a8d8f0"
          transparent
          opacity={0.55}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}

function CardinalAccent() {
  const ref = useRef<THREE.Group>(null)

  useFrame(({ clock }) => {
    if (!ref.current) return
    ref.current.position.y = 2.55 + Math.sin(clock.elapsedTime * 0.9) * 0.04
  })

  return (
    <group ref={ref} position={[-1.6, 2.55, -7.2]}>
      <mesh>
        <sphereGeometry args={[0.09, 10, 10]} />
        <meshStandardMaterial color="#c23b2e" roughness={0.55} />
      </mesh>
      <mesh position={[0.08, 0.02, 0]}>
        <coneGeometry args={[0.025, 0.07, 5]} />
        <meshStandardMaterial color="#e8a84a" />
      </mesh>
      <mesh position={[0, 0.1, 0]}>
        <coneGeometry args={[0.05, 0.08, 5]} />
        <meshStandardMaterial color="#a82e24" />
      </mesh>
    </group>
  )
}

type GardenSceneProps = {
  nearLandmark: boolean
}

export function GardenScene({ nearLandmark }: GardenSceneProps) {
  const trees = useMemo(
    () =>
      [
        [-5.5, 0, -2, 1.1, '#567a45'],
        [-6.2, 0, -6, 1.35, '#4f7340'],
        [5.8, 0, -3, 1.2, '#5c8248'],
        [6.4, 0, -8, 1.45, '#4a6e3c'],
        [-4.8, 0, -11, 1.0, '#628850'],
        [4.2, 0, -12, 1.25, '#557844'],
        [-7, 0, 2, 0.95, '#5a7e48'],
        [6.8, 0, 1.5, 1.05, '#5f864c'],
      ] as const,
    [],
  )

  return (
    <>
      <color attach="background" args={['#cfe0ef']} />
      <fog attach="fog" args={['#d7e4d8', 12, 38]} />

      <ambientLight intensity={0.55} color="#fff6e8" />
      <directionalLight
        castShadow
        position={[8, 14, 6]}
        intensity={1.15}
        color="#ffe6b8"
        shadow-mapSize={[1024, 1024]}
        shadow-camera-far={40}
        shadow-camera-left={-15}
        shadow-camera-right={15}
        shadow-camera-top={15}
        shadow-camera-bottom={-15}
      />
      <hemisphereLight args={['#b8d4f0', '#6a8a58', 0.45]} />

      <Sky
        distance={450000}
        sunPosition={[8, 4, 6]}
        inclination={0.48}
        azimuth={0.22}
        mieCoefficient={0.004}
        mieDirectionalG={0.7}
        rayleigh={1.2}
        turbidity={4}
      />

      <Cloud position={[-10, 10, -18]} speed={0.05} opacity={0.35} segments={12} />
      <Cloud position={[12, 11, -22]} speed={0.04} opacity={0.28} segments={10} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -4]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#7a9a62" roughness={1} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-6, 0.01, -5]} receiveShadow>
        <circleGeometry args={[4, 24]} />
        <meshStandardMaterial color="#6f9258" roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[6, 0.01, -7]} receiveShadow>
        <circleGeometry args={[3.5, 24]} />
        <meshStandardMaterial color="#73965c" roughness={1} />
      </mesh>

      <PathRibbon />

      {trees.map((t, i) => (
        <Tree key={i} position={[t[0], t[1], t[2]]} scale={t[3]} canopy={t[4]} />
      ))}

      <Bush position={[-2.4, 0.35, -6.5]} />
      <Bush position={[2.6, 0.3, -7.2]} color="#5f854c" scale={0.9} />
      <Bush position={[-3.2, 0.28, -9.8]} color="#6e9a58" scale={1.1} />
      <Bush position={[3.4, 0.32, -10.2]} scale={0.85} />
      <Bush position={[-1.8, 0.25, 2.5]} color="#668a52" scale={0.75} />
      <Bush position={[2.1, 0.25, 3]} scale={0.7} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[2.8, 0.03, -9.2]} receiveShadow>
        <circleGeometry args={[1.6, 28]} />
        <meshStandardMaterial
          color="#6aa0b8"
          roughness={0.25}
          metalness={0.15}
          transparent
          opacity={0.85}
        />
      </mesh>

      <Landmark position={SAMPLE_MEMORY.position} highlight={nearLandmark} />
      <GardenBackdrop />
      <DragonflyAccent />
      <CardinalAccent />
    </>
  )
}
