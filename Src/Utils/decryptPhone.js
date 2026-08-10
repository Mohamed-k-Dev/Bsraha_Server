import { decrypt } from "./encryption.utils.js";

export const decryptPhone = (encryptedPhone) => {
  if (!encryptedPhone) {
    return null;
  }

  return JSON.parse(
    decrypt({
      cipherText: encryptedPhone,
      secretKey: process.env.PHONE_SECRET_KEY,
    })
  );
};
