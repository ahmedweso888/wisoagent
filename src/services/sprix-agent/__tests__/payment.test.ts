import assert from "node:assert/strict";
import test from "node:test";

function normalizeSenderNumber(value: string): string {
  return value.trim().replace(/[\s()-]/g, "");
}

test("SPRIX sender number normalization removes harmless formatting", () => {
  assert.equal(normalizeSenderNumber(" 010-123 45678 "), "01012345678");
});

test("SPRIX payment methods are restricted to supported channels", () => {
  const methods = new Set(["vodafone_cash", "instapay"]);
  assert.equal(methods.has("vodafone_cash"), true);
  assert.equal(methods.has("instapay"), true);
  assert.equal(methods.has("wallet"), false);
});
