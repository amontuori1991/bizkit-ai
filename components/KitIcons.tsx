import type { ReactNode } from "react";

type IconProps = {
  className?: string;
};

function IconShell({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`flex h-12 w-12 items-center justify-center rounded-2xl border border-white/60 bg-white/80 text-slate-900 shadow-lg shadow-slate-900/5 backdrop-blur ${className}`}
    >
      {children}
    </div>
  );
}

export function PromptIcon({ className }: IconProps) {
  return (
    <IconShell className={className}>
      <svg viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current stroke-[1.8]">
        <path d="M7 8h10M7 12h6M7 16h8" />
        <path d="M5 5.5A1.5 1.5 0 0 1 6.5 4h11A1.5 1.5 0 0 1 19 5.5v13a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 18.5z" />
      </svg>
    </IconShell>
  );
}

export function SheetIcon({ className }: IconProps) {
  return (
    <IconShell className={className}>
      <svg viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current stroke-[1.8]">
        <path d="M8 4h6l4 4v12a1 1 0 0 1-1 1H8a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
        <path d="M14 4v4h4" />
        <path d="M9 12h6M9 16h6M9 8h2" />
      </svg>
    </IconShell>
  );
}

export function WhatsAppIcon({ className }: IconProps) {
  return (
    <IconShell className={className}>
      <svg viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current stroke-[1.8]">
        <path d="M12 21a8.5 8.5 0 1 0-4.1-1l-3.4.8.9-3.2A8.5 8.5 0 0 0 12 21z" />
        <path d="M9.7 9.3c.2-.4.4-.4.7-.4h.6c.2 0 .4.1.5.4l.5 1.2c.1.2.1.4 0 .6l-.4.6a.6.6 0 0 0 0 .7 6.4 6.4 0 0 0 2.9 2.5c.2.1.5.1.6-.1l.7-.8c.2-.2.4-.3.6-.2l1.2.5c.2.1.3.2.3.5v.5c0 .5-.2.8-.6 1-.5.2-1.2.3-1.9.1-1.1-.3-2.3-.9-3.3-1.8a8.7 8.7 0 0 1-2.4-3.5c-.2-.6-.2-1.3 0-1.8z" />
      </svg>
    </IconShell>
  );
}

export function GuideIcon({ className }: IconProps) {
  return (
    <IconShell className={className}>
      <svg viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current stroke-[1.8]">
        <path d="M6 5.5A2.5 2.5 0 0 1 8.5 3H19v15.5A2.5 2.5 0 0 0 16.5 16H6z" />
        <path d="M6 5.5V19a2 2 0 0 0 2 2h10" />
        <path d="M9 8h6M9 11h6" />
      </svg>
    </IconShell>
  );
}

export function OfferIcon({ className }: IconProps) {
  return (
    <IconShell className={className}>
      <svg viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current stroke-[1.8]">
        <path d="m10.5 4.5 9 9-6 6-9-9V4.5z" />
        <path d="M7.5 7.5h.01" />
        <path d="m12 9 3 3M10 11l3 3" />
      </svg>
    </IconShell>
  );
}
