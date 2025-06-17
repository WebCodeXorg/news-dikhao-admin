"use client"

import type React from "react"

import { useState, useEffect, ChangeEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Edit, Trash2, Plus, ImageIcon, ArrowUp, ArrowDown, Play, Upload, X, Loader2, AlertCircle, CheckCircle } from "lucide-react"
import AdminLayout from "@/components/admin/AdminLayout"
import Image from "next/image"
import { uploadToCloudinaryDirect, findWorkingUploadPreset } from "@/lib/cloudinary-direct-upload"
import { getFirebaseDb } from "@/lib/firebase-config"
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, serverTimestamp, query, where } from "firebase/firestore"

interface SliderItem {
  id: string
  title: string
  excerpt: string
  category: string
  categoryName?: string
  imageUrl: string
  postId?: string
  isActive: boolean
  order: number
  isBreaking: boolean
  createdAt: any
  imageSize?: number
}

interface Category {
  id: string
  name: string
  slug: string
  isActive: boolean
}

export default function HeroSliderPage() {
  const [sliderItems, setSliderItems] = useState<SliderItem[]>([])
  const [newSliderItem, setNewSliderItem] = useState({
    title: "",
    excerpt: "",
    category: "",
    categoryName: "",
    imageUrl: "",
    isBreaking: true,
  })

  const [editingItem, setEditingItem] = useState<SliderItem | null>(null)
  const [loading, setLoading] = useState(false)
  const [autoMode, setAutoMode] = useState(true)
  const [categories, setCategories] = useState<Category[]>([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>("")
  const [uploadProgress, setUploadProgress] = useState(0)
  const [imageSize, setImageSize] = useState<string>("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    fetchCategories()
    fetchSliderItems()
  }, [])

  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true)
      const db = await getFirebaseDb()
      const categoriesSnapshot = await getDocs(collection(db, "categories"))
      
      const categoriesList: Category[] = []
      
      categoriesSnapshot.forEach((doc) => {
        const data = doc.data()
        if (data.isActive !== false) {
          categoriesList.push({
            id: doc.id,
            name: data.name || "",
            slug: data.slug || "",
            isActive: data.isActive !== false
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
  
  const fetchSliderItems = async () => {
    try {
      setLoading(true)
      const db = await getFirebaseDb()
      const sliderItemsSnapshot = await getDocs(collection(db, "slider_items"))
      
      const items: SliderItem[] = []
      
      sliderItemsSnapshot.forEach((doc) => {
        const data = doc.data()
        items.push({
          id: doc.id,
          title: data.title || "",
          excerpt: data.excerpt || "",
          category: data.category || "",
          categoryName: data.categoryName || "",
          imageUrl: data.imageUrl || "",
          postId: data.postId || undefined,
          isActive: data.isActive !== false,
          order: data.order || 0,
          isBreaking: data.isBreaking !== false,
          createdAt: data.createdAt || null,
          imageSize: data.imageSize || 0
        })
      })
      
      items.sort((a, b) => a.order - b.order)
      setSliderItems(items)
    } catch (error) {
      console.error("Error fetching slider items:", error)
      setError("स्लाइडर आइटम्स लोड करने में समस्या हुई")
    } finally {
      setLoading(false)
    }
  }

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      
      const fileSizeKB = file.size / 1024
      let formattedSize = ""
      
      if (fileSizeKB >= 1024) {
        const fileSizeMB = fileSizeKB / 1024
        formattedSize = `${fileSizeMB.toFixed(2)} MB`
      } else {
        formattedSize = `${Math.round(fileSizeKB)} KB`
      }
      
      setImageSize(formattedSize)
      
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const updateStorageUsage = async (imageSize: number) => {
    try {
      const db = await getFirebaseDb()
      
      const storageQuery = await getDocs(collection(db, "storage_usage"))
      let totalStorageUsed = 0
      let storageDocId = null
      
      if (!storageQuery.empty) {
        const storageDoc = storageQuery.docs[0]
        storageDocId = storageDoc.id
        totalStorageUsed = storageDoc.data().totalSize || 0
      }
      
      totalStorageUsed += imageSize
      
      if (storageDocId) {
        await updateDoc(doc(db, "storage_usage", storageDocId), {
          totalSize: totalStorageUsed,
          lastUpdated: serverTimestamp(),
          lastImageSize: imageSize
        })
      } else {
        await addDoc(collection(db, "storage_usage"), {
          totalSize: imageSize,
          lastUpdated: serverTimestamp(),
          lastImageSize: imageSize
        })
      }
      
      console.log(`Storage usage updated. Total: ${totalStorageUsed.toFixed(2)} MB`)
    } catch (storageError) {
      console.error("Error updating storage usage:", storageError)
    }
  }

  const handleAddSliderItem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSliderItem.title.trim() || !newSliderItem.excerpt.trim() || !newSliderItem.category || !imageFile) {
      setError("सभी आवश्यक फील्ड भरें और इमेज चुनें")
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)
    
    try {
      let imageUrl = ""
      let uploadedImageSize = 0
      
      try {
        setUploadProgress(10)
        
        uploadedImageSize = imageFile.size / (1024 * 1024)
        
        const { url } = await findWorkingUploadPreset(
          imageFile,
          (progress) => {
            setUploadProgress(progress)
            console.log(`Upload progress: ${progress}%`)
          }
        )
        
        imageUrl = url
        setUploadProgress(100)
        console.log("Upload completed successfully:", url)
        
      } catch (uploadError) {
        console.error("Error uploading image:", uploadError)
        setError("इमेज अपलोड करने में समस्या हुई")
        setLoading(false)
        return
      }
      
      const selectedCategory = categories.find(cat => cat.id === newSliderItem.category)
      
      const db = await getFirebaseDb()
      
      const newItem: Omit<SliderItem, 'id'> = {
        title: newSliderItem.title,
        excerpt: newSliderItem.excerpt,
        category: newSliderItem.category,
        categoryName: selectedCategory?.name || "",
        imageUrl: imageUrl,
        isActive: true,
        order: sliderItems.length + 1,
        isBreaking: true,
        createdAt: serverTimestamp(),
        imageSize: uploadedImageSize
      }

      const docRef = await addDoc(collection(db, "slider_items"), newItem)
      
      await updateStorageUsage(uploadedImageSize)
      
      const addedItem: SliderItem = {
        ...newItem,
        id: docRef.id,
        createdAt: new Date()
      }
      
      setSliderItems([...sliderItems, addedItem])
      
      setNewSliderItem({
        title: "",
        excerpt: "",
        category: "",
        categoryName: "",
        imageUrl: "",
        isBreaking: true,
      })
      setImageFile(null)
      setImagePreview("")
      setImageSize("")
      
      setSuccess("स्लाइडर आइटम सफलतापूर्वक जोड़ा गया")
      
    } catch (err: any) {
      console.error("Error adding slider item:", err)
      setError("स्लाइडर आइटम जोड़ने में समस्या हुई")
    } finally {
      setLoading(false)
      setUploadProgress(0)
    }
  }

  const handleEditItem = (item: SliderItem) => {
    setEditingItem(item)
  }

  const handleUpdateItem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingItem) return
    
    setLoading(true)
    setError(null)
    
    try {
      const selectedCategory = categories.find(cat => cat.id === editingItem.category)
      
      const db = await getFirebaseDb()
      
      const updatedItem = {
        ...editingItem,
        categoryName: selectedCategory?.name || editingItem.categoryName || "",
        isBreaking: true
      }
      
      await updateDoc(doc(db, "slider_items", editingItem.id), updatedItem)
      
      setSliderItems(sliderItems.map((item) => (item.id === editingItem.id ? updatedItem : item)))
      setEditingItem(null)
      setSuccess("स्लाइडर आइटम अपडेट किया गया")
      
    } catch (error) {
      console.error("Error updating slider item:", error)
      setError("स्लाइडर आइटम अपडेट करने में समस्या हुई")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteItem = async (id: string) => {
    if (confirm("क्या आप वाकई इस स्लाइडर आइटम को डिलीट करना चाहते हैं?")) {
      setLoading(true)
      
      try {
        const db = await getFirebaseDb()
        await deleteDoc(doc(db, "slider_items", id))
        
        setSliderItems(sliderItems.filter((item) => item.id !== id))
        setSuccess("स्लाइडर आइटम डिलीट किया गया")
      } catch (error) {
        console.error("Error deleting slider item:", error)
        setError("स्लाइडर आइटम डिलीट करने में समस्या हुई")
      } finally {
        setLoading(false)
      }
    }
  }

  const toggleItemStatus = async (id: string) => {
    try {
      const item = sliderItems.find(item => item.id === id)
      if (!item) return
      
      const db = await getFirebaseDb()
      await updateDoc(doc(db, "slider_items", id), {
        isActive: !item.isActive
      })
      
      setSliderItems(sliderItems.map((item) => 
        item.id === id ? { ...item, isActive: !item.isActive } : item
      ))
      
    } catch (error) {
      console.error("Error toggling slider item status:", error)
      setError("स्लाइडर आइटम की स्थिति बदलने में समस्या हुई")
    }
  }

  const moveItem = async (id: string, direction: "up" | "down") => {
    const currentIndex = sliderItems.findIndex((item) => item.id === id)
    if (currentIndex === -1) return

    const newItems = [...sliderItems]
    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1

    if (targetIndex >= 0 && targetIndex < newItems.length) {
      [newItems[currentIndex], newItems[targetIndex]] = [newItems[targetIndex], newItems[currentIndex]]

      newItems.forEach((item, index) => {
        item.order = index + 1
      })

      try {
        const db = await getFirebaseDb()
        const batch = db.batch()
        
        const item1 = newItems[currentIndex]
        const item2 = newItems[targetIndex]
        
        batch.update(doc(db, "slider_items", item1.id), { order: item1.order })
        batch.update(doc(db, "slider_items", item2.id), { order: item2.order })
        
        await batch.commit()
        
        setSliderItems(newItems)
      } catch (error) {
        console.error("Error updating item order:", error)
        setError("क्रम अपडेट करने में समस्या हुई")
      }
    }
  }

  return (
    <AdminLayout title="हीरो स्लाइडर प्रबंधन">
      <div className="space-y-8">
        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded flex items-center font-hindi shadow-md">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-500/10 border border-green-500 text-green-500 px-4 py-3 rounded flex items-center font-hindi shadow-md">
            <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0" />
            {success}
          </div>
        )}

        <Card className="border-gray-700 bg-gray-800">
          <CardHeader>
            <CardTitle className="text-white font-hindi flex items-center">
              <Play className="w-5 h-5 mr-2" />
              स्लाइडर सेटिंग्स
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Label className="text-gray-300 font-hindi">ऑटो मोड</Label>
                <Switch checked={autoMode} onCheckedChange={setAutoMode} />
                <span className="text-sm text-gray-400 font-hindi">
                  {autoMode ? "स्वचालित स्लाइडिंग चालू" : "मैन्युअल कंट्रोल"}
                </span>
              </div>
              <Badge variant="outline" className="text-green-400 border-green-400">
                {sliderItems.filter((item) => item.isActive).length} सक्रिय स्लाइड्स
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-700 bg-gray-800">
          <CardHeader>
            <CardTitle className="text-white font-hindi flex items-center">
              <Plus className="w-5 h-5 mr-2" />
              नया स्लाइडर आइटम जोड़ें
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddSliderItem} className="space-y-6">
              <div>
                <Label htmlFor="title" className="text-gray-300 font-hindi text-base font-semibold">
                  शीर्षक *
                </Label>
                <Input
                  id="title"
                  value={newSliderItem.title}
                  onChange={(e) => setNewSliderItem({ ...newSliderItem, title: e.target.value })}
                  placeholder="स्लाइडर का शीर्षक"
                  className="bg-gray-700 border-gray-600 text-white font-hindi mt-2"
                  required
                />
              </div>

              <div>
                <Label htmlFor="excerpt" className="text-gray-300 font-hindi text-base font-semibold">
                  संक्षिप्त विवरण *
                </Label>
                <Input
                  id="excerpt"
                  value={newSliderItem.excerpt}
                  onChange={(e) => setNewSliderItem({ ...newSliderItem, excerpt: e.target.value })}
                  placeholder="स्लाइडर का संक्षिप्त विवरण"
                  className="bg-gray-700 border-gray-600 text-white font-hindi mt-2"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-300 font-hindi text-base font-semibold">श्रेणी *</Label>
                  <Select
                    value={newSliderItem.category}
                    onValueChange={(value) => setNewSliderItem({ ...newSliderItem, category: value })}
                  >
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white mt-2">
                      <SelectValue placeholder="श्रेणी चुनें" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoriesLoading ? (
                        <SelectItem value="loading" disabled className="font-hindi">
                          लोड हो रहा है...
                        </SelectItem>
                      ) : categories.length === 0 ? (
                        <SelectItem value="no-categories" disabled className="font-hindi">
                          कोई श्रेणी नहीं मिली
                        </SelectItem>
                      ) : (
                        categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id} className="font-hindi">
                            {cat.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="imageUpload" className="text-gray-300 font-hindi text-base font-semibold">
                    इमेज अपलोड करें *
                  </Label>
                  <div className="mt-2">
                    <div className="border-2 border-dashed border-gray-600 rounded-lg p-4 text-center bg-gray-700 hover:bg-gray-600 transition-colors cursor-pointer" onClick={() => document.getElementById('image-upload')?.click()}>
                      {!imagePreview ? (
                        <>
                          <Upload className="h-10 w-10 mx-auto text-gray-400 mb-2" />
                          <p className="text-gray-300 font-hindi mb-2">इमेज अपलोड करें</p>
                          <p className="text-gray-400 text-sm">JPG, JPEG, PNG या WEBP फॉर्मेट</p>
                          <Input
                            id="image-upload"
                            type="file"
                            accept=".jpg,.jpeg,.png,.webp"
                            onChange={handleImageChange}
                            className="hidden"
                          />
                        </>
                      ) : (
                        <div className="relative">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-full h-40 object-cover rounded"
                          />
                          <div className="absolute top-2 right-2 flex space-x-2">
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="rounded-full shadow-md"
                              onClick={(e) => {
                                e.stopPropagation();
                                setImageFile(null);
                                setImagePreview("");
                                setImageSize("");
                              }}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                          {imageSize && (
                            <div className="absolute bottom-2 right-2 bg-blue-600 px-2 py-1 rounded text-white text-xs">
                              {imageSize}
                            </div>
                          )}
                          {uploadProgress > 0 && uploadProgress < 100 && (
                            <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-1">
                              <div className="w-full bg-gray-700 rounded-full h-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full" 
                                  style={{ width: `${uploadProgress}%` }}
                                ></div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Switch
                  checked={true}
                  disabled={true}
                />
                <Label className="text-gray-300 font-hindi">ब्रेकिंग न्यूज़ के रूप में मार्क करें (हमेशा चालू)</Label>
              </div>

              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 font-hindi" disabled={loading}>
                {loading ? (
                  <span className="flex items-center">
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    जोड़ा जा रहा है...
                  </span>
                ) : (
                  "स्लाइडर में जोड़ें"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {editingItem && (
          <Card className="border-gray-700 bg-gray-800">
            <CardHeader>
              <CardTitle className="text-white font-hindi flex items-center">
                <Edit className="w-5 h-5 mr-2" />
                स्लाइडर आइटम संपादित करें
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateItem} className="space-y-4">
                <div>
                  <Label className="text-gray-300 font-hindi">शीर्षक *</Label>
                  <Input
                    value={editingItem.title}
                    onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                    className="bg-gray-700 border-gray-600 text-white font-hindi"
                    required
                  />
                </div>
                <div>
                  <Label className="text-gray-300 font-hindi">संक्षिप्त विवरण *</Label>
                  <Input
                    value={editingItem.excerpt}
                    onChange={(e) => setEditingItem({ ...editingItem, excerpt: e.target.value })}
                    className="bg-gray-700 border-gray-600 text-white font-hindi"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-300 font-hindi">श्रेणी</Label>
                    <Select
                      value={editingItem.category}
                      onValueChange={(value) => setEditingItem({ ...editingItem, category: value })}
                    >
                      <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id} className="font-hindi">
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-gray-300 font-hindi">इमेज</Label>
                    <div className="mt-2">
                      <div className="h-20 w-full rounded relative overflow-hidden">
                        <Image
                          src={editingItem.imageUrl || "/placeholder.svg"}
                          alt={editingItem.title}
                          fill
                          className="object-cover"
                        />
                        {editingItem.imageSize && (
                          <div className="absolute bottom-1 right-1 bg-blue-600 px-2 py-1 rounded text-white text-xs">
                            {editingItem.imageSize.toFixed(2)} MB
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Switch
                    checked={true}
                    disabled={true}
                  />
                  <Label className="text-gray-300 font-hindi">ब्रेकिंग न्यूज़ (हमेशा चालू)</Label>
                </div>
                <div className="flex space-x-4">
                  <Button type="submit" className="bg-green-600 hover:bg-green-700 font-hindi">
                    {loading ? (
                      <span className="flex items-center">
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        अपडेट किया जा रहा है...
                      </span>
                    ) : (
                      "अपडेट करें"
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEditingItem(null)}
                    className="border-gray-600 text-gray-300 hover:bg-gray-700 font-hindi"
                  >
                    रद्द करें
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <Card className="border-gray-700 bg-gray-800">
          <CardHeader>
            <CardTitle className="text-white font-hindi flex items-center">
              <ImageIcon className="w-5 h-5 mr-2" />
              स्लाइडर आइटम्स ({sliderItems.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading && sliderItems.length === 0 ? (
              <div className="flex items-center justify-center p-8 text-gray-400">
                <Loader2 className="h-8 w-8 mr-2 animate-spin" />
                <p className="font-hindi">स्लाइडर आइटम्स लोड हो रहे हैं...</p>
              </div>
            ) : sliderItems.length === 0 ? (
              <div className="text-center p-8 text-gray-400 font-hindi">
                कोई स्लाइडर आइटम नहीं मिला
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sliderItems
                  .sort((a, b) => a.order - b.order)
                  .map((item, index) => (
                    <div key={item.id} className="rounded-lg bg-gray-700 border border-gray-600 overflow-hidden hover:border-gray-500 transition-all duration-300">
                      {/* Image Section */}
                      <div className="relative w-full h-48">
                        <Image
                          src={item.imageUrl || "/placeholder.svg"}
                          alt={item.title}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute top-2 left-2 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                          #{index + 1}
                        </div>
                        {item.isBreaking && (
                          <Badge className="absolute top-2 right-2 bg-red-600 text-white">ब्रेकिंग</Badge>
                        )}
                        {!item.isActive && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <Badge variant="outline" className="text-yellow-400 border-yellow-400 text-lg">
                              निष्क्रिय
                            </Badge>
                          </div>
                        )}
                      </div>

                      {/* Content Section */}
                      <div className="p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Badge variant="outline" className="text-blue-400 border-blue-400">
                            {item.categoryName || "अनजान श्रेणी"}
                          </Badge>
                          {item.imageSize && (
                            <span className="text-xs text-gray-400">{item.imageSize.toFixed(1)} MB</span>
                          )}
                        </div>

                        <h3 className="font-semibold text-white font-hindi text-lg mb-2 line-clamp-2">{item.title}</h3>

                        {/* Controls Section */}
                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-600">
                          <div className="flex items-center space-x-2">
                            <Switch checked={item.isActive} onCheckedChange={() => toggleItemStatus(item.id)} />
                            <span className="text-sm text-gray-300 font-hindi">
                              {item.isActive ? "सक्रिय" : "निष्क्रिय"}
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => moveItem(item.id, "up")}
                              disabled={index === 0}
                              className="text-gray-400 hover:bg-gray-600 hover:text-white"
                            >
                              <ArrowUp className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => moveItem(item.id, "down")}
                              disabled={index === sliderItems.length - 1}
                              className="text-gray-400 hover:bg-gray-600 hover:text-white"
                            >
                              <ArrowDown className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditItem(item)}
                              className="text-blue-400 hover:bg-blue-600 hover:text-white"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteItem(item.id)}
                              className="text-red-400 hover:bg-red-600 hover:text-white"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
