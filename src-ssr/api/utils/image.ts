import axios from 'axios'
import { isSafeUrl } from '@/utils/image'

export const checkImage = async (link: string) => {
  if (!isSafeUrl(link)) {
    return false
  }

  try {
    const response = await axios.head(link, {
      timeout: 3000,
      maxRedirects: 0,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      validateStatus: (status) => status >= 200 && status < 300,
    })

    const contentType = response.headers?.['content-type']
    return typeof contentType === 'string' && contentType.startsWith('image/')
  } catch {
    return false
  }
}
