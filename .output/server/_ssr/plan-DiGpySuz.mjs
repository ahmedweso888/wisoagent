import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { f as require_jsx_runtime } from "../_libs/@radix-ui/react-avatar+[...].mjs";
import { t as Button } from "./button-CAvS9N1W.mjs";
import { t as PageHeader } from "./PageHeader-DhP6ZZXs.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as supabase } from "./client-DIXqhfAR.mjs";
import { t as Input } from "./input-DC57PAAM.mjs";
import { B as CircleCheck, K as CalendarDays, R as Clock3 } from "../_libs/lucide-react.mjs";
import { n as CardContent, t as Card } from "./card-BcujUCMc.mjs";
import { t as aiGeneratePlan } from "./ai.functions-CtafWLsh.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/plan-DiGpySuz.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function PlanPage() {
	const queryClient = useQueryClient();
	const [deadline, setDeadline] = (0, import_react.useState)("");
	const plan = useQuery({
		queryKey: ["active-plan"],
		queryFn: async () => {
			const { data, error } = await supabase.from("study_plans").select("id,title,deadline,daily_hours_target,is_active,study_plan_items(*)").eq("is_active", true).order("created_at", { ascending: false }).limit(1).maybeSingle();
			if (error) throw error;
			return data;
		}
	});
	const subjects = useQuery({
		queryKey: ["plan-subjects"],
		queryFn: async () => {
			const { data, error } = await supabase.from("subjects").select("slug").order("sort_order");
			if (error) throw error;
			return data ?? [];
		}
	});
	const generate = useMutation({
		mutationFn: async () => {
			if (!deadline) throw new Error("اختار موعد إتمام المنهج الأول");
			return aiGeneratePlan({ data: {
				deadline,
				dailyHoursTarget: 4,
				subjectSlugs: subjects.data?.map((s) => s.slug) ?? []
			} });
		},
		onSuccess: () => {
			toast.success("الخطة اتبنت بناءً على الموعد والمحتوى الحالي.");
			queryClient.invalidateQueries({ queryKey: ["active-plan"] });
		},
		onError: (e) => toast.error(e.message)
	});
	const complete = useMutation({
		mutationFn: async (id) => {
			const { error } = await supabase.from("study_plan_items").update({
				completed: true,
				completed_at: (/* @__PURE__ */ new Date()).toISOString()
			}).eq("id", id);
			if (error) throw error;
		},
		onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["active-plan"] })
	});
	const items = [...plan.data?.study_plan_items ?? []].sort((a, b) => (a.starts_on ?? "").localeCompare(b.starts_on ?? ""));
	const done = items.filter((i) => i.completed).length;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		dir: "rtl",
		className: "page-shell",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				title: "خطة السنة",
				subtitle: "أنت اختار موعدك، وWISO هيوزّع الطريق ويظبطه مع تقدمك."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
				className: "mt-7",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "flex flex-col gap-4 p-5 sm:flex-row sm:items-end",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							className: "text-sm font-semibold",
							htmlFor: "deadline",
							children: "موعد إتمام المنهج"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "deadline",
							className: "mt-2 max-w-xs",
							type: "date",
							value: deadline || plan.data?.deadline || "",
							onChange: (e) => setDeadline(e.target.value)
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						disabled: generate.isPending || !subjects.data?.length,
						onClick: () => generate.mutate(),
						children: generate.isPending ? "WISO بيبني الخطة..." : plan.data ? "إعادة ضبط الخطة" : "ابني خطتي"
					})]
				})
			}),
			plan.data ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 grid gap-3 sm:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
						className: "flex items-center gap-3 p-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarDays, { className: "size-5 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: "الموعد النهائي"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-semibold",
							children: plan.data.deadline
						})] })]
					}) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
						className: "flex items-center gap-3 p-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock3, { className: "size-5 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: "الساعات اليومية"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-semibold",
							children: plan.data.daily_hours_target
						})] })]
					}) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
						className: "flex items-center gap-3 p-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-5 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: "الإنجاز"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "font-semibold",
							children: [
								done,
								" / ",
								items.length
							]
						})] })]
					}) })
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-6 space-y-3",
				children: items.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-semibold",
						children: item.title
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 text-xs text-muted-foreground",
						children: [
							item.phase === "revision" ? "مراجعة" : "منهج",
							" · ",
							item.estimated_minutes,
							" ",
							"دقيقة · ",
							item.question_target,
							" سؤال"
						]
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: item.completed ? "secondary" : "outline",
						disabled: item.completed || complete.isPending,
						onClick: () => complete.mutate(item.id),
						children: item.completed ? "تمت" : "تمّمتها"
					})]
				}) }, item.id))
			})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
				className: "mt-8",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
					className: "py-12 text-center text-muted-foreground",
					children: "اختار موعد النهاية واضغط «ابني خطتي». WISO هيقرأ المحتوى والأداء المتاح ويولّد الخطة."
				})
			})
		]
	});
}
//#endregion
export { PlanPage as component };
