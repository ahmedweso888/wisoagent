import { i as __toESM } from "../_runtime.mjs";
import { c as HeadContent, d as Outlet, f as lazyRouteComponent, h as Link, j as redirect, m as createRootRouteWithContext, p as createFileRoute, s as Scripts, u as createRouter, v as useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { f as require_jsx_runtime } from "../_libs/@radix-ui/react-avatar+[...].mjs";
import { r as QueryClientProvider } from "../_libs/tanstack__react-query.mjs";
import { t as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { t as Toaster } from "../_libs/sonner.mjs";
import { t as supabase } from "./client-DIXqhfAR.mjs";
import { t as AuthProvider } from "./useAuth-BO86jEMb.mjs";
import { t as WisoMark } from "./WisoMark-DOvYZQdC.mjs";
import { t as Route$33 } from "./invite._code-BEdR9vi4.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/router-B9uQRr1b.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var styles_default = "/assets/styles-CY3jlQ2e.css";
function reportLovableError(error, context = {}) {
	if (typeof window === "undefined") return;
	window.__lovableEvents?.captureException?.(error, {
		source: "react_error_boundary",
		route: window.location.pathname,
		...context
	}, {
		mechanism: "react_error_boundary",
		handled: false,
		severity: "error"
	});
	const message = error instanceof Response ? `Response ${error.status}${error.url ? ` at ${error.url}` : ""}` : error instanceof Error ? error.message : String(error);
	const stack = error instanceof Error ? error.stack : void 0;
	window.__lovableReportRuntimeError?.({
		message,
		...stack !== void 0 && { stack },
		filename: window.location.pathname
	});
}
var Toaster$1 = ({ ...props }) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster, {
		className: "toaster group",
		toastOptions: { classNames: {
			toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
			description: "group-[.toast]:text-muted-foreground",
			actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
			cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground"
		} },
		...props
	});
};
function NotFoundComponent() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-7xl font-bold text-foreground",
					children: "404"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-4 text-xl font-semibold text-foreground",
					children: "Page not found"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "The page you're looking for doesn't exist or has been moved."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-6",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "Go home"
					})
				})
			]
		})
	});
}
function ErrorComponent({ error, reset }) {
	console.error(error);
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		reportLovableError(error, { boundary: "tanstack_root_error_component" });
	}, [error]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-xl font-semibold tracking-tight text-foreground",
					children: "This page didn't load"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "Something went wrong on our end. You can try refreshing or head back home."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 flex flex-wrap justify-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => {
							router.invalidate();
							reset();
						},
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "Try again"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: "/",
						className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent",
						children: "Go home"
					})]
				})
			]
		})
	});
}
var Route$32 = createRootRouteWithContext()({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: "WISO Agent" },
			{
				name: "description",
				content: "وكيلك الذكي في رحلتك نحو التفوق."
			},
			{
				name: "author",
				content: "WISO"
			},
			{
				property: "og:title",
				content: "WISO Agent"
			},
			{
				property: "og:description",
				content: "وكيلك الذكي في رحلتك نحو التفوق."
			},
			{
				property: "og:type",
				content: "website"
			},
			{
				name: "twitter:card",
				content: "summary_large_image"
			}
		],
		links: [
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "icon",
				type: "image/png",
				href: "/favicon.png"
			},
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com"
			},
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous"
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800&family=Tajawal:wght@500;700;800&family=JetBrains+Mono:wght@400;500&display=swap"
			},
			{
				rel: "icon",
				href: "/favicon.ico",
				type: "image/x-icon"
			}
		]
	}),
	shellComponent: RootShell,
	component: RootComponent,
	notFoundComponent: NotFoundComponent,
	errorComponent: ErrorComponent
});
function RootShell({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "ar",
		dir: "rtl",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})] })]
	});
}
function RootComponent() {
	const { queryClient } = Route$32.useRouteContext();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QueryClientProvider, {
		client: queryClient,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AuthProvider, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster$1, { position: "top-center" })] })
	});
}
var $$splitComponentImporter$31 = () => import("./routes-BB500BTH.mjs");
var Route$31 = createFileRoute("/")({
	head: () => ({ meta: [
		{ title: "wiso agent - ويسو إيجنت" },
		{
			name: "description",
			content: "مش مجرد أسئلة وخلاص. WISO بيفهم منهجك، بيظبطلك خطة مذاكرة، وبيعرفك إيه اللي ناقصك وبيحتاج شغل."
		},
		{
			property: "og:title",
			content: "WISO Agent — مذاكرتك على مزاج مستواك"
		},
		{
			property: "og:description",
			content: "خطة مذاكرة، أسئلة، تحليل لأدائك، ومعرفة بنقط ضعفك — وكل ده بيتطور معاك."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$31, "component")
});
/** Section order and anchors are fixed in code; the copy is admin-managed. */
/**
* Reusable scroll reveal animation.
* Every section fades in and moves upward slightly when entering the viewport.
*/
var $$splitComponentImporter$30 = () => import("./route-DjwW265Y.mjs");
var Route$30 = createFileRoute("/_authenticated")({
	ssr: false,
	beforeLoad: async ({ location }) => {
		const { data, error } = await supabase.auth.getUser();
		if (error || !data.user) throw redirect({ to: "/auth" });
		const userId = data.user.id;
		const { data: roleRow, error: roleError } = await supabase.from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").maybeSingle();
		if (roleError) throw roleError;
		if (roleRow?.role === "admin") return {
			user: data.user,
			isAdmin: true
		};
		const { data: profile, error: profileError } = await supabase.from("profiles").select("onboarded_at, school_year").eq("id", userId).maybeSingle();
		if (profileError) throw profileError;
		if (location.pathname !== "/onboarding" && (!profile?.onboarded_at || !profile.school_year)) throw redirect({ to: "/onboarding" });
		return {
			user: data.user,
			isAdmin: false
		};
	},
	component: lazyRouteComponent($$splitComponentImporter$30, "component")
});
var $$splitComponentImporter$29 = () => import("./auth-Dewfhu3D.mjs");
var Route$29 = createFileRoute("/auth")({
	head: () => ({ meta: [
		{ title: "WISO — دخول الطلاب" },
		{
			name: "description",
			content: "سجّل دخولك أو اعمل حساب جديد، وخد كود طالب خاص بيك وتجربة 24 ساعة."
		},
		{
			property: "og:title",
			content: "WISO — دخول الطلاب"
		},
		{
			property: "og:description",
			content: "حساب واحد لخطة المعركة ومحرك الأسئلة التقيلة."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$29, "component")
});
var $$splitComponentImporter$28 = () => import("./center-request-DKlQHnK-.mjs");
var Route$28 = createFileRoute("/center-request")({ component: lazyRouteComponent($$splitComponentImporter$28, "component") });
var $$splitComponentImporter$27 = () => import("./dashboard-BH2K_hmN.mjs");
var Route$27 = createFileRoute("/_authenticated/dashboard")({
	head: () => ({ meta: [{ title: "الرئيسية — WISO" }, {
		name: "description",
		content: "لوحتك الدراسية في WISO."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$27, "component")
});
var $$splitComponentImporter$26 = () => import("./generate-B1798RwK.mjs");
var Route$26 = createFileRoute("/_authenticated/generate")({
	head: () => ({ meta: [{ title: "مولّد الأسئلة — WISO" }, {
		name: "description",
		content: "ولّد أسئلة متوافقة مع منهجك ومستواك الحقيقي."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$26, "component")
});
var $$splitComponentImporter$25 = () => import("./notifications-DDsX3S0A.mjs");
var Route$25 = createFileRoute("/_authenticated/notifications")({
	head: () => ({ meta: [
		{ title: "الإشعارات — WISO" },
		{
			name: "description",
			content: "تنبيهات خطتك وطلباتك وحسابك."
		},
		{
			property: "og:title",
			content: "الإشعارات — WISO"
		},
		{
			property: "og:description",
			content: "آخر تنبيهات WISO الدراسية."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$25, "component")
});
var $$splitComponentImporter$24 = () => import("./onboarding-B6JhqZSc.mjs");
var Route$24 = createFileRoute("/_authenticated/onboarding")({
	head: () => ({ meta: [
		{ title: "ابدأ رحلتك — WISO" },
		{
			name: "description",
			content: "سجّل بياناتك الدراسية عشان WISO يبني خطتك."
		},
		{
			property: "og:title",
			content: "ابدأ رحلتك — WISO"
		},
		{
			property: "og:description",
			content: "سجّل بياناتك الدراسية عشان WISO يبني خطتك."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$24, "component")
});
var $$splitComponentImporter$23 = () => import("./plan-DiGpySuz.mjs");
var Route$23 = createFileRoute("/_authenticated/plan")({
	head: () => ({ meta: [{ title: "خطة السنة الدراسية — WISO" }, {
		name: "description",
		content: "خطتك الدراسية المتكيفة من اليوم وحتى موعدك النهائي."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$23, "component")
});
var $$splitComponentImporter$22 = () => import("./profile-CiKu7wOG.mjs");
var Route$22 = createFileRoute("/_authenticated/profile")({
	head: () => ({ meta: [{ title: "الملف الشخصي — WISO" }, {
		name: "description",
		content: "بياناتك الدراسية ومستوى تقدمك في WISO."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$22, "component")
});
var $$splitComponentImporter$21 = () => import("./qureo-8AU9EjWB.mjs");
var Route$21 = createFileRoute("/_authenticated/qureo")({ component: lazyRouteComponent($$splitComponentImporter$21, "component") });
var $$splitComponentImporter$20 = () => import("./requests-BodVOk_V.mjs");
var Route$20 = createFileRoute("/_authenticated/requests")({
	head: () => ({ meta: [
		{ title: "الطلبات الخاصة — WISO" },
		{
			name: "description",
			content: "اطلب تجهيز مادة أو مهمة دراسية خاصة."
		},
		{
			property: "og:title",
			content: "الطلبات الخاصة — WISO"
		},
		{
			property: "og:description",
			content: "تابع طلباتك الدراسية الخاصة."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$20, "component")
});
var $$splitComponentImporter$19 = () => import("./settings-BXsyxqWV.mjs");
var Route$19 = createFileRoute("/_authenticated/settings")({
	head: () => ({ meta: [
		{ title: "حسابي — WISO" },
		{
			name: "description",
			content: "بيانات الطالب وإعدادات حساب WISO."
		},
		{
			property: "og:title",
			content: "حسابي — WISO"
		},
		{
			property: "og:description",
			content: "حدّث بياناتك الدراسية في WISO."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$19, "component")
});
var $$splitComponentImporter$18 = () => import("./sprix-B1s4WlvJ.mjs");
var Route$18 = createFileRoute("/_authenticated/sprix")({ component: lazyRouteComponent($$splitComponentImporter$18, "component") });
var $$splitComponentImporter$17 = () => import("./tools-BdUzOX2j.mjs");
var Route$17 = createFileRoute("/_authenticated/tools")({ component: lazyRouteComponent($$splitComponentImporter$17, "component") });
var $$splitComponentImporter$16 = () => import("./wallet-QrxC-Oqj.mjs");
var Route$16 = createFileRoute("/_authenticated/wallet")({
	head: () => ({ meta: [
		{ title: "محفظتي — WISO" },
		{
			name: "description",
			content: "رصيد الأسئلة والصور والملفات وطرق الشحن في WISO."
		},
		{
			property: "og:title",
			content: "محفظتي — WISO"
		},
		{
			property: "og:description",
			content: "رصيد الأسئلة والصور والملفات وطرق الشحن في WISO."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$16, "component")
});
var $$splitComponentImporter$15 = () => import("./work-with-wiso-HyA0a7Cp.mjs");
var Route$15 = createFileRoute("/_authenticated/work-with-wiso")({ component: lazyRouteComponent($$splitComponentImporter$15, "component") });
var $$splitComponentImporter$14 = () => import("./admin.index-CorEUmFy.mjs");
var Route$14 = createFileRoute("/_authenticated/admin/")({
	head: () => ({ meta: [
		{ title: "لوحة تحكم المشرف — WISO" },
		{
			name: "description",
			content: "نظرة عامة على إحصاءات المنصة، الطلاب، المدفوعات، والذكاء الاصطناعي."
		},
		{
			property: "og:title",
			content: "لوحة تحكم المشرف — WISO"
		},
		{
			property: "og:description",
			content: "نظرة عامة على إحصاءات المنصة، الطلاب، المدفوعات، والذكاء الاصطناعي."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary"
		},
		{
			name: "robots",
			content: "noindex"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$14, "component")
});
var $$splitComponentImporter$13 = () => import("./admin.ai-BDfRqcuO.mjs");
var Route$13 = createFileRoute("/_authenticated/admin/ai")({
	head: () => ({ meta: [
		{ title: "إعدادات ذكاء WISO — لوحة الإدارة" },
		{
			name: "description",
			content: "التحكم في ذكاء WISO: التفعيل، النموذج، وإيقاف الطوارئ."
		},
		{
			property: "og:title",
			content: "إعدادات ذكاء WISO — لوحة الإدارة"
		},
		{
			property: "og:description",
			content: "التحكم في ذكاء WISO: التفعيل، النموذج، وإيقاف الطوارئ."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary"
		},
		{
			name: "robots",
			content: "noindex"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$13, "component")
});
var $$splitComponentImporter$12 = () => import("./admin.bundles-XPthdiKl.mjs");
var Route$12 = createFileRoute("/_authenticated/admin/bundles")({
	head: () => ({ meta: [
		{ title: "الباقات والاشتراكات — لوحة الإدارة" },
		{
			name: "description",
			content: "إدارة باقات WISO: الأسعار، الأرصدة، والحدود اليومية."
		},
		{
			property: "og:title",
			content: "الباقات والاشتراكات — لوحة الإدارة"
		},
		{
			property: "og:description",
			content: "إدارة باقات WISO: الأسعار، الأرصدة، والحدود اليومية."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary"
		},
		{
			name: "robots",
			content: "noindex"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$12, "component")
});
var $$splitComponentImporter$11 = () => import("./admin.center-requests-t6TdpMSh.mjs");
var Route$11 = createFileRoute("/_authenticated/admin/center-requests")({ component: lazyRouteComponent($$splitComponentImporter$11, "component") });
var $$splitComponentImporter$10 = () => import("./admin.centers-FFsh-UZi.mjs");
var Route$10 = createFileRoute("/_authenticated/admin/centers")({
	head: () => ({ meta: [
		{ title: "المراكز وأكواد التفعيل — لوحة الإدارة" },
		{
			name: "description",
			content: "إدارة مراكز WISO وتوليد أكواد التفعيل ومتابعة استخدامها."
		},
		{
			property: "og:title",
			content: "المراكز وأكواد التفعيل — لوحة الإدارة"
		},
		{
			property: "og:description",
			content: "إدارة مراكز WISO وتوليد أكواد التفعيل ومتابعة استخدامها."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary"
		},
		{
			name: "robots",
			content: "noindex"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$10, "component")
});
var $$splitComponentImporter$9 = () => import("./admin.curriculum-BBrlaMtN.mjs");
var Route$9 = createFileRoute("/_authenticated/admin/curriculum")({
	head: () => ({ meta: [
		{ title: "المناهج والمواد — لوحة الإدارة" },
		{
			name: "description",
			content: "إدارة مواد WISO ومتابعة الوحدات والدروس المستخرجة."
		},
		{
			property: "og:title",
			content: "المناهج والمواد — لوحة الإدارة"
		},
		{
			property: "og:description",
			content: "إدارة مواد WISO ومتابعة الوحدات والدروس المستخرجة."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary"
		},
		{
			name: "robots",
			content: "noindex"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$9, "component")
});
var $$splitComponentImporter$8 = () => import("./admin.jobs-ncv9NhzY.mjs");
var Route$8 = createFileRoute("/_authenticated/admin/jobs")({
	head: () => ({ meta: [
		{ title: "مهام الذكاء وسجلاته — لوحة الإدارة" },
		{
			name: "description",
			content: "متابعة مهام توليد الأسئلة وسجلات استخدام ذكاء WISO."
		},
		{
			property: "og:title",
			content: "مهام الذكاء وسجلاته — لوحة الإدارة"
		},
		{
			property: "og:description",
			content: "متابعة مهام توليد الأسئلة وسجلات استخدام ذكاء WISO."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary"
		},
		{
			name: "robots",
			content: "noindex"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$8, "component")
});
var $$splitComponentImporter$7 = () => import("./admin.payments-Mr-9yxiK.mjs");
var Route$7 = createFileRoute("/_authenticated/admin/payments")({
	head: () => ({ meta: [
		{ title: "طلبات الدفع — لوحة الإدارة" },
		{
			name: "description",
			content: "مراجعة طلبات الدفع وقبولها أو رفضها."
		},
		{
			property: "og:title",
			content: "طلبات الدفع — لوحة الإدارة"
		},
		{
			property: "og:description",
			content: "مراجعة طلبات الدفع وقبولها أو رفضها."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary"
		},
		{
			name: "robots",
			content: "noindex"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
var $$splitComponentImporter$6 = () => import("./admin.questions-DTLNR6u6.mjs");
var Route$6 = createFileRoute("/_authenticated/admin/questions")({
	head: () => ({ meta: [
		{ title: "بنك الأسئلة — لوحة الإدارة" },
		{
			name: "description",
			content: "استعراض بنك أسئلة WISO المعتمد حسب المادة والصعوبة."
		},
		{
			property: "og:title",
			content: "بنك الأسئلة — لوحة الإدارة"
		},
		{
			property: "og:description",
			content: "استعراض بنك أسئلة WISO المعتمد حسب المادة والصعوبة."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary"
		},
		{
			name: "robots",
			content: "noindex"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
var $$splitComponentImporter$5 = () => import("./admin.requests-G8jWcBeY.mjs");
var Route$5 = createFileRoute("/_authenticated/admin/requests")({
	head: () => ({ meta: [
		{ title: "الطلبات الخاصة — إدارة WISO" },
		{
			name: "description",
			content: "مراجعة طلبات الطلاب الخاصة."
		},
		{
			property: "og:title",
			content: "الطلبات الخاصة — إدارة WISO"
		},
		{
			property: "og:description",
			content: "مراجعة طلبات الطلاب الخاصة."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary"
		},
		{
			name: "robots",
			content: "noindex"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
var $$splitComponentImporter$4 = () => import("./admin.sprix-D6aVDAsQ.mjs");
var Route$4 = createFileRoute("/_authenticated/admin/sprix")({ component: lazyRouteComponent($$splitComponentImporter$4, "component") });
var $$splitComponentImporter$3 = () => import("./admin.students-BOODYxsY.mjs");
var Route$3 = createFileRoute("/_authenticated/admin/students")({
	head: () => ({ meta: [
		{ title: "إدارة الطلاب — لوحة الإدارة" },
		{
			name: "description",
			content: "عرض الطلاب، صلاحيات الوصول، التجربة المجانية، والإيقاف."
		},
		{
			property: "og:title",
			content: "إدارة الطلاب — لوحة الإدارة"
		},
		{
			property: "og:description",
			content: "عرض الطلاب، صلاحيات الوصول، التجربة المجانية، والإيقاف."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary"
		},
		{
			name: "robots",
			content: "noindex"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
var $$splitComponentImporter$2 = () => import("./admin.system-CkA8SR3x.mjs");
var Route$2 = createFileRoute("/_authenticated/admin/system")({
	head: () => ({ meta: [
		{ title: "إعدادات النظام — لوحة الإدارة" },
		{
			name: "description",
			content: "حالة المنصة، وضع الصيانة، المسابقة الشهرية، وملخص الإيرادات."
		},
		{
			property: "og:title",
			content: "إعدادات النظام — لوحة الإدارة"
		},
		{
			property: "og:description",
			content: "حالة المنصة، وضع الصيانة، المسابقة الشهرية، وملخص الإيرادات."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary"
		},
		{
			name: "robots",
			content: "noindex"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
var $$splitComponentImporter$1 = () => import("./admin.tools-DRrbhIhc.mjs");
var Route$1 = createFileRoute("/_authenticated/admin/tools")({ component: lazyRouteComponent($$splitComponentImporter$1, "component") });
var $$splitComponentImporter = () => import("./tools.financial-literacy-DZcmrd3I.mjs");
var Route = createFileRoute("/_authenticated/tools/financial-literacy")({ component: lazyRouteComponent($$splitComponentImporter, "component") });
var IndexRoute = Route$31.update({
	id: "/",
	path: "/",
	getParentRoute: () => Route$32
});
var AuthenticatedRouteRoute = Route$30.update({
	id: "/_authenticated",
	getParentRoute: () => Route$32
});
var AuthRoute = Route$29.update({
	id: "/auth",
	path: "/auth",
	getParentRoute: () => Route$32
});
var CenterRequestRoute = Route$28.update({
	id: "/center-request",
	path: "/center-request",
	getParentRoute: () => Route$32
});
var AuthenticatedDashboardRoute = Route$27.update({
	id: "/dashboard",
	path: "/dashboard",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedGenerateRoute = Route$26.update({
	id: "/generate",
	path: "/generate",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedNotificationsRoute = Route$25.update({
	id: "/notifications",
	path: "/notifications",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedOnboardingRoute = Route$24.update({
	id: "/onboarding",
	path: "/onboarding",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedPlanRoute = Route$23.update({
	id: "/plan",
	path: "/plan",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedProfileRoute = Route$22.update({
	id: "/profile",
	path: "/profile",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedQureoRoute = Route$21.update({
	id: "/qureo",
	path: "/qureo",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedRequestsRoute = Route$20.update({
	id: "/requests",
	path: "/requests",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedSettingsRoute = Route$19.update({
	id: "/settings",
	path: "/settings",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedSprixRoute = Route$18.update({
	id: "/sprix",
	path: "/sprix",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedToolsRoute = Route$17.update({
	id: "/tools",
	path: "/tools",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedWalletRoute = Route$16.update({
	id: "/wallet",
	path: "/wallet",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedWorkWithWisoRoute = Route$15.update({
	id: "/work-with-wiso",
	path: "/work-with-wiso",
	getParentRoute: () => AuthenticatedRouteRoute
});
var InviteCodeRoute = Route$33.update({
	id: "/invite/$code",
	path: "/invite/$code",
	getParentRoute: () => Route$32
});
var AuthenticatedAdminIndexRoute = Route$14.update({
	id: "/admin/",
	path: "/admin/",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedAdminAiRoute = Route$13.update({
	id: "/admin/ai",
	path: "/admin/ai",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedAdminBundlesRoute = Route$12.update({
	id: "/admin/bundles",
	path: "/admin/bundles",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedAdminCenterRequestsRoute = Route$11.update({
	id: "/admin/center-requests",
	path: "/admin/center-requests",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedAdminCentersRoute = Route$10.update({
	id: "/admin/centers",
	path: "/admin/centers",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedAdminCurriculumRoute = Route$9.update({
	id: "/admin/curriculum",
	path: "/admin/curriculum",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedAdminJobsRoute = Route$8.update({
	id: "/admin/jobs",
	path: "/admin/jobs",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedAdminPaymentsRoute = Route$7.update({
	id: "/admin/payments",
	path: "/admin/payments",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedAdminQuestionsRoute = Route$6.update({
	id: "/admin/questions",
	path: "/admin/questions",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedAdminRequestsRoute = Route$5.update({
	id: "/admin/requests",
	path: "/admin/requests",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedAdminSprixRoute = Route$4.update({
	id: "/admin/sprix",
	path: "/admin/sprix",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedAdminStudentsRoute = Route$3.update({
	id: "/admin/students",
	path: "/admin/students",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedAdminSystemRoute = Route$2.update({
	id: "/admin/system",
	path: "/admin/system",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedAdminToolsRoute = Route$1.update({
	id: "/admin/tools",
	path: "/admin/tools",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedToolsRouteChildren = { AuthenticatedToolsFinancialLiteracyRoute: Route.update({
	id: "/financial-literacy",
	path: "/financial-literacy",
	getParentRoute: () => AuthenticatedToolsRoute
}) };
var AuthenticatedRouteRouteChildren = {
	AuthenticatedDashboardRoute,
	AuthenticatedGenerateRoute,
	AuthenticatedNotificationsRoute,
	AuthenticatedOnboardingRoute,
	AuthenticatedPlanRoute,
	AuthenticatedProfileRoute,
	AuthenticatedQureoRoute,
	AuthenticatedRequestsRoute,
	AuthenticatedSettingsRoute,
	AuthenticatedSprixRoute,
	AuthenticatedToolsRoute: AuthenticatedToolsRoute._addFileChildren(AuthenticatedToolsRouteChildren),
	AuthenticatedWalletRoute,
	AuthenticatedWorkWithWisoRoute,
	AuthenticatedAdminAiRoute,
	AuthenticatedAdminBundlesRoute,
	AuthenticatedAdminCenterRequestsRoute,
	AuthenticatedAdminCentersRoute,
	AuthenticatedAdminCurriculumRoute,
	AuthenticatedAdminJobsRoute,
	AuthenticatedAdminPaymentsRoute,
	AuthenticatedAdminQuestionsRoute,
	AuthenticatedAdminRequestsRoute,
	AuthenticatedAdminSprixRoute,
	AuthenticatedAdminStudentsRoute,
	AuthenticatedAdminSystemRoute,
	AuthenticatedAdminToolsRoute,
	AuthenticatedAdminIndexRoute
};
var rootRouteChildren = {
	IndexRoute,
	AuthenticatedRouteRoute: AuthenticatedRouteRoute._addFileChildren(AuthenticatedRouteRouteChildren),
	AuthRoute,
	CenterRequestRoute,
	InviteCodeRoute
};
var routeTree = Route$32._addFileChildren(rootRouteChildren)._addFileTypes();
function LoadingScreen({ message = "عقرب الساعه لو لحقك هيلسعك " }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		dir: "rtl",
		className: "fixed inset-0 z-50 flex flex-col items-center justify-center gap-7 overflow-hidden bg-sidebar text-sidebar-foreground",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "app-grid absolute inset-0" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative flex size-28 items-center justify-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute inset-0 animate-pulse rounded-full border border-sidebar-primary/30" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WisoMark, { className: "h-16 w-24" })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "relative w-36 overflow-hidden rounded-full bg-sidebar-accent p-0.5",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "block h-1 w-1/2 animate-[pulse_1.5s_ease-in-out_infinite] rounded-full bg-sidebar-primary" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "relative text-sm font-semibold text-sidebar-foreground/85",
				children: message
			})
		]
	});
}
var getRouter = () => {
	const queryClient = new QueryClient();
	return createRouter({
		routeTree,
		context: { queryClient },
		scrollRestoration: true,
		defaultPreloadStaleTime: 0,
		defaultPendingComponent: LoadingScreen,
		defaultPendingMs: 300,
		defaultPendingMinMs: 400
	});
};
//#endregion
export { getRouter };
