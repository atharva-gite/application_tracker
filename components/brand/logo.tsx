import Link from "next/link";

export function Logo({
  href = "/",
  size = "md",
}: {
  href?: string;
  size?: "sm" | "md";
}) {
  const mark = size === "sm" ? "h-7 w-7 text-xs" : "h-8 w-8 text-sm";
  const word = size === "sm" ? "text-base" : "text-lg";

  return (
    <Link href={href} className={`inline-flex items-center gap-2 ${word} font-semibold tracking-tight`}>
      <span
        className={`grid ${mark} place-items-center rounded-lg bg-accent font-semibold text-white`}
        aria-hidden
      >
        P
      </span>
      Pipeline
    </Link>
  );
}

export function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return "P";
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}
