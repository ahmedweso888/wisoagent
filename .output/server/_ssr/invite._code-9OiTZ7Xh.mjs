import { i as __toESM } from "../_runtime.mjs";
import { x as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { f as require_jsx_runtime } from "../_libs/@radix-ui/react-avatar+[...].mjs";
import { t as Route } from "./invite._code-CEzdwHKM.mjs";
import { t as createUuid } from "./uuid-YSajOv4G.mjs";
import { r as recordReferralVisit } from "./referral.functions-DlOABNG9.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/invite._code-9OiTZ7Xh.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function InvitePage() {
	const { code } = Route.useParams();
	const navigate = useNavigate();
	(0, import_react.useEffect)(() => {
		const normalized = code.trim().toUpperCase();
		const keyName = "wiso_referral_visitor";
		const refKey = "wiso_referral_code";
		const visitorKey = localStorage.getItem(keyName) ?? createUuid();
		localStorage.setItem(keyName, visitorKey);
		localStorage.setItem(refKey, normalized);
		recordReferralVisit({ data: {
			code: normalized,
			visitorKey
		} }).finally(() => {
			navigate({ to: "/auth" });
		});
	}, [code, navigate]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		dir: "rtl",
		className: "flex min-h-screen items-center justify-center p-6",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted-foreground",
			children: "جارٍ تجهيز رابط الدعوة..."
		})
	});
}
//#endregion
export { InvitePage as component };
