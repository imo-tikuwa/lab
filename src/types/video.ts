export interface VideoJsonItem {
  product: string
  title: string
  description?: string
  tags: string[]
  videoPath: string
  thumbnailPath: string
  duration: number
  publishedAt: string
  width: number
  height: number
}

export interface Video {
  product: string
  title: string
  description?: string
  tags: string[]
  videoPath: string
  url: string
  thumbnailUrl: string
  duration: number
  publishedAt: string
  width: number
  height: number
}
