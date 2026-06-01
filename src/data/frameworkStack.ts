export type FrameworkStackItem = {
  name: string
  role: string
  status: 'active' | 'ready' | 'future'
}

export type FrameworkStackLayer = {
  layer: string
  items: FrameworkStackItem[]
}

export const frameworkStack: FrameworkStackLayer[] = [
  {
    layer: 'Core App',
    items: [
      { name: 'Vite + TypeScript', role: 'Build system and app foundation', status: 'active' },
      { name: 'React', role: 'Interface and component layer', status: 'active' },
      { name: 'HTML / CSS', role: 'Accessible structure and glass design system', status: 'active' },
    ],
  },
  {
    layer: 'Motion',
    items: [{ name: 'GSAP ScrollTrigger', role: 'Scroll choreography and reveal timing', status: 'active' }],
  },
  {
    layer: '3D Engine',
    items: [
      { name: 'Babylon.js', role: 'Primary atmospheric scene layer', status: 'active' },
      { name: 'Babylon WebGPU', role: 'Preferred renderer where browser support is available', status: 'ready' },
      { name: 'Babylon WebGL', role: 'Reliable fallback renderer for broad device support', status: 'active' },
    ],
  },
  {
    layer: 'Physics',
    items: [
      { name: 'Havok', role: 'Babylon physics option for real interactions', status: 'future' },
      { name: 'Rapier', role: 'Deterministic WASM physics alternative', status: 'future' },
    ],
  },
  {
    layer: 'Media',
    items: [
      { name: 'Cloudinary', role: 'Image, texture, and responsive media pipeline', status: 'active' },
      { name: 'Spline', role: '3D layout and scene prototyping workflow', status: 'future' },
      { name: 'Rive', role: 'Lightweight animated UI indicators', status: 'future' },
    ],
  },
  {
    layer: 'Future Shell',
    items: [{ name: 'Astro', role: 'Static-first shell and island hydration option', status: 'future' }],
  },
]
