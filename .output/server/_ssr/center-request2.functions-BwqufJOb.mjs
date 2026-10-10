import { l as createServerFn } from "./createServerFn-yTfeHp1H.mjs";
import { n as requireSupabaseAuth } from "./auth-middleware-BogctHY4.mjs";
import { t as createSsrRpc } from "./createSsrRpc-Ce7g1tLo.mjs";
import { t as requireSupabaseAdmin } from "./admin.middleware-BsoUGKyB.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/center-request2.functions-BwqufJOb.js
var STATUSES = [
	"new",
	"reviewing",
	"contacted",
	"approved",
	"rejected"
];
var submitCenterRequest = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input) => {
	const centerName = input.centerName.trim();
	const centerAddress = input.centerAddress.trim();
	const contactNumber = input.contactNumber.trim();
	if (centerName.length < 2 || centerName.length > 200) throw new Error("اسم السنتر غير صالح.");
	if (centerAddress.length < 5 || centerAddress.length > 500) throw new Error("عنوان السنتر غير صالح.");
	if (!/^[+]?[0-9٠-٩\s()-]{8,30}$/.test(contactNumber)) throw new Error("رقم التواصل غير صالح.");
	return {
		centerName,
		centerAddress,
		contactNumber
	};
}).handler(createSsrRpc("520a20a15d946155da3f66ec559ae310c26e6c58e8c73c5d391dd4de00b191be"));
createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(createSsrRpc("77d5954954d9b76251c1fa9ef050e5f098bd49021efbdcd6ac31559e52938366"));
var adminListCenterRequests = createServerFn({ method: "GET" }).middleware([requireSupabaseAdmin]).handler(createSsrRpc("f4e4523136f0586d10b79e040e3dc575038c019d2ea93f035105b8248d39c2d5"));
var adminUpdateCenterRequest = createServerFn({ method: "POST" }).middleware([requireSupabaseAdmin]).inputValidator((input) => {
	if (!STATUSES.includes(input.status)) throw new Error("invalid_status");
	return input;
}).handler(createSsrRpc("e646b5317c94ddedeb9db7bda1fc29af16db64e3cbb454575eb7df5bf1d2e594"));
//#endregion
export { adminUpdateCenterRequest as n, submitCenterRequest as r, adminListCenterRequests as t };
