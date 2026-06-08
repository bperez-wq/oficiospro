import Image from "next/image";

type BrandLogoVariant = "primary" | "white" | "mono" | "tile";
type BrandLogoSize = "sm" | "md" | "lg";

type BrandLogoProps = {
  variant?: BrandLogoVariant;
  size?: BrandLogoSize;
  showWordmark?: boolean;
  className?: string;
};

const logoByVariant: Record<BrandLogoVariant, string> = {
  primary: "/brand/logo-worker-primary.svg",
  white: "/brand/logo-worker-white.svg",
  mono: "/brand/logo-worker-mono.svg",
  tile: "/brand/logo-worker-tile.svg",
};

const sizeClasses: Record<BrandLogoSize, { root: string; mark: string; wordmark: string }> = {
  sm: {
    root: "gap-2",
    mark: "h-9 w-9",
    wordmark: "text-lg",
  },
  md: {
    root: "gap-3",
    mark: "h-11 w-11",
    wordmark: "text-xl",
  },
  lg: {
    root: "gap-4",
    mark: "h-14 w-14",
    wordmark: "text-3xl",
  },
};

export function BrandLogo({ variant = "primary", size = "md", showWordmark = true, className = "" }: BrandLogoProps) {
  const classes = sizeClasses[size];
  const isDarkVariant = variant === "white";
  const isTile = variant === "tile";

  return (
    <span className={`inline-flex items-center ${classes.root} ${className}`} aria-label="OficiosPro">
      <span className={`relative shrink-0 overflow-hidden ${classes.mark} ${isTile ? "rounded-2xl shadow-sm" : ""}`} aria-hidden="true">
        <Image src={logoByVariant[variant]} alt="" fill sizes="56px" className="object-contain" priority={size === "lg"} />
      </span>
      {showWordmark ? (
        <span className={`leading-none tracking-normal ${classes.wordmark}`} aria-hidden="true">
          <span className={`font-extrabold ${isDarkVariant ? "text-white" : "text-ink"}`}>Oficios</span>
          <span className={`font-black ${isDarkVariant ? "text-sun" : "text-brand"}`}>Pro</span>
        </span>
      ) : null}
    </span>
  );
}
