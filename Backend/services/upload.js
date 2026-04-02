import cloudinary from "../configuration/cloudinary.js";
import streamifier from "streamifier";


async function Upload(folder, rt, file) {
  return new Promise((resolve, reject) => {
    const cloudStream = cloudinary.uploader.upload_stream(
      {
        resource_type: rt,   // "image", "raw", or "video"
        folder: folder
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result.secure_url);
        }
      }
    );
    streamifier.createReadStream(file).pipe(cloudStream);
  });
}


export {Upload};