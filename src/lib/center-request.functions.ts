import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { requireSupabaseAdmin } from "@/lib/admin.middleware";

const STATUSES = ["new", "reviewing", "contacted", "approved", "rejected"] as const;

export const submitCenterRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: { centerName: string; centerAddress: string; contactNumber: string }) => {
      const centerName = input.centerName.trim();
      const centerAddress = input.centerAddress.trim();
      const contactNumber = input.contactNumber.trim();
      if (centerName.length < 2 || centerName.length > 200) throw new Error("اسم السنتر غير صالح.");
      if (centerAddress.length < 5 || centerAddress.length > 500) throw new Error("عنوان السنتر غير صالح.");
      if (!/^[+]?[0-9٠-٩\s()-]{8,30}$/.test(contactNumber)) {
        throw new Error("رقم التواصل غير صالح.");
      }
      return { centerName, centerAddress, contactNumber };
    },
  )
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("center_requests")
      .insert({
        user_id: context.userId,
        center_name: data.centerName,
        center_address: data.centerAddress,
        contact_number: data.contactNumber,
      })
      .select("id,status,created_at")
      .single();
    if (error) throw error;
    return row;
  });

export const listMyCenterRequests = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("center_requests")
      .select("id,center_name,center_address,contact_number,status,admin_note,created_at,updated_at")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false })
      .limit(20);
    if (error) throw error;
    return data ?? [];
  });

export const adminListCenterRequests = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAdmin])
  .handler(async () => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("center_requests")
      .select("id,user_id,center_name,center_address,contact_number,status,admin_note,reviewed_by,reviewed_at,created_at,updated_at")
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) throw error;
    return data ?? [];
  });

export const adminUpdateCenterRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAdmin])
  .inputValidator(
    (input: {
      requestId: string;
      status: (typeof STATUSES)[number];
      adminNote?: string;
    }) => {
      if (!STATUSES.includes(input.status)) throw new Error("invalid_status");
      return input;
    },
  )
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("center_requests")
      .update({
        status: data.status,
        admin_note: data.adminNote?.trim() || null,
        reviewed_by: context.adminId,
        reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", data.requestId)
      .select("id,user_id,status,admin_note")
      .single();
    if (error) throw error;

    if (row.user_id) {
      await supabaseAdmin.from("notifications").insert({
        user_id: row.user_id,
        title: "تحديث على طلب السنتر",
        body:
          data.adminNote?.trim() ||
          ({
            new: "طلبك لسه جديد.",
            reviewing: "طلبك قيد المراجعة.",
            contacted: "تم التواصل بخصوص طلب السنتر.",
            approved: "تم قبول طلب السنتر.",
            rejected: "تم رفض طلب السنتر.",
          }[data.status] ?? "تم تحديث حالة طلبك."),
        kind: "center_request",
        metadata: { center_request_id: row.id, status: data.status },
      });
    }

    return row;
  });
