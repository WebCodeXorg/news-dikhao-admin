"use client"

import { useState, useEffect } from "react"
import type { FirebaseApp } from "firebase/app"
import type { Auth } from "firebase/auth"
import type { Firestore } from "firebase/firestore"
import type { FirebaseStorage } from "firebase/storage"

interface FirebaseServices {
  app: FirebaseApp | null
  auth: Auth | null
  db: Firestore | null
  storage: FirebaseStorage | null
  initialized: boolean
  error: string | null
}

export function useFirebase(): FirebaseServices {
  const [services, setServices] = useState<FirebaseServices>({
    app: null,
    auth: null,
    db: null,
    storage: null,
    initialized: false,
    error: null,
  })

  useEffect(() => {
    let mounted = true

    const initializeFirebase = async () => {
      try {
        if (typeof window === "undefined") {
          return
        }

        // Dynamic imports to avoid SSR issues
        const { initializeApp, getApps } = await import("firebase/app")
        const { getAuth, connectAuthEmulator } = await import("firebase/auth")
        const { getFirestore, connectFirestoreEmulator } = await import("firebase/firestore")
        const { getStorage, connectStorageEmulator } = await import("firebase/storage")

        const firebaseConfig = {
          apiKey: "AIzaSyAnwFsBaJPUblGxLU85fpoHDtvYmDbEc9Y",
          authDomain: "news-dikhao.firebaseapp.com",
          projectId: "news-dikhao",
          storageBucket: "news-dikhao.firebasestorage.app",
          messagingSenderId: "1038910067745",
          appId: "1:1038910067745:web:89594e8046a42986ff7f60",
          measurementId: "G-PZM8H7QQTB",
        }

        // Initialize Firebase app
        let app: FirebaseApp
        if (getApps().length === 0) {
          app = initializeApp(firebaseConfig)
        } else {
          app = getApps()[0]
        }

        // Initialize services in the correct order
        const auth = getAuth(app)
        const db = getFirestore(app)
        const storage = getStorage(app)

        // Only connect to emulators in development
        if (process.env.NODE_ENV === "development" && typeof window !== "undefined") {
          try {
            // Check if emulators are already connected
            if (!auth.config.emulator) {
              connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true })
            }
            if (!(db as any)._delegate._databaseId.projectId.includes("demo-")) {
              connectFirestoreEmulator(db, "localhost", 8080)
            }
            if (!(storage as any)._host.includes("localhost")) {
              connectStorageEmulator(storage, "localhost", 9199)
            }
          } catch (emulatorError) {
            // Emulators might already be connected, ignore errors
            console.log("Emulator connection info:", emulatorError)
          }
        }

        if (mounted) {
          setServices({
            app,
            auth,
            db,
            storage,
            initialized: true,
            error: null,
          })
        }
      } catch (error: any) {
        console.error("Firebase initialization error:", error)
        if (mounted) {
          setServices((prev) => ({
            ...prev,
            error: error.message,
            initialized: false,
          }))
        }
      }
    }

    initializeFirebase()

    return () => {
      mounted = false
    }
  }, [])

  return services
}
