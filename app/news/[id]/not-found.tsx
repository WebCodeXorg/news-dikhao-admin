import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Search } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <Search className="h-16 w-16 text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 font-hindi">
          समाचार नहीं मिला
        </h2>
        <p className="text-gray-600 font-hindi max-w-md mx-auto">
          आपके द्वारा खोजा गया समाचार मौजूद नहीं है या हटा दिया गया है। कृपया अन्य समाचार देखें।
        </p>
        <div className="flex justify-center">
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