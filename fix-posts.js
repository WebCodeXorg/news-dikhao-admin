// Script to fix posts missing required fields
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, updateDoc } = require('firebase/firestore');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAnwFsBaJPUblGxLU85fpoHDtvYmDbEc9Y",
  authDomain: "news-dikhao.firebaseapp.com",
  projectId: "news-dikhao",
  storageBucket: "news-dikhao.firebasestorage.app",
  messagingSenderId: "1038910067745",
  appId: "1:1038910067745:web:89594e8046a42986ff7f60",
  measurementId: "G-PZM8H7QQTB",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function fixPosts() {
  console.log('Starting to fix posts...');
  
  try {
    // Get all posts
    const postsSnapshot = await getDocs(collection(db, 'posts'));
    
    if (postsSnapshot.empty) {
      console.log('No posts found in Firestore.');
      return;
    }
    
    console.log(`Found ${postsSnapshot.size} posts in Firestore.`);
    
    let fixedCount = 0;
    
    // Check and fix each post
    for (const docSnapshot of postsSnapshot.docs) {
      const post = docSnapshot.data();
      const postId = docSnapshot.id;
      const updates = {};
      let needsUpdate = false;
      
      // Check for missing language field
      if (!post.language) {
        updates.language = 'hindi'; // Default to hindi
        needsUpdate = true;
        console.log(`Post ${postId} is missing language field`);
      }
      
      // Check for missing excerpt field
      if (!post.excerpt && post.description) {
        updates.excerpt = post.description;
        needsUpdate = true;
        console.log(`Post ${postId} is missing excerpt field`);
      }
      
      // Check for missing views field
      if (post.views === undefined) {
        updates.views = 0;
        needsUpdate = true;
        console.log(`Post ${postId} is missing views field`);
      }
      
      // Update post if needed
      if (needsUpdate) {
        try {
          await updateDoc(doc(db, 'posts', postId), updates);
          console.log(`Fixed post ${postId}`);
          fixedCount++;
        } catch (updateError) {
          console.error(`Error updating post ${postId}:`, updateError);
        }
      }
    }
    
    console.log(`Fixed ${fixedCount} posts.`);
    
  } catch (error) {
    console.error('Error fixing posts:', error);
  }
}

// Run the fix
fixPosts(); 