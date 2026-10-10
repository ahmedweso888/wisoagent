import { i as __toESM } from "../_runtime.mjs";
import { _ as useNavigate, h as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { f as require_jsx_runtime } from "../_libs/@radix-ui/react-avatar+[...].mjs";
import { t as Button } from "./button-CAvS9N1W.mjs";
import { t as Label } from "./label-DBD1bRRP.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as supabase } from "./client-DIXqhfAR.mjs";
import { t as Input } from "./input-DC57PAAM.mjs";
import { i as TabsTrigger, n as TabsContent, r as TabsList, t as Tabs } from "./tabs-D54Z4YMT.mjs";
import { t as WisoMark } from "./WisoMark-DOvYZQdC.mjs";
import { t as Footer } from "./Footer-DDF1fT37.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/auth-Dewfhu3D.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AuthPage() {
	const navigate = useNavigate();
	const [loading, setLoading] = (0, import_react.useState)(false);
	const [email, setEmail] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [fullName, setFullName] = (0, import_react.useState)("");
	async function signIn(event) {
		event.preventDefault();
		setLoading(true);
		const { error } = await supabase.auth.signInWithPassword({
			email,
			password
		});
		if (error) {
			setLoading(false);
			toast.error("حصلت مشكلة بسيطة. جرّب تاني كده.");
			return;
		}
		await navigate({ to: "/dashboard" });
		setLoading(false);
	}
	async function signUp(event) {
		event.preventDefault();
		setLoading(true);
		const { data, error } = await supabase.auth.signUp({
			email,
			password,
			options: {
				emailRedirectTo: window.location.origin,
				data: { full_name: fullName }
			}
		});
		setLoading(false);
		if (error) {
			toast.error("حصلت مشكلة بسيطة. جرّب تاني كده.");
			return;
		}
		if (!data.session) {
			toast.success("بصّ في إيميلك وأكّد الحساب.");
			return;
		}
		navigate({ to: "/onboarding" });
	}
	async function forgotPassword() {
		if (!email) {
			toast.error("اكتب إيميلك الأول.");
			return;
		}
		setLoading(true);
		await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
		setLoading(false);
		toast.success("بعتنالك لينك لو الإيميل مسجّل عندنا.");
	}
	async function signInWithGoogle() {
		setLoading(true);
		const { error } = await supabase.auth.signInWithOAuth({
			provider: "google",
			options: { redirectTo: `${window.location.origin}/onboarding` }
		});
		if (error) {
			setLoading(false);
			toast.error("تعذّر الدخول بجوجل. جرّب تاني.");
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		dir: "rtl",
		className: "flex min-h-screen flex-col bg-background",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid flex-1 grid-cols-1 lg:grid-cols-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "flex items-center justify-center px-5 py-10 sm:px-10 lg:order-1 lg:px-14 lg:py-12",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "w-full max-w-md",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/",
							className: "mb-6 flex items-center justify-center gap-2.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WisoMark, { className: "h-10 w-16" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-display text-lg font-bold",
								children: "WISO"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mb-5 text-center",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
								className: "font-display text-2xl font-extrabold",
								children: "يلا نبدأ ونخلص اللي ورانا"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1.5 text-sm text-muted-foreground",
								children: "دخول واحد، وبعدها خطة المعركة والأسئلة التقيلة."
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "surface-panel p-6",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									type: "button",
									variant: "outline",
									className: "mb-4 w-full",
									disabled: loading,
									onClick: signInWithGoogle,
									children: "الدخول بحساب Google"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mb-4 flex items-center gap-3 text-xs text-muted-foreground",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-px flex-1 bg-border" }),
										"أو بالإيميل",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-px flex-1 bg-border" })
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
									defaultValue: "login",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
											className: "grid w-full grid-cols-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
												value: "login",
												children: "دخول"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
												value: "register",
												children: "حساب جديد"
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
											value: "login",
											className: "mt-5",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
												onSubmit: signIn,
												className: "space-y-4",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "space-y-2",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
															htmlFor: "login-email",
															children: "الإيميل"
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
															id: "login-email",
															type: "email",
															dir: "ltr",
															required: true,
															value: email,
															onChange: (e) => setEmail(e.target.value)
														})]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "space-y-2",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
															htmlFor: "login-password",
															children: "الباسورد"
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
															id: "login-password",
															type: "password",
															dir: "ltr",
															required: true,
															value: password,
															onChange: (e) => setPassword(e.target.value)
														})]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
														type: "submit",
														className: "w-full",
														disabled: loading,
														children: loading ? "لحظة..." : "يلا ندخل"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
														type: "button",
														onClick: forgotPassword,
														className: "w-full text-center text-xs text-muted-foreground underline-offset-4 hover:underline",
														children: "نسيت الباسورد؟"
													})
												]
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
											value: "register",
											className: "mt-5",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
												onSubmit: signUp,
												className: "space-y-4",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "space-y-2",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
															htmlFor: "reg-name",
															children: "اسمك بالكامل"
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
															id: "reg-name",
															required: true,
															value: fullName,
															onChange: (e) => setFullName(e.target.value)
														})]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "space-y-2",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
															htmlFor: "reg-email",
															children: "الإيميل"
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
															id: "reg-email",
															type: "email",
															dir: "ltr",
															required: true,
															value: email,
															onChange: (e) => setEmail(e.target.value)
														})]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "space-y-2",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
															htmlFor: "reg-password",
															children: "الباسورد"
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
															id: "reg-password",
															type: "password",
															dir: "ltr",
															required: true,
															minLength: 8,
															value: password,
															onChange: (e) => setPassword(e.target.value)
														})]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
														type: "submit",
														className: "w-full",
														disabled: loading,
														children: loading ? "لحظة..." : "اعمل حسابي"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
														className: "text-center text-xs text-muted-foreground",
														children: "هتاخد كود طالب خاص بيك و40 سؤال مجاني 24 ساعة."
													})
												]
											})
										})
									]
								})
							]
						})
					]
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "\n    hero-glow\n    relative\n    flex\n    items-center\n    justify-center\n    overflow-hidden\n    px-5\n    pb-10\n    pt-8\n    sm:px-8\n    sm:pb-12\n    lg:order-2\n    lg:px-10\n    lg:py-10\n  ",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						"aria-hidden": "true",
						className: "app-grid pointer-events-none absolute inset-0"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						"aria-hidden": "true",
						className: "\n      pointer-events-none\n      absolute\n      inset-0\n      bg-gradient-to-br\n      from-primary/10\n      via-transparent\n      to-primary/5\n    "
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "relative z-10 w-full max-w-2xl",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "\n        group\n        relative\n        overflow-hidden\n        rounded-3xl\n        border\n        border-border/60\n        bg-card\n        p-2\n        shadow-2xl\n        shadow-black/10\n        transition-all\n        duration-300\n        hover:-translate-y-1\n        hover:shadow-black/15\n        sm:p-3\n      ",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "relative overflow-hidden rounded-[1.35rem] bg-muted",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
									src: "/wiso-agent-auth.png",
									alt: "WISO Agent",
									className: "\n            block\n            h-auto\n            w-full\n            object-contain\n            transition-transform\n            duration-700\n            group-hover:scale-[1.015]\n          "
								})
							})
						})
					})
				]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Footer, {})]
	});
}
//#endregion
export { AuthPage as component };
