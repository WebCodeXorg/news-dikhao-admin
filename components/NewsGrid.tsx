import Image from "next/image"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Clock, Eye, Share2 } from "lucide-react"

interface NewsItem {
  id: string | number
  title: string
  category: string
  image: string
  time: string
  views: string
  excerpt: string
}

interface NewsGridProps {
  newsData?: NewsItem[]
}

const defaultNewsData: NewsItem[] = [
  {
    id: 1,
    title: "राजस्थान में किसानों के लिए नई योजना की घोषणा, सरकार देगी बड़ी राहत",
    category: "भारत",
    image: "/placeholder.svg?height=300&width=500",
    time: "2 घंटे पहले",
    views: "12.5K",
    excerpt: "राज्य सरकार ने किसानों की आर्थिक स्थिति सुधारने के लिए व्यापक योजना का ऐलान किया है।",
  },
  {
    id: 2,
    title: "बॉलीवुड में नई फिल्मों की धूम, दर्शकों में बढ़ता उत्साह",
    category: "मनोरंजन",
    image: "/placeholder.svg?height=300&width=500",
    time: "3 घंटे पहले",
    views: "8.7K",
    excerpt: "इस साल कई बड़ी फिल्में रिलीज होने वाली हैं जिनका दर्शक बेसब्री से इंतजार कर रहे हैं।",
  },
  {
    id: 3,
    title: "टेक्नोलॉजी सेक्टर में नई नौकरियों के सुनहरे अवसर",
    category: "टेक्नोलॉजी",
    image: "/placeholder.svg?height=300&width=500",
    time: "4 घंटे पहले",
    views: "15.2K",
    excerpt: "आईटी कंपनियों में बड़े पैमाने पर भर्तियां शुरू हो गई हैं।",
  },
  {
    id: 4,
    title: "ओलंपिक की तैयारी में जुटे भारतीय खिलाड़ी, मेडल की उम्मीदें बढ़ीं",
    category: "खेल",
    image: "/placeholder.svg?height=300&width=500",
    time: "5 घंटे पहले",
    views: "9.8K",
    excerpt: "पेरिस ओलंपिक के लिए भारतीय एथलीट कड़ी मेहनत कर रहे हैं।",
  },
  {
    id: 5,
    title: "स्वास्थ्य मंत्रालय की नई गाइडलाइन्स, बेहतर इलाज की गारंटी",
    category: "स्वास्थ्य",
    image: "/placeholder.svg?height=300&width=500",
    time: "6 घंटे पहले",
    views: "11.3K",
    excerpt: "कोविड के बाद स्वास्थ्य सेवाओं में सुधार के लिए नए दिशा-निर्देश जारी किए गए हैं।",
  },
  {
    id: 6,
    title: "पर्यावरण संरक्षण के लिए नई पहल, हरित भविष्य की दिशा",
    category: "पर्यावरण",
    image: "/placeholder.svg?height=300&width=500",
    time: "7 घंटे पहले",
    views: "7.9K",
    excerpt: "सरकार ने पर्यावरण बचाने के लिए कई महत्वपूर्ण कदम उठाए हैं।",
  },
]

export default function NewsGrid({ newsData = defaultNewsData }: NewsGridProps) {
  // Function to handle sharing
  const handleShare = async (news: NewsItem) => {
    const shareUrl = `/news/${news.id}`
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: news.title,
          text: news.excerpt,
          url: window.location.origin + shareUrl
        })
      } catch (err) {
        console.error("Error sharing:", err)
      }
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(window.location.origin + shareUrl)
      alert("लिंक कॉपी किया गया")
    }
  }

  return (
    <section className="bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center space-x-4">
            <h2 className="text-4xl font-bold text-black font-hindi">ताजा समाचार</h2>
            <div className="h-1 w-20 bg-black"></div>
          </div>
          <a href="#" className="text-black hover:underline font-hindi font-semibold transition-all duration-300">
            सभी समाचार देखें →
          </a>
        </div>

        {/* News Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {newsData.map((news) => (
            <article
              key={news.id}
              className="group transform transition-all duration-500 hover:scale-105"
            >
              <div className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-200 transition-all duration-500 group-hover:shadow-2xl group-hover:border-black h-full flex flex-col">
                {/* Mobile Layout - Title First */}
                <div className="p-4 sm:hidden">
                  <div className="flex items-center justify-between mb-2">
                    <Badge className="bg-black text-white border-0 hover:bg-gray-800 transition-colors duration-300 font-hindi">
                      {news.category}
                    </Badge>
                    <button 
                      className="bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-black hover:text-white"
                      onClick={(e) => {
                        e.preventDefault();
                        handleShare(news);
                      }}
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                  <Link href={`/news/${news.id}`}>
                    <h3 className="font-bold text-black font-hindi leading-tight text-lg mb-3">
                      {news.title}
                    </h3>
                  </Link>
                </div>

                {/* Image Section */}
                <Link href={`/news/${news.id}`} className="relative overflow-hidden block">
                  <Image
                    src={news.image || "/placeholder.svg"}
                    alt={news.title}
                    width={500}
                    height={300}
                    className="w-full h-48 object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300" />

                  {/* Category Badge - Only visible on desktop */}
                  <Badge className="absolute top-4 left-4 bg-black text-white border-0 hover:bg-gray-800 transition-colors duration-300 font-hindi hidden sm:flex">
                    {news.category}
                  </Badge>

                  {/* Share Button - Only visible on desktop */}
                  <button 
                    className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-black hover:text-white hidden sm:flex"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleShare(news);
                    }}
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </Link>

                {/* Content Section */}
                <div className="p-6 space-y-4 flex-1 flex flex-col">
                  {/* Title - Only visible on desktop */}
                  <Link href={`/news/${news.id}`} className="hidden sm:block flex-1">
                    <h3 className="font-bold text-black font-hindi leading-tight group-hover:text-gray-700 transition-colors duration-300 text-lg line-clamp-2">
                      {news.title}
                    </h3>
                  </Link>

                  {/* Excerpt */}
                  <p className="text-gray-700 font-hindi line-clamp-3 text-sm leading-relaxed">{news.excerpt}</p>

                  {/* Meta Information */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span className="font-hindi">{news.time}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Eye className="w-3 h-3" />
                        <span>{news.views}</span>
                      </div>
                    </div>
                    <Link href={`/news/${news.id}`}>
                      <span className="text-black font-semibold text-sm group-hover:underline transition-all duration-300 font-hindi">
                        पढ़ें →
                      </span>
                    </Link>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Load More Button */}
        <div className="text-center mt-12">
          <button className="bg-black text-white px-8 py-4 rounded-full hover:bg-gray-800 transition-all duration-300 transform hover:scale-105 font-hindi font-semibold">
            और समाचार लोड करें
          </button>
        </div>
      </div>
    </section>
  )
}
