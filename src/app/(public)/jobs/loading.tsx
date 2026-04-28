import {
  CardGridSkeleton,
  PageHeaderSkeleton,
} from "@/components/brand/page-skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
      <PageHeaderSkeleton />
      <CardGridSkeleton />
    </div>
  );
}
