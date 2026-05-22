export const ASSET_VERSION = "roach-8dir-size-20260522-0524";

export function assetUrl(path) {
  return `${path}?v=${ASSET_VERSION}`;
}
