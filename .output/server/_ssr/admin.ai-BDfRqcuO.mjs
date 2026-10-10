import { V as adminUpdateAiSettings, s as adminGetAiSettings } from "./admin.functions-DOqjuAPc.mjs";
import { f as require_jsx_runtime } from "../_libs/@radix-ui/react-avatar+[...].mjs";
import { t as Button } from "./button-CAvS9N1W.mjs";
import { t as Label } from "./label-DBD1bRRP.mjs";
import { t as Switch } from "./switch-Cn1w-cIH.mjs";
import { t as Skeleton } from "./skeleton-D9W9wFsj.mjs";
import { r as PROVIDER_LABELS } from "./config-D2J6lUtb.mjs";
import { t as PageHeader } from "./PageHeader-DhP6ZZXs.mjs";
import { t as Badge } from "./badge-DovwySyz.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin.ai-BDfRqcuO.js
var import_jsx_runtime = require_jsx_runtime();
function statusOf(s) {
	if (s.ai_emergency_disabled) return {
		label: "متوقف — إيقاف طوارئ",
		tone: "text-destructive"
	};
	if (!s.enabled || !s.ai_mode_enabled) return {
		label: "متوقف",
		tone: "text-muted-foreground"
	};
	return {
		label: "يعمل",
		tone: "text-primary"
	};
}
function AdminAiSettingsPage() {
	const queryClient = useQueryClient();
	const settingsQuery = useQuery({
		queryKey: ["admin", "ai-settings"],
		queryFn: async () => {
			return adminGetAiSettings();
		}
	});
	const settings = settingsQuery.data;
	const update = useMutation({
		mutationFn: async (patch) => {
			return adminUpdateAiSettings({ data: patch });
		},
		onSuccess: (data) => {
			queryClient.setQueryData(["admin", "ai-settings"], data);
			toast.success("تم حفظ الإعدادات");
		},
		onError: (error) => {
			const message = error instanceof Error ? error.message : "تعذّر الحفظ";
			toast.error(message === "forbidden" ? "هذه الصفحة للمشرفين فقط" : message);
		}
	});
	if (settingsQuery.isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		dir: "rtl",
		className: "page-shell max-w-5xl space-y-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-8 w-56" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-32 w-full" })]
	});
	if (settingsQuery.isError || !settings) {
		const message = settingsQuery.error instanceof Error ? settingsQuery.error.message : "خطأ غير معروف";
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
			dir: "rtl",
			className: "page-shell max-w-5xl",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-2xl font-bold",
					children: "إعدادات ذكاء WISO"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-sm text-destructive",
					children: message.includes("permission") || message.includes("forbidden") ? "هذه الصفحة متاحة للمشرفين فقط." : `تعذّر تحميل الإعدادات: ${message}`
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					className: "mt-4",
					variant: "outline",
					onClick: () => settingsQuery.refetch(),
					children: "إعادة المحاولة"
				})
			]
		});
	}
	const status = statusOf(settings);
	const saving = update.isPending;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		dir: "rtl",
		className: "page-shell max-w-5xl",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				title: "إعدادات ذكاء WISO",
				subtitle: PROVIDER_LABELS.openai,
				actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
					variant: settings.ai_emergency_disabled ? "destructive" : settings.enabled ? "default" : "secondary",
					children: ["الحالة: ", status.label]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "surface-panel mt-7 divide-y divide-border px-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between gap-6 py-5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "ai-enabled",
							className: "text-base",
							children: "تفعيل الذكاء الاصطناعي"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-muted-foreground",
							children: "إيقافه يمنع كل مهام الذكاء الاصطناعي في المنصة."
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
							id: "ai-enabled",
							disabled: saving,
							checked: settings.enabled && settings.ai_mode_enabled,
							onCheckedChange: (checked) => update.mutate({
								_enabled: checked,
								_ai_mode_enabled: checked
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between gap-6 py-5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "ai-emergency",
							className: "text-base",
							children: "إيقاف طوارئ للذكاء الاصطناعي"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-muted-foreground",
							children: "يوقف كل الطلبات فوراً بغضّ النظر عن باقي الإعدادات."
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
							id: "ai-emergency",
							disabled: saving,
							checked: settings.ai_emergency_disabled,
							onCheckedChange: (checked) => update.mutate({ _ai_emergency_disabled: checked })
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "py-5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							className: "text-base",
							children: "التوجيه الذكي"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm leading-7 text-muted-foreground",
							children: "لا يختار المشرف أو الطالب نموذجاً بعينه. WISO يوجّه المهمة داخلياً إلى Luna أو Terra أو Sol حسب نوعها وصعوبتها. «تعجيزي» يذهب مباشرة إلى Sol، والمهام الثقيلة الخاصة بالمعالجة تذهب إلى Luna."
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-8 text-xs text-muted-foreground",
				children: "مفاتيح الوصول للذكاء الاصطناعي تُدار على الخادم فقط ولا تظهر هنا إطلاقاً."
			})
		]
	});
}
//#endregion
export { AdminAiSettingsPage as component };
