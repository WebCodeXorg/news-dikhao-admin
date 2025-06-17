"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, ChevronRight, Play, Pause, Clock, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getFirebaseDb } from "@/lib/firebase-config"
import { collection, getDocs, query, where, orderBy, limit } from "firebase/firestore"

// Add console logs to check if posts are being fetched
const handleReadButtonClick = (id: string) => {
  console.log("Read button clicked for slide ID:", id);
  console.log("Navigating to URL:", `/news/${id}`);
  window.location.href = `/news/${id}`;
};

interface NewsSlide {
  id: string
  title: string
  category: string
  categoryName: string
  imageUrl: string
  createdAt: any
  postId?: string
  excerpt: string
  isBreaking: boolean
  isActive: boolean
}

interface RealNewsSliderProps {
  autoPlayInterval?: number
}

export default function RealNewsSlider({ autoPlayInterval = 5000 }: RealNewsSliderProps) {
  const [slides, setSlides] = useState<NewsSlide[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlay, setIsAutoPlay] = useState(true)
  const [isHovered, setIsHovered] = useState(false)

  // Fetch slider posts
  useEffect(() => {
    const fetchSliderItems = async () => {
      try {
        setLoading(true)
        console.log("RealNewsSlider: Fetching slider items...")
        
        const db = await getFirebaseDb()
        console.log("RealNewsSlider: Firebase DB initialized");
        
        // Get active slider items sorted by order
        const sliderItemsQuery = query(
          collection(db, "slider_items"), 
          where("isActive", "==", true),
          orderBy("order", "asc")
        )
        
        const querySnapshot = await getDocs(sliderItemsQuery)
        console.log("RealNewsSlider: Got querySnapshot, size:", querySnapshot.size);
        
        const sliderItems: NewsSlide[] = []
        
        querySnapshot.forEach((doc) => {
          const data = doc.data()
          console.log("RealNewsSlider: Processing slider item:", doc.id);
          
          sliderItems.push({
            id: doc.id,
            title: data.title || "",
            category: data.category || "",
            categoryName: data.categoryName || "अज्ञात",
            imageUrl: data.imageUrl || "/placeholder.svg",
            createdAt: data.createdAt,
            postId: data.postId || undefined,
            excerpt: data.excerpt || "",
            isBreaking: data.isBreaking !== false, // Default to true
            isActive: data.isActive !== false
          })
        })
        
        console.log("RealNewsSlider: Fetched slider items:", sliderItems.length);
        if (sliderItems.length > 0) {
          console.log("RealNewsSlider: First item ID:", sliderItems[0]?.id);
        }
        
        setSlides(sliderItems)
      } catch (err: any) {
        console.error("Error fetching slider items:", err)
        setError(err.message || "स्लाइडर लोड करने में समस्या हुई")
      } finally {
        setLoading(false)
      }
    }
    
    fetchSliderItems()
  }, [])

  const nextSlide = useCallback(() => {
    if (slides.length === 0) return
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }, [slides.length])

  const prevSlide = useCallback(() => {
    if (slides.length === 0) return
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }, [slides.length])

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index)
  }, [])

  useEffect(() => {
    if (!isAutoPlay || isHovered || slides.length <= 1) return

    const timer = setInterval(nextSlide, autoPlayInterval)
    return () => clearInterval(timer)
  }, [isAutoPlay, isHovered, nextSlide, autoPlayInterval, slides.length])

  // Format timestamp to readable time
  const formatTime = (timestamp: any) => {
    if (!timestamp) return "अभी"
    
    const now = new Date()
    // Handle different timestamp formats
    const postDate = timestamp.seconds ? new Date(timestamp.seconds * 1000) : 
                    timestamp instanceof Date ? timestamp : 
                    new Date()
    
    const diffInHours = Math.floor((now.getTime() - postDate.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) {
      return "अभी"
    } else if (diffInHours < 24) {
      return `${diffInHours} घंटे पहले`
    } else {
      const diffInDays = Math.floor(diffInHours / 24)
      return `${diffInDays} दिन पहले`
    }
  }

  if (loading) {
    return (
      <section className="bg-white py-8 border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="text-center py-12">
            <p className="text-gray-500 font-hindi">लोड हो रहा है...</p>
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="bg-white py-8 border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="text-center py-12">
            <p className="text-red-500 font-hindi">त्रुटि: {error}</p>
          </div>
        </div>
      </section>
    )
  }

  if (slides.length === 0) {
    return (
      <section className="bg-white py-8 border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="text-center py-12">
            <p className="text-gray-500 font-hindi">कोई समाचार उपलब्ध नहीं है</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="bg-white py-8 border-b border-gray-200">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <h2 className="text-4xl font-bold text-black font-hindi">मुख्य समाचार</h2>
            <div className="h-1 w-20 bg-black"></div>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsAutoPlay(!isAutoPlay)}
              className="border-2 border-gray-300 hover:border-black hover:bg-black hover:text-white transition-all duration-300 rounded-full"
            >
              {isAutoPlay ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            <span className="text-sm text-gray-600 font-hindi">
              {isAutoPlay ? `ऑटो प्ले चालू (${autoPlayInterval / 1000}s)` : "ऑटो प्ले बंद"}
            </span>
          </div>
        </div>

        {/* Main Slider */}
        <div
          className="relative overflow-hidden rounded-3xl bg-white shadow-2xl border border-gray-200"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="relative h-[500px] md:h-[600px]">
            {slides.map((slide, index) => (
              <div
                key={slide.id}
                className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
                  index === currentSlide ? "opacity-100 scale-100" : "opacity-0 scale-105"
                }`}
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 h-full">
                  {/* Image Section */}
                  <div className="relative overflow-hidden order-2 lg:order-1">
                    <Image
                      src={slide.imageUrl || "/placeholder.svg"}
                      alt={slide.title}
                      fill
                      className="object-cover transition-transform duration-1000 hover:scale-110"
                      priority={index === 0}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent lg:bg-gradient-to-r lg:from-black/40 lg:to-transparent" />

                    {/* Breaking News Badge */}
                    {slide.isBreaking && (
                      <div className="absolute top-6 left-6">
                        <Badge className="bg-red-600 text-white border-0 text-sm px-4 py-2 animate-pulse font-hindi">
                          🔴 ब्रेकिंग न्यूज़
                        </Badge>
                      </div>
                    )}

                    {/* Category Badge */}
                    <Badge className="absolute top-6 right-6 bg-black/80 text-white border-0 backdrop-blur-sm font-hindi">
                      {slide.categoryName || slide.category}
                    </Badge>
                  </div>

                  {/* Content Section */}
                  <div className="p-8 lg:p-12 flex flex-col justify-center bg-white order-1 lg:order-2">
                    <div className="space-y-6">
                      {/* Meta Information */}
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span className="font-hindi">{formatTime(slide.createdAt)}</span>
                        </div>
                      </div>

                      {/* Title */}
                      <Link href={slide.postId ? `/news/${slide.postId}` : "#"} className="block">
                        <h3 className="text-2xl lg:text-3xl xl:text-4xl font-bold text-black font-hindi leading-tight hover:text-gray-700 transition-colors duration-300 cursor-pointer">
                          {slide.title}
                        </h3>
                      </Link>

                      {/* Excerpt */}
                      <p className="text-gray-700 font-hindi text-lg leading-relaxed line-clamp-3">{slide.excerpt}</p>

                      {/* Action Buttons */}
                      <div className="flex items-center space-x-4">
                        <Button 
                          className="bg-black text-white hover:bg-gray-800 transition-all duration-300 transform hover:scale-105 font-hindi px-8 py-3 rounded-full"
                          onClick={() => slide.postId ? handleReadButtonClick(slide.postId) : null}
                          disabled={!slide.postId}
                        >
                          पूरी खबर पढ़ें ----→
                        </Button>
                        <Button
                          variant="outline"
                          className="border-2 border-gray-300 hover:border-black hover:bg-black hover:text-white transition-all duration-300 font-hindi px-6 py-3 rounded-full"
                        >
                          शेयर करें
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Buttons */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-6 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm hover:bg-black hover:text-white border-2 border-gray-300 hover:border-black transition-all duration-300 rounded-full w-12 h-12 shadow-lg"
            onClick={prevSlide}
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="absolute right-6 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm hover:bg-black hover:text-white border-2 border-gray-300 hover:border-black transition-all duration-300 rounded-full w-12 h-12 shadow-lg"
            onClick={nextSlide}
          >
            <ChevronRight className="w-6 h-6" />
          </Button>

          {/* Slide Indicators */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3">
            {slides.map((_, index) => (
              <button
                key={index}
                className={`w-4 h-4 rounded-full transition-all duration-300 border-2 ${
                  index === currentSlide
                    ? "bg-black border-black scale-125"
                    : "bg-white/80 border-gray-400 hover:border-black hover:bg-gray-200"
                }`}
                onClick={() => goToSlide(index)}
              />
            ))}
          </div>

          {/* Progress Bar */}
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-200">
            <div
              className="h-full bg-black transition-all duration-300"
              style={{
                width: `${((currentSlide + 1) / slides.length) * 100}%`,
              }}
            />
          </div>
        </div>
      </div>
    </section>
  )
} 