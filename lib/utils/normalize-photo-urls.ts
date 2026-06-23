export function normalizePhotoUrls(
  photoUrls: unknown,
  coverPhoto: string | null,
): string[] {
  if (Array.isArray(photoUrls) && photoUrls.length > 0) {
    return photoUrls.filter(
      (u): u is string => typeof u === "string" && u.length > 0,
    );
  }

  if (typeof photoUrls === "string" && photoUrls.length > 0) {
    if (photoUrls.startsWith("{") && photoUrls.endsWith("}")) {
      const inner = photoUrls.slice(1, -1);
      if (!inner) return coverPhoto ? [coverPhoto] : [];
      return inner
        .split(",")
        .map((s) => s.trim().replace(/^"|"$/g, ""))
        .filter(Boolean);
    }
    try {
      const parsed = JSON.parse(photoUrls);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return [photoUrls];
    }
  }

  return coverPhoto ? [coverPhoto] : [];
}
