import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import type { DownloadFile } from "@/data/downloads";

type DownloadFileCardProps = {
  file: DownloadFile;
  icon: ReactNode;
  locked?: boolean;
};

export function DownloadFileCard({ file, icon, locked = false }: DownloadFileCardProps) {
  return (
    <article className="group relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-5 shadow-soft transition duration-300 hover:-translate-y-1 hover:border-blue-200">
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-r from-blue-100 via-white to-slate-100 opacity-80" />
      <div className="relative flex flex-col gap-5 lg:flex-row">
        <div className="flex gap-4">
          {icon}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-lg font-semibold text-slate-950">{file.label}</p>
              {file.badges.map((badge) => (
                <span
                  key={badge}
                  className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600"
                >
                  {badge}
                </span>
              ))}
            </div>
            <p className="text-sm text-slate-500">{file.fileName}</p>
            <p className="max-w-2xl text-sm leading-6 text-slate-600">{file.description}</p>
          </div>
        </div>
        <div className="relative lg:ml-auto lg:w-48 lg:shrink-0">
          <Image
            src={file.coverHref}
            alt={`Copertina ${file.label}`}
            width={800}
            height={520}
            className="h-44 w-full rounded-[1.5rem] border border-slate-200 object-cover shadow-lg shadow-blue-900/10"
          />
        </div>
      </div>
      <div className="relative mt-5 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {file.metrics.map((metric) => (
            <span
              key={metric}
              className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700"
            >
              {metric}
            </span>
          ))}
        </div>
        <div className="flex gap-3">
          {file.previewHref ? (
            <Link href={file.previewHref} className="button-secondary">
              Anteprima
            </Link>
          ) : null}
          <span
            className={`inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold ${
              locked
                ? "border border-slate-200 bg-slate-100 text-slate-500"
                : "bg-emerald-100 text-emerald-700"
            }`}
          >
            {locked ? "Disponibile dopo il pagamento" : "Incluso nel kit"}
          </span>
        </div>
      </div>
    </article>
  );
}
