import font from './studioFont.json';
export const STUDIO_FONT_FAMILY = 'Eidos Studio DM Sans';
export const studioFontCss = `@font-face{font-family:"${STUDIO_FONT_FAMILY}";src:url(data:font/woff;base64,${font.data}) format("woff");font-style:normal;font-weight:100 1000;font-display:block}`;
export const studioFontLicense = font.license;
export const studioFontSource = font.source;
export const studioFontBytes = () => Uint8Array.from(atob(font.data), c => c.charCodeAt(0));
export const studioEscape = (value: string) => value.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
