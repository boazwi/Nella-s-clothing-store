import { AlertCircle, CheckCircle2, Info } from "lucide-react";
import { cn } from "@/lib/image";

type Tone = "error" | "success" | "info";

const toneStyles: Record<Tone, { wrap: string; Icon: typeof Info }> = {
  error: { wrap: "bg-danger/10 text-danger", Icon: AlertCircle },
  success: { wrap: "bg-success/10 text-success", Icon: CheckCircle2 },
  info: { wrap: "bg-brand/5 text-brand", Icon: Info },
};

export function Alert({
  tone = "info",
  children,
  className,
}: {
  tone?: Tone;
  children: React.ReactNode;
  className?: string;
}) {
  const { wrap, Icon } = toneStyles[tone];
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn("flex items-start gap-2 rounded-lg px-4 py-3 text-sm", wrap, className)}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <span>{children}</span>
    </div>
  );
}
