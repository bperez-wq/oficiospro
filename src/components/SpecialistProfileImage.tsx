"use client";

import { useEffect, useMemo, useState } from "react";
import { getSpecialistProfileImage, specialistInitials } from "@/data/profileImages";

type SpecialistProfileImageProps = {
  src?: string | null;
  alt?: string;
  name: string;
  specialty?: string | null;
  serviceTypeId?: string | null;
  category?: string | null;
  className?: string;
  imageClassName?: string;
  fit?: "cover" | "contain";
  loading?: "eager" | "lazy";
  allowCategoryFallback?: boolean;
};

export function SpecialistProfileImage({
  src,
  alt,
  name,
  specialty,
  serviceTypeId,
  category,
  className = "h-16 w-16 rounded-2xl",
  imageClassName = "",
  fit = "cover",
  loading = "lazy",
  allowCategoryFallback = true,
}: SpecialistProfileImageProps) {
  const resolvedSrc = useMemo(
    () => getSpecialistProfileImage({ name, src, serviceTypeId, specialty, category, allowCategoryFallback }),
    [allowCategoryFallback, category, name, serviceTypeId, specialty, src],
  );
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  useEffect(() => {
    setFailedSrc(null);
  }, [resolvedSrc]);

  const showImage = Boolean(resolvedSrc && failedSrc !== resolvedSrc);
  const fitClass = fit === "contain" ? "object-contain p-1" : "object-cover object-[center_28%]";

  return (
    <div className={`relative isolate overflow-hidden bg-gradient-to-br from-brand-soft via-white to-slate-100 ${className}`}>
      {showImage ? (
        <img
          src={resolvedSrc}
          alt={alt ?? `${name}, ${specialty ?? "especialista OficiosPro"}`}
          loading={loading}
          className={`h-full w-full ${fitClass} ${imageClassName}`}
          onError={() => setFailedSrc(resolvedSrc ?? null)}
        />
      ) : (
        <span className="grid h-full w-full place-items-center bg-gradient-to-br from-brand to-brand-dark text-lg font-black text-white">
          {specialistInitials(name)}
        </span>
      )}
    </div>
  );
}
