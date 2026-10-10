import { WisoMark } from "@/components/common/WisoMark";
import { cn } from "@/lib/utils";

/**
 * Official WISO Agent brand mark.
 *
 * The WISO Agent text slides out from behind the W mark
 * without blur, preserving sharp text rendering.
 */
export function BrandLogo({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "group/brand relative inline-flex items-center focus:outline-none",
        className,
      )}
      tabIndex={0}
    >
      {/* W Mark */}
      <span className="relative z-10 flex items-center rounded-full">
        <WisoMark className="h-7 w-11" />
      </span>

      {/* Brand name */}
      <span
        className="
          grid
          grid-cols-[0fr]
          transition-[grid-template-columns]
          duration-500
          ease-[cubic-bezier(.22,1,.36,1)]
          group-hover/brand:grid-cols-[1fr]
          group-focus-visible/brand:grid-cols-[1fr]
          group-focus-within/brand:grid-cols-[1fr]
        "
        aria-hidden="true"
      >
        <span className="overflow-hidden">
          <span
            className="
              block
              translate-x-3
              whitespace-nowrap
              pe-1
              ps-2
              text-sm
              font-bold
              text-current
              opacity-60
              antialiased
              transition-[transform,opacity]
              duration-500
              ease-[cubic-bezier(.22,1,.36,1)]
              group-hover/brand:translate-x-0
              group-hover/brand:opacity-100
              group-focus-visible/brand:translate-x-0
              group-focus-visible/brand:opacity-100
              group-focus-within/brand:translate-x-0
              group-focus-within/brand:opacity-100
            "
          >
            WISO Agent
          </span>
        </span>
      </span>

      <span className="sr-only">WISO Agent</span>
    </span>
  );
}