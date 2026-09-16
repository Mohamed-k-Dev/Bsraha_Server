import { decrypt, encrypt } from "./encryption.utils.js";

export const decryptPhone = (encryptedPhone) => {
  if (!encryptedPhone) {
    return null;
  }

  try {
    const decrypted = decrypt({
      cipherText: encryptedPhone,
      secretKey: process.env.PHONE_SECRET_KEY,
    });

    if (!decrypted) return encryptedPhone; // Fallback if empty

    try {
      return JSON.parse(decrypted);
    } catch {
      return decrypted;
    }
  } catch (error) {
    return encryptedPhone;
  }
};

export const encryptPhone = (plainPhone) => {
  if (!plainPhone) {
    return null;
  }

  try {
    return encrypt({
      plainText: plainPhone, // FIX: Change 'text' to 'plainText' and remove outer JSON.stringify
      secretKey: process.env.PHONE_SECRET_KEY,
    });
  } catch (error) {
    console.error("Failed to encrypt phone:", error);
    return null;
  }
};