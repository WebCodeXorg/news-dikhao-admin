"use client"

import { 
  getFirebaseDb,
  getFirebaseStorage 
} from './firebase-config'
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  doc, 
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  DocumentData
} from 'firebase/firestore'
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject
} from 'firebase/storage'

export interface Post {
  id?: string
  title: string
  content: string
  excerpt: string
  category: string
  tags: string[]
  status: 'published' | 'draft'
  isBreaking: boolean
  addToSlider?: boolean
  imageUrl?: string
  createdAt?: any
  updatedAt?: any
  author: string
  views: number
  language: 'hindi' | 'english'
}

/**
 * Upload an image to Firebase Storage
 * @param file The file to upload
 * @param progressCallback Optional callback to track upload progress
 * @returns Promise with the download URL
 */
export async function uploadImage(
  file: File, 
  progressCallback?: (progress: number) => void
): Promise<string> {
  const storage = await getFirebaseStorage()
  const storageReference = ref(storage, `posts/${Date.now()}_${file.name}`)
  
  const uploadTask = uploadBytesResumable(storageReference, file)
  
  return new Promise<string>((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        if (progressCallback) {
          progressCallback(progress)
        }
      },
      (error) => {
        console.error("Upload error:", error)
        reject(error)
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)
        resolve(downloadURL)
      }
    )
  })
}

/**
 * Create a new post in Firestore
 * @param postData The post data to save
 * @returns Promise with the post ID
 */
export async function createPost(postData: Post): Promise<string> {
  try {
    const db = await getFirebaseDb()
    const docRef = await addDoc(collection(db, "posts"), {
      ...postData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      views: 0
    })
    return docRef.id
  } catch (error) {
    console.error("Error creating post:", error)
    throw error
  }
}

/**
 * Update an existing post in Firestore
 * @param postId The post ID to update
 * @param postData The updated post data
 */
export async function updatePost(postId: string, postData: Partial<Post>): Promise<void> {
  try {
    const db = await getFirebaseDb()
    const postRef = doc(db, "posts", postId)
    await updateDoc(postRef, {
      ...postData,
      updatedAt: serverTimestamp()
    })
  } catch (error) {
    console.error("Error updating post:", error)
    throw error
  }
}

/**
 * Delete a post from Firestore and its image from Storage
 * @param postId The post ID to delete
 * @param imageUrl Optional image URL to delete from storage
 */
export async function deletePost(postId: string, imageUrl?: string): Promise<void> {
  try {
    // Delete image from storage if URL provided
    if (imageUrl) {
      try {
        const storage = await getFirebaseStorage()
        const imageRef = ref(storage, imageUrl)
        await deleteObject(imageRef)
      } catch (error) {
        console.error("Error deleting image:", error)
        // Continue with post deletion even if image deletion fails
      }
    }
    
    // Delete post from Firestore
    const db = await getFirebaseDb()
    const postRef = doc(db, "posts", postId)
    await deleteDoc(postRef)
  } catch (error) {
    console.error("Error deleting post:", error)
    throw error
  }
}

/**
 * Get a post by ID
 * @param postId The post ID to fetch
 * @returns Promise with the post data
 */
export async function getPostById(postId: string): Promise<Post | null> {
  try {
    const db = await getFirebaseDb()
    const postRef = doc(db, "posts", postId)
    const postSnap = await getDoc(postRef)
    
    if (postSnap.exists()) {
      return { id: postSnap.id, ...postSnap.data() } as Post
    } else {
      return null
    }
  } catch (error) {
    console.error("Error getting post:", error)
    throw error
  }
}

/**
 * Get published posts with optional filtering
 * @param options Filter options
 * @returns Promise with an array of posts
 */
export async function getPublishedPosts(options: {
  category?: string
  language?: 'hindi' | 'english'
  isBreaking?: boolean
  limit?: number
} = {}): Promise<Post[]> {
  try {
    const db = await getFirebaseDb()
    let postsQuery = query(
      collection(db, "posts"),
      where("status", "==", "published")
    )
    
    if (options.category) {
      postsQuery = query(postsQuery, where("category", "==", options.category))
    }
    
    // Only apply language filter if specified and not empty
    if (options.language && options.language.trim() !== '') {
      postsQuery = query(postsQuery, where("language", "==", options.language))
    }
    
    if (options.isBreaking !== undefined) {
      postsQuery = query(postsQuery, where("isBreaking", "==", options.isBreaking))
    }
    
    postsQuery = query(postsQuery, orderBy("createdAt", "desc"))
    
    if (options.limit) {
      postsQuery = query(postsQuery, limit(options.limit))
    }
    
    const querySnapshot = await getDocs(postsQuery)
    const posts: Post[] = []
    
    querySnapshot.forEach((doc) => {
      posts.push({ id: doc.id, ...doc.data() } as Post)
    })
    
    console.log(`getPublishedPosts found ${posts.length} posts`)
    
    return posts
  } catch (error) {
    console.error("Error getting posts:", error)
    throw error
  }
}

