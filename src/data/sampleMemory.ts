export type Memory = {
  id: string
  title: string
  body: string
  /** World-space position of the landmark */
  position: [number, number, number]
}

/** Warm sample memory for the first prototype landmark. */
export const SAMPLE_MEMORY: Memory = {
  id: 'lily-bench',
  title: "Maple's Bench",
  body:
    "Every evening Maple would settle here until the fireflies came out. She'd lean her head on your knee and watch the dragonflies skim the water. A cardinal still visits at dusk — we like to think she's saying hello.",
  position: [0, 0, -8],
}
