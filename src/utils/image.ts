export const isSafeUrl = (link: string) => {
  const parsed = new URL(link)
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return false
  }

  const hostname = parsed.hostname.toLowerCase()

  if (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '::1' ||
    hostname.startsWith('192.168.') ||
    hostname.startsWith('10.') ||
    hostname.endsWith('.local')
  ) {
    return false
  }

  return true
}

export const toImageProxyUrl = (type: 'patterns' | 'skins' | 'setlists', id: string): string => {
  const base = import.meta.env.QCLI_HOST_URL || ''
  console.log(new URL(`/api/${type}/${id}/image`, base).toString())
  return new URL(`/api/${type}/${id}/image`, base).toString()
}
