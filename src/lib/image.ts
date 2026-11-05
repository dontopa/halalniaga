/**
 * Compress a photo in the browser before it lands in localStorage.
 *
 * Invoice and halal-stamp photos only need to be readable, not printable, so a
 * 900px JPEG keeps each record well inside the browser storage quota.
 */
export const fileToCompressedDataUrl = async (
  file: File,
  maxSize = 900,
  quality = 0.7,
): Promise<string> => {
  if (!file.type.startsWith('image/')) {
    throw new Error('Unsupported file type');
  }

  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const preview = new Image();
    preview.onload = () => resolve(preview);
    preview.onerror = () => reject(new Error('Could not read image'));
    preview.src = dataUrl;
  });

  const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(image.width * scale);
  canvas.height = Math.round(image.height * scale);

  const context = canvas.getContext('2d');
  if (!context) return dataUrl;

  // White base so transparent PNGs do not turn black as JPEG.
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, 0, 0, canvas.width, canvas.height);

  return canvas.toDataURL('image/jpeg', quality);
};
