import type { ReactNode } from "react";
import { requireAdmin } from "@/lib/auth";
import { HRHeader } from "@/components/hr/hr-header";

export default async function HRAuthedLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await requireAdmin();
  const fullName = user.fullName ?? user.email;

  return (
    <>
      <HRHeader email={user.email} fullName={fullName} />
      <main className="bg-secondary/30 flex-1">{children}</main>
    </>
  );
}
