"use client"

import { useEffect } from 'react'
import { useParams } from 'next/navigation'
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { Loader2 } from "lucide-react"
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
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

export default function NewsArticlePage() {
  const params = useParams()
  const newsId = params?.id

  useEffect(() => {
    // Add console logs to see what's happening
    console.log("Page loaded with news ID:", newsId)
    console.log("Current URL:", window.location.href)
    
    // Log any Firebase initialization status
    try {
      const firebaseStatus = localStorage.getItem('firebase_initialized')
      console.log("Firebase initialization status:", firebaseStatus)
    } catch (err) {
      console.log("Could not check Firebase status:", err)
    }
  }, [newsId])

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          {/* Debug Info */}
          <div className="mb-8 p-4 bg-gray-100 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">डीबग जानकारी:</h2>
            <p className="font-mono text-sm">न्यूज़ ID: {newsId}</p>
            <p className="font-mono text-sm">URL: {typeof window !== 'undefined' ? window.location.href : ''}</p>
          </div>

          {/* Test Content */}
          <h1 className="text-3xl font-bold mb-4 font-hindi">टेस्ट पेज - सभी न्यूज़ के लिए</h1>
          
          <div className="prose prose-lg max-w-none font-hindi space-y-4">
            <p className="text-xl">यह एक टेस्ट पेज है जो हर न्यूज़ ID के लिए दिखेगी।</p>
            <p>अगर आप यह पेज देख रहे हैं, तो पेज लोडिंग सही काम कर रही है।</p>
            <p className="bg-yellow-100 p-4 rounded">
              वर्तमान न्यूज़ ID: <span className="font-bold">{newsId}</span>
            </p>
            
            <div className="mt-8 p-4 border rounded-lg">
              <h3 className="text-lg font-semibold mb-2">सिस्टम स्टेटस:</h3>
              <ul className="list-disc list-inside space-y-2">
                <li>पेज लोड हो गया है ✅</li>
                <li>राउटिंग काम कर रही है ✅</li>
                <li>कंपोनेंट्स रेंडर हो रहे हैं ✅</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
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