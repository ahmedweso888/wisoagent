import { i as __toESM } from "../_runtime.mjs";
import { c as createServerFn } from "./createServerFn-CIHAFgYl.mjs";
import { n as requireSupabaseAuth } from "./auth-middleware-BgIfV4zI.mjs";
import { t as createSsrRpc } from "./createSsrRpc-lwvUPFNu.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { f as require_jsx_runtime } from "../_libs/@radix-ui/react-avatar+[...].mjs";
import { t as Button } from "./button-CAvS9N1W.mjs";
import { t as PageHeader } from "./PageHeader-DhP6ZZXs.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { N as ExternalLink, _ as RefreshCw, i as Wallet, m as ShieldCheck } from "../_libs/lucide-react.mjs";
import { t as requireSupabaseAdmin } from "./admin.middleware-CR-36Rm9.mjs";
import { i as CardTitle, n as CardContent, r as CardHeader, t as Card } from "./card-BcujUCMc.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin.sprix-D6aVDAsQ.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input) => {
	if (!input.username.trim() || !input.password) throw new Error("بيانات تسجيل الدخول غير مكتملة.");
	if (input.username.length > 200 || input.password.length > 500) throw new Error("بيانات تسجيل الدخول غير صالحة.");
	return {
		username: input.username.trim(),
		password: input.password
	};
}).handler(createSsrRpc("eedcde931feebc7851367ffe057ce1946d7255e2df801f0dbd89a50762eeff64"));
createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(createSsrRpc("73cdc2b86874b90bd6fbc359294044e81401e768392f4eb3e338635853182d15"));
createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).handler(createSsrRpc("3e2fa6e6df61e958cc3443481f3495da86d3b21e1007e92e456c71f75635cd12"));
createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).inputValidator((input) => input).handler(createSsrRpc("0b5e6b7c66da588a80457777a2097a9c698383feafe27fdf07b10dc0722063c3"));
createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(createSsrRpc("6bea6fcc05dc912a368ea2a6eda7156e55e9f27429ce73f6c0f2f43d0d9eaca2"));
createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input) => input).handler(createSsrRpc("9a68af5444f9f04d740ac947d27a5156fdd29c2854234f51c8fb3b192aa096de"));
var adminListSprixQuestions = createServerFn({ method: "GET" }).middleware([requireSupabaseAdmin]).handler(createSsrRpc("fe6267f3693cbdceb69f8991fedd0a010c5ce6ef4ed7488a1cbd8d9e0ec2e4bd"));
createServerFn({ method: "POST" }).middleware([requireSupabaseAdmin]).inputValidator((input) => input).handler(createSsrRpc("d333b4a17ffb9d4bac1334fec2ca32ab6da403aba04ebe8c7021c330baaa06b8"));
var adminListSprixRuns = createServerFn({ method: "GET" }).middleware([requireSupabaseAdmin]).handler(createSsrRpc("69f6670bf4566e8321d35ba4ff1eed16afd59e2cefcc93cf14e32868858e583f"));
var adminClaimAndRunNextSprixJob = createServerFn({ method: "POST" }).middleware([requireSupabaseAdmin]).handler(createSsrRpc("9b00ddbb0f8f626bb02d55f6eb732e62a9da94ff611316786d40083af020f28d"));
createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(createSsrRpc("ee02f55ae6572aeace10f78b5677c00716ad801b2a560f42042ab52169578abb"));
createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input) => input).handler(createSsrRpc("db72eef589297bf3de6e6e8593aa5009bce681663902903775b35a02265110cd"));
createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(createSsrRpc("0bcd1eaf2e5301c7840435120b55c52c8069603e6c167a6462c891ac79f92c7f"));
createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(createSsrRpc("c2abf42f6896d5ced8e89834ffcaba1a7c08fc42ceadd4128c8e767a50abbc82"));
var adminListSprixPayments = createServerFn({ method: "GET" }).middleware([requireSupabaseAdmin]).inputValidator((input) => input).handler(createSsrRpc("85d5bc3fded16b19862db4b315c34ab56552c0951e275aa68bdb380787558e7e"));
var adminReviewSprixPaymentRequest = createServerFn({ method: "POST" }).middleware([requireSupabaseAdmin]).inputValidator((input) => input).handler(createSsrRpc("e8fe93c2a7d4bb880c48a0bb0fd35ee605c973fdae2b4cec5922b79a4cf1103a"));
var adminGetSprixPaymentProofUrl = createServerFn({ method: "GET" }).middleware([requireSupabaseAdmin]).inputValidator((input) => input).handler(createSsrRpc("9deda1feaa4bf07392129ccf7c0adae35cfb323cf00fa446fe37814cb751d8bc"));
function AdminSprixPage() {
	const client = useQueryClient();
	const [filter, setFilter] = (0, import_react.useState)("pending");
	const questions = useQuery({
		queryKey: ["admin-sprix-questions"],
		queryFn: () => adminListSprixQuestions()
	});
	const runs = useQuery({
		queryKey: ["admin-sprix-runs"],
		queryFn: () => adminListSprixRuns()
	});
	const payments = useQuery({
		queryKey: ["admin-sprix-payments", filter],
		queryFn: () => adminListSprixPayments({ data: { status: filter } })
	});
	const worker = useMutation({
		mutationFn: () => adminClaimAndRunNextSprixJob(),
		onSuccess: () => {
			client.invalidateQueries({ queryKey: ["admin-sprix-runs"] });
		}
	});
	const review = useMutation({
		mutationFn: (input) => adminReviewSprixPaymentRequest({ data: input }),
		onSuccess: () => {
			toast.success("تم تحديث طلب الدفع");
			client.invalidateQueries({ queryKey: ["admin-sprix-payments"] });
		},
		onError: (e) => toast.error(e.message)
	});
	const proof = useMutation({
		mutationFn: (path) => adminGetSprixPaymentProofUrl({ data: { path } }),
		onSuccess: (data) => window.open(data.url, "_blank", "noopener,noreferrer")
	});
	const verified = (questions.data ?? []).filter((q) => q.verification_status === "verified").length;
	const unresolved = (questions.data ?? []).filter((q) => q.verification_status === "unresolved").length;
	const failed = (runs.data ?? []).filter((r) => r.status === "failed").length;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		dir: "rtl",
		className: "page-shell",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				title: "SPRIX Agent — الإدارة",
				subtitle: "طلبات الدفع، بنك الإجابات والتنفيذات."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-7 grid gap-4 md:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
						className: "p-5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground",
							children: "إجابات موثقة"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-3xl font-bold",
							children: verified
						})]
					}) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
						className: "p-5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground",
							children: "أسئلة تحتاج مراجعة"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-3xl font-bold",
							children: unresolved
						})]
					}) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
						className: "p-5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground",
							children: "تنفيذات فاشلة"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-3xl font-bold",
							children: failed
						})]
					}) })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "mt-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wallet, { className: "size-5" }), " طلبات الدفع الخاصة بـ SPRIX Agent"]
				}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "space-y-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-wrap gap-2",
						children: [
							"pending",
							"confirmed",
							"rejected",
							"all"
						].map((value) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: filter === value ? "default" : "outline",
							size: "sm",
							onClick: () => setFilter(value),
							children: value === "pending" ? "قيد المراجعة" : value === "confirmed" ? "مقبولة" : value === "rejected" ? "مرفوضة" : "الكل"
						}, value))
					}), (payments.data ?? []).length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "py-6 text-sm text-muted-foreground",
						children: "لا توجد طلبات دفع في هذا التصنيف."
					}) : (payments.data ?? []).map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-xl border p-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-start justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "font-semibold",
									children: [
										item.amount_egp,
										" ج.م · ",
										item.method === "instapay" ? "إنستاباي" : "فودافون كاش"
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-1 text-sm text-muted-foreground",
									children: [
										"رقم التحويل: ",
										item.sender_number,
										" · المستخدم: ",
										item.user_id
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
								disabled: proof.isPending,
								onClick: () => proof.mutate(item.screenshot_path),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "size-4" }), " فتح صورة التحويل"]
							}) : null, item.status === "pending" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								onClick: () => review.mutate({
									paymentId: item.id,
									approve: true
								}),
								disabled: review.isPending,
								children: "اعتماد وتفعيل SPRIX"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "destructive",
								onClick: () => review.mutate({
									paymentId: item.id,
									approve: false
								}),
								disabled: review.isPending,
								children: "رفض"
							})] }) : null]
						})]
					}, item.id))]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "mt-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "size-5" }), " العامل"]
				}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					onClick: () => worker.mutate(),
					disabled: worker.isPending,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "size-4" }), " تشغيل مهمة واحدة"]
				}), worker.data?.runId ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-3 text-sm text-muted-foreground",
					children: ["تم تشغيل: ", worker.data.runId]
				}) : null] })]
			})
		]
	});
}
//#endregion
export { AdminSprixPage as component };
