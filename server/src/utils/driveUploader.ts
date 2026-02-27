import crypto from "crypto";
import { ENV } from "../config/env";

/**
 * Upload a base-64 encoded image to Google Drive and return a
 * publicly-viewable link.
 *
 * Uses the raw Google Drive REST API + a self-signed JWT — NO heavy
 * `googleapis` package needed (saves ~50 MB, works on Vercel).
 *
 * Naming convention:  Name_EventTitle_Date  (e.g. John_Hackathon_2026-03-15)
 */

/* ═══════════════════════════════════════════════════════
   JWT signing for Google Service-Account (RS256)
   ═══════════════════════════════════════════════════════ */

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  // Reuse token if still valid (with 60s buffer)
  if (cachedToken && Date.now() < cachedToken.expiresAt - 60_000) {
    return cachedToken.token;
  }

  const pk = ENV.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;
  if (!pk || !pk.includes("-----BEGIN")) {
    throw new Error(
      "GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY is malformed. " +
      "It must start with -----BEGIN PRIVATE KEY----- and contain real newlines. " +
      `Current value starts with: '${pk.substring(0, 40)}...'`,
    );
  }

  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const payload = {
    iss: ENV.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    scope: "https://www.googleapis.com/auth/drive.file",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  };

  const encode = (obj: object) =>
    Buffer.from(JSON.stringify(obj)).toString("base64url");

  const unsigned = `${encode(header)}.${encode(payload)}`;

  let signature: string;
  try {
    signature = crypto
      .createSign("RSA-SHA256")
      .update(unsigned)
      .sign(pk, "base64url");
  } catch (signErr) {
    throw new Error(
      `Failed to sign JWT with the private key. The key format is likely incorrect. ` +
      `Make sure you copied the entire private_key value from the service-account JSON. Error: ${signErr}`,
    );
  }

  const jwt = `${unsigned}.${signature}`;

  // Exchange JWT for an access token
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Google token exchange failed (${res.status}): ${text}`);
  }

  const data = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };
  return data.access_token;
}

/* ═══════════════════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════════════════ */

/** Sanitise a string so it's safe for a filename */
const sanitise = (s: string) =>
  s.replace(/[^a-zA-Z0-9_-]/g, "_").replace(/_+/g, "_").substring(0, 60);

/** Convert a base-64 data-URL (or raw base-64 string) to a Buffer */
function base64ToBuffer(base64: string): { buffer: Buffer; mimeType: string } {
  const match = base64.match(/^data:([^;]+);base64,(.+)$/s);
  if (match) {
    return { buffer: Buffer.from(match[2], "base64"), mimeType: match[1] };
  }
  return { buffer: Buffer.from(base64, "base64"), mimeType: "image/jpeg" };
}

/* ═══════════════════════════════════════════════════════
   Main export
   ═══════════════════════════════════════════════════════ */

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
  const accessToken = await getAccessToken();

  // Build file name: Name_EventTitle_Date
  const datePart = eventDate.split("T")[0];
  const fileName = `${sanitise(userName)}_${sanitise(eventTitle)}_${datePart}`;
  const ext = mimeType === "image/png" ? ".png" : ".jpg";
  const fullName = `${fileName}${ext}`;

  /* ── Step 1: Upload via multipart (metadata + media) ── */
  const boundary = "----DriveUploadBoundary" + Date.now();
  const metadata = JSON.stringify({
    name: fullName,
    parents: [ENV.GOOGLE_DRIVE_FOLDER_ID],
  });

  // Build multipart body manually
  const parts: Buffer[] = [];
  parts.push(Buffer.from(
    `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${metadata}\r\n`
  ));
  parts.push(Buffer.from(
    `--${boundary}\r\nContent-Type: ${mimeType}\r\nContent-Transfer-Encoding: binary\r\n\r\n`
  ));
  parts.push(buffer);
  parts.push(Buffer.from(`\r\n--${boundary}--`));

  const body = Buffer.concat(parts);

  const uploadRes = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": `multipart/related; boundary=${boundary}`,
        "Content-Length": String(body.length),
      },
      body,
    },
  );

  if (!uploadRes.ok) {
    const errText = await uploadRes.text();
    throw new Error(`Drive upload failed (${uploadRes.status}): ${errText}`);
  }

  const uploadData = (await uploadRes.json()) as { id?: string };
  const fileId = uploadData.id;
  if (!fileId) throw new Error("Drive upload succeeded but no file ID returned");

  /* ── Step 2: Make publicly viewable ── */
  const permRes = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}/permissions`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ role: "reader", type: "anyone" }),
    },
  );

  if (!permRes.ok) {
    console.error("Failed to set Drive permissions:", await permRes.text());
    // File was uploaded — return link anyway, it'll just require login to view
  }

  // Return a direct-viewable image URL (same pattern as gallery)
  return `https://lh3.googleusercontent.com/d/${fileId}=s1200`;
}
