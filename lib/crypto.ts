// AES-256-GCM encrypt/decrypt for Airtable tokens
// Key must be 32 bytes (64 hex chars) — set in TOKEN_ENCRYPTION_KEY env var

const KEY_HEX = process.env.TOKEN_ENCRYPTION_KEY!

function getKey(): Buffer {
  if (!KEY_HEX || KEY_HEX.length !== 64) {
    throw new Error("TOKEN_ENCRYPTION_KEY must be a 64-character hex string (32 bytes)")
  }
  return Buffer.from(KEY_HEX, "hex")
}

export function encrypt(plaintext: string): string {
  const crypto = require("crypto") as typeof import("crypto")
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv("aes-256-gcm", getKey(), iv)
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()])
  const tag = cipher.getAuthTag()
  // Format: iv(12):tag(16):ciphertext — all hex
  return [iv.toString("hex"), tag.toString("hex"), encrypted.toString("hex")].join(":")
}

export function decrypt(encoded: string): string {
  const crypto = require("crypto") as typeof import("crypto")
  const [ivHex, tagHex, dataHex] = encoded.split(":")
  const iv = Buffer.from(ivHex, "hex")
  const tag = Buffer.from(tagHex, "hex")
  const data = Buffer.from(dataHex, "hex")
  const decipher = crypto.createDecipheriv("aes-256-gcm", getKey(), iv)
  decipher.setAuthTag(tag)
  return decipher.update(data).toString("utf8") + decipher.final("utf8")
}
