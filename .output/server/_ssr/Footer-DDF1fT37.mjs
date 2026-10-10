import { f as require_jsx_runtime } from "../_libs/@radix-ui/react-avatar+[...].mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { t as supabase } from "./client-DIXqhfAR.mjs";
import { A as Instagram, P as Facebook, _ as Send, t as Youtube, w as MessageCircle } from "../_libs/lucide-react.mjs";
import { t as WisoMark } from "./WisoMark-DOvYZQdC.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/Footer-DDF1fT37.js
var import_jsx_runtime = require_jsx_runtime();
/**
* Public, admin-managed site content.
*
* Every value the landing page, header and footer render comes from the
* database (RLS keeps inactive rows private). The CODE owns the layout,
* the DATABASE owns the words. Nothing here is hardcoded business content.
*/
function useSiteSections() {
	return useQuery({
		queryKey: ["site-sections"],
		queryFn: async () => {
			const { data, error } = await supabase.from("site_sections").select("*").eq("is_active", true).order("sort_order");
			if (error) throw error;
			return data ?? [];
		}
	});
}
function useSectionMap() {
	const q = useSiteSections();
	const map = /* @__PURE__ */ new Map();
	for (const s of q.data ?? []) map.set(s.section_key, s);
	return {
		...q,
		map
	};
}
function useTeachers() {
	return useQuery({
		queryKey: ["site-teachers"],
		queryFn: async () => {
			const { data, error } = await supabase.from("site_teachers").select("*").eq("is_active", true).order("sort_order");
			if (error) throw error;
			return data ?? [];
		}
	});
}
function useFaq() {
	return useQuery({
		queryKey: ["site-faq"],
		queryFn: async () => {
			const { data, error } = await supabase.from("site_faq").select("*").eq("is_active", true).order("sort_order");
			if (error) throw error;
			return data ?? [];
		}
	});
}
function useFooterLinks() {
	return useQuery({
		queryKey: ["site-footer-links"],
		queryFn: async () => {
			const { data, error } = await supabase.from("site_footer_links").select("*").eq("is_active", true).order("group_order").order("sort_order");
			if (error) throw error;
			return data ?? [];
		}
	});
}
function useSocialLinks() {
	return useQuery({
		queryKey: ["site-social-links"],
		queryFn: async () => {
			const { data, error } = await supabase.from("site_social_links").select("*").eq("is_active", true).order("sort_order");
			if (error) throw error;
			return data ?? [];
		}
	});
}
function useSiteSettings() {
	return useQuery({
		queryKey: ["site-settings"],
		queryFn: async () => {
			const { data, error } = await supabase.from("site_settings").select("key,value");
			if (error) throw error;
			const map = {};
			for (const row of data ?? []) map[row.key] = row.value ?? "";
			return map;
		}
	});
}
function useFeatureFlags() {
	return useQuery({
		queryKey: ["feature-flags"],
		queryFn: async () => {
			const { data, error } = await supabase.from("feature_flags").select("flag_key,enabled");
			if (error) throw error;
			const map = {};
			for (const row of data ?? []) map[row.flag_key] = row.enabled;
			return map;
		}
	});
}
function usePublicPlans() {
	return useQuery({
		queryKey: ["public-plans"],
		queryFn: async () => {
			const { data, error } = await supabase.from("subscription_plans").select("*").eq("is_active", true).order("sort_order");
			if (error) throw error;
			return data ?? [];
		}
	});
}
/** Public competition settings (visible rows only, enforced by RLS). */
function usePublicContest() {
	return useQuery({
		queryKey: ["public-contest"],
		queryFn: async () => {
			const { data, error } = await supabase.from("contest_settings").select("*").maybeSingle();
			if (error) throw error;
			return data;
		}
	});
}
var PLATFORM_ICONS = {
	facebook: Facebook,
	instagram: Instagram,
	youtube: Youtube,
	telegram: Send,
	whatsapp: MessageCircle
};
function TikTokIcon({ className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
		viewBox: "0 0 24 24",
		fill: "currentColor",
		"aria-hidden": "true",
		className,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M19.59 6.69a4.83 4.83 0 0 1-3.77-3.77V2h-3.13v13.13a2.93 2.93 0 1 1-2.93-2.93c.31 0 .61.05.89.14V9.15a6.06 6.06 0 0 0-.89-.07A6.06 6.06 0 1 0 15.82 15V8.71a7.92 7.92 0 0 0 4.63 1.49V7.07a4.84 4.84 0 0 1-.86-.38Z" })
	});
}
function SocialIcon({ platform }) {
	if (platform === "tiktok") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TikTokIcon, { className: "h-4 w-4" });
	const Icon = PLATFORM_ICONS[platform];
	if (!Icon) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "text-[10px] font-bold",
		children: platform.slice(0, 1).toUpperCase()
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "h-4 w-4" });
}
/**
* Large premium footer. Structure is fixed in code; every title, link,
* social platform and contact value comes from admin-managed tables.
*/
function Footer() {
	const links = useFooterLinks();
	const socials = useSocialLinks();
	const settings = useSiteSettings();
	const groups = /* @__PURE__ */ new Map();
	for (const row of links.data ?? []) {
		const list = groups.get(row.group_title) ?? [];
		list.push({
			label: row.label,
			href: row.href
		});
		groups.set(row.group_title, list);
	}
	const description = settings.data?.["footer_description"] ?? "";
	const copyright = settings.data?.["footer_copyright"] ?? "";
	const email = settings.data?.["contact_email"] ?? "";
	const whatsapp = settings.data?.["contact_whatsapp"] ?? "";
	const hours = settings.data?.["support_hours"] ?? "";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", {
		dir: "rtl",
		className: "relative overflow-hidden border-t border-white/10 bg-black text-white",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WisoMark, { className: "pointer-events-none absolute -bottom-10 left-1/2 h-80 w-[20rem] -translate-x-1/2 opacity-[0.9] grayscale" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative mx-auto w-full max-w-6xl px-5 py-14 sm:py-20",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-10 lg:grid-cols-[1.4fr_2fr]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WisoMark, { className: "h-12 w-20" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 font-display text-lg font-bold text-white",
						dir: "ltr",
						children: "WISO Agent"
					}),
					description ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-5 max-w-sm text-sm leading-7 text-white/70",
						children: description
					}) : null,
					socials.data?.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-6 flex flex-wrap gap-2",
						children: socials.data.map((social) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: social.url,
							target: "_blank",
							rel: "noopener noreferrer",
							"aria-label": social.platform,
							title: social.platform,
							className: "flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white/75 transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/10 hover:text-white hover:shadow-lg",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SocialIcon, { platform: social.platform })
						}, social.id))
					}) : null
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-8 sm:grid-cols-2 lg:grid-cols-3",
					children: [[...groups.entries()].map(([title, items]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "text-sm font-bold text-white",
						children: title
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-4 space-y-2.5",
						children: items.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: item.href,
							className: "text-sm text-white/65 transition-colors hover:text-white",
							children: item.label
						}) }, `${title}-${item.href}-${item.label}`))
					})] }, title)), email || whatsapp || hours ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "text-sm font-bold text-white",
						children: "تواصل معنا"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
						className: "mt-4 space-y-2.5 text-sm text-white/65",
						children: [
							email ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
								href: `mailto:${email}`,
								className: "transition-colors hover:text-white",
								children: email
							}) }) : null,
							whatsapp ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
								href: `https://wa.me/${whatsapp.replace(/[^0-9]/g, "")}`,
								target: "_blank",
								rel: "noopener noreferrer",
								className: "transition-colors hover:text-white",
								children: whatsapp
							}) }) : null,
							hours ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: hours }) : null
						]
					})] }) : null]
				})]
			}), copyright ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-12 border-t border-white/10 pt-6 text-xs text-white/55",
				children: copyright
			}) : null]
		})]
	});
}
//#endregion
export { usePublicPlans as a, usePublicContest as i, useFaq as n, useSectionMap as o, useFeatureFlags as r, useTeachers as s, Footer as t };
