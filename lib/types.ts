export interface Post {
  id?: string
  title: string
  content: string
  excerpt: string
  category: string
  categoryName?: string
  categorySlug?: string
  tags: string[]
  status: 'published' | 'draft'
  isBreaking: boolean
  addToSlider?: boolean
  imageUrl?: string
  createdAt?: any
  updatedAt?: any
  author: string
  views: number
  language: 'hindi' | 'english'
} 