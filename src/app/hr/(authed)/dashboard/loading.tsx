import {
  PageHeaderSkeleton,
  TableSkeleton,
} from "@/components/brand/page-skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <PageHeaderSkeleton />
      <TableSkeleton />
    </div>
  );
}
