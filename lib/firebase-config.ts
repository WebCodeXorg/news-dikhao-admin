"use client"

import { initializeApp, getApps } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { getAuth } from "firebase/auth"
import { getStorage } from "firebase/storage"

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAnwFsBaJPUblGxLU85fpoHDtvYmDbEc9Y",
  authDomain: "news-dikhao.firebaseapp.com",
  projectId: "news-dikhao",
  storageBucket: "news-dikhao.appspot.com",
  messagingSenderId: "1038910067745",
  appId: "1:1038910067745:web:89594e8046a42986ff7f60",
  measurementId: "G-PZM8H7QQTB",
}

// Firebase service instances
let firebaseApp: any = null
let firebaseAuth: any = null
let firebaseDb: any = null
let firebaseStorage: any = null

// Initialization state
let isInitializing = false
let isInitialized = false
let initializationError: string | null = null

// Initialize Firebase services in correct order
export async function initializeFirebaseServices() {
  // Prevent multiple initializations
  if (isInitialized) {
    return {
      app: firebaseApp,
      auth: firebaseAuth,
      db: firebaseDb,
      storage: firebaseStorage,
    }
  }

  if (isInitializing) {
    // Wait for current initialization to complete
    while (isInitializing && !isInitialized) {
      await new Promise((resolve) => setTimeout(resolve, 100))
    }
    return {
      app: firebaseApp,
      auth: firebaseAuth,
      db: firebaseDb,
      storage: firebaseStorage,
    }
  }

  // Only run on client side
  if (typeof window === "undefined") {
    throw new Error("Firebase can only be initialized on the client side")
  }

  isInitializing = true

  try {
    console.log("Starting Firebase initialization...")

    // Step 1: Initialize Firebase App
    if (getApps().length === 0) {
      firebaseApp = initializeApp(firebaseConfig)
      console.log("Firebase app initialized")
    } else {
      firebaseApp = getApps()[0]
      console.log("Using existing Firebase app")
    }

    // Step 2: Initialize Auth
    firebaseAuth = getAuth(firebaseApp)
    console.log("Firebase Auth initialized")

    // Step 3: Initialize Firestore
    firebaseDb = getFirestore(firebaseApp)
    console.log("Firebase Firestore initialized")

    // Step 4: Initialize Storage
    firebaseStorage = getStorage(firebaseApp)
    console.log("Firebase Storage initialized")

    isInitialized = true
    isInitializing = false
    initializationError = null

    console.log("Firebase initialization completed successfully")

    return {
      app: firebaseApp,
      auth: firebaseAuth,
      db: firebaseDb,
      storage: firebaseStorage,
    }
  } catch (error: any) {
    isInitializing = false
    initializationError = error.message
    console.error("Firebase initialization failed:", error)
    throw new Error(`Firebase initialization failed: ${error.message}`)
  }
}

// Get Firebase App
export async function getFirebaseApp() {
  const services = await initializeFirebaseServices()
  return services.app
}

// Get Firebase Auth
export async function getFirebaseAuth() {
  const services = await initializeFirebaseServices()
  return services.auth
}

// Get Firebase Firestore
export async function getFirebaseDb() {
  const services = await initializeFirebaseServices()
  return services.db
}

// Get Firebase Storage
export async function getFirebaseStorage() {
  const services = await initializeFirebaseServices()
  return services.storage
}

// Check initialization status
export function getInitializationStatus() {
  return {
    isInitialized,
    isInitializing,
    error: initializationError,
  }
}

// Reset initialization (for testing)
export function resetFirebaseInitialization() {
  firebaseApp = null
  firebaseAuth = null
  firebaseDb = null
  firebaseStorage = null
  isInitialized = false
  isInitializing = false
  initializationError = null
}
