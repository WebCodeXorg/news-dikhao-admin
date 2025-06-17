"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Save, X, Upload, Eye, ImageIcon, Clock, CheckCircle, ArrowLeft } from "lucide-react"
import AdminLayout from "@/components/admin/AdminLayout"
import Image from "next/image"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import RichTextEditor from "@/components/RichTextEditor"
import { Post, uploadImage, updatePost, getPostById } from "@/lib/firebase-posts"

// Function to convert markdown to HTML for preview
function convertMarkdownToHtml(text: string): string {
  return text
    .replace(/\n/g, "<br>")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/__(.*?)__/g, "<u>$1</u>")
    .replace(/^# (.*?)$/gm, "<h1>$1</h1>")
    .replace(/^## (.*?)$/gm, "<h2>$1</h2>")
    .replace(/^> (.*?)$/gm, "<blockquote>$1</blockquote>")
    .replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" style="max-width:100%">')
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>')
}

const categories = ["भारत", "विदेश", "राजनीति", "मनोरंजन", "खेल", "बिजनेस", "टेक्नोलॉजी", "स्वास्थ्य", "शिक्षा", "पर्यावरण"]

export default function EditPostPage({ params }: { params: { id: string } }) {
  const postId = params.id
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [excerpt, setExcerpt] = useState("")
  const [category, setCategory] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")
  const [status, setStatus] = useState<"published" | "draft">("draft")
  const [isBreaking, setIsBreaking] = useState(false)
  const [addToSlider, setAddToSlider] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>("")
  const [imageUrl, setImageUrl] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [autoSave, setAutoSave] = useState(true)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [language, setLanguage] = useState<"hindi" | "english">("hindi")
  const [formattedContent, setFormattedContent] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // Load post data
  useEffect(() => {
    const fetchPost = async () => {
      if (!postId) return
      
      try {
        setIsLoading(true)
        const post = await getPostById(postId)
        
        if (post) {
          setTitle(post.title || "")
          setContent(post.content || "")
          setExcerpt(post.excerpt || "")
          setCategory(post.category || "")
          setTags(post.tags || [])
          setStatus(post.status || "draft")
          setIsBreaking(post.isBreaking || false)
          setAddToSlider(post.addToSlider || false)
          setImageUrl(post.imageUrl || "")
          setImagePreview(post.imageUrl || "")
          setLanguage(post.language || "hindi")
        } else {
          setError("Post not found")
        }
      } catch (error) {
        console.error("Error fetching post:", error)
        setError("Error loading post")
      } finally {
        setIsLoading(false)
      }
    }

    if (mounted && postId) {
      fetchPost()
    }
  }, [postId, mounted])

  useEffect(() => {
    setMounted(true)
  }, [])

  // Auto-save draft
  useEffect(() => {
    if (!mounted || !autoSave) return

    const autoSaveTimer = setTimeout(() => {
      handleSaveDraft()
    }, 30000) // Auto-save every 30 seconds

    return () => clearTimeout(autoSaveTimer)
  }, [title, content, excerpt, category, tags, status, isBreaking, addToSlider, imageUrl, autoSave, mounted])

  // Update preview content
  useEffect(() => {
    if (previewOpen) {
      setFormattedContent(convertMarkdownToHtml(content))
    }
  }, [previewOpen, content])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const uploadImageToFirebase = async () => {
    if (!imageFile) return null
    
    try {
      setIsUploading(true)
      const downloadURL = await uploadImage(imageFile, (progress) => {
        setUploadProgress(progress)
      })
      setImageUrl(downloadURL)
      return downloadURL
    } catch (error) {
      console.error("Error uploading image:", error)
      return null
    } finally {
      setIsUploading(false)
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

  const handleSaveDraft = async () => {
    if (!title && !content && !excerpt) return
    if (!postId) return

    try {
      const now = new Date()
      
      await updatePost(postId, {
        title,
        content,
        excerpt,
        category,
        tags,
        status,
        isBreaking,
        addToSlider,
        imageUrl,
        language: language as "hindi" | "english"
      })
      
      setLastSaved(now)
      
      // Show save message
      const saveMessage = document.getElementById('saveMessage')
      if (saveMessage) {
        saveMessage.textContent = language === "hindi" ? "ड्राफ्ट सेव किया गया" : "Draft saved"
        saveMessage.classList.remove('opacity-0')
        
        setTimeout(() => {
          saveMessage.classList.add('opacity-0')
        }, 3000)
      }
    } catch (error) {
      console.error("Error saving draft:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !content || !category) {
      alert(language === "hindi" ? "कृपया सभी आवश्यक फील्ड भरें" : "Please fill all required fields")
      return
    }

    setLoading(true)

    try {
      // Upload image if available
      let finalImageUrl = imageUrl
      if (imageFile && !imageUrl) {
        finalImageUrl = await uploadImageToFirebase() || ""
      }
      
      // Prepare post data
      const postData: Partial<Post> = {
        title,
        content,
        excerpt,
        category,
        tags,
        status,
        isBreaking,
        addToSlider,
        imageUrl: finalImageUrl,
        language: language as "hindi" | "english"
      }

      // Update post
      await updatePost(postId, postData)

      alert(language === "hindi" ? "पोस्ट सफलतापूर्वक अपडेट हो गया!" : "Post updated successfully!")
      router.push("/admin/posts")
    } catch (error) {
      alert(language === "hindi" ? "पोस्ट अपडेट करने में त्रुटि हुई" : "Error updating post")
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  if (!mounted) {
    return null
  }

  if (isLoading) {
    return (
      <AdminLayout title={language === "hindi" ? "पोस्ट लोड हो रहा है..." : "Loading Post..."}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-t-blue-600 border-gray-600 rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-gray-400 font-hindi">
              {language === "hindi" ? "पोस्ट लोड हो रहा है..." : "Loading post..."}
            </p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  if (error) {
    return (
      <AdminLayout title={language === "hindi" ? "त्रुटि" : "Error"}>
        <Card className="border-red-700 bg-red-900/20">
          <CardHeader>
            <CardTitle className="text-white font-hindi flex items-center">
              {language === "hindi" ? "त्रुटि" : "Error"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-400 font-hindi">{error}</p>
            <Button 
              className="mt-4" 
              onClick={() => router.push("/admin/posts")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {language === "hindi" ? "वापस जाएं" : "Go Back"}
            </Button>
          </CardContent>
        </Card>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title={language === "hindi" ? "पोस्ट संपादित करें" : "Edit Post"}>
      <div className="flex items-center mb-6">
        <Button 
          variant="outline" 
          onClick={() => router.push("/admin/posts")}
          className="mr-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {language === "hindi" ? "वापस जाएं" : "Back"}
        </Button>
        <h1 className="text-xl font-bold text-white">
          {language === "hindi" ? "पोस्ट संपादित करें" : "Edit Post"}
        </h1>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Language Selector */}
        <div className="flex justify-end mb-4">
          <Tabs value={language} onValueChange={(value) => setLanguage(value as "hindi" | "english")}>
            <TabsList>
              <TabsTrigger value="hindi">हिंदी</TabsTrigger>
              <TabsTrigger value="english">English</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        {/* Auto-save Status */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Switch checked={autoSave} onCheckedChange={setAutoSave} />
            <Label className="text-gray-300 font-hindi text-sm">
              {language === "hindi" ? "ऑटो-सेव" : "Auto-save"}
            </Label>
          </div>
          
          <div className="flex items-center">
            {lastSaved && (
              <span className="text-sm text-gray-400 flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                {language === "hindi" 
                  ? `अंतिम सेव: ${lastSaved.toLocaleTimeString()}` 
                  : `Last saved: ${lastSaved.toLocaleTimeString()}`}
              </span>
            )}
            
            <span id="saveMessage" className="ml-4 text-sm text-green-500 flex items-center transition-opacity duration-300 opacity-0">
              <CheckCircle className="w-3 h-3 mr-1" />
              {language === "hindi" ? "ड्राफ्ट सेव किया गया" : "Draft saved"}
            </span>
            
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              className="ml-4 text-xs"
              onClick={handleSaveDraft}
            >
              {language === "hindi" ? "ड्राफ्ट सेव करें" : "Save Draft"}
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card className="border-gray-700 bg-gray-800">
              <CardHeader>
                <CardTitle className="text-white font-hindi">
                  {language === "hindi" ? "मुख्य जानकारी" : "Main Information"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="title" className="text-gray-300 font-hindi text-base font-semibold">
                    {language === "hindi" ? "शीर्षक *" : "Title *"}
                  </Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={language === "hindi" ? "समाचार का शीर्षक दर्ज करें" : "Enter news title"}
                    className="bg-gray-700 border-gray-600 text-white font-hindi mt-2 text-base"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="excerpt" className="text-gray-300 font-hindi text-base font-semibold">
                    {language === "hindi" ? "संक्षिप्त विवरण *" : "Excerpt *"}
                  </Label>
                  <Textarea
                    id="excerpt"
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    placeholder={language === "hindi" ? "समाचार का संक्षिप्त विवरण (150-200 शब्द)" : "Brief description of the news (150-200 words)"}
                    className="bg-gray-700 border-gray-600 text-white font-hindi mt-2 min-h-[100px]"
                    maxLength={500}
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {excerpt.length}/500 {language === "hindi" ? "अक्षर" : "characters"}
                  </p>
                </div>

                <div>
                  <Label htmlFor="content" className="text-gray-300 font-hindi text-base font-semibold">
                    {language === "hindi" ? "पूरा लेख *" : "Full Content *"}
                  </Label>
                  <RichTextEditor
                    value={content}
                    onChange={setContent}
                    placeholder={language === "hindi" ? "यहाँ अपना पूरा लेख लिखें..." : "Write your full article here..."}
                    minHeight="300px"
                    className="mt-2"
                    language={language}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Image Upload */}
            <Card className="border-gray-700 bg-gray-800">
              <CardHeader>
                <CardTitle className="text-white font-hindi flex items-center">
                  <ImageIcon className="w-5 h-5 mr-2" />
                  {language === "hindi" ? "फीचर्ड इमेज" : "Featured Image"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="image" className="text-gray-300 font-hindi text-base font-semibold">
                      {language === "hindi" ? "इमेज अपलोड करें" : "Upload Image"}
                    </Label>
                    <div className="mt-2 flex items-center space-x-4">
                      <Input
                        id="image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="flex-1 bg-gray-700 border-gray-600 text-white"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        className="border-gray-600 text-gray-300 hover:bg-gray-700 font-hindi"
                        onClick={uploadImageToFirebase}
                        disabled={!imageFile || isUploading}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        {language === "hindi" ? "अपलोड करें" : "Upload"}
                      </Button>
                    </div>
                    
                    {isUploading && (
                      <div className="mt-2">
                        <div className="w-full bg-gray-700 rounded-full h-2.5">
                          <div 
                            className="bg-blue-600 h-2.5 rounded-full" 
                            style={{ width: `${uploadProgress}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          {Math.round(uploadProgress)}% {language === "hindi" ? "अपलोड हो रहा है..." : "uploading..."}
                        </p>
                      </div>
                    )}
                  </div>

                  {imagePreview && (
                    <div className="relative">
                      <Image
                        src={imagePreview || "/placeholder.svg"}
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
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Publication Settings */}
            <Card className="border-gray-700 bg-gray-800">
              <CardHeader>
                <CardTitle className="text-white font-hindi">
                  {language === "hindi" ? "प्रकाशन सेटिंग्स" : "Publication Settings"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="text-gray-300 font-hindi text-base font-semibold">
                    {language === "hindi" ? "श्रेणी *" : "Category *"}
                  </Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white font-hindi mt-2">
                      <SelectValue placeholder={language === "hindi" ? "श्रेणी चुनें" : "Select category"} />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat} className="font-hindi">
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-gray-300 font-hindi text-base font-semibold">
                    {language === "hindi" ? "स्थिति" : "Status"}
                  </Label>
                  <Select value={status} onValueChange={(value: "published" | "draft") => setStatus(value)}>
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white font-hindi mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft" className="font-hindi">
                        {language === "hindi" ? "ड्राफ्ट" : "Draft"}
                      </SelectItem>
                      <SelectItem value="published" className="font-hindi">
                        {language === "hindi" ? "प्रकाशित करें" : "Published"}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-gray-300 font-hindi text-base font-semibold">
                      {language === "hindi" ? "ब्रेकिंग न्यूज़" : "Breaking News"}
                    </Label>
                    <Switch checked={isBreaking} onCheckedChange={setIsBreaking} />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="text-gray-300 font-hindi text-base font-semibold">
                      {language === "hindi" ? "स्लाइडर में जोड़ें" : "Add to Slider"}
                    </Label>
                    <Switch checked={addToSlider} onCheckedChange={setAddToSlider} />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tags */}
            <Card className="border-gray-700 bg-gray-800">
              <CardHeader>
                <CardTitle className="text-white font-hindi">
                  {language === "hindi" ? "टैग्स" : "Tags"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex space-x-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder={language === "hindi" ? "टैग जोड़ें" : "Add tag"}
                    className="bg-gray-700 border-gray-600 text-white font-hindi flex-1"
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                  />
                  <Button 
                    type="button" 
                    onClick={addTag} 
                    size="sm" 
                    className="bg-blue-600 hover:bg-blue-700 font-hindi"
                  >
                    {language === "hindi" ? "जोड़ें" : "Add"}
                  </Button>
                </div>

                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="font-hindi">
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
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 font-hindi text-base py-3"
                disabled={loading}
              >
                {loading ? (
                  language === "hindi" ? "अपडेट हो रहा है..." : "Updating..."
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {language === "hindi" ? "पोस्ट अपडेट करें" : "Update Post"}
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full border-gray-600 text-gray-300 hover:bg-gray-700 font-hindi text-base py-3"
                onClick={() => setPreviewOpen(true)}
              >
                <Eye className="w-4 h-4 mr-2" />
                {language === "hindi" ? "प्रीव्यू देखें" : "Preview"}
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full text-gray-400 hover:text-gray-300 font-hindi text-base py-3"
                onClick={() => router.push("/admin/posts")}
              >
                {language === "hindi" ? "रद्द करें" : "Cancel"}
              </Button>
            </div>
          </div>
        </div>
      </form>

      {/* Preview Modal */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {language === "hindi" ? "पोस्ट प्रीव्यू" : "Post Preview"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Preview Header */}
            <div className="space-y-2">
              {isBreaking && (
                <Badge className="bg-red-600 text-white">
                  {language === "hindi" ? "ब्रेकिंग न्यूज़" : "BREAKING NEWS"}
                </Badge>
              )}
              
              <h1 className="text-2xl font-bold font-hindi">{title}</h1>
              
              <div className="flex items-center space-x-2 text-gray-500 text-sm">
                <span>{new Date().toLocaleDateString()}</span>
                <span>•</span>
                <Badge variant="outline">{category}</Badge>
              </div>
            </div>
            
            {/* Preview Image */}
            {imagePreview && (
              <div className="rounded-lg overflow-hidden">
                <Image
                  src={imagePreview}
                  alt={title}
                  width={800}
                  height={400}
                  className="w-full h-auto object-cover"
                />
              </div>
            )}
            
            {/* Preview Excerpt */}
            <p className="text-lg font-medium italic border-l-4 border-gray-300 pl-4 py-2">
              {excerpt}
            </p>
            
            {/* Preview Content */}
            <div 
              className="prose max-w-none font-hindi"
              dangerouslySetInnerHTML={{ __html: formattedContent }}
            />
            
            {/* Preview Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="font-hindi">
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
            >
              {language === "hindi" ? "बंद करें" : "Close"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
}
