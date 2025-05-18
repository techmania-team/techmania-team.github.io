import axios from 'axios'

export const refreshAccessToken = async (req) => {
  const params = new URLSearchParams()
  params.append('client_id', process.env.DISCORD_CLIENT)
  params.append('client_secret', process.env.DISCORD_SECRET)
  params.append('grant_type', 'refresh_token')
  params.append('refresh_token', req.user.refreshToken)
  try {
    const { data } = await axios.post('https://discord.com/api/oauth2/token', params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })
    req.user.accessToken = data.access_token
    req.user.refreshToken = data.refresh_token
  } catch {
    throw new Error('Failed to refresh access token')
  }
}
