/** Absolute URL of a path on this site, for tags that crawlers read off the page */
export const toAbsoluteUrl = (path: string): string =>
  new URL(path, import.meta.env.QCLI_HOST_URL || '').toString()

/** Shared preview for pages that have no image of their own */
export const DEFAULT_OG_IMAGE = toAbsoluteUrl('/assets/Logo_black.png')
