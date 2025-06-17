"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Check, X, Eye, MessageSquare, Clock, User, Filter } from "lucide-react"
import AdminLayout from "@/components/admin/AdminLayout"

interface Comment {
  id: string
  content: string
  author: string
  email: string
  postTitle: string
  postId: string
  status: "pending" | "approved" | "rejected"
  createdAt: string
  ipAddress: string
  userAgent: string
}

export default function CommentsPage() {
  const [comments, setComments] = useState<Comment[]>([
    {
      id: "1",
      content: "बहुत अच्छी खबर है। सरकार को इस दिशा में और भी काम करना चाहिए।",
      author: "राज कुमार",
      email: "raj@example.com",
      postTitle: "भारत में नई शिक्षा नीति के तहत बड़े बदलाव",
      postId: "post1",
      status: "pending",
      createdAt: "2025-01-09T10:30:00",
      ipAddress: "192.168.1.1",
      userAgent: "Mozilla/5.0...",
    },
    {
      id: "2",
      content: "यह जानकारी बहुत उपयोगी है। धन्यवाद!",
      author: "सुनीता शर्मा",
      email: "sunita@example.com",
      postTitle: "अमेरिका के लॉस एंजिल्स में भीषण आग",
      postId: "post2",
      status: "approved",
      createdAt: "2025-01-09T09:15:00",
      ipAddress: "192.168.1.2",
      userAgent: "Mozilla/5.0...",
    },
    {
      id: "3",
      content: "यह खबर सही नहीं लग रही। कृपया सत्यापन करें।",
      author: "अमित गुप्ता",
      email: "amit@example.com",
      postTitle: "क्रिकेट वर्ल्ड कप में भारतीय टीम की जीत",
      postId: "post3",
      status: "pending",
      createdAt: "2025-01-09T08:45:00",
      ipAddress: "192.168.1.3",
      userAgent: "Mozilla/5.0...",
    },
    {
      id: "4",
      content: "अनुचित भाषा का प्रयोग...",
      author: "अज्ञात",
      email: "spam@example.com",
      postTitle: "राजनीतिक समाचार",
      postId: "post4",
      status: "rejected",
      createdAt: "2025-01-09T07:20:00",
      ipAddress: "192.168.1.4",
      userAgent: "Mozilla/5.0...",
    },
  ])

  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "approved" | "rejected">("all")
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null)

  const handleApproveComment = (id: string) => {
    setComments(comments.map((comment) => (comment.id === id ? { ...comment, status: "approved" as const } : comment)))
  }

  const handleRejectComment = (id: string) => {
    setComments(comments.map((comment) => (comment.id === id ? { ...comment, status: "rejected" as const } : comment)))
  }

  const handleBulkAction = (action: "approve" | "reject", commentIds: string[]) => {
    setComments(
      comments.map((comment) =>
        commentIds.includes(comment.id)
          ? { ...comment, status: action === "approve" ? "approved" : "rejected" }
          : comment,
      ),
    )
  }

  const filteredComments = comments.filter((comment) => filterStatus === "all" || comment.status === filterStatus)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-600 text-white"
      case "approved":
        return "bg-green-600 text-white"
      case "rejected":
        return "bg-red-600 text-white"
      default:
        return "bg-gray-600 text-white"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "पेंडिंग"
      case "approved":
        return "अप्रूव्ड"
      case "rejected":
        return "रिजेक्टेड"
      default:
        return "अज्ञात"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("hi-IN")
  }

  const pendingCount = comments.filter((c) => c.status === "pending").length
  const approvedCount = comments.filter((c) => c.status === "approved").length
  const rejectedCount = comments.filter((c) => c.status === "rejected").length

  return (
    <AdminLayout title="कमेंट मॉडरेशन">
      <div className="space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-gray-700 bg-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 font-hindi">कुल कमेंट्स</p>
                  <p className="text-2xl font-bold text-white">{comments.length}</p>
                </div>
                <MessageSquare className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-700 bg-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 font-hindi">पेंडिंग</p>
                  <p className="text-2xl font-bold text-yellow-400">{pendingCount}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-700 bg-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 font-hindi">अप्रूव्ड</p>
                  <p className="text-2xl font-bold text-green-400">{approvedCount}</p>
                </div>
                <Check className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-700 bg-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 font-hindi">रिजेक्टेड</p>
                  <p className="text-2xl font-bold text-red-400">{rejectedCount}</p>
                </div>
                <X className="w-8 h-8 text-red-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter and Actions */}
        <Card className="border-gray-700 bg-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Filter className="w-5 h-5 text-gray-400" />
                <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
                  <SelectTrigger className="w-48 bg-gray-700 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="font-hindi">
                      सभी कमेंट्स
                    </SelectItem>
                    <SelectItem value="pending" className="font-hindi">
                      पेंडिंग
                    </SelectItem>
                    <SelectItem value="approved" className="font-hindi">
                      अप्रूव्ड
                    </SelectItem>
                    <SelectItem value="rejected" className="font-hindi">
                      रिजेक्टेड
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const pendingIds = filteredComments.filter((c) => c.status === "pending").map((c) => c.id)
                    handleBulkAction("approve", pendingIds)
                  }}
                  className="border-green-600 text-green-400 hover:bg-green-600 hover:text-white font-hindi"
                >
                  सभी अप्रूव करें
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const pendingIds = filteredComments.filter((c) => c.status === "pending").map((c) => c.id)
                    handleBulkAction("reject", pendingIds)
                  }}
                  className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white font-hindi"
                >
                  सभी रिजेक्ट करें
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Comments List */}
        <Card className="border-gray-700 bg-gray-800">
          <CardHeader>
            <CardTitle className="text-white font-hindi flex items-center">
              <MessageSquare className="w-5 h-5 mr-2" />
              कमेंट्स ({filteredComments.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredComments.map((comment) => (
                <div key={comment.id} className="p-4 rounded-lg bg-gray-700 border border-gray-600">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="bg-gray-600 p-2 rounded-full">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-white font-hindi">{comment.author}</h4>
                        <p className="text-sm text-gray-400">{comment.email}</p>
                      </div>
                      <Badge className={getStatusColor(comment.status)}>{getStatusText(comment.status)}</Badge>
                    </div>

                    <div className="flex items-center space-x-2">
                      {comment.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleApproveComment(comment.id)}
                            className="bg-green-600 hover:bg-green-700 text-white font-hindi"
                          >
                            <Check className="w-4 h-4 mr-1" />
                            अप्रूव
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleRejectComment(comment.id)}
                            className="font-hindi"
                          >
                            <X className="w-4 h-4 mr-1" />
                            रिजेक्ट
                          </Button>
                        </>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedComment(comment)}
                        className="border-gray-600 text-gray-300 hover:bg-gray-600 font-hindi"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        विवरण
                      </Button>
                    </div>
                  </div>

                  <div className="mb-3">
                    <p className="text-gray-300 font-hindi leading-relaxed">{comment.content}</p>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <div className="flex items-center space-x-4">
                      <span className="font-hindi">पोस्ट: {comment.postTitle}</span>
                      <span>{formatDate(comment.createdAt)}</span>
                    </div>
                    <span>IP: {comment.ipAddress}</span>
                  </div>
                </div>
              ))}

              {filteredComments.length === 0 && (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-500 font-hindi">कोई कमेंट नहीं मिला</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Comment Detail Modal */}
        {selectedComment && (
          <Card className="border-gray-700 bg-gray-800">
            <CardHeader>
              <CardTitle className="text-white font-hindi flex items-center justify-between">
                <span>कमेंट विवरण</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedComment(null)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h5 className="font-semibold text-white font-hindi mb-2">लेखक जानकारी</h5>
                  <div className="space-y-2 text-sm">
                    <p className="text-gray-300">
                      <span className="text-gray-400">नाम:</span> {selectedComment.author}
                    </p>
                    <p className="text-gray-300">
                      <span className="text-gray-400">ईमेल:</span> {selectedComment.email}
                    </p>
                    <p className="text-gray-300">
                      <span className="text-gray-400">IP:</span> {selectedComment.ipAddress}
                    </p>
                  </div>
                </div>

                <div>
                  <h5 className="font-semibold text-white font-hindi mb-2">पोस्ट जानकारी</h5>
                  <div className="space-y-2 text-sm">
                    <p className="text-gray-300">
                      <span className="text-gray-400">शीर्षक:</span> {selectedComment.postTitle}
                    </p>
                    <p className="text-gray-300">
                      <span className="text-gray-400">समय:</span> {formatDate(selectedComment.createdAt)}
                    </p>
                    <p className="text-gray-300">
                      <span className="text-gray-400">स्थिति:</span>
                      <Badge className={`ml-2 ${getStatusColor(selectedComment.status)}`}>
                        {getStatusText(selectedComment.status)}
                      </Badge>
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h5 className="font-semibold text-white font-hindi mb-2">कमेंट सामग्री</h5>
                <div className="p-4 bg-gray-600 rounded-lg">
                  <p className="text-gray-200 font-hindi leading-relaxed">{selectedComment.content}</p>
                </div>
              </div>

              <div>
                <h5 className="font-semibold text-white font-hindi mb-2">तकनीकी जानकारी</h5>
                <div className="text-sm text-gray-400">
                  <p>
                    <span className="text-gray-300">User Agent:</span> {selectedComment.userAgent}
                  </p>
                </div>
              </div>

              {selectedComment.status === "pending" && (
                <div className="flex space-x-4 pt-4 border-t border-gray-600">
                  <Button
                    onClick={() => {
                      handleApproveComment(selectedComment.id)
                      setSelectedComment(null)
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white font-hindi"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    अप्रूव करें
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      handleRejectComment(selectedComment.id)
                      setSelectedComment(null)
                    }}
                    className="font-hindi"
                  >
                    <X className="w-4 h-4 mr-2" />
                    रिजेक्ट करें
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  )
}
