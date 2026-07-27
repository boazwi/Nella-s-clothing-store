import { Spinner } from "@/components/ui/Spinner";

export function ProgressState() {
  return (
    <div
      className="flex flex-col items-center justify-center gap-4 rounded-card bg-surface p-12 text-center shadow-card"
      role="status"
      aria-live="polite"
    >
      <Spinner className="h-10 w-10" />
      <div>
        <p className="font-serif text-lg text-ink">Creating your try-on…</p>
        <p className="mt-1 text-sm text-muted">
          This can take up to a minute. Please keep this tab open.
        </p>
      </div>
    </div>
  );
}
