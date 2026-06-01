import type { AbstractEngine } from '@babylonjs/core/Engines/abstractEngine'
import { Scene } from '@babylonjs/core/scene'
import { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera'
import { Color3, Color4 } from '@babylonjs/core/Maths/math.color'
import { GlowLayer } from '@babylonjs/core/Layers/glowLayer'
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight'
import { Matrix, Vector3 } from '@babylonjs/core/Maths/math.vector'
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder'
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial'
import { TransformNode } from '@babylonjs/core/Meshes/transformNode'
import type { DeviceProfile } from './utils/performance'

export type GlassStudioSceneState = {
  scroll: number
  focus: number
  section: string
}

export type GlassStudioSceneController = {
  scene: Scene
  update: (state: GlassStudioSceneState) => void
  resize: () => void
  dispose: () => void
}

const sectionTargets: Record<string, { alpha: number; beta: number; radius: number; target: Vector3; core: Vector3 }> = {
  hero: { alpha: -Math.PI / 2.8, beta: 1.38, radius: 7.4, target: new Vector3(0.2, 0, -1.1), core: new Vector3(1.05, 0.05, -0.7) },
  capabilities: { alpha: -Math.PI / 2.25, beta: 1.27, radius: 6.4, target: new Vector3(0, 0, -0.9), core: new Vector3(0.2, 0.12, -0.5) },
  services: { alpha: -Math.PI / 2.05, beta: 1.34, radius: 6.8, target: new Vector3(0.6, -0.1, -1), core: new Vector3(0.75, -0.05, -0.7) },
  'case-studies': { alpha: -Math.PI / 1.85, beta: 1.22, radius: 6.3, target: new Vector3(-0.15, 0.05, -0.8), core: new Vector3(-0.35, 0.12, -0.75) },
  eidos: { alpha: -Math.PI / 2.45, beta: 1.16, radius: 5.2, target: new Vector3(0.25, 0.02, -0.9), core: new Vector3(0.35, 0, -0.45) },
  pricing: { alpha: -Math.PI / 1.95, beta: 1.42, radius: 6.5, target: new Vector3(0.1, -0.18, -1.1), core: new Vector3(0.2, -0.08, -0.8) },
  cta: { alpha: -Math.PI / 2.35, beta: 1.32, radius: 6.9, target: new Vector3(0, 0, -1.3), core: new Vector3(0, -0.08, -0.65) },
}

function makeMaterial(scene: Scene, name: string, color: string, alpha = 1) {
  const material = new StandardMaterial(name, scene)
  material.emissiveColor = Color3.FromHexString(color)
  material.diffuseColor = Color3.FromHexString(color).scale(0.35)
  material.specularColor = Color3.White().scale(0.18)
  material.alpha = alpha
  return material
}

function seeded(index: number, salt: number) {
  return Math.abs((Math.sin(index * 91.7 + salt * 43.3) * 10000) % 1)
}

function lerp(current: number, target: number, speed: number) {
  return current + (target - current) * speed
}

export function createGlassStudioScene(
  engine: AbstractEngine,
  canvas: HTMLCanvasElement,
  profile: DeviceProfile,
): GlassStudioSceneController {
  const scene = new Scene(engine)
  scene.clearColor = new Color4(0.02, 0.027, 0.05, 0)
  scene.autoClear = true
  scene.autoClearDepthAndStencil = true

  const camera = new ArcRotateCamera('glassStudioCamera', -Math.PI / 2.8, 1.36, 7.2, new Vector3(0, 0, -1), scene)
  camera.attachControl(canvas, false)
  camera.inputs.clear()
  camera.minZ = 0.05
  camera.maxZ = 80
  camera.fov = 0.78

  const light = new HemisphericLight('softSignalLight', new Vector3(0.2, 1, -0.4), scene)
  light.intensity = 0.82
  light.diffuse = new Color3(0.55, 0.82, 1)
  light.groundColor = new Color3(0.08, 0.04, 0.18)

  const glow = new GlowLayer('signalGlow', scene, { blurKernelSize: profile.lowPower ? 24 : 42 })
  glow.intensity = profile.lowPower ? 0.34 : 0.52

  const root = new TransformNode('glassStudioRoot', scene)
  const signalRoot = new TransformNode('signalFieldRoot', scene)
  const graphRoot = new TransformNode('businessSignalRouter', scene)
  const ribbonRoot = new TransformNode('workflowRibbons', scene)
  const incidentRoot = new TransformNode('incidentAssembler', scene)
  signalRoot.parent = root
  graphRoot.parent = root
  ribbonRoot.parent = root
  incidentRoot.parent = root

  const cyan = makeMaterial(scene, 'cyanSignalMaterial', '#65f3ff', 0.78)
  const violet = makeMaterial(scene, 'violetMemoryMaterial', '#9f8cff', 0.72)
  const amber = makeMaterial(scene, 'amberAnomalyMaterial', '#ffcc66', 0.72)
  const green = makeMaterial(scene, 'greenSystemMaterial', '#7dffa7', 0.72)
  const white = makeMaterial(scene, 'reviewMaterial', '#f5f7fb', 0.68)

  const coreMaterial = makeMaterial(scene, 'eidosCoreMaterial', '#74d7ff', 0.42)
  coreMaterial.wireframe = false
  const core = MeshBuilder.CreateIcoSphere('babylonEidosCore', { radius: 0.86, subdivisions: profile.lowPower ? 3 : 5 }, scene)
  core.material = coreMaterial
  core.parent = root

  const coreWire = MeshBuilder.CreateIcoSphere('babylonEidosCoreWire', { radius: 0.94, subdivisions: 2 }, scene)
  const wireMaterial = makeMaterial(scene, 'eidosCoreWireMaterial', '#65f3ff', 0.18)
  wireMaterial.wireframe = true
  coreWire.material = wireMaterial
  coreWire.parent = core

  const rings = Array.from({ length: profile.lowPower ? 3 : 5 }, (_, index) => {
    const ring = MeshBuilder.CreateTorus(`memoryRing${index}`, {
      diameter: 1.85 + index * 0.35,
      thickness: 0.006 + index * 0.001,
      tessellation: 96,
    }, scene)
    ring.material = index % 2 === 0 ? violet : cyan
    ring.parent = core
    ring.rotation.x = Math.PI / 2 + index * 0.28
    ring.rotation.y = index * 0.38
    return ring
  })

  const particleMesh = MeshBuilder.CreateSphere('signalParticleSource', { diameter: 0.024, segments: 4 }, scene)
  particleMesh.material = cyan
  particleMesh.parent = signalRoot
  particleMesh.isVisible = true
  const particleCount = profile.particleCount
  const particleSeeds = Array.from({ length: particleCount }, (_, index) => ({
    x: (seeded(index, 0.1) - 0.5) * 12,
    y: (seeded(index, 0.2) - 0.5) * 5.4,
    z: (seeded(index, 0.3) - 0.5) * 5.6 - 1.4,
    speed: 0.16 + seeded(index, 0.4) * 0.36,
    orbit: seeded(index, 0.5) * Math.PI * 2,
  }))
  const particleMatrices = new Float32Array(particleCount * 16)
  particleMesh.thinInstanceSetBuffer('matrix', particleMatrices, 16, true)

  const graphNodes = [
    { id: 'storefronts', label: 'Storefronts', position: new Vector3(-3.1, 1.25, 0.1), material: green },
    { id: 'orders', label: 'Orders', position: new Vector3(-2.7, -0.55, -0.25), material: amber },
    { id: 'documents', label: 'Docs/SOPs', position: new Vector3(-1.9, 0.55, 1.1), material: cyan },
    { id: 'automation', label: 'Automation', position: new Vector3(-0.5, 0.9, 0), material: cyan },
    { id: 'memory', label: 'Memory', position: new Vector3(0.35, -0.6, 0.55), material: violet },
    { id: 'forecasting', label: 'Forecasting', position: new Vector3(1.35, 0.55, -0.18), material: amber },
    { id: 'review', label: 'Human Review', position: new Vector3(2.35, -0.65, 0.35), material: white },
    { id: 'dashboards', label: 'Dashboards', position: new Vector3(3, 1, -0.42), material: green },
  ]
  const graphMeshes = graphNodes.map((node, index) => {
    const mesh = MeshBuilder.CreateSphere(node.id, { diameter: 0.13 + index * 0.004, segments: 12 }, scene)
    mesh.position.copyFrom(node.position)
    mesh.material = node.material
    mesh.parent = graphRoot
    return mesh
  })

  const graphLinks = [
    ['storefronts', 'automation'], ['orders', 'automation'], ['documents', 'memory'], ['automation', 'memory'],
    ['memory', 'forecasting'], ['forecasting', 'review'], ['automation', 'dashboards'], ['review', 'dashboards'],
  ]
  graphLinks.forEach(([from, to]) => {
    const start = graphNodes.find((node) => node.id === from)?.position ?? Vector3.Zero()
    const end = graphNodes.find((node) => node.id === to)?.position ?? Vector3.Zero()
    const line = MeshBuilder.CreateLines(`${from}-${to}`, { points: [start, end] }, scene)
    line.color = Color3.FromHexString('#65f3ff')
    line.alpha = 0.28
    line.parent = graphRoot
  })

  const ribbons = ['#65f3ff', '#9f8cff', '#ffcc66', '#7dffa7'].map((color, index) => {
    const offset = index - 1.5
    const points = Array.from({ length: 72 }, (_, pointIndex) => {
      const t = pointIndex / 71
      return new Vector3(
        -5.4 + t * 10.8,
        Math.sin(t * Math.PI * 2.2 + offset) * 0.52 + offset * 0.18,
        -2.3 + Math.sin(t * Math.PI + index) * 1.15,
      )
    })
    const tube = MeshBuilder.CreateTube(`workflowRibbon${index}`, {
      path: points,
      radius: 0.012 + index * 0.003,
      tessellation: 6,
      updatable: false,
    }, scene)
    tube.material = makeMaterial(scene, `workflowRibbonMaterial${index}`, color, 0.32)
    tube.parent = ribbonRoot
    return tube
  })

  const incidentFragments = Array.from({ length: profile.lowPower ? 10 : 16 }, (_, index) => {
    const mesh = MeshBuilder.CreateBox(`incidentFragment${index}`, { width: 0.34, height: 0.075, depth: 0.015 }, scene)
    mesh.material = index % 5 === 0 ? amber : cyan
    mesh.parent = incidentRoot
    return mesh
  })

  incidentRoot.position.set(1.65, -0.35, 0.1)
  graphRoot.position.z = -1.6
  ribbonRoot.position.z = -1.3
  signalRoot.position.z = -1

  let time = 0
  const matrix = Matrix.Identity()

  const update = (state: GlassStudioSceneState) => {
    time += scene.getEngine().getDeltaTime() / 1000
    const target = sectionTargets[state.section] ?? sectionTargets.hero
    camera.alpha = lerp(camera.alpha, target.alpha + Math.sin(state.scroll * Math.PI * 1.4) * 0.08, 0.035)
    camera.beta = lerp(camera.beta, target.beta, 0.035)
    camera.radius = lerp(camera.radius, target.radius, 0.035)
    camera.target = Vector3.Lerp(camera.target, target.target, 0.045)

    root.rotation.y = Math.sin(time * 0.12) * 0.08 + state.scroll * 0.28
    root.position.z = -0.1 - state.scroll * 0.8

    core.position = Vector3.Lerp(core.position, target.core, 0.05)
    core.rotation.y += 0.0035 + state.focus * 0.0015
    core.rotation.z = Math.sin(time * 0.2) * 0.12
    const coreScale = 1 + state.focus * 0.08 + (state.section === 'eidos' ? 0.18 : 0)
    core.scaling.setAll(lerp(core.scaling.x, coreScale, 0.06))
    coreMaterial.alpha = lerp(coreMaterial.alpha, state.section === 'eidos' ? 0.58 : 0.38 + state.focus * 0.12, 0.04)
    glow.intensity = lerp(glow.intensity, (profile.lowPower ? 0.28 : 0.44) + state.focus * 0.22 + (state.section === 'eidos' ? 0.18 : 0), 0.05)

    rings.forEach((ring, index) => {
      ring.rotation.z += 0.002 * (index + 1)
      ring.rotation.y += 0.0015 + state.scroll * 0.0005
    })

    particleSeeds.forEach((seed, index) => {
      const drift = time * seed.speed + state.scroll * 4
      Matrix.TranslationToRef(
        seed.x + Math.sin(drift + seed.orbit) * 0.22,
        seed.y + Math.cos(drift * 0.7 + seed.orbit) * 0.16,
        seed.z + Math.sin(drift * 0.45) * 0.2,
        matrix,
      )
      matrix.copyToArray(particleMatrices, index * 16)
    })
    particleMesh.thinInstanceBufferUpdated('matrix')

    const graphActive = state.section === 'capabilities' || state.section === 'services' || state.section === 'eidos'
    graphRoot.scaling.setAll(lerp(graphRoot.scaling.x, graphActive ? 1.05 : 0.84, 0.04))
    graphRoot.rotation.y = Math.sin(time * 0.18) * 0.12 + state.scroll * 0.35
    graphRoot.setEnabled(graphActive || state.focus > 0.25)
    graphMeshes.forEach((mesh, index) => {
      const pulse = 1 + Math.sin(time * 1.4 + index) * 0.08 + state.focus * 0.06
      mesh.scaling.setAll(pulse)
    })

    ribbonRoot.rotation.y = Math.sin(time * 0.09) * 0.08
    ribbonRoot.position.y = Math.sin(time * 0.18) * 0.08
    ribbons.forEach((ribbon, index) => {
      ribbon.rotation.z = Math.sin(time * 0.18 + index) * 0.035
      ribbon.visibility = lerp(ribbon.visibility, state.section === 'services' ? 0.85 : 0.44 + state.focus * 0.25, 0.06)
    })

    const incidentActive = state.section === 'eidos' || state.section === 'case-studies' || state.focus > 0.4
    incidentRoot.setEnabled(incidentActive)
    incidentRoot.rotation.y = -0.18 + Math.sin(time * 0.24) * 0.08
    incidentRoot.scaling.setAll(lerp(incidentRoot.scaling.x, incidentActive ? 0.95 + state.focus * 0.08 : 0.65, 0.06))
    incidentFragments.forEach((fragment, index) => {
      const column = index % 4
      const row = Math.floor(index / 4)
      const scatter = incidentActive ? 0.06 : 0.7
      fragment.position.set(
        -0.72 + column * 0.48 + (seeded(index, 0.2) - 0.5) * scatter,
        0.46 - row * 0.28 + (seeded(index, 0.5) - 0.5) * scatter,
        (seeded(index, 0.8) - 0.5) * scatter,
      )
      fragment.rotation.z = Math.sin(time * 0.4 + index) * 0.08
    })
  }

  return {
    scene,
    update,
    resize: () => engine.resize(),
    dispose: () => {
      glow.dispose()
      scene.dispose()
      engine.dispose()
    },
  }
}
