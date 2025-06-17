import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bell, Mail, Smartphone, Newspaper, Video, Users } from "lucide-react"

export default function AdditionalCards() {
  return (
    <section className="bg-white py-16 border-t border-gray-200">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-black font-hindi mb-4">और भी बहुत कुछ</h2>
          <p className="text-gray-600 font-hindi text-lg">News Dikhao के साथ जुड़े रहें और पाएं बेहतरीन सेवाएं</p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {/* Newsletter Card */}
          <Card className="group hover:shadow-2xl transition-all duration-500 border-2 border-gray-200 hover:border-black">
            <CardHeader className="text-center">
              <div className="bg-black p-4 rounded-full w-16 h-16 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Mail className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-xl font-bold font-hindi">न्यूज़लेटर</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-gray-600 font-hindi">रोजाना की ताजा खबरें सीधे आपके ईमेल पर पाएं</p>
              <Button className="w-full bg-black text-white hover:bg-gray-800 font-hindi">सब्स्क्राइब करें</Button>
            </CardContent>
          </Card>

          {/* Mobile App Card */}
          <Card className="group hover:shadow-2xl transition-all duration-500 border-2 border-gray-200 hover:border-black">
            <CardHeader className="text-center">
              <div className="bg-black p-4 rounded-full w-16 h-16 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Smartphone className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-xl font-bold font-hindi">मोबाइल ऐप</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-gray-600 font-hindi">कहीं भी, कभी भी समाचार पढ़ें हमारे मोबाइल ऐप के साथ</p>
              <div className="space-y-2">
                <Button className="w-full bg-black text-white hover:bg-gray-800 font-hindi">
                  📱 Android डाउनलोड करें
                </Button>
                <Button variant="outline" className="w-full border-2 border-gray-300 hover:border-black font-hindi">
                  🍎 iOS डाउनलोड करें
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Breaking News Alerts Card */}
          <Card className="group hover:shadow-2xl transition-all duration-500 border-2 border-gray-200 hover:border-black">
            <CardHeader className="text-center">
              <div className="bg-red-600 p-4 rounded-full w-16 h-16 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Bell className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-xl font-bold font-hindi">ब्रेकिंग न्यूज़ अलर्ट</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-gray-600 font-hindi">महत्वपूर्ण खबरों की तुरंत जानकारी पाएं</p>
              <Button className="w-full bg-red-600 text-white hover:bg-red-700 font-hindi">अलर्ट चालू करें</Button>
            </CardContent>
          </Card>
        </div>

        {/* Featured Content Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Video Section Card */}
          <Card className="group hover:shadow-2xl transition-all duration-500 border-2 border-gray-200 hover:border-black overflow-hidden">
            <div className="relative">
              <Image
                src="/placeholder.svg?height=200&width=400"
                alt="Video Content"
                width={400}
                height={200}
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <div className="bg-white/90 p-4 rounded-full group-hover:scale-110 transition-transform duration-300">
                  <Video className="w-8 h-8 text-black" />
                </div>
              </div>
              <Badge className="absolute top-4 left-4 bg-red-600 text-white">लाइव</Badge>
            </div>
            <CardContent className="p-6">
              <h3 className="text-xl font-bold font-hindi mb-2">वीडियो न्यूज़</h3>
              <p className="text-gray-600 font-hindi mb-4">देखें ताजा खबरों के वीडियो और लाइव अपडेट्स</p>
              <Button className="bg-black text-white hover:bg-gray-800 font-hindi">वीडियो देखें →</Button>
            </CardContent>
          </Card>

          {/* Community Card */}
          <Card className="group hover:shadow-2xl transition-all duration-500 border-2 border-gray-200 hover:border-black">
            <CardHeader>
              <div className="flex items-center space-x-4">
                <div className="bg-blue-600 p-3 rounded-full group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold font-hindi">हमारा कम्युनिटी</CardTitle>
                  <p className="text-gray-600 font-hindi">50 लाख+ पाठक हमारे साथ जुड़े हैं</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-black">50L+</div>
                  <div className="text-sm text-gray-600 font-hindi">मासिक पाठक</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-black">10L+</div>
                  <div className="text-sm text-gray-600 font-hindi">सोशल फॉलोअर्स</div>
                </div>
              </div>
              <Button className="w-full bg-blue-600 text-white hover:bg-blue-700 font-hindi">कम्युनिटी में शामिल हों</Button>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action Section */}
        <div className="mt-16 text-center bg-black text-white rounded-3xl p-12">
          <div className="max-w-3xl mx-auto">
            <Newspaper className="w-16 h-16 mx-auto mb-6 text-white" />
            <h3 className="text-3xl font-bold font-hindi mb-4">News Dikhao के साथ जुड़े रहें</h3>
            <p className="text-gray-300 font-hindi text-lg mb-8">
              भारत की सबसे तेज़ और भरोसेमंद न्यूज़ वेबसाइट से जुड़ें और पाएं ताजा खबरें, विश्वसनीय जानकारी और गहरा विश्लेषण।
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-white text-black hover:bg-gray-200 font-hindi px-8 py-3">होम पेज पर जाएं</Button>
              <Button
                variant="outline"
                className="border-2 border-white text-white hover:bg-white hover:text-black font-hindi px-8 py-3"
              >
                हमसे संपर्क करें
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
