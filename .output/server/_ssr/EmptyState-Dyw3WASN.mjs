import { t as cn } from "./utils-C_uf36nf.mjs";
import { f as require_jsx_runtime } from "../_libs/@radix-ui/react-avatar+[...].mjs";
import { t as Button } from "./button-CAvS9N1W.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/EmptyState-Dyw3WASN.js
var import_jsx_runtime = require_jsx_runtime();
function EmptyState({ icon: Icon, title, description, actionLabel, onAction, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-muted/30 px-6 py-14 text-center", className),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "flex size-12 items-center justify-center rounded-lg bg-secondary text-primary",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-6" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "font-display text-lg font-semibold",
				children: title
			}),
			description ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "max-w-md text-sm leading-relaxed text-muted-foreground",
				children: description
			}) : null,
			actionLabel && onAction ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				onClick: onAction,
				className: "mt-2",
				children: actionLabel
			}) : null
		]
	});
}
//#endregion
export { EmptyState as t };
