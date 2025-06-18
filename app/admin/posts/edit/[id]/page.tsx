"use client"

import EditPostForm from "@/components/admin/EditPostForm"
import AdminLayout from "@/components/admin/AdminLayout"

export default function EditPostPage({ params }: { params: { id: string } }) {
  return (
    <AdminLayout title="पोस्ट संपादित करें">
      <EditPostForm postId={params.id} />
    </AdminLayout>
  )
}
