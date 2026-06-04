import Image from "next/image";

type BrandSize = "sm" | "md" | "lg" | "xl";
type BrandTone = "light" | "dark";

type BrandWordmarkProps = {
  size?: BrandSize;
  className?: string;
  priority?: boolean;
};

type BrandLockupProps = {
  size?: BrandSize;
  tone?: BrandTone;
  className?: string;
  taglineClassName?: string;
  tagline?: string;
  centered?: boolean;
};

const wordmarkWidth: Record<BrandSize, number> = {
  sm: 112,
  md: 136,
  lg: 164,
  xl: 188,
};

const wordmarkHeight: Record<BrandSize, number> = {
  sm: 42,
  md: 50,
  lg: 60,
  xl: 68,
};

const taglineSizeClasses: Record<BrandSize, string> = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-sm",
  xl: "text-base",
};

function joinClasses(...classes: Array<string | undefined | null | false>) {
  return classes.filter(Boolean).join(" ");
}

export function BrandWordmark({
  size = "md",
  className,
  priority = false,
}: BrandWordmarkProps) {
  return (
    <Image
      src="/favicon/android-chrome-512x512.png"
      alt="BizKit AI"
      width={wordmarkWidth[size]}
      height={wordmarkHeight[size]}
      priority={priority}
      sizes={`${wordmarkWidth[size]}px`}
      className={joinClasses("h-auto w-auto max-w-full object-contain", className)}
    />
  );
}

export function BrandLockup({
  size = "md",
  tone = "dark",
  className,
  taglineClassName,
  tagline = "AI Marketing Platform for Local Businesses",
  centered = false,
}: BrandLockupProps) {
  const taglineTone = tone === "light" ? "text-slate-300" : "text-slate-500";

  return (
    <div
      className={joinClasses(
        "flex flex-col gap-2",
        centered ? "items-center text-center" : "items-start",
        className,
      )}
    >
      <BrandWordmark size={size} priority={size === "xl"} />
      <p
        className={joinClasses(
          "max-w-[20rem] leading-5",
          taglineTone,
          taglineSizeClasses[size],
          taglineClassName,
        )}
      >
        {tagline}
      </p>
    </div>
  );
}
