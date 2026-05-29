"use client";

import Link from "next/link";
import { type UsageProgress, formatUsageShort } from "@/lib/plan-limits";

type UsageMeterProps = {
  title: string;
  progress: UsageProgress;
  helper: string;
  accent?: "blue" | "emerald" | "amber";
  upgradeLabel?: string | null;
  upgradeHref?: string;
};

const accentClasses = {
  blue: {
    pill: "bg-blue-50 text-blue-700",
    bar: "from-blue-600 to-cyan-500",
    cta: "text-blue-700",
  },
  emerald: {
    pill: "bg-emerald-50 text-emerald-700",
    bar: "from-emerald-500 to-lime-500",
    cta: "text-emerald-700",
  },
  amber: {
    pill: "bg-amber-50 text-amber-700",
    bar: "from-amber-500 to-orange-500",
    cta: "text-amber-700",
  },
} as const;

export function UsageMeter({
  title,
  progress,
  helper,
  accent = "blue",
  upgradeLabel,
  upgradeHref = "/dashboard/billing",
}: UsageMeterProps) {
  const classes = accentClasses[accent];

  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-slate-600">{title}</p>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${classes.pill}`}>
          {progress.limit === null ? "Illimitato" : `${progress.percent}%`}
        </span>
      </div>
      <p className="mt-3 text-3xl font-bold text-slate-950">{formatUsageShort(progress)}</p>
      <p className="mt-2 text-sm text-slate-500">{helper}</p>
      <div className="mt-4 h-3 rounded-full bg-white">
        <div
          className={`h-3 rounded-full bg-gradient-to-r ${classes.bar}`}
          style={{ width: `${progress.limit === null ? 100 : Math.max(8, progress.percent)}%` }}
        />
      </div>
      {progress.reached && upgradeLabel ? (
        <Link href={upgradeHref} className={`mt-4 inline-flex text-sm font-semibold ${classes.cta}`}>
          Passa a {upgradeLabel}
        </Link>
      ) : null}
    </div>
  );
}
