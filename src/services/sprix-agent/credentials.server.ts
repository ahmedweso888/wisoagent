import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

const VERSION = "v1";
const ALGORITHM = "aes-256-gcm";
const IV_BYTES = 12;

function encryptionKey(): Buffer {
  const raw = process.env["SPRIX_CREDENTIAL_ENCRYPTION_KEY"];
  if (!raw) throw new Error("SPRIX_CREDENTIAL_ENCRYPTION_KEY is not configured on the server.");

  const key = Buffer.from(raw, "base64");
  if (key.length !== 32) {
    throw new Error("SPRIX_CREDENTIAL_ENCRYPTION_KEY must be a base64-encoded 32-byte key.");
  }
  return key;
}

export type SprixCredentials = { username: string; password: string };

export function encryptSprixCredentials(credentials: SprixCredentials): string {
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv(ALGORITHM, encryptionKey(), iv);
  const plaintext = Buffer.from(JSON.stringify(credentials), "utf8");
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [VERSION, iv.toString("base64url"), tag.toString("base64url"), ciphertext.toString("base64url")].join(".");
}

export function decryptSprixCredentials(payload: string): SprixCredentials {
  const [version, ivEncoded, tagEncoded, ciphertextEncoded] = payload.split(".");
  if (version !== VERSION || !ivEncoded || !tagEncoded || !ciphertextEncoded) {
    throw new Error("Invalid SPRIX credential payload.");
  }

  const decipher = createDecipheriv(ALGORITHM, encryptionKey(), Buffer.from(ivEncoded, "base64url"));
  decipher.setAuthTag(Buffer.from(tagEncoded, "base64url"));
  const plaintext = Buffer.concat([
    decipher.update(Buffer.from(ciphertextEncoded, "base64url")),
    decipher.final(),
  ]).toString("utf8");

  const parsed: unknown = JSON.parse(plaintext);
  if (!parsed || typeof parsed !== "object") throw new Error("Invalid SPRIX credential payload.");
  const value = parsed as Record<string, unknown>;
  if (typeof value["username"] !== "string" || typeof value["password"] !== "string") {
    throw new Error("Invalid SPRIX credential payload.");
  }
  return { username: value["username"], password: value["password"] };
}

export function hashSprixUsername(username: string): string {
  return createHash("sha256").update(username.trim().toLocaleLowerCase("en-US"), "utf8").digest("hex");
}
