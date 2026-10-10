import { i as __toESM } from "../_runtime.mjs";
import { g as Navigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as adminGenerateCenterCodes, l as adminGetCenterCodes, t as adminCreateCenter, u as adminGetCenters, y as adminGetPlans } from "./admin.functions-DOqjuAPc.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { f as require_jsx_runtime } from "../_libs/@radix-ui/react-avatar+[...].mjs";
import { t as Button } from "./button-CAvS9N1W.mjs";
import { t as Label } from "./label-DBD1bRRP.mjs";
import { t as Skeleton } from "./skeleton-D9W9wFsj.mjs";
import { t as PageHeader } from "./PageHeader-DhP6ZZXs.mjs";
import { t as Badge } from "./badge-DovwySyz.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as useAuth } from "./useAuth-BO86jEMb.mjs";
import { t as EmptyState } from "./EmptyState-Dyw3WASN.mjs";
import { t as Input } from "./input-DC57PAAM.mjs";
import { J as Building2 } from "../_libs/lucide-react.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-Cfotl7s5.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin.centers-FFsh-UZi.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AdminCentersPage() {
	const { isAdmin } = useAuth();
	const qc = useQueryClient();
	const [centerName, setCenterName] = (0, import_react.useState)("");
	const [selectedCenter, setSelectedCenter] = (0, import_react.useState)("");
	const [selectedPlan, setSelectedPlan] = (0, import_react.useState)("");
	const [codeType, setCodeType] = (0, import_react.useState)("question");
	const [expiresAt, setExpiresAt] = (0, import_react.useState)("");
	const [sprixAccessDays, setSprixAccessDays] = (0, import_react.useState)("30");
	const [count, setCount] = (0, import_react.useState)("10");
	const centersQuery = useQuery({
		queryKey: ["admin", "centers"],
		enabled: isAdmin,
		queryFn: async () => {
			return adminGetCenters();
		}
	});
	const plansQuery = useQuery({
		queryKey: ["admin", "plans"],
		enabled: isAdmin,
		queryFn: async () => {
			return adminGetPlans();
		}
	});
	const codesQuery = useQuery({
		queryKey: [
			"admin",
			"center-codes",
			selectedCenter
		],
		enabled: isAdmin,
		queryFn: async () => {
			return adminGetCenterCodes({ data: selectedCenter ? { centerId: selectedCenter } : {} });
		}
	});
	const createCenter = useMutation({
		mutationFn: async (name) => {
			await adminCreateCenter({ data: { name } });
		},
		onSuccess: () => {
			toast.success("تم إنشاء المركز");
			setCenterName("");
			qc.invalidateQueries({ queryKey: ["admin", "centers"] });
		},
		onError: (e) => toast.error(e.message)
	});
	const generate = useMutation({
		mutationFn: async (params) => {
			return await adminGenerateCenterCodes({ data: params });
		},
		onSuccess: (made) => {
			toast.success(`تم توليد ${made} كود`);
			qc.invalidateQueries({ queryKey: ["admin", "center-codes"] });
		},
		onError: (e) => toast.error(e.message === "forbidden" ? "هذه العملية للمشرفين فقط" : e.message)
	});
	if (!isAdmin) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, { to: "/dashboard" });
	const codes = codesQuery.data ?? [];
	const used = codes.filter((c) => c.used_by).length;
	const centerName_ = (id) => centersQuery.data?.find((c) => c.id === id)?.name ?? "—";
	const exportCsv = () => {
		const header = "code,type,center,plan,status,expires_at,used_by,used_at,created_at";
		const lines = codes.map((c) => [
			c.code,
			c.code_type,
			centerName_(c.center_id),
			plansQuery.data?.find((p) => p.id === c.plan_id)?.name_ar ?? "",
			c.used_by ? "used" : new Date(c.expires_at ?? 0).getTime() <= Date.now() && c.expires_at ? "expired" : "available",
			c.expires_at ?? "",
			c.used_by_name ?? c.used_by ?? "",
			c.used_at ?? "",
			c.created_at
		].join(","));
		const blob = new Blob([[header, ...lines].join("\n")], { type: "text/csv;charset=utf-8" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = "wiso-center-codes.csv";
		a.click();
		URL.revokeObjectURL(url);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		dir: "rtl",
		className: "page-shell",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				title: "المراكز وأكواد التفعيل",
				subtitle: "كل كود يُستخدم مرة واحدة فقط ويمنح الطالب الباقة المرتبطة به."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "surface-panel mt-6 space-y-3 p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-base font-semibold",
					children: "إضافة مركز"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: centerName,
						onChange: (e) => setCenterName(e.target.value),
						placeholder: "اسم المركز",
						className: "max-w-xs"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						disabled: !centerName.trim() || createCenter.isPending,
						onClick: () => createCenter.mutate(centerName),
						children: "إنشاء"
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "surface-panel mt-5 space-y-4 p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-base font-semibold",
						children: "توليد أكواد"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									className: "text-xs text-muted-foreground",
									children: "نوع الكود"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: codeType,
									onValueChange: (v) => setCodeType(v),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: "question",
										children: "WISO Question"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: "sprix",
										children: "WISO SPRIX Agent"
									})] })]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									className: "text-xs text-muted-foreground",
									children: "المركز"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: selectedCenter,
									onValueChange: setSelectedCenter,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "اختر المركز" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: (centersQuery.data ?? []).map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: c.id,
										children: c.name
									}, c.id)) })]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									className: "text-xs text-muted-foreground",
									children: "الباقة"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: selectedPlan,
									onValueChange: setSelectedPlan,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "اختر الباقة" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: (plansQuery.data ?? []).map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: p.id,
										children: p.name_ar
									}, p.id)) })]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									className: "text-xs text-muted-foreground",
									children: "عدد الأكواد"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: count,
									inputMode: "numeric",
									onChange: (e) => setCount(e.target.value)
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									className: "text-xs text-muted-foreground",
									children: "انتهاء الكود (اختياري)"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									type: "datetime-local",
									value: expiresAt,
									onChange: (e) => setExpiresAt(e.target.value)
								})]
							}),
							codeType !== "question" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									className: "text-xs text-muted-foreground",
									children: "صلاحية الأداة بالأيام"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									type: "number",
									min: 1,
									max: 3650,
									value: sprixAccessDays,
									onChange: (e) => setSprixAccessDays(e.target.value)
								})]
							}) : null
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						disabled: !selectedCenter || codeType === "question" && !selectedPlan || generate.isPending,
						onClick: () => generate.mutate({
							center: selectedCenter,
							plan: codeType === "question" ? selectedPlan : null,
							count: Number(count) || 0,
							codeType,
							expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
							sprixAccessDays: codeType !== "question" ? Number(sprixAccessDays) || 30 : null
						}),
						children: "توليد الأكواد"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-8 flex flex-wrap items-center justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: codesQuery.isPending ? "جارٍ تحميل الأكواد..." : `${codes.length} كود · ${used} مستخدم · ${codes.length - used} متاح`
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					size: "sm",
					disabled: !codes.length,
					onClick: exportCsv,
					children: "تصدير CSV"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 space-y-2",
				children: codesQuery.isPending ? Array.from({ length: 5 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-14 w-full" }, i)) : codesQuery.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-destructive",
					children: "تعذّر تحميل الأكواد."
				}) : !codes.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
					icon: Building2,
					title: "لا توجد أكواد",
					description: "اختر مركزاً وباقة ثم ولّد الأكواد."
				}) : codes.map((code) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "surface-panel flex flex-wrap items-center justify-between gap-3 p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
							className: "font-mono text-sm",
							children: code.code
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 text-xs text-muted-foreground",
							children: [
								code.code_type === "sprix" ? "SPRIX Agent" : "Question",
								" · ",
								centerName_(code.center_id),
								code.expires_at ? ` · ينتهي ${new Date(code.expires_at).toLocaleString("ar-EG")}` : ""
							]
						})] }),
						code.used_by ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-xs text-muted-foreground",
							children: [code.used_by_name || "طالب", code.used_by_user_code ? ` · #${code.used_by_user_code}` : ""]
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: code.used_by ? "secondary" : code.expires_at && new Date(code.expires_at).getTime() <= Date.now() ? "destructive" : "default",
							children: code.used_by ? `مستخدم${code.used_at ? " · " + new Date(code.used_at).toLocaleDateString("ar-EG") : ""}` : code.expires_at && new Date(code.expires_at).getTime() <= Date.now() ? "منتهي" : "متاح"
						})
					]
				}, code.id))
			})
		]
	});
}
//#endregion
export { AdminCentersPage as component };
