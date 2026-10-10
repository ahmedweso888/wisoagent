import { t as getRequest } from "./request-response-B7GxCXoC.mjs";
import { t as createClient } from "../_libs/supabase__supabase-js.mjs";
import { t as __exportAll } from "./rolldown-runtime-D7D4PA-g.mjs";
import processModule from "node:process";
//#region node_modules/.nitro/vite/services/ssr/assets/user-client.server-Bgk04puY.js
/**
* Request-scoped Supabase client that acts AS the signed-in student.
*
* Server-side modules (credits, engine) must never use the browser client:
* inside a server function there is no browser session, so `auth.uid()` would
* be NULL and every RLS/RPC check would fail. This builds a client from the
* incoming Authorization header instead.
*/
var user_client_server_exports = /* @__PURE__ */ __exportAll({ getUserSupabase: () => getUserSupabase });
function getUserSupabase() {
	const url = processModule.env["SUPABASE_URL"];
	const key = processModule.env["SUPABASE_PUBLISHABLE_KEY"];
	if (!url || !key) throw new Error("Supabase environment variables are missing.");
	const authHeader = getRequest()?.headers?.get("authorization");
	if (!authHeader?.startsWith("Bearer ")) throw new Error("Unauthorized: missing bearer token");
	return createClient(url, key, {
		global: {
			headers: { Authorization: authHeader },
			fetch: (input, init) => {
				const headers = new Headers(init?.headers);
				headers.set("apikey", key);
				headers.set("Authorization", authHeader);
				return fetch(input, {
					...init,
					headers
				});
			}
		},
		auth: {
			persistSession: false,
			autoRefreshToken: false
		}
	});
}
//#endregion
export { user_client_server_exports as n, getUserSupabase as t };
