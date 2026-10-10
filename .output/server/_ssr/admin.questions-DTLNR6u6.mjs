import { i as __toESM } from "../_runtime.mjs";
import { g as Navigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { S as adminGetQuestionSubjects, x as adminGetQuestionBank } from "./admin.functions-DOqjuAPc.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { f as require_jsx_runtime } from "../_libs/@radix-ui/react-avatar+[...].mjs";
import { t as Label } from "./label-DBD1bRRP.mjs";
import { t as Skeleton } from "./skeleton-D9W9wFsj.mjs";
import { t as PageHeader } from "./PageHeader-DhP6ZZXs.mjs";
import { t as Badge } from "./badge-DovwySyz.mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { n as useAuth } from "./useAuth-BO86jEMb.mjs";
import { t as EmptyState } from "./EmptyState-Dyw3WASN.mjs";
import { t as Input } from "./input-DC57PAAM.mjs";
import { X as BookOpenCheck } from "../_libs/lucide-react.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-Cfotl7s5.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin.questions-DTLNR6u6.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var DIFFICULTY_LABEL = {
	basic: "سهل",
	medium: "متوسط",
	hard: "صعب",
	very_hard: "صعب جداً",
	nightmare: "تعجيزي"
};
var PAGE_SIZE = 25;
function AdminQuestionBankPage() {
	const { isAdmin } = useAuth();
	const [subjectId, setSubjectId] = (0, import_react.useState)("all");
	const [difficulty, setDifficulty] = (0, import_react.useState)("all");
	const [search, setSearch] = (0, import_react.useState)("");
	const [page, setPage] = (0, import_react.useState)(0);
	const subjectsQuery = useQuery({
		queryKey: ["admin", "subjects"],
		enabled: isAdmin,
		queryFn: async () => {
			return adminGetQuestionSubjects();
		}
	});
	const bankQuery = useQuery({
		queryKey: [
			"admin",
			"question-bank",
			subjectId,
			difficulty,
			search,
			page
		],
		enabled: isAdmin,
		queryFn: async () => {
			return adminGetQuestionBank({ data: {
				...subjectId !== "all" ? { subjectId } : {},
				...difficulty !== "all" ? { difficulty } : {},
				...search.trim() ? { search } : {},
				page,
				pageSize: PAGE_SIZE
			} });
		}
	});
	if (!isAdmin) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, { to: "/dashboard" });
	const subjectName = (id) => subjectsQuery.data?.find((s) => s.id === id)?.name_ar ?? "—";
	const total = bankQuery.data?.count ?? 0;
	const lastPage = Math.max(0, Math.ceil(total / PAGE_SIZE) - 1);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		dir: "rtl",
		className: "page-shell",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				title: "بنك الأسئلة",
				subtitle: "بنك WISO هو مصدر إعادة الاستخدام قبل أي توليد جديد. الأسئلة تُنشأ وتُعتمد عبر محرك WISO فقط."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "surface-panel mt-6 grid gap-3 p-5 sm:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							className: "text-xs text-muted-foreground",
							children: "المادة"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: subjectId,
							onValueChange: (v) => {
								setSubjectId(v);
								setPage(0);
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "كل المواد" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "all",
								children: "كل المواد"
							}), (subjectsQuery.data ?? []).map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: s.id,
								children: s.name_ar
							}, s.id))] })]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							className: "text-xs text-muted-foreground",
							children: "مستوى الصعوبة"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: difficulty,
							onValueChange: (v) => {
								setDifficulty(v);
								setPage(0);
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "كل المستويات" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "all",
								children: "كل المستويات"
							}), Object.keys(DIFFICULTY_LABEL).map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: d,
								children: DIFFICULTY_LABEL[d]
							}, d))] })]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							className: "text-xs text-muted-foreground",
							children: "بحث في نص السؤال"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: search,
							onChange: (e) => {
								setSearch(e.target.value);
								setPage(0);
							},
							placeholder: "اكتب كلمة من السؤال"
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 text-sm text-muted-foreground",
				children: bankQuery.isPending ? "جارٍ التحميل..." : `${total} سؤال مطابق`
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 space-y-3",
				children: bankQuery.isPending ? Array.from({ length: 5 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-24 w-full" }, i)) : bankQuery.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-destructive",
					children: "تعذّر تحميل بنك الأسئلة."
				}) : !bankQuery.data?.rows.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
					icon: BookOpenCheck,
					title: "لا توجد أسئلة مطابقة",
					description: "جرّب تغيير الفلاتر، أو انتظر حتى يولّد المحرك أسئلة جديدة."
				}) : bankQuery.data.rows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
					className: "surface-panel space-y-2 p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-start justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "max-w-3xl text-sm font-medium leading-7",
								children: row.prompt
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: "secondary",
									children: DIFFICULTY_LABEL[row.difficulty]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: row.quality_status === "approved" ? "default" : "outline",
									children: row.quality_status === "approved" ? "معتمد" : row.quality_status
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-muted-foreground",
							children: [
								subjectName(row.subject_id),
								row.lesson_key ? ` · درس ${row.lesson_key}` : "",
								row.school_year ? ` · ${row.school_year}` : "",
								row.track ? ` · ${row.track}` : "",
								" · استُخدم ",
								row.usage_count,
								" مرة ·",
								" ",
								new Date(row.created_at).toLocaleDateString("ar-EG")
							]
						}),
						row.concepts?.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-muted-foreground",
							children: ["المفاهيم: ", row.concepts.join("، ")]
						}) : null,
						row.source_label ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-muted-foreground",
							children: [
								"المصدر: ",
								row.source_label,
								row.source_page_from ? ` · صفحات ${row.source_page_from}${row.source_page_to && row.source_page_to !== row.source_page_from ? `–${row.source_page_to}` : ""}` : ""
							]
						}) : null
					]
				}, row.id))
			}),
			total > PAGE_SIZE ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 flex items-center justify-between gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "text-sm text-primary disabled:text-muted-foreground",
						disabled: page === 0,
						onClick: () => setPage((p) => Math.max(0, p - 1)),
						children: "السابق"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-xs text-muted-foreground",
						children: [
							"صفحة ",
							page + 1,
							" من ",
							lastPage + 1
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "text-sm text-primary disabled:text-muted-foreground",
						disabled: page >= lastPage,
						onClick: () => setPage((p) => Math.min(lastPage, p + 1)),
						children: "التالي"
					})
				]
			}) : null
		]
	});
}
//#endregion
export { AdminQuestionBankPage as component };
