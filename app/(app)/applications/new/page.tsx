import { ApplicationForm } from "@/components/applications/application-form";
import { requireUser } from "@/server/authorization/require-user";
import { listCompanies } from "@/server/services/company-service";
import { listDocuments } from "@/server/services/document-service";

export const metadata = { title: "Add application" };

export default async function NewApplicationPage() {
  const user = await requireUser();
  const [{ companies }, { documents }] = await Promise.all([
    listCompanies(user.id, { page: 1, pageSize: 100 }),
    listDocuments(user.id, { page: 1, pageSize: 50, type: "RESUME" }),
  ]);

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-3xl font-semibold tracking-tight">Add application</h1>
      <p className="mt-2 text-sm leading-6 text-stone-600">
        Company, role, and stage are enough. You can add the rest later.
      </p>
      <div className="card mt-8 p-6 sm:p-8">
        <ApplicationForm companies={companies} documents={documents} />
      </div>
    </div>
  );
}
