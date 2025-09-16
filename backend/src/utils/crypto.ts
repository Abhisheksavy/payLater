// src/utils/crypto.ts
import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const KEY = Buffer.from(process.env.PLAID_ENCRYPTION_KEY!, "utf8");

export function encrypt(text: string): { iv: string; content: string; tag: string } {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);

  const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return {
    iv: iv.toString("hex"),
    content: encrypted.toString("hex"),
    tag: tag.toString("hex"),
  };
}

export function decrypt(encrypted: { iv: string; content: string; tag: string }): string {
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    KEY,
    Buffer.from(encrypted.iv, "hex")
  );
  decipher.setAuthTag(Buffer.from(encrypted.tag, "hex"));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encrypted.content, "hex")),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}
