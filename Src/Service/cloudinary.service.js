import cloudinary from "../Config/cloudinary.config.js";

export default async function uploadImage({ filePath = "", options = {} }) {
  const result = await cloudinary().uploader.upload(filePath, {
    folder: process.env.CLOUDINARY_GENERAL_FOLDER,
    ...options,
  });
  return result;
}
export async function deleteUploadedImage(id) {
  return await cloudinary().uploader.destroy(id);
}

export async function deleteMultipleUploadedImages(ids) {
  return await cloudinary().api.delete_resources(ids);
}
