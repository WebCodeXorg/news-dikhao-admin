"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import Header from "@/components/Header"
import BreakingNews from "@/components/BreakingNews"
import Footer from "@/components/Footer"
import { getFirebaseDb } from "@/lib/firebase-config"
import { doc, getDoc, updateDoc, increment, collection, query, where, getDocs, limit } from "firebase/firestore"
import { Loader2, AlertCircle, Calendar, Eye, Clock, ArrowLeft, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

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

interface SliderItem {
  id: string
  title: string
  excerpt: string
  imageUrl: string
  category: string
  categoryName: string
  isBreaking: boolean
  createdAt: any
  postId?: string
}

export default function NewsArticlePage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const postId = params?.id || ""
  
  const [post, setPost] = useState<NewsPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [categoryName, setCategoryName] = useState("")
  const [formattedContent, setFormattedContent] = useState("")

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const db = await getFirebaseDb()
        
        // Add error logging
        console.log("Attempting to fetch post:", postId)
        
        // First try to get it as a post
        const postRef = doc(db, "posts", postId)
        let postSnap
        try {
          postSnap = await getDoc(postRef)
          console.log("Post fetch result:", { exists: postSnap.exists(), data: postSnap.exists() ? postSnap.data() : null })
        } catch (err: any) {
          console.error("Error fetching post:", err)
          throw new Error(`Failed to fetch post: ${err.message}`)
        }
        
        if (postSnap.exists()) {
          console.log("Found post document")
          const postData = postSnap.data() as NewsPost
          
          // Validate required fields
          const requiredFields = ['title', 'content', 'category', 'imageUrl', 'createdAt'] as const
          const missingFields = requiredFields.filter(field => !postData[field as keyof NewsPost])
          
          if (missingFields.length > 0) {
            console.error("Missing required fields:", missingFields)
            throw new Error(`Post is missing required fields: ${missingFields.join(', ')}`)
          }
          
          postData.id = postSnap.id
          
          setPost(postData)
          
          // Format content to ensure it wraps properly
          let content = postData.content || ""
          
          // Ensure content is wrapped properly
          content = formatContentForWrapping(content)
          setFormattedContent(content)
          
          // Increment view count
          try {
            await updateDoc(postRef, {
              views: increment(1)
            })
            console.log("View count incremented")
          } catch (err) {
            console.error("Error incrementing view count:", err)
          }
          
          // Get category name if only ID is available
          if (postData.category && !postData.categoryName) {
            try {
              const categoryRef = doc(db, "categories", postData.category)
              const categorySnap = await getDoc(categoryRef)
              
              if (categorySnap.exists()) {
                const categoryData = categorySnap.data()
                setCategoryName(categoryData.name || "")
              }
            } catch (err) {
              console.error("Error fetching category:", err)
            }
          } else if (postData.categoryName) {
            setCategoryName(postData.categoryName)
          }
          
          setLoading(false)
          return
        }
        
        // If not found as post, try to get it as a slider item
        console.log("Post not found, checking slider items")
        const sliderRef = doc(db, "slider_items", postId)
        const sliderSnap = await getDoc(sliderRef)
        
        if (sliderSnap.exists()) {
          console.log("Found slider item document")
          const sliderData = sliderSnap.data() as SliderItem
          
          // If slider item has a postId, redirect to that post
          if (sliderData.postId && sliderData.postId !== postId) {
            console.log(`Redirecting to linked post: ${sliderData.postId}`)
            router.push(`/news/${sliderData.postId}`)
            return
          }
          
          // Otherwise, convert slider item to post format
          const convertedPost: NewsPost = {
            id: sliderSnap.id,
            title: sliderData.title || "",
            content: sliderData.excerpt || "",
            excerpt: sliderData.excerpt || "",
            category: sliderData.category || "",
            categoryName: sliderData.categoryName || "",
            tags: [],
            imageUrl: sliderData.imageUrl || "",
            createdAt: sliderData.createdAt,
            updatedAt: sliderData.createdAt,
            author: "News Dikhao",
            views: 0,
            language: "hindi",
            isBreaking: sliderData.isBreaking || false
          }
          
          setPost(convertedPost)
          setCategoryName(sliderData.categoryName || "")
          
          // Format content
          let content = convertedPost.content || ""
          content = formatContentForWrapping(content)
          setFormattedContent(content)
          
          setLoading(false)
          return
        }
        
        // If not found in either collection
        console.log("Content not found in any collection")
        setError("समाचार नहीं मिला")
        
      } catch (error) {
        console.error("Detailed error in fetchContent:", error)
        // Set a user-friendly error message
        setError("समाचार लोड करने में समस्या हुई। कृपया पुनः प्रयास करें।")
        // Redirect to not-found page after a brief delay
        setTimeout(() => {
          router.push('/news/not-found')
        }, 2000)
      } finally {
        setLoading(false)
      }
    }
    
    if (postId) {
      fetchContent()
    }
  }, [postId, router])

  // Helper function to format content for proper wrapping
  const formatContentForWrapping = (content: string): string => {
    // If content is empty, return empty string
    if (!content) return ""
    
    // Add word-wrap style to all elements
    let formattedContent = content
    
    // If content doesn't have HTML tags, wrap it in paragraphs
    if (!formattedContent.includes('<')) {
      formattedContent = `<p>${formattedContent.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br/>')}</p>`
    }
    
    return formattedContent
  }

  // Format date
  const formatDate = (timestamp: any) => {
    if (!timestamp) return "अभी"
    
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
      return date.toLocaleString('hi-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch (e) {
      return "अभी"
    }
  }
  
  // Share functionality
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post?.title || "News Dikhao - समाचार",
          text: post?.excerpt || "News Dikhao पर पढ़ें",
          url: window.location.href
        })
      } catch (err) {
        console.error("Error sharing:", err)
      }
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      alert("लिंक कॉपी किया गया")
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <BreakingNews />

      <main className="container mx-auto px-4 py-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-blue-500 mb-4" />
            <span className="text-gray-700 font-hindi text-lg">समाचार लोड हो रहा है...</span>
            <span className="text-gray-500 font-hindi text-sm mt-2">कृपया प्रतीक्षा करें</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 font-hindi mb-2">{error}</h3>
            <p className="text-gray-500 font-hindi mb-4">समाचार नहीं मिला या लोड नहीं हो सका</p>
            <Button 
              onClick={() => router.back()}
              className="flex items-center bg-blue-500 hover:bg-blue-600"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              वापस जाएं
            </Button>
          </div>
        ) : post ? (
          <div className="max-w-3xl mx-auto">
            {/* Back button and share */}
            <div className="flex items-center justify-between mb-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => router.back()}
                className="flex items-center text-gray-600 hover:text-black"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                वापस जाएं
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="flex items-center text-gray-600 hover:text-black"
              >
                <Share2 className="w-4 h-4 mr-2" />
                शेयर करें
              </Button>
            </div>
            
            <article className="bg-white shadow-md rounded-lg overflow-hidden">
              {/* Featured image */}
              {post.imageUrl && (
                <div className="relative w-full h-56 md:h-72">
                  <Image
                    src={post.imageUrl}
                    alt={post.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 768px"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                  
                  {/* Category and breaking tag - positioned on image */}
                  <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                    {post.isBreaking && (
                      <Badge className="bg-red-500 hover:bg-red-600 font-hindi">ब्रेकिंग न्यूज़</Badge>
                    )}
                    <Badge className="bg-black hover:bg-gray-800 font-hindi">
                      {categoryName || post.categoryName || "समाचार"}
                    </Badge>
                  </div>
                </div>
              )}
              
              <div className="p-5">
                {/* Title */}
                <h1 className="text-2xl md:text-3xl font-bold font-hindi leading-tight mb-3">
                  {post.title}
                </h1>
                
                {/* Meta info */}
                <div className="flex flex-wrap items-center text-sm text-gray-600 gap-3 mb-5 border-b pb-3">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span>{formatDate(post.createdAt)}</span>
                  </div>
                  <div className="flex items-center">
                    <Eye className="w-4 h-4 mr-1" />
                    <span>{post.views || 0} बार देखा गया</span>
                  </div>
                  {post.author && (
                    <div className="flex items-center">
                      <span>लेखक: {post.author}</span>
                    </div>
                  )}
                </div>
                
                {/* Content */}
                <div className="mt-5">
                  <div 
                    className="prose max-w-none font-hindi leading-relaxed break-words overflow-hidden"
                    style={{ 
                      wordWrap: 'break-word', 
                      overflowWrap: 'break-word',
                      maxWidth: '100%'
                    }}
                    dangerouslySetInnerHTML={{ __html: formattedContent }}
                  />
                </div>
                
                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                  <div className="mt-8 pt-4 border-t">
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="font-hindi">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </article>
          </div>
        ) : null}
      </main>

      <Footer />
    </div>
  )
} 