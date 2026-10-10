import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { f as require_jsx_runtime } from "../_libs/@radix-ui/react-avatar+[...].mjs";
import { t as Button } from "./button-CAvS9N1W.mjs";
import { t as Label } from "./label-DBD1bRRP.mjs";
import { t as PageHeader } from "./PageHeader-DhP6ZZXs.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as supabase } from "./client-DIXqhfAR.mjs";
import { t as Input } from "./input-DC57PAAM.mjs";
import { t as Textarea } from "./textarea-DorwVIRG.mjs";
import { i as CardTitle, n as CardContent, r as CardHeader, t as Card } from "./card-BcujUCMc.mjs";
import { t as createUuid } from "./uuid-YSajOv4G.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/requests-BodVOk_V.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function RequestsPage() {
	const qc = useQueryClient();
	const [title, setTitle] = (0, import_react.useState)("");
	const [details, setDetails] = (0, import_react.useState)("");
	const [file, setFile] = (0, import_react.useState)(null);
	const requests = useQuery({
		queryKey: ["special-requests"],
		queryFn: async () => {
			const { data, error } = await supabase.from("special_requests").select("*").order("created_at", { ascending: false });
			if (error) throw error;
			return data;
		}
	});
	const submit = useMutation({
		mutationFn: async () => {
			const { data } = await supabase.auth.getUser();
			if (!data.user) throw new Error("سجّل دخولك من جديد");
			let filePath = null;
			if (file) {
				if (file.size > 20971520) throw new Error("الملف أكبر من 20MB");
				const safeName = file.name.replace(/[^\p{L}\p{N}._-]+/gu, "-");
				filePath = `${data.user.id}/${createUuid()}-${safeName}`;
				const upload = await supabase.storage.from("study-materials").upload(filePath, file, {
					upsert: false,
					...file.type ? { contentType: file.type } : {}
				});
				if (upload.error) throw upload.error;
			}
			const { error } = await supabase.from("special_requests").insert({
				user_id: data.user.id,
				title,
				details,
				file_path: filePath
			});
			if (error) throw error;
		},
		onSuccess: () => {
			setTitle("");
			setDetails("");
			setFile(null);
			toast.success("طلبك اتبعت للمراجعة.");
			qc.invalidateQueries({ queryKey: ["special-requests"] });
		},
		onError: (e) => toast.error(e.message)
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		dir: "rtl",
		className: "page-shell max-w-5xl",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				title: "طلبات خاصة",
				subtitle: "لو محتاج تجهيز مختلف عن المولد العادي، ابعت التفاصيل هنا."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "mt-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
					className: "text-base",
					children: "طلب جديد"
				}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "space-y-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "request-title",
								children: "العنوان"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "request-title",
								value: title,
								onChange: (e) => setTitle(e.target.value)
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "request-details",
								children: "التفاصيل"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
								id: "request-details",
								rows: 5,
								value: details,
								onChange: (e) => setDetails(e.target.value)
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "request-file",
									children: "ملف أو صورة (اختياري)"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "request-file",
									type: "file",
									onChange: (e) => setFile(e.target.files?.[0] ?? null)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted-foreground",
									children: "الملف بيتخزن في مكان خاص، ومبيترسلش للذكاء الاصطناعي أوتوماتيك."
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							disabled: !title || submit.isPending,
							onClick: () => submit.mutate(),
							children: submit.isPending ? "بيتبعت..." : "ابعت الطلب"
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-6 space-y-3",
				children: requests.data?.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
					className: "p-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-[minmax(0,1fr)_auto] gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-semibold",
									children: item.title
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-sm text-muted-foreground",
									children: item.details
								}),
								item.admin_note ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-2 text-sm text-primary",
									children: ["رد WISO: ", item.admin_note]
								}) : null
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "shrink-0 text-xs text-muted-foreground",
							children: item.status
						})]
					})
				}) }, item.id))
			})
		]
	});
}
//#endregion
export { RequestsPage as component };
