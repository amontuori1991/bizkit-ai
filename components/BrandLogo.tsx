import Image from "next/image";

type BrandSize = "sm" | "md" | "lg" | "xl";
type BrandTone = "light" | "dark";

type BrandLockupProps = {
  size?: BrandSize;
  tone?: BrandTone;
  className?: string;
  imageClassName?: string;
  taglineClassName?: string;
  tagline?: string | null;
  centered?: boolean;
};

const widthBySize: Record<BrandSize, number> = {
  sm: 88,
  md: 104,
  lg: 124,
  xl: 156,
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

export function BrandLockup({
  size = "md",
  tone = "dark",
  className,
  imageClassName,
  taglineClassName,
  tagline = "AI Marketing Platform for Local Businesses",
  centered = false,
}: BrandLockupProps) {
  const taglineTone = tone === "light" ? "text-slate-300" : "text-slate-500";
  const width = widthBySize[size];

  return (
    <div
      className={joinClasses(
        "flex flex-col gap-2",
        centered ? "items-center text-center" : "items-start",
        className,
      )}
    >
      <Image
        src="/favicon/android-chrome-512x512.png"
        alt="BizKit AI"
        width={width}
        height={width}
        priority={size === "xl"}
        sizes={`${width}px`}
        className={joinClasses("h-auto w-auto max-w-full object-contain", imageClassName)}
      />
      {tagline ? (
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
      ) : null}
    </div>
  );
}
