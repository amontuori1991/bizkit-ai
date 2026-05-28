import Link from "next/link";

type PricingBoxProps = {
  name: string;
  price: string;
  features: string[];
  cta: {
    href: string;
    label: string;
  };
  note?: string;
};

export function PricingBox({ name, price, features, cta, note }: PricingBoxProps) {
  return (
    <aside className="card-surface p-6 sm:p-8">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
        Offerta principale
      </p>
      <h2 className="mt-4 text-2xl font-bold text-slate-950">{name}</h2>
      <div className="mt-6 rounded-[2rem] bg-slate-900 p-6 text-white">
        <p className="text-sm text-slate-300">Prezzo una tantum</p>
        <p className="mt-2 text-5xl font-bold">{price}</p>
      </div>
      <div className="mt-6 space-y-3">
        {features.map((feature) => (
          <div key={feature} className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
            {feature}
          </div>
        ))}
      </div>
      <Link href={cta.href} className="button-primary mt-8 w-full">
        {cta.label}
      </Link>
      {note ? <p className="mt-4 text-sm leading-6 text-slate-500">{note}</p> : null}
    </aside>
  );
}
