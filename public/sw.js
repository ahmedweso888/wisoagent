self.addEventListener("push", (event) => {
  let data = {};

  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = {
      title: "WISO Agent",
      body: event.data ? event.data.text() : "وصل إشعار جديد.",
    };
  }

  const title = data.title || "WISO Agent";

  const options = {
    body: data.body || "وصل إشعار جديد إلى لوحة الإدارة.",
    icon: "/favicon.ico",
    badge: "/favicon.ico",
    tag: data.tag || "wiso-admin-notification",
    data: {
      url: data.url || "/admin/notifications",
    },
  };

  event.waitUntil(
    self.registration.showNotification(title, options),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = new URL(
    event.notification.data?.url || "/admin/notifications",
    self.location.origin,
  ).href;

  event.waitUntil(
    clients.matchAll({
      type: "window",
      includeUncontrolled: true,
    }).then(async (windowClients) => {
      for (const client of windowClients) {
        if (client.url.startsWith(self.location.origin)) {
          await client.focus();

          if ("navigate" in client && client.url !== targetUrl) {
            await client.navigate(targetUrl);
          }

          return;
        }
      }

      return clients.openWindow(targetUrl);
    }),
  );
});
