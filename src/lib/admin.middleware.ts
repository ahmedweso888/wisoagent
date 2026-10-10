import { createMiddleware } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const requireSupabaseAdmin = createMiddleware({ type: "function" })
  .middleware([requireSupabaseAuth])
  .server(async ({ next, context }) => {
    const { supabaseAdmin } =
      await import("@/integrations/supabase/client.server");

    const { data, error } = await supabaseAdmin.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });

    if (error) {
      console.error("[AdminAuth] Failed to verify admin role:", error);
      throw new Error("Forbidden: Unable to verify administrator privileges");
    }

    if (data !== true) {
      throw new Error("Forbidden: Administrator access required");
    }

    return next({
      context: {
        ...context,
        isAdmin: true,
        adminId: context.userId,
      },
    });
  });