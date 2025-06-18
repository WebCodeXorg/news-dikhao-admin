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
import { ImageIcon, Upload, X, Plus, Eye, Pencil, Crop, AlertCircle } from "lucide-react"
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

interface PostFormProps {
  postId?: string // Optional postId for edit mode
}

export default function PostForm({ postId }: PostFormProps) {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [content, setContent] = useState("")
  const [category, setCategory] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")
  const [status] = useState<"published">("published")
  const [isBreaking, setIsBreaking] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>("")
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
  const [imageUrl, setImageUrl] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(true)

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
      // Simple HTML formatting for preview
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
        if (data.isActive !== false) { // Only include active categories
          categoriesList.push({
            id: doc.id,
            name: data.name || "",
            slug: data.slug || "",
            postCount: data.postCount || 0,
            isActive: data.isActive !== false, // Default to true
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

  // Load post data if in edit mode
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
          setDescription(post.excerpt || "")
          setContent(post.content || "")
          setCategory(post.category || "")
          setTags(post.tags || [])
          setIsBreaking(post.isBreaking || false)
          if (post.imageUrl) {
            setImagePreview(post.imageUrl)
            setImageUrl(post.imageUrl)
          }
        } else {
          setError("पोस्ट नहीं मिला")
        }
      } catch (error) {
        console.error("Error fetching post:", error)
        setError("पोस्ट लोड करने में त्रुटि हुई")
      } finally {
        setIsLoading(false)
      }
    }

    if (mounted && postId) {
      fetchPost()
    }
  }, [postId, mounted])

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
    
    // Only require image for new posts
    if (!postId && !imageFile) {
      setError("इमेज आवश्यक है")
      return
    }
    
    // Validate image format if uploading new image
    if (imageFile) {
      const fileExtension = imageFile.name.split('.').pop()?.toLowerCase()
      const allowedFormats = ['jpg', 'jpeg', 'png', 'webp']
      
      if (!fileExtension || !allowedFormats.includes(fileExtension)) {
        setError(`केवल ${allowedFormats.join(', ')} फॉर्मेट की इमेज अपलोड करें`)
        return
      }
    }
    
    setError(null)
    setIsSubmitting(true)
    
    try {
      // Handle image upload if needed
      let finalImageUrl = imageUrl // Use existing image URL by default
      
      if (imageFile) {
        try {
          setUploadProgress(10)
          const uploadedImageSize = imageFile.size / (1024 * 1024)
          
          const { preset, url } = await findWorkingUploadPreset(
            imageFile,
            (progress) => {
              setUploadProgress(progress)
              console.log(`Upload progress: ${progress}%`)
            }
          )
          
          finalImageUrl = url
          setUploadProgress(100)
          console.log("Upload completed successfully:", url)
          
        } catch (uploadError) {
          console.error("All upload attempts failed:", uploadError)
          throw new Error("No working upload preset found. Please check your Cloudinary configuration.")
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
        status: "published",
        isBreaking,
        author: "Admin",
        imageUrl: finalImageUrl,
        updatedAt: serverTimestamp()
      }
      
      const db = await getFirebaseDb()
      
      if (postId) {
        // Update existing post
        await updateDoc(doc(db, "posts", postId), postData)
        setSuccess("पोस्ट सफलतापूर्वक अपडेट किया गया")
      } else {
        // Create new post
        const docRef = await addDoc(collection(db, "posts"), {
          ...postData,
          createdAt: serverTimestamp(),
          views: 0
        })
        setSuccess("पोस्ट सफलतापूर्वक बनाया गया")
      }
      
      // Redirect to posts management page after a short delay
      setTimeout(() => {
        router.push("/admin/posts")
      }, 1500)
      
    } catch (error: any) {
      console.error("Error submitting post:", error)
      if (error.message?.includes('Upload failed')) {
        setError("पोस्ट सबमित करने में त्रुटि हुई: इमेज अपलोड नहीं हो सकी")
      } else {
        setError(`पोस्ट सबमित करने में त्रुटि हुई: ${error.message || "अज्ञात त्रुटि"}`)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 font-inter">
      {/* Error/Success Messages */}
      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded flex items-center font-hindi shadow-md">
          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-500/10 border border-green-500 text-green-500 px-4 py-3 rounded flex items-center font-hindi shadow-md">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title */}
          <Card className="border-gray-700 bg-gray-800 shadow-lg">
            <CardHeader className="bg-gray-750">
              <CardTitle className="text-white font-hindi text-xl">
                पोस्ट का शीर्षक
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="शीर्षक यहां लिखें..."
                className="bg-gray-700 border-gray-600 text-white font-hindi text-lg focus:ring-2 focus:ring-blue-500"
              />
            </CardContent>
          </Card>

          {/* Description */}
          <Card className="border-gray-700 bg-gray-800 shadow-lg">
            <CardHeader className="bg-gray-750">
              <CardTitle className="text-white font-hindi text-xl">
                संक्षिप्त विवरण
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="संक्षिप्त विवरण यहां लिखें..."
                className="bg-gray-700 border-gray-600 text-white font-hindi min-h-[100px] focus:ring-2 focus:ring-blue-500"
              />
            </CardContent>
          </Card>

          {/* Content */}
          <Card className="border-gray-700 bg-gray-800 shadow-lg">
            <CardHeader className="bg-gray-750">
              <CardTitle className="text-white font-hindi text-xl">
                पोस्ट कंटेंट
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="कंटेंट यहां लिखें..."
                className="bg-gray-700 border-gray-600 text-white font-hindi min-h-[300px] focus:ring-2 focus:ring-blue-500"
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Publish Settings */}
          <Card className="border-gray-700 bg-gray-800 shadow-lg">
            <CardHeader className="bg-gray-750">
              <CardTitle className="text-white font-hindi text-xl">
                प्रकाशन सेटिंग्स
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Status selector removed */}

              {/* Category */}
              <div>
                <Label className="text-gray-300 font-hindi text-base font-semibold">
                  श्रेणी
                </Label>
                <Select 
                  value={category} 
                  onValueChange={setCategory}
                  defaultValue={category}
                >
                  <SelectTrigger className="mt-1 bg-gray-700 border-gray-600 text-white font-hindi focus:ring-2 focus:ring-blue-500">
                    <SelectValue placeholder="श्रेणी चुनें" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoriesLoading ? (
                      <div className="flex items-center justify-center p-2">
                        <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      </div>
                    ) : categories.length === 0 ? (
                      <SelectItem value="no-categories" disabled className="font-hindi">
                        कोई श्रेणी उपलब्ध नहीं है
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

              {/* Tags */}
              <div>
                <Label className="text-gray-300 font-hindi text-base font-semibold">
                  टैग्स
                </Label>
                <div className="flex mt-1">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="टैग लिखें..."
                    className="flex-1 bg-gray-700 border-gray-600 text-white font-hindi focus:ring-2 focus:ring-blue-500"
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <Button
                    type="button"
                    onClick={addTag}
                    className="ml-2 bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((tag, index) => (
                    <Badge key={index} className="bg-blue-600 hover:bg-blue-700 text-white font-hindi">
                      {tag}
                      <X
                        className="w-3 h-3 ml-1 cursor-pointer"
                        onClick={() => removeTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Breaking News */}
              <div className="flex items-center justify-between">
                <Label className="text-gray-300 font-hindi text-base font-semibold">
                  ब्रेकिंग न्यूज़
                </Label>
                <Switch
                  checked={isBreaking}
                  onCheckedChange={setIsBreaking}
                  className="data-[state=checked]:bg-blue-500"
                />
              </div>
            </CardContent>
          </Card>

          {/* Featured Image */}
          <Card className="border-gray-700 bg-gray-800 shadow-lg">
            <CardHeader className="bg-gray-750">
              <CardTitle className="text-white font-poppins flex items-center text-xl">
                <ImageIcon className="w-5 h-5 mr-2" />
                फीचर्ड इमेज
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {!imagePreview ? (
                  <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center bg-gray-750 hover:bg-gray-700 transition-colors cursor-pointer" onClick={() => document.getElementById('image-upload')?.click()}>
                    <Upload className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-300 font-poppins mb-2">
                      इमेज अपलोड करें
                    </p>
                    <p className="text-gray-400 text-sm font-inter">
                      JPG, JPEG, PNG या WEBP फॉर्मेट (अधिकतम 5MB)
                    </p>
                    <Input
                      id="image-upload"
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <Button 
                      type="button"
                      className="mt-4 bg-[#3B82F6] hover:bg-blue-600 font-poppins"
                      onClick={(e) => {
                        e.stopPropagation();
                        document.getElementById('image-upload')?.click();
                      }}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      फ़ाइल चुनें
                    </Button>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="relative rounded-lg overflow-hidden shadow-lg border-2 border-blue-500">
                      <Image
                        src={imagePreview}
                        alt="Preview"
                        width={600}
                        height={300}
                        className="w-full h-64 object-cover"
                        style={{
                          filter: `brightness(${brightness}%) contrast(${contrast}%)`
                        }}
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                        <div className="flex justify-between items-center">
                          <p className="text-white font-poppins text-sm truncate">
                            {imageFile?.name}
                          </p>
                          <p className="text-white font-poppins text-sm bg-blue-600 px-2 py-1 rounded-full">
                            {imageSize}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="absolute top-2 right-2 flex space-x-2">
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="rounded-full shadow-md"
                        onClick={() => {
                          setImageFile(null)
                          setImagePreview("")
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        size="icon"
                        className="rounded-full shadow-md"
                        onClick={() => setImageEditing(!imageEditing)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    {isSubmitting && uploadProgress > 0 && (
                      <div className="mt-2">
                        <div className="w-full bg-gray-700 rounded-full h-2.5">
                          <div 
                            className="bg-[#3B82F6] h-2.5 rounded-full transition-all duration-300" 
                            style={{ width: `${uploadProgress}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-400 mt-1 font-inter">
                          {Math.round(uploadProgress)}% अपलोड हो रहा है...
                        </p>
                      </div>
                    )}
                    
                    {imageEditing && (
                      <div className="mt-3 p-4 bg-gray-750 rounded-lg shadow-lg border border-gray-600">
                        <h3 className="text-white font-poppins text-sm mb-3">
                          Image Editing
                        </h3>
                        <div className="space-y-4">
                          <div>
                            <Label className="text-gray-300 text-sm font-inter">
                              Brightness: {brightness}%
                            </Label>
                            <input 
                              type="range" 
                              min="50" 
                              max="150" 
                              value={brightness}
                              onChange={(e) => setBrightness(Number(e.target.value))}
                              className="w-full accent-[#3B82F6]"
                            />
                          </div>
                          <div>
                            <Label className="text-gray-300 text-sm font-inter">
                              Contrast: {contrast}%
                            </Label>
                            <input 
                              type="range" 
                              min="50" 
                              max="150" 
                              value={contrast}
                              onChange={(e) => setContrast(Number(e.target.value))}
                              className="w-full accent-[#3B82F6]"
                            />
                          </div>
                          <Button
                            type="button"
                            size="sm"
                            className="w-full bg-[#3B82F6] hover:bg-blue-600 font-inter"
                            onClick={() => {
                              setBrightness(100)
                              setContrast(100)
                            }}
                          >
                            Reset
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-4">
            {/* Preview Button */}
            <Button 
              type="button" 
              variant="outline"
              className="font-poppins text-lg border-2 border-green-500 bg-green-500 hover:bg-green-600 text-white shadow-md"
              onClick={() => setPreviewOpen(true)}
            >
              <Eye className="w-4 h-4 mr-2" />
              प्रीव्यू
            </Button>
            
            {/* Submit Button */}
            <Button 
              type="submit" 
              className="bg-[#3B82F6] hover:bg-blue-600 font-poppins text-lg shadow-md"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  प्रोसेसिंग...
                </span>
              ) : (
                <span>पोस्ट सबमिट करें</span>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold font-poppins">
              पोस्ट प्रीव्यू
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Preview Header */}
            <div className="space-y-2">
              {isBreaking && (
                <Badge className="bg-red-600 text-white font-poppins">
                  BREAKING NEWS
                </Badge>
              )}
              
              <h1 className="text-2xl font-bold font-poppins dark:text-white">{title}</h1>
              
              <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 text-sm font-inter">
                <span>{new Date().toLocaleDateString()}</span>
                <span>•</span>
                <Badge variant="outline" className="bg-[#3B82F6]/10 text-[#3B82F6] border-[#3B82F6]/30">
                  {categories.find(cat => cat.id === category)?.name || ""}
                </Badge>
              </div>
            </div>
            
            {/* Preview Image */}
            {imagePreview && (
              <div className="rounded-lg overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700">
                <Image
                  src={imagePreview}
                  alt={title}
                  width={800}
                  height={400}
                  className="w-full h-auto object-cover"
                  style={{
                    filter: `brightness(${brightness}%) contrast(${contrast}%)`
                  }}
                />
              </div>
            )}
            
            {/* Preview Description */}
            <p className="text-lg font-medium italic border-l-4 border-[#3B82F6] pl-4 py-2 dark:text-gray-300 font-inter">
              {description}
            </p>
            
            {/* Preview Content */}
            <div 
              className="prose max-w-none font-inter dark:prose-invert prose-headings:font-poppins prose-a:text-[#3B82F6]"
              dangerouslySetInnerHTML={{ __html: formattedContent }}
            />
            
            {/* Preview Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="font-inter bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setPreviewOpen(false)}
              className="font-poppins border-2 border-gray-300 hover:bg-gray-100"
            >
              बंद करें
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </form>
  )
} 