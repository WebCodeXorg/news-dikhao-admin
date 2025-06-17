import { Metadata } from 'next'
import NewsPageClient from './NewsPageClient'

// This is a server component
export default function NewsArticlePage({ params }: { params: { id: string } }) {
  return <NewsPageClient newsId={params.id} />
}

// Generate metadata for SEO (this must be in a server component)
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  return {
    title: `समाचार - News Dikhao`,
    description: 'टेस्ट पेज',
  }
} 