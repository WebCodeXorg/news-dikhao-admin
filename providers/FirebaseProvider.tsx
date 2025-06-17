"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { initializeFirebaseServices } from "@/lib/firebase-config"

interface FirebaseContextType {
  isReady: boolean
  isLoading: boolean
  error: string | null
  retryInitialization: () => void
}

const FirebaseContext = createContext<FirebaseContextType>({
  isReady: false,
  isLoading: true,
  error: null,
  retryInitialization: () => {},
})

export const useFirebase = () => {
  const context = useContext(FirebaseContext)
  if (!context) {
    throw new Error("useFirebase must be used within a FirebaseProvider")
  }
  return context
}

interface FirebaseProviderProps {
  children: React.ReactNode
}

export function FirebaseProvider({ children }: FirebaseProviderProps) {
  const [isReady, setIsReady] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const initializeFirebase = async () => {
    setIsLoading(true)
    setError(null)

    try {
      await initializeFirebaseServices()
      setIsReady(true)
    } catch (err: any) {
      console.error("Firebase Provider initialization error:", err)
      setError(err.message)
      setIsReady(false)
    } finally {
      setIsLoading(false)
    }
  }

  const retryInitialization = () => {
    initializeFirebase()
  }

  useEffect(() => {
    // Only initialize on client side
    if (typeof window !== "undefined") {
      initializeFirebase()
    } else {
      setIsLoading(false)
    }
  }, [])

  const value: FirebaseContextType = {
    isReady,
    isLoading,
    error,
    retryInitialization,
  }

  return <FirebaseContext.Provider value={value}>{children}</FirebaseContext.Provider>
}
