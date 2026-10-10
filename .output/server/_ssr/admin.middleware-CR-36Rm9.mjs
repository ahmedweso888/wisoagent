import { t as createMiddleware } from "./createMiddleware-B_4t7rW1.mjs";
import { n as requireSupabaseAuth } from "./auth-middleware-BgIfV4zI.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin.middleware-CR-36Rm9.js
var requireSupabaseAdmin = createMiddleware({ type: "function" }).middleware([requireSupabaseAuth]).server(async ({ next, context }) => {
	const { supabaseAdmin } = await import("./client.server-BlnvGJA3.mjs").then((n) => n.t).then((n) => n.t);
	const { data, error } = await supabaseAdmin.rpc("has_role", {
		_user_id: context.userId,
		_role: "admin"
	});
	if (error) {
		console.error("[AdminAuth] Failed to verify admin role:", error);
		throw new Error("Forbidden: Unable to verify administrator privileges");
	}
	if (data !== true) throw new Error("Forbidden: Administrator access required");
	return next({ context: {
		...context,
		isAdmin: true,
		adminId: context.userId
	} });
});
//#endregion
export { requireSupabaseAdmin as t };
