const cloudinary = require("cloudinary").v2;
const dotenv = require("dotenv");
dotenv.config();
const cloudinaryConfig = () => {
  cloudinary.config({
    cloud_name: process.env.cloudename,
    api_key: process.env.api_key,
    api_secret: process.env.api_secret,
  });
};
module.exports = cloudinaryConfig;
