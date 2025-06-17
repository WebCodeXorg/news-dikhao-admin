"use client"

import { useEffect } from 'react'
import Header from "@/components/Header"
import Footer from "@/components/Footer"

export default function NewsPageClient({ newsId }: { newsId: string }) {
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