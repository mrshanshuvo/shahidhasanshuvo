import { SectionSkeleton } from "@/app/components/UI/Skeletons";

export default function PublicLoading() {
  return (
    <div className="min-h-screen pt-20">
      <SectionSkeleton cols={3} />
    </div>
  );
}
