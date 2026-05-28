import Link from "next/link";

type DownloadBoxProps = {
  title: string;
  description: string;
  href: string;
};

export function DownloadBox({ title, description, href }: DownloadBoxProps) {
  return (
    <div className="mx-auto max-w-xl rounded-[2rem] border border-blue-200 bg-blue-50 p-6 text-left">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-700">
        Download
      </p>
      <h2 className="mt-3 text-2xl font-bold text-slate-950">{title}</h2>
      <p className="mt-3 leading-7 text-slate-600">{description}</p>
      <Link href={href} className="button-primary mt-6">
        Scarica il tuo kit
      </Link>
    </div>
  );
}
