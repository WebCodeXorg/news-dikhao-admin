"use client"

import { useState, useEffect } from "react"
import { Facebook, Twitter, Youtube, Instagram, Mail, Phone, MapPin } from "lucide-react"
import Image from "next/image"
import { getFirebaseDb } from "@/lib/firebase-config"
import { collection, getDocs, doc, getDoc } from "firebase/firestore"
import Link from "next/link"

interface Category {
  id: string
  name: string
  slug: string
}

interface ContactData {
  email: string
  phone: string
  address: string
  facebook: string
  twitter: string
  youtube: string
  instagram: string
}

const defaultContactData: ContactData = {
  email: "contact@newsdikhao.com",
  phone: "+91 98765 43210",
  address: "नई दिल्ली, भारत",
  facebook: "#",
  twitter: "#",
  youtube: "#",
  instagram: "#"
}

export default function Footer() {
  const [categories, setCategories] = useState<Category[]>([])
  const [contactData, setContactData] = useState<ContactData>(defaultContactData)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const db = await getFirebaseDb()
        
        // Fetch categories
        const categoriesCollection = collection(db, "categories")
        const categorySnapshot = await getDocs(categoriesCollection)
        
        const categoriesData = categorySnapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name || "",
          slug: doc.data().slug || ""
        }))
        
        setCategories(categoriesData)
        
        // Fetch contact information
        const contactRef = doc(db, "settings", "contact")
        const contactSnap = await getDoc(contactRef)
        
        if (contactSnap.exists()) {
          setContactData(contactSnap.data() as ContactData)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      }
    }
    
    fetchData()
  }, [])

  return (
    <footer className="bg-black text-white">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* About Section */}
          <div className="space-y-6">
            <Image
              src="https://res.cloudinary.com/divmafjmq/image/upload/v1750128275/newsdikhao_posts/uglrpjygru2op6xgmwba.jpg"
              alt="News Dikhao"
              width={150}
              height={150}
              className="h-20 w-auto transition-transform duration-300 hover:scale-105 rounded-lg"
            />
            <p className="text-gray-300 text-sm leading-relaxed font-hindi">
              भारत की सबसे तेज़ और भरोसेमंद न्यूज़ वेबसाइट। हम आपको देश-विदेश की ताजा खबरें, राजनीति, खेल, मनोरंजन और व्यापार की
              विश्वसनीय जानकारी प्रदान करते हैं।
            </p>
            <div className="flex space-x-3">
              {contactData.facebook && contactData.facebook !== "#" && (
                <a
                  href={contactData.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-600 p-3 rounded-full hover:bg-blue-700 transition-all duration-300 transform hover:scale-110 hover:rotate-6"
                >
                  <Facebook className="w-5 h-5" />
                </a>
              )}
              {contactData.twitter && contactData.twitter !== "#" && (
                <a
                  href={contactData.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-400 p-3 rounded-full hover:bg-blue-500 transition-all duration-300 transform hover:scale-110 hover:rotate-6"
                >
                  <Twitter className="w-5 h-5" />
                </a>
              )}
              {contactData.youtube && contactData.youtube !== "#" && (
                <a
                  href={contactData.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-red-600 p-3 rounded-full hover:bg-red-700 transition-all duration-300 transform hover:scale-110 hover:rotate-6"
                >
                  <Youtube className="w-5 h-5" />
                </a>
              )}
              {contactData.instagram && contactData.instagram !== "#" && (
                <a
                  href={contactData.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-pink-600 p-3 rounded-full hover:bg-pink-700 transition-all duration-300 transform hover:scale-110 hover:rotate-6"
                >
                  <Instagram className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-xl font-bold mb-6 font-hindi">श्रेणियां</h4>
            <ul className="space-y-3 text-sm">
              {categories.length > 0 ? (
                categories.map((category) => (
                  <li key={category.id}>
                    <Link
                      href={`/${category.slug || category.id}`}
                      className="text-gray-300 hover:text-white transition-all duration-300 font-hindi hover:underline hover:translate-x-2 inline-block"
                    >
                      → {category.name}
                    </Link>
                  </li>
                ))
              ) : (
                <li className="text-gray-400 font-hindi">श्रेणियां लोड हो रही हैं...</li>
              )}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xl font-bold mb-6 font-hindi">संपर्क करें</h4>
            <ul className="space-y-4 text-sm text-gray-300">
              <li className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-white" />
                <span className="font-hindi">{contactData.email}</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-white" />
                <span className="font-hindi">{contactData.phone}</span>
              </li>
              <li className="flex items-center space-x-3">
                <MapPin className="w-4 h-4 text-white" />
                <span className="font-hindi">{contactData.address}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-gray-800 py-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center text-sm text-gray-400">
            <p className="font-hindi">
              © 2025 News Dikhao. सभी अधिकार सुरक्षित। | डिज़ाइन और विकास: News Dikhao टीम
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
