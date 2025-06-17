import Header from "@/components/Header"
import BreakingNews from "@/components/BreakingNews"
import HomeSlider from "@/components/HomeSlider"
import RealNewsGrid from "@/components/RealNewsGrid"
import Footer from "@/components/Footer"

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <BreakingNews />
      
      {/* Hero Section */}
      <section className="bg-gray-100 py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <h2 className="text-xl font-bold text-black font-hindi">प्रमुख समाचार</h2>
              <div className="h-1 w-12 bg-black ml-2 mt-1"></div>
            </div>
          </div>
          <HomeSlider />
        </div>
      </section>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-6">
          {/* Main Content */}
          <div className="space-y-6">
            <RealNewsGrid />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
