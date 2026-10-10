import markAsset from "@/assets/wiso-mark.png";
import { cn } from "@/lib/utils";

export function WisoMark({ className }: { className?: string }) {
  return <img src={markAsset} alt="WISO" className={cn("object-contain", className)} />;
}
