import { t as cn } from "./utils-C_uf36nf.mjs";
import { f as require_jsx_runtime } from "../_libs/@radix-ui/react-avatar+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/PageHeader-DhP6ZZXs.js
var import_jsx_runtime = require_jsx_runtime();
function PageHeader({ title, subtitle, actions, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
		className: cn("grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4 border-b border-border pb-5", className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-w-0 space-y-1.5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "truncate font-display text-2xl font-extrabold sm:text-3xl",
				children: title
			}), subtitle ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "max-w-2xl text-sm text-muted-foreground",
				children: subtitle
			}) : null]
		}), actions ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex shrink-0 flex-wrap items-center gap-2",
			children: actions
		}) : null]
	});
}
//#endregion
export { PageHeader as t };
