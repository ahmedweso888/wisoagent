import { i as __toESM } from "../_runtime.mjs";
import { t as motion } from "../_libs/framer-motion+[...].mjs";
import { y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { f as require_jsx_runtime } from "../_libs/@radix-ui/react-avatar+[...].mjs";
import { t as Button } from "./button-CAvS9N1W.mjs";
import { C as Moon, G as Check, T as Menu, et as BadgeCheck, n as X, p as Sun, tt as ArrowLeft } from "../_libs/lucide-react.mjs";
import { t as WisoMark } from "./WisoMark-DOvYZQdC.mjs";
import { a as usePublicPlans, i as usePublicContest, n as useFaq, o as useSectionMap, r as useFeatureFlags, s as useTeachers, t as Footer } from "./Footer-DDF1fT37.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-BB500BTH.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var wiso_laptop_default = "/assets/wiso-laptop-w1YvRMqW.png";
/**
* Official WISO Agent brand mark.
*
* The WISO Agent text slides out from behind the W mark
* without blur, preserving sharp text rendering.
*/
function BrandLogo({ className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: cn("group/brand relative inline-flex items-center focus:outline-none", className),
		tabIndex: 0,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "relative z-10 flex items-center rounded-full",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WisoMark, { className: "h-7 w-11" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "\n          grid\n          grid-cols-[0fr]\n          transition-[grid-template-columns]\n          duration-500\n          ease-[cubic-bezier(.22,1,.36,1)]\n          group-hover/brand:grid-cols-[1fr]\n          group-focus-visible/brand:grid-cols-[1fr]\n          group-focus-within/brand:grid-cols-[1fr]\n        ",
				"aria-hidden": "true",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "overflow-hidden",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "\n              block\n              translate-x-3\n              whitespace-nowrap\n              pe-1\n              ps-2\n              text-sm\n              font-bold\n              text-current\n              opacity-60\n              antialiased\n              transition-[transform,opacity]\n              duration-500\n              ease-[cubic-bezier(.22,1,.36,1)]\n              group-hover/brand:translate-x-0\n              group-hover/brand:opacity-100\n              group-focus-visible/brand:translate-x-0\n              group-focus-visible/brand:opacity-100\n              group-focus-within/brand:translate-x-0\n              group-focus-within/brand:opacity-100\n            ",
						children: "WISO Agent"
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "sr-only",
				children: "WISO Agent"
			})
		]
	});
}
var STORAGE_KEY = "wiso-theme";
function applyTheme(dark) {
	document.documentElement.classList.toggle("dark", dark);
	document.documentElement.style.colorScheme = dark ? "dark" : "light";
}
/** Reads the stored theme after hydration so SSR markup never mismatches. */
function useTheme() {
	const [dark, setDark] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		const stored = localStorage.getItem(STORAGE_KEY);
		const next = stored === "dark" || stored === null && window.matchMedia("(prefers-color-scheme: dark)").matches;
		setDark(next);
		applyTheme(next);
	}, []);
	const toggle = () => {
		setDark((prev) => {
			const next = !prev;
			localStorage.setItem(STORAGE_KEY, next ? "dark" : "light");
			applyTheme(next);
			return next;
		});
	};
	return {
		dark,
		toggle
	};
}
function ThemeToggle({ className }) {
	const { dark, toggle } = useTheme();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
		type: "button",
		variant: "ghost",
		size: "icon",
		onClick: toggle,
		className,
		"aria-label": dark ? "الوضع الفاتح" : "الوضع الداكن",
		children: dark ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sun, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Moon, { className: "size-4" })
	});
}
/**
* Floating near-black pill header from the WISO reference.
* Layout, colours and motion are fixed in code; only the links are data-driven.
*/
function SiteHeader({ links, ctaLabel }) {
	const [open, setOpen] = (0, import_react.useState)(false);
	const [scrolled, setScrolled] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		const onScroll = () => setScrolled(window.scrollY > 12);
		onScroll();
		window.addEventListener("scroll", onScroll, { passive: true });
		return () => window.removeEventListener("scroll", onScroll);
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		dir: "rtl",
		className: "pointer-events-none fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:pt-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: cn("pointer-events-auto mx-auto flex h-14 w-full max-w-5xl items-center gap-2 rounded-full border border-white/10 bg-[oklch(0.15_0.03_132)]/90 px-3 text-[oklch(0.96_0.014_100)] backdrop-blur-xl transition-shadow duration-300 sm:h-16 sm:px-5", scrolled ? "shadow-[0_18px_50px_-24px_oklch(0_0_0/0.9)]" : "shadow-none"),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/",
					className: "shrink-0 rounded-full outline-none",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BrandLogo, {})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
					className: "mx-auto hidden items-center gap-1 lg:flex",
					children: links.map((link) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: link.href,
						className: "rounded-full px-3.5 py-2 text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white",
						children: link.label
					}, link.href))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "ms-auto flex items-center gap-1.5 lg:ms-0",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThemeToggle, { className: "text-white/80 hover:bg-white/10 hover:text-white" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							size: "sm",
							className: "hidden rounded-full sm:inline-flex",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/auth",
								children: ctaLabel
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "ghost",
							size: "icon",
							className: "text-white/80 hover:bg-white/10 hover:text-white lg:hidden",
							onClick: () => setOpen((v) => !v),
							"aria-label": "القائمة",
							"aria-expanded": open,
							children: open ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Menu, { className: "size-5" })
						})
					]
				})
			]
		}), open ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
			className: "pointer-events-auto mx-auto mt-2 w-full max-w-5xl rounded-3xl border border-white/10 bg-[oklch(0.15_0.03_132)]/95 p-3 text-[oklch(0.96_0.014_100)] backdrop-blur-xl lg:hidden",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-1",
				children: [links.map((link) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
					href: link.href,
					onClick: () => setOpen(false),
					className: "rounded-2xl px-4 py-3 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white",
					children: link.label
				}, link.href)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					className: "mt-2 rounded-full",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/auth",
						children: ctaLabel
					})
				})]
			})
		}) : null]
	});
}
function toArabicSafeNumber(value) {
	if (value === null || value === void 0 || Number.isNaN(value)) return "0";
	return new Intl.NumberFormat("en-US").format(value);
}
/** Section order and anchors are fixed in code; the copy is admin-managed. */
var SECTION_ORDER = [
	{
		key: "about",
		label: "عن WISO"
	},
	{
		key: "how",
		label: "إزاي بيشتغل"
	},
	{
		key: "features",
		label: "المميزات"
	},
	{
		key: "teachers",
		label: "المدرسون"
	},
	{
		key: "pricing",
		label: "الباقات"
	},
	{
		key: "competition",
		label: "المسابقة"
	},
	{
		key: "faq",
		label: "الأسئلة الشائعة"
	}
];
var JOURNEY = [
	"المنهج",
	"الخطة",
	"الأسئلة",
	"الحل",
	"تحليل الأداء",
	"نقاط الضعف",
	"تطوير الخطة"
];
function SectionHeading({ section }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "max-w-2xl",
		children: [
			section.subtitle ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm font-bold text-primary",
				children: section.subtitle
			}) : null,
			section.title ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mt-3 font-display text-3xl font-black sm:text-4xl",
				children: section.title
			}) : null,
			section.description ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 text-base leading-8 text-muted-foreground",
				children: section.description
			}) : null
		]
	});
}
/**
* Reusable scroll reveal animation.
* Every section fades in and moves upward slightly when entering the viewport.
*/
function RevealSection({ children, className = "", delay = 0, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.section, {
		...props,
		initial: {
			opacity: 0,
			y: 45
		},
		whileInView: {
			opacity: 1,
			y: 0
		},
		viewport: {
			once: true,
			amount: .15
		},
		transition: {
			duration: 1.1,
			delay,
			ease: [
				.22,
				1,
				.36,
				1
			]
		},
		className,
		children
	});
}
function Landing() {
	const { map, isLoading } = useSectionMap();
	const teachers = useTeachers();
	const faq = useFaq();
	const plans = usePublicPlans();
	const contest = usePublicContest();
	const flags = useFeatureFlags();
	const teachersVisible = flags.data?.["verified_teachers"] !== false && (teachers.data?.length ?? 0) > 0;
	const contestRow = contest.data;
	const contestVisible = flags.data?.["competition"] !== false && Boolean(contestRow?.enabled) && contestRow?.visible !== false;
	const navLinks = SECTION_ORDER.filter((s) => {
		if (!map.has(s.key)) return false;
		if (s.key === "teachers") return teachersVisible;
		if (s.key === "competition") return contestVisible;
		if (s.key === "faq") return (faq.data?.length ?? 0) > 0;
		if (s.key === "pricing") return (plans.data?.length ?? 0) > 0;
		return true;
	}).map((s) => ({
		href: `#${s.key}`,
		label: map.get(s.key)?.subtitle || s.label
	}));
	const hero = map.get("hero");
	const heroTitle = hero?.title ?? "وكيلك الذكي في رحلتك نحو التفوق";
	const heroCta = hero?.cta_label ?? "ابدأ رحلتك الآن";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		dir: "rtl",
		className: "min-h-screen bg-background text-foreground",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteHeader, {
				links: navLinks,
				ctaLabel: heroCta
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
				className: "pt-20 sm:pt-24",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
						className: "mx-auto max-w-7xl px-4 sm:px-5 lg:px-10",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative overflow-hidden rounded-[2rem] bg-[var(--gradient-hero)] px-5 py-14 sm:px-10 sm:py-20",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "app-grid pointer-events-none absolute inset-0 opacity-40" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									"aria-hidden": "true",
									className: "pointer-events-none absolute -bottom-32 start-1/2 size-[36rem] -translate-x-1/2 rounded-full bg-primary/15 blur-3xl"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "relative grid items-center gap-8 lg:grid-cols-[.88fr_1.12fr] lg:text-start",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
										hero?.subtitle ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.p, {
											initial: {
												opacity: 0,
												y: 10
											},
											animate: {
												opacity: 1,
												y: 0
											},
											transition: { duration: .5 },
											className: "mb-5 inline-flex rounded-full border border-[var(--hero-border)] bg-[var(--hero-surface)] px-4 py-2 text-sm font-bold text-[var(--hero-foreground)]",
											children: hero.subtitle
										}) : null,
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.h1, {
											initial: {
												opacity: 0,
												y: 16
											},
											animate: {
												opacity: 1,
												y: 0
											},
											transition: { duration: .55 },
											className: "font-display text-4xl font-black leading-[1.22] text-[var(--hero-foreground)] sm:text-5xl lg:text-6xl",
											children: heroTitle
										}),
										hero?.description ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.p, {
											initial: {
												opacity: 0,
												y: 16
											},
											animate: {
												opacity: 1,
												y: 0
											},
											transition: {
												duration: .55,
												delay: .06
											},
											className: "mx-auto mt-6 max-w-2xl text-base leading-8 text-[var(--hero-muted)] sm:text-lg",
											children: hero.description
										}) : null,
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
											initial: {
												opacity: 0,
												y: 16
											},
											animate: {
												opacity: 1,
												y: 0
											},
											transition: {
												duration: .55,
												delay: .12
											},
											className: "mt-8 flex flex-wrap justify-center gap-3 lg:justify-start",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												asChild: true,
												size: "lg",
												className: "rounded-full",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
													to: hero?.cta_href ?? "/auth",
													children: [heroCta, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, {})]
												})
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												asChild: true,
												size: "lg",
												variant: "outline",
												className: "rounded-full border-[var(--hero-border)] bg-transparent text-[var(--hero-foreground)] hover:bg-[var(--hero-surface-hover)] hover:text-[var(--hero-foreground)]",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
													href: "#how",
													children: "شوف WISO بيشتغل إزاي"
												})
											})]
										})
									] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.img, {
										initial: {
											opacity: 0,
											y: 28
										},
										animate: {
											opacity: 1,
											y: 0
										},
										transition: {
											duration: .7,
											delay: .16
										},
										src: wiso_laptop_default,
										alt: "واجهة WISO على اللابتوب",
										className: "hero-laptop relative mx-auto w-full max-w-3xl object-contain drop-shadow-2xl"
									})]
								})
							]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.h1, {
						initial: {
							opacity: 0,
							y: 16
						},
						animate: {
							opacity: 1,
							y: 0
						},
						transition: { duration: .55 },
						className: "font-display text-4xl font-black leading-[1.15] text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-white drop-shadow-[0_0_18px_rgba(255,255,255,0.35)] sm:text-5xl lg:text-7xl",
						children: [
							"وعشان WISO حاسس بيك",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
							"يا طالب البكالوريا"
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.p, {
						initial: {
							opacity: 0,
							y: 16
						},
						animate: {
							opacity: 1,
							y: 0
						},
						transition: {
							duration: .55,
							delay: .06
						},
						className: "mx-auto mt-6 max-w-3xl text-lg font-extrabold leading-9 text-[var(--hero-foreground)] drop-shadow-[0_0_12px_rgba(255,255,255,0.25)] sm:text-xl lg:text-2xl",
						children: [
							"عملنالك",
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-black text-cyan-300 drop-shadow-[0_0_14px_rgba(34,211,238,0.8)]",
								children: "SPRIX Agent"
							}),
							" ",
							"عشان تريح بالك من الثقافة المالية وتركز على باقي موادك،",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
							"وبـ ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-black text-yellow-300 drop-shadow-[0_0_14px_rgba(250,204,21,0.8)]",
								children: "40 ج"
							}),
							" ",
							"يحللك مستويات الترم كله 😍 ___________________________________________________________ sprix-agent موجود داخل ويسو ك خدمه ب جانب الاسئله"
						]
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.section, {
						initial: {
							opacity: 0,
							y: 20
						},
						whileInView: {
							opacity: 1,
							y: 0
						},
						viewport: {
							once: true,
							amount: .2
						},
						transition: { duration: .6 },
						className: "mt-14 border-y border-border bg-card",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
							className: "mx-auto grid max-w-7xl grid-cols-2 gap-x-4 gap-y-3 px-5 py-5 text-sm font-bold sm:grid-cols-4 lg:grid-cols-7 lg:px-10",
							children: JOURNEY.map((label, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.li, {
								initial: {
									opacity: 0,
									x: 12
								},
								whileInView: {
									opacity: 1,
									x: 0
								},
								viewport: {
									once: true,
									amount: .3
								},
								transition: {
									duration: .4,
									delay: index * .06
								},
								className: "flex items-center gap-2 text-primary",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "num text-xs text-muted-foreground",
									children: String(index + 1).padStart(2, "0")
								}), label]
							}, label))
						})
					}),
					map.get("about") ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RevealSection, {
						id: "about",
						className: "mx-auto max-w-7xl px-5 py-20 lg:px-10",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeading, { section: map.get("about") })
					}) : null,
					map.get("how") ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RevealSection, {
						id: "how",
						className: "bg-background",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mx-auto max-w-7xl px-5 py-20 lg:px-10",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeading, { section: map.get("how") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4",
								children: [
									"about",
									"features",
									"adaptive",
									"planning"
								].map((key) => map.get(key)).filter((s) => Boolean(s)).map((s, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.article, {
									initial: {
										opacity: 0,
										y: 24
									},
									whileInView: {
										opacity: 1,
										y: 0
									},
									viewport: {
										once: true,
										amount: .2
									},
									transition: {
										duration: .5,
										delay: index * .08,
										ease: [
											.22,
											1,
											.36,
											1
										]
									},
									className: "border-t-2 border-primary/20 pt-5",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "num text-xs font-bold text-muted-foreground",
											children: String(index + 1).padStart(2, "0")
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
											className: "mt-5 font-display text-xl font-bold",
											children: s.title
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-2 text-sm leading-7 text-muted-foreground",
											children: s.description
										})
									]
								}, s.section_key))
							})]
						})
					}) : null,
					map.get("features") ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(RevealSection, {
						id: "features",
						className: "mx-auto max-w-7xl px-5 py-20 lg:px-10",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeading, { section: map.get("features") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-12 grid gap-6 md:grid-cols-3",
							children: [
								"generator",
								"adaptive",
								"planning"
							].map((key) => map.get(key)).filter((s) => Boolean(s)).map((s, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.article, {
								initial: {
									opacity: 0,
									y: 24
								},
								whileInView: {
									opacity: 1,
									y: 0
								},
								viewport: {
									once: true,
									amount: .2
								},
								transition: {
									duration: .5,
									delay: index * .1,
									ease: [
										.22,
										1,
										.36,
										1
									]
								},
								className: "rounded-xl border border-border bg-card p-6",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "font-display text-lg font-bold",
									children: s.title
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-sm leading-7 text-muted-foreground",
									children: s.description
								})]
							}, s.section_key))
						})]
					}) : null,
					teachersVisible && map.get("teachers") ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RevealSection, {
						id: "teachers",
						className: "bg-background",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mx-auto max-w-7xl px-5 py-20 lg:px-10",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeading, { section: map.get("teachers") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3",
								children: teachers.data?.map((t, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.article, {
									initial: {
										opacity: 0,
										y: 24
									},
									whileInView: {
										opacity: 1,
										y: 0
									},
									viewport: {
										once: true,
										amount: .15
									},
									transition: {
										duration: .5,
										delay: index * .08,
										ease: [
											.22,
											1,
											.36,
											1
										]
									},
									className: "flex gap-4 rounded-xl border border-border bg-card p-5",
									children: [t.image_url ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
										src: t.image_url,
										alt: t.name,
										className: "size-16 shrink-0 rounded-full object-cover"
									}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "min-w-0",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
												className: "flex items-center gap-1.5 font-bold",
												children: [t.name, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BadgeCheck, { className: "size-4 text-primary" })]
											}),
											t.specialization ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-xs text-primary",
												children: t.specialization
											}) : null,
											t.description ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "mt-2 text-sm leading-6 text-muted-foreground",
												children: t.description
											}) : null,
											t.verification_url ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
												href: t.verification_url,
												target: "_blank",
												rel: "noopener noreferrer",
												className: "mt-2 inline-block text-xs font-semibold text-primary underline-offset-4 hover:underline",
												children: "توثيق المدرس"
											}) : null
										]
									})]
								}, t.id))
							})]
						})
					}) : null,
					(plans.data?.length ?? 0) > 0 && map.get("pricing") ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(RevealSection, {
						id: "pricing",
						className: "mx-auto max-w-7xl px-5 py-20 lg:px-10",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeading, { section: map.get("pricing") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3",
							children: plans.data?.map((plan, index) => {
								const features = Array.isArray(plan.features) ? plan.features : [];
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.article, {
									initial: {
										opacity: 0,
										y: 28
									},
									whileInView: {
										opacity: 1,
										y: 0
									},
									viewport: {
										once: true,
										amount: .15
									},
									transition: {
										duration: .55,
										delay: index * .1,
										ease: [
											.22,
											1,
											.36,
											1
										]
									},
									className: "flex flex-col rounded-xl border border-border bg-card p-6",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-start justify-between gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
												className: "font-display text-xl font-bold",
												children: plan.name_ar
											}), plan.badge ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary",
												children: plan.badge
											}) : null]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "mt-4 flex items-baseline gap-2",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "num font-display text-3xl font-black",
													children: toArabicSafeNumber(Number(plan.price_egp))
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-sm text-muted-foreground",
													children: "جنيه"
												}),
												plan.original_price_egp ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "num text-sm text-muted-foreground line-through",
													children: toArabicSafeNumber(Number(plan.original_price_egp))
												}) : null
											]
										}),
										plan.description_ar ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-3 text-sm leading-7 text-muted-foreground",
											children: plan.description_ar
										}) : null,
										features.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
											className: "mt-5 space-y-2.5 text-sm",
											children: features.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
												className: "flex items-start gap-2",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "mt-0.5 size-4 shrink-0 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: f })]
											}, f))
										}) : null,
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											asChild: true,
											className: "mt-6 w-full rounded-full",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
												to: "/auth",
												children: "اشترك الآن"
											})
										})
									]
								}, plan.id);
							})
						})]
					}) : null,
					contestVisible && map.get("competition") ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RevealSection, {
						id: "competition",
						className: "bg-background",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mx-auto max-w-7xl px-5 py-20 lg:px-10",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeading, { section: map.get("competition") }), contestRow?.prize_egp ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.p, {
								initial: {
									opacity: 0,
									scale: .95
								},
								whileInView: {
									opacity: 1,
									scale: 1
								},
								viewport: {
									once: true,
									amount: .2
								},
								transition: {
									duration: .55,
									delay: .15
								},
								className: "mt-8 font-display text-4xl font-black text-primary",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "num",
										children: toArabicSafeNumber(Number(contestRow.prize_egp))
									}),
									" ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-2xl",
										children: contestRow.currency ?? "EGP"
									})
								]
							}) : null]
						})
					}) : null,
					(faq.data?.length ?? 0) > 0 && map.get("faq") ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(RevealSection, {
						id: "faq",
						className: "mx-auto max-w-7xl px-5 py-20 lg:px-10",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeading, { section: map.get("faq") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-10 divide-y divide-border border-y border-border",
							children: faq.data?.map((item, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.details, {
								initial: {
									opacity: 0,
									y: 16
								},
								whileInView: {
									opacity: 1,
									y: 0
								},
								viewport: {
									once: true,
									amount: .2
								},
								transition: {
									duration: .4,
									delay: index * .05
								},
								className: "group py-5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", {
									className: "cursor-pointer list-none font-bold",
									children: item.question
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-3 text-sm leading-7 text-muted-foreground",
									children: item.answer
								})]
							}, item.id))
						})]
					}) : null,
					map.get("cta") ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RevealSection, {
						className: "mx-auto max-w-7xl px-4 pb-20 sm:px-5 lg:px-10",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-[2rem] border border-border bg-card px-6 py-16 text-center sm:px-10",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "font-display text-3xl font-black sm:text-4xl",
									children: map.get("cta")?.title
								}),
								map.get("cta")?.description ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mx-auto mt-4 max-w-xl leading-8 text-muted-foreground",
									children: map.get("cta")?.description
								}) : null,
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									asChild: true,
									size: "lg",
									className: "mt-8 rounded-full",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
										to: map.get("cta")?.cta_href ?? "/auth",
										children: map.get("cta")?.cta_label ?? heroCta
									})
								})
							]
						})
					}) : null,
					map.get("competition") ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RevealSection, {
						className: "mx-auto max-w-7xl px-4 pb-20 sm:px-5 lg:px-10",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "overflow-hidden rounded-[2rem] border border-border bg-card",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "relative w-full",
								children: [map.get("competition")?.image_url ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
									src: map.get("competition")?.image_url ?? void 0,
									alt: map.get("competition")?.title ?? "WISO Competition",
									className: "h-auto w-full object-cover"
								}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "absolute inset-x-0 top-4 text-center font-display text-3xl font-black text-white drop-shadow-lg sm:text-4xl",
									children: map.get("competition")?.title
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "px-6 py-10 text-center sm:px-10",
								children: [map.get("competition")?.description ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mx-auto mt-4 max-w-xl leading-8 text-muted-foreground",
									children: map.get("competition")?.description
								}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									asChild: true,
									size: "lg",
									className: "mt-8 rounded-full",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
										to: map.get("competition")?.cta_href ?? "/auth",
										children: map.get("competition")?.cta_label ?? heroCta
									})
								})]
							})]
						})
					}) : null,
					!isLoading && map.size === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(RevealSection, {
						className: "mx-auto max-w-3xl px-5 py-24 text-center",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-2xl font-bold",
							children: "محتوى الصفحة لسه مش متظبط"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-sm leading-7 text-muted-foreground",
							children: "الأقسام بتتضبط من لوحة الإدارة، وأول ما تتفعل هتظهر هنا على طول."
						})]
					}) : null
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Footer, {})
		]
	});
}
//#endregion
export { Landing as component };
