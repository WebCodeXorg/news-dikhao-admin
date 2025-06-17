'use client'

import { useEffect } from 'react'
import { AlertCircle } from 'lucide-react'
import Header from "@/components/Header"
import Footer from "@/components/Footer"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to console
    console.error('Error in news page:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-24 h-24 text-red-500 mb-6">
              <AlertCircle className="w-full h-full" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 font-hindi mb-4">
              एक त्रुटि हुई है!
            </h2>
            
            <div className="mb-8 p-4 bg-red-50 rounded-lg max-w-lg">
              <p className="text-red-700 font-mono text-sm mb-2">Error: {error.message}</p>
              {error.digest && (
                <p className="text-red-500 font-mono text-xs">Digest: {error.digest}</p>
              )}
            </div>
            
            <p className="text-gray-600 font-hindi mb-8 max-w-md">
              कृपया पेज को रीफ्रेश करें या कुछ देर बाद पुनः प्रयास करें।
            </p>
            
            <div className="space-y-4">
              <button
                onClick={() => reset()}
                className="bg-black text-white px-6 py-3 rounded-lg font-hindi hover:bg-gray-800 transition-colors"
              >
                पुनः प्रयास करें
              </button>
              
              <button
                onClick={() => window.location.href = '/'}
                className="block text-gray-600 hover:text-black font-hindi transition-colors"
              >
                होम पेज पर जाएँ →
              </button>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
} 