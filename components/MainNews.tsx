import Image from "next/image"
import { Badge } from "@/components/ui/badge"

const mainNews = {
  title: "अमेरिका के लॉस एंजिल्स में भीषण आग, हजारों लोगों को सुरक्षित स्थानों पर पहुंचाया गया",
  category: "विदेश",
  image: "/placeholder.svg?height=400&width=600",
  time: "2 घंटे पहले",
}

const sideNews = [
  {
    title: "भारतीय क्रिकेट टीम की जीत से देशभर में खुशी",
    category: "खेल",
    image: "/placeholder.svg?height=200&width=300",
    time: "1 घंटे पहले",
  },
  {
    title: "बॉलीवुड स्टार की नई फिल्म का ट्रेलर रिलीज",
    category: "मनोरंजन",
    image: "/placeholder.svg?height=200&width=300",
    time: "3 घंटे पहले",
  },
  {
    title: "दिल्ली में प्रदूषण का स्तर खतरनाक, सरकार ने जारी की एडवाइजरी",
    category: "भारत",
    image: "/placeholder.svg?height=200&width=300",
    time: "4 घंटे पहले",
  },
  {
    title: "शेयर बाजार में तेजी, सेंसेक्स नए रिकॉर्ड पर",
    category: "बिजनेस",
    image: "/placeholder.svg?height=200&width=300",
    time: "5 घंटे पहले",
  },
]

export default function MainNews() {
  return (
    <section className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
        {/* Main Story */}
        <div className="space-y-4">
          <div className="relative">
            <Image
              src={mainNews.image || "/placeholder.svg"}
              alt={mainNews.title}
              width={600}
              height={400}
              className="w-full h-64 object-cover rounded-lg"
              loading="lazy"
            />
            <Badge className="absolute top-4 left-4 bg-orange-600 hover:bg-orange-700">{mainNews.category}</Badge>
          </div>
          <div className="space-y-2">
            <h2
              className="text-xl lg:text-2xl font-bold text-gray-900 leading-tight hover:text-orange-600 transition-colors cursor-pointer"
              style={{ fontFamily: "Noto Sans Devanagari, sans-serif" }}
            >
              {mainNews.title}
            </h2>
            <p className="text-sm text-gray-500">{mainNews.time}</p>
          </div>
        </div>

        {/* Side Stories */}
        <div className="space-y-4">
          {sideNews.map((news, index) => (
            <div
              key={index}
              className="flex space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
            >
              <Image
                src={news.image || "/placeholder.svg"}
                alt={news.title}
                width={120}
                height={80}
                className="w-20 h-16 object-cover rounded flex-shrink-0"
                loading="lazy"
              />
              <div className="flex-1 space-y-1">
                <Badge variant="outline" className="text-xs">
                  {news.category}
                </Badge>
                <h3
                  className="text-sm font-semibold text-gray-900 line-clamp-2 hover:text-orange-600 transition-colors"
                  style={{ fontFamily: "Noto Sans Devanagari, sans-serif" }}
                >
                  {news.title}
                </h3>
                <p className="text-xs text-gray-500">{news.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
