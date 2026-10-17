// Phone originals stay on-device. Inspect dimensions before asking a decoder to
// allocate pixels, then keep only a small portable raster in the project.
export const MAX_IMAGE_INPUT_BYTES = 32_000_000;
export const MAX_IMAGE_PIXELS = 64_000_000;
export const MAX_IMAGE_SIDE = 16_384;
export const MAX_IMAGE_DATA_LENGTH = 1_500_000;
const invalid = () => new Error('This image is damaged or unsupported. Choose a PNG, JPEG, or WebP image.');
export function imageDimensions(bytes: Uint8Array): {width: number; height: number; type: string} {
 const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
 const text = (offset: number, length: number) => String.fromCharCode(...bytes.subarray(offset, offset + length));
 const u24 = (offset: number) => bytes[offset] + bytes[offset + 1] * 256 + bytes[offset + 2] * 65536;
 let width = 0, height = 0, type = '';
 if (bytes.length >= 33 && text(0,8) === '\x89PNG\r\n\x1a\n' && view.getUint32(8) === 13 && text(12,4) === 'IHDR') {
  width = view.getUint32(16); height = view.getUint32(20); type = 'image/png';
 } else if (bytes.length >= 4 && bytes[0] === 255 && bytes[1] === 216) {
  type = 'image/jpeg'; let offset = 2;
  while (offset + 3 < bytes.length) {
   if (bytes[offset++] !== 255) throw invalid();
   while (bytes[offset] === 255) offset++;
   const marker = bytes[offset++];
   if (marker === 217 || marker === 218) break;
   if (marker === 1 || (marker >= 208 && marker <= 215)) continue;
   if (offset + 2 > bytes.length) throw invalid();
   const size = view.getUint16(offset);
   if (size < 2 || offset + size > bytes.length) throw invalid();
   if ([192,193,194,195,197,198,199,201,202,203,205,206,207].includes(marker)) {
    if (size < 8) throw invalid();
    height = view.getUint16(offset + 3); width = view.getUint16(offset + 5); break;
   }
   offset += size;
  }
 } else if (bytes.length >= 25 && text(0,4) === 'RIFF' && text(8,4) === 'WEBP') {
  type = 'image/webp'; const kind = text(12,4);
  if (bytes.length >= 30 && kind === 'VP8X' && view.getUint32(16,true) >= 10) {
   width = u24(24) + 1; height = u24(27) + 1;
  } else if (bytes.length >= 30 && kind === 'VP8 ' && text(23,3) === '\x9d\x01\x2a') {
   width = view.getUint16(26,true) & 16383; height = view.getUint16(28,true) & 16383;
  } else if (bytes.length >= 25 && kind === 'VP8L' && bytes[20] === 47) {
   const bits = view.getUint32(21,true); width = (bits & 16383) + 1; height = ((bits >>> 14) & 16383) + 1;
  }
 }
 if (!width || !height) throw invalid();
 if (width > MAX_IMAGE_SIDE || height > MAX_IMAGE_SIDE || width * height > MAX_IMAGE_PIXELS)
  throw Error('This image exceeds 64 megapixels or 16,384 pixels per side. Export a smaller copy and try again.');
 return {width,height,type};
}
export function fittedImageSize(width: number, height: number, longest = 1600) {
 const scale = Math.min(1, longest / Math.max(width,height));
 return {width: Math.max(1,Math.round(width * scale)),height: Math.max(1,Math.round(height * scale))};
}
export async function imageData(file: File): Promise<string> {
 if (/heic|heif/i.test(file.type) || /\.(heic|heif)$/i.test(file.name))
  throw Error('HEIC photos are not supported here yet. Export or share this photo as JPEG or PNG, then choose that copy.');
 if (!file.size || file.size > MAX_IMAGE_INPUT_BYTES)
  throw Error('Choose an image up to 32 MB. Export a smaller copy of this photo and try again.');
 // Do not trust a filename or MIME declaration to approve raster decoding.
 const dimensions = imageDimensions(new Uint8Array(await file.arrayBuffer()));
 let source: ImageBitmap | HTMLImageElement | undefined, url: string | undefined;
 const canvas = document.createElement('canvas');
 try {
  if (typeof createImageBitmap === 'function') {
   try {
    // One resize dimension preserves the EXIF-oriented aspect ratio, including
    // portrait photos whose stored JPEG dimensions are landscape.
    // Small/panoramic logos decode at native size (at most 20 MP), avoiding
    // loss of useful detail from resizing against their short side.
    source = await createImageBitmap(file, {imageOrientation:'from-image', ...((Math.min(dimensions.width,dimensions.height) >= 1600 || dimensions.width * dimensions.height > 20_000_000) ? {resizeWidth: Math.min(1600, dimensions.width, dimensions.height)} : {}), resizeQuality:'high'});
   } catch { /* Older Safari may expose ImageBitmap without resize support. */ }
  }
  if (!source) {
   // Avoid a large full-resolution fallback decode on memory-limited phones.
   if (dimensions.width * dimensions.height > 20_000_000)
    throw Error('This browser could not resize the full-resolution photo. Export a smaller JPEG or PNG copy (under 20 megapixels) and try again.');
   const image = new Image(); url = URL.createObjectURL(file); image.src = url;
   try { await image.decode(); } catch { throw invalid(); }
   source = image;
  }
  const width = source instanceof HTMLImageElement ? source.naturalWidth : source.width;
  const height = source instanceof HTMLImageElement ? source.naturalHeight : source.height;
  if (!width || !height || width * height > MAX_IMAGE_PIXELS) throw invalid();
  const size = fittedImageSize(width,height);
  canvas.width = size.width; canvas.height = size.height;
  const context = canvas.getContext('2d');
  if (!context) throw Error('Image processing is unavailable in this browser.');
  context.imageSmoothingQuality = 'high';
  // WebP retains transparency. A browser without WebP encoding returns PNG;
  // never flatten a transparent logo into JPEG to fit the storage budget.
  for (let attempt = 0; attempt < 6; attempt++) {
   context.drawImage(source,0,0,canvas.width,canvas.height);
   const data = canvas.toDataURL('image/webp', Math.max(.68,.88-attempt*.04));
   if (/^data:image\/(png|webp);base64,/.test(data) && data.length <= MAX_IMAGE_DATA_LENGTH) return data;
   canvas.width = Math.max(1,Math.round(canvas.width*.75));
   canvas.height = Math.max(1,Math.round(canvas.height*.75));
  }
  throw Error('This image could not be made small enough to save. Try a simpler or smaller copy.');
 } finally {
  if (source && 'close' in source) source.close();
  if (url) URL.revokeObjectURL(url);
  canvas.width = canvas.height = 1;
 }
}
