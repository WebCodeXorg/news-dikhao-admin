"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { getFirebaseDb } from "@/lib/firebase-config"
import { collection, getDocs, query, where, orderBy, limit, doc, getDoc } from "firebase/firestore"
import { Loader2, ChevronLeft, ChevronRight, ArrowRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface SliderItem {
  id: string
  title: string
  excerpt: string
  imageUrl: string
  imageSize: number
  category: string
  categoryName: string
  isBreaking: boolean
  isActive: boolean
  order: number
  createdAt: any
  postId: string // Reference to the original post
}

export default function HomeSlider() {
  const [sliderItems, setSliderItems] = useState<SliderItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentSlide, setCurrentSlide] = useState(0)

  // Fetch slider items from Firebase
  useEffect(() => {
    const fetchSliderItems = async () => {
      try {
        setLoading(true)
        
        const db = await getFirebaseDb()
        
        // Query active slider items ordered by their display order
        const sliderQuery = query(
          collection(db, "slider_items"),
          where("isActive", "==", true),
          orderBy("order", "asc"),
          limit(5)
        )
        
        const snapshot = await getDocs(sliderQuery)
        
        if (snapshot.empty) {
          console.log("No slider items found")
          setSliderItems([])
          setLoading(false)
          return
        }
        
        const items: SliderItem[] = []
        
        // Process each slider item
        for (const docSnapshot of snapshot.docs) {
          const data = docSnapshot.data() as Omit<SliderItem, "id">
          
          items.push({
            id: docSnapshot.id,
            ...data,
            title: data.title || "",
            excerpt: data.excerpt || "",
            imageUrl: data.imageUrl || "/placeholder.svg?height=600&width=1200",
            categoryName: data.categoryName || "समाचार",
            postId: data.postId || docSnapshot.id // Use the slider item ID as fallback
          })
        }
        
        console.log(`Fetched ${items.length} slider items`)
        setSliderItems(items)
      } catch (err) {
        console.error("Error fetching slider items:", err)
        setError("स्लाइडर लोड नहीं हो सका")
      } finally {
        setLoading(false)
      }
    }
    
    fetchSliderItems()
  }, [])

  // Navigation functions
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === sliderItems.length - 1 ? 0 : prev + 1))
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? sliderItems.length - 1 : prev - 1))
  }

  // Auto-advance slides
  useEffect(() => {
    if (sliderItems.length <= 1) return
    
    const interval = setInterval(() => {
      nextSlide()
    }, 5000)
    
    return () => clearInterval(interval)
  }, [sliderItems.length, currentSlide])

  if (loading) {
    return (
      <div className="relative w-full h-[300px] bg-gray-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-black" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="relative w-full h-[200px] bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 font-hindi text-lg mb-2">{error}</p>
          <Button onClick={() => window.location.reload()} size="sm">पुनः प्रयास करें</Button>
        </div>
      </div>
    )
  }

  if (sliderItems.length === 0) {
    return null
  }

  return (
    <div className="relative overflow-hidden rounded-xl shadow-lg bg-white">
      {/* Slides */}
      <div className="relative">
        {sliderItems.map((item, index) => (
          <div
            key={item.id}
            className={`transition-opacity duration-1000 ${
              index === currentSlide ? "opacity-100" : "hidden opacity-0"
            }`}
          >
            <div className="flex flex-col md:flex-row">
              {/* Image Section - Left Side (30%) */}
              <div className="relative h-[180px] md:h-[250px] md:w-[30%]">
                <Link href={`/news/${item.id}`} className="block w-full h-full">
                  <Image
                    src={item.imageUrl}
                    alt={item.title}
                    fill
                    className="object-cover"
                    priority={index === 0}
                    sizes="(max-width: 768px) 100vw, 30vw"
                  />
                  {/* Breaking News Badge - Absolute position on image */}
                  {item.isBreaking && (
                    <div className="absolute top-2 left-2 inline-flex items-center bg-red-600 text-white px-2 py-1 rounded-md text-sm animate-pulse">
                      <span className="font-hindi font-bold">ब्रेकिंग</span>
                    </div>
                  )}
                </Link>
              </div>

              {/* Content Section - Right Side (70%) */}
              <div className="p-4 md:p-5 flex flex-col justify-between md:w-[70%]">
                <div>
                  {/* Category Badge */}
                  <Badge className="mb-2 bg-gray-100 text-black hover:bg-gray-200 text-xs px-2 py-0.5">
                    {item.categoryName}
                  </Badge>
                  
                  <Link href={`/news/${item.id}`} className="block">
                    <h2 className="text-lg md:text-xl font-bold text-gray-900 font-hindi mb-2 leading-tight line-clamp-2 hover:text-blue-800">
                      {item.title}
                    </h2>
                  </Link>
                  <p className="text-sm text-gray-600 font-hindi mb-4 line-clamp-3 md:line-clamp-4">
                    {item.excerpt}
                  </p>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-500 font-hindi">
                    {new Date(item.createdAt?.toDate?.() || item.createdAt).toLocaleDateString('hi-IN')}
                  </div>
                  <Link href={`/news/${item.id}`} className="inline-flex items-center">
                    <Button size="sm" variant="outline" className="font-hindi text-xs gap-1">
                      पूरा पढ़ें <ArrowRight className="w-3 h-3" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      {sliderItems.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-30 bg-white/80 hover:bg-white text-black rounded-full p-1 shadow-md transition-all duration-300"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-30 bg-white/80 hover:bg-white text-black rounded-full p-1 shadow-md transition-all duration-300"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Dots Navigation */}
      {sliderItems.length > 1 && (
        <div className="absolute -bottom-0 left-0 right-0 z-30 flex justify-center space-x-1 pb-2 bg-gradient-to-t from-white/80 to-transparent">
          {sliderItems.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentSlide ? "bg-black scale-125" : "bg-gray-300 hover:bg-gray-400"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
} 