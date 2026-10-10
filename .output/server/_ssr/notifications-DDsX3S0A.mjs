import { f as require_jsx_runtime } from "../_libs/@radix-ui/react-avatar+[...].mjs";
import { t as Button } from "./button-CAvS9N1W.mjs";
import { t as PageHeader } from "./PageHeader-DhP6ZZXs.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { t as supabase } from "./client-DIXqhfAR.mjs";
import { K as CheckCheck, Q as Bell } from "../_libs/lucide-react.mjs";
import { n as CardContent, t as Card } from "./card-BcujUCMc.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/notifications-DDsX3S0A.js
var import_jsx_runtime = require_jsx_runtime();
function NotificationsPage() {
	const qc = useQueryClient();
	const notifications = useQuery({
		queryKey: ["notifications"],
		queryFn: async () => {
			const { data, error } = await supabase.from("notifications").select("*").order("created_at", { ascending: false });
			if (error) throw error;
			return data;
		}
	});
	const markRead = useMutation({
		mutationFn: async (id) => {
			const { error } = await supabase.from("notifications").update({ read_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", id);
			if (error) throw error;
		},
		onSuccess: () => void qc.invalidateQueries({ queryKey: ["notifications"] })
	});
	const readAll = useMutation({
		mutationFn: async () => {
			const { error } = await supabase.from("notifications").update({ read_at: (/* @__PURE__ */ new Date()).toISOString() }).is("read_at", null);
			if (error) throw error;
		},
		onSuccess: () => void qc.invalidateQueries({ queryKey: ["notifications"] })
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		dir: "rtl",
		className: "page-shell max-w-5xl",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			title: "الإشعارات",
			subtitle: "كل ما يخص خطتك وطلباتك في مكان واحد.",
			actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				variant: "outline",
				size: "sm",
				onClick: () => readAll.mutate(),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckCheck, { className: "size-4" }), "علّم الكل مقروء"]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-6 space-y-3",
			children: notifications.data?.length ? notifications.data.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
				className: item.read_at ? "opacity-70" : "border-primary/40",
				onClick: () => !item.read_at && markRead.mutate(item.id),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "flex cursor-pointer gap-3 p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "mt-0.5 size-5 shrink-0 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-semibold",
							children: item.title
						}),
						item.body ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-muted-foreground",
							children: item.body
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-xs text-muted-foreground",
							children: new Date(item.created_at).toLocaleString("ar-EG")
						})
					] })]
				})
			}, item.id)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "py-12 text-center text-muted-foreground",
				children: "مفيش إشعارات جديدة."
			})
		})]
	});
}
//#endregion
export { NotificationsPage as component };
