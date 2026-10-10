import { i as __toESM } from "../_runtime.mjs";
import { b as Navigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { F as adminReviewPayment, _ as adminGetPayments, g as adminGetPaymentProofUrl } from "./admin.functions-DKdO8Tg0.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { f as require_jsx_runtime } from "../_libs/@radix-ui/react-avatar+[...].mjs";
import { t as Button } from "./button-CAvS9N1W.mjs";
import { t as Skeleton } from "./skeleton-D9W9wFsj.mjs";
import { t as PageHeader } from "./PageHeader-DhP6ZZXs.mjs";
import { t as Badge } from "./badge-DovwySyz.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as useAuth } from "./useAuth-BO86jEMb.mjs";
import { t as EmptyState } from "./EmptyState-Dyw3WASN.mjs";
import { t as Input } from "./input-DC57PAAM.mjs";
import { F as ExternalLink, i as Wallet } from "../_libs/lucide-react.mjs";
import { i as TabsTrigger, r as TabsList, t as Tabs } from "./tabs-D54Z4YMT.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin.payments-CC6Nd28g.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var STATUS_LABEL = {
	pending: "قيد المراجعة",
	confirmed: "مقبول",
	rejected: "مرفوض"
};
var METHOD_LABEL = {
	vodafone_cash: "فودافون كاش",
	instapay: "إنستاباي"
};
function AdminPaymentsPage() {
	const { isAdmin } = useAuth();
	const qc = useQueryClient();
	const [filter, setFilter] = (0, import_react.useState)("pending");
	const [reasons, setReasons] = (0, import_react.useState)({});
	const query = useQuery({
		queryKey: [
			"admin",
			"payment-requests",
			filter
		],
		enabled: isAdmin,
		queryFn: async () => {
			return adminGetPayments({ data: { status: filter } });
		}
	});
	const review = useMutation({
		mutationFn: async (params) => {
			await adminReviewPayment({ data: {
				request: params.id,
				approve: params.approve,
				...params.reason === void 0 ? {} : { reason: params.reason }
			} });
		},
		onSuccess: (_data, vars) => {
			toast.success(vars.approve ? "تم قبول الطلب" : "تم رفض الطلب");
			qc.invalidateQueries({ queryKey: ["admin", "payment-requests"] });
		},
		onError: (e) => toast.error(e.message === "forbidden" ? "هذه العملية للمشرفين فقط" : e.message)
	});
	if (!isAdmin) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, { to: "/dashboard" });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		dir: "rtl",
		className: "page-shell",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				title: "طلبات الدفع",
				subtitle: "مراجعة إثباتات التحويل وقبول أو رفض طلبات الدفع."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tabs, {
				value: filter,
				onValueChange: (v) => setFilter(v),
				className: "mt-6",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
						value: "pending",
						children: "قيد المراجعة"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
						value: "confirmed",
						children: "مقبولة"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
						value: "rejected",
						children: "مرفوضة"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
						value: "all",
						children: "الكل"
					})
				] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-6 space-y-4",
				children: query.isPending ? Array.from({ length: 4 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-28 w-full" }, i)) : query.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-destructive",
					children: query.error instanceof Error && query.error.message === "forbidden" ? "هذه الصفحة متاحة للمشرفين فقط." : "تعذّر تحميل طلبات الدفع."
				}) : !query.data || query.data.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
					icon: Wallet,
					title: "لا توجد طلبات دفع",
					description: "لا توجد طلبات في هذا التصنيف حالياً."
				}) : query.data.map((item) => {
					const plan = item.subscription_plans;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "surface-panel space-y-3 p-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap items-start justify-between gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "font-semibold",
									children: [
										plan?.name_ar ?? "باقة غير محددة",
										" — ",
										item.amount_egp,
										" ج.م"
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-1 text-xs text-muted-foreground",
									children: [
										"طريقة الدفع: ",
										METHOD_LABEL[item.method] ?? item.method,
										" ·",
										" ",
										new Date(item.created_at).toLocaleString("ar-EG")
									]
								})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: item.status === "confirmed" ? "default" : item.status === "rejected" ? "destructive" : "secondary",
									children: STATUS_LABEL[item.status] ?? item.status
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid gap-2 text-sm sm:grid-cols-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-muted-foreground",
									children: "رقم العملية: "
								}), item.transaction_number || "—"] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-muted-foreground",
									children: "رقم المُرسِل: "
								}), item.sender_number || "—"] })]
							}),
							item.screenshot_path ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								className: "inline-flex items-center gap-1 text-sm text-primary hover:underline",
								onClick: async () => {
									try {
										if (!item.screenshot_path) {
											toast.error("لا توجد صورة إثبات دفع");
											return;
										}
										const url = await adminGetPaymentProofUrl({ data: { path: item.screenshot_path } });
										window.open(url, "_blank", "noopener,noreferrer");
									} catch (error) {
										toast.error(error instanceof Error ? error.message : "تعذر فتح الإثبات");
									}
								},
								children: ["عرض إثبات التحويل", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "size-3.5" })]
							}) : null,
							item.status === "rejected" && item.reject_reason ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs text-destructive",
								children: ["سبب الرفض: ", item.reject_reason]
							}) : null,
							item.status === "pending" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap items-center gap-2 border-t border-border pt-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										disabled: review.isPending,
										onClick: () => review.mutate({
											id: item.id,
											approve: true
										}),
										children: "قبول"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										value: reasons[item.id] ?? "",
										onChange: (e) => setReasons((v) => ({
											...v,
											[item.id]: e.target.value
										})),
										placeholder: "سبب الرفض (مطلوب)",
										className: "w-64"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: "destructive",
										disabled: review.isPending || !reasons[item.id]?.trim(),
										onClick: () => review.mutate({
											id: item.id,
											approve: false,
											reason: reasons[item.id]?.trim()
										}),
										children: "رفض"
									})
								]
							}) : null
						]
					}, item.id);
				})
			})
		]
	});
}
//#endregion
export { AdminPaymentsPage as component };
