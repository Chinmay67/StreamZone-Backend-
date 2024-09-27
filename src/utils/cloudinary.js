import {v2 as cloudinary} from "cloudinary"
// import { log } from "console";
// import fs from "fs"
// import {mime} from 'mime-types'
// import {B2} from 'backblaze-b2'
// import B2 from 'backblaze-b2';
import fs from 'fs';
import path from 'path';
import mime from 'mime-types'; 


          
cloudinary.config({ 
  cloud_name:process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

const uploadOnCloudinary=async(localFilePath)=>{
    try {
        if(!localFilePath) return null

        const response =await cloudinary.uploader.upload(localFilePath,{
            resource_type:"auto"
        })
        console.log("file uploaded on cloudinary successfully",response.url);
        fs.unlinkSync(localFilePath)
        
        return response.url
    } catch (error) {
        console.log(error)
        fs.unlinkSync(localFilePath)
        return null
    }
}
const uploadVideoOnCloudinary=async(localFilePath)=>{
    try {
        if(!localFilePath) return null

        const response =await cloudinary.uploader.upload(localFilePath,{
            resource_type:"auto"
        })
        console.log("video uploaded on cloudinary successfully",response);
        fs.unlinkSync(localFilePath)
        
        return response
    } catch (error) {
        console.log(error)
        fs.unlinkSync(localFilePath)
        return null
    }
}
// const b2 = new B2({
//     applicationKeyId: process.env.BACKBLAZE_KEY_ID,
//     applicationKey: process.env.BACKBLAZE_APPLICATION_KEY,
//   });
  
//   const uploadVideoToBackblaze = async (localFilePath) => {
//     try {
//       if (!localFilePath) return null;
  
//       // Ensure the file is a video by checking its MIME type
//       const mimeType = mime.lookup(localFilePath);
//       if (!mimeType || !mimeType.startsWith('video/')) {
//         console.error("The provided file is not a video.");
//         return null;
//       }
  
//       // Authorize with Backblaze B2
//       console.log("Key ID:", process.env.BACKBLAZE_KEY_ID);
//     console.log("Application Key:", process.env.BACKBLAZE_APPLICATION_KEY );
//     console.log("Bucket ID:", process.env.BACKBLAZE_BUCKET_ID );
//       await b2.authorize();
  
//       // Get the upload URL for the bucket
//       const { data: uploadData } = await b2.getUploadUrl({
//         bucketId: process.env.BACKBLAZE_BUCKET_ID, // Replace with your bucket ID from .env
//       });
      

//       // Read the local file to be uploaded
//       const file = fs.readFileSync(localFilePath);
//       const fileName = path.basename(localFilePath); // Extract file name from path
  
//       // Upload the file to Backblaze B2
//       const response = await b2.uploadFile({
//         uploadUrl: uploadData.uploadUrl,
//         uploadAuthToken: uploadData.authorizationToken,
//         fileName: fileName,
//         data: file,
//         mime: mimeType, // Provide the MIME type of the video
//       });
  
//       console.log("Video uploaded to Backblaze B2 successfully", response.data);
  
//       // Delete the local file after successful upload
//       fs.unlinkSync(localFilePath);
  
//       return response.data; // Return the entire response object from the API
  
//     } catch (error) {
//       console.error("Error uploading to Backblaze B2:", error);
//       if (fs.existsSync(localFilePath)) fs.unlinkSync(localFilePath); // Ensure file is deleted if there's an error
//       return null;
//     }
//   };
  
  
export {uploadOnCloudinary,uploadVideoOnCloudinary}



// cloudinary.uploader.upload("https://upload.wikimedia.org/wikipedia/commons/a/ae/Olympic_flag.jpg",
//   { public_id: "olympic_flag" }, 
//   function(error, result) {console.log(result); });