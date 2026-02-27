import crypto from "crypto";
import { ENV } from "../config/env";

/**
 * Upload a base-64 encoded image to Cloudinary and return a
 * publicly-viewable URL.
 *
 * Uses the raw Cloudinary Upload REST API — zero npm dependencies.
 * Naming convention:  Name_EventTitle_Date  (e.g. John_Hackathon_2026-03-15)
 *
 * Setup:
 *   1. Sign up at https://cloudinary.com (free tier = 25 GB)
 *   2. Dashboard → copy Cloud Name, API Key, API Secret
 *   3. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
 *      in your Vercel env vars.
 */

/* ── Helpers ── */

const sanitise = (s: string) =>
  s.replace(/[^a-zA-Z0-9_-]/g, "_").replace(/_+/g, "_").substring(0, 60);

export interface UploadOptions {
  base64Image: string;
  userName: string;
  eventTitle: string;
  eventDate: string;
}

/**
 * Upload a payment screenshot to Cloudinary.
 * @returns Publicly viewable HTTPS URL of the image.
 */
export async function uploadScreenshot(opts: UploadOptions): Promise<string> {
  const { base64Image, userName, eventTitle, eventDate } = opts;

  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = ENV;

  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    throw new Error(
      "Cloudinary credentials not configured. " +
      "Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET in your env."
    );
  }

  // Build a meaningful public_id (acts as the filename)
  const datePart = eventDate.split("T")[0];
  const publicId = `payments/${sanitise(userName)}_${sanitise(eventTitle)}_${datePart}_${Date.now()}`;

  // Cloudinary signed upload uses timestamp + signature
  const timestamp = Math.floor(Date.now() / 1000).toString();

  // Build the string-to-sign (alphabetical params, no file/api_key/cloud_name)
  const toSign = `folder=apex_payments&public_id=${publicId}&timestamp=${timestamp}${CLOUDINARY_API_SECRET}`;
  const signature = crypto.createHash("sha1").update(toSign).digest("hex");

  // Ensure the base64 has a data-URL prefix (Cloudinary requires it)
  let fileData = base64Image;
  if (!fileData.startsWith("data:")) {
    fileData = `data:image/jpeg;base64,${fileData}`;
  }

  // Use URLSearchParams for the POST body (avoids JSON size issues)
  const body = new URLSearchParams({
    file: fileData,
    api_key: CLOUDINARY_API_KEY,
    timestamp,
    signature,
    public_id: publicId,
    folder: "apex_payments",
  });

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    {
      method: "POST",
      body,
    },
  );

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Cloudinary upload failed (${res.status}): ${errText}`);
  }

  const data = (await res.json()) as { secure_url?: string };
  if (!data.secure_url) {
    throw new Error("Cloudinary upload succeeded but no URL returned");
  }

  return data.secure_url;
}
