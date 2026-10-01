"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: DashboardIcon },
  { href: "/applications", label: "Applications", icon: ApplicationsIcon },
  { href: "/interviews", label: "Interviews", icon: InterviewsIcon },
  { href: "/companies", label: "Companies", icon: CompaniesIcon },
  { href: "/contacts", label: "Contacts", icon: ContactsIcon },
  { href: "/resumes", label: "Resumes", icon: ResumesIcon },
  { href: "/analytics", label: "Analytics", icon: AnalyticsIcon },
  { href: "/settings", label: "Settings", icon: SettingsIcon },
];

const mobilePrimaryHrefs = new Set([
  "/dashboard",
  "/applications",
  "/interviews",
  "/resumes",
]);

export function NavLinks({ variant }: { variant: "side" | "mobile" }) {
  const pathname = usePathname();
  const items =
    variant === "mobile"
      ? navItems.filter((item) => mobilePrimaryHrefs.has(item.href))
      : navItems;
  const overflow =
    variant === "mobile"
      ? navItems.filter((item) => !mobilePrimaryHrefs.has(item.href))
      : [];
  const overflowActive = overflow.some(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
  );

  const links = items.map((item) => (
    <NavItem key={item.href} item={item} pathname={pathname} variant={variant} />
  ));

  return (
    <>
      {variant === "mobile" ? (
        <div className="flex min-w-0 flex-1 gap-4 overflow-x-auto">{links}</div>
      ) : (
        links
      )}
      {overflow.length > 0 ? (
        <details className="relative">
          <summary
            className={`shrink-0 cursor-pointer list-none whitespace-nowrap border-b-2 pb-1 text-sm ${
              overflowActive
                ? "border-accent font-medium text-accent"
                : "border-transparent text-stone-600"
            }`}
          >
            More
          </summary>
          <div className="absolute right-0 z-20 mt-2 flex min-w-[10rem] flex-col gap-0.5 border border-border bg-background p-1.5">
            {overflow.map((item) => (
              <NavItem key={item.href} item={item} pathname={pathname} variant="overflow" />
            ))}
          </div>
        </details>
      ) : null}
    </>
  );
}

function NavItem({
  item,
  pathname,
  variant,
}: {
  item: (typeof navItems)[number];
  pathname: string;
  variant: "side" | "mobile" | "overflow";
}) {
  const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
  const Icon = item.icon;

  if (variant === "side") {
    return (
      <Link
        href={item.href}
        aria-current={active ? "page" : undefined}
        className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium ${
          active
            ? "bg-[var(--accent-soft)] text-accent"
            : "text-stone-600 hover:bg-[var(--background)] hover:text-stone-900"
        }`}
      >
        <Icon />
        {item.label}
      </Link>
    );
  }

  if (variant === "overflow") {
    return (
      <Link
        href={item.href}
        aria-current={active ? "page" : undefined}
        className={`rounded-lg px-3 py-2 text-sm ${
          active ? "bg-[var(--accent-soft)] font-medium text-accent" : "text-stone-700"
        }`}
      >
        {item.label}
      </Link>
    );
  }

  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={`shrink-0 whitespace-nowrap border-b-2 pb-1 text-sm ${
        active ? "border-accent font-medium text-accent" : "border-transparent text-stone-600"
      }`}
    >
      {item.label}
    </Link>
  );
}

function DashboardIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" aria-hidden>
      <rect x="3" y="3" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="11" y="3" width="6" height="4" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="11" y="9" width="6" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="3" y="11" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function ApplicationsIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" aria-hidden>
      <path
        d="M5 4.5h10A1.5 1.5 0 0 1 16.5 6v10A1.5 1.5 0 0 1 15 17.5H5A1.5 1.5 0 0 1 3.5 16V6A1.5 1.5 0 0 1 5 4.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path d="M7 8h6M7 11h6M7 14h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function InterviewsIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" aria-hidden>
      <rect x="3.5" y="4.5" width="13" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3.5 8h13M8 3.5v2M12 3.5v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function CompaniesIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" aria-hidden>
      <path
        d="M4.5 17V7.5A1.5 1.5 0 0 1 6 6h3.5v11M9.5 17V4.5A1.5 1.5 0 0 1 11 3h4.5A1.5 1.5 0 0 1 17 4.5V17M3 17h14"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ContactsIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" aria-hidden>
      <circle cx="10" cy="7" r="2.5" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M4.5 16c.8-2.6 2.8-4 5.5-4s4.7 1.4 5.5 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ResumesIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" aria-hidden>
      <path
        d="M6 3.5h5.5L16.5 9v7.5A1.5 1.5 0 0 1 15 18H6a1.5 1.5 0 0 1-1.5-1.5v-13A1.5 1.5 0 0 1 6 3.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path d="M11.5 3.5V8A1 1 0 0 0 12.5 9h4" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" aria-hidden>
      <circle cx="10" cy="10" r="2.25" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M10 3.2v1.6M10 15.2v1.6M3.2 10h1.6M15.2 10h1.6M5.1 5.1l1.1 1.1M13.8 13.8l1.1 1.1M14.9 5.1l-1.1 1.1M6.2 13.8l-1.1 1.1"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function AnalyticsIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" aria-hidden>
      <path d="M4 16V9M10 16V4M16 16v-5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}
