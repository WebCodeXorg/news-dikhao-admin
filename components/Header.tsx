"use client"

import { useState, useEffect } from "react"
import { Menu, X, Search, Bell, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Image from "next/image"
import Link from "next/link"
import { getFirebaseDb } from "@/lib/firebase-config"
import { collection, getDocs, query, where, orderBy } from "firebase/firestore"

interface Category {
  id: string
  name: string
  slug: string
  isActive: boolean
  postCount?: number
  createdAt?: any
}

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Always include Home as first category
  const homeCategory = { id: "home", name: "होम", slug: "/", isActive: true }

  // Fetch categories from Firebase
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true)
        const db = await getFirebaseDb()
        
        // Create a query to get only active categories
        const categoriesQuery = query(
          collection(db, "categories"),
          where("isActive", "==", true)
        )
        
        const snapshot = await getDocs(categoriesQuery)
        
        const fetchedCategories: Category[] = []
        snapshot.forEach((doc) => {
          const data = doc.data()
          // Store the slug without the leading slash for dynamic routing
          const categorySlug = data.slug || doc.id
          fetchedCategories.push({
            id: doc.id,
            name: data.name || "",
            slug: categorySlug, // Store without leading slash
            isActive: data.isActive !== false,
            postCount: data.postCount || 0,
            createdAt: data.createdAt
          })
        })
        
        console.log("Fetched categories:", fetchedCategories)
        
        // Set categories with Home first, then fetched categories
        setCategories([homeCategory, ...fetchedCategories])
      } catch (err) {
        console.error("Error fetching categories:", err)
        setError("Failed to load categories")
        // Only use home category if fetch fails
        setCategories([homeCategory])
      } finally {
        setLoading(false)
      }
    }
    
    fetchCategories()
  }, [])

  return (
    <header className="bg-white shadow-xl sticky top-0 z-50 border-b border-gray-200">
      {/* Top Bar */}
      <div className="bg-black text-white py-2">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center space-x-4">
              <span className="font-hindi">आज का दिन: {new Date().toLocaleDateString("hi-IN")}</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="font-hindi">ताजा अपडेट के लिए फॉलो करें</span>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-white hover:bg-white hover:text-black transition-all duration-300"
                >
                  <Bell className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/">
              <Image
                src="https://res.cloudinary.com/divmafjmq/image/upload/v1750128275/newsdikhao_posts/uglrpjygru2op6xgmwba.jpg"
                alt="News Dikhao"
                width={150}
                height={150}
                className="h-20 w-auto transition-all duration-300 hover:scale-105 cursor-pointer rounded-lg"
                priority
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {loading ? (
              <div className="flex items-center px-4 py-2">
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                <span className="text-gray-600 font-hindi">लोड हो रहा है...</span>
              </div>
            ) : (
              categories.map((category) => (
                <Link
                  key={category.id}
                  href={category.id === "home" ? "/" : `/${category.slug}`}
                  className="relative px-4 py-2 text-gray-800 hover:text-black font-semibold font-hindi transition-all duration-300 group"
                >
                  {category.name}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-black transition-all duration-300 group-hover:w-full"></span>
                  <span className="absolute inset-0 bg-gray-100 opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-lg -z-10"></span>
                </Link>
              ))
            )}
          </nav>

          {/* Search & Mobile Menu */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center">
              <div className="relative group">
                <Input
                  placeholder="समाचार खोजें..."
                  className="w-80 pr-12 border-2 border-gray-300 focus:border-black transition-all duration-300 rounded-full bg-gray-50 focus:bg-white"
                />
                <Button
                  size="icon"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-black hover:bg-gray-800 text-white rounded-full transition-all duration-300"
                >
                  <Search className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden hover:bg-gray-100 transition-colors duration-300 rounded-full"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-200 shadow-lg animate-in slide-in-from-top-2 duration-300">
          <div className="container mx-auto px-4 py-4 space-y-2">
            {loading ? (
              <div className="flex items-center justify-center py-3 px-4">
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                <span className="text-gray-600 font-hindi">श्रेणियां लोड हो रही हैं...</span>
              </div>
            ) : (
              categories.map((category) => (
                <Link
                  key={category.id}
                  href={category.id === "home" ? "/" : `/${category.slug}`}
                  className="block py-3 px-4 text-gray-800 hover:text-black hover:bg-gray-100 font-hindi transition-all duration-300 rounded-lg"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {category.name}
                </Link>
              ))
            )}
            <div className="pt-3 border-t border-gray-200">
              <div className="relative">
                <Input
                  placeholder="समाचार खोजें..."
                  className="w-full pr-12 border-2 border-gray-300 focus:border-black transition-all duration-300 rounded-full"
                />
                <Button
                  size="icon"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-black hover:bg-gray-800 text-white rounded-full"
                >
                  <Search className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
