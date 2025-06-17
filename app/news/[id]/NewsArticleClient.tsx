"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import Header from "@/components/Header"
import BreakingNews from "@/components/BreakingNews"
import Footer from "@/components/Footer"
import { doc, updateDoc, increment } from "firebase/firestore"
import { Loader2, AlertCircle, Calendar, Eye, Clock, ArrowLeft, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getFirebaseDb } from "@/lib/firebase-config"

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

export default function NewsArticleClient({ post }: { post: NewsPost }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formattedContent, setFormattedContent] = useState("")

  useEffect(() => {
    // Format content for proper wrapping
    let content = post.content || ""
    if (!content.includes('<')) {
      content = `<p>${content.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br/>')}</p>`
    }
    setFormattedContent(content)

    // Increment view count
    const incrementViews = async () => {
      try {
        const db = await getFirebaseDb()
        const postRef = doc(db, "posts", post.id)
        await updateDoc(postRef, {
          views: increment(1)
        })
      } catch (err) {
        console.error("Error incrementing view count:", err)
      }
    }
    incrementViews()
  }, [post])

  // Format date
  const formatDate = (timestamp: any) => {
    if (!timestamp) return "अभी"
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
      return date.toLocaleString('hi-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    } catch (err) {
      return "अभी"
    }
  }

  // Handle share
  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: post.title,
          text: post.excerpt,
          url: window.location.href
        })
      } else {
        await navigator.clipboard.writeText(window.location.href)
        alert("लिंक कॉपी किया गया!")
      }
    } catch (err) {
      console.error("Error sharing:", err)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-12">
          <div className="bg-red-50 p-8 rounded-lg shadow-md">
            <div className="flex items-center justify-center text-red-500 mb-4">
              <AlertCircle className="h-12 w-12" />
            </div>
            <p className="text-center text-red-600 font-hindi text-lg">{error}</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <BreakingNews />
      
      <main className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Back button */}
          <div className="p-4 border-b">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              वापस जाएँ
            </Button>
          </div>
          
          {/* Article content */}
          <article className="p-6">
            <h1 className="text-3xl font-bold mb-4 font-hindi">{post.title}</h1>
            
            {/* Meta information */}
            <div className="flex flex-wrap gap-4 mb-6 text-sm text-gray-600">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                {formatDate(post.createdAt)}
              </div>
              <div className="flex items-center">
                <Eye className="h-4 w-4 mr-1" />
                {post.views || 0} बार देखा गया
              </div>
              {post.categoryName && (
                <Badge variant="secondary">
                  {post.categoryName}
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
                className="ml-auto"
              >
                <Share2 className="h-4 w-4 mr-2" />
                शेयर करें
              </Button>
            </div>
            
            {/* Featured image */}
            {post.imageUrl && (
              <div className="relative w-full h-[400px] mb-6">
                <Image
                  src={post.imageUrl}
                  alt={post.title}
                  fill
                  className="object-cover rounded-lg"
                  priority
                />
              </div>
            )}
            
            {/* Article body */}
            <div 
              className="prose prose-lg max-w-none font-hindi"
              dangerouslySetInnerHTML={{ __html: formattedContent }}
            />
          </article>
        </div>
      </main>
      
      <Footer />
    </div>
  )
} 