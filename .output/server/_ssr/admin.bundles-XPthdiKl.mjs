import { i as __toESM } from "../_runtime.mjs";
import { g as Navigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { D as adminGetSubscriptionPlans, K as adminUpdateSubscriptionPlan, r as adminCreateSubscriptionPlan } from "./admin.functions-DOqjuAPc.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { f as require_jsx_runtime } from "../_libs/@radix-ui/react-avatar+[...].mjs";
import { t as Button } from "./button-CAvS9N1W.mjs";
import { t as Label } from "./label-DBD1bRRP.mjs";
import { t as Switch } from "./switch-Cn1w-cIH.mjs";
import { t as Skeleton } from "./skeleton-D9W9wFsj.mjs";
import { t as PageHeader } from "./PageHeader-DhP6ZZXs.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as useAuth } from "./useAuth-BO86jEMb.mjs";
import { t as EmptyState } from "./EmptyState-Dyw3WASN.mjs";
import { t as Input } from "./input-DC57PAAM.mjs";
import { b as Package } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin.bundles-XPthdiKl.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var EMPTY_DRAFT = {
	name_ar: "",
	name_en: "",
	price_egp: "0",
	discount_percent: "0",
	question_credits: "0",
	image_credits: "0",
	pdf_credits: "0",
	daily_question_limit: "0",
	sort_order: "0"
};
function toDraft(plan) {
	return {
		name_ar: plan.name_ar,
		name_en: plan.name_en,
		price_egp: String(plan.price_egp),
		discount_percent: String(plan.discount_percent),
		question_credits: String(plan.question_credits),
		image_credits: String(plan.image_credits),
		pdf_credits: String(plan.pdf_credits),
		daily_question_limit: String(plan.daily_question_limit),
		sort_order: String(plan.sort_order)
	};
}
function draftToRow(draft) {
	return {
		name_ar: draft.name_ar.trim(),
		name_en: draft.name_en.trim(),
		price_egp: Number(draft.price_egp) || 0,
		discount_percent: Number(draft.discount_percent) || 0,
		question_credits: Number(draft.question_credits) || 0,
		image_credits: Number(draft.image_credits) || 0,
		pdf_credits: Number(draft.pdf_credits) || 0,
		daily_question_limit: Number(draft.daily_question_limit) || 0,
		sort_order: Number(draft.sort_order) || 0
	};
}
var FIELDS = [
	{
		key: "name_ar",
		label: "الاسم بالعربية",
		numeric: false
	},
	{
		key: "name_en",
		label: "الاسم بالإنجليزية",
		numeric: false
	},
	{
		key: "price_egp",
		label: "السعر (ج.م)",
		numeric: true
	},
	{
		key: "discount_percent",
		label: "نسبة الخصم %",
		numeric: true
	},
	{
		key: "question_credits",
		label: "رصيد الأسئلة",
		numeric: true
	},
	{
		key: "image_credits",
		label: "رصيد الصور",
		numeric: true
	},
	{
		key: "pdf_credits",
		label: "رصيد ملفات PDF",
		numeric: true
	},
	{
		key: "daily_question_limit",
		label: "حد الأسئلة اليومي",
		numeric: true
	},
	{
		key: "sort_order",
		label: "الترتيب",
		numeric: true
	}
];
function DraftForm({ draft, onChange, disabled }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid gap-3 sm:grid-cols-3",
		children: FIELDS.map((field) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-1.5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
				className: "text-xs text-muted-foreground",
				children: field.label
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				value: draft[field.key],
				disabled,
				inputMode: field.numeric ? "decimal" : "text",
				onChange: (e) => onChange({
					...draft,
					[field.key]: e.target.value
				})
			})]
		}, field.key))
	});
}
function AdminBundlesPage() {
	const { isAdmin } = useAuth();
	const qc = useQueryClient();
	const [editing, setEditing] = (0, import_react.useState)(null);
	const [draft, setDraft] = (0, import_react.useState)(EMPTY_DRAFT);
	const [creating, setCreating] = (0, import_react.useState)(false);
	const [newDraft, setNewDraft] = (0, import_react.useState)(EMPTY_DRAFT);
	const plansQuery = useQuery({
		queryKey: ["admin", "plans"],
		enabled: isAdmin,
		queryFn: async () => {
			return await adminGetSubscriptionPlans();
		}
	});
	const invalidate = () => {
		qc.invalidateQueries({ queryKey: ["admin", "plans"] });
		qc.invalidateQueries({ queryKey: ["plans"] });
	};
	const save = useMutation({
		mutationFn: async (params) => {
			await adminUpdateSubscriptionPlan({ data: {
				id: params.id,
				patch: draftToRow(params.draft)
			} });
		},
		onSuccess: () => {
			toast.success("تم حفظ الباقة");
			setEditing(null);
			invalidate();
		},
		onError: (e) => toast.error(e.message)
	});
	const toggleActive = useMutation({
		mutationFn: async (params) => {
			await adminUpdateSubscriptionPlan({ data: {
				id: params.id,
				patch: { is_active: params.active }
			} });
		},
		onSuccess: () => {
			toast.success("تم تحديث حالة الباقة");
			invalidate();
		},
		onError: (e) => toast.error(e.message)
	});
	const create = useMutation({
		mutationFn: async (value) => {
			await adminCreateSubscriptionPlan({ data: {
				...draftToRow(value),
				is_active: true
			} });
		},
		onSuccess: () => {
			toast.success("تمت إضافة الباقة");
			setCreating(false);
			setNewDraft(EMPTY_DRAFT);
			invalidate();
		},
		onError: (e) => toast.error(e.message)
	});
	if (!isAdmin) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, { to: "/dashboard" });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		dir: "rtl",
		className: "page-shell",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				title: "الباقات والاشتراكات",
				subtitle: "هذه الباقات هي المصدر الوحيد لأسعار المنصة وأرصدة الطلاب.",
				actions: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: creating ? "outline" : "default",
					onClick: () => setCreating((v) => !v),
					children: creating ? "إلغاء" : "إضافة باقة"
				})
			}),
			creating ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "surface-panel mt-6 space-y-4 p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-base font-semibold",
						children: "باقة جديدة"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DraftForm, {
						draft: newDraft,
						onChange: setNewDraft,
						disabled: create.isPending
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						disabled: create.isPending || !newDraft.name_ar.trim(),
						onClick: () => create.mutate(newDraft),
						children: "حفظ الباقة"
					})
				]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-6 space-y-4",
				children: plansQuery.isPending ? Array.from({ length: 3 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-32 w-full" }, i)) : plansQuery.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-destructive",
					children: "تعذّر تحميل الباقات."
				}) : !plansQuery.data?.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
					icon: Package,
					title: "لا توجد باقات",
					description: "أضف أول باقة ليتمكن الطلاب من الاشتراك."
				}) : plansQuery.data.map((plan) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "surface-panel space-y-4 p-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-start justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "font-display text-base font-semibold",
							children: [
								plan.name_ar,
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-sm text-muted-foreground",
									children: [
										"(",
										plan.name_en,
										")"
									]
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 text-sm text-muted-foreground",
							children: [
								plan.price_egp,
								" ج.م",
								plan.discount_percent > 0 ? ` · خصم ${plan.discount_percent}%` : "",
								" ·",
								" ",
								plan.question_credits,
								" سؤال · ",
								plan.image_credits,
								" صورة · ",
								plan.pdf_credits,
								" ",
								"ملف · حد يومي ",
								plan.daily_question_limit
							]
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									className: "text-xs text-muted-foreground",
									children: "مفعّلة"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
									checked: plan.is_active,
									disabled: toggleActive.isPending,
									onCheckedChange: (checked) => toggleActive.mutate({
										id: plan.id,
										active: checked
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: "outline",
									onClick: () => {
										if (editing === plan.id) {
											setEditing(null);
											return;
										}
										setEditing(plan.id);
										setDraft(toDraft(plan));
									},
									children: editing === plan.id ? "إغلاق" : "تعديل"
								})
							]
						})]
					}), editing === plan.id ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-4 border-t border-border pt-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DraftForm, {
							draft,
							onChange: setDraft,
							disabled: save.isPending
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							disabled: save.isPending,
							onClick: () => save.mutate({
								id: plan.id,
								draft
							}),
							children: "حفظ التعديلات"
						})]
					}) : null]
				}, plan.id))
			})
		]
	});
}
//#endregion
export { AdminBundlesPage as component };
