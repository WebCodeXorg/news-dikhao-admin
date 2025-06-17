import { Clock } from "lucide-react"

const latestNews = [
  {
    id: 1,
    title: "भारतीय रेलवे में नई तकनीक का इस्तेमाल शुरू",
    time: "15 मिनट पहले",
    category: "भारत",
  },
  {
    id: 2,
    title: "शेयर बाजार में तेजी, सेंसेक्स नए रिकॉर्ड पर",
    time: "25 मिनट पहले",
    category: "बिजनेस",
  },
  {
    id: 3,
    title: "मौसम विभाग ने जारी की बारिश की चेतावनी",
    time: "35 मिनट पहले",
    category: "मौसम",
  },
  {
    id: 4,
    title: "नई फिल्म का ट्रेलर रिलीज, सोशल मीडिया पर वायरल",
    time: "45 मिनट पहले",
    category: "मनोरंजन",
  },
  {
    id: 5,
    title: "अंतर्राष्ट्रीय योग दिवस की तैयारियां शुरू",
    time: "1 घंटे पहले",
    category: "स्वास्थ्य",
  },
  {
    id: 6,
    title: "साइबर सिक्योरिटी के लिए नए नियम लागू",
    time: "1 घंटे पहले",
    category: "टेक्नोलॉजी",
  },
  {
    id: 7,
    title: "किसान आंदोलन के नए दौर की शुरुआत",
    time: "2 घंटे पहले",
    category: "राजनीति",
  },
  {
    id: 8,
    title: "भारतीय वैज्ञानिकों की नई खोज से उम्मीदें बढ़ीं",
    time: "2 घंटे पहले",
    category: "विज्ञान",
  },
]

export default function LatestNews() {
  return (
    <section className="bg-white rounded-2xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 font-hindi">लेटेस्ट न्यूज़</h2>
        <a href="#" className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors duration-200">
          सभी देखें →
        </a>
      </div>

      <div className="space-y-4">
        {latestNews.map((news) => (
          <article
            key={news.id}
            className="group flex items-start space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-all duration-200 cursor-pointer"
          >
            <div className="flex-shrink-0 w-2 h-2 bg-gray-400 rounded-full mt-3 group-hover:bg-gray-600 transition-colors duration-200"></div>

            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 font-hindi group-hover:text-gray-700 transition-colors duration-200 line-clamp-2">
                {news.title}
              </h3>
              <div className="flex items-center space-x-3 mt-2 text-xs text-gray-500">
                <span className="flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>{news.time}</span>
                </span>
                <span className="px-2 py-1 bg-gray-100 rounded-full text-gray-600">{news.category}</span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
