"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, Play, Pause, Clock, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface NewsSlide {
  id: number
  title: string
  category: string
  image: string
  time: string
  author: string
  excerpt: string
  isBreaking: boolean
  slug?: string
}

interface NewsSliderProps {
  slides?: NewsSlide[]
  autoPlayInterval?: number
}

const defaultSlides: NewsSlide[] = [
  {
    id: 1,
    title: "मेघालय पर्यटक की हत्या: सिर पर दो गहरे घाव, पोस्टमॉर्टम रिपोर्ट में खुलासा",
    category: "अपराध",
    image: "/placeholder.svg?height=600&width=1000",
    time: "2 घंटे पहले",
    author: "न्यूज डेस्क",
    excerpt: "मध्य प्रदेश के दंपति के मेघालय में लापता होने के दिनों बाद, पति राजा राघुवंशी का शव जंगल में मिला।",
    isBreaking: true,
  },
  {
    id: 2,
    title: "भारतीय क्रिकेट टीम की ऐतिहासिक जीत, विश्व रिकॉर्ड बनाया",
    category: "खेल",
    image: "/placeholder.svg?height=600&width=1000",
    time: "1 घंटे पहले",
    author: "खेल संवाददाता",
    excerpt: "टीम इंडिया ने अपने शानदार प्रदर्शन से नया विश्व रिकॉर्ड बनाया है।",
    isBreaking: false,
  },
  {
    id: 3,
    title: "नई शिक्षा नीति में क्रांतिकारी बदलाव, छात्रों को मिलेंगे अनगिनत अवसर",
    category: "शिक्षा",
    image: "/placeholder.svg?height=600&width=1000",
    time: "3 घंटे पहले",
    author: "शिक्षा संवाददाता",
    excerpt: "शिक्षा मंत्रालय ने घोषणा की है कि नई नीति से छात्रों को बेहतर शिक्षा मिलेगी।",
    isBreaking: false,
  },
  {
    id: 4,
    title: "शेयर बाजार में उछाल, सेंसेक्स ने छुआ नया शिखर",
    category: "बिजनेस",
    image: "/placeholder.svg?height=600&width=1000",
    time: "4 घंटे पहले",
    author: "बिजनेस डेस्क",
    excerpt: "निवेशकों के लिए खुशखबरी, बाजार में तेजी से सेंसेक्स नए रिकॉर्ड पर पहुंचा है।",
    isBreaking: false,
  },
]

export default function NewsSlider({ slides = defaultSlides, autoPlayInterval = 1500 }: NewsSliderProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlay, setIsAutoPlay] = useState(true)
  const [isHovered, setIsHovered] = useState(false)

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }, [slides.length])

  const prevSlide = useCallback(() => {
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
                      src={slide.image || "/placeholder.svg"}
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
                      {slide.category}
                    </Badge>
                  </div>

                  {/* Content Section */}
                  <div className="p-8 lg:p-12 flex flex-col justify-center bg-white order-1 lg:order-2">
                    <div className="space-y-6">
                      {/* Meta Information */}
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span className="font-hindi">{slide.time}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <User className="w-4 h-4" />
                          <span className="font-hindi">{slide.author}</span>
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="text-2xl lg:text-3xl xl:text-4xl font-bold text-black font-hindi leading-tight hover:text-gray-700 transition-colors duration-300 cursor-pointer">
                        {slide.title}
                      </h3>

                      {/* Excerpt */}
                      <p className="text-gray-700 font-hindi text-lg leading-relaxed line-clamp-3">{slide.excerpt}</p>

                      {/* Action Buttons */}
                      <div className="flex items-center space-x-4">
                        <Button className="bg-black text-white hover:bg-gray-800 transition-all duration-300 transform hover:scale-105 font-hindi px-8 py-3 rounded-full">
                          पूरी खबर पढ़ें →
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

        {/* Thumbnail Navigation */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              onClick={() => goToSlide(index)}
              className={`relative overflow-hidden rounded-xl transition-all duration-300 transform hover:scale-105 border-2 group ${
                index === currentSlide
                  ? "border-black shadow-xl scale-105"
                  : "border-gray-300 hover:border-gray-500 shadow-md"
              }`}
            >
              <Image
                src={slide.image || "/placeholder.svg"}
                alt={slide.title}
                width={250}
                height={150}
                className="w-full h-24 object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all duration-300" />
              <div className="absolute bottom-2 left-2 right-2">
                <p className="text-white text-xs font-hindi font-semibold line-clamp-2 drop-shadow-lg">{slide.title}</p>
              </div>
              {slide.isBreaking && (
                <div className="absolute top-1 left-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
