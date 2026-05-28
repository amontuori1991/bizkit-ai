"use client";

type AdminThemeToggleProps = {
  theme: "light" | "dark";
  onToggle: () => void;
};

export function AdminThemeToggle({ theme, onToggle }: AdminThemeToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="inline-flex items-center justify-center rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-700"
    >
      {theme === "dark" ? "Passa a light" : "Passa a dark"}
    </button>
  );
}
