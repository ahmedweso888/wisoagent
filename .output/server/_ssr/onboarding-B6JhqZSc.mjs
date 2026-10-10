import { i as __toESM } from "../_runtime.mjs";
import { x as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { f as require_jsx_runtime } from "../_libs/@radix-ui/react-avatar+[...].mjs";
import { t as Button } from "./button-CAvS9N1W.mjs";
import { t as Label } from "./label-DBD1bRRP.mjs";
import { t as PageHeader } from "./PageHeader-DhP6ZZXs.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as supabase } from "./client-DIXqhfAR.mjs";
import { n as useAuth } from "./useAuth-BO86jEMb.mjs";
import { t as Input } from "./input-DC57PAAM.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-Cfotl7s5.mjs";
import { i as CardTitle, n as CardContent, r as CardHeader, t as Card } from "./card-BcujUCMc.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/onboarding-B6JhqZSc.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function OnboardingPage() {
	const { user, profile } = useAuth();
	useNavigate();
	useQueryClient();
	const [fullName, setFullName] = (0, import_react.useState)(profile?.full_name ?? "");
	const [phone, setPhone] = (0, import_react.useState)(profile?.phone ?? "");
	const [schoolYear, setSchoolYear] = (0, import_react.useState)(profile?.school_year ?? "");
	const [track, setTrack] = (0, import_react.useState)(profile?.track ?? "");
	const stages = useQuery({
		queryKey: ["academic-stages-onboarding"],
		queryFn: async () => {
			const { data, error } = await supabase.from("academic_stages").select("id,name_ar,slug").eq("is_active", true).order("sort_order");
			if (error) throw error;
			return data ?? [];
		}
	});
	const tracks = useQuery({
		queryKey: ["academic-tracks-onboarding", schoolYear],
		enabled: Boolean(schoolYear),
		queryFn: async () => {
			const stage = stages.data?.find((item) => item.slug === schoolYear);
			if (!stage) return [];
			const { data, error } = await supabase.from("academic_tracks").select("id,name_ar,slug").eq("stage_id", stage.id).eq("is_active", true).order("sort_order");
			if (error) throw error;
			return data ?? [];
		}
	});
	const save = useMutation({
		mutationFn: async () => {
			const stage = stages.data?.find((item) => item.slug === schoolYear);
			if (!stage) throw new Error("اختار مرحلة دراسية صحيحة");
			const selectedTrack = tracks.data?.find((item) => item.slug === track);
			const onboardingArgs = {
				_stage_id: stage.id,
				...selectedTrack?.id ? { _track_id: selectedTrack.id } : {}
			};
			const { error: onboardingError } = await supabase.rpc("complete_academic_onboarding", onboardingArgs);
			if (onboardingError) throw onboardingError;
			const { error: profileError } = await supabase.from("profiles").update({
				full_name: fullName.trim(),
				phone: phone.trim()
			}).eq("id", user.id);
			if (profileError) throw profileError;
		},
		onError: (e) => toast.error(e.message)
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		dir: "rtl",
		className: "page-shell max-w-2xl",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			title: "خطوة واحدة وتبدأ",
			subtitle: "قولنا بتدرس إيه عشان WISO يظبط الرحلة ليك."
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
			className: "mt-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
				className: "text-base",
				children: "بياناتك الدراسية"
			}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "space-y-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "name",
							children: "الاسم"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "name",
							value: fullName,
							onChange: (e) => setFullName(e.target.value)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "phone",
							children: "رقم الموبايل"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "phone",
							value: phone,
							onChange: (e) => setPhone(e.target.value)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "المرحلة الدراسية *" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: schoolYear,
							onValueChange: (value) => {
								setSchoolYear(value);
								setTrack("");
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "اختار مرحلتك الدراسية" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: stages.data?.map((stage) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: stage.slug,
								children: stage.name_ar
							}, stage.id)) })]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "track",
							children: "الشعبة / التخصص"
						}), tracks.data?.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: track,
							onValueChange: setTrack,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
								id: "track",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "اختار الشعبة" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: tracks.data.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: item.slug,
								children: item.name_ar
							}, item.slug)) })]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "track",
							value: track,
							onChange: (e) => setTrack(e.target.value)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						className: "w-full",
						disabled: save.isPending || !fullName.trim() || !schoolYear,
						onClick: () => save.mutate(),
						children: save.isPending ? "بيتسجل..." : "يلا نبدأ"
					})
				]
			})]
		})]
	});
}
//#endregion
export { OnboardingPage as component };
