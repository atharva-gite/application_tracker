import Link from "next/link";

import { CsvImportForm } from "@/components/applications/csv-import-form";
import { APPLICATION_CSV_HEADERS } from "@/lib/application-csv";

export const metadata = { title: "Import applications" };

export default function ImportApplicationsPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <Link href="/applications" className="text-sm font-medium text-accent">
          Back to applications
        </Link>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">Import CSV</h1>
        <p className="mt-2 text-sm leading-6 text-stone-600">
          Bring a spreadsheet into Folio. Each valid row becomes an application.
          Company names match existing companies, so Google and google stay one
          company. Invalid rows are skipped and listed.
        </p>
      </div>
      <section className="card p-6 text-sm text-stone-600">
        <p className="font-medium text-stone-800">Columns</p>
        <p className="mt-2 font-mono text-xs">{APPLICATION_CSV_HEADERS.join(", ")}</p>
        <p className="mt-3">
          Company and role are required. Status can be a stage name such as Applied,
          or left blank to save the role. Dates use YYYY-MM-DD. Up to 500 rows and
          256 KB.
        </p>
      </section>
      <CsvImportForm />
    </div>
  );
}
