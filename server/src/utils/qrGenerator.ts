import QRCode from "qrcode";

/**
 * Generate a QR code data-URL (base64 PNG).
 * The QR encodes a JSON payload with user ID + role
 * so volunteers/admin can scan & verify at the venue.
 */
export const generateQR = async (data: {
  userId: string;
  name: string;
  email: string;
  role: string;
}): Promise<string> => {
  const payload = JSON.stringify(data);
  const dataUrl = await QRCode.toDataURL(payload, {
    errorCorrectionLevel: "H",
    margin: 2,
    width: 300,
    color: { dark: "#000000", light: "#ffffff" },
  });
  return dataUrl;
};
