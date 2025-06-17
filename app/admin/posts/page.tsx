"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Edit, Trash2, Plus, Search, Filter, Eye, Calendar } from "lucide-react"
import AdminLayout from "@/components/admin/AdminLayout"
import { Post, updatePost, deletePost } from "@/lib/firebase-posts"
import { useRouter } from "next/navigation"
import { getFirebaseDb } from "@/lib/firebase-config"
import { collection, getDocs } from "firebase/firestore"

export default function ManageNewsPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [language, setLanguage] = useState<"hindi" | "english">("hindi")
  const [categories, setCategories] = useState<{id: string, name: string}[]>([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const router = useRouter()

  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true)
      const db = await getFirebaseDb()
      const categoriesSnapshot = await getDocs(collection(db, "categories"))
      
      const categoriesList: {id: string, name: string}[] = []
      
      categoriesSnapshot.forEach((doc) => {
        const data = doc.data()
        if (data.isActive !== false) {
          categoriesList.push({
            id: doc.id,
            name: data.name || ""
          })
        }
      })
      
      setCategories(categoriesList)
    } catch (error) {
      console.error("Error fetching categories:", error)
    } finally {
      setCategoriesLoading(false)
    }
  }

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true)
        console.log("Fetching posts from Firestore directly...")
        
        const db = await getFirebaseDb()
        const querySnapshot = await getDocs(collection(db, "posts"))
        
        const fetchedPosts: Post[] = []
        querySnapshot.forEach((doc) => {
          fetchedPosts.push({ id: doc.id, ...doc.data() } as Post)
        })
        
        console.log("Fetched posts directly:", fetchedPosts)
        
        if (fetchedPosts.length === 0) {
          console.log("No posts found in Firestore.")
        }
        
        setPosts(fetchedPosts)
        setFilteredPosts(fetchedPosts)
      } catch (error) {
        console.error("Error fetching posts:", error)
      } finally {
        setLoading(false)
      }
    }

    if (mounted) {
      fetchPosts()
      fetchCategories()
    }
  }, [mounted])

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    let filtered = posts

    if (searchTerm) {
      filtered = filtered.filter(
        (post) =>
          post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          post.author.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter((post) => post.category === categoryFilter)
    }

    setFilteredPosts(filtered)
  }, [searchTerm, categoryFilter, posts])

  const handleDelete = async (id: string) => {
    if (confirm(language === "hindi" ? "क्या आप वाकई इस पोस्ट को डिलीट करना चाहते हैं?" : "Are you sure you want to delete this post?")) {
      try {
        setLoading(true)
        const post = posts.find(p => p.id === id)
        if (post && post.id) {
          await deletePost(post.id, post.imageUrl)
          setPosts(posts.filter((post) => post.id !== id))
        }
      } catch (error) {
        console.error("Error deleting post:", error)
        alert(language === "hindi" ? "पोस्ट डिलीट करने में त्रुटि हुई" : "Error deleting post")
      } finally {
        setLoading(false)
      }
    }
  }

  const toggleStatus = async (id: string) => {
    try {
      setLoading(true)
      const post = posts.find(p => p.id === id)
      if (post && post.id) {
        const newStatus = post.status === "published" ? "draft" : "published"
        await updatePost(post.id, { status: newStatus })
        
        setPosts(
          posts.map((p) =>
            p.id === id ? { ...p, status: newStatus } : p,
          ),
        )
      }
    } catch (error) {
      console.error("Error updating post status:", error)
      alert(language === "hindi" ? "पोस्ट स्टेटस अपडेट करने में त्रुटि हुई" : "Error updating post status")
    } finally {
      setLoading(false)
    }
  }

  const handleEditPost = (id: string) => {
    router.push(`/admin/posts/edit/${id}`)
  }

  if (!mounted) {
    return null
  }

  return (
    <AdminLayout title={language === "hindi" ? "समाचार प्रबंधन" : "News Management"}>
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center space-x-4">
            <Button asChild className="bg-blue-600 hover:bg-blue-700 font-hindi">
              <a href="/admin/posts/new">
                <Plus className="w-4 h-4 mr-2" />
                {language === "hindi" ? "नया पोस्ट" : "New Post"}
              </a>
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="border-gray-700 bg-gray-800">
          <CardHeader>
            <CardTitle className="text-white font-hindi flex items-center">
              <Filter className="w-5 h-5 mr-2" />
              {language === "hindi" ? "फिल्टर और खोज" : "Filter and Search"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder={language === "hindi" ? "शीर्षक या लेखक खोजें..." : "Search title or author..."}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-700 border-gray-600 text-white font-hindi"
                />
              </div>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white font-hindi">
                  <SelectValue placeholder={language === "hindi" ? "श्रेणी चुनें" : "Select Category"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="font-hindi">
                    {language === "hindi" ? "सभी श्रेणियां" : "All Categories"}
                  </SelectItem>
                  {categoriesLoading ? (
                    <SelectItem value="loading" disabled className="font-hindi">
                      {language === "hindi" ? "लोड हो रहा है..." : "Loading..."}
                    </SelectItem>
                  ) : categories.length === 0 ? (
                    <SelectItem value="no-categories" disabled className="font-hindi">
                      {language === "hindi" ? "कोई श्रेणी नहीं मिली" : "No categories found"}
                    </SelectItem>
                  ) : (
                    categories.map((category) => (
                      <SelectItem key={category.id} value={category.id} className="font-hindi">
                        {category.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Posts List */}
        <Card className="border-gray-700 bg-gray-800">
          <CardHeader>
            <CardTitle className="text-white font-hindi">
              {language === "hindi" 
                ? `सभी पोस्ट्स (${filteredPosts.length})` 
                : `All Posts (${filteredPosts.length})`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <p className="text-gray-500 font-hindi">
                  {language === "hindi" ? "लोड हो रहा है..." : "Loading..."}
                </p>
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 font-hindi">
                  {language === "hindi" ? "कोई पोस्ट नहीं मिला" : "No posts found"}
                </p>
                <Button asChild className="mt-4 font-hindi">
                  <a href="/admin/posts/new">
                    {language === "hindi" ? "पहला पोस्ट बनाएं" : "Create First Post"}
                  </a>
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-3 px-4 text-gray-300 font-hindi">
                        {language === "hindi" ? "शीर्षक" : "Title"}
                      </th>
                      <th className="text-left py-3 px-4 text-gray-300 font-hindi">
                        {language === "hindi" ? "श्रेणी" : "Category"}
                      </th>
                      <th className="text-left py-3 px-4 text-gray-300 font-hindi">
                        {language === "hindi" ? "लेखक" : "Author"}
                      </th>
                      <th className="text-left py-3 px-4 text-gray-300 font-hindi">
                        {language === "hindi" ? "स्थिति" : "Status"}
                      </th>
                      <th className="text-left py-3 px-4 text-gray-300 font-hindi">
                        {language === "hindi" ? "व्यूज" : "Views"}
                      </th>
                      <th className="text-left py-3 px-4 text-gray-300 font-hindi">
                        {language === "hindi" ? "दिनांक" : "Date"}
                      </th>
                      <th className="text-left py-3 px-4 text-gray-300 font-hindi">
                        {language === "hindi" ? "एक्शन" : "Action"}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPosts.map((post) => (
                      <tr key={post.id} className="border-b border-gray-700 hover:bg-gray-700">
                        <td className="py-3 px-4">
                          <div className="space-y-1">
                            <div className="font-medium text-white font-hindi flex items-center">
                              {post.title}
                              {post.isBreaking && <Badge className="ml-2 bg-red-600 text-white text-xs">
                                {language === "hindi" ? "ब्रेकिंग" : "Breaking"}
                              </Badge>}
                            </div>
                            {post.tags && post.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {post.tags.slice(0, 3).map((tag, index) => (
                                  <Badge
                                    key={index}
                                    variant="outline"
                                    className="text-xs border-gray-600 text-gray-400"
                                  >
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="outline" className="font-hindi border-blue-500 text-blue-400">
                            {post.categoryName || post.category}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-gray-300 font-hindi">{post.author}</span>
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => post.id && toggleStatus(post.id)}
                            className={`px-3 py-1 rounded-full text-sm font-hindi ${
                              post.status === "published"
                                ? "bg-green-600 text-white hover:bg-green-700"
                                : "bg-yellow-600 text-white hover:bg-yellow-700"
                            }`}
                          >
                            {post.status === "published" 
                              ? (language === "hindi" ? "प्रकाशित" : "Published") 
                              : (language === "hindi" ? "ड्राफ्ट" : "Draft")}
                          </button>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center text-gray-400">
                            <Eye className="w-4 h-4 mr-1" />
                            {post.views.toLocaleString()}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center text-gray-400">
                            <Calendar className="w-4 h-4 mr-1" />
                            {post.createdAt 
                              ? new Date(post.createdAt.seconds * 1000).toLocaleDateString(
                                  language === "hindi" ? "hi-IN" : "en-US"
                                )
                              : "-"}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => post.id && handleEditPost(post.id)}
                              className="text-blue-400 hover:bg-blue-600 hover:text-white"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => post.id && handleDelete(post.id)}
                              className="text-red-400 hover:bg-red-600 hover:text-white"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
