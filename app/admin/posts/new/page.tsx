"use client"

import AdminLayout from "@/components/admin/AdminLayout"
import PostForm from "@/components/admin/PostForm"

export default function NewPostPage() {
  return (
    <AdminLayout title="नया पोस्ट बनाएं">
      <PostForm />
    </AdminLayout>
  )
}
