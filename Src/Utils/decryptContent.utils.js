import { decrypt } from "./encryption.utils.js";

export default function decryptContent(content) {
  if (!content) return content;

  const decrypted = decrypt({
    cipherText: content,
    secretKey: process.env.REPLY_CONTENT_SECRET,
  });

  return JSON.parse(decrypted);
}
