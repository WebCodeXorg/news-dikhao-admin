"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import type { User } from "firebase/auth"

// Define types without direct Firebase imports to avoid SSR issues
interface FirebaseContextType {
  user: User | null
  loading: boolean
  error: string | null
  initialized: boolean
}

const FirebaseContext = createContext<FirebaseContextType>({
  user: null,
  loading: true,
  error: null,
  initialized: false,
})

export const useFirebaseContext = () => {
  const context = useContext(FirebaseContext)
  if (!context) {
    throw new Error("useFirebaseContext must be used within a FirebaseProvider")
  }
  return context
}

interface FirebaseProviderProps {
  children: React.ReactNode
}

export function FirebaseProvider({ children }: FirebaseProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    // Only run on client side
    if (typeof window === "undefined") return

    let mounted = true
    let unsubscribeAuth: (() => void) | null = null

    const initializeFirebase = async () => {
      try {
        // First, import Firebase core
        const { initializeApp, getApps } = await import("firebase/app")

        const firebaseConfig = {
          apiKey: "AIzaSyAnwFsBaJPUblGxLU85fpoHDtvYmDbEc9Y",
          authDomain: "news-dikhao.firebaseapp.com",
          projectId: "news-dikhao",
          storageBucket: "news-dikhao.firebasestorage.app",
          messagingSenderId: "1038910067745",
          appId: "1:1038910067745:web:89594e8046a42986ff7f60",
          measurementId: "G-PZM8H7QQTB",
        }

        // Initialize Firebase app first
        let firebaseApp
        if (getApps().length === 0) {
          firebaseApp = initializeApp(firebaseConfig)
        } else {
          firebaseApp = getApps()[0]
        }

        // Then import and initialize auth separately
        const { getAuth, onAuthStateChanged } = await import("firebase/auth")
        const firebaseAuth = getAuth(firebaseApp)

        if (mounted) {
          setInitialized(true)

          // Set up auth state listener
          unsubscribeAuth = onAuthStateChanged(
            firebaseAuth,
            (currentUser) => {
              if (mounted) {
                setUser(currentUser)
                setLoading(false)
              }
            },
            (authError) => {
              console.error("Auth state error:", authError)
              if (mounted) {
                setError(authError.message)
                setLoading(false)
              }
            },
          )
        }
      } catch (error: any) {
        console.error("Firebase initialization error:", error)
        if (mounted) {
          setError(error.message)
          setLoading(false)
        }
      }
    }

    // Start initialization
    initializeFirebase()

    return () => {
      mounted = false
      if (unsubscribeAuth) {
        unsubscribeAuth()
      }
    }
  }, [])

  const value: FirebaseContextType = {
    user,
    loading,
    error,
    initialized,
  }

  return <FirebaseContext.Provider value={value}>{children}</FirebaseContext.Provider>
}
