type DashboardIconName =
  | "spark"
  | "caption"
  | "reel"
  | "promo"
  | "crm"
  | "message"
  | "history"
  | "settings"
  | "billing"
  | "check"
  | "copy"
  | "save"
  | "duplicate"
  | "refresh"
  | "play";

type DashboardIconProps = {
  name: DashboardIconName;
  className?: string;
};

export function DashboardIcon({ name, className = "h-5 w-5" }: DashboardIconProps) {
  const paths: Record<DashboardIconName, ReactNode> = {
    spark: (
      <>
        <path d="M12 3l1.9 4.6L18.5 9l-4.6 1.4L12 15l-1.9-4.6L5.5 9l4.6-1.4L12 3z" />
        <path d="M5 15l.9 2.1L8 18l-2.1.9L5 21l-.9-2.1L2 18l2.1-.9L5 15z" />
      </>
    ),
    caption: (
      <>
        <path d="M4 6h16" />
        <path d="M4 12h11" />
        <path d="M4 18h8" />
      </>
    ),
    reel: (
      <>
        <rect x="3" y="4" width="18" height="16" rx="3" />
        <path d="M8 4l3 4" />
        <path d="M13 4l3 4" />
        <path d="M9 10l6 2-6 2v-4z" fill="currentColor" stroke="none" />
      </>
    ),
    promo: (
      <>
        <path d="M4 7h16v10H4z" />
        <path d="M8 7V5h8v2" />
        <path d="M8 12h8" />
      </>
    ),
    crm: (
      <>
        <path d="M8 11a3 3 0 100-6 3 3 0 000 6z" />
        <path d="M16 13a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
        <path d="M3.5 19a4.5 4.5 0 019 0" />
        <path d="M13 19a3.5 3.5 0 017 0" />
      </>
    ),
    message: (
      <>
        <path d="M4 6h16v10H8l-4 4V6z" />
        <path d="M8 10h8" />
        <path d="M8 13h5" />
      </>
    ),
    history: (
      <>
        <path d="M4 12a8 8 0 108-8" />
        <path d="M4 4v4h4" />
        <path d="M12 8v5l3 2" />
      </>
    ),
    settings: (
      <>
        <path d="M12 8.5a3.5 3.5 0 100 7 3.5 3.5 0 000-7z" />
        <path d="M19.4 15a1 1 0 00.2 1.1l.1.1a2 2 0 01-2.8 2.8l-.1-.1a1 1 0 00-1.1-.2 1 1 0 00-.6.9V20a2 2 0 01-4 0v-.1a1 1 0 00-.7-.9 1 1 0 00-1.1.2l-.1.1a2 2 0 01-2.8-2.8l.1-.1a1 1 0 00.2-1.1 1 1 0 00-.9-.6H4a2 2 0 010-4h.1a1 1 0 00.9-.7 1 1 0 00-.2-1.1l-.1-.1a2 2 0 012.8-2.8l.1.1a1 1 0 001.1.2 1 1 0 00.6-.9V4a2 2 0 014 0v.1a1 1 0 00.7.9 1 1 0 001.1-.2l.1-.1a2 2 0 012.8 2.8l-.1.1a1 1 0 00-.2 1.1 1 1 0 00.9.6h.1a2 2 0 010 4h-.1a1 1 0 00-.9.7z" />
      </>
    ),
    billing: (
      <>
        <rect x="3" y="6" width="18" height="12" rx="2" />
        <path d="M3 10h18" />
        <path d="M7 15h4" />
      </>
    ),
    check: <path d="M5 12l4 4L19 6" />,
    copy: (
      <>
        <rect x="9" y="9" width="10" height="10" rx="2" />
        <rect x="5" y="5" width="10" height="10" rx="2" />
      </>
    ),
    save: (
      <>
        <path d="M5 4h11l3 3v13H5z" />
        <path d="M8 4v5h8V4" />
        <path d="M9 20v-6h6v6" />
      </>
    ),
    duplicate: (
      <>
        <rect x="8" y="8" width="11" height="11" rx="2" />
        <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
      </>
    ),
    refresh: (
      <>
        <path d="M20 11a8 8 0 10-2.3 5.7" />
        <path d="M20 4v7h-7" />
      </>
    ),
    play: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M10 8l6 4-6 4V8z" fill="currentColor" stroke="none" />
      </>
    ),
  };

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}
import type { ReactNode } from "react";
