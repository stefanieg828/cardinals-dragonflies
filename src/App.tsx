import { Canvas } from '@react-three/fiber'
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { GardenScene } from './components/GardenScene'
import { Landing } from './components/Landing'
import { MemoryCard } from './components/MemoryCard'
import { MobileControls, type MoveInput } from './components/MobileControls'
import { Player } from './components/Player'
import { SAMPLE_MEMORY } from './data/sampleMemory'

function useIsCoarsePointer() {
  const [coarse, setCoarse] = useState(() =>
    typeof window !== 'undefined'
      ? window.matchMedia('(pointer: coarse)').matches
      : false,
  )
  useEffect(() => {
    const mq = window.matchMedia('(pointer: coarse)')
    const update = () => setCoarse(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])
  return coarse
}

export default function App() {
  const [entered, setEntered] = useState(false)
  const [nearLandmark, setNearLandmark] = useState(false)
  const [memoryOpen, setMemoryOpen] = useState(false)
  const [pointerLocked, setPointerLocked] = useState(false)
  const isMobile = useIsCoarsePointer()

  const moveRef = useRef<MoveInput>({ x: 0, z: 0 })
  const lookDeltaRef = useRef({ dx: 0, dy: 0 })

  const onNearLandmark = useCallback((near: boolean) => {
    setNearLandmark(near)
    if (!near) setMemoryOpen(false)
  }, [])

  useEffect(() => {
    const onLockChange = () => {
      setPointerLocked(document.pointerLockElement !== null)
    }
    document.addEventListener('pointerlockchange', onLockChange)
    return () => document.removeEventListener('pointerlockchange', onLockChange)
  }, [])

  useEffect(() => {
    if (!entered || isMobile || memoryOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'KeyE' && nearLandmark) {
        setMemoryOpen(true)
        if (document.pointerLockElement) document.exitPointerLock()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [entered, isMobile, memoryOpen, nearLandmark])

  const requestLock = useCallback(() => {
    if (isMobile || memoryOpen) return
    const canvas = document.querySelector('canvas')
    canvas?.requestPointerLock()
  }, [isMobile, memoryOpen])

  const dpr = useMemo(() => Math.min(window.devicePixelRatio, 1.75), [])

  if (!entered) {
    return <Landing onEnter={() => setEntered(true)} />
  }

  return (
    <>
      <Canvas
        shadows
        dpr={dpr}
        camera={{ fov: 60, near: 0.1, far: 80, position: [0, 1.55, 4] }}
        onClick={requestLock}
        style={{ width: '100%', height: '100%', display: 'block', background: '#cfe0ef' }}
      >
        <Suspense fallback={null}>
          <GardenScene nearLandmark={nearLandmark} />
          <Player
            moveRef={moveRef}
            lookDeltaRef={lookDeltaRef}
            pointerLocked={pointerLocked}
            memoryOpen={memoryOpen}
            onNearLandmark={onNearLandmark}
            landmarkPos={SAMPLE_MEMORY.position}
          />
        </Suspense>
      </Canvas>

      <div className="hud">
        {!memoryOpen && (
          <p className="hud__hint">
            {isMobile
              ? 'Walk toward the glowing bench'
              : pointerLocked
                ? 'WASD to walk · E near the bench · Esc to unlock look'
                : 'Click the garden to look around · WASD to walk'}
          </p>
        )}
        {nearLandmark && !memoryOpen && (
          <button
            type="button"
            className="hud__prompt"
            onClick={() => {
              setMemoryOpen(true)
              if (document.pointerLockElement) document.exitPointerLock()
            }}
          >
            {isMobile ? 'Open memory' : 'Press E · Open memory'}
          </button>
        )}
      </div>

      <MobileControls
        moveRef={moveRef}
        lookDeltaRef={lookDeltaRef}
        enabled={isMobile && !memoryOpen}
      />

      {memoryOpen && (
        <MemoryCard memory={SAMPLE_MEMORY} onClose={() => setMemoryOpen(false)} />
      )}
    </>
  )
}
