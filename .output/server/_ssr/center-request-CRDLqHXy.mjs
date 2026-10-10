import { i as __toESM } from "../_runtime.mjs";
import { b as Navigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { f as require_jsx_runtime } from "../_libs/@radix-ui/react-avatar+[...].mjs";
import { t as Button } from "./button-CAvS9N1W.mjs";
import { t as Label } from "./label-DBD1bRRP.mjs";
import { t as PageHeader } from "./PageHeader-DhP6ZZXs.mjs";
import { t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as useAuth } from "./useAuth-BO86jEMb.mjs";
import { t as Input } from "./input-DC57PAAM.mjs";
import { Y as Building2 } from "../_libs/lucide-react.mjs";
import { t as Textarea } from "./textarea-DorwVIRG.mjs";
import { r as submitCenterRequest } from "./center-request2.functions-BwqufJOb.mjs";
import { i as CardTitle, n as CardContent, r as CardHeader, t as Card } from "./card-BcujUCMc.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/center-request-CRDLqHXy.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function CenterRequestPage() {
	const { isAuthenticated, loading } = useAuth();
	const [centerName, setCenterName] = (0, import_react.useState)("");
	const [centerAddress, setCenterAddress] = (0, import_react.useState)("");
	const [contactNumber, setContactNumber] = (0, import_react.useState)("");
	const submit = useMutation({
		mutationFn: () => submitCenterRequest({ data: {
			centerName,
			centerAddress,
			contactNumber
		} }),
		onSuccess: () => {
			toast.success("تم إرسال طلب السنتر للإدارة.");
			setCenterName("");
			setCenterAddress("");
			setContactNumber("");
		},
		onError: (error) => toast.error(error.message)
	});
	if (loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		dir: "rtl",
		className: "page-shell"
	});
	if (!isAuthenticated) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, { to: "/auth" });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		dir: "rtl",
		className: "page-shell max-w-3xl",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			title: "تقديم طلب كـسنتر",
			subtitle: "ابعت بيانات السنتر وفريق WISO هيراجع الطلب ويتواصل معاك."
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
			className: "mt-7",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building2, { className: "size-5" }), " بيانات السنتر"]
			}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "space-y-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "center-name",
							children: "اسم السنتر"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "center-name",
							value: centerName,
							onChange: (e) => setCenterName(e.target.value)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "center-address",
							children: "عنوان السنتر"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
							id: "center-address",
							value: centerAddress,
							onChange: (e) => setCenterAddress(e.target.value)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "center-phone",
							children: "رقم التواصل"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "center-phone",
							inputMode: "tel",
							value: contactNumber,
							onChange: (e) => setContactNumber(e.target.value)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						className: "w-full",
						disabled: submit.isPending || !centerName.trim() || !centerAddress.trim() || !contactNumber.trim(),
						onClick: () => submit.mutate(),
						children: submit.isPending ? "جارٍ إرسال الطلب..." : "إرسال الطلب"
					})
				]
			})]
		})]
	});
}
//#endregion
export { CenterRequestPage as component };
