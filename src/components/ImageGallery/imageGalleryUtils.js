import {
  IMAGE_GALLERY_MAX_SIZE_BYTES,
  IMAGE_GALLERY_MIME_TYPES,
} from "./imageGalleryConstants";

export function isAllowedImageFile(file) {
  if (!file) return false;
  const type = String(file.type || "").toLowerCase();
  if (IMAGE_GALLERY_MIME_TYPES.includes(type)) return true;
  const name = String(file.name || "").toLowerCase();
  return /\.(jpe?g|png|webp|gif)$/i.test(name);
}

export function validateImageFile(file) {
  if (!file) return "Invalid file.";
  if (!isAllowedImageFile(file)) {
    return "Only JPG, PNG, WEBP, and GIF images are allowed.";
  }
  if (file.size > IMAGE_GALLERY_MAX_SIZE_BYTES) {
    return "Each image must be 5 MB or smaller.";
  }
  return null;
}

export function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function stripExtension(filename) {
  return String(filename || "image").replace(/\.[^.]+$/, "");
}

export function createGalleryItemFromFile(file) {
  const uid = `gallery-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  return {
    uid,
    name: stripExtension(file.name),
    originalName: file.name,
    url: "",
    status: "uploading",
    percent: 0,
  };
}

export function toAntUploadFile(item) {
  return {
    uid: item.uid,
    name: item.name,
    status: item.status,
    percent: item.percent,
    url: item.url || undefined,
  };
}
