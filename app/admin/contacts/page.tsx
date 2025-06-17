"use client"

import { useState, useEffect } from "react"
import AdminLayout from "@/components/admin/AdminLayout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getFirebaseDb } from "@/lib/firebase-config"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { Loader2, Save, Check, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface ContactData {
  email: string
  phone: string
  address: string
  facebook: string
  twitter: string
  youtube: string
  instagram: string
}

const defaultContactData: ContactData = {
  email: "contact@newsdikhao.com",
  phone: "+91 98765 43210",
  address: "नई दिल्ली, भारत",
  facebook: "#",
  twitter: "#",
  youtube: "#",
  instagram: "#"
}

export default function ContactsPage() {
  const [contactData, setContactData] = useState<ContactData>(defaultContactData)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  useEffect(() => {
    const fetchContactData = async () => {
      try {
        setLoading(true)
        const db = await getFirebaseDb()
        const contactRef = doc(db, "settings", "contact")
        const contactSnap = await getDoc(contactRef)

        if (contactSnap.exists()) {
          setContactData(contactSnap.data() as ContactData)
        } else {
          // If document doesn't exist, use defaults
          setContactData(defaultContactData)
        }
      } catch (error) {
        console.error("Error fetching contact data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchContactData()
  }, [])

  const handleInputChange = (field: keyof ContactData, value: string) => {
    setContactData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Reset status messages when editing
    setSaveSuccess(false)
    setSaveError(null)
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setSaveSuccess(false)
      setSaveError(null)
      
      const db = await getFirebaseDb()
      const contactRef = doc(db, "settings", "contact")
      
      await setDoc(contactRef, contactData)
      
      setSaveSuccess(true)
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false)
      }, 3000)
      
    } catch (error) {
      console.error("Error saving contact data:", error)
      setSaveError("संपर्क जानकारी सहेजने में त्रुटि हुई। कृपया पुनः प्रयास करें।")
    } finally {
      setSaving(false)
    }
  }

  return (
    <AdminLayout>
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold font-hindi">संपर्क जानकारी प्रबंधन</h1>
          <Button 
            onClick={handleSave} 
            disabled={loading || saving}
            className="flex items-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>सहेज रहा है...</span>
              </>
            ) : saveSuccess ? (
              <>
                <Check className="h-4 w-4" />
                <span>सहेजा गया!</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>सहेजें</span>
              </>
            )}
          </Button>
        </div>

        {saveError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>त्रुटि</AlertTitle>
            <AlertDescription>{saveError}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <span className="ml-3 text-lg font-hindi">लोड हो रहा है...</span>
          </div>
        ) : (
          <Tabs defaultValue="contact" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="contact" className="font-hindi">संपर्क जानकारी</TabsTrigger>
              <TabsTrigger value="social" className="font-hindi">सोशल मीडिया</TabsTrigger>
            </TabsList>
            
            <TabsContent value="contact">
              <Card>
                <CardHeader>
                  <CardTitle className="font-hindi">संपर्क विवरण</CardTitle>
                  <CardDescription className="font-hindi">
                    ये विवरण वेबसाइट के फुटर में दिखाए जाएंगे
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="font-hindi">ईमेल पता</Label>
                    <Input 
                      id="email" 
                      value={contactData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="contact@example.com"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="font-hindi">फोन नंबर</Label>
                    <Input 
                      id="phone" 
                      value={contactData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="+91 98765 43210"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="address" className="font-hindi">पता</Label>
                    <Textarea 
                      id="address" 
                      value={contactData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      placeholder="नई दिल्ली, भारत"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="social">
              <Card>
                <CardHeader>
                  <CardTitle className="font-hindi">सोशल मीडिया लिंक्स</CardTitle>
                  <CardDescription className="font-hindi">
                    सोशल मीडिया प्लेटफॉर्म के लिंक्स जोड़ें
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="facebook" className="font-hindi">फेसबुक</Label>
                    <Input 
                      id="facebook" 
                      value={contactData.facebook}
                      onChange={(e) => handleInputChange('facebook', e.target.value)}
                      placeholder="https://facebook.com/newsdikhao"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="twitter" className="font-hindi">ट्विटर</Label>
                    <Input 
                      id="twitter" 
                      value={contactData.twitter}
                      onChange={(e) => handleInputChange('twitter', e.target.value)}
                      placeholder="https://twitter.com/newsdikhao"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="youtube" className="font-hindi">यूट्यूब</Label>
                    <Input 
                      id="youtube" 
                      value={contactData.youtube}
                      onChange={(e) => handleInputChange('youtube', e.target.value)}
                      placeholder="https://youtube.com/newsdikhao"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="instagram" className="font-hindi">इंस्टाग्राम</Label>
                    <Input 
                      id="instagram" 
                      value={contactData.instagram}
                      onChange={(e) => handleInputChange('instagram', e.target.value)}
                      placeholder="https://instagram.com/newsdikhao"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </AdminLayout>
  )
} 