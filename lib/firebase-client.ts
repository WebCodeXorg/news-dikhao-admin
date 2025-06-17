"use client"

import { getFirebaseAuth, getFirebaseDb, getFirebaseStorage, initializeFirebaseServices } from "./firebase-config"

// Re-export the main functions for backward compatibility
export const getAuth = getFirebaseAuth
export const getDb = getFirebaseDb
export const getStorage = getFirebaseStorage
export const getFirebaseServices = initializeFirebaseServices

// Additional helper functions
export async function ensureFirebaseInitialized() {
  try {
    await initializeFirebaseServices()
    return true
  } catch (error) {
    console.error("Failed to initialize Firebase:", error)
    return false
  }
}

export async function testFirebaseConnection() {
  try {
    const db = await getDb()
    const { doc, getDoc } = await import("firebase/firestore")

    // Try to read a test document
    const testDoc = doc(db, "test", "connection")
    await getDoc(testDoc)

    return { success: true, message: "Firebase connection successful" }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
}
