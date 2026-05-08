export function supportsWebGL() {
  try {
    const canvas = document.createElement('canvas')
    return Boolean(canvas.getContext('webgl2') ?? canvas.getContext('webgl'))
  } catch {
    return false
  }
}

export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function getDeviceProfile() {
  const width = window.innerWidth
  const cores = navigator.hardwareConcurrency ?? 4
  const memory = 'deviceMemory' in navigator ? Number(navigator.deviceMemory) : 4
  const mobile = width < 760
  const lowPower = mobile || cores <= 4 || memory <= 4

  return {
    mobile,
    lowPower,
    particleCount: mobile ? 900 : lowPower ? 1500 : 2600,
    dpr: lowPower ? [1, 1.35] : [1, 1.8],
    postprocessing: !lowPower,
  }
}
