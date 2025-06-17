"use client"

import { useState, useEffect } from "react"
import NewsGrid from "./NewsGrid"
import { getLatestPosts } from "@/lib/firebase-posts"
import { Loader2, AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "./ui/button"

// Default news items for fallback
const defaultNews = [
  {
    id: 1,
    title: "लोड हो रहा है...",
    category: "",
    image: "/placeholder.svg?height=300&width=500",
    time: "",
    views: "",
    excerpt: "कृपया प्रतीक्षा करें, समाचार लोड हो रहे हैं।",
  }
]

export default function RealNewsGrid() {
  const [news, setNews] = useState(defaultNews)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  const fetchPosts = async () => {
    try {
      console.log("Fetching posts, attempt:", retryCount + 1)
      setLoading(true)
      setError(null)
      
      // Add a small timeout to ensure Firebase is properly initialized
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const posts = await getLatestPosts(12)
      console.log("Posts fetched:", posts.length)
      
      if (posts.length > 0) {
        // Format posts for NewsGrid
        const formattedPosts = posts.map(post => ({
          id: post.id || Math.random(),
          title: post.title || "समाचार शीर्षक",
          category: post.category || "",
          image: post.imageUrl || "/placeholder.svg?height=300&width=500",
          time: post.createdAt?.toDate ? 
            new Date(post.createdAt?.toDate()).toLocaleString('hi-IN', { 
              day: 'numeric', 
              month: 'long',
              hour: '2-digit', 
              minute: '2-digit' 
            }) : "अभी",
          views: post.views?.toString() || "0",
          excerpt: post.excerpt || post.content?.substring(0, 150) || ""
        }))
        
        setNews(formattedPosts)
        setError(null)
      } else {
        // If no posts are returned but no error occurred
        if (retryCount < 2) {
          console.log("No posts returned, retrying...")
          setRetryCount(prev => prev + 1)
          return
        } else {
          setError("कोई समाचार नहीं मिला। कृपया बाद में पुनः प्रयास करें।")
        }
      }
    } catch (error) {
      console.error("Error fetching latest posts:", error)
      setError("समाचार लोड करने में समस्या हुई। कृपया पेज रिफ्रेश करें।")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [retryCount])

  const handleRetry = () => {
    setRetryCount(prev => prev + 1)
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-12 h-12 animate-spin text-blue-500 mb-4" />
        <span className="text-gray-700 font-hindi text-lg">समाचार लोड हो रहे हैं...</span>
        <span className="text-gray-500 font-hindi text-sm mt-2">कृपया प्रतीक्षा करें</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 font-hindi mb-2">{error}</h3>
        <p className="text-gray-500 font-hindi mb-4">इंटरनेट कनेक्शन जांचें और पुनः प्रयास करें</p>
        <Button 
          onClick={handleRetry} 
          className="flex items-center bg-blue-500 hover:bg-blue-600"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          पुनः प्रयास करें
        </Button>
      </div>
    )
  }

  return <NewsGrid newsData={news} />
} 