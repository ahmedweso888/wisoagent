import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";

import { BrandLogo } from "@/components/common/BrandLogo";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type HeaderLink = { href: string; label: string };

/**
 * Floating near-black pill header from the WISO reference.
 * Layout, colours and motion are fixed in code; only the links are data-driven.
 */
export function SiteHeader({ links, ctaLabel }: { links: HeaderLink[]; ctaLabel: string }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div dir="rtl" className="pointer-events-none fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:pt-5">
      <header
        className={cn(
          "pointer-events-auto mx-auto flex h-14 w-full max-w-5xl items-center gap-2 rounded-full border border-white/10 bg-[oklch(0.15_0.03_132)]/90 px-3 text-[oklch(0.96_0.014_100)] backdrop-blur-xl transition-shadow duration-300 sm:h-16 sm:px-5",
          scrolled ? "shadow-[0_18px_50px_-24px_oklch(0_0_0/0.9)]" : "shadow-none",
        )}
      >
        <Link to="/" className="shrink-0 rounded-full outline-none">
          <BrandLogo />
        </Link>

        <nav className="mx-auto hidden items-center gap-1 lg:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-full px-3.5 py-2 text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="ms-auto flex items-center gap-1.5 lg:ms-0">
          <ThemeToggle className="text-white/80 hover:bg-white/10 hover:text-white" />
          <Button asChild size="sm" className="hidden rounded-full sm:inline-flex">
            <Link to="/auth">{ctaLabel}</Link>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-white/80 hover:bg-white/10 hover:text-white lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="القائمة"
            aria-expanded={open}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
      </header>

      {open ? (
        <nav className="pointer-events-auto mx-auto mt-2 w-full max-w-5xl rounded-3xl border border-white/10 bg-[oklch(0.15_0.03_132)]/95 p-3 text-[oklch(0.96_0.014_100)] backdrop-blur-xl lg:hidden">
          <div className="grid gap-1">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-2xl px-4 py-3 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white"
              >
                {link.label}
              </a>
            ))}
            <Button asChild className="mt-2 rounded-full">
              <Link to="/auth">{ctaLabel}</Link>
            </Button>
          </div>
        </nav>
      ) : null}
    </div>
  );
}
