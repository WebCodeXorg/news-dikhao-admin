"use client"

import { useState, useEffect } from 'react'
import { getFirebaseDb } from '@/lib/firebase-config'
import { collection, getDocs } from 'firebase/firestore'

export default function DebugRaw() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchAllPosts() {
      try {
        setLoading(true)
        console.log('Fetching ALL posts without any filters...')
        
        const db = await getFirebaseDb()
        const querySnapshot = await getDocs(collection(db, 'posts'))
        
        const allPosts = []
        querySnapshot.forEach((doc) => {
          allPosts.push({
            id: doc.id,
            ...doc.data()
          })
        })
        
        console.log('Raw posts from Firestore:', allPosts)
        setPosts(allPosts)
      } catch (err) {
        console.error('Error fetching posts:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    
    fetchAllPosts()
  }, [])

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Raw Firestore Data Debug</h1>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>Error: {error}</p>
      ) : (
        <div>
          <h2>Total Posts: {posts.length}</h2>
          <pre style={{ background: '#f0f0f0', padding: '10px', overflow: 'auto', maxHeight: '500px' }}>
            {JSON.stringify(posts, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
} 