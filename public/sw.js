// Seif Portfolio — Chrome Web Push & PWA Service Worker

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

function sanitizeInboxDestination(rawUrl) {
  if (typeof rawUrl !== "string" || !rawUrl.trim()) {
    return "/dashboard/inbox";
  }
  try {
    const parsed = new URL(rawUrl, self.location.origin);
    if (parsed.origin !== self.location.origin) {
      return "/dashboard/inbox";
    }
    if (!parsed.pathname.startsWith("/dashboard")) {
      return "/dashboard/inbox";
    }
    return `${parsed.pathname}${parsed.search}`;
  } catch {
    return "/dashboard/inbox";
  }
}

self.addEventListener("push", (event) => {
  let payload = {
    title: "New Portfolio Contact Message",
    body: "A new contact inquiry arrived. Tap to open Dashboard Inbox.",
    tag: "portfolio-contact-alert",
    data: {
      url: "/dashboard/inbox",
      messageId: null,
    },
  };

  if (event.data) {
    try {
      const parsed = event.data.json();
      if (parsed && typeof parsed === "object") {
        payload = {
          title:
            typeof parsed.title === "string" && parsed.title.trim()
              ? parsed.title.trim().slice(0, 100)
              : payload.title,
          body:
            typeof parsed.body === "string" && parsed.body.trim()
              ? parsed.body.trim().slice(0, 200)
              : payload.body,
          tag:
            typeof parsed.tag === "string" && parsed.tag.trim()
              ? parsed.tag.trim().slice(0, 80)
              : payload.tag,
          data: {
            url: sanitizeInboxDestination(parsed.data?.url),
            messageId:
              typeof parsed.data?.messageId === "string"
                ? parsed.data.messageId
                : null,
          },
        };
      }
    } catch {
      // Fallback to generic privacy-safe notification payload
    }
  }

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      tag: payload.tag,
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      renotify: true,
      data: payload.data,
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetPath = sanitizeInboxDestination(event.notification.data?.url);
  const targetUrl = new URL(targetPath, self.location.origin).href;

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((windowClients) => {
        for (const client of windowClients) {
          try {
            const clientUrl = new URL(client.url);
            if (
              clientUrl.origin === self.location.origin &&
              "focus" in client
            ) {
              if ("navigate" in client) {
                return client
                  .navigate(targetUrl)
                  .then((c) => (c ? c.focus() : null));
              }
              return client.focus();
            }
          } catch {
            // Continue searching clients
          }
        }
        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl);
        }
        return null;
      }),
  );
});
