"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Briefcase, LogOut, User } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

function initials(name: string): string {
  return name
    .split(" ")
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function CandidateHeader({
  email,
  fullName,
}: {
  email: string;
  fullName: string;
}) {
  const router = useRouter();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    toast.success("Signed out.");
    router.push("/");
    router.refresh();
  }

  return (
    <header className="border-border bg-background sticky top-0 z-30 border-b">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-6">
          <Logo />
          <nav className="hidden gap-1 sm:flex">
            <Button asChild variant="ghost" size="sm">
              <Link href="/candidate/dashboard">My applications</Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link href="/jobs">Browse jobs</Link>
            </Button>
          </nav>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label="Open account menu"
              className="border-border bg-background hover:bg-secondary flex items-center gap-2 rounded-full border py-1 pr-3 pl-1 text-sm transition-colors"
            >
              <Avatar className="size-7">
                <AvatarFallback className="text-xs">
                  {initials(fullName || email)}
                </AvatarFallback>
              </Avatar>
              <span className="text-foreground hidden font-medium sm:inline">
                {fullName || email}
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="text-foreground font-semibold">
                  {fullName || "Account"}
                </span>
                <span className="text-muted-foreground text-xs font-normal">
                  {email}
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="sm:hidden">
              <Link
                href="/candidate/dashboard"
                className="flex items-center gap-2"
              >
                <User className="size-4" aria-hidden="true" />
                My applications
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="sm:hidden">
              <Link href="/jobs" className="flex items-center gap-2">
                <Briefcase className="size-4" aria-hidden="true" />
                Browse jobs
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="sm:hidden" />
            <DropdownMenuItem asChild>
              <Link href="/" className="flex items-center gap-2">
                <Briefcase className="size-4" aria-hidden="true" />
                Home
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onClick={signOut}>
              <LogOut className="size-4" aria-hidden="true" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
