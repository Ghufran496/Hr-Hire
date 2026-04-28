import Link from "next/link";
import { Logo } from "./logo";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth";

export async function SiteHeader() {
  const user = await getCurrentUser();

  return (
    <header className="border-border bg-background/85 sticky top-0 z-30 border-b backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Logo />
        <nav className="flex items-center gap-1.5 sm:gap-3">
          <Button asChild variant="ghost" size="sm">
            <Link href="/jobs">Jobs</Link>
          </Button>
          {user?.role === "admin" ? (
            <Button asChild variant="outline" size="sm">
              <Link href="/hr/dashboard">Dashboard</Link>
            </Button>
          ) : user?.role === "candidate" ? (
            <Button asChild variant="outline" size="sm">
              <Link href="/candidate/dashboard">My applications</Link>
            </Button>
          ) : (
            <Button asChild variant="outline" size="sm">
              <Link href="/hr/login">Sign in</Link>
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
