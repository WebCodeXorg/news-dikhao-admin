'use client'

import Image from 'next/image'
import { FC } from 'react'

const Home: FC = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center">
      {/* Logo Container */}
      <div className="relative w-48 h-48 mb-6">
        <Image
          src="https://res.cloudinary.com/divmafjmq/image/upload/v1750128275/newsdikhao_posts/uglrpjygru2op6xgmwba.jpg"
          alt="News Dikhao Logo"
          fill
          className="object-contain"
          priority
        />
      </div>

      {/* App Name */}
      <h1 className="text-4xl font-bold text-gray-800 mb-2">
        News Dikhao Admin
      </h1>

      {/* Animated Loading Line */}
      <div className="w-64 h-1 bg-gray-200 rounded-full mt-6 overflow-hidden">
        <div className="w-full h-full bg-blue-500 animate-[loading_1.5s_ease-in-out_infinite]"></div>
      </div>
    </div>
  )
}

export default Home 