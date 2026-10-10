import { i as __toESM } from "../_runtime.mjs";
import { b as Navigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as adminGetAiJobs, c as adminGetAiStats, o as adminGetAiLogs } from "./admin.functions-DKdO8Tg0.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { f as require_jsx_runtime } from "../_libs/@radix-ui/react-avatar+[...].mjs";
import { t as Skeleton } from "./skeleton-D9W9wFsj.mjs";
import { t as PageHeader } from "./PageHeader-DhP6ZZXs.mjs";
import { t as Badge } from "./badge-DovwySyz.mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { n as useAuth } from "./useAuth-BO86jEMb.mjs";
import { t as EmptyState } from "./EmptyState-Dyw3WASN.mjs";
import { nt as Activity } from "../_libs/lucide-react.mjs";
import { t as StatCard } from "./StatCard-DTaJ4i7N.mjs";
import { i as TabsTrigger, r as TabsList, t as Tabs } from "./tabs-D54Z4YMT.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin.jobs-DAFRXpT2.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var STATUS_LABEL = {
	running: "جارية",
	completed: "مكتملة",
	partial: "غير مكتملة",
	failed: "فاشلة",
	ok: "ناجحة",
	error: "خطأ"
};
function AdminJobsPage() {
	const { isAdmin } = useAuth();
	const [tab, setTab] = (0, import_react.useState)("jobs");
	const statsQuery = useQuery({
		queryKey: ["admin", "ai-stats"],
		enabled: isAdmin,
		queryFn: async () => {
			return await adminGetAiStats();
		}
	});
	const jobsQuery = useQuery({
		queryKey: ["admin", "ai-jobs"],
		enabled: isAdmin && tab === "jobs",
		refetchInterval: tab === "jobs" ? 15e3 : false,
		queryFn: async () => {
			return adminGetAiJobs();
		}
	});
	const logsQuery = useQuery({
		queryKey: ["admin", "ai-logs"],
		enabled: isAdmin && tab === "logs",
		queryFn: async () => {
			return adminGetAiLogs();
		}
	});
	if (!isAdmin) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, { to: "/dashboard" });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		dir: "rtl",
		className: "page-shell",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				title: "مهام الذكاء وسجلاته",
				subtitle: "كل عملية لها معرّف طلب واحد يتتبّعها من المحرك حتى تسليم الأسئلة وخصم الرصيد."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4",
				children: statsQuery.isPending ? Array.from({ length: 4 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-28 w-full" }, i)) : statsQuery.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-destructive",
					children: "تعذّر تحميل إحصاءات الذكاء."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "طلبات اليوم",
						value: statsQuery.data?.requests_today ?? 0,
						tone: "primary"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "طلبات هذا الشهر",
						value: statsQuery.data?.requests_month ?? 0
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "أسئلة مولّدة",
						value: statsQuery.data?.questions_generated ?? 0,
						tone: "success"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "أخطاء اليوم",
						value: statsQuery.data?.errors_today ?? 0,
						hint: `إجمالي الأخطاء ${statsQuery.data?.errors_total ?? 0}`,
						tone: "destructive"
					})
				] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tabs, {
				value: tab,
				onValueChange: (v) => setTab(v),
				className: "mt-8",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
					value: "jobs",
					children: "مهام التوليد"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
					value: "logs",
					children: "سجل الاستخدام"
				})] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-5 space-y-3",
				children: tab === "jobs" ? jobsQuery.isPending ? Array.from({ length: 4 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-24 w-full" }, i)) : jobsQuery.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-destructive",
					children: "تعذّر تحميل المهام."
				}) : !jobsQuery.data?.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
					icon: Activity,
					title: "لا توجد مهام بعد",
					description: "ستظهر هنا مهام توليد الأسئلة فور بدء الطلاب باستخدام المولّد."
				}) : jobsQuery.data.map((job) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
					className: "surface-panel space-y-2 p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
								className: "text-xs text-muted-foreground",
								children: job.request_id
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: job.status === "completed" ? "default" : job.status === "failed" ? "destructive" : "secondary",
								children: STATUS_LABEL[job.status] ?? job.status
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-1 text-xs text-muted-foreground sm:grid-cols-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["مطلوب: ", job.requested_count] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["معاد استخدامه: ", job.reused_count] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["مولّد: ", job.generated_count] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["مقبول: ", job.accepted_count] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["مرفوض: ", job.rejected_count] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["متبقٍ: ", job.remaining_count] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["إعادات: ", job.retry_count] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["استبدالات: ", job.replacement_count] })
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-muted-foreground",
							children: [new Date(job.created_at).toLocaleString("ar-EG"), job.difficulty ? ` · صعوبة ${job.difficulty}` : ""]
						}),
						job.error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-destructive",
							children: job.error
						}) : null
					]
				}, job.request_id)) : logsQuery.isPending ? Array.from({ length: 4 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-20 w-full" }, i)) : logsQuery.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-destructive",
					children: "تعذّر تحميل السجل."
				}) : !logsQuery.data?.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
					icon: Activity,
					title: "لا توجد سجلات",
					description: "يظهر هنا سجل كل عملية ذكاء اصطناعي مع الرموز والزمن والحالة."
				}) : logsQuery.data.map((log) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
					className: "surface-panel space-y-2 p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
								className: "text-xs text-muted-foreground",
								children: log.request_id ?? log.id
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: log.status === "ok" ? "default" : "destructive",
								children: STATUS_LABEL[log.status] ?? log.status
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-1 text-xs text-muted-foreground sm:grid-cols-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["المهمة: ", log.agent] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["أسئلة: ", log.questions_generated] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["مقبول: ", log.questions_approved] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["مرفوض: ", log.questions_rejected] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["إعادات: ", log.retries] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["تصعيدات: ", log.escalations] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["رموز: ", log.tokens_used] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
									"زمن: ",
									log.latency_ms ?? "—",
									" مللي ثانية"
								] })
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: new Date(log.created_at).toLocaleString("ar-EG")
						}),
						log.error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-destructive",
							children: log.error
						}) : null
					]
				}, log.id))
			})
		]
	});
}
//#endregion
export { AdminJobsPage as component };
