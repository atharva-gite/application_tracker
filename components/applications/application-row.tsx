import Link from "next/link";
import { Children, type ReactNode } from "react";

import { applicationDetailPath } from "@/lib/application-list";

export function ApplicationRow({
  id,
  company,
  roleTitle,
  children,
}: {
  id: string;
  company: string;
  roleTitle: string;
  children: ReactNode;
}) {
  const href = applicationDetailPath(id);
  const label = `${company} · ${roleTitle}`;
  const cells = Children.toArray(children);

  return (
    <tr className="border-b border-border last:border-0 hover:bg-[#f7f6f2]">
      {cells.map((cell, index) => (
        <td key={index} className="p-0">
          <Link
            href={href}
            aria-label={index === 0 ? label : undefined}
            tabIndex={index === 0 ? 0 : -1}
            className="block px-4 py-3 text-inherit no-underline outline-none focus-visible:bg-[#f7f6f2]"
          >
            {cell}
          </Link>
        </td>
      ))}
    </tr>
  );
}
