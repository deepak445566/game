
import dotenv from "dotenv";
dotenv.config();

import ImageKit from "imagekit";

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

export const uploadFile = async (fileBuffer, fileName) => {
  // Buffer ko Base64 me convert karo
  const base64File = fileBuffer.toString("base64");

  const result = await imagekit.upload({
    file: base64File,   // 👈 yahan ab Base64 jaa raha hai
    fileName: fileName,
  });

  return result;
};
