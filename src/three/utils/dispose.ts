import type { Material, Object3D } from 'three'

type Disposable = {
  dispose?: () => void
}

export function disposeObject(object: Object3D) {
  object.traverse((child) => {
    const maybeGeometry = child as Object3D & { geometry?: Disposable }
    maybeGeometry.geometry?.dispose?.()

    const maybeMaterial = child as Object3D & { material?: Material | Material[] }
    const materials = Array.isArray(maybeMaterial.material)
      ? maybeMaterial.material
      : maybeMaterial.material
        ? [maybeMaterial.material]
        : []

    materials.forEach((material) => material.dispose())
  })
}
