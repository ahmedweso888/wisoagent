import { n as supabaseAdmin } from "./client.server-BlnvGJA3.mjs";
import processModule from "node:process";
import { Buffer } from "node:buffer";
import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
//#region node_modules/.nitro/vite/services/ssr/assets/server-LV6XjVEX.js
var TOOL_PRODUCTS = {
	financial_literacy: {
		key: "financial_literacy",
		name: "الثقافة المالية",
		description: "وكيل الثقافة المالية من WISO",
		priceEgp: 60,
		tools: ["financial_literacy"]
	},
	qureo: {
		key: "qureo",
		name: "Qureo",
		description: "وكيل Qureo من WISO",
		priceEgp: 70,
		tools: ["qureo"]
	},
	financial_literacy_qureo: {
		key: "financial_literacy_qureo",
		name: "الثقافة المالية + Qureo",
		description: "الوصول إلى وكيل الثقافة المالية ووكيل Qureo",
		priceEgp: 120,
		tools: ["financial_literacy", "qureo"]
	}
};
var ENCRYPTION_VERSION = "v1";
var ALGORITHM = "aes-256-gcm";
function encryptionKey() {
	const raw = processModule.env["SPRIX_CREDENTIAL_ENCRYPTION_KEY"];
	if (!raw) throw new Error("SPRIX_CREDENTIAL_ENCRYPTION_KEY is not configured on the server.");
	const key = Buffer.from(raw, "base64");
	if (key.length !== 32) throw new Error("SPRIX_CREDENTIAL_ENCRYPTION_KEY must be a base64-encoded 32-byte key.");
	return key;
}
function hashToolAccountId(value) {
	return createHash("sha256").update(value.trim().toLocaleLowerCase("en-US"), "utf8").digest("hex");
}
function encryptToolCredentials(credentials) {
	const iv = randomBytes(12);
	const cipher = createCipheriv(ALGORITHM, encryptionKey(), iv);
	const plaintext = Buffer.from(JSON.stringify(credentials), "utf8");
	const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
	const tag = cipher.getAuthTag();
	return [
		ENCRYPTION_VERSION,
		iv.toString("base64url"),
		tag.toString("base64url"),
		ciphertext.toString("base64url")
	].join(".");
}
function decryptToolCredentials(payload) {
	const [version, iv, tag, ciphertext] = payload.split(".");
	if (version !== ENCRYPTION_VERSION || !iv || !tag || !ciphertext) throw new Error("Invalid tool credential payload.");
	const decipher = createDecipheriv(ALGORITHM, encryptionKey(), Buffer.from(iv, "base64url"));
	decipher.setAuthTag(Buffer.from(tag, "base64url"));
	const plaintext = Buffer.concat([decipher.update(Buffer.from(ciphertext, "base64url")), decipher.final()]).toString("utf8");
	const parsed = JSON.parse(plaintext);
	if (typeof parsed.id !== "string" || typeof parsed.password !== "string") throw new Error("Invalid tool credential payload.");
	return {
		id: parsed.id,
		password: parsed.password
	};
}
function getToolProduct(productKey) {
	const product = TOOL_PRODUCTS[productKey];
	if (!product) throw new Error("INVALID_TOOL_PRODUCT");
	return product;
}
async function getToolCatalog() {
	const { data, error } = await supabaseAdmin.from("payment_methods").select("method_key,display_name,account_identifier,instructions,is_active,sort_order").in("method_key", ["vodafone_cash", "instapay"]).eq("is_active", true).order("sort_order", { ascending: true });
	if (error) throw error;
	return {
		products: Object.values(TOOL_PRODUCTS),
		methods: data ?? []
	};
}
async function hasToolAccess(userId, toolKey) {
	const { data, error } = await supabaseAdmin.from("tool_access").select("active,expires_at,revoked_at").eq("user_id", userId).eq("tool_key", toolKey).maybeSingle();
	if (error) throw error;
	return Boolean(data?.active && !data.revoked_at && (!data.expires_at || new Date(data.expires_at).getTime() > Date.now()));
}
async function getToolAccess(userId) {
	const { data, error } = await supabaseAdmin.from("tool_access").select("tool_key,active,source_type,activated_at,expires_at,revoked_at").eq("user_id", userId).order("tool_key");
	if (error) throw error;
	return (data ?? []).map((row) => ({
		...row,
		available: row.active === true && !row.revoked_at && (!row.expires_at || new Date(row.expires_at).getTime() > Date.now())
	}));
}
async function saveToolAccount(userId, toolKey, id, password) {
	const accountIdHash = hashToolAccountId(id);
	const { data: owner, error: ownerError } = await supabaseAdmin.from("tool_accounts").select("user_id").eq("tool_key", toolKey).eq("account_id_hash", accountIdHash).neq("user_id", userId).maybeSingle();
	if (ownerError) throw ownerError;
	if (owner) throw new Error("TOOL_ACCOUNT_ALREADY_BOUND");
	const { data: existing, error: existingError } = await supabaseAdmin.from("tool_accounts").select("account_id_hash,verification_status").eq("user_id", userId).eq("tool_key", toolKey).maybeSingle();
	if (existingError) throw existingError;
	if (existing?.verification_status === "verified" && existing.account_id_hash && existing.account_id_hash !== accountIdHash) throw new Error("TOOL_ACCOUNT_REBIND_NOT_ALLOWED");
	const { data, error } = await supabaseAdmin.from("tool_accounts").upsert({
		user_id: userId,
		tool_key: toolKey,
		account_id_hash: accountIdHash,
		credential_ciphertext: encryptToolCredentials({
			id,
			password
		}),
		encryption_version: 1,
		verification_status: "verified",
		verified_at: (/* @__PURE__ */ new Date()).toISOString(),
		updated_at: (/* @__PURE__ */ new Date()).toISOString()
	}, { onConflict: "user_id,tool_key" }).select("id,tool_key,verification_status,verified_at").single();
	if (error) throw error;
	return data;
}
async function getToolAccount(userId, toolKey) {
	const { data, error } = await supabaseAdmin.from("tool_accounts").select("*").eq("user_id", userId).eq("tool_key", toolKey).maybeSingle();
	if (error) throw error;
	return data;
}
async function createToolOrder(input) {
	const product = getToolProduct(input.productKey);
	const senderNumber = input.senderNumber.trim().replace(/[\s()-]/g, "");
	if (!/^[+]?\d{8,20}$/.test(senderNumber)) throw new Error("INVALID_SENDER_NUMBER");
	if (!input.screenshotPath.startsWith(`${input.userId}/tools/`)) throw new Error("INVALID_PAYMENT_PROOF_PATH");
	const { data, error } = await supabaseAdmin.from("tool_orders").insert({
		user_id: input.userId,
		product_key: product.key,
		amount_egp: product.priceEgp,
		method: input.method,
		sender_number: senderNumber,
		screenshot_path: input.screenshotPath
	}).select("id,product_key,amount_egp,method,status,created_at").single();
	if (error) {
		if (error.code === "23505") throw new Error("PENDING_TOOL_ORDER_EXISTS");
		throw error;
	}
	return data;
}
async function adminListToolOrders(status) {
	let query = supabaseAdmin.from("tool_orders").select("id,user_id,product_key,amount_egp,method,sender_number,screenshot_path,status,reject_reason,reviewed_by,reviewed_at,created_at").order("created_at", { ascending: false }).limit(300);
	if (status && status !== "all") query = query.eq("status", status);
	const { data, error } = await query;
	if (error) throw error;
	return data ?? [];
}
async function adminReviewToolOrder(input) {
	const { data, error } = await supabaseAdmin.rpc("admin_review_tool_order", {
		_request: input.orderId,
		_approve: input.approve,
		_reason: input.reason?.trim() || null,
		_admin_id: input.adminId
	});
	if (error) throw error;
	return data;
}
async function createToolPaymentProofSignedUrl(path) {
	if (!path.includes("/tools/")) throw new Error("INVALID_PAYMENT_PROOF_PATH");
	const { data, error } = await supabaseAdmin.storage.from("payment-proofs").createSignedUrl(path, 300);
	if (error) throw error;
	return data.signedUrl;
}
//#endregion
export { decryptToolCredentials as a, getToolCatalog as c, saveToolAccount as d, createToolPaymentProofSignedUrl as i, getToolProduct as l, adminReviewToolOrder as n, getToolAccess as o, createToolOrder as r, getToolAccount as s, adminListToolOrders as t, hasToolAccess as u };
