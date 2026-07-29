import { Suspense } from "react";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { TryOnFlow } from "@/components/try-on/TryOnFlow";

export default function TryOnPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <header className="mb-8">
        <h1 className="font-serif text-3xl text-ink">Virtual Try-On</h1>
        <p className="mt-1 text-muted">See any piece on your own photo.</p>
      </header>
      <RequireAuth requirePaid>
        <Suspense>
          <TryOnFlow />
        </Suspense>
      </RequireAuth>
    </div>
  );
}
