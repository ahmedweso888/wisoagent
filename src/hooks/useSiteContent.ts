/**
 * Public, admin-managed site content.
 *
 * Every value the landing page, header and footer render comes from the
 * database (RLS keeps inactive rows private). The CODE owns the layout,
 * the DATABASE owns the words. Nothing here is hardcoded business content.
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type SiteSection = {
  id: string;
  section_key: string;
  title: string | null;
  subtitle: string | null;
  description: string | null;
  cta_label: string | null;
  cta_href: string | null;
  image_url: string | null;
  is_active: boolean;
  sort_order: number;
};

export function useSiteSections() {
  return useQuery({
    queryKey: ["site-sections"],
    queryFn: async (): Promise<SiteSection[]> => {
      const { data, error } = await supabase
        .from("site_sections")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");
      if (error) throw error;
      return (data ?? []) as SiteSection[];
    },
  });
}

export function useSectionMap() {
  const q = useSiteSections();
  const map = new Map<string, SiteSection>();
  for (const s of q.data ?? []) map.set(s.section_key, s);
  return { ...q, map };
}

export function useTeachers() {
  return useQuery({
    queryKey: ["site-teachers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_teachers")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useFaq() {
  return useQuery({
    queryKey: ["site-faq"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_faq")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useFooterLinks() {
  return useQuery({
    queryKey: ["site-footer-links"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_footer_links")
        .select("*")
        .eq("is_active", true)
        .order("group_order")
        .order("sort_order");
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useSocialLinks() {
  return useQuery({
    queryKey: ["site-social-links"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_social_links")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useSiteSettings() {
  return useQuery({
    queryKey: ["site-settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_settings").select("key,value");
      if (error) throw error;
      const map: Record<string, string> = {};
      for (const row of data ?? []) map[row.key] = row.value ?? "";
      return map;
    },
  });
}

export function useFeatureFlags() {
  return useQuery({
    queryKey: ["feature-flags"],
    queryFn: async () => {
      const { data, error } = await supabase.from("feature_flags").select("flag_key,enabled");
      if (error) throw error;
      const map: Record<string, boolean> = {};
      for (const row of data ?? []) map[row.flag_key] = row.enabled;
      return map;
    },
  });
}

export function usePublicPlans() {
  return useQuery({
    queryKey: ["public-plans"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subscription_plans")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");
      if (error) throw error;
      return data ?? [];
    },
  });
}

/** Public competition settings (visible rows only, enforced by RLS). */
export function usePublicContest() {
  return useQuery({
    queryKey: ["public-contest"],
    queryFn: async () => {
      const { data, error } = await supabase.from("contest_settings").select("*").maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

/** Authenticated, server-computed competition state. */
export function useContestState() {
  return useQuery({
    queryKey: ["contest-state"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("contest_state");
      if (error) throw error;
      return data as Record<string, unknown>;
    },
  });
}
