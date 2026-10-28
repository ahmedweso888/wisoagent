import { WisoMark } from "@/components/common/WisoMark";

export function LoadingScreen({
message = "جارٍ تحضير رحلتك نحو التفوق...",
}: {
message?: string;
}) {
return ( <div
   dir="rtl"
   className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-sidebar text-sidebar-foreground"
 > <div className="app-grid absolute inset-0 opacity-60" />


  <div className="relative z-10 flex flex-col items-center">
    <div className="relative flex size-32 items-center justify-center">
      <span className="absolute inset-0 rounded-full border border-sidebar-primary/20" />

      <span className="absolute inset-2 animate-[spin_1.8s_linear_infinite] rounded-full border-2 border-transparent border-t-sidebar-primary border-e-sidebar-primary/40" />

      <span className="absolute inset-5 animate-[spin_1.2s_linear_infinite_reverse] rounded-full border border-sidebar-primary/30 border-b-sidebar-primary" />

      <div className="relative flex size-20 items-center justify-center rounded-2xl bg-sidebar-accent/70 shadow-lg shadow-black/10">
        <WisoMark className="h-12 w-16" />
      </div>
    </div>

    <div className="mt-8 flex flex-col items-center gap-3">
      <p className="text-sm font-semibold text-sidebar-foreground/90">
        {message}
      </p>

      <div className="h-1.5 w-48 overflow-hidden rounded-full bg-sidebar-accent">
        <span className="block h-full w-1/3 animate-[loading_1.4s_ease-in-out_infinite] rounded-full bg-sidebar-primary" />
      </div>

      <div className="mt-1 flex items-center gap-1.5">
        <span className="size-1.5 animate-pulse rounded-full bg-sidebar-primary" />
        <span className="size-1.5 animate-pulse rounded-full bg-sidebar-primary [animation-delay:200ms]" />
        <span className="size-1.5 animate-pulse rounded-full bg-sidebar-primary [animation-delay:400ms]" />
      </div>
    </div>
  </div>

  <style>{`
    @keyframes loading {
      0% {
        transform: translateX(300%);
      }
      50% {
        transform: translateX(0%);
      }
      100% {
        transform: translateX(-300%);
      }
    }
  `}</style>
</div>


);
}
