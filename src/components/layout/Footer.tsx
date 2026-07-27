export function Footer() {
  return (
    <footer className="mt-16 border-t border-muted/15 bg-background">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-4 py-8 text-center text-sm text-muted">
        <p className="font-serif text-base text-brand">Nella&apos;s Clothing Store</p>
        <p>Try before you buy — see yourself in every piece.</p>
        <p className="text-xs">
          © {new Date().getFullYear()} Nella&apos;s Clothing Store. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
