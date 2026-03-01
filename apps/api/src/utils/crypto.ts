import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const ALGORITHM = "aes-256-cbc";
const IV_LENGTH = 16;

function getKey(): Buffer {
    const raw = process.env.GITHUB_TOKEN_ENCRYPTION_KEY;
    if (!raw || raw.length !== 32) {
        throw new Error(
            "GITHUB_TOKEN_ENCRYPTION_KEY must be exactly 32 characters"
        );
    }
    return Buffer.from(raw, "utf8");
}

export function encryptToken(plaintext: string): string {
    const iv = randomBytes(IV_LENGTH);
    const cipher = createCipheriv(ALGORITHM, getKey(), iv);
    const encrypted = Buffer.concat([
        cipher.update(plaintext, "utf8"),
        cipher.final(),
    ]);
    return `${iv.toString("hex")}:${encrypted.toString("hex")}`;
}

export function decryptToken(encrypted: string): string {
    const [ivHex, encryptedHex] = encrypted.split(":");
    const iv = Buffer.from(ivHex, "hex");
    const data = Buffer.from(encryptedHex, "hex");
    const decipher = createDecipheriv(ALGORITHM, getKey(), iv);
    const decrypted = Buffer.concat([decipher.update(data), decipher.final()]);
    return decrypted.toString("utf8");
}
