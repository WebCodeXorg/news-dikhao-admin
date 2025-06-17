import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function NewsNotFound() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-24 h-24 text-gray-400 mb-4">🔍</div>
            <h2 className="text-2xl font-bold text-gray-900 font-hindi mb-4">
              समाचार नहीं मिला!
            </h2>
            <p className="text-gray-600 font-hindi mb-8 max-w-md">
              आपके द्वारा खोजा गया समाचार मौजूद नहीं है या हटा दिया गया है। कृपया अन्य समाचार देखें।
            </p>
            <div className="flex space-x-4">
              <Link href="/">
                <Button className="bg-black text-white hover:bg-gray-800">
                  होम पेज पर जाएँ
                </Button>
              </Link>
              <Button 
                variant="outline" 
                onClick={() => window.history.back()}
                className="border-2"
              >
                वापस जाएँ
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
} 