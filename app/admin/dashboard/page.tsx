"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, Eye, Plus, Tag, MessageSquare, Calendar, Activity, Clock, TrendingUp, Users } from "lucide-react"
import AdminLayout from "@/components/admin/AdminLayout"
import StorageUsage from "@/components/admin/StorageUsage"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { getFirebaseDb } from "@/lib/firebase-config"
import { collection, getDocs, query, where, orderBy, limit } from "firebase/firestore"

const stats = [
  { title: "कुल समाचार", value: "0", icon: FileText, change: "लोड हो रहा है...", color: "bg-blue-500" },
  { title: "कुल श्रेणियां", value: "0", icon: Tag, change: "लोड हो रहा है...", color: "bg-green-500" },
  { title: "कुल कमेंट्स", value: "0", icon: MessageSquare, change: "नया काउंट", color: "bg-purple-500" },
  { title: "आज के व्यूज", value: "0", icon: Eye, change: "नया काउंट", color: "bg-orange-500" },
]

const recentActivities = [
  {
    action: "नया डैशबोर्ड सेटअप",
    item: "सभी काउंट रीसेट",
    time: "अभी",
    type: "system",
    user: "एडमिन",
  }
]

const quickActions = [
  { title: "नया समाचार", description: "नया समाचार लेख बनाएं", href: "/admin/posts/new", color: "bg-blue-600" },
  { title: "श्रेणी प्रबंधन", description: "श्रेणियां जोड़ें या संपादित करें", href: "/admin/categories", color: "bg-purple-600" },
]

export default function AdminDashboard() {
  const [mounted, setMounted] = useState(false)
  const [language, setLanguage] = useState<"hindi" | "english">("hindi")
  const [statsData, setStatsData] = useState(stats)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setMounted(true)
    fetchData()
  }, [])
  
  // Fetch actual data from Firebase
  const fetchData = async () => {
    try {
      setIsLoading(true)
      const db = await getFirebaseDb()
      
      // Fetch posts count
      const postsSnapshot = await getDocs(collection(db, "posts"))
      const postsCount = postsSnapshot.size
      
      // Fetch categories count
      const categoriesSnapshot = await getDocs(collection(db, "categories"))
      const categoriesCount = categoriesSnapshot.size
      
      // Update stats with real data
      const updatedStats = [...statsData]
      updatedStats[0] = {
        ...updatedStats[0],
        value: postsCount.toString(),
        change: "वास्तविक संख्या"
      }
      updatedStats[1] = {
        ...updatedStats[1],
        value: categoriesCount.toString(),
        change: "वास्तविक संख्या"
      }
      
      setStatsData(updatedStats)
      setIsLoading(false)
    } catch (error) {
      console.error("Error fetching data:", error)
      setIsLoading(false)
    }
  }

  if (!mounted) {
    return null
  }

  // Zero data for the charts
  const viewsData = [
    { name: "सोम", views: 0 },
    { name: "मंगल", views: 0 },
    { name: "बुध", views: 0 },
    { name: "गुरु", views: 0 },
    { name: "शुक्र", views: 0 },
    { name: "शनि", views: 0 },
    { name: "रवि", views: 0 },
  ]

  return (
    <AdminLayout title={language === "hindi" ? "डैशबोर्ड" : "Dashboard"}>
      <div className="space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsData.map((stat, index) => (
            <Card key={index} className="transition-all duration-300 hover:shadow-lg border-gray-700 bg-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400 font-hindi">{stat.title}</p>
                    <p className="text-2xl font-bold text-white">{isLoading ? "..." : stat.value}</p>
                    <p className="text-sm text-gray-400">{stat.change}</p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.color}`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white font-hindi flex items-center">
              <Plus className="w-5 h-5 mr-2" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  asChild
                  className={`${action.color} hover:opacity-90 text-white font-hindi h-auto p-4 flex flex-col items-start`}
                >
                  <a href={action.href}>
                    <div className="font-semibold mb-1">{action.title}</div>
                    <div className="text-sm opacity-90">{action.description}</div>
                  </a>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activities */}
          <Card className="border-gray-700 bg-gray-800">
            <CardHeader>
              <CardTitle className="text-white font-hindi flex items-center">
                <Activity className="w-5 h-5 mr-2" />
                हाल की गतिविधियां
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-4 p-3 rounded-lg bg-gray-700">
                    <div className="flex-1">
                      <p className="font-semibold text-white font-hindi">{activity.action}</p>
                      <p className="text-sm text-gray-300 font-hindi">{activity.item}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-400">{activity.time}</span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-400">{activity.user}</span>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className="border-blue-500 text-blue-400"
                    >
                      {activity.type}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Today's Summary */}
          <Card className="border-gray-700 bg-gray-800">
            <CardHeader>
              <CardTitle className="text-white font-hindi flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                आज का सारांश
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 rounded-lg bg-gray-700">
                  <span className="text-gray-300 font-hindi">प्रकाशित समाचार</span>
                  <span className="text-white font-bold">0</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-gray-700">
                  <span className="text-gray-300 font-hindi">ड्राफ्ट समाचार</span>
                  <span className="text-white font-bold">0</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-gray-700">
                  <span className="text-gray-300 font-hindi">पेंडिंग कमेंट्स</span>
                  <span className="text-white font-bold">0</span>
                </div>

                <div className="flex justify-between items-center p-3 rounded-lg bg-gray-700">
                  <span className="text-gray-300 font-hindi">नए यूजर्स</span>
                  <span className="text-white font-bold">0</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Status */}
        <Card className="border-gray-700 bg-gray-800">
          <CardHeader>
            <CardTitle className="text-white font-hindi">सिस्टम स्थिति</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-700">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-300 font-hindi">Firebase कनेक्शन</span>
                <Badge className="bg-green-600 text-white">ऑनलाइन</Badge>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-700">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-300 font-hindi">डेटाबेस</span>
                <Badge className="bg-green-600 text-white">सक्रिय</Badge>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-700">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-300 font-hindi">स्टोरेज</span>
                <Badge className="bg-green-600 text-white">उपलब्ध</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Charts */}
          <Card className="border-gray-700 bg-gray-800 shadow-lg lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-white font-hindi">
                {language === "hindi" ? "पिछले 7 दिनों के व्यूज" : "Views - Last 7 Days"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={viewsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="name" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "#1f2937", 
                        border: "1px solid #374151",
                        color: "#e5e7eb"
                      }} 
                    />
                    <Bar dataKey="views" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Storage Usage */}
          <StorageUsage language={language} />
        </div>
      </div>
    </AdminLayout>
  )
}
