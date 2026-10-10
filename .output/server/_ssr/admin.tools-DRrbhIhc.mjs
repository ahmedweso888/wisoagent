import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { f as require_jsx_runtime } from "../_libs/@radix-ui/react-avatar+[...].mjs";
import { t as Button } from "./button-CAvS9N1W.mjs";
import { t as PageHeader } from "./PageHeader-DhP6ZZXs.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { N as ExternalLink, m as ShieldCheck, r as Wrench } from "../_libs/lucide-react.mjs";
import { i as CardTitle, n as CardContent, r as CardHeader, t as Card } from "./card-BcujUCMc.mjs";
import { i as adminReviewToolOrderRequest, l as getToolCatalogFn, n as adminGetToolOrders, r as adminGetToolPaymentProofUrl, t as adminGetToolJobs } from "./wiso-tools.functions-D0SxEpcH.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin.tools-DRrbhIhc.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AdminToolsPage() {
	const qc = useQueryClient();
	const [filter, setFilter] = (0, import_react.useState)("pending");
	const orders = useQuery({
		queryKey: ["admin-tool-orders", filter],
		queryFn: () => adminGetToolOrders({ data: { status: filter } })
	});
	const jobs = useQuery({
		queryKey: ["admin-tool-jobs"],
		queryFn: () => adminGetToolJobs()
	});
	const catalog = useQuery({
		queryKey: ["wiso-tools-catalog"],
		queryFn: () => getToolCatalogFn()
	});
	const review = useMutation({
		mutationFn: (input) => adminReviewToolOrderRequest({ data: input }),
		onSuccess: async () => {
			toast.success("تم تحديث طلب الأداة.");
			await qc.invalidateQueries({ queryKey: ["admin-tool-orders"] });
		},
		onError: (error) => toast.error(error.message)
	});
	const proof = useMutation({
		mutationFn: (path) => adminGetToolPaymentProofUrl({ data: { path } }),
		onSuccess: (data) => window.open(data.url, "_blank", "noopener,noreferrer"),
		onError: (error) => toast.error(error.message)
	});
	const productName = (key) => catalog.data?.products.find((item) => item.key === key)?.name ?? key;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		dir: "rtl",
		className: "page-shell",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				title: "أدوات WISO — الإدارة",
				subtitle: "طلبات الدفع، تفعيل الأدوات، وحالة Jobs القادمة من Python."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-7 grid gap-4 md:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
						className: "p-5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground",
							children: "طلبات قيد المراجعة"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-3xl font-bold",
							children: (orders.data ?? []).filter((item) => item.status === "pending").length
						})]
					}) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
						className: "p-5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground",
							children: "Jobs نشطة"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-3xl font-bold",
							children: (jobs.data ?? []).filter((item) => ["queued", "in_progress"].includes(item.status)).length
						})]
					}) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
						className: "p-5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground",
							children: "Jobs مكتملة/فاشلة"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-3xl font-bold",
							children: (jobs.data ?? []).filter((item) => [
								"completed",
								"completed_with_errors",
								"failed",
								"stopped"
							].includes(item.status)).length
						})]
					}) })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "mt-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wrench, { className: "size-5" }), " طلبات أدوات WISO"]
				}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "space-y-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex flex-wrap gap-2",
							children: [
								"pending",
								"confirmed",
								"rejected",
								"all"
							].map((value) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: filter === value ? "default" : "outline",
								onClick: () => setFilter(value),
								children: value === "pending" ? "قيد المراجعة" : value === "confirmed" ? "مقبولة" : value === "rejected" ? "مرفوضة" : "الكل"
							}, value))
						}),
						(orders.data ?? []).map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-2xl border p-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap items-start justify-between gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "font-semibold",
										children: [
											productName(item.product_key),
											" · ",
											item.amount_egp,
											" ج.م"
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-1 text-sm text-muted-foreground",
										children: ["الطالب: ", item.user_id]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-1 text-sm text-muted-foreground",
										children: [
											"الطريقة: ",
											item.method,
											" · الرقم: ",
											item.sender_number
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-xs text-muted-foreground",
										children: new Date(item.created_at).toLocaleString("ar-EG")
									})
								] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "rounded-full bg-muted px-3 py-1 text-xs",
									children: item.status === "pending" ? "قيد المراجعة" : item.status === "confirmed" ? "مقبول" : "مرفوض"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-4 flex flex-wrap gap-2",
								children: [item.screenshot_path ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "outline",
									size: "sm",
									onClick: () => proof.mutate(item.screenshot_path),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "size-4" }), " فتح Screenshot"]
								}) : null, item.status === "pending" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									onClick: () => review.mutate({
										orderId: item.id,
										approve: true
									}),
									disabled: review.isPending,
									children: "Approve + تفعيل"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: "destructive",
									onClick: () => {
										const reason = window.prompt("سبب الرفض (اختياري):") ?? void 0;
										review.mutate({
											orderId: item.id,
											approve: false,
											reason
										});
									},
									disabled: review.isPending,
									children: "Reject"
								})] }) : null]
							})]
						}, item.id)),
						!orders.data?.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "py-6 text-sm text-muted-foreground",
							children: "لا توجد طلبات في هذا التصنيف."
						}) : null
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "mt-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "size-5" }), " Tool Jobs"]
				}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
					className: "space-y-2",
					children: (jobs.data ?? []).slice(0, 20).map((job) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
							productName(job.tool_key),
							" · ",
							job.python_request_id
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "rounded-full bg-muted px-3 py-1",
							children: job.status
						})]
					}, job.id))
				})]
			})
		]
	});
}
//#endregion
export { AdminToolsPage as component };
