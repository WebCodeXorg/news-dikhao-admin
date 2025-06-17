"use client"

import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  type User,
} from "firebase/auth"

// Dynamic import to avoid SSR issues
const getAuth = async () => {
  if (typeof window === "undefined") return null
  const { auth } = await import("./firebase")
  return auth
}

export const loginAdmin = async (email: string, password: string) => {
  try {
    const auth = await getAuth()
    if (!auth) throw new Error("Auth not available")

    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    return { success: true, user: userCredential.user }
  } catch (error: any) {
    console.error("Login error:", error)
    return { success: false, error: error.message }
  }
}

export const logoutAdmin = async () => {
  try {
    const auth = await getAuth()
    if (!auth) throw new Error("Auth not available")

    await signOut(auth)
    return { success: true }
  } catch (error: any) {
    console.error("Logout error:", error)
    return { success: false, error: error.message }
  }
}

export const onAuthChange = async (callback: (user: User | null) => void) => {
  const auth = await getAuth()
  if (!auth) return () => {}

  return onAuthStateChanged(auth, callback)
}

export const createAdminUser = async (email: string, password: string) => {
  try {
    const auth = await getAuth()
    if (!auth) throw new Error("Auth not available")

    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    return { success: true, user: userCredential.user }
  } catch (error: any) {
    console.error("Create user error:", error)
    return { success: false, error: error.message }
  }
}
