import CryptoJS from "crypto-js";

export function encrypt({ plainText, secretKey } = {}) {
  return CryptoJS.AES.encrypt(JSON.stringify(plainText), secretKey).toString();
}

export function decrypt({ cipherText, secretKey } = {}) {
  return CryptoJS.AES.decrypt(cipherText, secretKey).toString(
    CryptoJS.enc.Utf8
  );
}
