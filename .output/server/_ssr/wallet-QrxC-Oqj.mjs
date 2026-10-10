import { i as __toESM } from "../_runtime.mjs";
import { c as createServerFn } from "./createServerFn-CIHAFgYl.mjs";
import { n as requireSupabaseAuth } from "./auth-middleware-BgIfV4zI.mjs";
import { t as createSsrRpc } from "./createSsrRpc-lwvUPFNu.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { f as require_jsx_runtime } from "../_libs/@radix-ui/react-avatar+[...].mjs";
import { t as Button } from "./button-CAvS9N1W.mjs";
import { t as Label } from "./label-DBD1bRRP.mjs";
import { t as PageHeader } from "./PageHeader-DhP6ZZXs.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as supabase } from "./client-DIXqhfAR.mjs";
import { t as Input } from "./input-DC57PAAM.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-Cfotl7s5.mjs";
import { i as CardTitle, n as CardContent, r as CardHeader, t as Card } from "./card-BcujUCMc.mjs";
import { t as createUuid } from "./uuid-YSajOv4G.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/wallet-QrxC-Oqj.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var createWisoPaymentRequest = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input) => {
	if (!input.planId || !input.senderNumber.trim()) throw new Error("بيانات الدفع غير مكتملة.");
	return input;
}).handler(createSsrRpc("187ef4ab2a3c69ceb5f492ce8252d901a84b2b765d497e1af1571adad43d495c"));
function WalletPage() {
	const qc = useQueryClient();
	const [code, setCode] = (0, import_react.useState)("");
	const [planId, setPlanId] = (0, import_react.useState)(null);
	const [method, setMethod] = (0, import_react.useState)("vodafone_cash");
	const [sender, setSender] = (0, import_react.useState)("");
	const [txn, setTxn] = (0, import_react.useState)("");
	const [proof, setProof] = (0, import_react.useState)(null);
	const wallet = useQuery({
		queryKey: ["wallet"],
		queryFn: async () => {
			const { data, error } = await supabase.rpc("my_wallet");
			if (error) throw error;
			return data;
		}
	});
	const plans = useQuery({
		queryKey: ["plans"],
		queryFn: async () => {
			const { data, error } = await supabase.from("subscription_plans").select("*").eq("is_active", true).order("sort_order");
			if (error) throw error;
			return data;
		}
	});
	const ledger = useQuery({
		queryKey: ["ledger"],
		queryFn: async () => {
			const { data, error } = await supabase.from("wallet_ledger").select("*").order("created_at", { ascending: false }).limit(20);
			if (error) throw error;
			return data;
		}
	});
	const redeem = useMutation({
		mutationFn: async () => {
			const { error } = await supabase.rpc("redeem_center_code", { _code: code });
			if (error) throw error;
		},
		onSuccess: () => {
			toast.success("الكود اتفعّل وشحنّا محفظتك.");
			setCode("");
			qc.invalidateQueries({ queryKey: ["wallet"] });
			qc.invalidateQueries({ queryKey: ["ledger"] });
		},
		onError: (e) => toast.error(e.message)
	});
	const pay = useMutation({
		mutationFn: async () => {
			const plan = plans.data?.find((p) => p.id === planId);
			if (!plan) throw new Error("اختار باقة الأول");
			const { data: auth } = await supabase.auth.getUser();
			let screenshotPath = null;
			if (proof) {
				if (proof.size > 10485760) throw new Error("صورة الإثبات أكبر من 10MB");
				if (!proof.type.startsWith("image/")) throw new Error("إثبات الدفع لازم يكون صورة");
				screenshotPath = `${auth.user.id}/${createUuid()}-${proof.name.replace(/[^\p{L}\p{N}._-]+/gu, "-")}`;
				const upload = await supabase.storage.from("payment-proofs").upload(screenshotPath, proof, {
					upsert: false,
					contentType: proof.type
				});
				if (upload.error) throw upload.error;
			}
			await createWisoPaymentRequest({ data: {
				planId: plan.id,
				method,
				senderNumber: sender,
				transactionNumber: txn,
				screenshotPath
			} });
		},
		onSuccess: () => {
			toast.success("طلب الدفع اتبعت، هيتراجع قريب.");
			setSender("");
			setTxn("");
			setProof(null);
		},
		onError: (e) => toast.error(e.message)
	});
	const w = wallet.data;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		dir: "rtl",
		className: "page-shell max-w-5xl",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				title: "محفظتي",
				subtitle: " تابع رصيدك، اختار باقتك، وابعت طلب الشحن من هنا.رقم فودافون كاش (01000000000)  يوزر انستا باي (xxxxxxxx)"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "max-w-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
						className: "pb-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
							className: "text-sm text-muted-foreground",
							children: "رصيد الأسئلة"
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
						className: "text-3xl font-bold",
						children: w?.question_credits ?? 0
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "max-w-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
						className: "pb-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
							className: "text-sm text-muted-foreground",
							children: "أرباح الدعوات"
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
						className: "text-3xl font-bold",
						children: [Number(w?.cash_balance_egp ?? 0).toFixed(2), " جنيه"]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "mt-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
					className: "text-base",
					children: "كود سنتر"
				}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: code,
						onChange: (e) => setCode(e.target.value),
						placeholder: "WISO-XXXXXXXX"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						disabled: !code || redeem.isPending,
						onClick: () => redeem.mutate(),
						children: "تفعيل"
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "mt-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
					className: "text-base",
					children: "شحن المحفظة"
				}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "space-y-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid gap-3 sm:grid-cols-3",
							children: plans.data?.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								type: "button",
								onClick: () => setPlanId(p.id),
								variant: "outline",
								className: `h-auto min-h-32 flex-col items-start whitespace-normal p-4 text-start ${planId === p.id ? "border-primary bg-primary/5" : "border-border hover:bg-muted"}`,
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "font-semibold",
										children: p.name_ar
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-1 text-sm text-muted-foreground",
										children: [p.question_credits, " سؤال ·"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-2 font-bold text-primary",
										children: [p.price_egp, " جنيه"]
									})
								]
							}, p.id))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-3 sm:grid-cols-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										htmlFor: "method",
										children: "طريقة الدفع"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										value: method,
										onValueChange: (value) => setMethod(value),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
											id: "method",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "vodafone_cash",
											children: "فودافون كاش"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "instapay",
											children: "إنستا باي"
										})] })]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										htmlFor: "sender",
										children: "الرقم المحوّل منه"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										id: "sender",
										value: sender,
										onChange: (e) => setSender(e.target.value)
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										htmlFor: "txn",
										children: "وقت التحويل (مش لازم يكون بالتحديد يعني اقرب حاجه) "
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										id: "txn",
										value: txn,
										onChange: (e) => setTxn(e.target.value)
									})]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "proof",
									children: "صورة إثبات التحويل"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "proof",
									type: "file",
									accept: "image/*",
									onChange: (e) => setProof(e.target.files?.[0] ?? null)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted-foreground",
									children: "لو رفعتها، فريق WISO هيراجعها بنفسه مع طلبك."
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							disabled: !planId || pay.isPending,
							onClick: () => pay.mutate(),
							children: pay.isPending ? "بيتبعت..." : "ابعت طلب الدفع"
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "mt-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
					className: "text-base",
					children: "آخر الحركات"
				}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
					className: "space-y-2 text-sm",
					children: ledger.data?.length ? ledger.data.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex justify-between border-b border-border/50 pb-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-muted-foreground",
							children: [
								row.reason,
								" · ",
								row.resource_type
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: row.delta < 0 ? "text-destructive" : "text-primary",
							children: row.delta > 0 ? `+${row.delta}` : row.delta
						})]
					}, row.id)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-muted-foreground",
						children: "لسه مفيش حركات."
					})
				})]
			})
		]
	});
}
//#endregion
export { WalletPage as component };
