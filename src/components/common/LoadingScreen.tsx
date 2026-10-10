import { WisoMark } from "@/components/common/WisoMark";

export function LoadingScreen({
  message = "عقرب الساعه لو لحقك هيلسعك ",
}: {
  message?: string;
}) {
  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-7 overflow-hidden bg-sidebar text-sidebar-foreground"
    >
      <div className="app-grid absolute inset-0" />
      <div className="relative flex size-28 items-center justify-center">
        <span className="absolute inset-0 animate-pulse rounded-full border border-sidebar-primary/30" />
        <WisoMark className="h-16 w-24" />
      </div>
      <div className="relative w-36 overflow-hidden rounded-full bg-sidebar-accent p-0.5">
        <span className="block h-1 w-1/2 animate-[pulse_1.5s_ease-in-out_infinite] rounded-full bg-sidebar-primary" />
      </div>
      <p className="relative text-sm font-semibold text-sidebar-foreground/85">{message}</p>
    </div>
  );
}
