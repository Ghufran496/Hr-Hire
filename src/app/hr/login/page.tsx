import { Suspense } from "react";
import { Logo } from "@/components/brand/logo";
import { LoginForm } from "./login-form";

export const metadata = {
  title: "Sign in",
};

export default function HRLoginPage() {
  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      {/* Left: brand panel */}
      <aside className="border-border bg-secondary/40 relative hidden border-r p-12 lg:flex lg:flex-col lg:justify-between">
        <Logo size="lg" />
        <div className="space-y-6">
          <h2 className="font-heading text-foreground text-3xl leading-tight font-bold tracking-tight">
            Find your next role.
          </h2>
          <p className="text-muted-foreground max-w-md">
            Track every application you&apos;ve submitted, see where you stand,
            and stay on top of updates - all in one place.
          </p>
        </div>
        <p className="text-muted-foreground text-xs">
          © {new Date().getFullYear()} SMARTHIRE. All rights reserved.
        </p>
      </aside>

      {/* Right: form */}
      <section className="flex flex-col items-center justify-center px-6 py-16 sm:px-12">
        <div className="mb-10 lg:hidden">
          <Logo size="lg" />
        </div>
        <div className="w-full max-w-sm">
          <header className="mb-8">
            <span className="text-brand text-xs font-semibold tracking-wider uppercase">
              SmartHire
            </span>
            <h1 className="font-heading text-foreground mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
              Welcome
            </h1>
            <p className="text-muted-foreground mt-2 text-sm">
              Sign in or create an account to apply to roles and track your
              applications.
            </p>
          </header>

          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>
        </div>
      </section>
    </div>
  );
}
