"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingBag, User as UserIcon, LogOut, Shield } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";

export function Navbar() {
  const { session, isAdmin, logout } = useAuth();
  const router = useRouter();

  async function handleLogout() {
    await logout();
    router.push("/");
  }

  return (
    <header className="sticky top-0 z-40 border-b border-muted/15 bg-background/90 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="flex items-center gap-2">
          <ShoppingBag className="h-6 w-6 text-brand" aria-hidden="true" />
          <span className="font-serif text-xl text-brand">Nella&apos;s Clothing Store</span>
        </Link>

        <div className="flex items-center gap-2">
          <Link href="/" className="hidden px-3 py-2 text-sm text-ink hover:text-brand sm:block">
            Catalog
          </Link>

          {isAdmin && (
            <Link
              href="/admin"
              className="flex items-center gap-1 px-3 py-2 text-sm text-ink hover:text-brand"
            >
              <Shield className="h-4 w-4" aria-hidden="true" />
              Admin
            </Link>
          )}

          {session ? (
            <div className="flex items-center gap-2">
              <span className="hidden items-center gap-1 text-sm text-muted sm:flex">
                <UserIcon className="h-4 w-4" aria-hidden="true" />
                {session.user.fullName || session.user.email}
              </span>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4" aria-hidden="true" />
                Log out
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Log in
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Sign up</Button>
              </Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
