import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export type ToolKey = "financial_literacy" | "qureo";
export type ToolProductKey = ToolKey | "financial_literacy_qureo";

export const TOOL_PRODUCTS: Record<ToolProductKey, {
  key: ToolProductKey;
  name: string;
  description: string;
  priceEgp: number;
  tools: ToolKey[];
}> = {
  financial_literacy: {
    key: "financial_literacy",
    name: "الثقافة المالية",
    description: "وكيل الثقافة المالية من WISO",
    priceEgp: 60,
    tools: ["financial_literacy"],
  },
  qureo: {
    key: "qureo",
    name: "Qureo",
    description: "وكيل Qureo من WISO",
    priceEgp: 70,
    tools: ["qureo"],
  },
  financial_literacy_qureo: {
    key: "financial_literacy_qureo",
    name: "الثقافة المالية + Qureo",
    description: "الوصول إلى وكيل الثقافة المالية ووكيل Qureo",
    priceEgp: 120,
    tools: ["financial_literacy", "qureo"],
  },
};

const ENCRYPTION_VERSION = "v1";
const ALGORITHM = "aes-256-gcm";

function encryptionKey(): Buffer {
  const raw = process.env["SPRIX_CREDENTIAL_ENCRYPTION_KEY"];
  if (!raw) throw new Error("SPRIX_CREDENTIAL_ENCRYPTION_KEY is not configured on the server.");
  const key = Buffer.from(raw, "base64");
  if (key.length !== 32) throw new Error("SPRIX_CREDENTIAL_ENCRYPTION_KEY must be a base64-encoded 32-byte key.");
  return key;
}

export function hashToolAccountId(value: string): string {
  return createHash("sha256").update(value.trim().toLocaleLowerCase("en-US"), "utf8").digest("hex");
}

export function encryptToolCredentials(credentials: { id: string; password: string }): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGORITHM, encryptionKey(), iv);
  const plaintext = Buffer.from(JSON.stringify(credentials), "utf8");
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [
    ENCRYPTION_VERSION,
    iv.toString("base64url"),
    tag.toString("base64url"),
    ciphertext.toString("base64url"),
  ].join(".");
}

export function decryptToolCredentials(payload: string): { id: string; password: string } {
  const [version, iv, tag, ciphertext] = payload.split(".");
  if (version !== ENCRYPTION_VERSION || !iv || !tag || !ciphertext) throw new Error("Invalid tool credential payload.");
  const decipher = createDecipheriv(ALGORITHM, encryptionKey(), Buffer.from(iv, "base64url"));
  decipher.setAuthTag(Buffer.from(tag, "base64url"));
  const plaintext = Buffer.concat([
    decipher.update(Buffer.from(ciphertext, "base64url")),
    decipher.final(),
  ]).toString("utf8");
  const parsed = JSON.parse(plaintext) as { id?: unknown; password?: unknown };
  if (typeof parsed.id !== "string" || typeof parsed.password !== "string") {
    throw new Error("Invalid tool credential payload.");
  }
  return { id: parsed.id, password: parsed.password };
}

export function getToolProduct(productKey: string) {
  const product = TOOL_PRODUCTS[productKey as ToolProductKey];
  if (!product) throw new Error("INVALID_TOOL_PRODUCT");
  return product;
}

export async function getToolCatalog() {
  const { data, error } = await supabaseAdmin
    .from("payment_methods")
    .select("method_key,display_name,account_identifier,instructions,is_active,sort_order")
    .in("method_key", ["vodafone_cash", "instapay"])
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return {
    products: Object.values(TOOL_PRODUCTS),
    methods: data ?? [],
  };
}

export async function hasToolAccess(userId: string, toolKey: ToolKey): Promise<boolean> {
  const { data, error } = await supabaseAdmin
    .from("tool_access")
    .select("active,expires_at,revoked_at")
    .eq("user_id", userId)
    .eq("tool_key", toolKey)
    .maybeSingle();
  if (error) throw error;
  return Boolean(
    data?.active &&
    !data.revoked_at &&
    (!data.expires_at || new Date(data.expires_at).getTime() > Date.now()),
  );
}

export async function getToolAccess(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("tool_access")
    .select("tool_key,active,source_type,activated_at,expires_at,revoked_at")
    .eq("user_id", userId)
    .order("tool_key");
  if (error) throw error;
  return (data ?? []).map((row) => ({
    ...row,
    available:
      row.active === true &&
      !row.revoked_at &&
      (!row.expires_at || new Date(row.expires_at).getTime() > Date.now()),
  }));
}

export async function saveToolAccount(
  userId: string,
  toolKey: ToolKey,
  id: string,
  password: string,
) {
  const accountIdHash = hashToolAccountId(id);

  const credentialCiphertext = encryptToolCredentials({
    id,
    password,
  });

  const { data, error } = await (supabaseAdmin as any).rpc(
    "wiso_save_tool_account_with_attempt",
    {
      _user_id: userId,
      _tool_key: toolKey,
      _account_id_hash: accountIdHash,
      _credential_ciphertext: credentialCiphertext,
      _encryption_version: 1,
    },
  );

  if (error) {
    const message = String(error.message ?? "");

    if (message.includes("TOOL_ATTEMPT_ALREADY_USED")) {
      throw new Error("TOOL_ATTEMPT_ALREADY_USED");
    }

    if (message.includes("TOOL_ATTEMPT_NOT_AVAILABLE")) {
      throw new Error("TOOL_ATTEMPT_NOT_AVAILABLE");
    }

    if (message.includes("TOOL_ACCOUNT_ALREADY_BOUND")) {
      throw new Error("TOOL_ACCOUNT_ALREADY_BOUND");
    }

    if (message.includes("TOOL_ACCOUNT_REBIND_NOT_ALLOWED")) {
      throw new Error("TOOL_ACCOUNT_REBIND_NOT_ALLOWED");
    }

    if (message.includes("TOOL_ACCESS_REQUIRED")) {
      throw new Error("TOOL_ACCESS_REQUIRED");
    }

    if (message.includes("TOOL_CREDENTIALS_INVALID")) {
      throw new Error("TOOL_CREDENTIALS_INVALID");
    }

    throw error;
  }

  if (!data || typeof data !== "object") {
    throw new Error("TOOL_ACCOUNT_SAVE_FAILED");
  }

  return data as {
    id: string;
    tool_key: ToolKey;
    verification_status: string;
    verified_at: string | null;
  };
}

