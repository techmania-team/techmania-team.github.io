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
