"use client"

import { 
  collection, 
  addDoc, 
  serverTimestamp,
} from 'firebase/firestore'
import { getFirebaseDb } from './firebase-config'

export interface CloudinaryPost {
  id?: string
  title: string
  description: string
  content: string
  category: string
  tags: string[]
  status: 'published' | 'draft'
  isBreaking: boolean
  inSlider: boolean
  imageUrl: string
  createdAt?: any
  author?: string
  views?: number
}

/**
 * Upload an image to Cloudinary and return the secure URL
 * @param file The image file to upload
 * @param progressCallback Optional callback to track upload progress
 * @returns Promise with the secure URL from Cloudinary
 */
export async function uploadToCloudinary(
  file: File,
  progressCallback?: (progress: number) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    // Create form data for Cloudinary upload
    const formData = new FormData()
    formData.append('file', file)
    formData.append('cloud_name', 'divmafjmq')
    formData.append('upload_preset', 'ml_default') // Using unsigned upload preset
    // API Key can be included (not the secret)
    formData.append('api_key', '236453954686142')
    
    console.log('Starting Cloudinary upload with:', {
      cloudName: 'divmafjmq',
      uploadPreset: 'ml_default',
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type
    })

    // Create XMLHttpRequest for upload with progress tracking
    const xhr = new XMLHttpRequest()
    xhr.open('POST', 'https://api.cloudinary.com/v1_1/divmafjmq/image/upload', true)
    
    // Track upload progress
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && progressCallback) {
        const progress = Math.round((event.loaded / event.total) * 100)
        progressCallback(progress)
        console.log(`Upload progress: ${progress}%`)
      }
    }
    
    // Handle response
    xhr.onload = function() {
      console.log('Cloudinary response status:', xhr.status)
      console.log('Cloudinary response text:', xhr.responseText.substring(0, 200) + '...')
      
      if (xhr.status === 200) {
        try {
          const response = JSON.parse(xhr.responseText)
          if (response.secure_url) {
            console.log('Upload successful, secure URL:', response.secure_url)
            resolve(response.secure_url)
          } else {
            console.error('Missing secure_url in response:', response)
            reject(new Error('Invalid response from Cloudinary: Missing secure_url'))
          }
        } catch (error) {
          console.error('Failed to parse response:', error)
          reject(new Error(`Failed to parse Cloudinary response: ${error}`))
        }
      } else {
        try {
          const errorResponse = JSON.parse(xhr.responseText)
          console.error('Upload failed with error:', errorResponse)
          reject(new Error(`Upload failed: ${errorResponse.error?.message || 'Unknown error'}`))
        } catch (e) {
          console.error('Upload failed with status:', xhr.status, xhr.statusText)
          reject(new Error(`Upload failed with status ${xhr.status}: ${xhr.statusText}`))
        }
      }
    }
    
    // Handle errors
    xhr.onerror = function(e) {
      console.error('Network error during upload:', e)
      reject(new Error('Network error during upload'))
    }
    
    // Send the form data
    xhr.send(formData)
  })
}

/**
 * Try multiple upload presets if the default one fails
 * @param file The image file to upload
 * @param progressCallback Optional callback to track upload progress
 * @returns Promise with the secure URL from Cloudinary
 */
export async function uploadToCloudinaryWithFallback(
  file: File,
  progressCallback?: (progress: number) => void
): Promise<string> {
  // List of possible upload presets to try
  const presets = ['ml_default', 'ml_unsigned', 'unsigned_preset', 'default_preset']
  
  let lastError = null
  
  // Try each preset until one works
  for (const preset of presets) {
    try {
      console.log(`Trying upload with preset: ${preset}`)
      
      const formData = new FormData()
      formData.append('file', file)
      formData.append('cloud_name', 'divmafjmq')
      formData.append('upload_preset', preset)
      formData.append('api_key', '236453954686142')
      
      const response = await fetch('https://api.cloudinary.com/v1_1/divmafjmq/image/upload', {
        method: 'POST',
        body: formData
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error(`Upload failed with preset ${preset}:`, errorData)
        throw new Error(`Upload failed with preset ${preset}: ${errorData.error?.message || 'Unknown error'}`)
      }
      
      const data = await response.json()
      if (data.secure_url) {
        console.log(`Successfully uploaded with preset: ${preset}`)
        return data.secure_url
      }
      
      throw new Error('Missing secure_url in response')
    } catch (error) {
      console.error(`Error with preset ${preset}:`, error)
      lastError = error
      // Continue to the next preset
    }
  }
  
  // If we get here, all presets failed
  throw lastError || new Error('All upload presets failed')
}

/**
 * Create a new post with Cloudinary image in Firestore
 * @param postData The post data without image URL
 * @param imageFile The image file to upload to Cloudinary
 * @param progressCallback Optional callback to track upload progress
 * @returns Promise with the post ID
 */
export async function createPostWithCloudinaryImage(
  postData: Omit<CloudinaryPost, 'imageUrl' | 'id' | 'createdAt'>,
  imageFile: File,
  progressCallback?: (progress: number) => void
): Promise<string> {
  try {
    // First upload the image to Cloudinary
    const imageUrl = await uploadToCloudinaryWithFallback(imageFile, progressCallback)
    
    // Then save the post with the image URL to Firestore
    const db = await getFirebaseDb()
    const docRef = await addDoc(collection(db, "posts"), {
      ...postData,
      imageUrl,
      createdAt: serverTimestamp(),
      views: 0
    })
    
    return docRef.id
  } catch (error) {
    console.error("Error creating post with Cloudinary image:", error)
    throw error
  }
}

/**
 * Submit a post with optional Cloudinary image
 * This function handles both cases - with and without image
 * @param postData The post data
 * @param imageFile Optional image file to upload to Cloudinary
 * @param progressCallback Optional callback to track upload progress
 * @returns Promise with the post ID
 */
export async function submitPost(
  postData: Omit<CloudinaryPost, 'id' | 'createdAt' | 'imageUrl'> & { imageUrl?: string },
  imageFile: File | null,
  progressCallback?: (progress: number) => void
): Promise<string> {
  try {
    let imageUrl = postData.imageUrl || ''
    
    // If there's a new image file, upload it to Cloudinary
    if (imageFile) {
      try {
        imageUrl = await uploadToCloudinaryWithFallback(imageFile, progressCallback)
      } catch (error) {
        console.error("Error uploading to Cloudinary:", error)
        throw new Error(`Image upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }
    
    // Save the post with the image URL to Firestore
    try {
      const db = await getFirebaseDb()
      const docRef = await addDoc(collection(db, "posts"), {
        ...postData,
        imageUrl,
        createdAt: serverTimestamp(),
        views: 0
      })
      
      return docRef.id
    } catch (error) {
      console.error("Error saving post to Firestore:", error)
      throw new Error(`Database error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  } catch (error) {
    console.error("Error submitting post:", error)
    throw error
  }
} 