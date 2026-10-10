import { WisoMark } from "@/components/common/WisoMark";
import { useFooterLinks, useSiteSettings, useSocialLinks } from "@/hooks/useSiteContent";
import {
  Facebook,
  Instagram,
  Youtube,
  Send,
  MessageCircle,
} from "lucide-react";

const PLATFORM_ICONS: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  facebook: Facebook,
  instagram: Instagram,
  youtube: Youtube,
  telegram: Send,
  whatsapp: MessageCircle,
};

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-3.77V2h-3.13v13.13a2.93 2.93 0 1 1-2.93-2.93c.31 0 .61.05.89.14V9.15a6.06 6.06 0 0 0-.89-.07A6.06 6.06 0 1 0 15.82 15V8.71a7.92 7.92 0 0 0 4.63 1.49V7.07a4.84 4.84 0 0 1-.86-.38Z" />
    </svg>
  );
}

function SocialIcon({ platform }: { platform: string }) {
  if (platform === "tiktok") {
    return <TikTokIcon className="h-4 w-4" />;
  }

  const Icon = PLATFORM_ICONS[platform];

  if (!Icon) {
    return (
      <span className="text-[10px] font-bold">
        {platform.slice(0, 1).toUpperCase()}
      </span>
    );
  }

  return <Icon className="h-4 w-4" />;
}

/**
 * Large premium footer. Structure is fixed in code; every title, link,
 * social platform and contact value comes from admin-managed tables.
 */
export function Footer() {
  const links = useFooterLinks();
  const socials = useSocialLinks();
  const settings = useSiteSettings();

  const groups = new Map<string, { label: string; href: string }[]>();

  for (const row of links.data ?? []) {
    const list = groups.get(row.group_title) ?? [];
    list.push({
      label: row.label,
      href: row.href,
    });
    groups.set(row.group_title, list);
  }

  const description = settings.data?.["footer_description"] ?? "";
  const copyright = settings.data?.["footer_copyright"] ?? "";
  const email = settings.data?.["contact_email"] ?? "";
  const whatsapp = settings.data?.["contact_whatsapp"] ?? "";
  const hours = settings.data?.["support_hours"] ?? "";

  return (
    <footer
      dir="rtl"
      className="relative overflow-hidden border-t border-white/10 bg-black text-white"
    >
      <WisoMark
className="pointer-events-none absolute -bottom-10 left-1/2 h-80 w-[20rem] -translate-x-1/2 opacity-[0.9] grayscale"      />

      <div className="relative mx-auto w-full max-w-6xl px-5 py-14 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_2fr]">
          <div>
            <WisoMark className="h-12 w-20" />

            <p
              className="mt-1 font-display text-lg font-bold text-white"
              dir="ltr"
            >
              WISO Agent
            </p>

            {description ? (
              <p className="mt-5 max-w-sm text-sm leading-7 text-white/70">
                {description}
              </p>
            ) : null}

            {socials.data?.length ? (
              <div className="mt-6 flex flex-wrap gap-2">
                {socials.data.map((social) => (
                  <a
                    key={social.id}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.platform}
                    title={social.platform}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white/75 transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/10 hover:text-white hover:shadow-lg"
                  >
                    <SocialIcon platform={social.platform} />
                  </a>
                ))}
              </div>
            ) : null}
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[...groups.entries()].map(([title, items]) => (
              <div key={title}>
                <h3 className="text-sm font-bold text-white">
                  {title}
                </h3>

                <ul className="mt-4 space-y-2.5">
                  {items.map((item) => (
                    <li key={`${title}-${item.href}-${item.label}`}>
                      <a
                        href={item.href}
                        className="text-sm text-white/65 transition-colors hover:text-white"
                      >
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {email || whatsapp || hours ? (
              <div>
                <h3 className="text-sm font-bold text-white">
                  تواصل معنا
                </h3>

                <ul className="mt-4 space-y-2.5 text-sm text-white/65">
                  {email ? (
                    <li>
                      <a
                        href={`mailto:${email}`}
                        className="transition-colors hover:text-white"
                      >
                        {email}
                      </a>
                    </li>
                  ) : null}

                  {whatsapp ? (
                    <li>
                      <a
                        href={`https://wa.me/${whatsapp.replace(
                          /[^0-9]/g,
                          "",
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="transition-colors hover:text-white"
                      >
                        {whatsapp}
                      </a>
                    </li>
                  ) : null}

                  {hours ? <li>{hours}</li> : null}
                </ul>
              </div>
            ) : null}
          </div>
        </div>

        {copyright ? (
          <p className="mt-12 border-t border-white/10 pt-6 text-xs text-white/55">
            {copyright}
          </p>
        ) : null}
      </div>
    </footer>
  );
}