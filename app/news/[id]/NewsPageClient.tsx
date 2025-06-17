"use client"

import { useEffect, useState } from 'react'
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { initializeFirebaseServices } from '@/lib/firebase-config'
import { getFirestore, doc, getDoc } from 'firebase/firestore'

interface NewsData {
  title?: string;
  content?: string;
  // Add other fields as needed
}

export default function NewsPageClient({ newsId }: { newsId: string }) {
  const [news, setNews] = useState<NewsData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchNewsData() {
      try {
        setLoading(true)
        setError(null)
        
        // Initialize Firebase
        const { db } = await initializeFirebaseServices()
        
        // Fetch news data
        const newsDoc = await getDoc(doc(db, "news", newsId))
        
        if (!newsDoc.exists()) {
          setError("न्यूज़ नहीं मिली")
          return
        }
        
        setNews(newsDoc.data() as NewsData)
      } catch (err) {
        console.error("Error fetching news:", err)
        setError("न्यूज़ लोड करने में समस्या आई है")
      } finally {
        setLoading(false)
      }
    }

    fetchNewsData()
  }, [newsId])

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
            <div className="prose prose-lg max-w-none font-hindi space-y-4">
              <h1 className="text-3xl font-bold mb-4">{news.title}</h1>
              <div className="mt-4">{news.content}</div>
            </div>
          ) : null}
        </div>
      </main>
      
      <Footer />
    </div>
  )
} 