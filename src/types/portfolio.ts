export interface PortfolioLink {
  label: string
  url: string
}

export interface PortfolioScreenshot {
  itemImageSrc: string
  thumbnailImageSrc: string
  alt?: string
}

export interface PortfolioItem {
  slug: string
  title: string
  period_from: string
  period_to: string | null
  category: string[]
  stacks: {
    languages: string[]
    frameworks: string[]
    libraries: string[]
    tools: string[]
    others: string[]
  }
  thumbnail: string
  summary: string
  descriptions: string[]
  links?: PortfolioLink[]
  screenshots: PortfolioScreenshot[]
}
