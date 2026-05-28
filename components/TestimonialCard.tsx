type TestimonialCardProps = {
  name: string;
  role: string;
  quote: string;
};

export function TestimonialCard({ name, role, quote }: TestimonialCardProps) {
  return (
    <article className="card-surface p-6">
      <p className="text-lg leading-8 text-slate-700">&quot;{quote}&quot;</p>
      <div className="mt-6">
        <p className="font-semibold text-slate-950">{name}</p>
        <p className="text-sm text-slate-500">{role}</p>
      </div>
    </article>
  );
}
