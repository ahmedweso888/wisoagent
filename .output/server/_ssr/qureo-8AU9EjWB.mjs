import { i as __toESM } from "../_runtime.mjs";
import { h as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { f as require_jsx_runtime } from "../_libs/@radix-ui/react-avatar+[...].mjs";
import { t as Button } from "./button-CAvS9N1W.mjs";
import { t as Label } from "./label-DBD1bRRP.mjs";
import { t as PageHeader } from "./PageHeader-DhP6ZZXs.mjs";
import { n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as Input } from "./input-DC57PAAM.mjs";
import { B as CircleCheck, D as KeyRound, T as LoaderCircle, Y as Bot, _ as RefreshCw, m as ShieldCheck, z as CircleStop } from "../_libs/lucide-react.mjs";
import { i as CardTitle, n as CardContent, r as CardHeader, t as Card } from "./card-BcujUCMc.mjs";
import { a as getMyToolAccess, c as getToolAccountStatus, d as linkToolAccount, m as stopToolJob, p as startToolJob, u as getToolJob } from "./wiso-tools.functions-D0SxEpcH.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/qureo-8AU9EjWB.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function QureoPage() {
	const access = useQuery({
		queryKey: ["wiso-tools-access"],
		queryFn: () => getMyToolAccess()
	});
	const account = useQuery({
		queryKey: ["wiso-tool-account", "qureo"],
		queryFn: () => getToolAccountStatus({ data: { toolKey: "qureo" } })
	});
	const [id, setId] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [jobId, setJobId] = (0, import_react.useState)(null);
	const active = access.data?.some((item) => item.tool_key === "qureo" && item.available) ?? false;
	const job = useQuery({
		queryKey: ["wiso-tool-job", jobId],
		enabled: Boolean(jobId),
		queryFn: () => getToolJob({ data: { jobId } }),
		refetchInterval: (query) => {
			const status = query.state.data?.job.status;
			return status && [
				"completed",
				"completed_with_errors",
				"failed",
				"stopped"
			].includes(status) ? false : 3e3;
		}
	});
	const link = useMutation({
		mutationFn: () => linkToolAccount({ data: {
			toolKey: "qureo",
			id,
			password
		} }),
		onSuccess: () => {
			setPassword("");
			toast.success("تم ربط حساب Qureo.");
			account.refetch();
		},
		onError: (error) => toast.error(error.message)
	});
	const start = useMutation({
		mutationFn: () => startToolJob({ data: { toolKey: "qureo" } }),
		onSuccess: (data) => {
			setJobId(data.id);
			toast.success("بدأ وكيل Qureo التنفيذ.");
		},
		onError: (error) => toast.error(error.message)
	});
	const stop = useMutation({
		mutationFn: () => stopToolJob({ data: { jobId } }),
		onSuccess: () => toast.success("تم إرسال أمر الإيقاف."),
		onError: (error) => toast.error(error.message)
	});
	const status = job.data?.job.status;
	const logs = (0, import_react.useMemo)(() => job.data?.python.logs ?? [], [job.data?.python.logs]);
	if (!active) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		dir: "rtl",
		className: "page-shell",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			title: "Qureo",
			subtitle: "وكيل Qureo من WISO"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
			className: "mt-7",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "flex flex-col items-center gap-4 p-8 text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "size-10 text-primary" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-xl font-bold",
						children: "الأداة غير مفعّلة"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "max-w-xl text-sm leading-6 text-muted-foreground",
						children: "فعّل Qureo أو باقة SPRIX + Qureo من صفحة أدوات WISO."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/tools",
							children: "أدوات WISO"
						})
					})
				]
			})
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		dir: "rtl",
		className: "page-shell",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			title: "Qureo",
			subtitle: "وكيل Qureo — بيانات الحساب لا تغادر خادم WISO إلى Python إلا أثناء التنفيذ."
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-7 grid gap-6 lg:grid-cols-[.85fr_1.15fr]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyRound, { className: "size-5" }), " حساب Qureo"]
			}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "space-y-5",
				children: [account.data?.linked ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-xl border border-primary/25 bg-primary/5 p-4 text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2 font-semibold",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "size-4 text-primary" }), " الحساب مربوط"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-muted-foreground",
						children: "يمكن ربط حساب Qureo واحد فقط بحساب WISO."
					})]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "qureo-id",
							children: "ID"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "qureo-id",
							value: id,
							onChange: (e) => setId(e.target.value),
							autoComplete: "username"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "qureo-password",
							children: "Password"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "qureo-password",
							type: "password",
							value: password,
							onChange: (e) => setPassword(e.target.value),
							autoComplete: "current-password"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						className: "w-full",
						disabled: link.isPending || !id.trim() || !password,
						onClick: () => link.mutate(),
						children: link.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }), " جارٍ الربط..."] }) : "ربط الحساب"
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					className: "w-full",
					disabled: !account.data?.linked || start.isPending || Boolean(jobId && status && ![
						"completed",
						"completed_with_errors",
						"failed",
						"stopped"
					].includes(status)),
					onClick: () => start.mutate(),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bot, { className: "size-4" }),
						" ",
						start.isPending ? "جارٍ البدء..." : "ابدأ الحل"
					]
				})]
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "min-h-[420px]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
					className: "flex items-center justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bot, { className: "size-5" }), " WISO Agent Console"]
					}), status ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "rounded-full bg-muted px-3 py-1 text-xs",
						children: status
					}) : null]
				}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-h-[310px] rounded-2xl border bg-black/95 p-4 font-mono text-xs leading-6 text-white",
					dir: "ltr",
					children: [logs.length ? logs.map((line, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: line }, `${index}-${line}`)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: status ? `> job status: ${status}` : "> في انتظار بدء الوكيل..." }), job.data?.python.message ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-2",
						children: `> ${job.data.python.message}`
					}) : null]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 flex flex-wrap gap-2",
					children: [
						status && ["queued", "in_progress"].includes(status) ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "destructive",
							onClick: () => stop.mutate(),
							disabled: stop.isPending,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleStop, { className: "size-4" }), " إيقاف الحل"]
						}) : null,
						status && [
							"failed",
							"completed_with_errors",
							"stopped"
						].includes(status) ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "outline",
							onClick: () => setJobId(null),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "size-4" }), " تشغيل مهمة جديدة"]
						}) : null,
						status === "completed" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-4 text-primary" }), " اكتمل التنفيذ"]
						}) : null
					]
				})] })]
			})]
		})]
	});
}
//#endregion
export { QureoPage as component };
