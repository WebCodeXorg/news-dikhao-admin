"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Edit, Trash2, Plus, Users, Shield, AlertCircle, Info, User, UserPlus, Loader2, CheckCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import AdminLayout from "@/components/admin/AdminLayout"
import { getFirebaseAuth, getFirebaseDb } from "@/lib/firebase-config"
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth"
import { collection, getDocs, doc, setDoc, deleteDoc, updateDoc, query, where, getDoc } from "firebase/firestore"

interface Permission {
  id: string
  name: string
  description: string
}

interface Role {
  id: string
  name: string
  description: string
  permissions: string[]
  userCount: number
  isActive: boolean
  createdAt: string
}

interface User {
  id: string
  name: string
  email: string
  role: string
  isActive: boolean
  lastLogin: string
  createdAt: string
}

interface AdminUser {
  uid: string;
  displayName: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: any;
  lastLogin: any;
}

const permissions: Permission[] = [
  { id: "create_posts", name: "पोस्ट बनाना", description: "नए समाचार लेख बना सकते हैं" },
  { id: "edit_posts", name: "पोस्ट संपादन", description: "मौजूदा पोस्ट्स को संपादित कर सकते हैं" },
  { id: "delete_posts", name: "पोस्ट डिलीट", description: "पोस्ट्स को डिलीट कर सकते हैं" },
  { id: "publish_posts", name: "पोस्ट प्रकाशन", description: "पोस्ट्स को प्रकाशित कर सकते हैं" },
  { id: "manage_categories", name: "श्रेणी प्रबंधन", description: "श्रेणियों को जोड़/संपादित/डिलीट कर सकते हैं" },
  { id: "manage_breaking_news", name: "ब्रेकिंग न्यूज़", description: "ब्रेकिंग न्यूज़ प्रबंधित कर सकते हैं" },
  { id: "moderate_comments", name: "कमेंट मॉडरेशन", description: "कमेंट्स को अप्रूव/रिजेक्ट कर सकते हैं" },
  { id: "manage_users", name: "यूजर प्रबंधन", description: "यूजर्स और रोल्स को प्रबंधित कर सकते हैं" },
  { id: "view_analytics", name: "एनालिटिक्स", description: "साइट एनालिटिक्स देख सकते हैं" },
]

