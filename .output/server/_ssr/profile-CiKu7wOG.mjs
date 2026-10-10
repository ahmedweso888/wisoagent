import { i as __toESM } from "../_runtime.mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { f as require_jsx_runtime, n as AvatarFallback$1, r as AvatarImage$1, t as Avatar$1 } from "../_libs/@radix-ui/react-avatar+[...].mjs";
import { t as Button } from "./button-CAvS9N1W.mjs";
import { t as Label } from "./label-DBD1bRRP.mjs";
import { t as Skeleton } from "./skeleton-D9W9wFsj.mjs";
import { t as PageHeader } from "./PageHeader-DhP6ZZXs.mjs";
import { t as Badge } from "./badge-DovwySyz.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as supabase } from "./client-DIXqhfAR.mjs";
import { n as useAuth } from "./useAuth-BO86jEMb.mjs";
import { t as EmptyState } from "./EmptyState-Dyw3WASN.mjs";
import { t as Input } from "./input-DC57PAAM.mjs";
import { A as Flame, c as Trophy, k as GraduationCap, m as ShieldCheck, s as User, w as LockKeyhole, y as Phone } from "../_libs/lucide-react.mjs";
import { t as StatCard } from "./StatCard-DTaJ4i7N.mjs";
import { n as CardContent, t as Card } from "./card-BcujUCMc.mjs";
import { t as Progress } from "./progress-j55G0Y_d.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/profile-CiKu7wOG.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Avatar = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Avatar$1, {
	ref,
	className: cn("relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full", className),
	...props
}));
Avatar.displayName = Avatar$1.displayName;
var AvatarImage = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarImage$1, {
	ref,
	className: cn("aspect-square h-full w-full", className),
	...props
}));
AvatarImage.displayName = AvatarImage$1.displayName;
var AvatarFallback = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarFallback$1, {
	ref,
	className: cn("flex h-full w-full items-center justify-center rounded-full bg-muted", className),
	...props
}));
AvatarFallback.displayName = AvatarFallback$1.displayName;
function initials(name) {
	if (!name) return "؟";
	return name.trim().split(/\s+/).slice(0, 2).map((p) => p[0]).join("");
}
function ProfilePage() {
	const { profile, user } = useAuth();
	const qc = useQueryClient();
	const [nationalId, setNationalId] = (0, import_react.useState)("");
	const walletState = useQuery({
		queryKey: ["wallet-state"],
		enabled: Boolean(user?.id),
		queryFn: async () => {
			const { data, error } = await supabase.rpc("my_wallet_state");
			if (error) throw error;
			return data;
		}
	});
	const submitNationalId = useMutation({
		mutationFn: async () => {
			const { data, error } = await supabase.rpc("submit_national_id", { _national_id: nationalId });
			if (error) throw error;
			const result = data;
			if (!result.ok) throw new Error(result.reason || "invalid_national_id");
		},
		onSuccess: async () => {
			setNationalId("");
			await Promise.all([qc.invalidateQueries({ queryKey: ["wallet-state"] }), qc.invalidateQueries({ queryKey: ["profile"] })]);
			toast.success("تم توثيق الرقم القومي وفتح ملفات PDF.");
		},
		onError: () => toast.error("الرقم القومي غير صحيح. راجع الـ 14 رقم وبيانات الميلاد والمحافظة.")
	});
	const mastery = useQuery({
		queryKey: ["profile-mastery"],
		enabled: Boolean(user?.id),
		queryFn: async () => {
			const { data, error } = await supabase.from("mastery").select("mastery_score,questions_solved,is_weak,subjects(name_ar)").order("mastery_score", { ascending: true });
			if (error) throw error;
			return data;
		}
	});
	const todayProgress = useQuery({
		queryKey: ["profile-today-progress"],
		enabled: Boolean(user?.id),
		queryFn: async () => {
			const { data, error } = await supabase.from("daily_progress").select("*").eq("day", (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)).maybeSingle();
			if (error) throw error;
			return data;
		}
	});
	const contestEntry = useQuery({
		queryKey: ["profile-contest-entry"],
		enabled: Boolean(user?.id),
		queryFn: async () => {
			const { data, error } = await supabase.from("contest_entries").select("phone,created_at").maybeSingle();
			if (error) throw error;
			return data;
		}
	});
	if (!profile) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		dir: "rtl",
		className: "page-shell max-w-5xl",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-10 w-64" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-8 grid gap-4 md:grid-cols-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-28 w-full md:col-span-3" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-24 w-full" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-24 w-full" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-24 w-full" })
			]
		})]
	});
	const avgMastery = mastery.data?.length ? Math.round(mastery.data.reduce((sum, m) => sum + Number(m.mastery_score), 0) / mastery.data.length) : null;
	const totalSolved = mastery.data?.reduce((sum, m) => sum + (m.questions_solved ?? 0), 0) ?? 0;
	const level = Math.max(1, Math.floor((profile.xp ?? 0) / 500) + 1);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		dir: "rtl",
		className: "page-shell max-w-5xl",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				title: "الملف الشخصي",
				subtitle: "بياناتك الدراسية ومستواك الحقيقي في WISO."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
				className: "mt-7",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "flex flex-col items-center gap-4 p-6 text-center sm:flex-row sm:items-center sm:gap-5 sm:text-start",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Avatar, {
						className: "size-20 border border-border",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarImage, {
							src: profile.avatar_url ?? void 0,
							alt: profile.full_name ?? ""
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarFallback, {
							className: "bg-secondary text-lg font-bold text-primary",
							children: initials(profile.full_name)
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex-1 space-y-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "font-display text-xl font-bold",
								children: profile.full_name ?? "طالب WISO"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap items-center justify-center gap-2 sm:justify-start",
								children: [
									profile.school_year ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
										variant: "secondary",
										className: "gap-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GraduationCap, { className: "size-3.5" }), profile.school_year]
									}) : null,
									profile.track ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										variant: "secondary",
										children: profile.track
									}) : null,
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
										className: "gap-1",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trophy, { className: "size-3.5" }),
											"المستوى ",
											level
										]
									})
								]
							}),
							profile.phone ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "flex items-center justify-center gap-1.5 text-sm text-muted-foreground sm:justify-start",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Phone, { className: "size-3.5" }), profile.phone]
							}) : null
						]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 grid gap-4 sm:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "نقاط الخبرة",
						value: profile.xp ?? 0,
						hint: "تراكمية من نشاطك الفعلي",
						tone: "primary"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "أيام التتابع",
						value: profile.streak_days ?? 0,
						hint: "أيام متتالية من الحل"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "أسئلة محلولة",
						value: totalSolved,
						hint: "إجمالي عبر كل المواد"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
				className: "mt-6",
				id: "national-id",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
					className: "p-6",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start gap-3",
						children: [walletState.data?.national_id_verified ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "mt-0.5 size-6 shrink-0 text-primary" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LockKeyhole, { className: "mt-0.5 size-6 shrink-0 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "font-display text-lg font-bold",
								children: "توثيق ملفات PDF"
							}), walletState.data?.national_id_verified ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-sm leading-7 text-muted-foreground",
								children: "رقمك القومي موثّق وملفات PDF الشخصية متاحة. حفاظاً على أمانك مش بنعرض الرقم هنا، ومش بيتغيّر من إعدادات الطالب."
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-sm leading-7 text-muted-foreground",
								children: "الرقم القومي اختياري لكل استخدامات WISO، ومطلوب فقط للطباعة وتنزيل PDF بعلامة ملكية على كل صفحة. التحقق من صحة البنية لا يثبت ملكية الرقم. (يخلي wiso  agent  مسئوليته من اعاده بيعك لملفات وكتب تحتوي علي رقمك القومي وتبعات ذلك (ينصح wiso agent  بعدم اعطاء او عرض ملفات ال pdf الخاصه بك ل اي شخص آخر نظرآ لما يمكن ان يفعله ب رقمك القومي من اعاده بيع او نشر او سرقه هويه شخصيه و تبعات ذلك))"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-4 max-w-md space-y-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										htmlFor: "national-id",
										children: "الرقم القومي المصري (14 رقم)"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										id: "national-id",
										dir: "ltr",
										inputMode: "numeric",
										autoComplete: "off",
										maxLength: 14,
										value: nationalId,
										onChange: (event) => setNationalId(event.target.value.replace(/\D/g, "").slice(0, 14))
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										disabled: nationalId.length !== 14 || submitNationalId.isPending,
										onClick: () => submitNationalId.mutate(),
										children: submitNationalId.isPending ? "جاري التحقق..." : "تحقق وافتح PDF"
									})
								]
							})] })]
						})]
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
				className: "mt-6",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "p-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "font-display text-lg font-bold",
								children: "متوسط الإتقان العام"
							}), avgMastery !== null ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-sm font-semibold text-primary",
								children: [avgMastery, "%"]
							}) : null]
						}),
						mastery.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "mt-4 h-3 w-full" }) : avgMastery !== null ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Progress, {
							value: avgMastery,
							className: "mt-4"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
							icon: User,
							title: "لسه مفيش بيانات إتقان",
							description: "حل شوية أسئلة عشان WISO يقدر يحسب مستواك الحقيقي.",
							className: "mt-4"
						}),
						mastery.data?.some((m) => m.is_weak) ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-5 space-y-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs font-medium text-muted-foreground",
								children: "مواد تحتاج اهتمام"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex flex-wrap gap-2",
								children: mastery.data.filter((m) => m.is_weak).map((m, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: "outline",
									children: m.subjects?.name_ar ?? "مادة"
								}, `${m.subjects?.name_ar}-${i}`))
							})]
						}) : null
					]
				})
			}),
			contestEntry.data ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
				className: "mt-6",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "flex items-center gap-3 p-6",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Flame, { className: "size-5 text-accent" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-semibold",
						children: "مشارك في المسابقة"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs text-muted-foreground",
						children: ["رقم التواصل المسجّل: ", contestEntry.data.phone]
					})] })]
				})
			}) : null,
			todayProgress.data ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
				className: "mt-6",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "p-6",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "font-display text-lg font-bold",
						children: "نشاط اليوم"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted-foreground",
								children: "أسئلة"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-xl font-bold",
								children: todayProgress.data.questions_solved
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted-foreground",
								children: "إجابات صحيحة"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-xl font-bold",
								children: todayProgress.data.correct_answers
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted-foreground",
								children: "دقائق مذاكرة"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-xl font-bold",
								children: todayProgress.data.study_minutes
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted-foreground",
								children: "خبرة اليوم"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-xl font-bold",
								children: todayProgress.data.xp_earned
							})] })
						]
					})]
				})
			}) : null
		]
	});
}
//#endregion
export { ProfilePage as component };
