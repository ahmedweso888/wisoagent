import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAdmin } from "@/lib/admin.middleware";

type PushSubscriptionInput = {
endpoint: string;
keys: {
p256dh: string;
auth: string;
};
};

export const getAdminPushPublicKey = createServerFn({
method: "GET",
})
.middleware([requireSupabaseAdmin])
.handler(async () => {
const publicKey = process.env["VAPID_PUBLIC_KEY"];


if (!publicKey) {
  throw new Error("VAPID_PUBLIC_KEY is not configured");
}

return { publicKey };


});

export const saveAdminPushSubscription = createServerFn({
method: "POST",
})
.middleware([requireSupabaseAdmin])
.inputValidator((input: PushSubscriptionInput) => {
if (
!input ||
typeof input.endpoint !== "string" ||
!input.endpoint.startsWith("https://") ||
typeof input.keys?.p256dh !== "string" ||
typeof input.keys?.auth !== "string" ||
!input.keys.p256dh ||
!input.keys.auth
) {
throw new Error("Invalid push subscription");
}

return input;

})
.handler(async ({ data, context }) => {
const { supabaseAdmin } =
await import("@/integrations/supabase/client.server");

// الجدول جديد ولم تُحدّث أنواع Supabase المولّدة بعد.
const db = supabaseAdmin as any;

const { error } = await db
  .from("admin_push_subscriptions")
  .upsert(
    {
      admin_id: context.adminId,
      endpoint: data.endpoint,
      p256dh: data.keys.p256dh,
      auth: data.keys.auth,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "endpoint" },
  );

if (error) {
  console.error("[AdminPush] Failed to save subscription:", error);
  throw new Error("Failed to save push subscription");
}

return { success: true };

});

export const removeAdminPushSubscription = createServerFn({
method: "POST",
})
.middleware([requireSupabaseAdmin])
.inputValidator((input: { endpoint: string }) => {
if (
!input ||
typeof input.endpoint !== "string" ||
!input.endpoint.startsWith("https://")
) {
throw new Error("Invalid push endpoint");
}


return input;


})
.handler(async ({ data, context }) => {
const { supabaseAdmin } =
await import("@/integrations/supabase/client.server");


const db = supabaseAdmin as any;

const { error } = await db
  .from("admin_push_subscriptions")
  .delete()
  .eq("endpoint", data.endpoint)
  .eq("admin_id", context.adminId);

if (error) {
  console.error("[AdminPush] Failed to remove subscription:", error);
  throw new Error("Failed to remove push subscription");
}

return { success: true };


});
