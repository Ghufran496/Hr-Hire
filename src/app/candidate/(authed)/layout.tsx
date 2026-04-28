import type { ReactNode } from "react";
import { requireCandidate } from "@/lib/auth";
import { CandidateHeader } from "@/components/candidate/candidate-header";

export default async function CandidateAuthedLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await requireCandidate();
  const fullName = user.fullName ?? user.email;

  return (
    <>
      <CandidateHeader email={user.email} fullName={fullName} />
      <main className="bg-secondary/30 flex-1">{children}</main>
    </>
  );
}
