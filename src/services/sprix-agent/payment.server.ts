import { supabaseAdmin } from "@/integrations/supabase/client.server";

const METHODS = new Set(["vodafone_cash", "instapay"] as const);
export type SprixPaymentMethod = "vodafone_cash" | "instapay";

function getPriceEgp(): number {
  const raw = process.env["SPRIX_AGENT_PRICE_EGP"]?.trim();
  const value = Number(raw);
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error("SPRIX_AGENT_PRICE_NOT_CONFIGURED");
  }
  return Math.round(value * 100) / 100;
}

function normalizeSenderNumber(value: string): string {
  const normalized = value.trim().replace(/[\s()-]/g, "");
  if (!/^[+]?\d{8,20}$/.test(normalized)) throw new Error("INVALID_SENDER_NUMBER");
  return normalized;
}

export async function getSprixPaymentOptions() {
  const { data, error } = await supabaseAdmin
    .from("payment_methods")
    .select("method_key,display_name,account_identifier,instructions,is_active,sort_order")
    .in("method_key", ["vodafone_cash", "instapay"])
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  if (error) throw error;

  return {
    priceEgp: getPriceEgp(),
    methods: (data ?? []).filter((item) => METHODS.has(item.method_key as SprixPaymentMethod)),
  };
}

export async function createSprixPaymentRequest(input: {
  userId: string;
  method: SprixPaymentMethod;
  senderNumber: string;
  screenshotPath: string;
}) {
  if (!METHODS.has(input.method)) throw new Error("INVALID_PAYMENT_METHOD");
  if (!input.screenshotPath.startsWith(`${input.userId}/sprix/`)) {
    throw new Error("INVALID_PAYMENT_PROOF_PATH");
  }

  const amount = getPriceEgp();
  const senderNumber = normalizeSenderNumber(input.senderNumber);

  const { data, error } = await supabaseAdmin
    .from("sprix_payment_requests")
    .insert({
      user_id: input.userId,
      method: input.method,
      amount_egp: amount,
      sender_number: senderNumber,
      screenshot_path: input.screenshotPath,
    })
    .select("id,status,amount_egp,method,sender_number,screenshot_path,created_at")
    .single();

  if (error) {
    if (error.code === "23505") throw new Error("PENDING_SPRIX_PAYMENT_EXISTS");
    throw error;
  }
  return data;
}

export async function listMySprixPaymentRequests(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("sprix_payment_requests")
    .select("id,method,amount_egp,status,reject_reason,created_at,reviewed_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(20);
  if (error) throw error;
  return data ?? [];
}

export async function hasSprixAccess(userId: string): Promise<boolean> {
  const { data, error } = await supabaseAdmin
    .from("sprix_agent_access")
    .select("active,expires_at")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return (
    data?.active === true &&
    (!data.expires_at || new Date(data.expires_at).getTime() > Date.now())
  );
}

export async function adminListSprixPaymentRequests(status?: string) {
  let query = supabaseAdmin
    .from("sprix_payment_requests")
    .select("id,user_id,method,amount_egp,sender_number,screenshot_path,status,reject_reason,reviewed_by,reviewed_at,created_at")
    .order("created_at", { ascending: false })
    .limit(200);
  if (status && status !== "all") query = query.eq("status", status);
  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function adminReviewSprixPayment(input: {
  paymentId: string;
  approve: boolean;
  adminId: string;
  reason?: string;
}) {
  const rawDays = Number(process.env["SPRIX_AGENT_ACCESS_DAYS"] ?? "30");

  const accessDays =
    Number.isInteger(rawDays) && rawDays >= 1 && rawDays <= 3650
      ? rawDays
      : 30;

  const rpcParams = {
    _request: input.paymentId,
    _approve: input.approve,
    _admin_id: input.adminId,
    _access_days: accessDays,
    ...(input.reason?.trim()
      ? { _reason: input.reason.trim() }
      : {}),
  };

  const { data, error } = await supabaseAdmin.rpc(
    "admin_review_sprix_payment",
    rpcParams,
  );

  if (error) throw error;

  return data;
}

export async function createSprixPaymentProofSignedUrl(path: string) {
  if (!path.includes("/sprix/")) throw new Error("INVALID_PAYMENT_PROOF_PATH");
  const { data, error } = await supabaseAdmin.storage.from("payment-proofs").createSignedUrl(path, 300);
  if (error) throw error;
  return data.signedUrl;
}
