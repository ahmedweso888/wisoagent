import { t as cn } from "./utils-C_uf36nf.mjs";
import { f as require_jsx_runtime } from "../_libs/@radix-ui/react-avatar+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/StatCard-DTaJ4i7N.js
var import_jsx_runtime = require_jsx_runtime();
function StatCard({ label, value, hint, tone = "default", className }) {
	const toneClass = {
		default: "text-foreground",
		primary: "text-primary",
		accent: "text-accent",
		destructive: "text-destructive",
		success: "text-success"
	}[tone];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("surface-panel border-t-2 border-t-primary/30 p-4 sm:p-5", className),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-medium text-muted-foreground",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: cn("num mt-2 font-display text-2xl font-bold sm:text-3xl", toneClass),
				children: value
			}),
			hint ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-xs text-muted-foreground",
				children: hint
			}) : null
		]
	});
}
//#endregion
export { StatCard as t };
