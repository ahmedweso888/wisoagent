import test from "node:test";
import assert from "node:assert/strict";
import { decryptSprixCredentials, encryptSprixCredentials } from "../credentials.server";

const key = Buffer.alloc(32, 7).toString("base64");
process.env["SPRIX_CREDENTIAL_ENCRYPTION_KEY"] = key;

test("encrypts and decrypts SPRIX credentials", () => {
  const original = { username: "student@example.com", password: "secret-pass" };
  const encrypted = encryptSprixCredentials(original);
  assert.notEqual(encrypted, JSON.stringify(original));
  assert.deepEqual(decryptSprixCredentials(encrypted), original);
  assert.ok(!encrypted.includes(original.password));
});

test("rejects tampered ciphertext", () => {
  const encrypted = encryptSprixCredentials({ username: "u", password: "p" });
  assert.throws(() => decryptSprixCredentials(`${encrypted.slice(0, -1)}x`));
});
