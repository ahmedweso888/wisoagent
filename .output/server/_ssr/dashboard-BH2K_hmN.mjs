import { f as require_jsx_runtime } from "../_libs/@radix-ui/react-avatar+[...].mjs";
import { t as PageHeader } from "./PageHeader-DhP6ZZXs.mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { t as supabase } from "./client-DIXqhfAR.mjs";
import { n as useAuth } from "./useAuth-BO86jEMb.mjs";
import { B as CircleCheck, V as CircleAlert, q as CalendarClock, u as Target } from "../_libs/lucide-react.mjs";
import { n as CardContent, t as Card } from "./card-BcujUCMc.mjs";
import { t as Progress } from "./progress-j55G0Y_d.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/dashboard-BH2K_hmN.js
var import_jsx_runtime = require_jsx_runtime();
function DashboardPage() {
	const { profile } = useAuth();
	const today = useQuery({
		queryKey: ["daily-progress"],
		queryFn: async () => {
			const { data, error } = await supabase.from("daily_progress").select("*").eq("day", (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)).maybeSingle();
			if (error) throw error;
			return data;
		}
	});
	const mastery = useQuery({
		queryKey: ["mastery-summary"],
		queryFn: async () => {
			const { data, error } = await supabase.from("mastery").select("mastery_score,is_weak,subjects(name_ar)").order("mastery_score", { ascending: true }).limit(5);
			if (error) throw error;
			return data;
		}
	});
	const plan = useQuery({
		queryKey: ["today-plan"],
		queryFn: async () => {
			const { data, error } = await supabase.from("study_plans").select("deadline,daily_hours_target,study_plan_items(*)").eq("is_active", true).order("created_at", { ascending: false }).limit(1).maybeSingle();
			if (error) throw error;
			return data;
		}
	});
	const progress = today.data?.questions_solved ?? 0;
	const completed = (plan.data?.study_plan_items ?? []).filter((item) => item.completed).length;
	const total = plan.data?.study_plan_items?.length ?? 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		dir: "rtl",
		className: "page-shell",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				title: `أهلاً ${profile?.full_name?.split(" ")[0] ?? "بك"}`,
				subtitle: "هنا هتلاقي خطتك ومستواك الحقيقي، وكل حاجة بتتطور مع حلك."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-7 grid gap-4 md:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
						className: "p-5",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Target, { className: "size-5 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted-foreground",
								children: "أسئلة اليوم"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-2xl font-bold",
								children: progress
							})] })]
						})
					}) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
						className: "p-5",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-5 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted-foreground",
								children: "إنجاز الخطة"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-2xl font-bold",
								children: total ? `${completed}/${total}` : "—"
							})] })]
						})
					}) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
						className: "p-5",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarClock, { className: "size-5 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted-foreground",
								children: "موعد النهاية"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-lg font-bold",
								children: plan.data?.deadline ?? "لسه ما حددتش"
							})] })]
						})
					}) })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-8 grid gap-6 lg:grid-cols-[1.25fr_.75fr]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "p-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-xl font-bold",
							children: "نقط محتاجة تركيز"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-muted-foreground",
							children: "دي مبنية على إجاباتك ومحاولاتك الفعلية."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-6 space-y-5",
							children: mastery.data?.length ? mastery.data.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mb-2 flex justify-between text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: item.subjects?.name_ar ?? "مادة" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [Math.round(Number(item.mastery_score)), "%"] })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Progress, { value: Number(item.mastery_score) })] }, `${item.subjects?.name_ar}-${item.mastery_score}`)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground",
								children: "حل شوية أسئلة الأول، وWISO هيبدأ يبني صورة حقيقية عن مستواك."
							})
						})
					]
				}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "p-6",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-xl font-bold",
						children: "خطة اليوم"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-5 space-y-3",
						children: [plan.data?.study_plan_items?.filter((item) => item.starts_on === (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)).slice(0, 5).map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start gap-3 rounded-xl border p-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: `mt-0.5 size-4 ${item.completed ? "text-primary" : "text-muted-foreground"}` }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm font-semibold",
								children: item.title
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-1 text-xs text-muted-foreground",
								children: [
									item.estimated_minutes,
									" دقيقة · ",
									item.question_target,
									" سؤال"
								]
							})] })]
						}, item.id)) ?? null, !plan.data && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2 text-sm text-muted-foreground",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "size-4" }), "اختار موعد النهاية من صفحة الخطة."]
						})]
					})]
				}) })]
			})
		]
	});
}
//#endregion
export { DashboardPage as component };
