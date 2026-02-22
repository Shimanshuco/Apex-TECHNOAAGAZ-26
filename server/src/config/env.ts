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
} as const;
