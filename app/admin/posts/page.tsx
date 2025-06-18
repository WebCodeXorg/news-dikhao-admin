"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Edit, Trash2, Plus, Search, Filter, Eye, Calendar, MoreVertical } from "lucide-react"
import AdminLayout from "@/components/admin/AdminLayout"
import { Post, updatePost, deletePost } from "@/lib/firebase-posts"
import { useRouter } from "next/navigation"
import { getFirebaseDb } from "@/lib/firebase-config"
import { collection, getDocs } from "firebase/firestore"
import Image from "next/image"

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
        
        // Get categories to map IDs to names
        const categoriesSnapshot = await getDocs(collection(db, "categories"))
        const categoriesMap = new Map()
        categoriesSnapshot.forEach((doc) => {
          categoriesMap.set(doc.id, doc.data().name)
        })
        
        // Add category names to posts
        const postsWithCategories = fetchedPosts.map(post => ({
          ...post,
          categoryName: categoriesMap.get(post.category) || post.category
        }))
        
        setPosts(postsWithCategories)
        setFilteredPosts(postsWithCategories)
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

        {/* Posts Grid */}
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
                <div className="w-16 h-16 border-4 border-t-blue-600 border-gray-600 rounded-full animate-spin mx-auto"></div>
                <p className="text-gray-500 font-hindi mt-4">
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPosts.map((post) => (
                  <Card key={post.id} className="border-gray-700 bg-gray-750 hover:bg-gray-700 transition-colors">
                    {/* Post Image */}
                    <div className="relative aspect-video">
                      <Image
                        src={post.imageUrl || "/placeholder.jpg"}
                        alt={post.title}
                        fill
                        className="object-cover rounded-t-lg"
                      />
                      {post.isBreaking && (
                        <Badge className="absolute top-2 left-2 bg-red-600 text-white">
                          {language === "hindi" ? "ब्रेकिंग" : "Breaking"}
                        </Badge>
                      )}
                    </div>

                    <CardContent className="p-4">
                      {/* Title */}
                      <h3 className="text-lg font-semibold text-white font-hindi mb-2 line-clamp-2">
                        {post.title}
                      </h3>

                      {/* Category & Status */}
                      <div className="flex items-center justify-between mb-3">
                        <Badge variant="outline" className="font-hindi border-blue-500 text-blue-400">
                          {post.categoryName || post.category}
                        </Badge>
                        <Badge 
                          className={`font-hindi ${
                            post.status === "published"
                              ? "bg-green-600 hover:bg-green-700"
                              : "bg-yellow-600 hover:bg-yellow-700"
                          } text-white`}
                        >
                          {post.status === "published" 
                            ? (language === "hindi" ? "प्रकाशित" : "Published") 
                            : (language === "hindi" ? "ड्राफ्ट" : "Draft")}
                        </Badge>
                      </div>

                      {/* Tags */}
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {post.tags.slice(0, 3).map((tag: string, index: number) => (
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

                      {/* Meta Information */}
                      <div className="flex items-center justify-between text-sm text-gray-400">
                        <div className="flex items-center">
                          <Eye className="w-4 h-4 mr-1" />
                          {post.views.toLocaleString()}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {post.createdAt 
                            ? new Date(post.createdAt.seconds * 1000).toLocaleDateString(
                                language === "hindi" ? "hi-IN" : "en-US"
                              )
                            : "-"}
                        </div>
                      </div>
                    </CardContent>

                    <CardFooter className="px-4 py-3 border-t border-gray-700 flex justify-between">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => post.id && handleEditPost(post.id)}
                        className="text-blue-400 hover:bg-blue-600 hover:text-white"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        {language === "hindi" ? "संपादित करें" : "Edit"}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => post.id && handleDelete(post.id)}
                        className="text-red-400 hover:bg-red-600 hover:text-white"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        {language === "hindi" ? "हटाएं" : "Delete"}
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
