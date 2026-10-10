import { i as __toESM } from "../_runtime.mjs";
import { g as Navigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as DialogOverlay$1, i as DialogDescription$1, n as DialogClose, o as DialogPortal$1, r as DialogContent$1, s as DialogTitle$1, t as Dialog$1 } from "../_libs/@radix-ui/react-dialog+[...].mjs";
import { A as adminListUsers, B as adminSetSuspended, L as adminRevokeAccess, O as adminGetUserDetail, j as adminManageTrial, k as adminGrantAccess, z as adminSetRole } from "./admin.functions-DOqjuAPc.mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { f as require_jsx_runtime } from "../_libs/@radix-ui/react-avatar+[...].mjs";
import { t as Button } from "./button-CAvS9N1W.mjs";
import { t as Skeleton } from "./skeleton-D9W9wFsj.mjs";
import { t as PageHeader } from "./PageHeader-DhP6ZZXs.mjs";
import { t as Badge } from "./badge-DovwySyz.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as useAuth } from "./useAuth-BO86jEMb.mjs";
import { t as EmptyState } from "./EmptyState-Dyw3WASN.mjs";
import { t as Input } from "./input-DC57PAAM.mjs";
import { L as Clock, g as Search, m as ShieldCheck, n as X, p as ShieldOff } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin.students-BOODYxsY.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Dialog = Dialog$1;
var DialogPortal = DialogPortal$1;
var DialogOverlay = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay$1, {
	ref,
	className: cn("fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0", className),
	...props
}));
DialogOverlay.displayName = DialogOverlay$1.displayName;
var DialogContent = import_react.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent$1, {
	ref,
	className: cn("fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-lg", className),
	...props,
	children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogClose, {
		className: "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background cursor-pointer transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "sr-only",
			children: "Close"
		})]
	})]
})] }));
DialogContent.displayName = DialogContent$1.displayName;
var DialogHeader = ({ className, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	className: cn("flex flex-col space-y-1.5 text-center sm:text-left", className),
	...props
});
DialogHeader.displayName = "DialogHeader";
var DialogFooter = ({ className, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	className: cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className),
	...props
});
DialogFooter.displayName = "DialogFooter";
var DialogTitle = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle$1, {
	ref,
	className: cn("text-lg font-semibold leading-none tracking-tight", className),
	...props
}));
DialogTitle.displayName = DialogTitle$1.displayName;
var DialogDescription = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription$1, {
	ref,
	className: cn("text-sm text-muted-foreground", className),
	...props
}));
DialogDescription.displayName = DialogDescription$1.displayName;
function statusBadge(u) {
	if (u.suspended_at || u.platform_access_status === "suspended") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
		variant: "destructive",
		children: "موقوف"
	});
	if (u.permanent_access) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
		className: "bg-success text-success-foreground",
		children: "وصول دائم"
	});
	if (u.subscription_status === "active") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
		className: "bg-primary text-primary-foreground",
		children: "مشترك"
	});
	if (new Date(u.trial_expires_at) > /* @__PURE__ */ new Date()) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
		variant: "secondary",
		children: "تجربة سارية"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
		variant: "outline",
		children: "بلا وصول"
	});
}
function AdminStudentsPage() {
	const { isAdmin } = useAuth();
	const qc = useQueryClient();
	const [search, setSearch] = (0, import_react.useState)("");
	const [debounced, setDebounced] = (0, import_react.useState)("");
	const [selected, setSelected] = (0, import_react.useState)(null);
	const [suspendReason, setSuspendReason] = (0, import_react.useState)("");
	(0, import_react.useState)(() => {
		const t = setTimeout(() => setDebounced(search), 400);
		return () => clearTimeout(t);
	});
	const usersQuery = useQuery({
		queryKey: [
			"admin",
			"users",
			debounced
		],
		enabled: isAdmin,
		queryFn: async () => {
			return await adminListUsers({ data: {
				...debounced ? { search: debounced } : {},
				limit: 200
			} });
		}
	});
	const detailQuery = useQuery({
		queryKey: [
			"admin",
			"user-detail",
			selected
		],
		enabled: isAdmin && Boolean(selected),
		queryFn: async () => {
			return await adminGetUserDetail({ data: { target: selected } });
		}
	});
	const invalidate = () => {
		qc.invalidateQueries({ queryKey: ["admin", "users"] });
		qc.invalidateQueries({ queryKey: [
			"admin",
			"user-detail",
			selected
		] });
	};
	const grantAccess = useMutation({
		mutationFn: async (params) => {
			await adminGrantAccess({ data: params });
		},
		onSuccess: () => {
			toast.success("تم تحديث صلاحية الوصول");
			invalidate();
		},
		onError: (e) => toast.error(e.message === "forbidden" ? "هذه العملية للمشرفين فقط" : e.message)
	});
	const revokeAccess = useMutation({
		mutationFn: async (target) => {
			await adminRevokeAccess({ data: { target } });
		},
		onSuccess: () => {
			toast.success("تم سحب صلاحية الوصول");
			invalidate();
		},
		onError: (e) => toast.error(e.message)
	});
	const setSuspended = useMutation({
		mutationFn: async (params) => {
			await adminSetSuspended({ data: params });
		},
		onSuccess: (_data, vars) => {
			toast.success(vars.suspended ? "تم إيقاف الطالب" : "تم إلغاء الإيقاف");
			setSuspendReason("");
			invalidate();
		},
		onError: (e) => toast.error(e.message)
	});
	const manageTrial = useMutation({
		mutationFn: async (params) => {
			await adminManageTrial({ data: params });
		},
		onSuccess: () => {
			toast.success("تم تحديث التجربة المجانية");
			invalidate();
		},
		onError: (e) => toast.error(e.message)
	});
	const setRole = useMutation({
		mutationFn: async (params) => {
			await adminSetRole({ data: params });
		},
		onSuccess: (_data, vars) => {
			toast.success(vars.enabled ? "أصبح مشرفاً" : "أُزيلت صلاحية الإشراف");
			invalidate();
		},
		onError: (e) => toast.error(e.message)
	});
	if (!isAdmin) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, { to: "/dashboard" });
	const selectedUser = usersQuery.data?.find((u) => u.id === selected) ?? null;
	const detail = detailQuery.data;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		dir: "rtl",
		className: "page-shell",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				title: "إدارة الطلاب",
				subtitle: "بحث في الطلاب، تعديل الصلاحيات، التجربة المجانية، والإيقاف.",
				actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: search,
						onChange: (e) => setSearch(e.target.value),
						placeholder: "ابحث بالاسم أو البريد أو الكود",
						className: "w-64 pe-3 ps-9"
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-7",
				children: usersQuery.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "space-y-3",
					children: Array.from({ length: 6 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-16 w-full" }, i))
				}) : usersQuery.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-destructive",
					children: usersQuery.error instanceof Error && usersQuery.error.message === "forbidden" ? "هذه الصفحة متاحة للمشرفين فقط." : "تعذّر تحميل قائمة الطلاب."
				}) : !usersQuery.data || usersQuery.data.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
					icon: Search,
					title: "لا يوجد طلاب مطابقون",
					description: "جرّب كلمة بحث مختلفة."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "surface-panel overflow-x-auto",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
						className: "w-full min-w-[720px] text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "border-b border-border text-right text-muted-foreground",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "p-3 font-medium",
									children: "الطالب"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "p-3 font-medium",
									children: "الكود"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "p-3 font-medium",
									children: "الحالة"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "p-3 font-medium",
									children: "طلبات الذكاء"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "p-3 font-medium",
									children: "آخر نشاط"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { className: "p-3 font-medium" })
							]
						}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: usersQuery.data.map((u) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "border-b border-border last:border-0 hover:bg-muted/40",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
									className: "p-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "font-medium",
										children: u.full_name || "بدون اسم"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-xs text-muted-foreground",
										children: u.email
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "p-3 num text-muted-foreground",
									children: u.user_code
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "p-3",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex flex-wrap items-center gap-1.5",
										children: [statusBadge(u), u.is_admin ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
											variant: "outline",
											children: "مشرف"
										}) : null]
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "p-3 num",
									children: u.ai_requests
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "p-3 text-xs text-muted-foreground",
									children: u.last_active_at ? new Date(u.last_active_at).toLocaleString("ar-EG") : "—"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "p-3",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: "outline",
										onClick: () => setSelected(u.id),
										children: "التفاصيل"
									})
								})
							]
						}, u.id)) })]
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: Boolean(selected),
				onOpenChange: (open) => !open && setSelected(null),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "max-h-[85vh] max-w-2xl overflow-y-auto",
					dir: "rtl",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: selectedUser?.full_name || "تفاصيل الطالب" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: selectedUser?.email })] }), detailQuery.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-6 w-40" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-24 w-full" })]
					}) : detailQuery.isError || !detail ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-destructive",
						children: "تعذّر تحميل تفاصيل الطالب."
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-6",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
								className: "grid grid-cols-2 gap-3 sm:grid-cols-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MiniStat, {
										label: "الأسئلة المولّدة",
										value: detail.questions_total
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MiniStat, {
										label: "محاولات",
										value: detail.attempts_total
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MiniStat, {
										label: "إجابات صحيحة",
										value: detail.attempts_correct
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MiniStat, {
										label: "أخطاء",
										value: detail.mistakes_total
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MiniStat, {
										label: "صعب/صعب جداً",
										value: detail.hard_solved
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MiniStat, {
										label: "تعجيزي",
										value: detail.nightmare_solved
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MiniStat, {
										label: "مفاهيم ضعيفة",
										value: detail.weak_concepts
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MiniStat, {
										label: "طلبات ذكاء اصطناعي",
										value: detail.ai_requests
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
								className: "space-y-3 border-t border-border pt-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "text-sm font-semibold",
									children: "إجراءات الوصول"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-wrap gap-2",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
											size: "sm",
											disabled: grantAccess.isPending,
											onClick: () => grantAccess.mutate({
												target: detail.profile.id,
												days: 30
											}),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "ms-1.5 size-4" }), "منح 30 يوم"]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											size: "sm",
											variant: "secondary",
											disabled: grantAccess.isPending,
											onClick: () => grantAccess.mutate({
												target: detail.profile.id,
												permanent: true
											}),
											children: "منح وصول دائم"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
											size: "sm",
											variant: "outline",
											disabled: revokeAccess.isPending,
											onClick: () => revokeAccess.mutate(detail.profile.id),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldOff, { className: "ms-1.5 size-4" }), "سحب الوصول"]
										})
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
								className: "space-y-3 border-t border-border pt-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "text-sm font-semibold",
									children: "التجربة المجانية"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-wrap gap-2",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
											size: "sm",
											variant: "outline",
											disabled: manageTrial.isPending,
											onClick: () => manageTrial.mutate({
												target: detail.profile.id,
												action: "reset",
												hours: 24
											}),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "ms-1.5 size-4" }), "إعادة ضبط (24 ساعة)"]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											size: "sm",
											variant: "outline",
											disabled: manageTrial.isPending,
											onClick: () => manageTrial.mutate({
												target: detail.profile.id,
												action: "extend",
												hours: 24
											}),
											children: "تمديد 24 ساعة"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											size: "sm",
											variant: "ghost",
											disabled: manageTrial.isPending,
											onClick: () => manageTrial.mutate({
												target: detail.profile.id,
												action: "disable"
											}),
											children: "إنهاء التجربة"
										})
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
								className: "space-y-3 border-t border-border pt-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
										className: "text-sm font-semibold",
										children: "الإيقاف والصلاحيات"
									}),
									detail.profile.suspended_reason ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-xs text-muted-foreground",
										children: ["سبب الإيقاف السابق: ", detail.profile.suspended_reason]
									}) : null,
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex flex-wrap items-center gap-2",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												value: suspendReason,
												onChange: (e) => setSuspendReason(e.target.value),
												placeholder: "سبب الإيقاف (اختياري)",
												className: "w-56"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
												size: "sm",
												variant: "destructive",
												disabled: setSuspended.isPending,
												onClick: () => setSuspended.mutate({
													target: detail.profile.id,
													suspended: true,
													...suspendReason ? { reason: suspendReason } : {}
												}),
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "ms-1.5 size-4" }), "إيقاف الطالب"]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												size: "sm",
												variant: "outline",
												disabled: setSuspended.isPending,
												onClick: () => setSuspended.mutate({
													target: detail.profile.id,
													suspended: false
												}),
												children: "إلغاء الإيقاف"
											})
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "flex flex-wrap items-center gap-2 pt-2",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											size: "sm",
											variant: detail.is_admin ? "outline" : "secondary",
											disabled: setRole.isPending,
											onClick: () => setRole.mutate({
												target: detail.profile.id,
												enabled: !detail.is_admin
											}),
											children: detail.is_admin ? "إزالة صلاحية الإشراف" : "منح صلاحية الإشراف"
										})
									})
								]
							}),
							detail.audit.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
								className: "space-y-2 border-t border-border pt-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "text-sm font-semibold",
									children: "سجل الإجراءات الإدارية"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
									className: "space-y-1.5 text-xs text-muted-foreground",
									children: detail.audit.slice(0, 8).map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
										className: "flex items-center justify-between gap-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: a.action }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: new Date(a.created_at).toLocaleString("ar-EG") })]
									}, a.id))
								})]
							}) : null
						]
					})]
				})
			})
		]
	});
}
function MiniStat({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-xl bg-secondary/60 p-3 text-center",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "num font-display text-lg font-bold",
			children: value
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-[11px] text-muted-foreground",
			children: label
		})]
	});
}
//#endregion
export { AdminStudentsPage as component };
