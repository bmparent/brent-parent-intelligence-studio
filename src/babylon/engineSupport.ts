import { Engine } from '@babylonjs/core/Engines/engine'
import type { AbstractEngine } from '@babylonjs/core/Engines/abstractEngine'
import type { DeviceProfile } from './utils/performance'

export type BabylonEngineMode = 'webgpu' | 'webgl'

export async function createBabylonEngine(
  canvas: HTMLCanvasElement,
  profile: DeviceProfile,
  preserveDrawingBuffer: boolean,
): Promise<{ engine: AbstractEngine; mode: BabylonEngineMode }> {
  if (navigator.gpu && !profile.lowPower) {
    try {
      const { WebGPUEngine } = await import('@babylonjs/core/Engines/webgpuEngine')
      const engine = new WebGPUEngine(canvas, {
        adaptToDeviceRatio: false,
        antialias: profile.antialias,
      })
      await engine.initAsync()
      engine.setHardwareScalingLevel(1 / profile.dpr)
      return { engine, mode: 'webgpu' }
    } catch (error) {
      console.info('Babylon WebGPU unavailable; falling back to WebGL.', error)
    }
  }

  const engine = new Engine(
    canvas,
    profile.antialias,
    {
      alpha: true,
      antialias: profile.antialias,
      preserveDrawingBuffer,
      powerPreference: profile.lowPower ? 'low-power' : 'high-performance',
      stencil: false,
    },
    true,
  )
  engine.setHardwareScalingLevel(1 / profile.dpr)
  return { engine, mode: 'webgl' }
}
