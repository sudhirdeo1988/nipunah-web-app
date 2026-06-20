import { IMAGE_GALLERY_STORAGE_PREFIX } from "./imageGalleryConstants";

function storageKey(persistKey) {
  return `${IMAGE_GALLERY_STORAGE_PREFIX}${persistKey}`;
}

/** @returns {Array<{ uid: string, name: string, url: string, status: string }>} */
export function loadGalleryImages(persistKey) {
  if (!persistKey || typeof window === "undefined") return [];
  try {
    const raw = window.sessionStorage.getItem(storageKey(persistKey));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item) => item?.url)
      .map((item) => ({
        uid: item.uid,
        name: item.name || "Image",
        url: item.url,
        status: "done",
        percent: 100,
      }));
  } catch {
    return [];
  }
}

export function saveGalleryImages(persistKey, images) {
  if (!persistKey || typeof window === "undefined") return;
  try {
    const storable = (images || [])
      .filter((item) => item?.status === "done" && item?.url)
      .map(({ uid, name, url }) => ({ uid, name, url }));
    window.sessionStorage.setItem(storageKey(persistKey), JSON.stringify(storable));
  } catch {
    // ignore quota / private mode
  }
}

export function clearGalleryImages(persistKey) {
  if (!persistKey || typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(storageKey(persistKey));
  } catch {
    // ignore
  }
}
