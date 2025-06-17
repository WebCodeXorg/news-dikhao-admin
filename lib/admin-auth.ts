"use client"

import { getFirebaseDb } from "./firebase-config"
import { DEV_CONFIG, shouldBypassAuth } from "./dev-config"

// Admin authentication utilities
export interface AdminSession {
  email: string
  role: string
  loginTime: string
  isDev?: boolean
}

export const getAdminSession = (): AdminSession | null => {
  if (typeof window === "undefined") return null

  try {
    const session = localStorage.getItem("adminSession")
    if (!session) return null

    const parsedSession = JSON.parse(session)

    // Check if session is still valid (24 hours, or unlimited in dev mode)
    const loginTime = new Date(parsedSession.loginTime)
    const now = new Date()
    const hoursDiff = (now.getTime() - loginTime.getTime()) / (1000 * 60 * 60)

    // In dev mode, sessions don't expire
    if (!parsedSession.isDev && hoursDiff > 24) {
      localStorage.removeItem("adminSession")
      return null
    }

    return parsedSession
  } catch (error) {
    console.error("Error getting admin session:", error)
    localStorage.removeItem("adminSession")
    return null
  }
}

export const clearAdminSession = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("adminSession")
  }
}

export const isAdminLoggedIn = (): boolean => {
  return getAdminSession() !== null
}

export const validateAdminAccess = async (email: string): Promise<boolean> => {
  // In dev mode with bypass, always return true
  if (shouldBypassAuth()) {
    console.log("🔧 DEV MODE: Bypassing admin access validation")
    return true
  }

  try {
    const db = await getFirebaseDb()
    const { collection, query, where, getDocs } = await import("firebase/firestore")

    const loginsRef = collection(db, "logins")
    const q = query(loginsRef, where("email", "==", email), where("role", "==", "admin"), where("active", "==", true))
    const querySnapshot = await getDocs(q)

    return !querySnapshot.empty
  } catch (error) {
    console.error("Error validating admin access:", error)
    return false
  }
}

export const loginWithCredentials = async (email: string, password: string) => {
  try {
    console.log("🔍 Login attempt for:", email)

    // DEV MODE: Bypass authentication
    if (shouldBypassAuth()) {
      console.log("🔧 DEV MODE: Bypassing authentication - any credentials accepted")

      const session = {
        email: email,
        role: "admin",
        loginTime: new Date().toISOString(),
        isDev: true,
      }

      localStorage.setItem("adminSession", JSON.stringify(session))
      console.log("✅ DEV MODE: Admin session created for", email)

      return {
        success: true,
        session,
        message: "🔧 Development Mode: Login bypassed successfully!",
      }
    }

    const db = await getFirebaseDb()
    console.log("✅ Firestore database connected")

    const { collection, query, where, getDocs } = await import("firebase/firestore")

    // Check credentials against logins collection
    const loginsRef = collection(db, "logins")
    console.log("🔍 Searching in logins collection...")

    const q = query(
      loginsRef,
      where("email", "==", email),
      where("password", "==", password),
      where("active", "==", true),
    )

    const querySnapshot = await getDocs(q)
    console.log("📊 Query result - Documents found:", querySnapshot.size)

    if (!querySnapshot.empty) {
      const loginDoc = querySnapshot.docs[0]
      const loginData = loginDoc.data()
      console.log("✅ Login data found:", { email: loginData.email, role: loginData.role })

      if (loginData.role === "admin") {
        const session = {
          email: loginData.email,
          role: loginData.role,
          loginTime: new Date().toISOString(),
          isDev: false,
        }

        localStorage.setItem("adminSession", JSON.stringify(session))
        console.log("✅ Admin session stored successfully")

        return { success: true, session }
      } else {
        console.log("❌ User role is not admin:", loginData.role)
        return { success: false, error: "आपके पास एडमिन एक्सेस नहीं है" }
      }
    } else {
      console.log("❌ No matching credentials found")

      // Let's also check what documents exist in the collection
      const allDocsQuery = query(loginsRef)
      const allDocs = await getDocs(allDocsQuery)
      console.log("📋 All documents in logins collection:", allDocs.size)

      allDocs.forEach((doc) => {
        const data = doc.data()
        console.log("📄 Document:", doc.id, "Email:", data.email, "Active:", data.active)
      })

      return { success: false, error: "गलत ईमेल या पासवर्ड। पहले Admin Login बनाएं।" }
    }
  } catch (error: any) {
    console.error("❌ Login error:", error)
    return { success: false, error: "लॉगिन में त्रुटि: " + error.message }
  }
}

// Create a new admin account (Sign Up functionality)
export const signUpAdmin = async (email: string, password: string, name = "New Admin") => {
  try {
    console.log("🔧 Creating new admin account for:", email)

    const db = await getFirebaseDb()
    const { collection, doc, setDoc, getDoc } = await import("firebase/firestore")

    // Check if admin already exists
    const adminDocRef = doc(db, "logins", email.replace(/[^a-zA-Z0-9]/g, "-"))
    const adminDocSnap = await getDoc(adminDocRef)

    if (adminDocSnap.exists()) {
      console.log("ℹ️ Admin with this email already exists")
      return { success: false, error: "इस ईमेल से पहले से admin account मौजूद है" }
    }

    const loginData = {
      email: email,
      password: password,
      role: "admin",
      active: true,
      createdAt: new Date().toISOString(),
      name: name,
      createdBy: "signup",
    }

    await setDoc(adminDocRef, loginData)
    console.log("✅ New admin account created successfully")

    return { success: true, message: "नया admin account सफलतापूर्वक बनाया गया" }
  } catch (error: any) {
    console.error("❌ Error creating admin account:", error)
    return { success: false, error: error.message }
  }
}

// Create a test admin login in Firestore
export const createTestAdminLogin = async () => {
  try {
    console.log("🔧 Creating test admin login...")

    const db = await getFirebaseDb()
    const { collection, doc, setDoc, getDoc } = await import("firebase/firestore")

    // Check if admin already exists
    const adminDocRef = doc(db, "logins", "admin-user")
    const adminDocSnap = await getDoc(adminDocRef)

    if (adminDocSnap.exists()) {
      console.log("ℹ️ Admin login already exists")
      return { success: true, message: "Admin login पहले से मौजूद है" }
    }

    const loginData = {
      email: DEV_CONFIG.DEFAULT_ADMIN.email,
      password: DEV_CONFIG.DEFAULT_ADMIN.password,
      role: "admin",
      active: true,
      createdAt: new Date().toISOString(),
      name: "Default Admin User",
    }

    await setDoc(adminDocRef, loginData)
    console.log("✅ Test admin login created successfully")

    return { success: true, message: "Admin login सफलतापूर्वक बनाई गई" }
  } catch (error: any) {
    console.error("❌ Error creating test admin login:", error)
    return { success: false, error: error.message }
  }
}
