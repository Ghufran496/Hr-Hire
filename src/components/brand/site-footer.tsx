import Link from "next/link";
import { Logo } from "./logo";
import { getCurrentUser } from "@/lib/auth";

export async function SiteFooter() {
  const user = await getCurrentUser();
  const accountLink =
    user?.role === "admin"
      ? { href: "/hr/dashboard", label: "Dashboard" }
      : user?.role === "candidate"
        ? { href: "/candidate/dashboard", label: "My applications" }
        : { href: "/hr/login", label: "Sign in" };

  return (
    <footer className="border-border bg-secondary/40 border-t">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-4 py-10 sm:flex-row sm:items-center sm:px-6">
        <div className="flex flex-col gap-2">
          <Logo />
          <p className="text-muted-foreground text-sm">
            Modern hiring, made simple.
          </p>
        </div>
        <div className="text-muted-foreground flex items-center gap-6 text-sm">
          <Link
            href="/jobs"
            className="hover:text-foreground transition-colors"
          >
            Jobs
          </Link>
          <Link
            href={accountLink.href}
            className="hover:text-foreground transition-colors"
          >
            {accountLink.label}
          </Link>
          <span>© {new Date().getFullYear()} SMARTHIRE</span>
        </div>
      </div>
    </footer>
  );
}
