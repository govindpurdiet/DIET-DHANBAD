import cloudinary from "../configuration/cloudinary.js";

async function Upload(dataURI){
    const uploadResult = await cloudinary.uploader
      .upload(
        dataURI, { folder: "Gallery" }
      )
      .catch((error) => {
        console.log(error);
      });
    return uploadResult;
}

export {Upload};