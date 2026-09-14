import Link from "next/link";

import { APP_NAME } from "@/lib/brand";

export function Logo({
  href = "/",
  size = "md",
  tone = "dark",
}: {
  href?: string;
  size?: "sm" | "md";
  tone?: "dark" | "light";
}) {
  const mark = size === "sm" ? "h-7 w-7" : "h-8 w-8";
  const word = size === "sm" ? "text-base" : "text-lg";
  const light = tone === "light";

  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2.5 ${word} font-semibold tracking-tight ${
        light ? "text-white" : "text-foreground"
      }`}
    >
      <span
        className={`grid ${mark} place-items-center rounded-lg ${
          light ? "bg-white text-accent" : "bg-accent text-white"
        }`}
        aria-hidden
      >
        <FolioMark />
      </span>
      {APP_NAME}
    </Link>
  );
}

function FolioMark() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" aria-hidden>
      <path
        d="M6 3.75h5.25L16 8.5v8.25A1.5 1.5 0 0 1 14.5 18.25h-8A1.5 1.5 0 0 1 5 16.75v-11.5A1.5 1.5 0 0 1 6.5 3.75H6Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M11.25 3.75V8h4.75"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return APP_NAME.slice(0, 1);
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}
