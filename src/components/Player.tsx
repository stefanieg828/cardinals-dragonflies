import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import type { MutableRefObject } from 'react'
import type { MoveInput } from './MobileControls'

const SPEED = 4.2
const LOOK_SENS = 0.0022
const MOBILE_LOOK = 0.0045
const BOUNDS = { minX: -7, maxX: 7, minZ: -14, maxZ: 6 }
const EYE = 1.55

type PlayerProps = {
  moveRef: MutableRefObject<MoveInput>
  lookDeltaRef: MutableRefObject<{ dx: number; dy: number }>
  pointerLocked: boolean
  memoryOpen: boolean
  onNearLandmark: (near: boolean) => void
  landmarkPos: [number, number, number]
}

export function Player({
  moveRef,
  lookDeltaRef,
  pointerLocked,
  memoryOpen,
  onNearLandmark,
  landmarkPos,
}: PlayerProps) {
  const { camera, gl } = useThree()
  const keys = useRef<Record<string, boolean>>({})
  const yaw = useRef(0)
  const pitch = useRef(-0.12)
  const pos = useRef(new THREE.Vector3(0, EYE, 4))
  const nearRef = useRef(false)

  useEffect(() => {
    camera.position.copy(pos.current)
  }, [camera])

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      keys.current[e.code] = true
    }
    const up = (e: KeyboardEvent) => {
      keys.current[e.code] = false
    }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
    }
  }, [])

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!pointerLocked || memoryOpen) return
      yaw.current -= e.movementX * LOOK_SENS
      pitch.current -= e.movementY * LOOK_SENS
      pitch.current = Math.max(-1.2, Math.min(1.2, pitch.current))
    }
    document.addEventListener('mousemove', onMove)
    return () => document.removeEventListener('mousemove', onMove)
  }, [pointerLocked, memoryOpen])

  useFrame((_, dt) => {
    const clampedDt = Math.min(dt, 0.05)

    // Mobile look deltas
    if (!memoryOpen) {
      const ld = lookDeltaRef.current
      if (ld.dx || ld.dy) {
        yaw.current -= ld.dx * MOBILE_LOOK
        pitch.current -= ld.dy * MOBILE_LOOK
        pitch.current = Math.max(-1.2, Math.min(1.2, pitch.current))
        ld.dx = 0
        ld.dy = 0
      }
    }

    const forward = new THREE.Vector3(-Math.sin(yaw.current), 0, -Math.cos(yaw.current))
    const right = new THREE.Vector3(Math.cos(yaw.current), 0, -Math.sin(yaw.current))

    let mx = 0
    let mz = 0
    if (!memoryOpen) {
      if (keys.current['KeyW'] || keys.current['ArrowUp']) mz -= 1
      if (keys.current['KeyS'] || keys.current['ArrowDown']) mz += 1
      if (keys.current['KeyA'] || keys.current['ArrowLeft']) mx -= 1
      if (keys.current['KeyD'] || keys.current['ArrowRight']) mx += 1

      const stick = moveRef.current
      mx += stick.x
      mz += stick.z
    }

    const len = Math.hypot(mx, mz)
    if (len > 1e-3) {
      mx /= len
      mz /= len
      pos.current.addScaledVector(forward, -mz * SPEED * clampedDt)
      pos.current.addScaledVector(right, mx * SPEED * clampedDt)
    }

    pos.current.x = THREE.MathUtils.clamp(pos.current.x, BOUNDS.minX, BOUNDS.maxX)
    pos.current.z = THREE.MathUtils.clamp(pos.current.z, BOUNDS.minZ, BOUNDS.maxZ)
    pos.current.y = EYE

    camera.position.copy(pos.current)
    camera.rotation.order = 'YXZ'
    camera.rotation.y = yaw.current
    camera.rotation.x = pitch.current

    const dist = pos.current.distanceTo(
      new THREE.Vector3(landmarkPos[0], EYE, landmarkPos[2]),
    )
    const near = dist < 3.2
    if (near !== nearRef.current) {
      nearRef.current = near
      onNearLandmark(near)
    }

    // Silence unused gl warning in some builds
    void gl
  })

  return null
}
