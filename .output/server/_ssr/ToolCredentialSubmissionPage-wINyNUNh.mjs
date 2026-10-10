import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { f as require_jsx_runtime } from "../_libs/@radix-ui/react-avatar+[...].mjs";
import { t as Button } from "./button-CAvS9N1W.mjs";
import { t as Label } from "./label-DBD1bRRP.mjs";
import { t as PageHeader } from "./PageHeader-DhP6ZZXs.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as Input } from "./input-DC57PAAM.mjs";
import { E as LockKeyhole, V as CircleCheck, g as ShieldCheck, k as KeyRound } from "../_libs/lucide-react.mjs";
import { i as CardTitle, n as CardContent, r as CardHeader, t as Card } from "./card-BcujUCMc.mjs";
import { d as linkToolAccount, l as getToolAccountStatus, s as getMyToolAccess } from "./wiso-tools.functions-CHro184D.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ToolCredentialSubmissionPage-wINyNUNh.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ToolCredentialSubmissionPage({ toolKey, title, description }) {
	const qc = useQueryClient();
	const [accountId, setAccountId] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const access = useQuery({
		queryKey: ["wiso-tools-access"],
		queryFn: () => getMyToolAccess()
	});
	const account = useQuery({
		queryKey: ["wiso-tool-account", toolKey],
		queryFn: () => getToolAccountStatus({ data: { toolKey } })
	});
	const active = access.data?.some((item) => item.tool_key === toolKey && item.available) ?? false;
	const accountStatus = account.data;
	const attemptConsumed = accountStatus?.attemptConsumed ?? false;
	const attemptAvailable = accountStatus?.attemptAvailable ?? false;
	const canSubmit = active && attemptAvailable && !attemptConsumed;
	const submit = useMutation({
		mutationFn: () => linkToolAccount({ data: {
			toolKey,
			id: accountId.trim(),
			password
		} }),
		onSuccess: async () => {
			toast.success("تم حفظ بيانات الحساب واستهلاك المحاولة بنجاح.");
			setPassword("");
			setAccountId("");
			await Promise.all([qc.invalidateQueries({ queryKey: ["wiso-tool-account", toolKey] }), qc.invalidateQueries({ queryKey: ["wiso-tools-access"] })]);
		},
		onError: async (error) => {
			await qc.invalidateQueries({ queryKey: ["wiso-tool-account", toolKey] });
			const message = error.message ?? "";
			if (message.includes("TOOL_ATTEMPT_ALREADY_USED")) {
				toast.error("تم استهلاك محاولة إرسال البيانات لهذا التفعيل.");
				return;
			}
			if (message.includes("TOOL_ATTEMPT_NOT_AVAILABLE")) {
				toast.error("لا توجد محاولة إرسال متاحة لهذا التفعيل.");
				return;
			}
			if (message.includes("TOOL_ACCESS_REQUIRED")) {
				toast.error("الأداة غير مفعّلة لحسابك أو انتهت صلاحية التفعيل.");
				return;
			}
			if (message.includes("TOOL_ACCOUNT_ALREADY_BOUND")) {
				toast.error("هذا الحساب مرتبط بمستخدم آخر.");
				return;
			}
			if (message.includes("TOOL_ACCOUNT_REBIND_NOT_ALLOWED")) {
				toast.error("لا يمكن تغيير الحساب المرتبط بعد تأكيده.");
				return;
			}
			toast.error("تعذر حفظ البيانات. راجع البيانات وحاول مرة أخرى إذا كانت المحاولة لم تُستهلك.");
		}
	});
	const isLoading = access.isLoading || account.isLoading;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		dir: "rtl",
		className: "page-shell",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			title,
			subtitle: description
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
			className: "mt-6 max-w-2xl",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "size-5" }), "تفعيل الأداة وإرسال بيانات الحساب"]
			}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
				className: "space-y-4",
				children: isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "rounded-xl border p-4 text-sm text-muted-foreground",
					children: "جارٍ التحقق من التفعيل ومحاولة الإرسال..."
				}) : access.isError || account.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "rounded-xl border p-4 text-sm",
					children: "تعذر التحقق من حالة حسابك. حدّث الصفحة وحاول مرة أخرى."
				}) : !active ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "rounded-xl border p-4 text-sm",
					children: "الأداة غير مفعّلة لحسابك. اشحن أو فعّل كود الأداة أولًا."
				}) : attemptConsumed ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-3 rounded-xl border p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2 font-medium",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-5" }), "تم استلام بيانات حسابك"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground",
							children: "تم استهلاك محاولة إرسال البيانات الخاصة بهذا التفعيل. لا يمكنك إرسال بيانات بديلة ضمن التفعيل نفسه."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground",
							children: "بسبب ضغط الطلبات على WISO Agent، يُرجى التواصل مع الدعم إذا لم تتم معالجة حسابك خلال يومين."
						})
					]
				}) : !attemptAvailable ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "rounded-xl border p-4 text-sm",
					children: "لا توجد محاولة إرسال متاحة لهذا التفعيل حاليًا. إذا كنت قد فعّلت الأداة للتو، حدّث الصفحة أو تواصل مع الدعم."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-xl border p-4 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mb-2 flex items-center gap-2 font-medium",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LockKeyhole, { className: "size-4" }), "لديك محاولة واحدة لإرسال بيانات الحساب"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-muted-foreground",
							children: "تأكد من صحة اسم المستخدم وكلمة المرور قبل الإرسال. بمجرد حفظ البيانات بنجاح، تُستهلك المحاولة نهائيًا， لو حصل غلط تواصل مع الدعم وابعت اسكرين التحويل والid والباسوورد وهنراجع بياناتك"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "tool-account-id",
							children: "Account ID / اسم المستخدم"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "tool-account-id",
							autoComplete: "username",
							value: accountId,
							onChange: (event) => setAccountId(event.target.value),
							maxLength: 200,
							disabled: submit.isPending
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "tool-account-password",
							children: "Password"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "tool-account-password",
							type: "password",
							autoComplete: "current-password",
							value: password,
							onChange: (event) => setPassword(event.target.value),
							maxLength: 500,
							disabled: submit.isPending
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						disabled: submit.isPending || !canSubmit || !accountId.trim() || !password,
						onClick: () => submit.mutate(),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyRound, { className: "ml-2 size-4" }), submit.isPending ? "جارٍ حفظ البيانات..." : "تأكيد وإرسال بيانات الحساب"]
					})
				] })
			})]
		})]
	});
}
//#endregion
export { ToolCredentialSubmissionPage as t };
