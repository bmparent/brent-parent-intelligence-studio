import {createProject,validateProject,type Project} from './model';
const reference = createProject().glass;
export const effectPresets = {
  'Approved Eidos header': reference,
  'Soft frost': {...reference, frost: 12, edge: .22, prism: .04, radius: 24},
  'Prism light': {...reference, frost: 3, edge: .65, prism: .55, radius: 18},
  'Quiet surface': {...reference, frost: 5, edge: .08, prism: 0, radius: 8},
};
export function applyEffectPreset(project: Project, name: keyof typeof effectPresets): Project {
  return validateProject({...project, glass: {...effectPresets[name]}});
}
