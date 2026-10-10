import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { f as require_jsx_runtime } from "../_libs/@radix-ui/react-avatar+[...].mjs";
import { i as useQueryClient, n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { t as supabase } from "./client-DIXqhfAR.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/useAuth-BO86jEMb.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
* Session state. `supabase.auth.getUser()` re-validates with the auth server,
* so it is the trusted identity source; the session is only used for tokens.
*/
function useSession() {
	const queryClient = useQueryClient();
	const [session, setSession] = (0, import_react.useState)(null);
	const [user, setUser] = (0, import_react.useState)(null);
	const [ready, setReady] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		let active = true;
		const { data: sub } = supabase.auth.onAuthStateChange((event, nextSession) => {
			if (!active) return;
			setSession(nextSession);
			setUser(nextSession?.user ?? null);
			if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") {
				queryClient.invalidateQueries({ queryKey: ["profile"] });
				queryClient.invalidateQueries({ queryKey: ["access"] });
			}
		});
		supabase.auth.getSession().then(({ data }) => {
			if (!active) return;
			setSession(data.session);
			setUser(data.session?.user ?? null);
			setReady(true);
		});
		return () => {
			active = false;
			sub.subscription.unsubscribe();
		};
	}, [queryClient]);
	return {
		session,
		user,
		ready
	};
}
/** Ensures the profile row (and its immutable public user_code) exists. */
function useProfile(userId) {
	return useQuery({
		queryKey: ["profile", userId],
		enabled: Boolean(userId),
		staleTime: 3e4,
		queryFn: async () => {
			const { data, error } = await supabase.rpc("ensure_profile", {});
			if (error) throw error;
			return data ?? null;
		}
	});
}
/**
* The single source of truth for platform access. Computed server side by the
* `access_state` database function — never from local timers or storage.
*/
function useAccess(userId) {
	return useQuery({
		queryKey: ["access", userId],
		enabled: Boolean(userId),
		refetchInterval: 6e4,
		refetchOnWindowFocus: true,
		queryFn: async () => {
			const { data, error } = await supabase.rpc("access_state", { _user_id: userId });
			if (error) throw error;
			return data;
		}
	});
}
function useIsAdmin(userId) {
	return useQuery({
		queryKey: ["is-admin", userId],
		enabled: Boolean(userId),
		staleTime: 6e4,
		queryFn: async () => {
			const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").maybeSingle();
			if (error) throw error;
			return Boolean(data);
		}
	});
}
async function signOutEverywhere(queryClient) {
	await queryClient.cancelQueries();
	queryClient.clear();
	await supabase.auth.signOut();
}
var AuthContext = (0, import_react.createContext)(null);
function AuthProvider({ children }) {
	const queryClient = useQueryClient();
	const { session, user, ready } = useSession();
	const profileQuery = useProfile(user?.id);
	const accessQuery = useAccess(user?.id);
	const adminQuery = useIsAdmin(user?.id);
	const value = (0, import_react.useMemo)(() => ({
		session,
		user,
		profile: profileQuery.data ?? null,
		access: accessQuery.data ?? null,
		isAdmin: adminQuery.data ?? false,
		isAuthenticated: Boolean(user),
		loading: !ready || Boolean(user) && (profileQuery.isPending || accessQuery.isPending),
		signOut: () => signOutEverywhere(queryClient)
	}), [
		session,
		user,
		ready,
		profileQuery.data,
		profileQuery.isPending,
		accessQuery.data,
		accessQuery.isPending,
		adminQuery.data,
		queryClient
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthContext.Provider, {
		value,
		children
	});
}
function useAuth() {
	const ctx = (0, import_react.useContext)(AuthContext);
	if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
	return ctx;
}
//#endregion
export { useAuth as n, AuthProvider as t };
