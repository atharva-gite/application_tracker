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
];

export function NavLinks({ variant }: { variant: "side" | "mobile" }) {
  const pathname = usePathname();

  return (
    <>
      {navItems.map((item) => {
        const active =
          pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;
        if (variant === "side") {
          return (
            <Link
              key={item.href}
              href={item.href}
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
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`whitespace-nowrap rounded-full px-3 py-1.5 text-sm ${
                active
                  ? "bg-accent text-white"
                  : "bg-white text-stone-700 ring-1 ring-border"
              }`}
          >
            {item.label}
          </Link>
        );
      })}
    </>
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

function AnalyticsIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" aria-hidden>
      <path d="M4 16V9M10 16V4M16 16v-5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}
