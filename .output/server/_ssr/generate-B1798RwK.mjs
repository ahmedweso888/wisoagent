import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { f as require_jsx_runtime } from "../_libs/@radix-ui/react-avatar+[...].mjs";
import { t as Button } from "./button-CAvS9N1W.mjs";
import { t as Label } from "./label-DBD1bRRP.mjs";
import { t as Badge } from "./badge-DovwySyz.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as supabase } from "./client-DIXqhfAR.mjs";
import { t as Input } from "./input-DC57PAAM.mjs";
import { B as CircleCheck, P as Download, T as LoaderCircle, V as CircleAlert, l as Trash2, v as Plus, w as LockKeyhole } from "../_libs/lucide-react.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-Cfotl7s5.mjs";
import { i as CardTitle, n as CardContent, r as CardHeader, t as Card } from "./card-BcujUCMc.mjs";
import { n as aiGenerateQuestionBatch, r as exportQuestionPdf } from "./ai.functions-CtafWLsh.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/generate-B1798RwK.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var difficulties = [
	{
		value: "basic",
		label: "سهل"
	},
	{
		value: "medium",
		label: "متوسط"
	},
	{
		value: "hard",
		label: "صعب"
	},
	{
		value: "nightmare",
		label: "تعجيزي"
	}
];
function GeneratePage() {
	const qc = useQueryClient();
	const [subject, setSubject] = (0, import_react.useState)("");
	const [topic, setTopic] = (0, import_react.useState)("");
	const [difficulty, setDifficulty] = (0, import_react.useState)("hard");
	const [count, setCount] = (0, import_react.useState)(10);
	const [queue, setQueue] = (0, import_react.useState)([]);
	const [runningAll, setRunningAll] = (0, import_react.useState)(false);
	const [selectedResult, setSelectedResult] = (0, import_react.useState)(null);
	const wallet = useQuery({
		queryKey: ["wallet-state"],
		queryFn: async () => {
			const { data, error } = await supabase.rpc("my_wallet_state");
			if (error) throw error;
			return data;
		}
	});
	const subjects = useQuery({
		queryKey: ["generator-subjects"],
		queryFn: async () => {
			const { data, error } = await supabase.rpc("student_available_subjects");
			if (error) throw error;
			return data ?? [];
		}
	});
	const topics = useQuery({
		queryKey: ["generator-topics", subject],
		enabled: Boolean(subject),
		queryFn: async () => {
			const { data, error } = await supabase.rpc("student_available_lessons", { _subject_id: subject });
			if (error) throw error;
			return data ?? [];
		}
	});
	const balance = Number(wallet.data?.questions_available ?? 0);
	const bonus = Number(wallet.data?.bonus_question_credits ?? 0);
	const bonusExpiresAt = wallet.data?.bonus_expires_at ?? null;
	const extremeUnlocked = wallet.data?.extreme_difficulty_enabled === true;
	const pdfUnlocked = wallet.data?.national_id_verified === true;
	const selectedTopic = (0, import_react.useMemo)(() => topics.data?.find((t) => t.id === topic), [topics.data, topic]);
	const queuedCredits = queue.filter((item) => item.status === "queued" || item.status === "running").reduce((sum, item) => sum + item.count, 0);
	const addToQueue = () => {
		if (!subject || !topic) {
			toast.error("اختار المادة والدرس.");
			return;
		}
		if (count < 1 || count > 500) {
			toast.error("عدد الأسئلة لازم يكون من 1 إلى 500.");
			return;
		}
		if (queuedCredits + count > balance) {
			toast.error("إجمالي الطلبات في الـQueue أكبر من رصيدك الحالي.");
			return;
		}
		const selectedSubject = subjects.data?.find((s) => s.id === subject);
		const selectedLesson = topics.data?.find((t) => t.id === topic);
		if (!selectedSubject || !selectedLesson) return;
		setQueue((items) => [...items, {
			id: crypto.randomUUID(),
			subjectId: subject,
			subjectSlug: selectedSubject.slug,
			subjectName: selectedSubject.name_ar,
			topicId: topic,
			topicName: selectedLesson.title,
			difficulty,
			count,
			status: "queued"
		}]);
		toast.success("اتضاف الطلب للـQueue.");
	};
	const createAll = useMutation({
		mutationFn: async () => {
			if (!queue.length) throw new Error("الـQueue فاضية.");
			setRunningAll(true);
			const snapshot = [...queue];
			for (const item of snapshot) {
				if (item.status === "completed") continue;
				setQueue((items) => items.map((q) => q.id === item.id ? {
					...q,
					status: "running"
				} : q));
				try {
					const result = await aiGenerateQuestionBatch({ data: {
						subjectSlug: item.subjectSlug,
						topicIds: [item.topicId],
						difficulties: [item.difficulty],
						questionTypes: ["mcq"],
						count: item.count,
						nightmareMode: item.difficulty === "nightmare",
						language: "ar"
					} });
					const status = result.stats.status === "completed" ? "completed" : "partial";
					setQueue((items) => items.map((q) => q.id === item.id ? {
						...q,
						status,
						result
					} : q));
					setSelectedResult({
						...item,
						status,
						result
					});
					await qc.invalidateQueries({ queryKey: ["wallet-state"] });
				} catch (error) {
					setQueue((items) => items.map((q) => q.id === item.id ? {
						...q,
						status: "failed"
					} : q));
					toast.error(error instanceof Error ? error.message : "فشل تنفيذ الطلب.");
				}
			}
			return true;
		},
		onSuccess: () => toast.success("تم التعامل مع كل الطلبات الموجودة في الـQueue."),
		onSettled: () => setRunningAll(false)
	});
	const exportPdf = useMutation({
		mutationFn: async () => {
			if (!selectedResult?.result) throw new Error("اختار نتيجة مكتملة الأول.");
			const data = await exportQuestionPdf({ data: {
				requestId: selectedResult.result.requestId,
				documentType: "worksheet",
				subjectName: selectedResult.subjectName,
				topicName: selectedResult.topicName,
				questions: selectedResult.result.questions
			} });
			const binary = atob(data.base64);
			const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
			const url = URL.createObjectURL(new Blob([bytes], { type: data.mimeType }));
			const anchor = document.createElement("a");
			anchor.href = url;
			anchor.download = data.filename;
			anchor.click();
			URL.revokeObjectURL(url);
		},
		onSuccess: () => toast.success("ملف PDF الشخصي جاهز."),
		onError: (error) => toast.error(error.message === "verified_national_id_required" ? "وثّق الرقم القومي من الملف الشخصي أولاً." : error.message)
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		dir: "rtl",
		className: "page-shell",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-wrap items-end justify-between gap-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-semibold text-primary",
					children: "اختار أكتر من طلب قبل ما تبعته للـAI"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-2 font-display text-3xl font-black",
					children: "مولّد الأسئلة"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 max-w-2xl text-sm leading-7 text-muted-foreground",
					children: "ضيف كل طلباتك واعمل انشاء مره واحدة، وWISO هيتعامل معاها واحدة واحدة. كل طلب هيظهرلك نتيجته بعد ما يخلص."
				})
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
						variant: "outline",
						children: [
							"الرصيد: ",
							balance,
							" سؤال"
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
						variant: "outline",
						children: ["في الـQueue: ", queuedCredits]
					}),
					bonus > 0 && bonusExpiresAt ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, { children: [
						"منها ",
						bonus,
						" هدية تنتهي ",
						new Date(bonusExpiresAt).toLocaleString("ar-EG")
					] }) : null
				]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-8 grid gap-6 lg:grid-cols-[.8fr_1.2fr]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "space-y-5 p-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "المادة" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: subject,
						onValueChange: (v) => {
							setSubject(v);
							setTopic("");
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
							className: "mt-2",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "اختار المادة" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: subjects.data?.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: s.id,
							children: s.name_ar
						}, s.id)) })]
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "الدرس" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: topic,
							onValueChange: setTopic,
							disabled: !subject,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
								className: "mt-2",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: subject ? "اختار الدرس" : "اختار المادة أولاً" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: topics.data?.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: t.id,
								children: t.title
							}, t.id)) })]
						}),
						selectedTopic ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-xs text-muted-foreground",
							children: selectedTopic.title
						}) : null
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "مستوى الصعوبة" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: difficulty,
						onValueChange: (v) => setDifficulty(v),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
							className: "mt-2",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: difficulties.map((d) => {
							const locked = d.value === "nightmare" && !extremeUnlocked;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
								value: d.value,
								disabled: locked,
								children: [d.label, locked ? " 🔒" : ""]
							}, d.value);
						}) })]
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "count",
						children: "عدد الأسئلة"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "count",
						className: "mt-2",
						type: "number",
						min: 1,
						max: Math.min(500, Math.max(balance - queuedCredits, 1)),
						value: count,
						onChange: (e) => setCount(Math.max(1, Number(e.target.value) || 1))
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						className: "w-full",
						disabled: !subject || !topic || count > balance - queuedCredits || runningAll,
						onClick: addToQueue,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "me-2 size-4" }), " إضافة للـQueue"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						className: "w-full",
						variant: "secondary",
						disabled: !queue.length || runningAll,
						onClick: () => createAll.mutate(),
						children: [runningAll ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "me-2 size-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: "https://api.iconify.design/mdi:engine.svg",
							alt: "Engine",
							className: "me-2 size-4"
						}), runningAll ? "WISO بيشتغل على الطلبات..." : `إنشاء الكل (${queue.length})`]
					})
				]
			}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Queue" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
					className: "space-y-2",
					children: !queue.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "py-12 text-center text-sm text-muted-foreground",
						children: "كل طلباتك هتظهر هنا قبل ما تروح للمولد"
					}) : queue.map((item, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-xl border p-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "font-semibold",
								children: [
									index + 1,
									". ",
									item.subjectName,
									" — ",
									item.topicName
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-1 text-xs text-muted-foreground",
								children: [
									item.count,
									" سؤال · ",
									difficulties.find((d) => d.value === item.difficulty)?.label
								]
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: item.status === "queued" ? "في الانتظار" : item.status === "running" ? "جاري" : item.status === "completed" ? "مكتمل" : item.status === "partial" ? "جزئي" : "فشل" }), item.status === "queued" && !runningAll ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "icon",
									variant: "ghost",
									onClick: () => setQueue((items) => items.filter((q) => q.id !== item.id)),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" })
								}) : null]
							})]
						}), item.result ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "link",
							className: "mt-2 h-auto px-0",
							onClick: () => setSelectedResult(item),
							children: "عرض النتيجة"
						}) : null]
					}, item.id))
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
					className: "min-h-80",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
						className: "p-6",
						children: !selectedResult?.result ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex h-64 flex-col items-center justify-center text-center",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
									src: "https://api.iconify.design/mdi:engine.svg",
									alt: "Engine",
									className: "size-10 text-primary"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "mt-4 font-display text-xl font-bold",
									children: "النتائج هتظهر هنا"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 max-w-md text-sm leading-7 text-muted-foreground",
									children: "طلباتك هتظهر هنا بعد ما تروح للمولد"
								})
							]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "font-display text-xl font-bold",
									children: "نتيجة الطلب"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-1 text-xs text-muted-foreground",
									children: [
										selectedResult.subjectName,
										" — ",
										selectedResult.topicName
									]
								})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-6 text-primary" })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-4 flex items-center gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									disabled: !pdfUnlocked || exportPdf.isPending,
									onClick: () => exportPdf.mutate(),
									children: [pdfUnlocked ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "me-2 size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LockKeyhole, { className: "me-2 size-4" }), exportPdf.isPending ? "بنجهز PDF..." : "تنزيل PDF"]
								}), !pdfUnlocked ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
									href: "/profile#national-id",
									className: "text-sm font-semibold text-primary underline-offset-4 hover:underline",
									children: "وثّق الرقم القومي لفتح الطباعة فقط"
								}) : null]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4",
								children: [
									["المطلوب", selectedResult.result.stats.requested],
									["مُعاد استخدامه", selectedResult.result.stats.reused],
									["مولّد", selectedResult.result.stats.generated],
									["مقبول", selectedResult.result.stats.accepted],
									["مرفوض", selectedResult.result.stats.rejected],
									["المتبقي", selectedResult.result.stats.remaining],
									["إعادات", selectedResult.result.stats.retries],
									["استبدالات", selectedResult.result.stats.replacementCount]
								].map(([key, value]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "rounded-lg border bg-muted/25 p-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted-foreground",
										children: key
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-xl font-bold",
										children: value
									})]
								}, String(key)))
							}),
							selectedResult.result.stats.remaining > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-5 flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/10 p-4 text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "mt-0.5 size-4 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "الطلب اتعالج بأمان، والجزء غير المقبول لم يتم خصم رصيده." })]
							}) : null
						] })
					})
				})]
			})]
		})]
	});
}
//#endregion
export { GeneratePage as component };
