import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  subtitle,
  actions,
  className,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4 border-b border-border pb-5",
        className,
      )}
    >
      <div className="min-w-0 space-y-1.5">
        <h1 className="truncate font-display text-2xl font-extrabold sm:text-3xl">{title}</h1>
        {subtitle ? <p className="max-w-2xl text-sm text-muted-foreground">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  );
}
