export type SceneFocusDetail = {
  id: string
  intensity?: number
}

export const sceneFocusEvent = 'studio:scene-focus'
export const sceneSectionEvent = 'studio:scene-section'

export function emitSceneFocus(id: string, intensity = 1) {
  window.dispatchEvent(new CustomEvent<SceneFocusDetail>(sceneFocusEvent, { detail: { id, intensity } }))
}

export function clearSceneFocus() {
  window.dispatchEvent(new CustomEvent<SceneFocusDetail>(sceneFocusEvent, { detail: { id: 'ambient', intensity: 0 } }))
}

export function emitSceneSection(id: string) {
  window.dispatchEvent(new CustomEvent<string>(sceneSectionEvent, { detail: id }))
}
