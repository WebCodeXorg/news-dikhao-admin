"use client"

import type React from "react"

import { AuthProvider } from "@/contexts/AuthContext"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>
}
