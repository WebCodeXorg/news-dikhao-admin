"use client"

import AdminLayout from "@/components/admin/AdminLayout"
import PostForm from "@/components/admin/PostForm"

export default function EditPostPage({ params }: { params: { id: string } }) {
  return (
    <AdminLayout title="पोस्ट संपादित करें">
      <PostForm postId={params.id} />
    </AdminLayout>
  )
}
