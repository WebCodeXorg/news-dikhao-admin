"use client"

import { useState, FormEvent, ChangeEvent, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ImageIcon, Upload, X, Plus, Eye, Pencil, Crop, AlertCircle, Save } from "lucide-react"
import { uploadToCloudinaryDirect, findWorkingUploadPreset } from "@/lib/cloudinary-direct-upload"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { getFirebaseDb } from "@/lib/firebase-config"
import { addDoc, collection, serverTimestamp, doc, getDoc, getDocs, updateDoc } from "firebase/firestore"

interface Category {
  id: string
  name: string
  slug: string
  postCount: number
  isActive: boolean
  createdAt: any
}

interface EditPostFormProps {
  postId: string
}

export default function EditPostForm({ postId }: EditPostFormProps) {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [content, setContent] = useState("")
  const [category, setCategory] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")
  const [status, setStatus] = useState<"published" | "draft">("published")
  const [isBreaking, setIsBreaking] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>("")
  const [imageUrl, setImageUrl] = useState<string>("")
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [formattedContent, setFormattedContent] = useState("")
  const [imageEditing, setImageEditing] = useState(false)
  const [brightness, setBrightness] = useState(100)
  const [contrast, setContrast] = useState(100)
  const [categories, setCategories] = useState<Category[]>([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [imageSize, setImageSize] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)

  // Fetch post data
  useEffect(() => {
    const fetchPost = async () => {
      if (!postId) return
      
      try {
        setIsLoading(true)
        const db = await getFirebaseDb()
        const postDoc = await getDoc(doc(db, "posts", postId))
        
        if (postDoc.exists()) {
          const post = postDoc.data()
          setTitle(post.title || "")
          setDescription(post.description || "")
          setContent(post.content || "")
          setCategory(post.category || "")
          setTags(post.tags || [])
          setStatus(post.status || "published")
          setIsBreaking(post.isBreaking || false)
          setImageUrl(post.imageUrl || "")
          setImagePreview(post.imageUrl || "")
        } else {
          setError("पोस्ट नहीं मिली")
          router.push("/admin/posts")
        }
      } catch (error) {
        console.error("Error fetching post:", error)
        setError("पोस्ट लोड करने में त्रुटि हुई")
      } finally {
        setIsLoading(false)
      }
    }

    fetchPost()
  }, [postId, router])

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      
      // Calculate and format file size
      const fileSizeKB = file.size / 1024
      let formattedSize = ""
      
      if (fileSizeKB >= 1024) {
        const fileSizeMB = fileSizeKB / 1024
        formattedSize = `${fileSizeMB.toFixed(2)} MB`
      } else {
        formattedSize = `${Math.round(fileSizeKB)} KB`
      }
      
      setImageSize(formattedSize)
      
      // Generate preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  // Format content for preview
  useEffect(() => {
    if (previewOpen) {
      setFormattedContent(content
        .replace(/\n/g, "<br>")
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        .replace(/\*(.*?)\*/g, "<em>$1</em>")
      )
    }
  }, [previewOpen, content])

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories()
  }, [])
  
  // Fetch categories from Firestore
  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true)
      console.log("Fetching categories...")
      
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
            postCount: data.postCount || 0,
            isActive: data.isActive !== false,
            createdAt: data.createdAt || null
          })
        }
      })
      
      console.log(`Fetched ${categoriesList.length} categories`)
      setCategories(categoriesList)
      
    } catch (err: any) {
      console.error("Error fetching categories:", err)
      setError("श्रेणियां लोड करने में समस्या हुई")
    } finally {
      setCategoriesLoading(false)
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    
    // Basic validation
    if (!title.trim()) {
      setError("शीर्षक आवश्यक है")
      return
    }
    
    if (!content.trim()) {
      setError("कंटेंट आवश्यक है")
      return
    }
    
    if (!category) {
      setError("श्रेणी आवश्यक है")
      return
    }
    
    setError(null)
    setIsSubmitting(true)
    
    try {
      // Handle image upload if a new image is selected
      let finalImageUrl = imageUrl // Use existing image URL by default
      let uploadedImageSize = 0
      
      if (imageFile) {
        try {
          setUploadProgress(10)
          uploadedImageSize = imageFile.size / (1024 * 1024)
          
          console.log("Finding working upload preset...")
          try {
            const { preset, url } = await findWorkingUploadPreset(
              imageFile,
              (progress) => {
                setUploadProgress(progress)
                console.log(`Upload progress: ${progress}%`)
              }
            )
            console.log(`Found working preset: ${preset}`)
            finalImageUrl = url
            setUploadProgress(100)
            console.log("Upload completed successfully:", url)
          } catch (uploadError) {
            console.error("All upload attempts failed:", uploadError)
            throw new Error("No working upload preset found. Please check your Cloudinary configuration.")
          }
        } catch (error) {
          console.error("Error uploading image:", error)
          throw new Error(`Image upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      }
      
      // Find the selected category object
      const selectedCategory = categories.find(cat => cat.id === category)
      
      // Prepare post data
      const postData = {
        title,
        description,
        content,
        excerpt: description,
        category,
        categoryName: selectedCategory?.name || "",
        categorySlug: selectedCategory?.slug || "",
        tags,
        status,
        isBreaking,
        imageUrl: finalImageUrl,
        imageSize: imageFile ? uploadedImageSize.toFixed(2) : undefined,
        updatedAt: serverTimestamp()
      }
      
      console.log("Updating post in Firestore with data:", postData)
      
      // Update in Firestore
      const db = await getFirebaseDb()
      await updateDoc(doc(db, "posts", postId), postData)
      
      setSuccess("पोस्ट सफलतापूर्वक अपडेट हो गया!")
      router.push("/admin/posts")
      
    } catch (error) {
      console.error("Error updating post:", error)
      setError("पोस्ट अपडेट करने में त्रुटि हुई")
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-blue-600 border-gray-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-400">पोस्ट लोड हो रहा है...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="border-red-700 bg-red-900/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            त्रुटि
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-400">{error}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Title */}
      <Card className="border-gray-700 bg-gray-800">
        <CardHeader>
          <CardTitle className="text-white">शीर्षक</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="समाचार का शीर्षक दर्ज करें"
            className="bg-gray-700 border-gray-600 text-white"
            required
          />
        </CardContent>
      </Card>

      {/* Description */}
      <Card className="border-gray-700 bg-gray-800">
        <CardHeader>
          <CardTitle className="text-white">विवरण</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="समाचार का संक्षिप्त विवरण"
            className="bg-gray-700 border-gray-600 text-white min-h-[100px]"
            required
          />
        </CardContent>
      </Card>

      {/* Content */}
      <Card className="border-gray-700 bg-gray-800">
        <CardHeader>
          <CardTitle className="text-white">कंटेंट</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="पूरा समाचार यहाँ लिखें..."
            className="bg-gray-700 border-gray-600 text-white min-h-[300px]"
            required
          />
        </CardContent>
      </Card>

      {/* Image Upload */}
      <Card className="border-gray-700 bg-gray-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <ImageIcon className="w-5 h-5 mr-2" />
            फीचर्ड इमेज
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="flex-1 bg-gray-700 border-gray-600 text-white"
              />
              {imageFile && (
                <Button
                  type="button"
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                  onClick={() => setImageEditing(true)}
                >
                  <Crop className="w-4 h-4 mr-2" />
                  एडिट
                </Button>
              )}
            </div>

            {(imagePreview || imageUrl) && (
              <div className="relative">
                <Image
                  src={imagePreview || imageUrl}
                  alt="Preview"
                  width={600}
                  height={300}
                  className="w-full h-64 object-cover rounded-lg border-2 border-gray-600"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={() => {
                    setImageFile(null)
                    setImagePreview("")
                    setImageUrl("")
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}

            {imageSize && (
              <p className="text-sm text-gray-400">
                फाइल साइज़: {imageSize}
              </p>
            )}

            {isSubmitting && imageFile && (
              <div className="space-y-2">
                <div className="w-full bg-gray-700 rounded-full h-2.5">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-400">
                  अपलोड हो रहा है... {uploadProgress}%
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Category and Tags */}
      <Card className="border-gray-700 bg-gray-800">
        <CardHeader>
          <CardTitle className="text-white">श्रेणी और टैग्स</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Category Select */}
          <div>
            <Label className="text-gray-300">श्रेणी</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white mt-2">
                <SelectValue placeholder="श्रेणी चुनें" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tags Input */}
          <div className="space-y-4">
            <div className="flex space-x-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="टैग जोड़ें"
                className="bg-gray-700 border-gray-600 text-white flex-1"
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
              />
              <Button
                type="button"
                onClick={addTag}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-2 text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Status and Options */}
      <Card className="border-gray-700 bg-gray-800">
        <CardHeader>
          <CardTitle className="text-white">स्टेटस और विकल्प</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status Select */}
          <div>
            <Label className="text-gray-300">स्टेटस</Label>
            <Select value={status} onValueChange={(value: "published" | "draft") => setStatus(value)}>
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">ड्राफ्ट</SelectItem>
                <SelectItem value="published">प्रकाशित</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Breaking News Toggle */}
          <div className="flex items-center justify-between">
            <Label className="text-gray-300">ब्रेकिंग न्यूज़</Label>
            <Switch checked={isBreaking} onCheckedChange={setIsBreaking} />
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          className="border-gray-600 text-gray-300 hover:bg-gray-700"
          onClick={() => router.push("/admin/posts")}
        >
          रद्द करें
        </Button>
        
        <Button
          type="button"
          variant="outline"
          className="border-gray-600 text-gray-300 hover:bg-gray-700"
          onClick={() => setPreviewOpen(true)}
        >
          <Eye className="w-4 h-4 mr-2" />
          प्रीव्यू
        </Button>

        <Button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              अपडेट हो रहा है...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              अपडेट करें
            </>
          )}
        </Button>
      </div>

      {/* Preview Modal */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle>पोस्ट प्रीव्यू</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {isBreaking && (
              <Badge className="bg-red-600 text-white">ब्रेकिंग न्यूज़</Badge>
            )}
            
            <h1 className="text-2xl font-bold">{title}</h1>
            
            {(imagePreview || imageUrl) && (
              <div className="rounded-lg overflow-hidden">
                <Image
                  src={imagePreview || imageUrl}
                  alt={title}
                  width={800}
                  height={400}
                  className="w-full h-auto object-cover"
                />
              </div>
            )}
            
            <p className="text-lg font-medium italic border-l-4 border-gray-300 pl-4 py-2">
              {description}
            </p>
            
            <div 
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: formattedContent }}
            />
            
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewOpen(false)}>
              बंद करें
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </form>
  )
} 