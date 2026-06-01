export function supportsBabylonScene() {
  try {
    const canvas = document.createElement('canvas')
    return Boolean(navigator.gpu ?? canvas.getContext('webgl2') ?? canvas.getContext('webgl'))
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
    particleCount: mobile ? 420 : lowPower ? 720 : 1100,
    dpr: lowPower ? 1.15 : 1.6,
    antialias: !lowPower,
  }
}

export type DeviceProfile = ReturnType<typeof getDeviceProfile>
