import { g as Navigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { f as require_jsx_runtime } from "../_libs/@radix-ui/react-avatar+[...].mjs";
import { t as Button } from "./button-CAvS9N1W.mjs";
import { t as PageHeader } from "./PageHeader-DhP6ZZXs.mjs";
import { t as Badge } from "./badge-DovwySyz.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as useAuth } from "./useAuth-BO86jEMb.mjs";
import { J as Building2 } from "../_libs/lucide-react.mjs";
import { t as Textarea } from "./textarea-DorwVIRG.mjs";
import { n as adminUpdateCenterRequest, t as adminListCenterRequests } from "./center-request2.functions-BoK7JwWK.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin.center-requests-t6TdpMSh.js
var import_jsx_runtime = require_jsx_runtime();
var statuses = [
	["new", "جديد"],
	["reviewing", "قيد المراجعة"],
	["contacted", "تم التواصل"],
	["approved", "مقبول"],
	["rejected", "مرفوض"]
];
function AdminCenterRequestsPage() {
	const { isAdmin } = useAuth();
	const qc = useQueryClient();
	const query = useQuery({
		queryKey: ["admin-center-requests"],
		enabled: isAdmin,
		queryFn: () => adminListCenterRequests()
	});
	const update = useMutation({
		mutationFn: (input) => adminUpdateCenterRequest({ data: input }),
		onSuccess: () => {
			toast.success("تم تحديث الطلب.");
			qc.invalidateQueries({ queryKey: ["admin-center-requests"] });
		},
		onError: (error) => toast.error(error.message)
	});
	if (!isAdmin) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, { to: "/dashboard" });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		dir: "rtl",
		className: "page-shell",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			title: "طلبات السناتر",
			subtitle: "مراجعة طلبات التعاون المقدمة من الطلاب والمستخدمين."
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-7 space-y-4",
			children: [(query.data ?? []).map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RequestCard, {
				item,
				disabled: update.isPending,
				onUpdate: (status, note) => update.mutate({
					requestId: item.id,
					status,
					adminNote: note
				})
			}, item.id)), !query.isPending && !query.data?.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "py-10 text-center text-sm text-muted-foreground",
				children: "لا توجد طلبات حاليًا."
			}) : null]
		})]
	});
}
function RequestCard({ item, disabled, onUpdate }) {
	const statusLabel = statuses.find(([key]) => key === item.status)?.[1] ?? item.status;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "surface-panel p-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-wrap items-start justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
					className: "flex items-center gap-2 font-display font-semibold",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building2, { className: "size-4" }), item.center_name]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: item.center_address
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-1 text-sm text-muted-foreground",
					children: ["التواصل: ", item.contact_number]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-1 text-xs text-muted-foreground",
					children: [
						"المستخدم: ",
						item.user_id ?? "—",
						" · ",
						new Date(item.created_at).toLocaleString("ar-EG")
					]
				})
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: statusLabel })]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 space-y-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
				defaultValue: item.admin_note ?? "",
				placeholder: "ملاحظة للطالب...",
				id: `note-${item.id}`
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-wrap gap-2",
				children: statuses.map(([key, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: item.status === key ? "default" : "outline",
					disabled,
					onClick: () => {
						onUpdate(key, document.getElementById(`note-${item.id}`)?.value ?? "");
					},
					children: label
				}, key))
			})]
		})]
	});
}
//#endregion
export { AdminCenterRequestsPage as component };
