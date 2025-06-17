"use client"

import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  Timestamp,
} from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"

export interface NewsPost {
  id?: string
  title: string
  content: string
  category: string
  tags: string[]
  status: "published" | "draft"
  imageUrl?: string
  createdAt: Timestamp
  updatedAt: Timestamp
}

// Dynamic import to avoid SSR issues
const getFirebaseServices = async () => {
  if (typeof window === "undefined") return { db: null, storage: null }
  const { db, storage } = await import("./firebase")
  return { db, storage }
}

export const addPost = async (post: Omit<NewsPost, "id" | "createdAt" | "updatedAt">) => {
  try {
    const { db } = await getFirebaseServices()
    if (!db) throw new Error("Database not available")

    const now = Timestamp.now()
    const docRef = await addDoc(collection(db, "posts"), {
      ...post,
      createdAt: now,
      updatedAt: now,
    })
    return { success: true, id: docRef.id }
  } catch (error: any) {
    console.error("Add post error:", error)
    return { success: false, error: error.message }
  }
}

export const getAllPosts = async () => {
  try {
    const { db } = await getFirebaseServices()
    if (!db) throw new Error("Database not available")

    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"))
    const querySnapshot = await getDocs(q)
    const posts: NewsPost[] = []

    querySnapshot.forEach((doc) => {
      posts.push({ id: doc.id, ...doc.data() } as NewsPost)
    })

    return { success: true, posts }
  } catch (error: any) {
    console.error("Get posts error:", error)
    return { success: false, error: error.message, posts: [] }
  }
}

export const getPublishedPosts = async () => {
  try {
    const { db } = await getFirebaseServices()
    if (!db) throw new Error("Database not available")

    const q = query(collection(db, "posts"), where("status", "==", "published"), orderBy("createdAt", "desc"))
    const querySnapshot = await getDocs(q)
    const posts: NewsPost[] = []

    querySnapshot.forEach((doc) => {
      posts.push({ id: doc.id, ...doc.data() } as NewsPost)
    })

    return { success: true, posts }
  } catch (error: any) {
    console.error("Get published posts error:", error)
    return { success: false, error: error.message, posts: [] }
  }
}

export const updatePost = async (id: string, updates: Partial<NewsPost>) => {
  try {
    const { db } = await getFirebaseServices()
    if (!db) throw new Error("Database not available")

    const postRef = doc(db, "posts", id)
    await updateDoc(postRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    })
    return { success: true }
  } catch (error: any) {
    console.error("Update post error:", error)
    return { success: false, error: error.message }
  }
}

export const deletePost = async (id: string) => {
  try {
    const { db } = await getFirebaseServices()
    if (!db) throw new Error("Database not available")

    await deleteDoc(doc(db, "posts", id))
    return { success: true }
  } catch (error: any) {
    console.error("Delete post error:", error)
    return { success: false, error: error.message }
  }
}

export const uploadImage = async (file: File) => {
  try {
    const { storage } = await getFirebaseServices()
    if (!storage) throw new Error("Storage not available")

    const timestamp = Date.now()
    const fileName = `${timestamp}_${file.name}`
    const storageRef = ref(storage, `images/${fileName}`)

    await uploadBytes(storageRef, file)
    const downloadURL = await getDownloadURL(storageRef)

    return { success: true, url: downloadURL }
  } catch (error: any) {
    console.error("Upload image error:", error)
    return { success: false, error: error.message }
  }
}
