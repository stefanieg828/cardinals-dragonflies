/** Resolve a file from /public against Vite's base (GitHub Pages path). */
export function assetUrl(path: string): string {
  const clean = path.replace(/^\//, '')
  const base = import.meta.env.BASE_URL || '/'
  return `${base}${clean}`
}
