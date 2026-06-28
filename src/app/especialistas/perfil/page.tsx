import { Suspense } from "react";
import { PlatformNav } from "@/components/PlatformNav";
import { ProfileLoadingSkeleton, SpecialistProfileFromQuery } from "@/components/SpecialistPublicProfile";

export default function SpecialistProfileQueryPage() {
  return (
    <main className="section grid gap-8">
      <PlatformNav />
      <Suspense fallback={<ProfileLoadingSkeleton />}>
        <SpecialistProfileFromQuery />
      </Suspense>
    </main>
  );
}
