import type React from "react"
import type { Metadata } from "next"
import { Inter, Poppins } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/contexts/AuthContext"

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter',
})

const poppins = Poppins({
  weight: ['400', '500', '600', '700'],
  subsets: ["latin"],
  variable: '--font-poppins',
})

export const metadata: Metadata = {
  title: "News Dikhao - भारत की सबसे तेज़ न्यूज़ वेबसाइट",
  description:
    "News Dikhao पर पढ़ें देश-विदेश की ताजा खबरें, राजनीति, खेल, मनोरंजन, व्यापार की लेटेस्ट न्यूज़। हिंदी में सबसे तेज़ और भरोसेमंद समाचार।",
  keywords: "hindi news, भारत समाचार, ताजा खबरें, राजनीति, खेल, मनोरंजन, बॉलीवुड, व्यापार",
  authors: [{ name: "News Dikhao Team" }],
  openGraph: {
    title: "News Dikhao - भारत की सबसे तेज़ न्यूज़ वेबसाइट",
    description: "देश-विदेश की ताजा खबरें, राजनीति, खेल, मनोरंजन की लेटेस्ट न्यूज़",
    type: "website",
    locale: "hi_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "News Dikhao - भारत की सबसे तेज़ न्यूज़ वेबसाइट",
    description: "देश-विदेश की ताजा खबरें, राजनीति, खेल, मनोरंजन की लेटेस्ट न्यूज़",
  },
  robots: {
    index: true,
    follow: true,
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="hi">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;500;600;700&family=Hind:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${inter.variable} ${poppins.variable} font-sans`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
