"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, Plus, Tag, Loader2, AlertCircle, CheckCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import AdminLayout from "@/components/admin/AdminLayout"
import { getFirebaseDb } from "@/lib/firebase-config"
import { collection, getDocs, doc, setDoc, deleteDoc, updateDoc, query, where, getDoc } from "firebase/firestore"

interface Category {
  id: string
  name: string
  slug: string
  postCount: number
  isActive: boolean
  createdAt: any
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [formLoading, setFormLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [newCategory, setNewCategory] = useState({
    name: "",
    slug: "",
  })

  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  
  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories()
  }, [])
  
  // Fetch categories from Firestore
  const fetchCategories = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log("Fetching categories...")
      
      const db = await getFirebaseDb()
      const categoriesSnapshot = await getDocs(collection(db, "categories"))
      
      const categoriesList: Category[] = []
      
      categoriesSnapshot.forEach((doc) => {
        const data = doc.data()
        categoriesList.push({
          id: doc.id,
          name: data.name || "",
          slug: data.slug || "",
          postCount: data.postCount || 0,
          isActive: data.isActive !== false, // Default to true
          createdAt: data.createdAt || null
        })
      })
      
      console.log(`Fetched ${categoriesList.length} categories`)
      setCategories(categoriesList)
      
    } catch (err: any) {
      console.error("Error fetching categories:", err)
      setError("श्रेणियां लोड करने में समस्या हुई")
    } finally {
      setLoading(false)
    }
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "")
  }

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCategory.name.trim()) return
    
    setFormLoading(true)
    setError(null)
    setSuccess(null)
    
    try {
      // Use manually entered slug if provided, otherwise generate from name
      let slug = newCategory.slug.trim() ? newCategory.slug.trim() : generateSlug(newCategory.name)
      
      // Check if slug already exists
      const db = await getFirebaseDb()
      const q = query(collection(db, "categories"), where("slug", "==", slug))
      const querySnapshot = await getDocs(q)
      
      if (!querySnapshot.empty) {
        setError("इस स्लग से पहले से श्रेणी मौजूद है")
        setFormLoading(false)
        return
      }
      
      // Create new document with auto-generated ID
      const categoryRef = doc(collection(db, "categories"))
      const categoryId = categoryRef.id
      
      const newCategoryData = {
        id: categoryId,
        name: newCategory.name,
        slug: slug,
        postCount: 0,
        isActive: true,
        createdAt: new Date()
      }
      
      // Save to Firestore
      await setDoc(categoryRef, newCategoryData)
      
      // Add to local state
      setCategories([...categories, newCategoryData])
      
      // Reset form
      setNewCategory({ name: "", slug: "" })
      setSuccess("श्रेणी सफलतापूर्वक जोड़ी गई")
      
    } catch (err: any) {
      console.error("Error adding category:", err)
      setError("श्रेणी जोड़ने में समस्या हुई")
    } finally {
      setFormLoading(false)
    }
  }

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category)
  }

  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingCategory) return
    
    setFormLoading(true)
    setError(null)
    setSuccess(null)
    
    try {
      // Get existing category for comparison
      const existingCategory = categories.find(c => c.id === editingCategory.id)
      if (!existingCategory) throw new Error("Category not found")
      
      // Check if new slug already exists for another category
      const db = await getFirebaseDb()
      
      // Only check if slug changed
      if (existingCategory.slug !== editingCategory.slug) {
        const q = query(
          collection(db, "categories"), 
          where("slug", "==", editingCategory.slug),
          where("id", "!=", editingCategory.id)
        )
        const querySnapshot = await getDocs(q)
        
        if (!querySnapshot.empty) {
          setError("इस स्लग से पहले से श्रेणी मौजूद है")
          setFormLoading(false)
          return
        }
      }
      
      const updatedCategory = {
        ...editingCategory
      }
      
      // Update in Firestore
      await updateDoc(doc(db, "categories", editingCategory.id), updatedCategory)
      
      // Update in local state
      setCategories(categories.map((cat) => (cat.id === editingCategory.id ? updatedCategory : cat)))
      setEditingCategory(null)
      setSuccess("श्रेणी सफलतापूर्वक अपडेट की गई")
      
    } catch (err: any) {
      console.error("Error updating category:", err)
      setError("श्रेणी अपडेट करने में समस्या हुई")
    } finally {
      setFormLoading(false)
    }
  }

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("क्या आप वाकई इस श्रेणी को डिलीट करना चाहते हैं?")) {
      return
    }
    
    // Check if category has posts
    const category = categories.find(c => c.id === id)
    if (category && category.postCount > 0) {
      if (!confirm(`इस श्रेणी में ${category.postCount} पोस्ट हैं। डिलीट करने से पहले इन्हें दूसरी श्रेणी में मूव करें?`)) {
        return
      }
    }
    
    setFormLoading(true)
    setError(null)
    setSuccess(null)
    
    try {
      // Delete from Firestore
      const db = await getFirebaseDb()
      await deleteDoc(doc(db, "categories", id))
      
      // Remove from local state
      setCategories(categories.filter((cat) => cat.id !== id))
      setSuccess("श्रेणी सफलतापूर्वक हटा दी गई")
      
    } catch (err: any) {
      console.error("Error deleting category:", err)
      setError("श्रेणी हटाने में समस्या हुई")
    } finally {
      setFormLoading(false)
    }
  }

  const toggleCategoryStatus = async (id: string) => {
    const category = categories.find(c => c.id === id)
    if (!category) return
    
    setFormLoading(true)
    setError(null)
    setSuccess(null)
    
    try {
      const newStatus = !category.isActive
      
      // Update in Firestore
      const db = await getFirebaseDb()
      await updateDoc(doc(db, "categories", id), {
        isActive: newStatus
      })
      
      // Update in local state
      setCategories(categories.map((cat) => 
        cat.id === id ? { ...cat, isActive: newStatus } : cat
      ))
      
      setSuccess(`श्रेणी अब ${newStatus ? 'सक्रिय' : 'निष्क्रिय'} है`)
      
    } catch (err: any) {
      console.error("Error toggling category status:", err)
      setError("स्थिति बदलने में समस्या हुई")
    } finally {
      setFormLoading(false)
    }
  }
  
  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A";
    
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleString('hi-IN', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
      });
    } catch (err) {
      return "अमान्य तिथि";
    }
  };

  return (
    <AdminLayout title="श्रेणी प्रबंधन">
      <div className="space-y-8">
        {/* Status Alerts */}
        {error && (
          <Alert className="border-red-500 bg-red-500/10">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <AlertDescription className="text-red-500">{error}</AlertDescription>
          </Alert>
        )}
        
        {success && (
          <Alert className="border-green-500 bg-green-500/10">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <AlertDescription className="text-green-500">{success}</AlertDescription>
          </Alert>
        )}
        
        {/* Add New Category */}
        <Card className="border-gray-700 bg-gray-800">
          <CardHeader>
            <CardTitle className="text-white font-hindi flex items-center">
              <Plus className="w-5 h-5 mr-2" />
              नई श्रेणी जोड़ें
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddCategory} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="categoryName" className="text-gray-300 font-hindi">
                    श्रेणी का नाम *
                  </Label>
                  <Input
                    id="categoryName"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                    placeholder="जैसे: स्वास्थ्य, शिक्षा"
                    className="bg-gray-700 border-gray-600 text-white font-hindi"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="categorySlug" className="text-gray-300 font-hindi">
                    स्लग (खाली छोड़ने पर स्वतः बनेगा)
                  </Label>
                  <Input
                    id="categorySlug"
                    value={newCategory.slug}
                    onChange={(e) => setNewCategory({ ...newCategory, slug: e.target.value })}
                    placeholder="जैसे: swasthya, shiksha"
                    className="bg-gray-700 border-gray-600 text-white font-hindi"
                  />
                </div>
              </div>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 font-hindi" disabled={formLoading}>
                {formLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    जोड़ा जा रहा है...
                  </>
                ) : (
                  "श्रेणी जोड़ें"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Edit Category Modal */}
        {editingCategory && (
          <Card className="border-gray-700 bg-gray-800">
            <CardHeader>
              <CardTitle className="text-white font-hindi flex items-center">
                <Edit className="w-5 h-5 mr-2" />
                श्रेणी संपादित करें
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateCategory} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-300 font-hindi">श्रेणी का नाम *</Label>
                    <Input
                      value={editingCategory.name}
                      onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                      className="bg-gray-700 border-gray-600 text-white font-hindi"
                      required
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300 font-hindi">स्लग</Label>
                    <Input
                      value={editingCategory.slug}
                      onChange={(e) => setEditingCategory({ ...editingCategory, slug: e.target.value })}
                      className="bg-gray-700 border-gray-600 text-white font-hindi"
                    />
                  </div>
                </div>
                <div className="flex space-x-4">
                  <Button type="submit" className="bg-green-600 hover:bg-green-700 font-hindi" disabled={formLoading}>
                    {formLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        अपडेट हो रहा है...
                      </>
                    ) : (
                      "अपडेट करें"
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEditingCategory(null)}
                    className="border-gray-600 text-gray-300 hover:bg-gray-700 font-hindi"
                    disabled={formLoading}
                  >
                    रद्द करें
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Categories List */}
        <Card className="border-gray-700 bg-gray-800">
          <CardHeader>
            <CardTitle className="text-white font-hindi flex items-center">
              <Tag className="w-5 h-5 mr-2" />
              सभी श्रेणियां ({categories.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-4" />
                <p className="text-gray-400 font-hindi">श्रेणियां लोड हो रही हैं...</p>
              </div>
            ) : categories.length === 0 ? (
              <div className="text-center py-16">
                <Tag className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-400 font-hindi">कोई श्रेणी नहीं मिली</h3>
                <p className="text-sm text-gray-500 font-hindi mt-2">ऊपर से नई श्रेणी जोड़ें</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-3 px-4 text-gray-300 font-hindi">नाम</th>
                      <th className="text-left py-3 px-4 text-gray-300 font-hindi">स्लग</th>
                      <th className="text-left py-3 px-4 text-gray-300 font-hindi">पोस्ट्स</th>
                      <th className="text-left py-3 px-4 text-gray-300 font-hindi">बनाई गई</th>
                      <th className="text-left py-3 px-4 text-gray-300 font-hindi">स्थिति</th>
                      <th className="text-left py-3 px-4 text-gray-300 font-hindi">एक्शन</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((category) => (
                      <tr key={category.id} className="border-b border-gray-700 hover:bg-gray-700">
                        <td className="py-3 px-4">
                          <div className="font-medium text-white font-hindi">{category.name}</div>
                        </td>
                        <td className="py-3 px-4">
                          <code className="text-gray-400 bg-gray-900 px-2 py-1 rounded text-sm">{category.slug}</code>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="outline" className="text-blue-400 border-blue-400">
                            {category.postCount}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-gray-400 text-sm">{formatDate(category.createdAt)}</span>
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => toggleCategoryStatus(category.id)}
                            className={`px-3 py-1 rounded-full text-sm font-hindi ${
                              category.isActive ? "bg-green-600 text-white" : "bg-gray-600 text-gray-300"
                            }`}
                            disabled={formLoading}
                          >
                            {category.isActive ? "सक्रिय" : "निष्क्रिय"}
                          </button>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditCategory(category)}
                              className="text-blue-400 hover:bg-blue-600 hover:text-white"
                              disabled={formLoading}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteCategory(category.id)}
                              className="text-red-400 hover:bg-red-600 hover:text-white"
                              disabled={formLoading}
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
