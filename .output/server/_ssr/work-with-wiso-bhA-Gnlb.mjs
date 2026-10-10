import { f as require_jsx_runtime } from "../_libs/@radix-ui/react-avatar+[...].mjs";
import { t as Button } from "./button-CAvS9N1W.mjs";
import { t as PageHeader } from "./PageHeader-DhP6ZZXs.mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { R as Copy, V as CircleCheck, a as WalletCards, c as Users } from "../_libs/lucide-react.mjs";
import { i as CardTitle, n as CardContent, r as CardHeader, t as Card } from "./card-BcujUCMc.mjs";
import { n as getMyReferralStats } from "./referral.functions-DlOABNG9.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/work-with-wiso-bhA-Gnlb.js
var import_jsx_runtime = require_jsx_runtime();
function WorkWithWisoPage() {
	const stats = useQuery({
		queryKey: ["my-referral-stats"],
		queryFn: () => getMyReferralStats()
	});
	const copyLink = async () => {
		if (!stats.data?.link) return;
		await navigator.clipboard.writeText(`${window.location.origin}${stats.data.link}`);
		toast.success("اتنسخ رابط الدعوة.");
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		dir: "rtl",
		className: "page-shell max-w-5xl",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				title: "اشتغل مع WISO",
				subtitle: "شارك رابطك مع أصحابك وخليهم يبدأوا رحلتهم مع WISO."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "mt-7",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "رابط الدعوة الخاص بيك" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col gap-3 sm:flex-row",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex-1 rounded-xl border bg-muted/30 p-3 font-mono text-sm",
						dir: "ltr",
						children: stats.data ? `${window.location.origin}${stats.data.link}` : "جارٍ إنشاء الرابط..."
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						onClick: () => void copyLink(),
						disabled: !stats.data?.link,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "me-2 size-4" }), " نسخ الرابط"]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 text-sm leading-7 text-muted-foreground",
					children: "دلوقتي تقدر تذاكر وتشتغل مع wiso يلا خلي صحابك يشتركو واكسب ارباحك"
				})] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						icon: Users,
						label: "دخلوا من الرابط",
						value: stats.data?.visits ?? 0
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						icon: CircleCheck,
						label: "اشتراكات مدفوعة",
						value: stats.data?.paidSubscriptions ?? 0
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						icon: WalletCards,
						label: "إجمالي الأرباح",
						value: `${Number(stats.data?.totalRewards ?? 0).toFixed(2)} ج.م`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						icon: WalletCards,
						label: "في المحفظة",
						value: `${Number(stats.data?.walletBalance ?? 0).toFixed(2)} ج.م`
					})
				]
			})
		]
	});
}
function Stat({ icon: Icon, label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
		className: "p-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-5 text-primary" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 text-sm text-muted-foreground",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-2xl font-bold",
				children: value
			})
		]
	}) });
}
//#endregion
export { WorkWithWisoPage as component };
