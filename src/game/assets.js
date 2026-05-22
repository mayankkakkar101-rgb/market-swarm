export const ASSET_VERSION = "pappu-audio-20260522-1825";

export function assetUrl(path) {
  const base = import.meta.env.BASE_URL || "/";
  const cleanBase = base.endsWith("/") ? base : `${base}/`;
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  return `${cleanBase}${cleanPath}?v=${ASSET_VERSION}`;
}
