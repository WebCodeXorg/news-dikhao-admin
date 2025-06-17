"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, Play, Pause } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const latestNews = [
  {
    id: 1,
    title: "अमेरिका के लॉस एंजिल्स में भीषण आग, हजारों लोगों को सुरक्षित स्थानों पर पहुंचाया गया",
    category: "विदेश",
    image: "/placeholder.svg?height=300&width=500",
    time: "2 घंटे पहले",
    excerpt: "कैलिफोर्निया में लगी भीषण आग से हजारों लोग प्रभावित, आपातकालीन सेवाएं सक्रिय।",
  },
  {
    id: 2,
    title: "भारतीय क्रिकेट टीम की शानदार जीत, विश्व कप में नया रिकॉर्ड",
    category: "खेल",
    image: "/placeholder.svg?height=300&width=500",
    time: "1 घंटे पहले",
    excerpt: "टीम इंडिया ने अपने बेहतरीन प्रदर्शन से फैंस को खुश किया है।",
  },
  {
    id: 3,
    title: "नई शिक्षा नीति में बड़े बदलाव, छात्रों को मिलेंगे नए अवसर",
    category: "भारत",
    image: "/placeholder.svg?height=300&width=500",
    time: "3 घंटे पहले",
    excerpt: "शिक्षा मंत्रालय ने घोषणा की है कि नई नीति से छात्रों को बेहतर शिक्षा मिलेगी।",
  },
  {
    id: 4,
    title: "बॉलीवुड में नई फिल्म का धमाकेदार ट्रेलर रिलीज",
    category: "मनोरंजन",
    image: "/placeholder.svg?height=300&width=500",
    time: "4 घंटे पहले",
    excerpt: "फिल्म का ट्रेलर सोशल मीडिया पर वायरल हो गया है।",
  },
  {
    id: 5,
    title: "शेयर बाजार में तेजी, सेंसेक्स नए रिकॉर्ड पर पहुंचा",
    category: "बिजनेस",
    image: "/placeholder.svg?height=300&width=500",
    time: "5 घंटे पहले",
    excerpt: "निवेशकों के लिए अच्छी खबर, बाजार में सकारात्मक रुझान।",
  },
]

export default function LatestNewsSlider() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlay, setIsAutoPlay] = useState(true)

  useEffect(() => {
    if (!isAutoPlay) return

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % latestNews.length)
    }, 5000)

    return () => clearInterval(timer)
  }, [isAutoPlay])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % latestNews.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + latestNews.length) % latestNews.length)
  }

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }

  return (
    <section className="bg-white py-8 border-b-2 border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-black font-hindi">लेटेस्ट न्यूज़</h2>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsAutoPlay(!isAutoPlay)}
              className="border-2 border-gray-300 hover:border-black hover:bg-black hover:text-white transition-all duration-300"
            >
              {isAutoPlay ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-white shadow-xl border-2 border-gray-200">
          <div className="relative h-96 md:h-[500px]">
            {latestNews.map((news, index) => (
              <div
                key={news.id}
                className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                  index === currentSlide ? "opacity-100 scale-100" : "opacity-0 scale-105"
                }`}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 h-full">
                  {/* Image Section */}
                  <div className="relative overflow-hidden">
                    <Image
                      src={news.image || "/placeholder.svg"}
                      alt={news.title}
                      fill
                      className="object-cover transition-transform duration-700 hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
                    <Badge className="absolute top-4 left-4 bg-black text-white border-0 hover:bg-gray-800 transition-colors duration-300">
                      {news.category}
                    </Badge>
                  </div>

                  {/* Content Section */}
                  <div className="p-6 md:p-8 flex flex-col justify-center bg-white">
                    <div className="space-y-4">
                      <div className="text-sm text-gray-600 font-medium">{news.time}</div>
                      <h3 className="text-2xl md:text-3xl font-bold text-black font-hindi leading-tight hover:text-gray-700 transition-colors duration-300 cursor-pointer">
                        {news.title}
                      </h3>
                      <p className="text-gray-700 font-hindi text-lg leading-relaxed">{news.excerpt}</p>
                      <Button className="w-fit bg-black text-white hover:bg-gray-800 transition-all duration-300 transform hover:scale-105 font-hindi">
                        पूरी खबर पढ़ें →
                      </Button>
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
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm hover:bg-black hover:text-white border-2 border-gray-300 transition-all duration-300"
            onClick={prevSlide}
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm hover:bg-black hover:text-white border-2 border-gray-300 transition-all duration-300"
            onClick={nextSlide}
          >
            <ChevronRight className="w-6 h-6" />
          </Button>

          {/* Slide Indicators */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {latestNews.map((_, index) => (
              <button
                key={index}
                className={`w-3 h-3 rounded-full transition-all duration-300 border-2 ${
                  index === currentSlide
                    ? "bg-black border-black scale-125"
                    : "bg-white border-gray-400 hover:border-black hover:bg-gray-200"
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
                width: `${((currentSlide + 1) / latestNews.length) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Thumbnail Navigation */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-4">
          {latestNews.map((news, index) => (
            <button
              key={news.id}
              onClick={() => goToSlide(index)}
              className={`relative overflow-hidden rounded-lg transition-all duration-300 transform hover:scale-105 border-2 ${
                index === currentSlide ? "border-black shadow-lg" : "border-gray-300 hover:border-gray-500"
              }`}
            >
              <Image
                src={news.image || "/placeholder.svg"}
                alt={news.title}
                width={200}
                height={120}
                className="w-full h-20 object-cover"
              />
              <div className="absolute inset-0 bg-black/20 hover:bg-black/10 transition-all duration-300" />
              <div className="absolute bottom-1 left-1 right-1">
                <p className="text-white text-xs font-hindi font-semibold line-clamp-2 drop-shadow-lg">{news.title}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
