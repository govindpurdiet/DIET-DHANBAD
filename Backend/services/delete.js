import cloudinary from "../configuration/cloudinary.js";

async function Delete(folder,publicID){
    cloudinary.uploader
    .destroy(`${folder}/${publicID}`)
    .then(result => console.log(result));
}

export default Delete;