export default function UserRolesPage() {
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // New admin form
  const [newAdmin, setNewAdmin] = useState({
    displayName: "",
    email: "",
    password: "",
    role: "Editor"
  });
  
  // Form loading state
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Fetch all admin users
  useEffect(() => {
    const fetchAdminUsers = async () => {
      try {
        setLoading(true);
        console.log("Fetching admin users...");
        
        const db = await getFirebaseDb();
        const adminsSnapshot = await getDocs(collection(db, "admins"));
        
        const admins: AdminUser[] = [];
        adminsSnapshot.forEach((doc) => {
          const data = doc.data();
          admins.push({
            uid: doc.id,
            displayName: data.displayName || "",
            email: data.email || "",
            role: data.role || "Editor",
            isActive: data.isActive !== false, // Default to true if not specified
            createdAt: data.createdAt || null,
            lastLogin: data.lastLogin || null
          });
        });
        
        console.log(`Found ${admins.length} admin users`);
        setAdminUsers(admins);
      } catch (err: any) {
        console.error("Error fetching admin users:", err);
        setError(err.message || "Admin users loading failed");
      } finally {
        setLoading(false);
      }
    };
    
    fetchAdminUsers();
  }, []);
  
  // Create new admin user
  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newAdmin.displayName || !newAdmin.email || !newAdmin.password) {
      setError("सभी आवश्यक फ़ील्ड भरें");
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      setSuccess(null);
      console.log("Creating new admin account...");
      
      // 1. Create Firebase Auth account
      const auth = await getFirebaseAuth();
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        newAdmin.email, 
        newAdmin.password
      );
      
      const user = userCredential.user;
      console.log("Firebase Auth account created:", user.uid);
      
      // 2. Update user profile with display name
      await updateProfile(user, {
        displayName: newAdmin.displayName
      });
      
      // 3. Save to Firestore admins collection
      const db = await getFirebaseDb();
      await setDoc(doc(db, "admins", user.uid), {
        uid: user.uid,
        displayName: newAdmin.displayName,
        email: newAdmin.email,
        role: newAdmin.role,
        isActive: true,
        createdAt: new Date(),
        lastLogin: null
      });
      
      console.log("Admin saved to Firestore");
      
      // 4. Add to the local state
      const newAdminUser: AdminUser = {
        uid: user.uid,
        displayName: newAdmin.displayName,
        email: newAdmin.email,
        role: newAdmin.role,
      isActive: true,
        createdAt: new Date(),
        lastLogin: null
      };
      
      setAdminUsers([...adminUsers, newAdminUser]);
      
      // 5. Clear the form
      setNewAdmin({
        displayName: "",
        email: "",
        password: "",
        role: "Editor"
      });
      
      setSuccess("एडमिन अकाउंट सफलतापूर्वक बनाया गया!");
      
    } catch (err: any) {
      console.error("Error creating admin:", err);
      let errorMessage = "Admin account creation failed";
      
      // Handle common Firebase Auth errors
      if (err.code === 'auth/email-already-in-use') {
        errorMessage = "यह ईमेल पहले से उपयोग में है";
      } else if (err.code === 'auth/weak-password') {
        errorMessage = "पासवर्ड कमजोर है (कम से कम 6 अक्षर)";
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = "ईमेल फॉर्मेट अमान्य है";
      }
      
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Toggle admin account status
  const toggleAdminStatus = async (uid: string, isCurrentlyActive: boolean) => {
    try {
      setError(null);
      const db = await getFirebaseDb();
      
      // Update in Firestore
      await updateDoc(doc(db, "admins", uid), {
        isActive: !isCurrentlyActive
      });
      
      // Update local state
      setAdminUsers(adminUsers.map(admin => 
        admin.uid === uid 
          ? {...admin, isActive: !isCurrentlyActive} 
          : admin
      ));
      
      setSuccess(`एडमिन स्थिति अपडेट की गई: ${!isCurrentlyActive ? 'सक्रिय' : 'निष्क्रिय'}`);
    } catch (err: any) {
      console.error("Error toggling admin status:", err);
      setError("स्थिति अपडेट विफल");
    }
  };
  
  // Delete admin account
  const deleteAdmin = async (uid: string) => {
    if (!confirm("क्या आप वाकई इस एडमिन अकाउंट को मिटाना चाहते हैं?")) {
      return;
    }
    
    try {
      setError(null);
      const db = await getFirebaseDb();
      
      // Delete from Firestore
      await deleteDoc(doc(db, "admins", uid));
      
      // Update local state
      setAdminUsers(adminUsers.filter(admin => admin.uid !== uid));
      
      setSuccess("एडमिन अकाउंट सफलतापूर्वक मिटा दिया गया");
    } catch (err: any) {
      console.error("Error deleting admin:", err);
      setError("एडमिन अकाउंट डिलीट करने में विफल");
    }
  };
  
  const formatDate = (timestamp: any) => {
    if (!timestamp) return "कभी नहीं";
    
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleString('hi-IN', {
        day: 'numeric',
        month: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (err) {
      return "अमान्य तिथि";
    }
  };

  return (
    <AdminLayout title="एडमिन अकाउंट प्रबंधन">
      <div className="space-y-8">
        {/* Tips Alert */}
        <Alert className="border-blue-500 bg-blue-500/10">
          <Info className="h-4 w-4 text-blue-500" />
          <AlertDescription className="text-blue-500 text-sm">
            <strong>एडमिन प्रबंधन युक्तियां:</strong>
            <br />
            1. कभी भी अपने मुख्य एडमिन अकाउंट को निष्क्रिय न करें
            <br />
            2. सभी एडमिन्स को उनकी भूमिका के अनुसार सही अनुमतियां दें
            <br />
            3. महत्वपूर्ण बदलाव के लिए सुपर एडमिन से संपर्क करें
          </AlertDescription>
        </Alert>

        {/* Error Alert */}
        {error && (
          <Alert className="border-red-500 bg-red-500/10">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <AlertDescription className="text-red-500">{error}</AlertDescription>
          </Alert>
        )}
        
        {/* Success Alert */}
        {success && (
          <Alert className="border-green-500 bg-green-500/10">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <AlertDescription className="text-green-500">{success}</AlertDescription>
          </Alert>
        )}
        
        {/* Add New Admin */}
            <Card className="border-gray-700 bg-gray-800">
              <CardHeader>
                <CardTitle className="text-white font-hindi flex items-center">
              <UserPlus className="w-5 h-5 mr-2" />
              नया एडमिन अकाउंट बनाएं
                </CardTitle>
              </CardHeader>
              <CardContent>
            <form onSubmit={handleCreateAdmin} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                  <Label htmlFor="displayName" className="text-gray-300 font-hindi">
                        नाम *
                      </Label>
                      <Input
                    id="displayName"
                    value={newAdmin.displayName}
                    onChange={(e) => setNewAdmin({ ...newAdmin, displayName: e.target.value })}
                    placeholder="पूरा नाम दर्ज करें"
                        className="bg-gray-700 border-gray-600 text-white font-hindi"
                        required
                      />
                    </div>
                    <div>
                  <Label htmlFor="email" className="text-gray-300 font-hindi">
                        ईमेल *
                      </Label>
                      <Input
                    id="email"
                        type="email"
                    value={newAdmin.email}
                    onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                    placeholder="admin@newsdikhao.com"
                        className="bg-gray-700 border-gray-600 text-white font-hindi"
                        required
                      />
                    </div>
                  </div>
              
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                  <Label htmlFor="password" className="text-gray-300 font-hindi">
                        पासवर्ड *
                      </Label>
                      <Input
                    id="password"
                        type="password"
                    value={newAdmin.password}
                    onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                    placeholder="सुरक्षित पासवर्ड (कम से कम 6 अक्षर)"
                        className="bg-gray-700 border-gray-600 text-white font-hindi"
                        required
                    minLength={6}
                      />
                    </div>
                <div>
                  <Label htmlFor="role" className="text-gray-300 font-hindi">
                    रोल *
                  </Label>
                  <Select 
                    value={newAdmin.role} 
                    onValueChange={(value) => setNewAdmin({ ...newAdmin, role: value })}
                  >
                    <SelectTrigger id="role" className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue placeholder="रोल चुनें" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Super Admin" className="font-hindi">Super Admin</SelectItem>
                      <SelectItem value="Admin" className="font-hindi">Admin</SelectItem>
                      <SelectItem value="Editor" className="font-hindi">Editor</SelectItem>
                      <SelectItem value="Moderator" className="font-hindi">Moderator</SelectItem>
                    </SelectContent>
                  </Select>
                    </div>
                  </div>
              
              <Button 
                type="submit" 
                className="bg-green-600 hover:bg-green-700 font-hindi" 
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    बना रहे हैं...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    एडमिन अकाउंट बनाएं
                  </>
                )}
                  </Button>
                </form>
              </CardContent>
            </Card>

        {/* Admin Users List */}
            <Card className="border-gray-700 bg-gray-800">
              <CardHeader>
                <CardTitle className="text-white font-hindi flex items-center">
                  <Users className="w-5 h-5 mr-2" />
              सभी एडमिन ({adminUsers.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-4" />
                <p className="text-gray-400 font-hindi">एडमिन यूजर्स लोड हो रहे हैं...</p>
              </div>
            ) : adminUsers.length === 0 ? (
              <div className="text-center py-12">
                <User className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-400 font-hindi">कोई एडमिन नहीं मिला</h3>
                <p className="text-sm text-gray-500 font-hindi mt-2">ऊपर से एक नया एडमिन अकाउंट बनाएं</p>
              </div>
            ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left py-3 px-4 text-gray-300 font-hindi">नाम</th>
                        <th className="text-left py-3 px-4 text-gray-300 font-hindi">ईमेल</th>
                        <th className="text-left py-3 px-4 text-gray-300 font-hindi">रोल</th>
                      <th className="text-left py-3 px-4 text-gray-300 font-hindi">बनाया गया</th>
                        <th className="text-left py-3 px-4 text-gray-300 font-hindi">अंतिम लॉगिन</th>
                        <th className="text-left py-3 px-4 text-gray-300 font-hindi">स्थिति</th>
                        <th className="text-left py-3 px-4 text-gray-300 font-hindi">एक्शन</th>
                      </tr>
                    </thead>
                    <tbody>
                    {adminUsers.map((admin) => (
                      <tr key={admin.uid} className="border-b border-gray-700 hover:bg-gray-700">
                        <td className="py-3 px-4">
                          <div className="font-medium text-white font-hindi">{admin.displayName}</div>
                        </td>
                          <td className="py-3 px-4">
                          <span className="text-gray-300">{admin.email}</span>
                          </td>
                          <td className="py-3 px-4">
                          <Badge className={
                            admin.role === "Super Admin" ? "bg-red-600 text-white" :
                            admin.role === "Admin" ? "bg-blue-600 text-white" :
                            admin.role === "Editor" ? "bg-green-600 text-white" :
                            "bg-purple-600 text-white"
                          }>
                            {admin.role}
                          </Badge>
                          </td>
                          <td className="py-3 px-4">
                          <span className="text-gray-400 text-sm font-hindi">{formatDate(admin.createdAt)}</span>
                          </td>
                          <td className="py-3 px-4">
                          <span className="text-gray-400 text-sm font-hindi">{formatDate(admin.lastLogin)}</span>
                          </td>
                          <td className="py-3 px-4">
                            <button
                            onClick={() => toggleAdminStatus(admin.uid, admin.isActive)}
                              className={`px-3 py-1 rounded-full text-sm font-hindi ${
                              admin.isActive ? "bg-green-600 text-white" : "bg-gray-600 text-gray-300"
                              }`}
                            >
                            {admin.isActive ? "सक्रिय" : "निष्क्रिय"}
                            </button>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="ghost"
                                size="icon"
                              onClick={() => deleteAdmin(admin.uid)}
                                className="text-red-400 hover:bg-red-600 hover:text-white"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
            )}
              </CardContent>
            </Card>
      </div>
    </AdminLayout>
  )
}
