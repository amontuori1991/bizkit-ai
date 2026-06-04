import Image from "next/image";

type BrandIconSize = "sm" | "md" | "lg" | "xl";
type BrandTone = "light" | "dark";

type BrandIconProps = {
  size?: BrandIconSize;
  className?: string;
  priority?: boolean;
};

type BrandLockupProps = {
  size?: BrandIconSize;
  tone?: BrandTone;
  className?: string;
  titleClassName?: string;
  taglineClassName?: string;
  tagline?: string;
};

const iconSizeClasses: Record<BrandIconSize, string> = {
  sm: "h-10 w-10 rounded-[1rem]",
  md: "h-12 w-12 rounded-[1.15rem]",
  lg: "h-14 w-14 rounded-[1.35rem]",
  xl: "h-16 w-16 rounded-[1.5rem]",
};

const titleSizeClasses: Record<BrandIconSize, string> = {
  sm: "text-base",
  md: "text-lg",
  lg: "text-xl",
  xl: "text-2xl",
};

const taglineSizeClasses: Record<BrandIconSize, string> = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-sm",
  xl: "text-base",
};

function joinClasses(...classes: Array<string | undefined | null | false>) {
  return classes.filter(Boolean).join(" ");
}

export function BrandIcon({ size = "md", className, priority = false }: BrandIconProps) {
  return (
    <div
      className={joinClasses(
        "relative overflow-hidden",
        iconSizeClasses[size],
        className,
      )}
    >
      <Image
        src="/favicon/favicon-32x32.png"
        alt="BizKit AI logo"
        fill
        priority={priority}
        sizes={
          size === "xl"
            ? "64px"
            : size === "lg"
              ? "56px"
              : size === "md"
                ? "48px"
                : "40px"
        }
        className="object-contain"
      />
    </div>
  );
}

export function BrandLockup({
  size = "md",
  tone = "dark",
  className,
  titleClassName,
  taglineClassName,
  tagline = "AI Marketing Platform for Local Businesses",
}: BrandLockupProps) {
  const titleTone = tone === "light" ? "text-white" : "text-slate-950";
  const taglineTone = tone === "light" ? "text-slate-300" : "text-slate-500";

  return (
    <div className={joinClasses("flex items-center gap-3", className)}>
      <BrandIcon size={size} priority={size === "xl"} />
      <div>
        <p
          className={joinClasses(
            "font-bold tracking-tight",
            titleTone,
            titleSizeClasses[size],
            titleClassName,
          )}
        >
          BizKit AI
        </p>
        <p
          className={joinClasses(
            "leading-5",
            taglineTone,
            taglineSizeClasses[size],
            taglineClassName,
          )}
        >
          {tagline}
        </p>
      </div>
    </div>
  );
}