/**
 * Get posts for the slider
 * @param language Optional language filter
 * @param maxPosts Maximum number of posts to return
 * @returns Promise with an array of posts
 */
export async function getSliderPosts(
  language?: 'hindi' | 'english',
  maxPosts: number = 5
): Promise<Post[]> {
  try {
    const db = await getFirebaseDb()
    let sliderQuery = query(
      collection(db, "posts"),
      where("status", "==", "published"),
      where("addToSlider", "==", true)
    )
    
    if (language) {
      sliderQuery = query(sliderQuery, where("language", "==", language))
    }
    
    sliderQuery = query(sliderQuery, orderBy("createdAt", "desc"), limit(maxPosts))
    
    const querySnapshot = await getDocs(sliderQuery)
    const posts: Post[] = []
    
    querySnapshot.forEach((doc) => {
      posts.push({ id: doc.id, ...doc.data() } as Post)
    })
    
    return posts
  } catch (error) {
    console.error("Error getting slider posts:", error)
    throw error
  }
}

/**
 * Increment the view count for a post
 * @param postId The post ID to update
 */
export async function incrementPostViews(postId: string): Promise<void> {
  try {
    const db = await getFirebaseDb()
    const postRef = doc(db, "posts", postId)
    const postSnap = await getDoc(postRef)
    
    if (postSnap.exists()) {
      const currentViews = postSnap.data().views || 0
      await updateDoc(postRef, {
        views: currentViews + 1
      })
    }
  } catch (error) {
    console.error("Error incrementing views:", error)
    // Don't throw error for view increments as it's not critical
  }
}

// Fetch posts by category
export async function getPostsByCategory(categoryName: string, postLimit: number = 10) {
  try {
    const db = await getFirebaseDb()
    
    // Create query to get published posts in the specified category
    const postsQuery = query(
      collection(db, "posts"),
      where("status", "==", "published"),
      where("category", "==", categoryName),
      orderBy("createdAt", "desc"),
      limit(postLimit)
    )
    
    const querySnapshot = await getDocs(postsQuery)
    
    const posts: Post[] = []
    querySnapshot.forEach((doc) => {
      posts.push({ id: doc.id, ...doc.data() } as Post)
    })
    
    return posts
  } catch (error) {
    console.error(`Error fetching ${categoryName} posts:`, error)
    return []
  }
}

// Fetch latest posts
export async function getLatestPosts(postLimit: number = 10) {
  try {
    console.log(`Starting getLatestPosts with limit: ${postLimit}`)
    const db = await getFirebaseDb()
    console.log('Firebase DB initialized successfully')
    
    // Create query to get latest published posts
    const postsQuery = query(
      collection(db, "posts"),
      where("status", "==", "published"),
      orderBy("createdAt", "desc"),
      limit(postLimit)
    )
    console.log('Query created, attempting to fetch documents')
    
    const querySnapshot = await getDocs(postsQuery)
    console.log(`Query executed, got ${querySnapshot.size} documents`)
    
    const posts: Post[] = []
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`Processing document: ${doc.id}, has image: ${!!data.imageUrl}`)
      posts.push({ id: doc.id, ...data } as Post)
    })
    
    console.log(`Returning ${posts.length} posts`)
    return posts
  } catch (error) {
    console.error("Error fetching latest posts:", error)
    if (error instanceof Error) {
      console.error(`Error details: ${error.message}`)
      console.error(`Error stack: ${error.stack}`)
    }
    // Return empty array to prevent UI from breaking
    return []
  }
}

// Fetch breaking news
export async function getBreakingNews(postLimit: number = 5) {
  try {
    const db = await getFirebaseDb()
    
    // Create query to get breaking news
    const postsQuery = query(
      collection(db, "posts"),
      where("status", "==", "published"),
      where("isBreaking", "==", true),
      orderBy("createdAt", "desc"),
      limit(postLimit)
    )
    
    const querySnapshot = await getDocs(postsQuery)
    
    const posts: Post[] = []
    querySnapshot.forEach((doc) => {
      posts.push({ id: doc.id, ...doc.data() } as Post)
    })
    
    return posts
  } catch (error) {
    console.error("Error fetching breaking news:", error)
    return []
  }
} 