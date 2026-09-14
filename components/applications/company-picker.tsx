"use client";

import { useMemo, useState } from "react";

type CompanyOption = { id: string; name: string };

export function CompanyPicker({
  companies,
  defaultCompanyId,
  error,
}: {
  companies: CompanyOption[];
  defaultCompanyId?: string;
  error?: string;
}) {
  const selected = companies.find((company) => company.id === defaultCompanyId);
  const [query, setQuery] = useState(selected?.name ?? "");
  const [companyId, setCompanyId] = useState(defaultCompanyId ?? "");

  const matches = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) {
      return companies.slice(0, 8);
    }
    return companies
      .filter((company) => company.name.toLowerCase().includes(needle))
      .slice(0, 8);
  }, [companies, query]);

  const exact = companies.find(
    (company) => company.name.toLowerCase() === query.trim().toLowerCase(),
  );
  const creating = query.trim().length > 0 && !companyId && !exact;

  return (
    <div>
      <label htmlFor="companySearch" className="mb-1 block text-sm font-medium text-stone-800">
        Company
      </label>
      <input type="hidden" name="companyId" value={companyId || exact?.id || ""} />
      {creating ? <input type="hidden" name="companyName" value={query.trim()} /> : null}
      <input
        id="companySearch"
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setCompanyId("");
        }}
        placeholder="Search or create a company"
        autoComplete="off"
        required
        className="input"
      />
      {matches.length > 0 ? (
        <ul className="mt-2 overflow-hidden rounded-xl ring-1 ring-border">
          {matches.map((company) => (
            <li key={company.id}>
              <button
                type="button"
                className={`block w-full px-3 py-2 text-left text-sm hover:bg-[var(--background)] ${
                  (companyId || exact?.id) === company.id ? "bg-[var(--accent-soft)]" : "bg-white"
                }`}
                onClick={() => {
                  setQuery(company.name);
                  setCompanyId(company.id);
                }}
              >
                {company.name}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      {creating ? (
        <p className="mt-2 text-sm text-stone-600">
          Create <span className="font-medium text-stone-900">{query.trim()}</span>
        </p>
      ) : null}
      {error ? <p className="mt-1 text-sm text-[var(--danger)]">{error}</p> : null}
    </div>
  );
}
