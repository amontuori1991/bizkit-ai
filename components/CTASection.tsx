import Link from "next/link";

type CtaLink = {
  href: string;
  label: string;
};

type CTASectionProps = {
  title: string;
  description: string;
  primaryCta: CtaLink;
  secondaryCta?: CtaLink;
};

export function CTASection({
  title,
  description,
  primaryCta,
  secondaryCta,
}: CTASectionProps) {
  return (
    <section className="section-shell">
      <div className="container-shell">
        <div className="overflow-hidden rounded-[2rem] bg-slate-900 px-6 py-10 text-white shadow-soft sm:px-10 sm:py-14">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className="space-y-4">
              <span className="eyebrow border-blue-400 bg-blue-500/20 text-blue-100">
                Call to action
              </span>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>
              <p className="max-w-2xl leading-7 text-slate-300">{description}</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
              <Link href={primaryCta.href} className="button-primary">
                {primaryCta.label}
              </Link>
              {secondaryCta ? (
                <Link
                  href={secondaryCta.href}
                  className="inline-flex items-center justify-center rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:border-blue-300 hover:text-blue-100"
                >
                  {secondaryCta.label}
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
