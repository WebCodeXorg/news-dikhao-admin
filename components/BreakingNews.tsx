"use client"

import { useEffect, useState } from "react"

const breakingNews = [
  "अमेरिका के लॉस एंजिल्स में आग से भारी नुकसान, हजारों लोग बेघर",
  "भारत में नई शिक्षा नीति के तहत बड़े बदलाव की तैयारी",
  "क्रिकेट वर्ल्ड कप में भारतीय टीम का शानदार प्रदर्शन",
  "बॉलीवुड में नई फिल्मों की घोषणा, दर्शकों में उत्साह",
]

export default function BreakingNews() {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % breakingNews.length)
    }, 4000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="bg-red-600 text-white py-2 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="flex items-center">
          <span className="bg-white text-red-600 px-3 py-1 text-sm font-bold mr-4 rounded">ब्रेकिंग न्यूज़</span>
          <div className="flex-1 overflow-hidden">
            <div
              className="whitespace-nowrap animate-pulse transition-all duration-500"
              style={{ fontFamily: "Noto Sans Devanagari, sans-serif" }}
            >
              {breakingNews[currentIndex]}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
