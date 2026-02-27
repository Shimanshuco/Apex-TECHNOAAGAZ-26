import dotenv from "dotenv";
dotenv.config();

export const ENV = {
  PORT: Number(process.env.PORT) || 5000,
  MONGO_URI: process.env.MONGO_URI || "mongodb://localhost:27017/technoaagaz",
  JWT_SECRET: process.env.JWT_SECRET || "fallback-secret",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:5173",
  ADMIN_SECRET: process.env.ADMIN_SECRET || "ApexAdminTechno26",
  VOLUNTEER_SECRET: process.env.VOLUNTEER_SECRET || "ApexVolTechno26",
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || "",
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || "",

  // Dynamic pricing
  PRICE_APEX: Number(process.env.PRICE_APEX) || 149,
  PRICE_OTHER_EARLY: Number(process.env.PRICE_OTHER_EARLY) || 300,
  PRICE_OTHER_REGULAR: Number(process.env.PRICE_OTHER_REGULAR) || 350,
  EARLY_BIRD_DEADLINE: process.env.EARLY_BIRD_DEADLINE || "2026-02-28",

  // Cloudinary — Payment Screenshots
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || "",
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || "",
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || "",
} as const;
