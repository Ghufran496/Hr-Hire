import type { ReactNode } from "react";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Toaster } from "@/components/ui/sonner";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <NuqsAdapter>
      {children}
      <Toaster richColors closeButton position="top-right" />
    </NuqsAdapter>
  );
}
