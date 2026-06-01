import { useEffect, useState } from 'react'

export function getScrollProgress() {
  const height = document.documentElement.scrollHeight - window.innerHeight
  if (height <= 0) return 0
  return Math.min(1, Math.max(0, window.scrollY / height))
}

export function useScrollProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let frame = 0
    const update = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => setProgress(getScrollProgress()))
    }

    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  return progress
}
