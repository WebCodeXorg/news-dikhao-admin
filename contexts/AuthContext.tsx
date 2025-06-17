"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import {
  type User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
} from "firebase/auth"
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"

interface AuthContextType {
  user: User | null
  loading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, name: string) => Promise<void>
  logout: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  clearError: () => void
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("Auth state changed:", user?.email)

      if (user) {
        try {
          // Check if user has admin role in Firestore
          const userDoc = await getDoc(doc(db, "admins", user.uid))

          if (userDoc.exists()) {
            const userData = userDoc.data()
            console.log("Admin user found:", userData)

            // Update last login
            await setDoc(
              doc(db, "admins", user.uid),
              {
                ...userData,
                lastLogin: serverTimestamp(),
              },
              { merge: true },
            )

            setUser(user)
            setIsAdmin(true)
          } else {
            console.log("User not found in admins collection")
            // User exists in Firebase Auth but not in admins collection
            await signOut(auth)
            setUser(null)
            setIsAdmin(false)
            setError("आपके पास admin access नहीं है। कृपया admin से संपर्क करें।")
          }
        } catch (error: any) {
          console.error("Error checking admin status:", error)
          // If Firestore check fails, still allow login but mark as non-admin
          setUser(user)
          setIsAdmin(false)
          setError("Admin status जांचने में समस्या हुई। कृपया दोबारा कोशिश करें।")
        }
      } else {
        setUser(null)
        setIsAdmin(false)
      }
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const login = async (email: string, password: string) => {
    try {
      setError(null)
      setLoading(true)

      console.log("Attempting login for:", email)

      const result = await signInWithEmailAndPassword(auth, email, password)
      console.log("Firebase Auth successful:", result.user.uid)

      // Check if user is admin
      const userDoc = await getDoc(doc(db, "admins", result.user.uid))

      if (!userDoc.exists()) {
        console.log("User not in admins collection, signing out")
        await signOut(auth)
        throw new Error("आपके पास admin access नहीं है")
      }

      console.log("Admin verification successful")
    } catch (error: any) {
      console.error("Login error:", error)

      // Handle specific Firebase Auth errors
      let errorMessage = "लॉगिन में समस्या हुई"

      switch (error.code) {
        case "auth/user-not-found":
          errorMessage = "यह ईमेल रजिस्टर नहीं है"
          break
        case "auth/wrong-password":
        case "auth/invalid-credential":
          errorMessage = "गलत ईमेल या पासवर्ड"
          break
        case "auth/invalid-email":
          errorMessage = "गलत ईमेल फॉर्मेट"
          break
        case "auth/too-many-requests":
          errorMessage = "बहुत सारी गलत कोशिशें। कुछ देर बाद कोशिश करें"
          break
        case "auth/network-request-failed":
          errorMessage = "इंटरनेट कनेक्शन की समस्या"
          break
        default:
          errorMessage = error.message || "लॉगिन में समस्या हुई"
      }

      setError(errorMessage)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signup = async (email: string, password: string, name: string) => {
    try {
      setError(null)
      setLoading(true)

      console.log("Creating new admin user:", email)

      // Create user in Firebase Auth
      const result = await createUserWithEmailAndPassword(auth, email, password)

      // Update user profile with name
      await updateProfile(result.user, {
        displayName: name,
      })

      // Add user to admins collection in Firestore
      await setDoc(doc(db, "admins", result.user.uid), {
        email: email,
        name: name,
        role: "admin",
        permissions: ["all"],
        createdAt: serverTimestamp(),
        active: true,
        lastLogin: null,
      })

      console.log("Admin user created successfully")
    } catch (error: any) {
      console.error("Signup error:", error)

      let errorMessage = "अकाउंट बनाने में समस्या हुई"

      switch (error.code) {
        case "auth/email-already-in-use":
          errorMessage = "यह ईमेल पहले से रजिस्टर है"
          break
        case "auth/weak-password":
          errorMessage = "पासवर्ड कम से कम 6 अक्षर का होना चाहिए"
          break
        case "auth/invalid-email":
          errorMessage = "गलत ईमेल फॉर्मेट"
          break
        case "auth/network-request-failed":
          errorMessage = "इंटरनेट कनेक्शन की समस्या"
          break
        default:
          errorMessage = error.message || "अकाउंट बनाने में समस्या हुई"
      }

      setError(errorMessage)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
      setIsAdmin(false)
      console.log("User logged out successfully")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email)
      console.log("Password reset email sent")
    } catch (error: any) {
      console.error("Password reset error:", error)
      throw error
    }
  }

  const clearError = () => setError(null)

  const value = {
    user,
    loading,
    error,
    login,
    signup,
    logout,
    resetPassword,
    clearError,
    isAdmin,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
