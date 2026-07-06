import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = process.env.AI_ENCRYPTION_KEY || 'daniswara-ai-encryption-key-32-chars!!';

export function encrypt(text) {
  if (!text) return null;
  return CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString();
}

export function decrypt(ciphertext) {
  if (!ciphertext) return null;
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, ENCRYPTION_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch {
    return null;
  }
}
