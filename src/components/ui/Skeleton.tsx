import type { HTMLAttributes } from "react";
import { cn } from "@/lib/image";

export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-lg bg-muted/20", className)}
      {...props}
    />
  );
}
