const MAX_DIMENSION = 1920;
const QUALITY = 0.8;
const JPEG_MIME = "image/jpeg";

export async function compressImage(file: File): Promise<File> {
  if (file.type === "image/heic" || file.type === "image/heif") {
    return file;
  }

  try {
    const bitmap = await createImageBitmap(file);

    let { width, height } = bitmap;

    if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
      const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
      width = Math.round(width * ratio);
      height = Math.round(height * ratio);
    }

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, JPEG_MIME, QUALITY),
    );

    if (!blob) return file;

    const name = file.name.replace(/\.[^.]+$/, "") + ".jpg";
    return new File([blob], name, { type: JPEG_MIME });
  } catch {
    return file;
  }
}
