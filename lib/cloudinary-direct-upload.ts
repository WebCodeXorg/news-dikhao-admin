"use client"

/**
 * This file contains a direct implementation for Cloudinary upload
 * using their recommended approach for unsigned uploads from the browser
 */

// Cloudinary configuration
const CLOUDINARY_CLOUD_NAME = 'divmafjmq'; // Using the actual cloud name from previous implementation
const CLOUDINARY_UPLOAD_PRESET = 'news_dikhao_web'; // Specified unsigned upload preset
const CLOUDINARY_FOLDER = 'newsdikhao_posts/'; // Target folder for uploads
const ALLOWED_FORMATS = ['jpg', 'jpeg', 'png', 'webp']; // Allowed image formats

/**
 * Upload a file directly to Cloudinary using fetch API
 */
export async function uploadToCloudinaryDirect(file: File): Promise<string> {
  try {
    console.log('Starting direct Cloudinary upload');
    
    // Validate file format
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!fileExtension || !ALLOWED_FORMATS.includes(fileExtension)) {
      throw new Error(`Unsupported file format. Allowed formats: ${ALLOWED_FORMATS.join(', ')}`);
    }
    
    // Create form data
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', CLOUDINARY_FOLDER);
    
    // Make direct API request
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );
    
    // Check for errors
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Cloudinary upload failed:', errorData);
      throw new Error(`Upload failed: ${errorData.error?.message || response.statusText}`);
    }
    
    // Parse successful response
    const data = await response.json();
    console.log('Upload successful:', data);
    
    // Return the secure URL
    return data.secure_url;
  } catch (error) {
    console.error('Error in direct upload:', error);
    throw error;
  }
}

/**
 * Try to upload with multiple presets to find one that works
 */
export async function findWorkingUploadPreset(
  file: File, 
  onProgress?: (progress: number) => void
): Promise<{preset: string, url: string}> {
  // List of presets to try in order
  const presetsToTry = [
    'ml_default',           // Default Cloudinary preset
    'news_dikhao_web',      // Our specified preset
    'unsigned_upload',      // Common unsigned preset name
    'ml_unsigned',          // Another common preset
    '',                     // Try with no preset (might work in some configs)
  ];
  
  // Try each preset in order
  for (const preset of presetsToTry) {
    try {
      console.log(`Testing upload preset: ${preset || '(empty)'}`);
      
      // Use XMLHttpRequest to track progress
      const result = await new Promise<{preset: string, url: string}>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        const formData = new FormData();
        
        formData.append('file', file);
        if (preset) {
          formData.append('upload_preset', preset);
        }
        formData.append('folder', CLOUDINARY_FOLDER);
        
        xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, true);
        
        // Track progress if callback provided
        if (onProgress) {
          xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
              const progress = Math.round((event.loaded / event.total) * 100);
              onProgress(progress);
            }
          };
        }
        
        xhr.onload = function() {
          if (xhr.status === 200) {
            const response = JSON.parse(xhr.responseText);
            resolve({ preset: preset || '(empty)', url: response.secure_url });
          } else {
            try {
              const errorData = JSON.parse(xhr.responseText);
              reject(new Error(errorData.error?.message || `Upload failed with status: ${xhr.status}`));
            } catch (e) {
              reject(new Error(`Upload failed with status: ${xhr.status}`));
            }
          }
        };
        
        xhr.onerror = () => reject(new Error('Network error during upload'));
        xhr.send(formData);
      });
      
      console.log(`Found working preset: ${result.preset}`);
      return result;
    } catch (error) {
      console.warn(`Preset ${preset || '(empty)'} failed:`, error);
    }
  }
  
  // If we've tried all presets and none worked, throw an error
  throw new Error('No working upload preset found for your Cloudinary account. You need to create an unsigned upload preset in your Cloudinary dashboard.');
} 