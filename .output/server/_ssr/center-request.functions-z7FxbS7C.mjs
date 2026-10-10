import { c as createServerFn } from "./createServerFn-CIHAFgYl.mjs";
import { n as requireSupabaseAuth } from "./auth-middleware-BgIfV4zI.mjs";
import { t as requireSupabaseAdmin } from "./admin.middleware-CR-36Rm9.mjs";
import { t as createServerRpc } from "./createServerRpc-B90ckaqP.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/center-request.functions-z7FxbS7C.js
var STATUSES = [
	"new",
	"reviewing",
	"contacted",
	"approved",
	"rejected"
];
var submitCenterRequest_createServerFn_handler = createServerRpc({
	id: "520a20a15d946155da3f66ec559ae310c26e6c58e8c73c5d391dd4de00b191be",
	name: "submitCenterRequest",
	filename: "src/lib/center-request.functions.ts"
}, (opts) => submitCenterRequest.__executeServer(opts));
var submitCenterRequest = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input) => {
	const centerName = input.centerName.trim();
	const centerAddress = input.centerAddress.trim();
	const contactNumber = input.contactNumber.trim();
	if (centerName.length < 2 || centerName.length > 200) throw new Error("اسم السنتر غير صالح.");
	if (centerAddress.length < 5 || centerAddress.length > 500) throw new Error("عنوان السنتر غير صالح.");
	if (!/^[+]?[0-9٠-٩\s()-]{8,30}$/.test(contactNumber)) throw new Error("رقم التواصل غير صالح.");
	return {
		centerName,
		centerAddress,
		contactNumber
	};
}).handler(submitCenterRequest_createServerFn_handler, async ({ data, context }) => {
	const { supabaseAdmin } = await import("./client.server-BlnvGJA3.mjs").then((n) => n.t).then((n) => n.t);
	const { data: row, error } = await supabaseAdmin.from("center_requests").insert({
		user_id: context.userId,
		center_name: data.centerName,
		center_address: data.centerAddress,
		contact_number: data.contactNumber
	}).select("id,status,created_at").single();
	if (error) throw error;
	return row;
});
var listMyCenterRequests_createServerFn_handler = createServerRpc({
	id: "77d5954954d9b76251c1fa9ef050e5f098bd49021efbdcd6ac31559e52938366",
	name: "listMyCenterRequests",
	filename: "src/lib/center-request.functions.ts"
}, (opts) => listMyCenterRequests.__executeServer(opts));
var listMyCenterRequests = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(listMyCenterRequests_createServerFn_handler, async ({ context }) => {
	const { supabaseAdmin } = await import("./client.server-BlnvGJA3.mjs").then((n) => n.t).then((n) => n.t);
	const { data, error } = await supabaseAdmin.from("center_requests").select("id,center_name,center_address,contact_number,status,admin_note,created_at,updated_at").eq("user_id", context.userId).order("created_at", { ascending: false }).limit(20);
	if (error) throw error;
	return data ?? [];
});
var adminListCenterRequests_createServerFn_handler = createServerRpc({
	id: "f4e4523136f0586d10b79e040e3dc575038c019d2ea93f035105b8248d39c2d5",
	name: "adminListCenterRequests",
	filename: "src/lib/center-request.functions.ts"
}, (opts) => adminListCenterRequests.__executeServer(opts));
var adminListCenterRequests = createServerFn({ method: "GET" }).middleware([requireSupabaseAdmin]).handler(adminListCenterRequests_createServerFn_handler, async () => {
	const { supabaseAdmin } = await import("./client.server-BlnvGJA3.mjs").then((n) => n.t).then((n) => n.t);
	const { data, error } = await supabaseAdmin.from("center_requests").select("id,user_id,center_name,center_address,contact_number,status,admin_note,reviewed_by,reviewed_at,created_at,updated_at").order("created_at", { ascending: false }).limit(500);
	if (error) throw error;
	return data ?? [];
});
var adminUpdateCenterRequest_createServerFn_handler = createServerRpc({
	id: "e646b5317c94ddedeb9db7bda1fc29af16db64e3cbb454575eb7df5bf1d2e594",
	name: "adminUpdateCenterRequest",
	filename: "src/lib/center-request.functions.ts"
}, (opts) => adminUpdateCenterRequest.__executeServer(opts));
var adminUpdateCenterRequest = createServerFn({ method: "POST" }).middleware([requireSupabaseAdmin]).inputValidator((input) => {
	if (!STATUSES.includes(input.status)) throw new Error("invalid_status");
	return input;
}).handler(adminUpdateCenterRequest_createServerFn_handler, async ({ data, context }) => {
	const { supabaseAdmin } = await import("./client.server-BlnvGJA3.mjs").then((n) => n.t).then((n) => n.t);
	const { data: row, error } = await supabaseAdmin.from("center_requests").update({
		status: data.status,
		admin_note: data.adminNote?.trim() || null,
		reviewed_by: context.adminId,
		reviewed_at: (/* @__PURE__ */ new Date()).toISOString(),
		updated_at: (/* @__PURE__ */ new Date()).toISOString()
	}).eq("id", data.requestId).select("id,user_id,status,admin_note").single();
	if (error) throw error;
	if (row.user_id) await supabaseAdmin.from("notifications").insert({
		user_id: row.user_id,
		title: "تحديث على طلب السنتر",
		body: data.adminNote?.trim() || ({
			new: "طلبك لسه جديد.",
			reviewing: "طلبك قيد المراجعة.",
			contacted: "تم التواصل بخصوص طلب السنتر.",
			approved: "تم قبول طلب السنتر.",
			rejected: "تم رفض طلب السنتر."
		}[data.status] ?? "تم تحديث حالة طلبك."),
		kind: "center_request",
		metadata: {
			center_request_id: row.id,
			status: data.status
		}
	});
	return row;
});
//#endregion
export { adminListCenterRequests_createServerFn_handler, adminUpdateCenterRequest_createServerFn_handler, listMyCenterRequests_createServerFn_handler, submitCenterRequest_createServerFn_handler };
