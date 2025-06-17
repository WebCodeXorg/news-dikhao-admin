"use client"

import { useEffect, useState } from 'react'
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { Badge } from "@/components/ui/badge"
import { Clock, Eye, Share2 } from "lucide-react"
import { getPostById, Post } from '@/lib/firebase-posts'

export default function NewsPageClient({ newsId }: { newsId: string }) {
  const [news, setNews] = useState<Post | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchNewsData() {
      try {
        console.log("Fetching news with ID:", newsId);
        setLoading(true)
        setError(null)
        
        const post = await getPostById(newsId);
        console.log("Fetched post:", post);
        
        if (!post) {
          console.log("Post not found");
          setError("न्यूज़ नहीं मिली")
          return
        }
        
        setNews(post)
      } catch (err) {
        console.error("Error details:", err)
        setError("न्यूज़ लोड करने में समस्या आई है")
      } finally {
        setLoading(false)
      }
    }

    fetchNewsData()
  }, [newsId])

  // Format date
  const formatDate = (date: any) => {
    if (!date) return "";
    const d = new Date(date.seconds * 1000);
    return d.toLocaleDateString('hi-IN', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Debug render
  console.log("Current state:", { loading, error, news });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          {loading ? (
            <div className="text-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-4 font-hindi">लोड हो रहा है...</p>
            </div>
          ) : error ? (
            <div className="text-center py-10">
              <div className="text-red-600 font-hindi text-lg">{error}</div>
              <p className="mt-4 text-gray-600 font-hindi">कृपया पुनः प्रयास करें</p>
            </div>
          ) : news ? (
            <article className="prose prose-lg max-w-none font-hindi">
              {/* Category and Meta Info */}
              <div className="flex items-center justify-between mb-6">
                <Badge className="bg-black text-white">{news.category}</Badge>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{formatDate(news.createdAt)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Eye className="w-4 h-4" />
                    <span>{news.views || 0} बार देखा गया</span>
                  </div>
                </div>
              </div>

              {/* Title */}
              <h1 className="text-3xl font-bold mb-4">{news.title}</h1>

              {/* Image */}
              {news.imageUrl && (
                <div className="relative w-full h-[400px] mb-6">
                  <img 
                    src={news.imageUrl} 
                    alt={news.title}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
              )}

              {/* Excerpt */}
              <div className="text-xl text-gray-600 mb-8 font-semibold">
                {news.excerpt}
              </div>

              {/* Content */}
              <div className="mt-6 text-gray-800 leading-relaxed whitespace-pre-wrap">
                {news.content}
              </div>

              {/* Author */}
              {news.author && (
                <div className="mt-8 pt-6 border-t">
                  <p className="text-gray-600">
                    लेखक: <span className="font-semibold">{news.author}</span>
                  </p>
                </div>
              )}

              {/* Debug Info */}
              <div className="mt-8 p-4 bg-gray-100 rounded-lg">
                <h3 className="text-sm font-mono">Debug Info:</h3>
                <pre className="text-xs mt-2 overflow-auto">
                  {JSON.stringify({ newsId, news }, null, 2)}
                </pre>
              </div>
            </article>
          ) : null}
        </div>
      </main>
      
      <Footer />
    </div>
  )
} 