import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { f as require_jsx_runtime } from "../_libs/@radix-ui/react-avatar+[...].mjs";
import { t as Button } from "./button-CAvS9N1W.mjs";
import { t as Label } from "./label-DBD1bRRP.mjs";
import { t as PageHeader } from "./PageHeader-DhP6ZZXs.mjs";
import { t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as supabase } from "./client-DIXqhfAR.mjs";
import { n as useAuth } from "./useAuth-BO86jEMb.mjs";
import { t as Input } from "./input-DC57PAAM.mjs";
import { n as CardContent, t as Card } from "./card-BcujUCMc.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/settings-BXsyxqWV.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function SettingsPage() {
	const { user, profile } = useAuth();
	const [name, setName] = (0, import_react.useState)("");
	const [phone, setPhone] = (0, import_react.useState)("");
	const [year, setYear] = (0, import_react.useState)("");
	const [track, setTrack] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		setName(profile?.full_name ?? "");
		setPhone(profile?.phone ?? "");
		setYear(profile?.school_year ?? "");
		setTrack(profile?.track ?? "");
	}, [profile]);
	const save = useMutation({
		mutationFn: async () => {
			if (!user) throw new Error("سجّل دخولك من جديد");
			const { error } = await supabase.from("profiles").update({
				full_name: name,
				phone,
				school_year: year,
				track
			}).eq("id", user.id);
			if (error) throw error;
		},
		onSuccess: () => toast.success("اتحفظت التغييرات."),
		onError: (e) => toast.error(e.message)
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		dir: "rtl",
		className: "page-shell max-w-3xl",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			title: "حسابي",
			subtitle: "بياناتك دي بتساعد WISO يضبط الخطة والمحتوى المناسب ليك."
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
			className: "mt-6",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "space-y-4 p-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "settings-name",
							children: "الاسم"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "settings-name",
							value: name,
							onChange: (e) => setName(e.target.value)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "settings-email",
							children: "الإيميل"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "settings-email",
							value: user?.email ?? "",
							disabled: true,
							dir: "ltr"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "settings-phone",
							children: "رقم الموبايل"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "settings-phone",
							value: phone,
							onChange: (e) => setPhone(e.target.value)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-4 sm:grid-cols-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "settings-year",
								children: "السنة الدراسية"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "settings-year",
								value: year,
								onChange: (e) => setYear(e.target.value)
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "settings-track",
								children: "الشعبة"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "settings-track",
								value: track,
								onChange: (e) => setTrack(e.target.value)
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						disabled: !name || save.isPending,
						onClick: () => save.mutate(),
						children: save.isPending ? "بيتحفظ..." : "حفظ التغييرات"
					})
				]
			})
		})]
	});
}
//#endregion
export { SettingsPage as component };
