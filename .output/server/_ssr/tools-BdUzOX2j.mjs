import { i as __toESM } from "../_runtime.mjs";
import { h as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { f as require_jsx_runtime } from "../_libs/@radix-ui/react-avatar+[...].mjs";
import { t as Button } from "./button-CAvS9N1W.mjs";
import { t as Label } from "./label-DBD1bRRP.mjs";
import { t as PageHeader } from "./PageHeader-DhP6ZZXs.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as supabase } from "./client-DIXqhfAR.mjs";
import { t as Input } from "./input-DC57PAAM.mjs";
import { D as KeyRound, F as CreditCard, Q as BadgeCheck, Y as Bot, f as Sparkles, m as ShieldCheck } from "../_libs/lucide-react.mjs";
import { i as CardTitle, n as CardContent, r as CardHeader, t as Card } from "./card-BcujUCMc.mjs";
import { a as getMyToolAccess, f as redeemToolCode, h as submitToolPayment, l as getToolCatalogFn, o as getMyToolOrders } from "./wiso-tools.functions-D0SxEpcH.mjs";
import { t as createUuid } from "./uuid-YSajOv4G.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/tools-BdUzOX2j.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ToolsPage() {
	const qc = useQueryClient();
	const catalog = useQuery({
		queryKey: ["wiso-tools-catalog"],
		queryFn: () => getToolCatalogFn()
	});
	const access = useQuery({
		queryKey: ["wiso-tools-access"],
		queryFn: () => getMyToolAccess()
	});
	const orders = useQuery({
		queryKey: ["wiso-tools-orders"],
		queryFn: () => getMyToolOrders()
	});
	const [code, setCode] = (0, import_react.useState)("");
	const [selectedProduct, setSelectedProduct] = (0, import_react.useState)(null);
	const [method, setMethod] = (0, import_react.useState)("vodafone_cash");
	const [senderNumber, setSenderNumber] = (0, import_react.useState)("");
	const [proof, setProof] = (0, import_react.useState)(null);
	const accessSet = (0, import_react.useMemo)(() => new Set((access.data ?? []).filter((item) => item.available).map((item) => item.tool_key)), [access.data]);
	const pending = (orders.data ?? []).find((item) => item.status === "pending");
	const redeem = useMutation({
		mutationFn: () => redeemToolCode({ data: { code } }),
		onSuccess: async () => {
			setCode("");
			toast.success("تم تفعيل أداة WISO بنجاح.");
			await qc.invalidateQueries({ queryKey: ["wiso-tools-access"] });
		},
		onError: (error) => toast.error(error.message === "code_already_used" ? "الكود مستخدم بالفعل." : error.message === "code_expired" ? "الكود منتهي الصلاحية." : error.message === "not_tool_code" ? "هذا كود باقة أسئلة وليس كود أدوات." : error.message)
	});
	const pay = useMutation({
		mutationFn: async () => {
			if (!selectedProduct) throw new Error("اختار المنتج أولًا.");
			if (!proof) throw new Error("ارفع صورة إثبات الدفع.");
			if (!senderNumber.trim()) throw new Error("اكتب الرقم الذي تم التحويل منه.");
			if (proof.size > 10485760) throw new Error("الصورة يجب ألا تتجاوز 10MB.");
			if (!/^image\/(jpeg|png|webp)$/.test(proof.type)) throw new Error("ارفع JPG أو PNG أو WebP فقط.");
			const { data: userData } = await supabase.auth.getUser();
			const userId = userData.user?.id;
			if (!userId) throw new Error("سجّل دخولك من جديد.");
			const ext = proof.name.split(".").pop()?.toLowerCase() || "jpg";
			const path = `${userId}/tools/${createUuid()}.${ext}`;
			const upload = await supabase.storage.from("payment-proofs").upload(path, proof, {
				upsert: false,
				contentType: proof.type
			});
			if (upload.error) throw upload.error;
			return submitToolPayment({ data: {
				productKey: selectedProduct,
				method,
				senderNumber,
				screenshotPath: path
			} });
		},
		onSuccess: async () => {
			setProof(null);
			setSenderNumber("");
			setSelectedProduct(null);
			toast.success("تم إرسال طلب الدفع للإدارة.");
			await qc.invalidateQueries({ queryKey: ["wiso-tools-orders"] });
		},
		onError: (error) => toast.error(error.message)
	});
	const products = catalog.data?.products ?? [];
	const methods = catalog.data?.methods ?? [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		dir: "rtl",
		className: "page-shell",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				title: "أدوات WISO",
				subtitle: "وكلاء مستقلة عن باقات الأسئلة، مرتبطة بحساب WISO الخاص بك."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "mt-7 grid gap-5 lg:grid-cols-3",
				children: products.map((product) => {
					const available = product.tools.every((tool) => accessSet.has(tool));
					const href = product.key === "qureo" ? "/qureo" : product.key === "financial_literacy" ? "/tools/financial-literacy" : "/tools";
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "relative overflow-hidden border-primary/15",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mb-3 flex items-center justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "rounded-2xl bg-primary/10 p-3 text-primary",
									children: product.key === "qureo" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bot, { className: "size-6" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-6" })
								}), available ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BadgeCheck, { className: "size-3.5" }), " متاح"]
								}) : null]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: product.name }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted-foreground",
								children: product.description
							})
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "font-display text-3xl font-extrabold",
							children: [
								product.priceEgp,
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-base font-semibold",
									children: "جنيه"
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							className: "mt-5 w-full",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: href,
								children: available ? "فتح الأداة" : "شراء / تفعيل"
							})
						})] })]
					}, product.key);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-7 grid gap-5 lg:grid-cols-[1fr_.8fr]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreditCard, { className: "size-5" }), " شراء أداة"]
				}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "space-y-5",
					children: [
						pending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm",
							children: "لديك طلب دفع قيد المراجعة. سيتم تفعيل الأداة بعد اعتماد الإدارة."
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid gap-3 sm:grid-cols-3",
							children: products.map((product) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => setSelectedProduct(product.key),
								className: `rounded-xl border p-4 text-right transition ${selectedProduct === product.key ? "border-primary bg-primary/5" : "hover:bg-muted/40"}`,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-semibold",
									children: product.name
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-1 text-sm text-muted-foreground",
									children: [product.priceEgp, " ج.م"]
								})]
							}, product.key))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid gap-3 sm:grid-cols-2",
							children: methods.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => setMethod(item.method_key),
								className: `rounded-xl border p-4 text-right ${method === item.method_key ? "border-primary bg-primary/5" : "hover:bg-muted/40"}`,
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "font-semibold",
										children: item.display_name
									}),
									item.account_identifier ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 font-mono text-sm",
										children: item.account_identifier
									}) : null,
									item.instructions ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-2 text-xs text-muted-foreground",
										children: item.instructions
									}) : null
								]
							}, item.method_key))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-4 sm:grid-cols-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "tool-sender",
									children: "الرقم الذي تم التحويل منه"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "tool-sender",
									value: senderNumber,
									onChange: (e) => setSenderNumber(e.target.value),
									placeholder: "01xxxxxxxxx"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "tool-proof",
									children: "Screenshot إثبات الدفع"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "tool-proof",
									type: "file",
									accept: "image/jpeg,image/png,image/webp",
									onChange: (e) => setProof(e.target.files?.[0] ?? null)
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							className: "w-full",
							disabled: pay.isPending || !selectedProduct || !proof || !senderNumber.trim() || Boolean(pending),
							onClick: () => pay.mutate(),
							children: pay.isPending ? "جارٍ إرسال الطلب..." : "إرسال طلب الدفع"
						})
					]
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyRound, { className: "size-5" }), " تفعيل بكود"]
				}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "space-y-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm leading-6 text-muted-foreground",
							children: "أكواد SPRIX وQureo وSPRIX + Qureo منفصلة عن أكواد باقات الأسئلة، ولا تضيف أي Question Credits."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: code,
							onChange: (e) => setCode(e.target.value),
							placeholder: "WISO-SPRIX-... / WISO-QUREO-..."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							className: "w-full",
							disabled: !code.trim() || redeem.isPending,
							onClick: () => redeem.mutate(),
							children: redeem.isPending ? "جارٍ التفعيل..." : "تفعيل الكود"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "rounded-xl border p-4 text-sm",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-start gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "mt-0.5 size-4 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "التفعيل مرتبط بحساب WISO الحالي ويُفرض على الخادم." })]
							})
						})
					]
				})] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "mt-7",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "طلبات الأدوات" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "space-y-2",
					children: [(orders.data ?? []).slice(0, 6).map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-semibold",
							children: products.find((p) => p.key === item.product_key)?.name ?? item.product_key
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "mr-2 text-muted-foreground",
							children: [item.amount_egp, " ج.م"]
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: item.status === "pending" ? "قيد المراجعة" : item.status === "confirmed" ? "مقبول" : "مرفوض" })]
					}, item.id)), !orders.data?.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "py-5 text-sm text-muted-foreground",
						children: "لا توجد طلبات بعد."
					}) : null]
				})] })
			})
		]
	});
}
//#endregion
export { ToolsPage as component };
