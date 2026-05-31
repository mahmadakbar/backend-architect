import { env } from "@configs/index";
import * as crypto from "crypto";
import logger from "@configs/logger.configs";

const secretKey = env.KEY.SECRET;

export function encrypt(text: string): string {
  try {
    // Create a buffer from the secret key and generate a fixed-length key
    const key = crypto.scryptSync(secretKey, "salt", 32);

    // Generate a random initialization vector
    const iv = crypto.randomBytes(16);

    // Create cipher with AES-256-CBC
    const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);

    // Encrypt the data
    let encrypted = cipher.update(text, "utf8", "base64");
    encrypted += cipher.final("base64");

    // Return IV + encrypted data as base64 string
    return iv.toString("hex") + ":" + encrypted;
  } catch (error) {
    logger.error(error, "Encryption error");
    throw new Error("Encryption failed");
  }
}

export function decrypt(encryptedData: string): string {
  try {
    // Split the encrypted data to get IV and actual encrypted content
    const [ivHex, encryptedText] = encryptedData.split(":");

    if (!ivHex || !encryptedText) {
      throw new Error("Invalid encrypted data format");
    }

    // Create a buffer from the secret key
    const key = crypto.scryptSync(secretKey, "salt", 32);

    // Convert IV from hex to Buffer
    const iv = Buffer.from(ivHex, "hex");

    // Create decipher
    const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);

    // Decrypt the data
    let decrypted = decipher.update(encryptedText, "base64", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (error) {
    logger.error(error, "Decryption error");
    throw new Error("Decryption failed");
  }
}

export const hashEmail = (email: string): string => {
  const normalized = email.toLowerCase().trim();
  return crypto.createHash("sha256").update(normalized).digest("hex");
};
