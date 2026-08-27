import { SkeletonGrid, SkeletonHeader } from "@/components/ui/Skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-8">
      <SkeletonHeader />
      <SkeletonGrid />
    </div>
  );
}
