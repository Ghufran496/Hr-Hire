import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <Skeleton className="h-4 w-32" />
      <div className="border-border mt-6 flex items-center justify-between border-b pb-6">
        <div className="space-y-3">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-4 w-80" />
        </div>
        <Skeleton className="h-7 w-24 rounded-full" />
      </div>
      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="border-border bg-background space-y-3 rounded-xl border p-6">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          <div className="border-border bg-background space-y-3 rounded-xl border p-6">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
          </div>
          <div className="border-border bg-background rounded-xl border p-6">
            <Skeleton className="h-[60vh] min-h-[24rem] w-full" />
          </div>
        </div>
        <aside className="space-y-6">
          <div className="border-border bg-background space-y-3 rounded-xl border p-6">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
          </div>
          <div className="border-border bg-background space-y-3 rounded-xl border p-6">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-16 w-full" />
          </div>
        </aside>
      </div>
    </div>
  );
}
