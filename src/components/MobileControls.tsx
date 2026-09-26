import { useRef } from 'react'
import type { MutableRefObject } from 'react'

export type MoveInput = { x: number; z: number }

type MobileControlsProps = {
  moveRef: MutableRefObject<MoveInput>
  lookDeltaRef: MutableRefObject<{ dx: number; dy: number }>
  enabled: boolean
}

export function MobileControls({
  moveRef,
  lookDeltaRef,
  enabled,
}: MobileControlsProps) {
  const stickRef = useRef<HTMLDivElement>(null)
  const knobRef = useRef<HTMLDivElement>(null)
  const activeTouch = useRef<number | null>(null)
  const lookTouch = useRef<number | null>(null)
  const lastLook = useRef<{ x: number; y: number } | null>(null)

  if (!enabled) return null

  const setKnob = (nx: number, ny: number) => {
    const knob = knobRef.current
    if (!knob) return
    const max = 36
    knob.style.transform = `translate(calc(-50% + ${nx * max}px), calc(-50% + ${ny * max}px))`
  }

  const onStickStart = (e: React.TouchEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const t = e.changedTouches[0]
    activeTouch.current = t.identifier
    updateStick(t.clientX, t.clientY)
  }

  const updateStick = (clientX: number, clientY: number) => {
    const el = stickRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    let dx = (clientX - cx) / (rect.width / 2)
    let dy = (clientY - cy) / (rect.height / 2)
    const len = Math.hypot(dx, dy) || 1
    if (len > 1) {
      dx /= len
      dy /= len
    }
    moveRef.current = { x: dx, z: dy }
    setKnob(dx, dy)
  }

  const onStickMove = (e: React.TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const t = e.changedTouches[i]
      if (t.identifier === activeTouch.current) {
        e.preventDefault()
        updateStick(t.clientX, t.clientY)
      }
    }
  }

  const onStickEnd = (e: React.TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === activeTouch.current) {
        activeTouch.current = null
        moveRef.current = { x: 0, z: 0 }
        setKnob(0, 0)
      }
    }
  }

  const onLookStart = (e: React.TouchEvent) => {
    // Ignore touches that begin on the stick
    const stick = stickRef.current
    if (stick) {
      const r = stick.getBoundingClientRect()
      const t = e.changedTouches[0]
      if (
        t.clientX >= r.left &&
        t.clientX <= r.right &&
        t.clientY >= r.top &&
        t.clientY <= r.bottom
      ) {
        return
      }
    }
    const t = e.changedTouches[0]
    lookTouch.current = t.identifier
    lastLook.current = { x: t.clientX, y: t.clientY }
  }

  const onLookMove = (e: React.TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const t = e.changedTouches[i]
      if (t.identifier === lookTouch.current && lastLook.current) {
        const dx = t.clientX - lastLook.current.x
        const dy = t.clientY - lastLook.current.y
        lookDeltaRef.current.dx += dx
        lookDeltaRef.current.dy += dy
        lastLook.current = { x: t.clientX, y: t.clientY }
      }
    }
  }

  const onLookEnd = (e: React.TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === lookTouch.current) {
        lookTouch.current = null
        lastLook.current = null
      }
    }
  }

  return (
    <div
      className="mobile-controls"
      onTouchStart={onLookStart}
      onTouchMove={onLookMove}
      onTouchEnd={onLookEnd}
      onTouchCancel={onLookEnd}
      style={{ pointerEvents: 'auto' }}
    >
      <div
        ref={stickRef}
        className="mobile-controls__stick"
        onTouchStart={onStickStart}
        onTouchMove={onStickMove}
        onTouchEnd={onStickEnd}
        onTouchCancel={onStickEnd}
      >
        <div ref={knobRef} className="mobile-controls__knob" />
      </div>
      <p className="mobile-controls__look-hint">Drag elsewhere to look</p>
    </div>
  )
}
