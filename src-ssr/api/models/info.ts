import axios from 'axios'
import schedule from 'node-schedule'

export interface IReleaseInfo {
  tag: string
  date: string
}

export interface IRelease {
  win: IReleaseInfo
  ios: IReleaseInfo
  android: IReleaseInfo
  mac: IReleaseInfo
}

export interface IChangelog {
  node_id: string
  published_at: string
  name: string
  tag_name: string
  html_url: string
  body: string
}

export const releases: IRelease = {
  win: {
    tag: '',
    date: '',
  },
  ios: {
    tag: '',
    date: '',
  },
  android: {
    tag: '',
    date: '',
  },
  mac: {
    tag: '',
    date: '',
  },
}

export const changelogs: IChangelog[] = []

const update = async () => {
  if (import.meta.env.QUASAR_DEV && changelogs.length > 0) {
    return
  }

  const [win, ios, mac, android] = await Promise.allSettled([
    axios.get('https://api.github.com/repos/techmania-team/techmania/releases'),
    axios.get('https://api.github.com/repos/rogeraabbccdd/techmania/releases'),
    axios.get('https://api.github.com/repos/fhalfkg/techmania/releases'),
    axios.get('https://api.github.com/repos/rogeraabbccdd/techmania/releases'),
  ])

  if (win.status === 'fulfilled') {
    changelogs.splice(
      0,
      changelogs.length,
      ...win.value.data.map((changelog: IChangelog) => ({
        node_id: changelog.node_id,
        published_at: changelog.published_at,
        name: changelog.name,
        tag_name: changelog.tag_name,
        html_url: changelog.html_url,
        body: changelog.body,
      })),
    )
    releases.win.tag = win.value.data[0].tag_name
    releases.win.date = win.value.data[0].published_at
  }

  if (ios.status === 'fulfilled') {
    releases.ios.tag = ios.value.data[0].tag_name
    releases.ios.date = ios.value.data[0].published_at
  }

  if (mac.status === 'fulfilled') {
    releases.mac.tag = mac.value.data[0].tag_name
    releases.mac.date = mac.value.data[0].published_at
  }

  if (android.status === 'fulfilled') {
    releases.android.tag = android.value.data[0].tag_name
    releases.android.date = android.value.data[0].published_at
  }
}

// Update Every 12 hours
schedule.scheduleJob('0 */12 * * *', update)

// Update immediately on start
update().catch((err) => {
  console.error('Initial update failed:', err)
})
