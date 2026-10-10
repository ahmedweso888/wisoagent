import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "wiso-theme";

function applyTheme(dark: boolean) {
  document.documentElement.classList.toggle("dark", dark);
  document.documentElement.style.colorScheme = dark ? "dark" : "light";
}

/** Reads the stored theme after hydration so SSR markup never mismatches. */
export function useTheme() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const next =
      stored === "dark" ||
      (stored === null && window.matchMedia("(prefers-color-scheme: dark)").matches);
    setDark(next);
    applyTheme(next);
  }, []);
  const toggle = () => {
    setDark((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, next ? "dark" : "light");
      applyTheme(next);
      return next;
    });
  };
  return { dark, toggle };
}

export function ThemeToggle({ className }: { className?: string }) {
  const { dark, toggle } = useTheme();
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={toggle}
      className={className}
      aria-label={dark ? "الوضع الفاتح" : "الوضع الداكن"}
    >
      {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </Button>
  );
}
