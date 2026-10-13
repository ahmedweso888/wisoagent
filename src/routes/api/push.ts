import { createFileRoute } from "@tanstack/react-router";
import webpush from "web-push";

export const Route = createFileRoute("/api/push")({
server: {
handlers: {
POST: async ({ request }) => {
const secret = process.env.PUSH_WEBHOOK_SECRET;


    if (!secret || request.headers.get("x-push-webhook-secret") !== secret) {
      return new Response("Unauthorized", { status: 401 });
    }

    const publicKey = process.env.VAPID_PUBLIC_KEY;
    const privateKey = process.env.VAPID_PRIVATE_KEY;
    const subject = process.env.VAPID_SUBJECT;

    if (!publicKey || !privateKey || !subject) {
      console.error("[Push] Missing VAPID environment variables.");

      return new Response("Push service is not configured", {
        status: 500,
      });
    }

    let payload: {
      record?: {
        id?: string;
        title?: string;
        body?: string | null;
        kind?: string;
      };
    };

    try {
      payload = await request.json();
    } catch {
      return new Response("Invalid JSON", { status: 400 });
    }

    const notification = payload.record;

    if (!notification?.id || !notification.title) {
      return new Response("Invalid notification payload", {
        status: 400,
      });
    }

    const { supabaseAdmin } =
      await import("@/integrations/supabase/client.server");

    const { data: subscriptions, error } = await supabaseAdmin
      .from("admin_push_subscriptions")
      .select("id, endpoint, p256dh, auth");

    if (error) {
      console.error("[Push] Failed to load subscriptions:", error);

      return new Response("Failed to load subscriptions", {
        status: 500,
      });
    }

    webpush.setVapidDetails(subject, publicKey, privateKey);

    const message = JSON.stringify({
      title: notification.title,
      body: notification.body ?? "وصل إشعار جديد إلى لوحة الإدارة.",
      tag: notification.id,
      url: "/admin/notifications",
    });

    let sent = 0;
    let failed = 0;

    await Promise.all(
      (subscriptions ?? []).map(async (subscription) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: subscription.endpoint,
              keys: {
                p256dh: subscription.p256dh,
                auth: subscription.auth,
              },
            },
            message,
          );

          sent++;
        } catch (error: unknown) {
          const statusCode =
            typeof error === "object" &&
            error !== null &&
            "statusCode" in error
              ? (error as { statusCode?: number }).statusCode
              : undefined;

          if (statusCode === 404 || statusCode === 410) {
            await supabaseAdmin
              .from("admin_push_subscriptions")
              .delete()
              .eq("id", subscription.id);
          } else {
            console.error("[Push] Delivery failed:", statusCode);
          }

          failed++;
        }
      }),
    );

    return Response.json({
      success: true,
      sent,
      failed,
    });
  },
},


},
});
