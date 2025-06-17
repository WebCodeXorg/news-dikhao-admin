"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Heading1, 
  Heading2, 
  Link, 
  Image as ImageIcon,
  Quote
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  minHeight?: string
  className?: string
  language?: "hindi" | "english"
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "",
  minHeight = "300px",
  className = "",
  language = "hindi"
}: RichTextEditorProps) {
  const [text, setText] = useState(value)
  const [htmlContent, setHtmlContent] = useState("")
  const [mode, setMode] = useState<"edit" | "preview">("edit")
  const [selectionStart, setSelectionStart] = useState(0)
  const [selectionEnd, setSelectionEnd] = useState(0)
  const [textareaRef, setTextareaRef] = useState<HTMLTextAreaElement | null>(null)

  useEffect(() => {
    setText(value)
  }, [value])

  useEffect(() => {
    // Convert text with markdown-like syntax to HTML for preview
    let html = text
      .replace(/\n/g, "<br>")
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/__(.*?)__/g, "<u>$1</u>")
      .replace(/^# (.*?)$/gm, "<h1>$1</h1>")
      .replace(/^## (.*?)$/gm, "<h2>$1</h2>")
      .replace(/^> (.*?)$/gm, "<blockquote>$1</blockquote>")
      .replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" style="max-width:100%">')
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>')
      
    setHtmlContent(html)
  }, [text])

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value
    setText(newText)
    onChange(newText)
    
    // Save selection position
    setSelectionStart(e.target.selectionStart)
    setSelectionEnd(e.target.selectionEnd)
  }

  const insertFormat = (before: string, after: string = "") => {
    if (!textareaRef) return

    const startPos = textareaRef.selectionStart
    const endPos = textareaRef.selectionEnd
    const selectedText = text.substring(startPos, endPos)
    
    const newText = 
      text.substring(0, startPos) + 
      before + 
      selectedText + 
      after + 
      text.substring(endPos)
    
    setText(newText)
    onChange(newText)
    
    // Set cursor position after insertion
    setTimeout(() => {
      if (textareaRef) {
        textareaRef.focus()
        textareaRef.setSelectionRange(
          startPos + before.length, 
          endPos + before.length
        )
      }
    }, 0)
  }

  const formatBold = () => insertFormat("**", "**")
  const formatItalic = () => insertFormat("*", "*")
  const formatUnderline = () => insertFormat("__", "__")
  const formatH1 = () => insertFormat("# ")
  const formatH2 = () => insertFormat("## ")
  const formatQuote = () => insertFormat("> ")
  const formatBulletList = () => insertFormat("- ")
  const formatNumberList = () => insertFormat("1. ")
  
  const formatLink = () => {
    const url = prompt(language === "hindi" ? "लिंक URL दर्ज करें:" : "Enter link URL:")
    if (url) {
      insertFormat("[", "](" + url + ")")
    }
  }
  
  const formatImage = () => {
    const url = prompt(language === "hindi" ? "इमेज URL दर्ज करें:" : "Enter image URL:")
    if (url) {
      const alt = prompt(language === "hindi" ? "इमेज के लिए वैकल्पिक टेक्स्ट:" : "Alternative text for image:")
      insertFormat("![" + (alt || ""), "](" + url + ")")
    }
  }

  return (
    <div className={`border rounded-md overflow-hidden ${className}`}>
      <Tabs value={mode} onValueChange={(value) => setMode(value as "edit" | "preview")}>
        {/* Toolbar */}
        <div className="flex items-center bg-gray-800 border-b border-gray-700 p-2 flex-wrap gap-1">
          <Button 
            type="button" 
            variant="ghost" 
            size="sm" 
            onClick={formatBold}
            className="text-gray-300 hover:bg-gray-700 hover:text-white"
          >
            <Bold size={16} />
          </Button>
          <Button 
            type="button" 
            variant="ghost" 
            size="sm" 
            onClick={formatItalic}
            className="text-gray-300 hover:bg-gray-700 hover:text-white"
          >
            <Italic size={16} />
          </Button>
          <Button 
            type="button" 
            variant="ghost" 
            size="sm" 
            onClick={formatUnderline}
            className="text-gray-300 hover:bg-gray-700 hover:text-white"
          >
            <Underline size={16} />
          </Button>
          <div className="h-4 w-px bg-gray-700 mx-1"></div>
          <Button 
            type="button" 
            variant="ghost" 
            size="sm" 
            onClick={formatH1}
            className="text-gray-300 hover:bg-gray-700 hover:text-white"
          >
            <Heading1 size={16} />
          </Button>
          <Button 
            type="button" 
            variant="ghost" 
            size="sm" 
            onClick={formatH2}
            className="text-gray-300 hover:bg-gray-700 hover:text-white"
          >
            <Heading2 size={16} />
          </Button>
          <div className="h-4 w-px bg-gray-700 mx-1"></div>
          <Button 
            type="button" 
            variant="ghost" 
            size="sm" 
            onClick={formatBulletList}
            className="text-gray-300 hover:bg-gray-700 hover:text-white"
          >
            <List size={16} />
          </Button>
          <Button 
            type="button" 
            variant="ghost" 
            size="sm" 
            onClick={formatNumberList}
            className="text-gray-300 hover:bg-gray-700 hover:text-white"
          >
            <ListOrdered size={16} />
          </Button>
          <div className="h-4 w-px bg-gray-700 mx-1"></div>
          <Button 
            type="button" 
            variant="ghost" 
            size="sm" 
            onClick={formatQuote}
            className="text-gray-300 hover:bg-gray-700 hover:text-white"
          >
            <Quote size={16} />
          </Button>
          <Button 
            type="button" 
            variant="ghost" 
            size="sm" 
            onClick={formatLink}
            className="text-gray-300 hover:bg-gray-700 hover:text-white"
          >
            <Link size={16} />
          </Button>
          <Button 
            type="button" 
            variant="ghost" 
            size="sm" 
            onClick={formatImage}
            className="text-gray-300 hover:bg-gray-700 hover:text-white"
          >
            <ImageIcon size={16} />
          </Button>
          
          <div className="ml-auto">
            <TabsList className="bg-gray-700">
              <TabsTrigger value="edit" className="data-[state=active]:bg-gray-600">
                {language === "hindi" ? "संपादन" : "Edit"}
              </TabsTrigger>
              <TabsTrigger value="preview" className="data-[state=active]:bg-gray-600">
                {language === "hindi" ? "प्रीव्यू" : "Preview"}
              </TabsTrigger>
            </TabsList>
          </div>
        </div>
        
        {/* Editor */}
        <TabsContent value="edit" className="mt-0">
          <textarea
            ref={(ref) => setTextareaRef(ref)}
            value={text}
            onChange={handleTextChange}
            placeholder={placeholder}
            className="w-full bg-gray-700 border-gray-600 text-white font-hindi p-4 outline-none"
            style={{ minHeight }}
          />
        </TabsContent>
        
        <TabsContent value="preview" className="mt-0">
          <div 
            className="w-full bg-gray-700 text-white font-hindi p-4 prose prose-invert max-w-none"
            style={{ minHeight }}
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        </TabsContent>
      </Tabs>
      
      {/* Help text */}
      <div className="bg-gray-800 border-t border-gray-700 p-2 text-xs text-gray-400">
        {language === "hindi" 
          ? "फॉर्मेटिंग: **बोल्ड**, *इटैलिक*, __अंडरलाइन__, # शीर्षक, ## उपशीर्षक, > उद्धरण"
          : "Formatting: **bold**, *italic*, __underline__, # heading, ## subheading, > quote"}
      </div>
    </div>
  )
} 