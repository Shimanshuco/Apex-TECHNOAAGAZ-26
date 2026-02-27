import { google } from "googleapis";
import { Readable } from "stream";
import { ENV } from "../config/env";

/**
 * Upload a base-64 encoded image to Google Drive and return a
 * publicly-viewable link.
 *
 * File is placed in the Drive folder specified by GOOGLE_DRIVE_FOLDER_ID.
 * Naming convention:  Name_EventTitle_Date  (e.g. John_Hackathon_2026-03-15)
 *
 * Prerequisites
 * ─────────────
 * 1. A Google Cloud project with the Drive API enabled.
 * 2. A Service Account whose JSON key provides:
 *    • GOOGLE_SERVICE_ACCOUNT_EMAIL   (client_email  from JSON)
 *    • GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY (private_key from JSON)
 * 3. The target Drive folder must be shared with the service-account email
 *    (Editor access).
 */

/* ── Auth singleton ── */
let driveInstance: ReturnType<typeof google.drive> | null = null;

function getDrive() {
  if (driveInstance) return driveInstance;

  const auth = new google.auth.JWT({
    email: ENV.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: ENV.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY,
    scopes: ["https://www.googleapis.com/auth/drive.file"],
  });

  driveInstance = google.drive({ version: "v3", auth });
  return driveInstance;
}

/* ── Helpers ── */

/** Sanitise a string so it's safe for a filename */
const sanitise = (s: string) =>
  s.replace(/[^a-zA-Z0-9_-]/g, "_").replace(/_+/g, "_").substring(0, 60);

/** Convert a base-64 data-URL (or raw base-64 string) to a Buffer */
function base64ToBuffer(base64: string): { buffer: Buffer; mimeType: string } {
  // data:image/jpeg;base64,/9j/4AAQ...
  const match = base64.match(/^data:([^;]+);base64,(.+)$/s);
  if (match) {
    return { buffer: Buffer.from(match[2], "base64"), mimeType: match[1] };
  }
  // Fall back: assume image/jpeg
  return { buffer: Buffer.from(base64, "base64"), mimeType: "image/jpeg" };
}

/* ── Main export ── */

export interface UploadOptions {
  /** Base-64 encoded image (with or without data-URL prefix) */
  base64Image: string;
  /** User's name (for file naming) */
  userName: string;
  /** Event title  (for file naming) */
  eventTitle: string;
  /** Event date string (ISO or "YYYY-MM-DD") */
  eventDate: string;
}

/**
 * Upload a payment screenshot to Google Drive.
 * @returns Publicly viewable URL of the uploaded image.
 */
export async function uploadScreenshotToDrive(opts: UploadOptions): Promise<string> {
  const { base64Image, userName, eventTitle, eventDate } = opts;

  if (!ENV.GOOGLE_DRIVE_FOLDER_ID || !ENV.GOOGLE_SERVICE_ACCOUNT_EMAIL || !ENV.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY) {
    throw new Error("Google Drive service-account credentials are not configured");
  }

  const { buffer, mimeType } = base64ToBuffer(base64Image);

  // Build file name: Name_EventTitle_Date
  const datePart = eventDate.split("T")[0]; // "2026-03-15"
  const fileName = `${sanitise(userName)}_${sanitise(eventTitle)}_${datePart}`;
  const ext = mimeType === "image/png" ? ".png" : ".jpg";

  const drive = getDrive();

  // Upload
  const res = await drive.files.create({
    requestBody: {
      name: `${fileName}${ext}`,
      parents: [ENV.GOOGLE_DRIVE_FOLDER_ID],
    },
    media: {
      mimeType,
      body: Readable.from(buffer),
    },
    fields: "id",
  });

  const fileId = res.data.id;
  if (!fileId) throw new Error("Drive upload succeeded but no file ID returned");

  // Make the file publicly viewable (anyone with link)
  await drive.permissions.create({
    fileId,
    requestBody: { role: "reader", type: "anyone" },
  });

  // Return a direct-viewable image URL (same pattern as gallery)
  return `https://lh3.googleusercontent.com/d/${fileId}=s1200`;
}
