import { i as __toESM } from "../_runtime.mjs";
import { b as Navigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { I as adminReviewSpecialRequest, w as adminGetSpecialRequests } from "./admin.functions-DKdO8Tg0.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { f as require_jsx_runtime } from "../_libs/@radix-ui/react-avatar+[...].mjs";
import { t as Button } from "./button-CAvS9N1W.mjs";
import { t as Label } from "./label-DBD1bRRP.mjs";
import { t as Skeleton } from "./skeleton-D9W9wFsj.mjs";
import { t as PageHeader } from "./PageHeader-DhP6ZZXs.mjs";
import { t as Badge } from "./badge-DovwySyz.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as useAuth } from "./useAuth-BO86jEMb.mjs";
import { t as EmptyState } from "./EmptyState-Dyw3WASN.mjs";
import { t as Input } from "./input-DC57PAAM.mjs";
import { N as FileClock } from "../_libs/lucide-react.mjs";
import { t as Textarea } from "./textarea-DorwVIRG.mjs";
import { n as CardContent, t as Card } from "./card-BcujUCMc.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin.requests-BFboyxVr.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AdminRequestsPage() {
	const { isAdmin } = useAuth();
	const qc = useQueryClient();
	const [note, setNote] = (0, import_react.useState)({});
	const [price, setPrice] = (0, import_react.useState)({});
	const requests = useQuery({
		queryKey: ["admin-special-requests"],
		enabled: isAdmin,
		queryFn: async () => {
			return adminGetSpecialRequests();
		}
	});
	const review = useMutation({
		mutationFn: async ({ id, status }) => {
			await adminReviewSpecialRequest({ data: {
				request: id,
				status,
				...price[id] ? { priceEgp: Number(price[id]) } : {},
				...note[id] ? { adminNote: note[id] } : {}
			} });
		},
		onSuccess: () => {
			toast.success("تم تحديث الطلب وإبلاغ الطالب.");
			qc.invalidateQueries({ queryKey: ["admin-special-requests"] });
		},
		onError: (e) => toast.error(e.message)
	});
	if (!isAdmin) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, { to: "/dashboard" });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		dir: "rtl",
		className: "page-shell",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			title: "الطلبات الخاصة",
			subtitle: "مراجعة وقبول أو رفض الطلبات المرفقة بملفات خاصة."
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-7 space-y-4",
			children: requests.isPending ? Array.from({ length: 3 }).map((_, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-44 w-full" }, index)) : requests.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-destructive",
				children: "تعذّر تحميل الطلبات."
			}) : requests.data?.length ? requests.data.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "space-y-4 p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-start justify-between gap-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "font-semibold",
								children: item.title
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 whitespace-pre-wrap text-sm text-muted-foreground",
								children: item.details
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-2 text-xs text-muted-foreground",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										variant: item.status === "rejected" ? "destructive" : item.status === "pending" ? "secondary" : "default",
										children: item.status === "pending" ? "قيد المراجعة" : item.status === "accepted" ? "مقبول" : item.status === "completed" ? "مكتمل" : "مرفوض"
									}),
									" ",
									"· ",
									new Date(item.created_at).toLocaleString("ar-EG")
								]
							})
						] }), item.file_path ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs text-primary",
							children: "يوجد ملف مرفق"
						}) : null]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-3 sm:grid-cols-[1fr_180px]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "ملاحظة للطالب" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
							className: "mt-2",
							value: note[item.id] ?? item.admin_note ?? "",
							onChange: (e) => setNote((v) => ({
								...v,
								[item.id]: e.target.value
							}))
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "السعر (اختياري)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							className: "mt-2",
							type: "number",
							min: "0",
							value: price[item.id] ?? item.price_egp ?? "",
							onChange: (e) => setPrice((v) => ({
								...v,
								[item.id]: e.target.value
							}))
						})] })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								disabled: review.isPending,
								onClick: () => review.mutate({
									id: item.id,
									status: "accepted"
								}),
								children: "قبول"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "outline",
								disabled: review.isPending,
								onClick: () => review.mutate({
									id: item.id,
									status: "completed"
								}),
								children: "تم التنفيذ"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "destructive",
								disabled: review.isPending,
								onClick: () => review.mutate({
									id: item.id,
									status: "rejected"
								}),
								children: "رفض"
							})
						]
					})
				]
			}) }, item.id)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
				icon: FileClock,
				title: "مفيش طلبات حالياً",
				description: "الطلبات الجديدة هتظهر هنا أول ما الطلاب يبعتوها."
			})
		})]
	});
}
//#endregion
export { AdminRequestsPage as component };
