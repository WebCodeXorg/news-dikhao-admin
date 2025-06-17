import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import NewsArticleClient from './NewsArticleClient'
import { getFirebaseDb } from "@/lib/firebase-config"
import { doc, getDoc } from "firebase/firestore"

interface NewsPost {
  id: string
  title: string
  content: string
  excerpt: string
  category: string
  categoryName: string
  tags: string[]
  imageUrl: string
  createdAt: any
  updatedAt: any
  author: string
  views: number
  language: string
  isBreaking: boolean
}

// This runs on the server
async function getPost(postId: string): Promise<NewsPost | null> {
  if (!postId) return null
  
  try {
    console.log("Server: Fetching post", postId)
    const db = await getFirebaseDb()
    const postRef = doc(db, "posts", postId)
    const postSnap = await getDoc(postRef)
    
    if (!postSnap.exists()) {
      console.log("Server: Post not found")
      return null
    }

    const postData = postSnap.data() as Omit<NewsPost, 'id'>
    
    // Validate required fields
    const requiredFields = ['title', 'content', 'category', 'imageUrl', 'createdAt'] as const
    const missingFields = requiredFields.filter(field => !postData[field])
    
    if (missingFields.length > 0) {
      console.error("Server: Post is missing required fields:", missingFields)
      return null
    }

    console.log("Server: Post found and validated")
    return {
      ...postData,
      id: postSnap.id,
    } as NewsPost
  } catch (error) {
    console.error("Server: Error fetching post:", error)
    return null
  }
}

export default async function NewsArticlePage({ params }: { params: { id: string } }) {
  const post = await getPost(params.id)
  
  if (!post) {
    console.log("Server: Redirecting to not-found")
    notFound()
  }

  return <NewsArticleClient post={post} />
}

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const post = await getPost(params.id)
  
  if (!post) {
    return {
      title: 'समाचार नहीं मिला - News Dikhao',
    }
  }

  return {
    title: `${post.title} - News Dikhao`,
    description: post.excerpt || post.content?.substring(0, 160),
    openGraph: {
      title: post.title,
      description: post.excerpt || post.content?.substring(0, 160),
      images: [post.imageUrl],
    },
  }
} 