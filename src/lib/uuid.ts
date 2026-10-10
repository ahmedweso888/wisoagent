export function createUuid(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  if (
    typeof crypto !== "undefined" &&
    typeof crypto.getRandomValues === "function"
  ) {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);

    const b6 = bytes[6] ?? 0;
    const b8 = bytes[8] ?? 0;

    bytes[6] = (b6 & 0x0f) | 0x40;
    bytes[8] = (b8 & 0x3f) | 0x80;

    const hex = Array.from(bytes, (byte) =>
      byte.toString(16).padStart(2, "0"),
    );

    return [
      hex.slice(0, 4).join(""),
      hex.slice(4, 6).join(""),
      hex.slice(6, 8).join(""),
      hex.slice(8, 10).join(""),
      hex.slice(10, 16).join(""),
    ].join("-");
  }

  throw new Error("المتصفح لا يدعم إنشاء UUID آمن.");
}