import { g as Navigate, h as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { T as adminGetStats, h as adminGetDashboardCounts } from "./admin.functions-DOqjuAPc.mjs";
import { f as require_jsx_runtime } from "../_libs/@radix-ui/react-avatar+[...].mjs";
import { t as Button } from "./button-CAvS9N1W.mjs";
import { t as Skeleton } from "./skeleton-D9W9wFsj.mjs";
import { t as PageHeader } from "./PageHeader-DhP6ZZXs.mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { n as useAuth } from "./useAuth-BO86jEMb.mjs";
import { $ as ArrowLeft, E as Library, J as Building2, X as BookOpenCheck, Y as Bot, b as Package, et as Activity, f as Sparkles, i as Wallet, j as FileClock, o as Users } from "../_libs/lucide-react.mjs";
import { t as StatCard } from "./StatCard-DTaJ4i7N.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin.index-CorEUmFy.js
var import_jsx_runtime = require_jsx_runtime();
var ADMIN_LINKS = [
	{
		to: "/admin/students",
		title: "إدارة الطلاب",
		description: "الصلاحيات، التجربة المجانية، الاشتراكات، والإيقاف.",
		icon: Users
	},
	{
		to: "/admin/curriculum",
		title: "المناهج والمواد",
		description: "إدارة المواد ومتابعة الوحدات والدروس الفعلية.",
		icon: Library
	},
	{
		to: "/admin/questions",
		title: "بنك الأسئلة",
		description: "استعراض الأسئلة المعتمدة حسب المادة والصعوبة.",
		icon: BookOpenCheck
	},
	{
		to: "/admin/bundles",
		title: "الباقات والاشتراكات",
		description: "الأسعار، الأرصدة، والحدود اليومية.",
		icon: Package
	},
	{
		to: "/admin/payments",
		title: "طلبات الدفع",
		description: "مراجعة إثباتات التحويل وقبولها أو رفضها.",
		icon: Wallet
	},
	{
		to: "/admin/centers",
		title: "المراكز والأكواد",
		description: "إنشاء المراكز وتوليد أكواد التفعيل ومتابعتها.",
		icon: Building2
	},
	{
		to: "/admin/jobs",
		title: "مهام الذكاء وسجلاته",
		description: "متابعة مهام التوليد وسجل الاستخدام بالكامل.",
		icon: Activity
	},
	{
		to: "/admin/ai",
		title: "إعدادات الذكاء",
		description: "تفعيل الذكاء الاصطناعي وإيقاف الطوارئ.",
		icon: Bot
	},
	{
		to: "/admin/requests",
		title: "الطلبات الخاصة",
		description: "مراجعة طلبات الطلاب المرفقة بملفات.",
		icon: FileClock
	},
	{
		to: "/admin/center-requests",
		title: "طلبات السناتر",
		description: "مراجعة طلبات التعاون المقدمة من الطلاب والمستخدمين.",
		icon: Building2
	},
	{
		to: "/admin/system",
		title: "إعدادات النظام",
		description: "حالة المنصة، المسابقة، وملخص الإيرادات.",
		icon: Sparkles
	}
];
function AdminDashboardPage() {
	const { isAdmin } = useAuth();
	const statsQuery = useQuery({
		queryKey: ["admin", "stats"],
		enabled: isAdmin,
		queryFn: async () => {
			return await adminGetStats();
		}
	});
	const countsQuery = useQuery({
		queryKey: ["admin", "dashboard-counts"],
		enabled: isAdmin,
		queryFn: async () => {
			return adminGetDashboardCounts();
		}
	});
	if (!isAdmin) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, { to: "/dashboard" });
	const isPending = statsQuery.isPending || countsQuery.isPending;
	const isError = statsQuery.isError || countsQuery.isError;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		dir: "rtl",
		className: "page-shell",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			title: "لوحة تحكم المشرف",
			subtitle: "نظرة عامة سريعة على المنصة مع روابط لإدارة الطلاب والمدفوعات والباقات والذكاء الاصطناعي."
		}), isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4",
			children: Array.from({ length: 8 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-28 w-full" }, i))
		}) : isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-7 space-y-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-destructive",
				children: statsQuery.error instanceof Error && statsQuery.error.message === "forbidden" ? "هذه الصفحة متاحة للمشرفين فقط." : "تعذّر تحميل الإحصاءات."
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "outline",
				onClick: () => {
					statsQuery.refetch();
					countsQuery.refetch();
				},
				children: "إعادة المحاولة"
			})]
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
					label: "إجمالي الطلاب",
					value: statsQuery.data?.total_users ?? 0,
					tone: "primary"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
					label: "نشِطون آخر 7 أيام",
					value: statsQuery.data?.active_7d ?? 0
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
					label: "مشتركون فعّالون",
					value: statsQuery.data?.active_subscribers ?? 0,
					tone: "success"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
					label: "مستخدمون موقوفون",
					value: statsQuery.data?.suspended ?? 0,
					tone: "destructive"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
					label: "طلبات دفع معلّقة",
					value: countsQuery.data?.pendingPayments ?? 0,
					tone: "accent"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
					label: "طلبات خاصة معلّقة",
					value: countsQuery.data?.pendingSpecial ?? 0,
					tone: "accent"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
					label: "طلبات سناتر معلّقة",
					value: countsQuery.data?.pendingCenterRequests ?? 0,
					tone: "accent"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
					label: "مهام ذكاء اصطناعي جارية",
					value: countsQuery.data?.runningAiJobs ?? 0,
					hint: `من إجمالي ${countsQuery.data?.totalAiJobs ?? 0} مهمة`
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
					label: "طلبات ذكاء اصطناعي",
					value: statsQuery.data?.ai_requests ?? 0
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
			className: "mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4",
			children: ADMIN_LINKS.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: item.to,
				className: "surface-panel group flex flex-col gap-3 p-5 transition-colors hover:border-primary/40",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "flex size-10 items-center justify-center rounded-xl bg-secondary text-primary",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(item.icon, { className: "size-5" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-base font-semibold",
						children: item.title
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted-foreground",
						children: item.description
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "mt-auto flex items-center gap-1 text-sm font-medium text-primary",
						children: ["فتح", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "size-4 rotate-180 transition-transform group-hover:-translate-x-1" })]
					})
				]
			}, item.to))
		})] })]
	});
}
//#endregion
export { AdminDashboardPage as component };
