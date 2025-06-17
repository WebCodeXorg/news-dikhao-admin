"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { HardDrive } from "lucide-react"
import { getFirebaseDb } from "@/lib/firebase-config"
import { collection, getDocs } from "firebase/firestore"

interface StorageUsageProps {
  language?: "hindi" | "english"
}

export default function StorageUsage({ language = "hindi" }: StorageUsageProps) {
  const [usage, setUsage] = useState<{
    used: number
    total: number
    percentage: number
    loading: boolean
    error: string | null
    lastUpdated: string | null
    lastImageSize: number | null
  }>({
    used: 0,
    total: 25, // 25 GB free tier limit
    percentage: 0,
    loading: true,
    error: null,
    lastUpdated: null,
    lastImageSize: null
  })

  useEffect(() => {
    const fetchStorageUsage = async () => {
      try {
        // Fetch the storage usage data from Firestore
        const db = await getFirebaseDb()
        const storageCollectionRef = collection(db, "storage_usage")
        const storageQuery = await getDocs(storageCollectionRef)
        
        if (storageQuery.empty) {
          // No storage data found, use default values
          setUsage({
            used: 0,
            total: 25,
            percentage: 0,
            loading: false,
            error: null,
            lastUpdated: null,
            lastImageSize: null
          })
          return
        }
        
        // Get the first document (we're using one document to track total storage)
        const storageDoc = storageQuery.docs[0]
        const storageData = storageDoc.data()
        
        // Keep the size in MB instead of converting to GB
        const usedMB = storageData.totalSize || 0
        const totalGB = 25 // Free tier limit (in GB)
        const totalMB = totalGB * 1024 // Convert total to MB for percentage calculation
        const percentage = (usedMB / totalMB) * 100
        
        // Format the timestamp if it exists
        let lastUpdated = null
        if (storageData.lastUpdated) {
          const date = storageData.lastUpdated.toDate ? 
            storageData.lastUpdated.toDate() : 
            new Date(storageData.lastUpdated)
          
          lastUpdated = date.toLocaleString('hi-IN', {
            day: 'numeric',
            month: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: 'numeric'
          })
        }
        
        setUsage({
          used: usedMB,
          total: totalGB,
          percentage: percentage,
          loading: false,
          error: null,
          lastUpdated: lastUpdated,
          lastImageSize: storageData.lastImageSize || null
        })
        
      } catch (error) {
        console.error("Error fetching storage usage:", error)
        setUsage(prev => ({
          ...prev,
          loading: false,
          error: language === "hindi" ? 
            "स्टोरेज उपयोग फेच करने में त्रुटि हुई" : 
            "Failed to fetch storage usage"
        }))
      }
    }

    fetchStorageUsage()
  }, [language])

  // Update the formatSize function to handle MB/GB display
  const formatSize = (size: number, unit: 'MB' | 'GB') => `${size.toFixed(2)} ${unit}`

  return (
    <Card className="border-gray-700 bg-gray-800 shadow-lg">
      <CardHeader className="bg-gray-750">
        <CardTitle className="text-white font-hindi flex items-center text-xl">
          <HardDrive className="w-5 h-5 mr-2" />
          {language === "hindi" ? "स्टोरेज उपयोग" : "Storage Usage"}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        {usage.loading ? (
          <div className="flex justify-center items-center h-24">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : usage.error ? (
          <div className="text-red-400 text-center py-4">
            {usage.error}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-gray-400 font-hindi text-sm">
                  {language === "hindi" ? "उपयोग किया गया" : "Used"}
                </span>
                <p className="text-2xl font-bold text-white">
                  {usage.used < 1024 
                    ? formatSize(usage.used, 'MB') 
                    : formatSize(usage.used / 1024, 'GB')}
                </p>
              </div>
              <div className="text-right">
                <span className="text-gray-400 font-hindi text-sm">
                  {language === "hindi" ? "कुल" : "Total"}
                </span>
                <p className="text-2xl font-bold text-white">
                  {formatSize(usage.total, 'GB')}
                </p>
              </div>
            </div>
            
            <div className="space-y-2">
              <Progress 
                value={usage.percentage} 
                className="h-2 bg-gray-700" 
                indicatorClassName={
                  usage.percentage > 90 
                    ? "bg-red-500" 
                    : usage.percentage > 70 
                      ? "bg-yellow-500" 
                      : "bg-green-500"
                }
              />
              <div className="flex justify-between text-xs text-gray-400">
                <span>{usage.percentage.toFixed(1)}%</span>
                <span>
                  {language === "hindi" 
                    ? `${(usage.total * 1024 - usage.used).toFixed(2)} MB शेष` 
                    : `${(usage.total * 1024 - usage.used).toFixed(2)} MB remaining`}
                </span>
              </div>
            </div>
            
            {usage.lastImageSize !== null && (
              <div className="mt-4 p-3 bg-gray-700 rounded-lg">
                <div className="text-sm text-gray-300 font-hindi">
                  {language === "hindi" ? "अंतिम अपलोड की गई इमेज" : "Last uploaded image"}:
                  <span className="ml-2 text-blue-400 font-medium">{formatSize(usage.lastImageSize, 'MB')}</span>
                </div>
                {usage.lastUpdated && (
                  <div className="text-xs text-gray-400 mt-1">
                    {language === "hindi" ? "अपडेट किया गया" : "Updated"}: {usage.lastUpdated}
                  </div>
                )}
              </div>
            )}
            
            <div className="pt-2 text-center">
              <p className="text-sm text-gray-400 font-hindi">
                {language === "hindi" 
                  ? "क्लाउडिनरी स्टोरेज का उपयोग" 
                  : "Cloudinary storage usage"}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 