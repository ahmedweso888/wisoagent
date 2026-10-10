import { i as __toESM } from "../_runtime.mjs";
import { b as Navigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { C as adminGetRevenueSummary, H as adminUpdateContestSettings, R as adminSendNotification, U as adminUpdatePdfSettings, W as adminUpdatePlatformSettings, b as adminGetPlatformSettings, d as adminGetContestEntriesCount, f as adminGetContestSettings, v as adminGetPdfSettings } from "./admin.functions-DKdO8Tg0.mjs";
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
import { t as Input } from "./input-DC57PAAM.mjs";
import { t as Textarea } from "./textarea-DorwVIRG.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-Cfotl7s5.mjs";
import { t as StatCard } from "./StatCard-DTaJ4i7N.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin.system-Ds_olGd1.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var STATUS_LABEL = {
	open: "مفتوحة",
	closed: "مغلقة",
	maintenance: "صيانة"
};
function AdminSystemPage() {
	const { isAdmin } = useAuth();
	const qc = useQueryClient();
	const [message, setMessage] = (0, import_react.useState)(null);
	const [threshold, setThreshold] = (0, import_react.useState)(null);
	const [prize, setPrize] = (0, import_react.useState)(null);
	const [pdfDraft, setPdfDraft] = (0, import_react.useState)({});
	const [notificationAudience, setNotificationAudience] = (0, import_react.useState)("all");
	const [notificationUserId, setNotificationUserId] = (0, import_react.useState)("");
	const [notificationStageId, setNotificationStageId] = (0, import_react.useState)("");
	const [notificationTrackId, setNotificationTrackId] = (0, import_react.useState)("");
	const [notificationTitle, setNotificationTitle] = (0, import_react.useState)("");
	const [notificationBody, setNotificationBody] = (0, import_react.useState)("");
	const pdfSettings = useQuery({
		queryKey: ["admin", "pdf-settings"],
		enabled: isAdmin,
		queryFn: () => adminGetPdfSettings()
	});
	const updatePdf = useMutation({
		mutationFn: async () => {
			const values = {
				...pdfSettings.data ?? {},
				...pdfDraft
			};
			return adminUpdatePdfSettings({ data: {
				pdf_enabled: values["pdf_enabled"] ?? "true",
				pdf_credit_cost: values["pdf_credit_cost"] ?? "1",
				pdf_supported_types: values["pdf_supported_types"] || "[\"worksheet\",\"exam\"]",
				pdf_default_title: values["pdf_default_title"] || "ورقة أسئلة WISO",
				pdf_footer_notice: values["pdf_footer_notice"] || "WISO Agent — للاستخدام التعليمي الشخصي",
				pdf_promotional_text: values["pdf_promotional_text"] || ""
			} });
		},
		onSuccess: () => {
			setPdfDraft({});
			qc.invalidateQueries({ queryKey: ["admin", "pdf-settings"] });
			toast.success("تم حفظ إعدادات PDF");
		},
		onError: (error) => {
			toast.error(error.message);
		}
	});
	const platformQuery = useQuery({
		queryKey: ["admin", "platform-settings"],
		enabled: isAdmin,
		queryFn: () => adminGetPlatformSettings()
	});
	const contestQuery = useQuery({
		queryKey: ["admin", "contest-settings"],
		enabled: isAdmin,
		queryFn: () => adminGetContestSettings()
	});
	const entriesQuery = useQuery({
		queryKey: ["admin", "contest-entries-count"],
		enabled: isAdmin,
		queryFn: () => adminGetContestEntriesCount()
	});
	const revenueQuery = useQuery({
		queryKey: ["admin", "revenue"],
		enabled: isAdmin,
		queryFn: () => adminGetRevenueSummary()
	});
	const updatePlatform = useMutation({
		mutationFn: async (patch) => {
			return adminUpdatePlatformSettings({ data: patch });
		},
		onSuccess: (data) => {
			qc.setQueryData(["admin", "platform-settings"], data);
			toast.success("تم حفظ إعدادات المنصة");
		},
		onError: (error) => {
			const message = error.message === "forbidden" ? "هذه العملية للمشرفين فقط" : error.message;
			toast.error(message);
		}
	});
	const updateContest = useMutation({
		mutationFn: async (patch) => {
			return adminUpdateContestSettings({ data: {
				...patch.enabled !== void 0 ? { enabled: patch.enabled } : {},
				...patch.verified_students_threshold !== void 0 ? { verified_students_threshold: patch.verified_students_threshold } : {},
				...patch.prize_egp !== void 0 ? { prize_egp: patch.prize_egp } : {}
			} });
		},
		onSuccess: (data) => {
			qc.setQueryData(["admin", "contest-settings"], data);
			setThreshold(null);
			setPrize(null);
			toast.success("تم حفظ إعدادات المسابقة");
		},
		onError: (error) => {
			toast.error(error.message);
		}
	});
	const sendNotification = useMutation({
		mutationFn: () => adminSendNotification({ data: {
			audience: notificationAudience,
			...notificationUserId ? { userId: notificationUserId } : {},
			...notificationStageId ? { stageId: notificationStageId } : {},
			...notificationTrackId ? { trackId: notificationTrackId } : {},
			title: notificationTitle,
			body: notificationBody
		} }),
		onSuccess: (result) => {
			toast.success(`تم إرسال الإشعار إلى ${result.sent} طالب`);
			setNotificationTitle("");
			setNotificationBody("");
		},
		onError: (error) => toast.error(error.message)
	});
	if (!isAdmin) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, { to: "/dashboard" });
	const platform = platformQuery.data;
	const contest = contestQuery.data;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		dir: "rtl",
		className: "page-shell max-w-5xl",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				title: "إعدادات النظام",
				subtitle: "حالة المنصة، وضع الصيانة، المسابقة الشهرية، وملخص الإيرادات الفعلي."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "surface-panel mt-6 space-y-5 p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-base font-semibold",
					children: "حالة المنصة"
				}), platformQuery.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-28 w-full" }) : platformQuery.isError || !platform ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-destructive",
					children: "تعذّر تحميل إعدادات المنصة."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-4 sm:grid-cols-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							className: "text-xs text-muted-foreground",
							children: "الحالة"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: platform.platform_status,
							onValueChange: (value) => updatePlatform.mutate({ _status: value }),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: Object.keys(STATUS_LABEL).map((status) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: status,
								children: STATUS_LABEL[status]
							}, status)) })]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between gap-4 pt-6",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							className: "text-sm",
							children: "وضع الصيانة"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
							checked: platform.maintenance_mode,
							disabled: updatePlatform.isPending,
							onCheckedChange: (checked) => updatePlatform.mutate({ _maintenance: checked })
						})]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-1.5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							className: "text-xs text-muted-foreground",
							children: "رسالة الصيانة"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
							value: message ?? platform.maintenance_message ?? "",
							onChange: (event) => setMessage(event.target.value),
							rows: 3
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							className: "mt-2",
							disabled: updatePlatform.isPending || message === null,
							onClick: () => updatePlatform.mutate({ _message: message ?? "" }),
							children: "حفظ الرسالة"
						})
					]
				})] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "surface-panel mt-5 space-y-4 p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-base font-semibold",
						children: "ملفات PDF"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-xs text-muted-foreground",
						children: "العلامة المائية والملكية إلزاميتان دائماً ولا يمكن تعطيلهما."
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between gap-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "تفعيل التصدير" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
							checked: (pdfDraft["pdf_enabled"] ?? pdfSettings.data?.["pdf_enabled"] ?? "true") === "true",
							onCheckedChange: (checked) => setPdfDraft((old) => ({
								...old,
								pdf_enabled: String(checked)
							}))
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-4 sm:grid-cols-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "تكلفة الملف من رصيد PDF" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									inputMode: "numeric",
									value: pdfDraft["pdf_credit_cost"] ?? pdfSettings.data?.["pdf_credit_cost"] ?? "1",
									onChange: (event) => setPdfDraft((old) => ({
										...old,
										pdf_credit_cost: event.target.value
									}))
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "الأنواع المدعومة (JSON)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									dir: "ltr",
									value: pdfDraft["pdf_supported_types"] ?? pdfSettings.data?.["pdf_supported_types"] ?? "[\"worksheet\",\"exam\"]",
									onChange: (event) => setPdfDraft((old) => ({
										...old,
										pdf_supported_types: event.target.value
									}))
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "العنوان الافتراضي" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: pdfDraft["pdf_default_title"] ?? pdfSettings.data?.["pdf_default_title"] ?? "",
									onChange: (event) => setPdfDraft((old) => ({
										...old,
										pdf_default_title: event.target.value
									}))
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "نص التذييل" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: pdfDraft["pdf_footer_notice"] ?? pdfSettings.data?.["pdf_footer_notice"] ?? "",
									onChange: (event) => setPdfDraft((old) => ({
										...old,
										pdf_footer_notice: event.target.value
									}))
								})]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "نص ترويجي / مسابقة اختياري" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
							value: pdfDraft["pdf_promotional_text"] ?? pdfSettings.data?.["pdf_promotional_text"] ?? "",
							onChange: (event) => setPdfDraft((old) => ({
								...old,
								pdf_promotional_text: event.target.value
							}))
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						disabled: updatePdf.isPending || Object.keys(pdfDraft).length === 0,
						onClick: () => updatePdf.mutate(),
						children: "حفظ إعدادات PDF"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "surface-panel mt-5 space-y-4 p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-base font-semibold",
					children: "المسابقة الشهرية"
				}), contestQuery.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-24 w-full" }) : contestQuery.isError || !contest ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-destructive",
					children: "تعذّر تحميل إعدادات المسابقة."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between gap-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							className: "text-sm",
							children: "تفعيل المسابقة"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
							checked: contest.enabled,
							disabled: updateContest.isPending,
							onCheckedChange: (checked) => updateContest.mutate({ enabled: checked })
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-3 sm:grid-cols-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								className: "text-xs text-muted-foreground",
								children: "عدد الطلاب المطلوب لانطلاق المسابقة"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: threshold ?? String(contest.verified_students_threshold),
								inputMode: "numeric",
								onChange: (event) => setThreshold(event.target.value)
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								className: "text-xs text-muted-foreground",
								children: "قيمة الجائزة (ج.م)"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: prize ?? String(contest.prize_egp),
								inputMode: "decimal",
								onChange: (event) => setPrize(event.target.value)
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm text-muted-foreground",
						children: [
							"المشتركون حالياً:",
							" ",
							entriesQuery.data ?? 0,
							" من",
							" ",
							contest.verified_students_threshold
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						disabled: updateContest.isPending || threshold === null && prize === null,
						onClick: () => updateContest.mutate({
							verified_students_threshold: threshold === null ? contest.verified_students_threshold : Number(threshold) || 0,
							prize_egp: prize === null ? contest.prize_egp : Number(prize) || 0
						}),
						children: "حفظ إعدادات المسابقة"
					})
				] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "surface-panel mt-5 space-y-4 p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-base font-semibold",
						children: "إرسال إشعار للطلاب"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-3 sm:grid-cols-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: notificationAudience,
								onValueChange: (v) => setNotificationAudience(v),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: "all",
										children: "كل الطلاب"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: "user",
										children: "طالب محدد"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: "stage",
										children: "مرحلة دراسية"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: "track",
										children: "شعبة / تخصص"
									})
								] })]
							}),
							notificationAudience === "user" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: notificationUserId,
								onChange: (e) => setNotificationUserId(e.target.value),
								placeholder: "معرّف الطالب"
							}) : null,
							notificationAudience === "stage" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: notificationStageId,
								onChange: (e) => setNotificationStageId(e.target.value),
								placeholder: "معرّف المرحلة"
							}) : null,
							notificationAudience === "track" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: notificationTrackId,
								onChange: (e) => setNotificationTrackId(e.target.value),
								placeholder: "معرّف الشعبة"
							}) : null
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: notificationTitle,
						onChange: (e) => setNotificationTitle(e.target.value),
						placeholder: "عنوان الإشعار"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
						value: notificationBody,
						onChange: (e) => setNotificationBody(e.target.value),
						placeholder: "نص الإشعار"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						disabled: sendNotification.isPending || !notificationTitle.trim() || !notificationBody.trim(),
						onClick: () => sendNotification.mutate(),
						children: "إرسال الإشعار"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-8",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-base font-semibold",
					children: "ملخص الإيرادات"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4",
					children: revenueQuery.isPending ? Array.from({ length: 4 }).map((_, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-28 w-full" }, index)) : revenueQuery.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-destructive",
						children: "تعذّر تحميل الإيرادات."
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
							label: "إجمالي الإيرادات",
							value: `${revenueQuery.data?.total_revenue ?? 0} ج.م`,
							tone: "success"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
							label: "إيرادات معلّقة",
							value: `${revenueQuery.data?.pending_revenue ?? 0} ج.م`,
							tone: "accent"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
							label: "أكواد مستخدمة",
							value: revenueQuery.data?.codes_used ?? 0
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
							label: "إجمالي الأكواد",
							value: revenueQuery.data?.codes_total ?? 0
						})
					] })
				})]
			})
		]
	});
}
//#endregion
export { AdminSystemPage as component };
