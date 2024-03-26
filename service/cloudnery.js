/* eslint-disable no-console */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-unused-expressions */
/* eslint-disable no-unused-vars */
const cloudinary = require('cloudinary');

const dotEnv = require('dotenv');

dotEnv.config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploads = (file, folder) => new Promise((resolve) => {
  cloudinary.uploader.upload(file, (result) => {
    resolve({
      url: result.url,
      id: result.public_id,
    });
  }, {
    resource_type: 'auto',
    folder,
  });
});

async function deleteImage(publicId) {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    console.log(result);
    return result;
  } catch (error) {
    console.error('error:', error);
    throw error;
  }
}
module.exports = {
  uploads,
  deleteImage,
};
