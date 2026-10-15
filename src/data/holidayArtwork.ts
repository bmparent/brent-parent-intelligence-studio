// Existing public project assets. Embroidery marks remain separate from the
// illustrated people, with placement in source-image coordinates (never CSS px).
const root = 'https://res.cloudinary.com/dhcmpzn9e/image/upload';
const folder = 'hollywood-studios-shows/holidays-in-hollywood/storefront-assets';
export const holidayAssets = {
  left: `${root}/f_auto,q_auto,w_900/v1786043653/${folder}/hih-hero-cast-left-clean-v3.webp`,
  right: `${root}/f_auto,q_auto,w_900/v1786043657/${folder}/hih-hero-cast-right-clean-v3.webp`,
  jackets: '/images/storefronts/holidays/jackets-clean.webp',
  hoodies: '/images/storefronts/holidays/hoodies-clean.webp',
  headwear: '/images/storefronts/holidays/headwear-clean.webp',
  pants: '/images/storefronts/holidays/pants-clean.webp',
};
const chest = `${root}/f_auto,q_auto/v1786045381/${folder}/hih-official-mark-cast-crew-runtime-v3.webp`;
const cap = `${root}/f_auto,q_auto/v1786045385/${folder}/hih-official-mark-cap-runtime-v3.webp`;
type Mark = { source: string; x: number; y: number; width: number; height: number; angle?: number };
type Composition = { width: number; height: number; marks: Mark[] };
export const holidayCompositions: Record<string, Composition> = {
  [holidayAssets.left]: { width: 1122, height: 1402, marks: [
    { source: chest, x: 355, y: 617, width: 80, height: 75, angle: -8 },
    { source: chest, x: 800, y: 535, width: 98, height: 92, angle: 6 },
  ] },
  [holidayAssets.right]: { width: 1054, height: 1492, marks: [
    { source: chest, x: 398, y: 620, width: 85, height: 80, angle: 8 },
    { source: chest, x: 823, y: 553, width: 96, height: 90, angle: 5 },
    { source: cap, x: 632, y: 169, width: 67, height: 55, angle: -13 },
  ] },
  [holidayAssets.jackets]: { width: 1024, height: 1536, marks: [
    { source: chest, x: 524, y: 350, width: 74, height: 69, angle: 4 },
  ] },
  [holidayAssets.hoodies]: { width: 1024, height: 1536, marks: [
    { source: chest, x: 543, y: 348, width: 74, height: 69, angle: 4 },
  ] },
  [holidayAssets.headwear]: { width: 1024, height: 1536, marks: [
    { source: chest, x: 526, y: 361, width: 68, height: 64, angle: 5 },
    { source: cap, x: 466, y: 62, width: 55, height: 45, angle: -9 },
  ] },
  [holidayAssets.pants]: { width: 1024, height: 1536, marks: [
    { source: chest, x: 555, y: 706, width: 58, height: 54, angle: 3 },
  ] },
};
