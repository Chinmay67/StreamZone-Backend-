import admin from "../config/firebase_config.js";
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';



const bucket = admin.storage().bucket();
const getContentType = (fileName) => {
    const ext = path.extname(fileName).toLowerCase();
    switch (ext) {
      case '.mp4':
        return 'video/mp4';
      case '.mov':
        return 'video/quicktime';
      case '.avi':
        return 'video/x-msvideo';
      case '.mkv':
        return 'video/x-matroska';
      case '.webm':
        return 'video/webm';
      // Add more video formats as needed
      default:
        throw new Error(`Unsupported video format: ${ext}`);
    }
  };
// Example function to upload a file
const uploadVideoToFirebase = (localFilePath, mimeType, originalFileName) => {
    return new Promise((resolve, reject) => {
      try {
        const firebaseFilePath = `videos/${uuidv4()}_${originalFileName}`;  // Define unique path in Firebase
        const contentType = getContentType(originalFileName);  // Get content type based on file extension
  
        const file = bucket.file(firebaseFilePath);
        const blobStream = file.createWriteStream({
          resumable: true,
          contentType: contentType,
          public:true
        });
  
        blobStream.on('error', (err) => {
          console.error('Error uploading video:', err);
          reject(new Error('Error during video upload'));
        });
  
        blobStream.on('finish', async () => {
          try {
            // Get file metadata after upload completes
            const [metadata] = await file.getMetadata();
  
            // Construct the public URL
            const publicUrl = `https://storage.googleapis.com/${metadata.bucket}/${metadata.name}`;
            metadata.publicUrl = publicUrl;
  
            // Optionally, delete the local file after upload
            fs.unlink(localFilePath, (err) => {
              if (err) {
                console.error('Error deleting local file:', err);
              } else {
                console.log('Local file deleted after upload.');
              }
            });
  
            // Resolve the promise with metadata
            resolve(metadata);  // This will return metadata after upload finishes
          } catch (error) {
            console.error('Error retrieving metadata:', error);
            reject(new Error('Error retrieving metadata after upload'));
          }
        });
  
        // Start the upload by piping the local file to Firebase
        fs.createReadStream(localFilePath).pipe(blobStream);
  
      } catch (error) {
        console.error('Error in upload function:', error);
        reject(new Error('Failed to upload the video'));
      }
    });
}
  
  export default uploadVideoToFirebase;
