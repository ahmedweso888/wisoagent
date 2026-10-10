import { i as __toESM } from "../_runtime.mjs";
import { b as Navigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { f as require_jsx_runtime } from "../_libs/@radix-ui/react-avatar+[...].mjs";
import { i as useQueryClient, n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { t as supabase } from "./client-DIXqhfAR.mjs";
import { n as useAuth } from "./useAuth-BO86jEMb.mjs";
import { $ as BellRing, G as Check, K as CheckCheck, Q as Bell, g as ShieldCheck, o as VolumeX, s as Volume2, y as RefreshCw, z as Clock } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin.notifications-DSH49MLK.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AdminNotificationsPage() {
	const queryClient = useQueryClient();
	const { user, isAdmin } = useAuth();
	const [permission, setPermission] = (0, import_react.useState)(typeof window !== "undefined" && "Notification" in window ? Notification.permission : "default");
	const [soundEnabled, setSoundEnabled] = (0, import_react.useState)(true);
	const audioRef = (0, import_react.useRef)(null);
	const initializedRef = (0, import_react.useRef)(false);
	const knownIdsRef = (0, import_react.useRef)(/* @__PURE__ */ new Set());
	(0, import_react.useEffect)(() => {
		audioRef.current = new Audio("/sounds/admin-notification.mp3");
		if ("Notification" in window) setPermission(Notification.permission);
	}, []);
	const { data: notifications = [], isLoading: isNotificationsLoading, error, refetch } = useQuery({
		queryKey: ["admin", "notifications"],
		queryFn: async () => {
			const { data, error } = await supabase.from("admin_notifications").select("*").order("created_at", { ascending: false }).limit(100);
			if (error) throw error;
			return data ?? [];
		},
		refetchInterval: 1e4,
		refetchOnWindowFocus: true
	});
	(0, import_react.useEffect)(() => {
		if (!notifications.length) return;
		if (!initializedRef.current) {
			knownIdsRef.current = new Set(notifications.map((notification) => notification.id));
			initializedRef.current = true;
			return;
		}
		const freshNotifications = notifications.filter((notification) => !knownIdsRef.current.has(notification.id));
		if (!freshNotifications.length) return;
		freshNotifications.forEach((notification) => {
			knownIdsRef.current.add(notification.id);
		});
		if (soundEnabled && audioRef.current) {
			audioRef.current.currentTime = 0;
			audioRef.current.play().catch(() => {});
		}
		if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") freshNotifications.forEach((notification) => {
			try {
				const browserNotification = new Notification(notification.title, {
					body: notification.body ?? "وصل طلب جديد إلى لوحة الإدارة.",
					icon: "/favicon.ico",
					tag: notification.id
				});
				browserNotification.onclick = () => {
					window.focus();
					browserNotification.close();
				};
			} catch (error) {
				console.error("تعذر عرض إشعار المتصفح:", error);
			}
		});
	}, [notifications, soundEnabled]);
	async function enableDeviceNotifications() {
		if (!("Notification" in window)) {
			alert("المتصفح لا يدعم إشعارات النظام. جرّب فتح المنصة في Chrome.");
			return;
		}
		try {
			const result = await Notification.requestPermission();
			setPermission(result);
			if (result === "granted") {
				alert("تم تفعيل صلاحية إشعارات المتصفح على هذا الجهاز.");
				if (audioRef.current && soundEnabled) try {
					audioRef.current.currentTime = 0;
					await audioRef.current.play();
				} catch {}
			} else if (result === "denied") alert("الإشعارات مرفوضة من إعدادات المتصفح. اسمح بها من إعدادات الموقع.");
		} catch (error) {
			console.error("فشل طلب صلاحية الإشعارات:", error);
			alert("تعذر طلب صلاحية الإشعارات.");
		}
	}
	async function markAsRead(id) {
		const { error } = await supabase.from("admin_notifications").update({ read_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", id);
		if (error) {
			alert("تعذر تعليم الإشعار كمقروء.");
			return;
		}
		await queryClient.invalidateQueries({ queryKey: ["admin", "notifications"] });
	}
	async function markAllAsRead() {
		const unreadIds = notifications.filter((notification) => !notification.read_at).map((notification) => notification.id);
		if (!unreadIds.length) return;
		const { error } = await supabase.from("admin_notifications").update({ read_at: (/* @__PURE__ */ new Date()).toISOString() }).in("id", unreadIds);
		if (error) {
			alert("تعذر تعليم الإشعارات كمقروءة.");
			return;
		}
		await queryClient.invalidateQueries({ queryKey: ["admin", "notifications"] });
	}
	if (!user || !isAdmin) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, { to: "/dashboard" });
	const unreadCount = notifications.filter((notification) => !notification.read_at).length;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-5xl space-y-6 p-4 md:p-8",
		dir: "rtl",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center justify-between gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-2 flex items-center gap-2 text-sm text-muted-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { size: 17 }), "لوحة تحكم الأدمن"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
						className: "flex items-center gap-3 text-2xl font-bold md:text-3xl",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BellRing, {
							className: "text-primary",
							size: 30
						}), "إشعارات الإدارة"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-muted-foreground",
						children: "تابع طلبات الدفع والأدوات الجديدة من مكان واحد."
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					onClick: () => void refetch(),
					className: "flex items-center gap-2 rounded-xl border px-4 py-2 text-sm transition hover:bg-muted",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { size: 16 }), "تحديث"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-2xl border bg-card p-5 shadow-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mb-4 text-lg font-semibold",
					children: "إعدادات إشعارات الجهاز"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col gap-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, {
									size: 21,
									className: "text-primary"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-medium",
									children: "إشعارات المتصفح"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm text-muted-foreground",
									children: "السماح بعرض إشعار عند وصول طلب جديد."
								})] })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => void enableDeviceNotifications(),
								disabled: permission === "granted",
								className: "rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50",
								children: permission === "granted" ? "تم تفعيل الإشعارات" : "تفعيل الإشعارات"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center justify-between gap-3 border-t pt-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-3",
								children: [soundEnabled ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Volume2, {
									size: 21,
									className: "text-primary"
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VolumeX, {
									size: 21,
									className: "text-muted-foreground"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-medium",
									children: "صوت الإشعار"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm text-muted-foreground",
									children: "تشغيل الصوت عند اكتشاف طلب جديد."
								})] })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => setSoundEnabled((enabled) => !enabled),
								className: "rounded-xl border px-4 py-2 text-sm transition hover:bg-muted",
								children: soundEnabled ? "كتم الصوت" : "تشغيل الصوت"
							})]
						}),
						permission === "denied" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "rounded-xl bg-destructive/10 p-3 text-sm text-destructive",
							children: "الإشعارات محظورة من المتصفح. افتح إعدادات الموقع واسمح بالإشعارات، ثم أعد تحميل الصفحة."
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-1 gap-4 sm:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-2xl border bg-card p-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: "إجمالي الإشعارات"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-3xl font-bold",
						children: notifications.length
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-2xl border bg-card p-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: "غير المقروءة"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-3xl font-bold text-primary",
						children: unreadCount
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "overflow-hidden rounded-2xl border bg-card shadow-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center justify-between gap-3 border-b p-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-lg font-semibold",
						children: "آخر الإشعارات"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted-foreground",
						children: "يتم تحديث القائمة تلقائيًا كل 10 ثوانٍ."
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => void markAllAsRead(),
						disabled: unreadCount === 0,
						className: "flex items-center gap-2 rounded-xl border px-3 py-2 text-sm transition hover:bg-muted disabled:opacity-50",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckCheck, { size: 16 }), "تعليم الكل كمقروء"]
					})]
				}), isNotificationsLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "p-10 text-center text-muted-foreground",
					children: "جاري تحميل الإشعارات..."
				}) : error ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "p-8 text-center",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-semibold text-destructive",
							children: "تعذر تحميل الإشعارات."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm text-muted-foreground",
							children: "تأكد من تنفيذ SQL وإنشاء جدول إشعارات الأدمن."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => void refetch(),
							className: "mt-4 rounded-xl border px-4 py-2",
							children: "إعادة المحاولة"
						})
					]
				}) : notifications.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "p-12 text-center",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, {
							size: 40,
							className: "mx-auto text-muted-foreground"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-4 font-semibold",
							children: "لا توجد إشعارات حتى الآن"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm text-muted-foreground",
							children: "ستظهر هنا الطلبات الجديدة عند وصولها."
						})
					]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "divide-y",
					children: notifications.map((notification) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("article", {
						className: `p-5 transition ${notification.read_at ? "" : "bg-primary/[0.04]"}`,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start gap-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: `mt-1 rounded-xl p-3 ${notification.read_at ? "bg-muted" : "bg-primary/10 text-primary"}`,
									children: notification.read_at ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { size: 21 }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BellRing, { size: 21 })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0 flex-1",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex flex-wrap items-center gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
												className: "font-semibold",
												children: notification.title
											}), !notification.read_at && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "rounded-full bg-primary/10 px-2 py-1 text-xs text-primary",
												children: "جديد"
											})]
										}),
										notification.body && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-2 whitespace-pre-wrap text-sm leading-6 text-muted-foreground",
											children: notification.body
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "flex items-center gap-1",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { size: 14 }), new Date(notification.created_at).toLocaleString("ar-EG")]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["النوع: ", notification.kind] })]
										})
									]
								}),
								!notification.read_at && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: () => void markAsRead(notification.id),
									title: "تعليم كمقروء",
									"aria-label": "تعليم الإشعار كمقروء",
									className: "rounded-lg border p-2 transition hover:bg-muted",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { size: 18 })
								})
							]
						})
					}, notification.id))
				})]
			})
		]
	});
}
//#endregion
export { AdminNotificationsPage as component };
