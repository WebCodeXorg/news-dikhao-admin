"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  FileText,
  Plus,
  Settings,
  LogOut,
  Menu,
  X,
  Moon,
  Sun,
  Tag,
  TrendingUp,
  ImageIcon,
  Video,
  Users,
  Loader2,
  Phone,
} from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

interface AdminLayoutProps {
  children: React.ReactNode
  title?: string
}

const sidebarItems = [
  { icon: LayoutDashboard, label: "डैशबोर्ड", href: "/admin/dashboard" },
  { icon: Plus, label: "नया पोस्ट", href: "/admin/posts/new" },
  { icon: FileText, label: "समाचार प्रबंधन", href: "/admin/posts" },
  { icon: Tag, label: "श्रेणी प्रबंधन", href: "/admin/categories" },
  { icon: Phone, label: "संपर्क प्रबंधन", href: "/admin/contacts" },
  { icon: Users, label: "यूजर रोल्स", href: "/admin/user-roles" },
]

export default function AdminLayout({ children, title = "Admin Panel" }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(true)
  const [mounted, setMounted] = useState(false)
  const { user, loading, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && !loading && !user) {
      router.push("/admin")
    }
  }, [mounted, loading, user, router])

  const handleLogout = async () => {
    await logout()
    router.push("/admin")
  }

  if (!mounted || loading || !user) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-white mx-auto mb-4" />
          <div className="text-white font-hindi mb-2">लोड हो रहा है...</div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`min-h-screen ${darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"} transition-colors duration-300`}
    >
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} border-r`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold font-hindi">News Dikhao Admin</h2>
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <nav className="p-4 space-y-2">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <a
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors duration-200 font-hindi ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : darkMode
                      ? "hover:bg-gray-700 text-gray-300 hover:text-white"
                      : "hover:bg-gray-100 text-gray-700 hover:text-gray-900"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </a>
            )
          })}
        </nav>

        <div className="absolute bottom-4 left-4 right-4 space-y-2">
          <div className="text-xs text-gray-400 font-hindi mb-2">{user.displayName || user.email}</div>
          <Button variant="ghost" className="w-full justify-start font-hindi" onClick={handleLogout}>
            <LogOut className="w-5 h-5 mr-3" />
            लॉगआउट
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Header */}
        <header
          className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} border-b sticky top-0 z-30`}
        >
          <div className="flex items-center justify-between px-4 py-4">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
                <Menu className="w-5 h-5" />
              </Button>
              <h1 className="text-2xl font-bold font-hindi">{title}</h1>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" onClick={() => setDarkMode(!darkMode)}>
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}
