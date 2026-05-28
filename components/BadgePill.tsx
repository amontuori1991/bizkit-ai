type BadgePillProps = {
  label: string;
};

export function BadgePill({ label }: BadgePillProps) {
  return (
    <span className="inline-flex items-center rounded-full border border-blue-200 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-blue-700 shadow-sm">
      {label}
    </span>
  );
}
