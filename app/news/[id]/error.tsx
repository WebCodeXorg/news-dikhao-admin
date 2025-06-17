"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, AlertCircle } from "lucide-react"
import Link from "next/link"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("News page error:", error)
  }, [error])

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <AlertCircle className="h-16 w-16 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 font-hindi">
          समाचार लोड करने में समस्या हुई
        </h2>
        <p className="text-gray-600 font-hindi max-w-md mx-auto">
          कृपया कुछ देर बाद पुनः प्रयास करें। यदि समस्या बनी रहती है, तो हमसे संपर्क करें।
        </p>
        <div className="flex justify-center gap-4">
          <Button
            variant="outline"
            onClick={reset}
            className="font-hindi"
          >
            पुनः प्रयास करें
          </Button>
          <Link href="/">
            <Button className="font-hindi bg-black hover:bg-gray-800">
              <ArrowLeft className="w-4 h-4 mr-2" />
              होम पेज पर जाएं
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
} 