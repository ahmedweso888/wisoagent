import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { requireSupabaseAdmin } from "@/lib/admin.middleware";
import {
  type ToolKey,
  type ToolProductKey,
  createToolOrder,
  adminListToolOrders,
  adminReviewToolOrder,
  createToolPaymentProofSignedUrl,
  getToolAccess,
  getToolAccount,
  getToolCatalog,
  getToolProduct,
  hasToolAccess,
  saveToolAccount,
} from "@/services/wiso-tools/server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

function toolForPath(value: string): ToolKey {
  if (
    value === "financial_literacy" ||
    value === "qureo"
  ) {
    return value;
  }

  throw new Error("INVALID_TOOL");
}

/* ============================================================================
 * Catalog
 * ========================================================================== */

export const getToolCatalogFn = createServerFn({
  method: "GET",
})
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    return getToolCatalog();
  });

/* ============================================================================
 * Current user's tool access
 * ========================================================================== */

export const getMyToolAccess = createServerFn({
  method: "GET",
})
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    return getToolAccess(context.userId);
  });

/* ============================================================================
 * Current user's tool orders
 * ========================================================================== */

export const getMyToolOrders = createServerFn({
  method: "GET",
})
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await supabaseAdmin
      .from("tool_orders")
      .select(
        "id,product_key,amount_egp,method,status,reject_reason,created_at,reviewed_at",
      )
      .eq("user_id", context.userId)
      .order("created_at", {
        ascending: false,
      })
      .limit(20);

    if (error) {
      throw error;
    }

    return data ?? [];
  });

/* ============================================================================
 * Submit tool payment
 * ========================================================================== */

export const submitToolPayment = createServerFn({
  method: "POST",
})
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: {
      productKey: ToolProductKey;
      method: "vodafone_cash" | "instapay";
      senderNumber: string;
      screenshotPath: string;
    }) => {
      getToolProduct(input.productKey);

      return input;
    },
  )
  .handler(async ({ data, context }) => {
    return createToolOrder({
      userId: context.userId,
      productKey: data.productKey,
      method: data.method,
      senderNumber: data.senderNumber,
      screenshotPath: data.screenshotPath,
    });
  });

/* ============================================================================
 * Redeem tool code
 * ========================================================================== */

export const redeemToolCode = createServerFn({
  method: "POST",
})
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { code: string }) => {
    const code = input.code.trim();

    if (!code) {
      throw new Error("CODE_REQUIRED");
    }

    return {
      code,
    };
  })
  .handler(async ({ context, data }) => {
    const {
      data: rpcData,
      error,
    } = await context.supabase.rpc(
      "redeem_tool_code",
      {
        _code: data.code,
      },
    );

    if (error) {
      throw error;
    }

    return {
      success: true,
      data: rpcData,
    };
  });

/* ============================================================================
 * Tool account status
 * ========================================================================== */

export const getToolAccountStatus = createServerFn({
  method: "GET",
})
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { toolKey: string }) => ({
    toolKey: toolForPath(input.toolKey),
  }))
  .handler(async ({ data, context }) => {
    const account = await getToolAccount(
      context.userId,
      data.toolKey,
    );

    return {
      linked:
        account?.verification_status === "verified",
      verifiedAt:
        account?.verified_at ?? null,
    };
  });

/* ============================================================================
 * SPRIX subjects
 * ========================================================================== */

export const linkToolAccount = createServerFn({
  method: "POST",
})
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: {
      toolKey: string;
      id: string;
      password: string;
    }) => {
      const toolKey = toolForPath(
        input.toolKey,
      );

      const id = input.id.trim();

      if (!id || !input.password) {
        throw new Error(
          "TOOL_CREDENTIALS_REQUIRED",
        );
      }

      if (
        id.length > 200 ||
        input.password.length > 500
      ) {
        throw new Error(
          "TOOL_CREDENTIALS_INVALID",
        );
      }

      return {
        toolKey,
        id,
        password: input.password,
      };
    },
  )
  .handler(async ({ data, context }) => {
    if (
      !(await hasToolAccess(
        context.userId,
        data.toolKey,
      ))
    ) {
      throw new Error(
        "TOOL_ACCESS_REQUIRED",
      );
    }

    const result =
      await saveToolAccount(
        context.userId,
        data.toolKey,
        data.id,
        data.password,
      );

    return {
      linked: true,
      ...result,
    };
  });

export const adminListToolAccounts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAdmin])
  .handler(async () => {
    const { data, error } = await (await import("@/integrations/supabase/client.server")).supabaseAdmin
      .from("tool_accounts")
      .select("id,user_id,tool_key,account_id_hash,verification_status,created_at,updated_at,completed_at")
      .is("completed_at", null)
      .order("updated_at", { ascending: false })
      .limit(300);
    if (error) throw error;
    return data ?? [];
  });

export const adminCompleteToolAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAdmin])
  .inputValidator((input: { accountId: string }) => {
    if (!input.accountId || input.accountId.length > 100) throw new Error("INVALID_ACCOUNT_ID");
    return input;
  })
  .handler(async ({ data, context }) => {
    const { data: result, error } = await (await import("@/integrations/supabase/client.server")).supabaseAdmin.rpc(
      "admin_complete_tool_account",
      { _account_id: data.accountId, _admin_id: context.adminId },
    );
    if (error) throw error;
    return result;
  });

export const adminRevealToolCredentials = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAdmin])
  .inputValidator((input: { accountId: string }) => {
    if (!input.accountId || input.accountId.length > 100) throw new Error("INVALID_ACCOUNT_ID");
    return input;
  })
  .handler(async ({ data }) => {
    const { data: row, error } = await (await import("@/integrations/supabase/client.server")).supabaseAdmin
      .from("tool_accounts").select("credential_ciphertext").eq("id", data.accountId).maybeSingle();
    if (error) throw error;
    if (!row || typeof row.credential_ciphertext !== "string") throw new Error("TOOL_ACCOUNT_NOT_FOUND");
    const { decryptToolCredentials } = await import("@/services/wiso-tools/server");
    return decryptToolCredentials(row.credential_ciphertext);
  });

export const adminGetToolOrders =
  createServerFn({
    method: "GET",
  })
    .middleware([requireSupabaseAdmin])
    .inputValidator(
      (input: {
        status?:
          | "pending"
          | "confirmed"
          | "rejected"
          | "all";
      }) => input,
    )
    .handler(async ({ data }) => {
      return adminListToolOrders(
        data.status,
      );
    });

/* ============================================================================
 * Admin - review tool order
 * ========================================================================== */

export const adminReviewToolOrderRequest =
  createServerFn({
    method: "POST",
  })
    .middleware([requireSupabaseAdmin])
    .inputValidator(
      (input: {
        orderId: string;
        approve: boolean;
        reason?: string;
      }) => input,
    )
    .handler(async ({ data, context }) => {
      return adminReviewToolOrder({
        orderId: data.orderId,
        approve: data.approve,
        ...(data.reason !== undefined
          ? {
              reason: data.reason,
            }
          : {}),
        adminId:
          context.adminId,
      });
    });

/* ============================================================================
 * Admin - payment proof
 * ========================================================================== */

export const adminGetToolPaymentProofUrl =
  createServerFn({
    method: "GET",
  })
    .middleware([requireSupabaseAdmin])
    .inputValidator(
      (input: { path: string }) =>
        input,
    )
    .handler(async ({ data }) => {
      const url =
        await createToolPaymentProofSignedUrl(
          data.path,
        );

      return {
        url,
      };
    });
