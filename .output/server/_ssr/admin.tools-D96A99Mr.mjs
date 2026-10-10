import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { f as require_jsx_runtime } from "../_libs/@radix-ui/react-avatar+[...].mjs";
import { t as Button } from "./button-CAvS9N1W.mjs";
import { t as PageHeader } from "./PageHeader-DhP6ZZXs.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { F as ExternalLink, V as CircleCheck, k as KeyRound, r as Wrench } from "../_libs/lucide-react.mjs";
import { i as CardTitle, n as CardContent, r as CardHeader, t as Card } from "./card-BcujUCMc.mjs";
import { a as adminRevealToolCredentials, i as adminListToolAccounts, n as adminGetToolOrders, o as adminReviewToolOrderRequest, r as adminGetToolPaymentProofUrl, t as adminCompleteToolAccount, u as getToolCatalogFn } from "./wiso-tools.functions-CHro184D.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin.tools-D96A99Mr.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AdminToolsPage() {
	const qc = useQueryClient();
	const [filter, setFilter] = (0, import_react.useState)("pending");
	const orders = useQuery({
		queryKey: ["admin-tool-orders", filter],
		queryFn: () => adminGetToolOrders({ data: { status: filter } })
	});
	const accounts = useQuery({
		queryKey: ["admin-tool-accounts"],
		queryFn: () => adminListToolAccounts()
	});
	const [revealed, setRevealed] = (0, import_react.useState)({});
	const reveal = useMutation({
		mutationFn: (accountId) => adminRevealToolCredentials({ data: { accountId } }),
		onSuccess: (data, accountId) => setRevealed((current) => ({
			...current,
			[accountId]: data
		})),
		onError: (error) => toast.error(error.message)
	});
	const catalog = useQuery({
		queryKey: ["wiso-tools-catalog"],
		queryFn: () => getToolCatalogFn()
	});
	const completeAccount = useMutation({
		mutationFn: (accountId) => adminCompleteToolAccount({ data: { accountId } }),
		onSuccess: async () => {
			toast.success("تم إكمال الطلب وإرسال إشعار للطالب، وتمت إزالته من قائمة الأدمن.");
			setRevealed({});
			await Promise.all([qc.invalidateQueries({ queryKey: ["admin-tool-accounts"] }), qc.invalidateQueries({ queryKey: ["notifications"] })]);
		},
		onError: (error) => toast.error(error.message)
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
				subtitle: "طلبات الدفع وبيانات حسابات الأدوات التي أرسلها الطلاب للتشغيل المحلي."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-7 grid gap-4 md:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "p-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: "طلبات قيد المراجعة"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-3xl font-bold",
						children: (orders.data ?? []).filter((item) => item.status === "pending").length
					})]
				}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "p-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: "حسابات الأدوات المستلمة"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-3xl font-bold",
						children: (accounts.data ?? []).length
					})]
				}) })]
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
										const reason = window.prompt("سبب الرفض (اختياري):");
										review.mutate({
											orderId: item.id,
											approve: false,
											...reason ? { reason } : {}
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
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyRound, { className: "size-5" }), " حسابات الأدوات للتشغيل المحلي"]
				}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "space-y-3",
					children: [(accounts.data ?? []).map((account) => {
						const credentials = revealed[account.id];
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-xl border p-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap items-center justify-between gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "font-semibold",
										children: account.tool_key === "qureo" ? "Qureo" : "SPRIX / الثقافة المالية"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-xs text-muted-foreground",
										children: ["User ID: ", account.user_id]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-xs text-muted-foreground",
										children: ["آخر تحديث: ", new Date(account.updated_at).toLocaleString("ar-EG")]
									})
								] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-wrap gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: "outline",
										disabled: reveal.isPending || completeAccount.isPending,
										onClick: () => reveal.mutate(account.id),
										children: credentials ? "تحديث عرض البيانات" : "عرض بيانات الدخول"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										size: "sm",
										disabled: completeAccount.isPending,
										onClick: () => {
											const label = account.tool_key === "qureo" ? "Qureo" : "SPRIX / الثقافة المالية";
											if (window.confirm(`تأكيد إكمال طلب ${label}؟ سيتم إرسال إشعار للطالب وإخفاء الطلب من قائمة الأدمن.`)) completeAccount.mutate(account.id);
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-4" }), " تم الحل"]
									})]
								})]
							}), credentials ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-3 space-y-2 rounded-lg bg-muted p-3 text-sm",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										dir: "ltr",
										children: ["ID: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "select-all",
											children: credentials.id
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										dir: "ltr",
										children: ["Password: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "select-all",
											children: credentials.password
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex gap-2",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												size: "sm",
												variant: "outline",
												onClick: () => navigator.clipboard.writeText(credentials.id),
												children: "نسخ ID"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												size: "sm",
												variant: "outline",
												onClick: () => navigator.clipboard.writeText(credentials.password),
												children: "نسخ Password"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												size: "sm",
												variant: "ghost",
												onClick: () => setRevealed((current) => {
													const next = { ...current };
													delete next[account.id];
													return next;
												}),
												children: "إخفاء"
											})
										]
									})
								]
							}) : null]
						}, account.id);
					}), !accounts.data?.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "py-6 text-sm text-muted-foreground",
						children: "لا توجد حسابات أدوات مستلمة حتى الآن."
					}) : null]
				})]
			})
		]
	});
}
//#endregion
export { AdminToolsPage as component };
