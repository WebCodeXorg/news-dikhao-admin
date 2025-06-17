"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import AdminLayout from "@/components/admin/AdminLayout"
import { getFirebaseDb } from "@/lib/firebase-config"
import { collection, getDocs } from "firebase/firestore"

export default function DebugPage() {
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAllPosts = async () => {
      try {
        setLoading(true)
        console.log("Fetching all documents from posts collection...")
        
        const db = await getFirebaseDb()
        const querySnapshot = await getDocs(collection(db, "posts"))
        
        const allPosts: any[] = []
        querySnapshot.forEach((doc) => {
          allPosts.push({
            id: doc.id,
            ...doc.data()
          })
        })
        
        console.log(`Found ${allPosts.length} posts in Firestore`)
        setPosts(allPosts)
      } catch (err: any) {
        console.error("Error fetching posts:", err)
        setError(err.message || "Failed to load posts")
      } finally {
        setLoading(false)
      }
    }

    fetchAllPosts()
  }, [])

  return (
    <AdminLayout title="डेबग पेज">
      <Card className="border-gray-700 bg-gray-800 shadow-lg mb-6">
        <CardHeader className="bg-gray-750">
          <CardTitle className="text-white font-hindi text-xl">
            फायरस्टोर डेटा डिबगिंग
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {loading ? (
            <p className="text-white">लोड हो रहा है...</p>
          ) : error ? (
            <p className="text-red-500">त्रुटि: {error}</p>
          ) : posts.length === 0 ? (
            <p className="text-white">कोई पोस्ट नहीं मिला</p>
          ) : (
            <div className="space-y-6">
              <p className="text-white font-hindi">कुल पोस्ट: {posts.length}</p>
              
              {posts.map((post) => (
                <Card key={post.id} className="border-gray-600 bg-gray-700 shadow">
                  <CardHeader className="bg-gray-650">
                    <CardTitle className="text-white font-hindi text-lg">
                      {post.title || "No Title"} (ID: {post.id})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="bg-gray-800 p-4 rounded overflow-auto max-h-96">
                      <pre className="text-green-400 text-sm whitespace-pre-wrap">
                        {JSON.stringify(post, null, 2)}
                      </pre>
                    </div>
                    
                    <div className="mt-4 grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-white font-hindi mb-2">महत्वपूर्ण फील्ड्स:</h4>
                        <ul className="list-disc list-inside text-gray-300 space-y-1">
                          <li>स्थिति: <span className={post.status === "published" ? "text-green-400" : "text-yellow-400"}>
                            {post.status || "अज्ञात"}
                          </span></li>
                          <li>श्रेणी: {post.category || "अज्ञात"}</li>
                          <li>भाषा: {post.language || "अज्ञात"}</li>
                          <li>इमेज URL: {post.imageUrl ? "उपलब्ध" : "अनुपलब्ध"}</li>
                          <li>एक्सरप्ट: {post.excerpt ? "उपलब्ध" : "अनुपलब्ध"}</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-white font-hindi mb-2">टाइमस्टैम्प:</h4>
                        <ul className="list-disc list-inside text-gray-300 space-y-1">
                          <li>क्रिएटेड: {post.createdAt ? new Date(post.createdAt.seconds * 1000).toLocaleString() : "अज्ञात"}</li>
                          <li>अपडेटेड: {post.updatedAt ? new Date(post.updatedAt.seconds * 1000).toLocaleString() : "अज्ञात"}</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  )
} 