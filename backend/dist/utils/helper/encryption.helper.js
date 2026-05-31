"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashEmail = void 0;
exports.encrypt = encrypt;
exports.decrypt = decrypt;
const index_1 = require("@configs/index");
const crypto = __importStar(require("crypto"));
const secretKey = index_1.env.KEY.SECRET;
function encrypt(text) {
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
    }
    catch (error) {
        console.error("Encryption error:", error);
        throw new Error("Encryption failed");
    }
}
function decrypt(encryptedData) {
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
    }
    catch (error) {
        console.error("Decryption error:", error);
        throw new Error("Decryption failed");
    }
}
const hashEmail = (email) => {
    const normalized = email.toLowerCase().trim();
    return crypto.createHash("sha256").update(normalized).digest("hex");
};
exports.hashEmail = hashEmail;
//# sourceMappingURL=encryption.helper.js.map