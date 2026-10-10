import { i as __toESM } from "../_runtime.mjs";
import { g as Navigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { E as adminGetSubjects, G as adminUpdateSubject, M as adminPrepareCurriculumUpload, N as adminProcessCurriculum, P as adminPublishCurriculumVersion, m as adminGetCurriculumVersions, n as adminCreateSubject, p as adminGetCurriculumContentCounts } from "./admin.functions-DOqjuAPc.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { f as require_jsx_runtime } from "../_libs/@radix-ui/react-avatar+[...].mjs";
import { t as Button } from "./button-CAvS9N1W.mjs";
import { t as Label } from "./label-DBD1bRRP.mjs";
import { t as Skeleton } from "./skeleton-D9W9wFsj.mjs";
import { t as PageHeader } from "./PageHeader-DhP6ZZXs.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as supabase } from "./client-DIXqhfAR.mjs";
import { n as useAuth } from "./useAuth-BO86jEMb.mjs";
import { t as EmptyState } from "./EmptyState-Dyw3WASN.mjs";
import { t as Input } from "./input-DC57PAAM.mjs";
import { E as Library } from "../_libs/lucide-react.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-Cfotl7s5.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin.curriculum-BBrlaMtN.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var EMPTY = {
	slug: "",
	name_ar: "",
	name_en: "",
	color: "#425722",
	icon: "book",
	sort_order: "0",
	visibility_scope: "all",
	academic_stage_id: "",
	academic_track_id: ""
};
var FIELDS = [
	{
		key: "name_ar",
		label: "الاسم بالعربية"
	},
	{
		key: "name_en",
		label: "الاسم بالإنجليزية"
	},
	{
		key: "slug",
		label: "المعرّف (slug)"
	},
	{
		key: "color",
		label: "اللون"
	},
	{
		key: "icon",
		label: "الأيقونة"
	},
	{
		key: "sort_order",
		label: "الترتيب"
	}
];
function rowOf(draft) {
	return {
		slug: draft.slug.trim(),
		name_ar: draft.name_ar.trim(),
		name_en: draft.name_en.trim(),
		color: draft.color.trim(),
		icon: draft.icon.trim(),
		sort_order: Number(draft.sort_order) || 0,
		visibility_scope: draft.visibility_scope,
		academic_stage_id: draft.academic_stage_id || null,
		academic_track_id: draft.academic_track_id || null
	};
}
function SubjectForm({ draft, onChange, disabled }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-3 sm:grid-cols-3",
		children: [
			FIELDS.map((field) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-1.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					className: "text-xs text-muted-foreground",
					children: field.label
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: draft[field.key],
					disabled,
					onChange: (e) => onChange({
						...draft,
						[field.key]: e.target.value
					})
				})]
			}, field.key)),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-1.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					className: "text-xs text-muted-foreground",
					children: "نطاق الظهور"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
					value: draft.visibility_scope,
					onValueChange: (value) => onChange({
						...draft,
						visibility_scope: value,
						academic_stage_id: value === "all" ? "" : draft.academic_stage_id,
						academic_track_id: value === "track" ? draft.academic_track_id : ""
					}),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: "all",
							children: "كل الطلاب"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: "stage",
							children: "مرحلة محددة"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: "track",
							children: "شعبة محددة"
						})
					] })]
				})]
			}),
			draft.visibility_scope !== "all" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-1.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					className: "text-xs text-muted-foreground",
					children: "معرّف المرحلة"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: draft.academic_stage_id,
					disabled,
					onChange: (e) => onChange({
						...draft,
						academic_stage_id: e.target.value,
						academic_track_id: ""
					})
				})]
			}) : null,
			draft.visibility_scope === "track" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-1.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					className: "text-xs text-muted-foreground",
					children: "معرّف الشعبة"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: draft.academic_track_id,
					disabled,
					onChange: (e) => onChange({
						...draft,
						academic_track_id: e.target.value
					})
				})]
			}) : null
		]
	});
}
function AdminCurriculumPage() {
	const { isAdmin } = useAuth();
	const qc = useQueryClient();
	const [creating, setCreating] = (0, import_react.useState)(false);
	const [newDraft, setNewDraft] = (0, import_react.useState)(EMPTY);
	const [editing, setEditing] = (0, import_react.useState)(null);
	const [draft, setDraft] = (0, import_react.useState)(EMPTY);
	const [uploadingSubject, setUploadingSubject] = (0, import_react.useState)(null);
	const [processingVersion, setProcessingVersion] = (0, import_react.useState)(null);
	const subjectsQuery = useQuery({
		queryKey: ["admin", "subjects"],
		enabled: isAdmin,
		queryFn: async () => {
			return adminGetSubjects();
		}
	});
	const versionsQuery = useQuery({
		queryKey: ["admin", "curriculum-versions"],
		enabled: isAdmin,
		queryFn: () => adminGetCurriculumVersions({ data: {} })
	});
	const uploadCurriculum = async (subjectId, file) => {
		if (file.type !== "application/pdf") throw new Error("ارفع ملف PDF فقط");
		if (file.size > 52428800) throw new Error("الملف أكبر من 50MB");
		setUploadingSubject(subjectId);
		try {
			const bytes = await file.arrayBuffer();
			const digest = await crypto.subtle.digest("SHA-256", bytes);
			const checksum = Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
			const prepared = await adminPrepareCurriculumUpload({ data: {
				subjectId,
				filename: file.name,
				checksumSha256: checksum
			} });
			const { error } = await supabase.storage.from("curriculum-books").uploadToSignedUrl(prepared.path, prepared.token, file);
			if (error) throw error;
			setProcessingVersion(prepared.versionId);
			await adminProcessCurriculum({ data: { versionId: prepared.versionId } });
			toast.success("تم رفع وتحليل المنهج");
			await qc.invalidateQueries({ queryKey: ["admin", "curriculum-versions"] });
		} finally {
			setUploadingSubject(null);
			setProcessingVersion(null);
		}
	};
	const processVersion = async (versionId) => {
		setProcessingVersion(versionId);
		try {
			await adminProcessCurriculum({ data: { versionId } });
			await qc.invalidateQueries({ queryKey: ["admin", "curriculum-versions"] });
			toast.success("تمت إعادة المعالجة");
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "تعذرت المعالجة");
		} finally {
			setProcessingVersion(null);
		}
	};
	const publishVersion = async (versionId) => {
		try {
			await adminPublishCurriculumVersion({ data: { versionId } });
			await qc.invalidateQueries({ queryKey: ["admin", "curriculum-versions"] });
			toast.success("تم نشر نسخة المنهج");
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "تعذر نشر المنهج");
		}
	};
	const contentQuery = useQuery({
		queryKey: ["admin", "curriculum-content"],
		enabled: isAdmin,
		queryFn: async () => {
			return adminGetCurriculumContentCounts();
		}
	});
	const invalidate = () => {
		qc.invalidateQueries({ queryKey: ["admin", "subjects"] });
		qc.invalidateQueries({ queryKey: ["subjects"] });
	};
	const create = useMutation({
		mutationFn: async (value) => {
			await adminCreateSubject({ data: rowOf(value) });
		},
		onSuccess: () => {
			toast.success("تمت إضافة المادة");
			setCreating(false);
			setNewDraft(EMPTY);
			invalidate();
		},
		onError: (e) => toast.error(e.message)
	});
	const save = useMutation({
		mutationFn: async (params) => {
			await adminUpdateSubject({ data: {
				id: params.id,
				patch: rowOf(params.draft)
			} });
		},
		onSuccess: () => {
			toast.success("تم حفظ المادة");
			setEditing(null);
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
				title: "المناهج والمواد",
				subtitle: "المواد تُدار من هنا. الوحدات والفصول والدروس تُستخرج من ملفات الطلاب وتظهر كأرقام فعلية.",
				actions: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: creating ? "outline" : "default",
					onClick: () => setCreating((v) => !v),
					children: creating ? "إلغاء" : "إضافة مادة"
				})
			}),
			creating ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "surface-panel mt-6 space-y-4 p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-base font-semibold",
						children: "مادة جديدة"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SubjectForm, {
						draft: newDraft,
						onChange: setNewDraft,
						disabled: create.isPending
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						disabled: create.isPending || !newDraft.name_ar.trim() || !newDraft.slug.trim(),
						onClick: () => create.mutate(newDraft),
						children: "حفظ المادة"
					})
				]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-6 space-y-4",
				children: subjectsQuery.isPending ? Array.from({ length: 4 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-24 w-full" }, i)) : subjectsQuery.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-destructive",
					children: "تعذّر تحميل المواد."
				}) : !subjectsQuery.data?.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
					icon: Library,
					title: "لا توجد مواد",
					description: "أضف أول مادة لبدء بناء المنهج."
				}) : subjectsQuery.data.map((subject) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "surface-panel space-y-4 p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-start justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-start gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "mt-1 size-3 rounded-full",
									style: { backgroundColor: subject.color },
									"aria-hidden": true
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "font-display text-base font-semibold",
										children: subject.name_ar
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-1 text-xs text-muted-foreground",
										children: [
											subject.name_en,
											" · ",
											subject.slug
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-2 text-sm text-muted-foreground",
										children: contentQuery.isPending ? "جارٍ حساب محتوى المنهج..." : `${contentQuery.data?.units[subject.id] ?? 0} وحدة · ${contentQuery.data?.chapters[subject.id] ?? 0} فصل · ${contentQuery.data?.topics[subject.id] ?? 0} درس · ${contentQuery.data?.bank[subject.id] ?? 0} سؤال في البنك`
									})
								] })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "outline",
								onClick: () => {
									if (editing === subject.id) {
										setEditing(null);
										return;
									}
									setEditing(subject.id);
									setDraft({
										slug: subject.slug,
										name_ar: subject.name_ar,
										name_en: subject.name_en,
										color: subject.color,
										icon: subject.icon,
										sort_order: String(subject.sort_order),
										visibility_scope: subject.visibility_scope ?? "all",
										academic_stage_id: subject.academic_stage_id ?? "",
										academic_track_id: subject.academic_track_id ?? ""
									});
								},
								children: editing === subject.id ? "إغلاق" : "تعديل"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center gap-2 rounded-lg border border-border p-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm",
								children: [uploadingSubject === subject.id ? "جاري الرفع والتحليل..." : "رفع منهج PDF", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "file",
									accept: "application/pdf",
									className: "hidden",
									disabled: uploadingSubject !== null,
									onChange: (e) => {
										const file = e.target.files?.[0];
										if (!file) return;
										uploadCurriculum(subject.id, file).catch((error) => toast.error(error instanceof Error ? error.message : "تعذر رفع المنهج"));
										e.currentTarget.value = "";
									}
								})]
							}), versionsQuery.data?.filter((v) => v.subject_id === subject.id).map((version) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2 text-xs text-muted-foreground",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
										"v",
										version.version,
										" · ",
										version.processing_status
									] }),
									version.processing_status === "failed" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: "outline",
										onClick: () => processVersion(version.id),
										disabled: processingVersion === version.id,
										children: "إعادة المحاولة"
									}) : null,
									version.processing_status === "completed" && !version.is_published ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										onClick: () => publishVersion(version.id),
										children: "نشر"
									}) : null
								]
							}, version.id))]
						}),
						editing === subject.id ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-4 border-t border-border pt-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SubjectForm, {
								draft,
								onChange: setDraft,
								disabled: save.isPending
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								disabled: save.isPending,
								onClick: () => save.mutate({
									id: subject.id,
									draft
								}),
								children: "حفظ التعديلات"
							})]
						}) : null
					]
				}, subject.id))
			})
		]
	});
}
//#endregion
export { AdminCurriculumPage as component };
