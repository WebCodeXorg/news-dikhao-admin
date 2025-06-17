"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Header from "@/components/Header"
import BreakingNews from "@/components/BreakingNews"
import NewsGrid from "@/components/NewsGrid"
import Footer from "@/components/Footer"
import { getFirebaseDb } from "@/lib/firebase-config"
import { collection, getDocs, query, where, orderBy, limit } from "firebase/firestore"
import { Loader2, AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

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

export default function CategoryPage() {
  const params = useParams()
  const categorySlug = params.category as string
  
  const [categoryName, setCategoryName] = useState<string>("")
  const [categoryId, setCategoryId] = useState<string>("")
  const [news, setNews] = useState(defaultNews)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  // Fetch category details and posts
  useEffect(() => {
    const fetchCategoryAndPosts = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const db = await getFirebaseDb()
        
        // First, get category details
        const categoriesQuery = query(
          collection(db, "categories"),
          where("slug", "==", categorySlug)
        )
        
        const categorySnapshot = await getDocs(categoriesQuery)
        
        if (categorySnapshot.empty) {
          console.error(`Category with slug "${categorySlug}" not found`)
          setError(`श्रेणी "${categorySlug}" नहीं मिली`)
          setLoading(false)
          return
        }
        
        // Get the category name and ID
        const categoryData = categorySnapshot.docs[0].data()
        const catId = categorySnapshot.docs[0].id
        const catName = categoryData.name || categorySlug
        setCategoryName(catName)
        setCategoryId(catId)
        
        console.log(`Found category: ${catName} (${catId})`)
        
        // Try to fetch posts by category ID first
        const postsQueryById = query(
          collection(db, "posts"),
          where("category", "==", catId),
          where("status", "==", "published"),
          orderBy("createdAt", "desc"),
          limit(12)
        )
        
        const postsSnapshotById = await getDocs(postsQueryById)
        
        // If no posts found by ID, try by category name
        if (postsSnapshotById.empty) {
          console.log(`No posts found for category ID: ${catId}, trying by name: ${catName}`)
          
          const postsQueryByName = query(
            collection(db, "posts"),
            where("categoryName", "==", catName),
            where("status", "==", "published"),
            orderBy("createdAt", "desc"),
            limit(12)
          )
          
          const postsSnapshotByName = await getDocs(postsQueryByName)
          
          if (postsSnapshotByName.empty) {
            console.log(`No posts found for category name: ${catName} either`)
            setNews([])
            setLoading(false)
            return
          }
          
          // Format posts found by name
          const formattedPosts = postsSnapshotByName.docs.map(doc => {
            const post = doc.data()
            return {
              id: doc.id,
              title: post.title || "समाचार शीर्षक",
              category: post.categoryName || catName,
              image: post.imageUrl || "/placeholder.svg?height=300&width=500",
              time: post.createdAt?.toDate ? 
                new Date(post.createdAt?.toDate()).toLocaleString('hi-IN', { 
                  day: 'numeric', 
                  month: 'long',
                  hour: '2-digit', 
                  minute: '2-digit' 
                }) : "अभी",
              views: post.views?.toString() || "0",
              excerpt: post.excerpt || post.description || post.content?.substring(0, 150) || ""
            }
          })
          
          console.log(`Found ${formattedPosts.length} posts for category name: ${catName}`)
          setNews(formattedPosts)
        } else {
          // Format posts found by ID
          const formattedPosts = postsSnapshotById.docs.map(doc => {
            const post = doc.data()
            return {
              id: doc.id,
              title: post.title || "समाचार शीर्षक",
              category: post.categoryName || catName,
              image: post.imageUrl || "/placeholder.svg?height=300&width=500",
              time: post.createdAt?.toDate ? 
                new Date(post.createdAt?.toDate()).toLocaleString('hi-IN', { 
                  day: 'numeric', 
                  month: 'long',
                  hour: '2-digit', 
                  minute: '2-digit' 
                }) : "अभी",
              views: post.views?.toString() || "0",
              excerpt: post.excerpt || post.description || post.content?.substring(0, 150) || ""
            }
          })
          
          console.log(`Found ${formattedPosts.length} posts for category ID: ${catId}`)
          setNews(formattedPosts)
        }
        
      } catch (error) {
        console.error(`Error fetching category ${categorySlug}:`, error)
        setError("समाचार लोड करने में समस्या हुई। कृपया पेज रिफ्रेश करें।")
      } finally {
        setLoading(false)
      }
    }
    
    if (categorySlug) {
      fetchCategoryAndPosts()
    }
  }, [categorySlug, retryCount])

  const handleRetry = () => {
    setRetryCount(prev => prev + 1)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <BreakingNews />

      <main className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-hindi">
            {categoryName || categorySlug}
          </h1>
          <div className="h-1 w-20 bg-black mt-2"></div>
        </div>
        
        <div className="w-full">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-12 h-12 animate-spin text-blue-500 mb-4" />
              <span className="text-gray-700 font-hindi text-lg">समाचार लोड हो रहे हैं...</span>
              <span className="text-gray-500 font-hindi text-sm mt-2">कृपया प्रतीक्षा करें</span>
            </div>
          ) : error ? (
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
          ) : news.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
              <h3 className="text-lg font-medium text-gray-900 font-hindi mb-2">
                इस श्रेणी में कोई समाचार नहीं मिला
              </h3>
              <p className="text-gray-500 font-hindi">जल्द ही नए समाचार जोड़े जाएंगे</p>
            </div>
          ) : (
            <NewsGrid newsData={news} />
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
} 