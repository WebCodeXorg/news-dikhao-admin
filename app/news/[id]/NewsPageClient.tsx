"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { getFirebaseDb, getInitializationStatus } from "@/lib/firebase-config"
import { doc, getDoc, updateDoc, increment } from "firebase/firestore"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, Eye, Share2, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface NewsPageClientProps {
  id: string
}

export default function NewsPageClient({ id }: NewsPageClientProps) {
  const [news, setNews] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true)
        
        // Check Firebase initialization
        const { isInitialized, error: initError } = getInitializationStatus()
        if (!isInitialized) {
          console.error("Firebase not initialized:", initError)
          setError("सर्वर से कनेक्ट करने में समस्या हुई")
          return
        }

        const db = await getFirebaseDb()
        const newsRef = doc(db, "posts", id)
        const newsDoc = await getDoc(newsRef)

        if (!newsDoc.exists()) {
          setError("समाचार नहीं मिला")
          return
        }

        const newsData = newsDoc.data()
        setNews(newsData)

        // Increment view count
        await updateDoc(newsRef, {
          views: increment(1)
        }).catch(err => console.error("Error updating view count:", err))

      } catch (err) {
        console.error("Error fetching news:", err)
        setError("समाचार लोड करने में समस्या हुई")
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchNews()
    }
  }, [id])

  const handleShare = async () => {
    const shareUrl = window.location.href
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: news?.title,
          text: news?.excerpt,
          url: shareUrl
        })
      } catch (err) {
        console.error("Error sharing:", err)
      }
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(shareUrl)
      alert("लिंक कॉपी किया गया")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-center">
          <div className="h-8 w-64 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 w-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-red-600 mb-4 font-hindi">{error}</h2>
        <Link href="/">
          <Button variant="outline" className="font-hindi">
            <ArrowLeft className="w-4 h-4 mr-2" />
            होम पेज पर वापस जाएं
          </Button>
        </Link>
      </div>
    )
  }

  if (!news) return null

  return (
    <article className="max-w-4xl mx-auto px-4 py-8">
      {/* Back Button */}
      <div className="mb-8">
        <Link href="/">
          <Button variant="ghost" className="font-hindi">
            <ArrowLeft className="w-4 h-4 mr-2" />
            वापस जाएं
          </Button>
        </Link>
      </div>

      {/* Category Badge */}
      <Badge className="mb-4 bg-black text-white hover:bg-gray-800">
        {news.category || "समाचार"}
      </Badge>

      {/* Title */}
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 font-hindi leading-tight">
        {news.title}
      </h1>

      {/* Meta Information */}
      <div className="flex items-center space-x-4 mb-6 text-sm text-gray-600">
        <div className="flex items-center">
          <Clock className="w-4 h-4 mr-1" />
          <time className="font-hindi">
            {news.createdAt?.toDate?.() 
              ? new Date(news.createdAt.toDate()).toLocaleString('hi-IN', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })
              : "अभी"}
          </time>
        </div>
        <div className="flex items-center">
          <Eye className="w-4 h-4 mr-1" />
          <span>{news.views || 0} बार देखा गया</span>
        </div>
        <Button variant="ghost" size="sm" onClick={handleShare}>
          <Share2 className="w-4 h-4 mr-1" />
          शेयर करें
        </Button>
      </div>

      {/* Featured Image */}
      {news.imageUrl && (
        <div className="relative w-full h-[400px] mb-8 rounded-xl overflow-hidden">
          <Image
            src={news.imageUrl}
            alt={news.title}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      {/* Content */}
      <div className="prose prose-lg max-w-none font-hindi px-4 md:px-0">
        {/* Excerpt */}
        <p className="text-base md:text-xl text-gray-600 mb-6 md:mb-8 leading-relaxed break-words whitespace-pre-wrap">
          {news.excerpt}
        </p>

        {/* Main Content */}
        <div className="text-gray-800 leading-relaxed space-y-4 md:space-y-6 overflow-x-hidden">
          <div className="prose-headings:font-bold prose-headings:text-gray-900 prose-headings:break-words
                        prose-p:text-sm md:prose-p:text-base prose-p:text-gray-800 prose-p:leading-relaxed prose-p:break-words prose-p:whitespace-pre-wrap
                        prose-a:text-blue-600 prose-a:break-words prose-a:hover:underline
                        prose-strong:font-semibold prose-strong:text-gray-900
                        prose-ul:list-disc prose-ul:pl-4 md:prose-ul:pl-6 prose-ul:space-y-2
                        prose-ol:list-decimal prose-ol:pl-4 md:prose-ol:pl-6 prose-ol:space-y-2
                        prose-li:text-gray-800 prose-li:break-words
                        prose-blockquote:border-l-4 prose-blockquote:border-gray-300 prose-blockquote:pl-4 prose-blockquote:italic
                        prose-img:rounded-lg prose-img:max-w-full prose-img:h-auto prose-img:my-4"
            dangerouslySetInnerHTML={{ __html: news.content || "" }}>
          </div>
        </div>
      </div>
    </article>
  )
} 