export async function saveToolAccountsAtomically(
  userId: string,
  toolKeys: ToolKey[],
  id: string,
  password: string,
) {
  const uniqueKeys = [...new Set(toolKeys)];
  if (uniqueKeys.length < 2 || uniqueKeys.some((key) => !["financial_literacy", "qureo"].includes(key))) {
    throw new Error("INVALID_TOOL_SET");
  }
  const accountIdHash = hashToolAccountId(id);
  const credentialCiphertext = encryptToolCredentials({ id, password });
  const { data, error } = await (supabaseAdmin as any).rpc("wiso_save_tool_accounts_atomically", {
    _user_id: userId,
    _tool_keys: uniqueKeys,
    _account_id_hash: accountIdHash,
    _credential_ciphertext: credentialCiphertext,
    _encryption_version: 1,
  });
  if (error) {
    const message = String(error.message ?? "");
    for (const code of ["TOOL_ATTEMPT_ALREADY_USED", "TOOL_ATTEMPT_NOT_AVAILABLE", "TOOL_ACCOUNT_ALREADY_BOUND", "TOOL_ACCOUNT_REBIND_NOT_ALLOWED", "TOOL_ACCESS_REQUIRED", "TOOL_CREDENTIALS_INVALID"]) {
      if (message.includes(code)) throw new Error(code);
    }
    throw error;
  }
  if (!data || typeof data !== "object") throw new Error("TOOL_ACCOUNT_SAVE_FAILED");
  return data;
}

export async function listMyToolOrders(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("tool_orders")
    .select("id,product_key,amount_egp,method,status,reject_reason,created_at,reviewed_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(20);
  if (error) throw error;
  return data ?? [];
}
/* ============================================================================
 * Get current user's tool account
 * ========================================================================== */

export async function getToolAccount(
  userId: string,
  toolKey: ToolKey,
) {
  const { data, error } = await supabaseAdmin
    .from("tool_accounts")
    .select("*")
    .eq("user_id", userId)
    .eq("tool_key", toolKey)
    .maybeSingle();

  if (error) throw error;

  return data;
}

/* ============================================================================
 * Create tool payment order
 * ========================================================================== */

export async function createToolOrder(input: {
  userId: string;
  productKey: ToolProductKey;
  method: "vodafone_cash" | "instapay";
  senderNumber: string;
  screenshotPath: string;
  accountId: string;
  password: string;
}) {
  const product = getToolProduct(input.productKey);
  if (!input.accountId.trim() || !input.password || input.accountId.length > 200 || input.password.length > 500) {
    throw new Error("TOOL_CREDENTIALS_INVALID");
  }

  const senderNumber = input.senderNumber
    .trim()
    .replace(/[\s()-]/g, "");

  if (!/^[+]?\d{8,20}$/.test(senderNumber)) {
    throw new Error("INVALID_SENDER_NUMBER");
  }

  if (
    !input.screenshotPath.startsWith(
      `${input.userId}/tools/`,
    )
  ) {
    throw new Error("INVALID_PAYMENT_PROOF_PATH");
  }

  const { data, error } = await supabaseAdmin
    .from("tool_orders")
    .insert({
      user_id: input.userId,
      product_key: product.key,
      amount_egp: product.priceEgp,
      method: input.method,
      sender_number: senderNumber,
      screenshot_path: input.screenshotPath,
      account_id_hash: hashToolAccountId(input.accountId),
      credential_ciphertext: encryptToolCredentials({ id: input.accountId.trim(), password: input.password }),
      encryption_version: 1,
    })
    .select(
      "id,product_key,amount_egp,method,status,created_at",
    )
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new Error("PENDING_TOOL_ORDER_EXISTS");
    }

    throw error;
  }

  return data;
}

export async function adminListToolOrders(status?: string) {
  let query = supabaseAdmin
    .from("tool_orders")
    .select("id,user_id,product_key,amount_egp,method,sender_number,screenshot_path,status,reject_reason,reviewed_by,reviewed_at,created_at,completed_at")
    .order("created_at", { ascending: false })
    .limit(300);
  query = query.is("completed_at", null);
  if (status && status !== "all") query = query.eq("status", status);
  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function adminReviewToolOrder(input: {
  orderId: string;
  approve: boolean;
  adminId: string;
  reason?: string;
}) {
  const { data, error } = await supabaseAdmin.rpc("admin_review_tool_order", {
    _request: input.orderId,
    _approve: input.approve,
_reason: input.reason?.toString() ?? "",
    _admin_id: input.adminId,
  });
  if (error) throw error;
  return data;
}

export async function createToolPaymentProofSignedUrl(path: string) {
  if (!path.includes("/tools/")) throw new Error("INVALID_PAYMENT_PROOF_PATH");
  const { data, error } = await supabaseAdmin.storage.from("payment-proofs").createSignedUrl(path, 300);
  if (error) throw error;
  return data.signedUrl;
}
