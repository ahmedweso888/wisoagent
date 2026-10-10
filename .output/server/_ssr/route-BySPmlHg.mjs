import { i as __toESM } from "../_runtime.mjs";
import { h as Outlet, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as DialogOverlay, c as DialogTrigger, i as DialogDescription, n as DialogClose, o as DialogPortal, r as DialogContent, s as DialogTitle, t as Dialog } from "../_libs/@radix-ui/react-dialog+[...].mjs";
import { t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { f as require_jsx_runtime } from "../_libs/@radix-ui/react-avatar+[...].mjs";
import { t as Button } from "./button-CAvS9N1W.mjs";
import { n as useAuth } from "./useAuth-BO86jEMb.mjs";
import { T as Menu, n as X } from "../_libs/lucide-react.mjs";
import { t as WisoMark } from "./WisoMark-DOvYZQdC.mjs";
import { t as captureReferralAttribution } from "./referral.functions-DlOABNG9.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/route-BySPmlHg.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Sheet = Dialog;
var SheetTrigger = DialogTrigger;
var SheetPortal = DialogPortal;
var SheetOverlay = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay, {
	className: cn("fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0", className),
	...props,
	ref
}));
SheetOverlay.displayName = DialogOverlay.displayName;
var sheetVariants = cva("fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500 data-[state=open]:animate-in data-[state=closed]:animate-out", {
	variants: { side: {
		top: "inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
		bottom: "inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
		left: "inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",
		right: "inset-y-0 right-0 h-full w-3/4 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm"
	} },
	defaultVariants: { side: "right" }
});
var SheetContent = import_react.forwardRef(({ side = "right", className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetOverlay, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
	ref,
	className: cn(sheetVariants({ side }), className),
	...props,
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogClose, {
		className: "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background cursor-pointer transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "sr-only",
			children: "Close"
		})]
	}), children]
})] }));
SheetContent.displayName = DialogContent.displayName;
var SheetHeader = ({ className, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	className: cn("flex flex-col space-y-2 text-center sm:text-left", className),
	...props
});
SheetHeader.displayName = "SheetHeader";
var SheetFooter = ({ className, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	className: cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className),
	...props
});
SheetFooter.displayName = "SheetFooter";
var SheetTitle = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
	ref,
	className: cn("text-lg font-semibold text-foreground", className),
	...props
}));
SheetTitle.displayName = DialogTitle.displayName;
var SheetDescription = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
	ref,
	className: cn("text-sm text-muted-foreground", className),
	...props
}));
SheetDescription.displayName = DialogDescription.displayName;
var NAV = [
	{
		to: "/dashboard",
		label: "الرئيسية"
	},
	{
		to: "/profile",
		label: "الملف الشخصي"
	},
	{
		to: "/plan",
		label: "خطة السنة الدراسية"
	},
	{
		to: "/generate",
		label: "مولد الأسئلة"
	},
	{
		to: "/wallet",
		label: "شحن المحفظة"
	},
	{
		to: "/requests",
		label: "الطلبات الخاصة"
	},
	{
		to: "/tools",
		label: "أدوات WISO"
	},
	{
		to: "/sprix",
		label: "الثقافة المالية"
	},
	{
		to: "/qureo",
		label: "Qureo"
	},
	{
		to: "/work-with-wiso",
		label: "اشتغل مع WISO"
	},
	{
		to: "/notifications",
		label: "الإشعارات"
	},
	{
		to: "/settings",
		label: "الإعدادات"
	}
];
var ADMIN_NAV = [
	{
		to: "/admin",
		label: "لوحة الإدارة"
	},
	{
		to: "/admin/notifications",
		label: "إشعارات الإدارة"
	},
	{
		to: "/admin/students",
		label: "الطلاب"
	},
	{
		to: "/admin/curriculum",
		label: "المناهج"
	},
	{
		to: "/admin/questions",
		label: "بنك الأسئلة"
	},
	{
		to: "/admin/bundles",
		label: "الباقات"
	},
	{
		to: "/admin/payments",
		label: "المدفوعات"
	},
	{
		to: "/admin/centers",
		label: "المراكز"
	},
	{
		to: "/admin/jobs",
		label: "مهام الذكاء"
	},
	{
		to: "/admin/ai",
		label: "إعدادات الذكاء"
	},
	{
		to: "/admin/requests",
		label: "الطلبات الخاصة"
	},
	{
		to: "/admin/center-requests",
		label: "طلبات السناتر"
	},
	{
		to: "/admin/tools",
		label: "أدوات WISO"
	},
	{
		to: "/admin/sprix",
		label: "SPRIX Legacy"
	},
	{
		to: "/admin/system",
		label: "إعدادات النظام"
	}
];
function NavLinks({ onNavigate, className }) {
	const { isAdmin } = useAuth();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("space-y-1.5", className),
		children: [NAV.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
			to: item.to,
			onClick: onNavigate,
			className: "block rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
			activeProps: { className: "bg-sidebar-primary text-sidebar-primary-foreground font-bold" },
			children: item.label
		}, item.to)), isAdmin ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "my-4 h-px bg-sidebar-border" }), ADMIN_NAV.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
			to: item.to,
			onClick: onNavigate,
			className: "block rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
			activeProps: { className: "bg-sidebar-primary text-sidebar-primary-foreground font-bold" },
			children: item.label
		}, item.to))] }) : null]
	});
}
function AuthedLayout() {
	const [open, setOpen] = (0, import_react.useState)(false);
	const { profile, user } = useAuth();
	(0, import_react.useEffect)(() => {
		if (!user) return;
		const code = localStorage.getItem("wiso_referral_code");
		if (!code) return;
		captureReferralAttribution({ data: { code } }).then(() => localStorage.removeItem("wiso_referral_code")).catch(() => {});
	}, [user]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		dir: "rtl",
		className: "min-h-screen bg-background lg:grid lg:grid-cols-[17rem_minmax(0,1fr)]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
			className: "sticky top-0 hidden h-screen overflow-y-auto bg-sidebar px-4 py-5 text-sidebar-foreground lg:flex lg:flex-col",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/dashboard",
					className: "flex items-center gap-3 border-b border-sidebar-border px-2 pb-5 font-display font-bold",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WisoMark, { className: "h-9 w-14" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "وكيلك الدراسي" })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
					className: "mt-5 flex-1",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavLinks, {})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "border-t border-sidebar-border px-3 pt-4 text-xs text-sidebar-foreground/45",
					children: "لو  مغيرتش حاجه . مفيش حاجه هتتغير....."
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-w-0",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
				className: "sticky top-0 z-40 border-b border-border bg-background/92 backdrop-blur-xl",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto grid max-w-7xl grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-4 py-2.5 lg:px-8",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/dashboard",
							className: "lg:hidden",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WisoMark, { className: "h-8 w-12" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "min-w-0 truncate text-xs font-semibold text-muted-foreground sm:text-sm",
							children: profile?.full_name ? `أهلاً، ${profile.full_name.split(" ")[0]}` : "أهلاً بيك في WISO"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Sheet, {
							open,
							onOpenChange: setOpen,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetTrigger, {
								asChild: true,
								className: "lg:hidden",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "ghost",
									size: "icon",
									"aria-label": "فتح القائمة",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Menu, { className: "size-5" })
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetContent, {
								side: "left",
								className: "w-72 border-sidebar-border bg-sidebar text-sidebar-foreground",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-8",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mb-5 flex items-center gap-3 border-b border-sidebar-border pb-5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WisoMark, { className: "h-9 w-14" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-display font-bold",
											children: "WISO"
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavLinks, { onNavigate: () => setOpen(false) })]
								})
							})]
						})
					]
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {})]
		})]
	});
}
//#endregion
export { AuthedLayout as component };
