import type { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-muted/30 px-6 py-14 text-center",
        className,
      )}
    >
      <span className="flex size-12 items-center justify-center rounded-lg bg-secondary text-primary">
        <Icon className="size-6" />
      </span>
      <h3 className="font-display text-lg font-semibold">{title}</h3>
      {description ? (
        <p className="max-w-md text-sm leading-relaxed text-muted-foreground">{description}</p>
      ) : null}
      {actionLabel && onAction ? (
        <Button onClick={onAction} className="mt-2">
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
